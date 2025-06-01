const express = require('express');
const router = express.Router();
const viewCountController = require('../controllers/viewCountController');

// Track index page view
router.post('/', viewCountController.trackIndexView);

// Get index page statistics
router.get('/index-stats', viewCountController.getIndexStats);

module.exports = router;