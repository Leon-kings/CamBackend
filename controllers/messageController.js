const Message = require('../models/message');
const { sendUserConfirmation, sendAdminNotification, sendMonthlyReport } = require('../config/sendEmail');
const cron = require('node-cron');

// Schedule monthly report (runs on the 1st of every month at 9:00 AM)
cron.schedule('0 9 1 * *', async () => {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    const messages = await Message.find({
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });

    const stats = {
      total: messages.length,
      pending: messages.filter(m => m.status === 'pending').length,
      resolved: messages.filter(m => m.status === 'resolved').length,
      rejected: messages.filter(m => m.status === 'rejected').length
    };

    await sendMonthlyReport(stats, messages);
    console.log('Monthly message report sent successfully');
  } catch (error) {
    console.error('Error sending monthly report:', error);
  }
});

// Submit new message
exports.submitMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const newMessage = await Message.create({
      name,
      email,
      subject,
      message,
      status: 'pending'
    });

    await sendUserConfirmation(email, name, subject);
    await sendAdminNotification(newMessage);

    res.status(201).json({
      success: true,
      data: newMessage,
      message: 'Message submitted successfully. A confirmation has been sent to your email.'
    });
  } catch (error) {
    console.error('Error submitting message:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting message',
      error: error.message
    });
  }
};

// Get all messages
exports.getAllMessages = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const messages = await Message.find(filter).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

// Get single message by ID
exports.getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching message',
      error: error.message
    });
  }
};

// Update message
exports.updateMessage = async (req, res) => {
  try {
    const { status, response } = req.body;
    
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      { status, response, resolvedAt: status === 'resolved' ? new Date() : null },
      { new: true, runValidators: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedMessage,
      message: 'Message updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating message',
      error: error.message
    });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {},
      message: 'Message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
};

// Generate and send report immediately (for testing or manual triggering)
exports.generateReport = async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    const messages = await Message.find({
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });

    const stats = {
      total: messages.length,
      pending: messages.filter(m => m.status === 'pending').length,
      resolved: messages.filter(m => m.status === 'resolved').length,
      rejected: messages.filter(m => m.status === 'rejected').length
    };

    await sendMonthlyReport(stats, messages);
    
    res.status(200).json({
      success: true,
      message: 'Report generated and sent successfully',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message
    });
  }
};