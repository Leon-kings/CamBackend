const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');


// Basic search
router.get('/', searchController.basicSearch);

// Advanced search
router.get('/advanced', searchController.advancedSearch);

// Search suggestions (autocomplete)
router.get('/suggestions', searchController.getSearchSuggestions);

// Search analytics (protected route)
router.get('/analytics', searchController.getSearchAnalytics);

module.exports = router;