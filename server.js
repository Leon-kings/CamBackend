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

dotenv.config();
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cors());

// Database connection
mongoose
  .connect(process.env.DB)
  .then(() => console.log("Database connected"))
  .catch((err) => console.log(err));

// Routes
app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "Welcome to my API" });
});

app.use("/user", authRoutes);
app.use("/contact", contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api', orderRoutes);
//

//
app.listen(PORT, () => console.log(`App started on port ${PORT}`));

// Exporting the app for testing or other purposes
module.exports = app;
