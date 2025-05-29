const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  profession: {
    type: String,
    required: [true, "Profession is required"],
    trim: true,
  },
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: [0.5, "Rating must be at least 0.5"],
    max: [5, "Rating cannot exceed 5"],
    default: 5,
  },
  testimonial: {
    type: String,
    required: [true, "Testimonial text is required"],
    trim: true,
    minlength: [20, "Testimonial must be at least 20 characters long"],
  },
  image: {
    public_id: String,
    url: String,
    format: String,
    width: Number,
    height: Number,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
testimonialSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Testimonial", testimonialSchema);
