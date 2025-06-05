const Item = require('../models/itemModel');
const Project = require('../models/projectModel');
const { NotFoundError, BadRequestError } = require('../utils/errors');

// Full-text search across all models
exports.globalSearch = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 3) {
      throw new BadRequestError('Search query must be at least 3 characters long');
    }

    // Search items
    const items = await Item.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).limit(10);

    // Search projects
    const projects = await Project.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).limit(10);

    res.status(200).json({
      status: 'success',
      data: {
        items,
        projects
      }
    });
  } catch (err) {
    next(err);
  }
};

// Advanced search with filters
exports.advancedSearch = async (req, res, next) => {
  try {
    const { q, type, status, fromDate, toDate } = req.query;
    const searchQuery = {};

    // Text search
    if (q && q.length >= 3) {
      searchQuery.$text = { $search: q };
    }

    // Type filter (item or project)
    let Model;
    if (type === 'project') {
      Model = Project;
    } else {
      Model = Item; // default to item search
    }

    // Status filter
    if (status) {
      searchQuery.status = status;
    }

    // Date range filter
    if (fromDate || toDate) {
      searchQuery.createdAt = {};
      if (fromDate) searchQuery.createdAt.$gte = new Date(fromDate);
      if (toDate) searchQuery.createdAt.$lte = new Date(toDate);
    }

    const results = await Model.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      status: 'success',
      results: results.length,
      data: results
    });
  } catch (err) {
    next(err);
  }
};

// Get search statistics
exports.getSearchStats = async (req, res, next) => {
  try {
    const [itemStats, projectStats] = await Promise.all([
      Item.aggregate([
        { $group: { _id: null, count: { $sum: 1 } } }
      ]),
      Project.aggregate([
        { $group: { _id: null, count: { $sum: 1 } } }
      ])
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalItems: itemStats[0]?.count || 0,
        totalProjects: projectStats[0]?.count || 0
      }
    });
  } catch (err) {
    next(err);
  }
};