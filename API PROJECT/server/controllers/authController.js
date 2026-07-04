const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
      role: role || 'resident',
      phone
    });

    // Generate token and send response
    const token = user.getSignedToken();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Contact admin.'
      });
    }

    // Compare password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = user.getSignedToken();

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/updateprofile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => {
      if (fieldsToUpdate[key] === undefined) delete fieldsToUpdate[key];
    });

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/changepassword
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    const token = user.getSignedToken();

    res.json({
      success: true,
      message: 'Password changed successfully',
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
};

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with that email'
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Build reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const html = `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>You requested a password reset for your Smart Society account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a>
      <p>This link will expire in 15 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Smart Society - Password Reset',
      html
    });

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    // Clear reset fields on error
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }

    res.status(500).json({
      success: false,
      message: 'Email could not be sent'
    });
  }
};

// @desc    Reset password using token
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Hash the token from URL
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = user.getSignedToken();

    res.json({
      success: true,
      message: 'Password reset successful',
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};
