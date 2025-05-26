const Testimonial = require('../models/testimonial');
const { sendTestimonialSubmissionEmail, sendAdminTestimonialNotification } = require('../config/sendEmail');

exports.submitTestimonial = async (req, res) => {
  try {
    const { name, email, profession, rating, testimonial } = req.body;

    // Create new testimonial
    const newTestimonial = new Testimonial({
      name,
      email,
      profession,
      rating,
      testimonial
    });

    await newTestimonial.save();

    // Send confirmation email to user
    await sendTestimonialSubmissionEmail(email, name);

    // Send notification to admin
    await sendAdminTestimonialNotification({
      name,
      email,
      profession,
      rating,
      testimonial
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your testimonial! We will review it shortly.',
      data: newTestimonial
    });

  } catch (error) {
    console.error('Testimonial submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit testimonial',
      error: error.message
    });
  }
};

exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ status: 'approved' })
      .sort({ rating: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials',
      error: error.message
    });
  }
};