const ViewCount = require('../models/viewcount');
const moment = require('moment');

// Helper to update stats
const updateStats = async (countType, dateFormat) => {
  const dateKey = moment().startOf(countType).toDate();
  
  await ViewCount.findOneAndUpdate(
    { 
      pageId: 'index',
      [`${countType}Stats.date`]: dateKey
    },
    { 
      $inc: { 
        [`${countType}Stats.$.count`]: 1,
        totalCount: 1
      },
      $set: { lastUpdated: new Date() }
    }
  );

  await ViewCount.findOneAndUpdate(
    { 
      pageId: 'index',
      [`${countType}Stats.date`]: { $ne: dateKey }
    },
    { 
      $push: { 
        [`${countType}Stats`]: { 
          date: dateKey,
          count: 1 
        } 
      },
      $inc: { totalCount: 1 },
      $set: { lastUpdated: new Date() }
    },
    { upsert: true }
  );
};

// Track index page view
exports.trackIndexView = async (req, res) => {
  try {
    // Update all statistics
    await Promise.all([
      updateStats('daily', 'YYYY-MM-DD'),
      updateStats('weekly', 'YYYY-[W]WW'),
      updateStats('monthly', 'YYYY-MM'),
      updateStats('yearly', 'YYYY')
    ]);
    
    const result = await ViewCount.findOne({ pageId: 'index' });
    
    res.status(200).json({
      success: true,
      totalViews: result ? result.totalCount : 0
    });
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track view',
      error: error.message
    });
  }
};

// Get statistics
exports.getIndexStats = async (req, res) => {
  try {
    const { period = 'daily', limit = 30 } = req.query;
    
    const validPeriods = ['daily', 'weekly', 'monthly', 'yearly'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid period. Must be one of: daily, weekly, monthly, yearly'
      });
    }
    
    const viewCount = await ViewCount.findOne({ pageId: 'index' });
    
    if (!viewCount) {
      return res.status(200).json({
        success: true,
        period,
        totalViews: 0,
        stats: []
      });
    }
    
    // Sort and limit stats
    const stats = viewCount[`${period}Stats`]
      .sort((a, b) => b.date - a.date)
      .slice(0, parseInt(limit))
      .map(stat => ({
        date: stat.date,
        count: stat.count,
        formattedDate: formatDate(stat.date, period)
      }));
    
    res.status(200).json({
      success: true,
      period,
      totalViews: viewCount.totalCount,
      stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Format date for display
function formatDate(date, period) {
  const m = moment(date);
  switch (period) {
    case 'daily': return m.format('MMM D, YYYY');
    case 'weekly': return `Week ${m.format('W, YYYY')}`;
    case 'monthly': return m.format('MMM YYYY');
    case 'yearly': return m.format('YYYY');
    default: return m.format('MMM D, YYYY');
  }
}