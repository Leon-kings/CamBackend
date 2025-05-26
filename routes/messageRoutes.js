const express = require('express');
const messageController = require('../controllers/messageController');

const router = express.Router();

// Public route - anyone can submit a message
router.post('/', messageController.submitMessage);

// Protected admin route
router.get('/', messageController.getAllMessages);

module.exports = router;