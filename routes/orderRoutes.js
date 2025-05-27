const express = require('express');
const orderController = require('../controllers/orderController');
const router = express.Router();

// Order routes
router.post('/', orderController.createOrder);
router.get('/orders/stats', orderController.getOrderStatistics);
router.get('/orders', orderController.getAllOrders);

module.exports = router;