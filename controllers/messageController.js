const Message = require('../models/message');
const { sendUserConfirmation, sendAdminNotification } = require('../config/sendEmail');

exports.submitMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Create new message (no email check)
    const newMessage = await Message.create({
      name,
      email,
      subject,
      message,
      status: 'pending'
    });

    // Send confirmation to user
    await sendUserConfirmation(email, name, subject);

    // Send notification to admin
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

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
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