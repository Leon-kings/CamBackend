// const User = require("../models/users");
// const jwt = require("jsonwebtoken");
// const {
//   sendVerificationEmail,
//   sendPasswordResetEmail,
// } = require("../config/sendEmail");

// // Helper function to generate user response
// const getUserResponse = (user) => ({
//   id: user._id,
//   name: user.name,
//   email: user.email,
//   phone: user.phone,
//   status: user.status,
//   verified: user.verified,
// });

// /**
//  * Register a new user
//  */
// const register = async (req, res) => {
//   try {
//     const { name, email, phone, password } = req.body;

//     // Validate input
//     if (!name || !email || !phone || !password) {
//       return res.status(400).json({
//         success: false,
//         error: "All fields are required",
//       });
//     }

//     // Check for existing user
//     const existingUser = await User.findOne({
//       $or: [{ email }, { phone }],
//     });

//     if (existingUser) {
//       const field = existingUser.email === email ? "Email" : "Phone number";
//       return res.status(400).json({
//         success: false,
//         error: `${field} already exists`,
//       });
//     }

//     // Create user
//     const user = await User.create({
//       name,
//       email,
//       phone,
//       password,
//       status: "user",
//       verified: false,
//     });

//     // Generate tokens
//     const verificationToken = jwt.sign(
//       { id: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     const authToken = jwt.sign(
//       { id: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     // Send verification email
//     try {
//       await sendVerificationEmail(email, verificationToken);
//       return res.status(201).json({
//         success: true,
//         token: authToken,
//         message: "Registration successful! Please check your email to verify your account.",
//         user: getUserResponse(user),
//       });
//     } catch (emailError) {
//       console.error("Email sending error:", emailError);
//       return res.status(201).json({
//         success: true,
//         token: authToken,
//         message: "Registration complete! Please request a verification email later.",
//         user: getUserResponse(user),
//       });
//     }
//   } catch (error) {
//     console.error("Registration error:", error);
//     res.status(500).json({
//       success: false,
//       error: "Registration failed. Please try again.",
//     });
//   }
// };

// /**
//  * Get user profile
//  */
// const getProfile = async (req, res) => {
//   try {
//     // User is already attached to request by auth middleware
//     res.json({
//       success: true,
//       user: getUserResponse(req.user)
//     });
//   } catch (error) {
//     console.error('Profile error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch profile'
//     });
//   }
// };

// /**
//  * Login user
//  */
// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         error: "Email and password are required",
//       });
//     }

//     const user = await User.findOne({ email }).select("+password");
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         error: "Invalid credentials",
//       });
//     }

//     // Check account status
//     if (user.status !== "active") {
//       return res.status(403).json({
//         success: false,
//         error: `Account is ${user.status}. Please contact support.`,
//       });
//     }

//     // Verify password
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         error: "Invalid credentials",
//       });
//     }

//     // Generate token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });

//     res.json({
//       success: true,
//       token,
//       message: "Login successful",
//       user: getUserResponse(user),
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({
//       success: false,
//       error: "Login failed. Please try again.",
//     });
//   }
// };

// /**
//  * Verify email with token
//  */
// const verifyEmail = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findByIdAndUpdate(
//       decoded.id,
//       { verified: true },
//       { new: true }
//     );

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: "User not found",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Email verified successfully",
//       user: getUserResponse(user),
//     });
//   } catch (error) {
//     console.error("Email verification error:", error);
//     res.status(400).json({
//       success: false,
//       error: "Invalid or expired verification token",
//     });
//   }
// };

// /**
//  * Resend verification email
//  */
// const resendVerification = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: "User not found",
//       });
//     }

//     if (user.verified) {
//       return res.status(400).json({
//         success: false,
//         error: "Email already verified",
//       });
//     }

//     const verificationToken = jwt.sign(
//       { id: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     await sendVerificationEmail(email, verificationToken);

//     res.json({
//       success: true,
//       message: "Verification email resent successfully",
//     });
//   } catch (error) {
//     console.error("Resend verification error:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to resend verification email",
//     });
//   }
// };

// /**
//  * Request password reset
//  */
// const requestPasswordReset = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: "User not found",
//       });
//     }

//     const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     await sendPasswordResetEmail(email, resetToken);

//     res.json({
//       success: true,
//       message: "Password reset email sent successfully",
//     });
//   } catch (error) {
//     console.error("Password reset request error:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to send password reset email",
//     });
//   }
// };

// /**
//  * Reset password with token
//  */
// const resetPassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { newPassword } = req.body;

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: "User not found",
//       });
//     }

//     user.password = newPassword;
//     await user.save();

//     res.json({
//       success: true,
//       message: "Password updated successfully",
//     });
//   } catch (error) {
//     console.error("Password reset error:", error);
//     res.status(400).json({
//       success: false,
//       error: "Invalid or expired reset token",
//     });
//   }
// };

// /**
//  * Update user status (admin only)
//  */
// const updateStatus = async (req, res) => {
//   try {
//     const { status } = req.body;
//     const user = await User.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     );

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: "User not found",
//       });
//     }

//     res.json({
//       success: true,
//       message: "User status updated successfully",
//       user: getUserResponse(user),
//     });
//   } catch (error) {
//     console.error("Update status error:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to update user status",
//     });
//   }
// };

// /**
//  * Get all users (admin only)
//  */
// const getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find().select("-password");
//     res.json({
//       success: true,
//       count: users.length,
//       users: users.map((user) => getUserResponse(user)),
//     });
//   } catch (error) {
//     console.error("Get all users error:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch users",
//     });
//   }
// };

// /**
//  * Get user by ID
//  */
// const getUserById = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select("-password");
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: "User not found",
//       });
//     }
//     res.json({
//       success: true,
//       user: getUserResponse(user),
//     });
//   } catch (error) {
//     console.error("Get user error:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch user",
//     });
//   }
// };

// /**
//  * Delete user (admin only)
//  */
// const deleteUser = async (req, res) => {
//   try {
//     const user = await User.findByIdAndDelete(req.params.id);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: "User not found",
//       });
//     }
//     res.json({
//       success: true,
//       message: "User deleted successfully",
//     });
//   } catch (error) {
//     console.error("Delete user error:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to delete user",
//     });
//   }
// };

// module.exports = {
//   register,
//   login,
//   verifyEmail,
//   resendVerification,
//   requestPasswordReset,
//   resetPassword,
//   updateStatus,
//   getAllUsers,
//   getUserById,
//   deleteUser,
//   getProfile
// };
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendStatisticsReportEmail
} = require("../config/sendEmail");

// Helper function to generate user response
const getUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  status: user.status,
  verified: user.verified,
});

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate input
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Phone number";
      return res.status(400).json({
        success: false,
        error: `${field} already exists`,
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      status: "user",
      verified: false,
    });

    // Generate tokens
    const verificationToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const authToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
      return res.status(201).json({
        success: true,
        token: authToken,
        message: "Registration successful! Please check your email to verify your account.",
        user: getUserResponse(user),
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return res.status(201).json({
        success: true,
        token: authToken,
        message: "Registration complete! Please request a verification email later.",
        user: getUserResponse(user),
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Registration failed. Please try again.",
    });
  }
};

/**
 * Get user profile
 */
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      user: getUserResponse(req.user)
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check account status
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        error: `Account is ${user.status}. Please contact support.`,
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      token,
      message: "Login successful",
      user: getUserResponse(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Login failed. Please try again.",
    });
  }
};

/**
 * Verify email with token
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByIdAndUpdate(
      decoded.id,
      { verified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Email verified successfully",
      user: getUserResponse(user),
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(400).json({
      success: false,
      error: "Invalid or expired verification token",
    });
  }
};

/**
 * Resend verification email
 */
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (user.verified) {
      return res.status(400).json({
        success: false,
        error: "Email already verified",
      });
    }

    const verificationToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await sendVerificationEmail(email, verificationToken);

    res.json({
      success: true,
      message: "Verification email resent successfully",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to resend verification email",
    });
  }
};

/**
 * Request password reset
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    await sendPasswordResetEmail(email, resetToken);

    res.json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send password reset email",
    });
  }
};

/**
 * Reset password with token
 */
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(400).json({
      success: false,
      error: "Invalid or expired reset token",
    });
  }
};

/**
 * Update user status (admin only)
 */
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User status updated successfully",
      user: getUserResponse(user),
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update user status",
    });
  }
};

/**
 * Get all users (admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().lean(); // Add .lean() for plain JS objects
    console.log('Raw users from DB:', users.length); // Debug log
    
    const mappedUsers = users.map((user) => {
      const userResponse = getUserResponse(user);
      console.log('Mapped user:', userResponse); // Debug each mapping
      return userResponse;
    }).filter(user => user !== null); // Filter out any null responses
    
    res.json({
      success: true,
      count: mappedUsers.length,
      message:'User fetched successfully !!',
      users: mappedUsers,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
    });
  }
};
/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    res.json({
      success: true,
      user: getUserResponse(user),
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user",
    });
  }
};

/**
 * Delete user (admin only)
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete user",
    });
  }
};

/**
 * Get system statistics (admin only)
 */
const getStatistics = async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ verified: true });
    const activeUsers = await User.countDocuments({ status: 'active' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    
    // Time-based counts
    const newUsersLast24h = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    const newUsersLast7d = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    // Verification rate
    const verificationRate = totalUsers > 0 ? (verifiedUsers / totalUsers * 100).toFixed(2) : 0;

    // User growth data (last 30 days)
    const growthData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = await User.countDocuments({
        createdAt: {
          $gte: date,
          $lt: nextDate
        }
      });
      
      growthData.push({
        date: date.toISOString().split('T')[0],
        count
      });
    }

    // Prepare response
    const statistics = {
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        verificationRate: `${verificationRate}%`,
        newUsers: {
          last24h: newUsersLast24h,
          last7d: newUsersLast7d
        }
      },
      growth: growthData,
      reportGeneratedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      statistics
    });

  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate statistics report'
    });
  }
};

/**
 * Send statistics report to admin email (admin only)
 */
const sendStatisticsReport = async (req, res) => {
  try {
    // First get the statistics data
    const stats = await getStatistics(req, { json: () => {} });
    
    // Then send the email report
    await sendStatisticsReportEmail(stats.statistics);

    res.json({
      success: true,
      message: 'Statistics report sent to admin email successfully'
    });

  } catch (error) {
    console.error('Send statistics report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send statistics report'
    });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
  requestPasswordReset,
  resetPassword,
  updateStatus,
  getAllUsers,
  getUserById,
  deleteUser,
  getProfile,
  getStatistics,
  sendStatisticsReport
};