const Newsletter = require('../models/newsletter');
const { 
  sendUserSubscriptionEmail, 
  sendAdminNotificationEmail 
} = require('../config/sendEmail');

// Create - Subscribe a new email
exports.subscribe = async (req, res) => {
  try {
    const { email, source = 'website' } = req.body;

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ 
        success: false, 
        message: 'This email is already subscribed to our newsletter.' 
      });
    }

    // Create new subscriber
    const subscriber = new Newsletter({ email, source });
    await subscriber.save();

    // Send emails
    await sendUserSubscriptionEmail(email);
    await sendAdminNotificationEmail(email, source);

    res.status(201).json({ 
      success: true, 
      message: 'Thank you for subscribing to our newsletter!', 
      data: subscriber 
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while processing your subscription.',
      error: error.message 
    });
  }
};
/**
 * Get subscription statistics
 * @returns {Object} Subscription stats
 */
const getSubscriptionStats = async () => {
  const totalSubscribers = await Newsletter.countDocuments();
  const activeSubscribers = await Newsletter.countDocuments({ isActive: true });
  const recentSubscribers = await Newsletter.countDocuments({ 
    subscribedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
  });
  
  const sources = await Newsletter.aggregate([
    { $group: { _id: '$source', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  return {
    totalSubscribers,
    activeSubscribers,
    inactiveSubscribers: totalSubscribers - activeSubscribers,
    recentSubscribers,
    sources
  };
};

/**
 * Generate and send subscription report to admin
 */
exports.sendSubscriptionReport = async (req, res) => {
  try {
    const stats = await getSubscriptionStats();
    const subscribers = await Newsletter.find()
      .sort({ subscribedAt: -1 })
      .limit(10); // Get 10 most recent

    await sendAdminStatsReportEmail(stats, subscribers);

    res.status(200).json({
      success: true,
      message: 'Subscription report sent to admin',
      data: stats
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate subscription report',
      error: error.message
    });
  }
};

/**
 * Get subscription statistics (for admin dashboard)
 */
exports.getSubscriptionStatistics = async (req, res) => {
  try {
    const stats = await getSubscriptionStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Stats retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription statistics',
      error: error.message
    });
  }
};

// Additional helper function for time-based stats
exports.getSubscriptionTrends = async (req, res) => {
  try {
    const { period = '30d' } = req.query; // Default to 30 days
    
    let days;
    if (period === '7d') days = 7;
    else if (period === '30d') days = 30;
    else if (period === '90d') days = 90;
    else days = parseInt(period) || 30;

    const trends = await Newsletter.aggregate([
      {
        $match: {
          subscribedAt: {
            $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$subscribedAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period: `${days} days`,
        trends
      }
    });
  } catch (error) {
    console.error('Trends retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription trends',
      error: error.message
    });
  }
};


// Read All - Get all active subscribers
exports.getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ isActive: true }).sort({ subscribedAt: -1 });
    res.status(200).json({ 
      success: true, 
      count: subscribers.length, 
      data: subscribers 
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch subscribers.',
      error: error.message 
    });
  }
};

// Read One - Get subscriber by ID
exports.getSubscriberById = async (req, res) => {
  try {
    const subscriber = await Newsletter.findById(req.params.id);
    
    if (!subscriber) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscriber not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: subscriber 
    });
  } catch (error) {
    console.error('Error fetching subscriber:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch subscriber.',
      error: error.message 
    });
  }
};

// Update - Update subscriber information
exports.updateSubscriber = async (req, res) => {
  try {
    const { email, source, isActive } = req.body;
    const subscriber = await Newsletter.findByIdAndUpdate(
      req.params.id,
      { email, source, isActive },
      { new: true, runValidators: true }
    );

    if (!subscriber) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscriber not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Subscriber updated successfully',
      data: subscriber 
    });
  } catch (error) {
    console.error('Error updating subscriber:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update subscriber.',
      error: error.message 
    });
  }
};

// Delete - Unsubscribe/delete a subscriber
exports.deleteSubscriber = async (req, res) => {
  try {
    const subscriber = await Newsletter.findByIdAndDelete(req.params.id);

    if (!subscriber) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscriber not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Subscriber deleted successfully',
      data: subscriber 
    });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete subscriber.',
      error: error.message 
    });
  }
};