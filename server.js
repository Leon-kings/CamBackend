const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const orderRoutes = require('./routes/orderRoutes');
const messageRoutes = require('./routes/messageRoutes');
const viewCountRoutes = require('./routes/viewCountRoutes');
// Add to your existing app.js
// const searchRoutes = require('./routes/searchRoutes');


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());

// Improved MongoDB connection with timeout settings
mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Fail fast if no primary server is available
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  connectTimeoutMS: 10000, // Initial connection timeout
})
.then(() => console.log("✅ Database connected successfully"))
.catch((err) => {
  console.log("❌ Database connection error:", err.message);
  process.exit(1); // Exit if DB connection fails
});

// Connection events for better debugging
mongoose.connection.on('connecting', () => console.log('🔄 Connecting to MongoDB...'));
mongoose.connection.on('connected', () => console.log('✅ MongoDB connected!'));
mongoose.connection.on('error', (err) => console.error('❌ MongoDB connection error:', err));
mongoose.connection.on('disconnected', () => console.warn('⚠️ MongoDB disconnected'));

// Routes
app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "Welcome to my API" });
});

// Mount routes
app.use("/users", authRoutes);
app.use("/messages/890", contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/contact/messaging', messageRoutes);
app.use('/api', orderRoutes);
app.use('/view/count', viewCountRoutes);
// After other middleware
// app.use('/api/search', searchRoutes);

// Error handling middleware (should be after all routes)
app.use((err, req, res, next) => {
  console.log('🔥 Server error:', err.stack);
  res.status(500).json({ 
    status: "error", 
    message: "Internal server error" 
  });
});

// Start server
const server = app.listen(PORT, () => 
  console.log(`🚀 Server running on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('💥 Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

// Export for testing
module.exports = app;