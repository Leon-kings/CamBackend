const jwt = require('jsonwebtoken');
const User = require('../models/users');

// Authentication middleware
exports.authenticate = async (req, res, next) => {
  try {
    // 1. Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Find user
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // 4. Check account status
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: `Account is ${user.status}`
      });
    }

    // 5. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

// Admin middleware
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.status === 'admin') {
    return next();
  }
  res.status(403).json({
    success: false,
    error: 'Admin access required'
  });
};