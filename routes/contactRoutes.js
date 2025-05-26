const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
// const { admin } = require('../middlewares/auth');

// Public route
router.post('/', contactController.submitContactForm);

// Admin protected routes
router.get('/', contactController.getAllContacts);
router.get('/stats', contactController.getContactStats);
router.get('/:id', contactController.getContactById);
router.put('/:id', contactController.updateContact);
router.delete('/:id', contactController.deleteContact);

module.exports = router;