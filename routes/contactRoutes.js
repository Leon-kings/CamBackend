const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { protect, admin } = require('../middleware/auth');

// Public route
router.post('/', contactController.submitContactForm);

// Admin protected routes
router.get('/', protect, admin, contactController.getAllContacts);
router.get('/stats', protect, admin, contactController.getContactStats);
router.get('/:id', protect, admin, contactController.getContactById);
router.put('/:id', protect, admin, contactController.updateContact);
router.delete('/:id', protect, admin, contactController.deleteContact);

module.exports = router;