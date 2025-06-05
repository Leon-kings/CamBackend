const Product = require('../models/product');
const SearchLog = require('../models/SearchLog');
const mongoose = require('mongoose');

exports.basicSearch = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search term is required' });
    }
    
    // Basic search
    const { results, total } = await Product.search(q, {}, { limit: 20 });
    
    // Get statistics
    const stats = await Product.getSearchStats(q);
    const searchFrequency = await SearchLog.getSearchFrequency(q);
    
    // Log the search
    await SearchLog.logSearch(
      q,
      req.user?._id,
      req.ip,
      {},
      total
    );
    
    res.json({
      results,
      statistics: {
        ...stats,
        searchFrequency
      }
    });
    
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.advancedSearch = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, page = 1, limit = 15 } = req.query;
    
    const filters = {};
    if (category && mongoose.isValidObjectId(category)) filters.category = category;
    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;
    
    const searchTerm = q || '';
    
    // Perform search
    const { results, total, totalPages } = await Product.search(
      searchTerm,
      filters,
      { page, limit }
    );
    
    // Get statistics if there's a search term
    let stats = null;
    if (searchTerm) {
      const productStats = await Product.getSearchStats(searchTerm);
      const searchFrequency = await SearchLog.getSearchFrequency(searchTerm);
      
      stats = {
        ...productStats,
        searchFrequency
      };
      
      // Log the search
      await SearchLog.logSearch(
        searchTerm,
        req.user?._id,
        req.ip,
        filters,
        total
      );
    }
    
    res.json({
      results,
      total,
      page: parseInt(page),
      totalPages,
      filters,
      statistics: stats
    });
    
  } catch (err) {
    console.error('Advanced search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }
    
    const suggestions = await Product.aggregate([
      {
        $match: {
          $or: [
            { name: new RegExp(q, 'i') },
            { sku: new RegExp(q, 'i') }
          ]
        }
      },
      { $limit: parseInt(limit) },
      { $project: { name: 1, sku: 1, _id: 1 } }
    ]);
    
    res.json({ suggestions });
  } catch (err) {
    console.error('Suggestions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getSearchAnalytics = async (req, res) => {
  try {
    // Most popular searches
    const popularSearches = await SearchLog.aggregate([
      {
        $group: {
          _id: '$term',
          count: { $sum: 1 },
          lastSearched: { $max: '$createdAt' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Search trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const searchTrends = await SearchLog.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      popularSearches,
      searchTrends
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};