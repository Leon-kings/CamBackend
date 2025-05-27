const Order = require('../models/order');
const { 
  sendOrderConfirmation, 
  sendAdminNotification 
} = require('../config/sendEmail');

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();

    // Send emails (fire and forget)
    sendOrderConfirmation(order).catch(console.error);
    sendAdminNotification(order).catch(console.error);

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// Get order statistics for admin
exports.getOrderStatistics = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$orderDetails.planId',
          planName: { $first: '$orderDetails.planName' },
          count: { $sum: 1 },
          totalRevenue: { $sum: '$payment.amount' },
          avgCameras: { $avg: '$orderDetails.cameraCount' }
        }
      },
      {
        $project: {
          _id: 0,
          planId: '$_id',
          planName: 1,
          count: 1,
          totalRevenue: 1,
          avgCameras: { $round: ['$avgCameras', 1] }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = stats.reduce((sum, stat) => sum + stat.totalRevenue, 0);

    res.status(200).json({
      success: true,
      data: {
        stats,
        totalOrders,
        totalRevenue
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get all orders (for admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};