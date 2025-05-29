const Testimonial = require("../models/testimonial");
const {
  sendTestimonialSubmissionEmail,
  sendAdminTestimonialNotification,
  sendMonthlyStatsReportEmail,
} = require("../config/sendEmail");

// CREATE - Submit new testimonial
exports.submitTestimonial = async (req, res) => {
  try {
    const { name, email, profession, rating, testimonial } = req.body;

    // 1. Check for existing testimonial from this email
    const existingTestimonial = await Testimonial.findOne({ email });

    if (existingTestimonial) {
      // 2. If exists, revoke/update the existing testimonial
      existingTestimonial.name = name;
      existingTestimonial.profession = profession;
      existingTestimonial.rating = rating;
      existingTestimonial.testimonial = testimonial;
      existingTestimonial.status = "pending"; // Reset status to pending
      existingTestimonial.updatedAt = new Date();

      await existingTestimonial.save();

      // 3. Send emails
      await sendTestimonialSubmissionEmail(email, name);
      await sendMonthlyStatsReportEmail({
        totalSubmissions,
        averageRating,
      });

      await sendAdminTestimonialNotification({
        name,
        email,
        profession,
        rating,
        testimonial,
        testimonialId: existingTestimonial._id,
      });

      return res.status(200).json({
        success: true,
        message: "Existing testimonial updated and submitted for review",
        data: existingTestimonial,
      });
    }

    // 4. If no existing testimonial, create a new one
    const newTestimonial = new Testimonial({
      name,
      email,
      profession,
      rating,
      testimonial,
      status: "pending", // Default status
    });

    await newTestimonial.save();

    // 5. Send emails
    await sendTestimonialSubmissionEmail(email, name);
    await sendAdminTestimonialNotification({
      name,
      email,
      profession,
      rating,
      testimonial,
      testimonialId: newTestimonial._id,
    });

    res.status(201).json({
      success: true,
      message: "New testimonial submitted for review",
      data: newTestimonial,
    });
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit testimonial",
      error: error.message,
    });
  }
};

// READ - Get all testimonials (with filters)
exports.getAllTestimonials = async (req, res) => {
  try {
    const { status, minRating, limit } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (minRating) filter.rating = { $gte: Number(minRating) };

    const testimonials = await Testimonial.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit) || 0);

    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch testimonials",
      error: error.message,
    });
  }
};

// READ - Get single testimonial by ID
exports.getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.status(200).json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch testimonial",
      error: error.message,
    });
  }
};

// UPDATE - Approve/Reject/Update testimonial
exports.updateTestimonial = async (req, res) => {
  try {
    const { status, adminComments } = req.body;
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    // Status transition logic
    if (status && testimonial.status !== status) {
      testimonial.status = status;
      testimonial.adminComments = adminComments;

      // Send appropriate email based on status change
      if (status === "approved") {
        await sendTestimonialApprovalEmail(
          testimonial.email,
          testimonial.name,
          adminComments
        );
      } else if (status === "rejected") {
        await sendTestimonialRejectionEmail(
          testimonial.email,
          testimonial.name,
          adminComments
        );
      }
    }

    // Update other fields if provided
    const updatableFields = ["name", "profession", "rating", "testimonial"];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        testimonial[field] = req.body[field];
      }
    });

    await testimonial.save();

    res.status(200).json({
      success: true,
      message: `Testimonial ${
        status ? status + " and " : ""
      }updated successfully`,
      data: testimonial,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update testimonial",
      error: error.message,
    });
  }
};

// DELETE - Remove testimonial
exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
      data: testimonial,
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete testimonial",
      error: error.message,
    });
  }
};

// STATISTICS - Generate monthly report
exports.generateMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    const startDate = new Date(year, month ? month - 1 : 0, 1);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // Get statistics
    const stats = await Testimonial.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          approvedCount: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          pendingCount: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
          topProfessions: { $push: "$profession" },
        },
      },
    ]);

    // Get recent testimonials
    const recentTestimonials = await Testimonial.find({
      createdAt: { $gte: startDate, $lt: endDate },
      status: "approved",
    })
      .sort({ rating: -1 })
      .limit(5);

    // Format data for email
    const reportData = {
      period: startDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      }),
      total: stats[0]?.total || 0,
      averageRating: stats[0]
        ? Math.round(stats[0].averageRating * 10) / 10
        : 0,
      statusBreakdown: {
        approved: stats[0]?.approvedCount || 0,
        pending: stats[0]?.pendingCount || 0,
        rejected: stats[0]?.rejectedCount || 0,
      },
      topTestimonials: recentTestimonials,
    };

    // Send email report
    await sendMonthlyStatsReportEmail(reportData);

    res.status(200).json({
      success: true,
      message: "Monthly report generated and sent",
      data: reportData,
    });
  } catch (error) {
    console.error("Report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate report",
      error: error.message,
    });
  }
};
