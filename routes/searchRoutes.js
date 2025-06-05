const express = require('express');
const searchController = require('../controllers/searchController');
const errorHandler = require('../middlewares/errorHandler');

const router = express.Router();

// Search endpoints
router.get('/', errorHandler(searchController.globalSearch));
router.get('/advanced', errorHandler(searchController.advancedSearch));
router.get('/stats', errorHandler(searchController.getSearchStats));

module.exports = router;