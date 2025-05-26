require('dotenv').config();

module.exports = {
  mongoURI: process.env.DB || 'mongodb://localhost:27017/newsletter_db',
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER || 'leonakingeneye2002@gmail.com',
    password: process.env.EMAIL_PASS || 'kzjv qlpr rqbg udqw'
  },
  adminEmail: process.env.ADMIN_EMAIL || 'leonakingeneye2@gmail.com',
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development'
};