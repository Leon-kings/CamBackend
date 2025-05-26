const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');


// Public routes
router.post('/', testimonialController.submitTestimonial);
router.get('/', testimonialController.getAllTestimonials);
router.put('/:id',testimonialController.updateTestimonial);
router.get('/:id', testimonialController.getTestimonialById);
router.delete('/:id',testimonialController.deleteTestimonial);

// Admin routes (protected)
// router.use(authenticate, authorize('admin'));
// router.get('/admin', testimonialController.getAllTestimonialsForAdmin);
// router.patch('/:id/status', testimonialController.updateTestimonialStatus);

module.exports = router;