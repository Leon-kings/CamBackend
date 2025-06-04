// routes/testimonialRoutes.js
const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');
const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('image'), testimonialController.submitTestimonial);
router.get('/', testimonialController.getAllTestimonials);
router.put('/:id',testimonialController.updateTestimonial);
router.get('/:id', testimonialController.getTestimonialById);
router.delete('/:id',testimonialController.deleteTestimonial);
router.put('/status/:id', testimonialController.updateTestimonialStatus);

module.exports = router;