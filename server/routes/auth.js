const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { readCollection, writeCollection } = require('../utils/localStore');
const User = require('../models/User');
const JoinApplication = require('../models/JoinApplication');
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const Settings = require('../models/Settings');
const { GetTransporter: _unused } = {};
const emailService = require('../services/emailService');
const { sendVerificationEmail, sendWelcomeEmail } = emailService;

const router = express.Router();


// Rate limiting disabled for auth routes

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),

  body('acceptTerms')
    .isBoolean()
    .custom((value) => {
      if (!value) {
        throw new Error('You must accept the terms and conditions');
      }
      return true;
    }),
  body('referralCode').optional().trim()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password, referralCode } = req.body;

    // Check if user already exists in DB or localStore
    let existingUser = null;
    if (mongoose.connection.readyState === 1) {
      try {
        existingUser = await User.findOne({ email });
      } catch (dbErr) {
        console.warn('User.findOne db error:', dbErr.message);
      }
    }
    const localUsers = readCollection('users') || [];
    if (!existingUser) {
      existingUser = localUsers.find(u => u.email && u.email.toLowerCase() === String(email).toLowerCase());
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Handle referral
    let referredBy = null;
    let finalReferralCode = referralCode;

    if (!finalReferralCode) {
      if (mongoose.connection.readyState === 1) {
        try {
          const application = await JoinApplication.findOne({ email: new RegExp('^' + String(email).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') });
          if (application && application.referralCode) {
            finalReferralCode = application.referralCode;
          }
        } catch (_) {}
      }
      if (!finalReferralCode) {
        try {
          const apps = readCollection('applications') || [];
          const localApp = apps.find(a => a.email && a.email.toLowerCase() === String(email).toLowerCase());
          if (localApp && localApp.referralCode) {
            finalReferralCode = localApp.referralCode;
          }
        } catch (_) {}
      }
    }

    if (finalReferralCode) {
      const regEmailLower = String(email || '').toLowerCase();
      if (mongoose.connection.readyState === 1) {
        try {
          const referrer = await User.findOne({ referralCode: finalReferralCode });
          if (referrer && String(referrer.email || '').toLowerCase() !== regEmailLower) {
            referredBy = referrer._id;
            await referrer.addCategoryPoints(10, 'referral');
            try { global.__broadcastUsersUpdate({ type: 'user_referral_awarded', id: referrer._id }); } catch (_) { }
          }
        } catch (_) {}
      }

      try {
        const localUsersList = readCollection('users') || [];
        const refLocalUser = localUsersList.find(u => u.referralCode === finalReferralCode);
        if (refLocalUser && String(refLocalUser.email || '').toLowerCase() !== regEmailLower) {
          if (!referredBy) referredBy = refLocalUser._id || refLocalUser.id;
          refLocalUser.points = (refLocalUser.points || 0) + 10;
          refLocalUser.stats = refLocalUser.stats || {};
          refLocalUser.stats.referralPoints = (refLocalUser.stats.referralPoints || 0) + 10;
          refLocalUser.stats.referralCount = (refLocalUser.stats.referralCount || 0) + 1;
          writeCollection('users', localUsersList);
        }
      } catch (_) {}
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const userReferralCode = crypto.randomBytes(6).toString('hex');

    if (mongoose.connection.readyState === 1) {
      try {
        const user = new User({
          firstName,
          lastName,
          email,
          password,
          role: 'user',
          isActive: true,
          referredBy,
          referralCode: userReferralCode,
          emailVerificationToken: hashedToken,
          emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
          isEmailVerified: false,
          preferences: {
            emailNotifications: true,
            pushNotifications: true,
            theme: 'light',
            language: 'en'
          }
        });
        await user.save();
      } catch (dbErr) {
        console.warn('User DB save error:', dbErr.message);
      }
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUserLocal = {
        _id: 'usr_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        firstName: firstName || 'Member',
        lastName: lastName || 'User',
        email,
        password: hashedPassword,
        role: 'user',
        isActive: true,
        referredBy,
        referralCode: userReferralCode,
        isEmailVerified: false,
        emailVerificationToken: hashedToken,
        emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
        createdAt: new Date().toISOString()
      };
      localUsers.unshift(newUserLocal);
      writeCollection('users', localUsers);
    } catch (_) {}

    // Update matching JoinApplication status to 'registered' in DB & localStore
    if (mongoose.connection.readyState === 1) {
      try {
        await JoinApplication.updateMany(
          { email: new RegExp('^' + String(email).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') },
          { $set: { status: 'registered' } }
        );
      } catch (_) {}
    }
    try {
      const localApps = readCollection('applications') || [];
      let updatedApps = false;
      localApps.forEach(app => {
        if (app.email && app.email.toLowerCase() === String(email).toLowerCase()) {
          app.status = 'registered';
          updatedApps = true;
        }
      });
      if (updatedApps) writeCollection('applications', localApps);
    } catch (_) {}

    // Send verification email in background
    sendVerificationEmail({ email, firstName, token: rawToken })
      .catch(err => console.error('[Background Email] Verification email failed:', err));

    res.status(201).json({
      success: true,
      requiresVerification: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: { user: { email, firstName } }
    });

    try { global.__broadcastUsersUpdate && global.__broadcastUsersUpdate({ type: 'user_registered', email }); } catch (_) { }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
});

// @route   GET /api/auth/verify-email/:token
// @desc    Verify email address and return JWT for auto-login
// @access  Public
router.get('/verify-email/:token', async (req, res) => {
  try {
    const rawToken = req.params.token;
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    let user = null;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({
          $or: [
            { emailVerificationToken: hashedToken },
            { emailVerificationToken: rawToken }
          ]
        });
      } catch (dbErr) {
        console.warn('User.findOne verify email db error:', dbErr.message);
      }
    }

    const localUsers = readCollection('users') || [];
    if (!user) {
      user = localUsers.find(u =>
        u.emailVerificationToken === hashedToken ||
        u.emailVerificationToken === rawToken ||
        (u.emailVerificationToken && String(u.emailVerificationToken).toLowerCase() === String(rawToken).toLowerCase()) ||
        (u.emailVerificationToken && String(u.emailVerificationToken).toLowerCase() === String(hashedToken).toLowerCase())
      );
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Verification link is invalid, already used, or expired.'
      });
    }

    const userId = user._id || user.id || 'usr_' + Date.now();
    const payload = { user: { id: userId, email: user.email, role: user.role || 'user' } };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

    // If already verified
    if (user.isEmailVerified) {
      return res.json({
        success: true,
        alreadyVerified: true,
        message: 'Your email has already been verified, logging you in...',
        data: { token: jwtToken, user: { id: userId, email: user.email, firstName: user.firstName, role: user.role || 'user' } }
      });
    }

    // Mark email as verified in DB and invalidate token
    if (mongoose.connection.readyState === 1 && typeof user.save === 'function') {
      try {
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save({ validateBeforeSave: false });
      } catch (dbErr) {}
    }

    // Mark email as verified in localStore and invalidate token
    try {
      const idx = localUsers.findIndex(u => (u.email && u.email.toLowerCase() === String(user.email).toLowerCase()) || u.emailVerificationToken === hashedToken || u.emailVerificationToken === rawToken);
      if (idx !== -1) {
        localUsers[idx].isEmailVerified = true;
        localUsers[idx].emailVerificationToken = undefined;
        localUsers[idx].emailVerificationExpires = undefined;
        writeCollection('users', localUsers);
      }
    } catch (_) {}

    res.json({
      success: true,
      message: 'Email verified successfully! Welcome to ReclaimDAO.',
      data: { token: jwtToken, user: { id: userId, email: user.email, firstName: user.firstName, role: user.role || 'user' } }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ success: false, message: 'Server error during email verification' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, rememberMe } = req.body;

    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({ email }).select('+password');
      } catch (dbErr) {
        console.warn('DB user find error in login:', dbErr.message);
      }
    }

    if (!user) {
      const localUsers = readCollection('users') || [];
      const found = localUsers.find(
        (u) => u.email && u.email.toLowerCase() === String(email).toLowerCase()
      );
      if (found) {
        user = found;
      }
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Check if user is email verified (regular users only, admins exempt)
    if (user.role !== 'admin' && user.isEmailVerified === false) {
      return res.status(400).json({
        success: false,
        requiresVerification: true,
        message: 'Please verify your email address before logging in. Check your inbox for the verification link.',
      });
    }

    // Check password for both Mongoose model and localStore object
    let isMatch = false;
    if (typeof user.comparePassword === 'function') {
      try {
        isMatch = await user.comparePassword(password);
      } catch (err) {
        console.warn('user.comparePassword error:', err.message);
      }
    }
    
    if (!isMatch && user.password) {
      if (String(user.password).startsWith('$2')) {
        try {
          isMatch = await bcrypt.compare(password, user.password);
        } catch (_) {}
      } else {
        isMatch = (password === String(user.password).trim());
      }
    }

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user._id || user.id,
        email: user.email,
        role: user.role || 'user',
      },
    };

    const tokenExpiry = rememberMe ? '30d' : process.env.JWT_EXPIRE || '7d';
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: tokenExpiry,
    });

    if (typeof user.updateLastLogin === 'function') {
      try {
        await user.updateLastLogin(req.ip, req.get('User-Agent'));
      } catch (_) {}
    }

    // Remove password from response
    const userResponse = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userResponse,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    let user = null;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.user.id)) {
      try {
        user = await User.findById(req.user.id).select('-password');
      } catch (_) {}
    }

    if (!user) {
      const localUsers = readCollection('users');
      user = localUsers.find(
        (u) => String(u._id || u.id) === String(req.user.id) || u.email === req.user.email
      );
    }

    if (!user) {
      user = {
        _id: req.user.id || '660000000000000000000099',
        firstName: req.user.firstName || 'Demo',
        lastName: req.user.lastName || 'User',
        email: req.user.email,
        role: req.user.role || 'user',
        points: 450,
        votingRights: 5,
        stats: {
          votingPoints: 150,
          contributionPoints: 150,
          referralPoints: 150,
          totalVotes: 4,
          totalContributions: 1,
        },
      };
    }

    const userData = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
    delete userData.password;

    // Calculate 5000+ line rank for the logged-in user (for Dashboard & Your Ranking card)
    try {
      const { getUnifiedRankedUsers } = require('./users');
      const allRanked = await getUnifiedRankedUsers();
      const targetUid = String(userData._id || userData.id || '');
      const targetEmail = String(userData.email || '').toLowerCase();
      const posIndex = allRanked.findIndex(u => String(u._id) === targetUid || String(u.email || '').toLowerCase() === targetEmail);
      if (posIndex !== -1) {
        const foundUser = allRanked[posIndex];
        userData.rank = foundUser.overrides?.rankOverride !== undefined ? Number(foundUser.overrides.rankOverride) : (5000 + posIndex + 1);
      } else {
        userData.rank = 5001;
      }
    } catch (e) {
      console.warn('Auth me rank calc error:', e.message);
      userData.rank = 5001;
    }

    try {
      if (typeof user.calculateRealStats === 'function') {
        userData.realStats = await user.calculateRealStats();
      } else {
        const uidStr = String(userData._id || userData.id || '');
        const refCode = userData.referralCode;
        const countedEmails = new Set();

        const allLocalUsers = readCollection('users') || [];
        allLocalUsers.forEach(lu => {
          if (lu.email && (String(lu.referredBy || '') === uidStr || (refCode && lu.referralCode === refCode && String(lu._id || lu.id) !== uidStr))) {
            countedEmails.add(lu.email.toLowerCase());
          }
        });

        if (refCode) {
          const allLocalApps = readCollection('applications') || [];
          allLocalApps.forEach(la => {
            if (la.email && la.referralCode === refCode) {
              countedEmails.add(la.email.toLowerCase());
            }
          });
        }

        const refCount = countedEmails.size;
        const refPts = refCount * 10;
        userData.realStats = {
          votingPoints: userData.stats?.votingPoints || 0,
          contributionPoints: userData.stats?.contributionPoints || 0,
          referralPoints: Math.max(userData.stats?.referralPoints || 0, refPts),
          totalPoints: (userData.stats?.votingPoints || 0) + (userData.stats?.contributionPoints || 0) + Math.max(userData.stats?.referralPoints || 0, refPts),
          referralCount: refCount
        };
      }

      if (userData.realStats) {
        userData.stats = userData.stats || {};
        userData.stats.votingPoints = Math.max(userData.stats.votingPoints || 0, userData.realStats.votingPoints);
        userData.stats.contributionPoints = Math.max(userData.stats.contributionPoints || 0, userData.realStats.contributionPoints);
        userData.stats.referralPoints = Math.max(userData.stats.referralPoints || 0, userData.realStats.referralPoints);
        userData.points = Math.max(userData.points || 0, userData.realStats.totalPoints);
      }
    } catch (_) {}

    res.json({
      success: true,
      data: {
        user: userData,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('username')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[a-zA-Z0-9_]{3,32}$/)
    .withMessage('Username must be 3-32 characters and contain only letters, numbers, and underscores'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),

  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('address')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),

  body('telegramUsername')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[a-zA-Z0-9_]{3,32}$/)
    .withMessage('Telegram username must be 3-32 characters and contain only letters, numbers, and underscores'),

  body('phoneNumber')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\+?[0-9\s\-().]{7,20}$/)
    .withMessage('Phone number must be 7-20 digits and may include +, spaces, dashes, parentheses, and dots'),

  body('walletAddress')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10, max: 100 })
    .withMessage('Wallet address must be between 10 and 100 characters'),

  body('socialLinks.twitter')
    .optional()
    .isURL()
    .withMessage('Twitter URL must be valid'),

  body('socialLinks.linkedin')
    .optional()
    .isURL()
    .withMessage('LinkedIn URL must be valid'),

  body('socialLinks.github')
    .optional()
    .isURL()
    .withMessage('GitHub URL must be valid'),

  body('preferences.emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be boolean'),

  body('preferences.pushNotifications')
    .optional()
    .isBoolean()
    .withMessage('Push notifications must be boolean'),

  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Theme must be light or dark'),

  body('preferences.language')
    .optional()
    .isIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'])
    .withMessage('Language must be a supported language code')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const allowedUpdates = [
      'firstName', 'lastName', 'bio', 'email', 'username', 'address', 'telegramUsername', 'phoneNumber', 'walletAddress', 'socialLinks', 'preferences'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    let user = null;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.user.id)) {
      try {
        if (updates.email) {
          const exists = await User.findOne({ email: updates.email, _id: { $ne: req.user.id } }).lean();
          if (exists) {
            return res.status(400).json({ success: false, message: 'Email already in use' });
          }
        }
        if (updates.username) {
          const existsUser = await User.findOne({ username: updates.username, _id: { $ne: req.user.id } }).lean();
          if (existsUser) {
            return res.status(400).json({ success: false, message: 'Username already in use' });
          }
        }
        user = await User.findByIdAndUpdate(
          req.user.id,
          { $set: updates },
          { new: true, runValidators: true }
        ).select('-password');
      } catch (dbErr) {
        console.warn('DB update profile error:', dbErr.message);
      }
    }

    // Fallback to localStore
    const localUsers = readCollection('users') || [];
    const idx = localUsers.findIndex(u => String(u._id || u.id) === String(req.user.id) || u.email === req.user.email);
    if (idx !== -1) {
      localUsers[idx] = { ...localUsers[idx], ...updates, updatedAt: new Date().toISOString() };
      writeCollection('users', localUsers);
      if (!user) user = localUsers[idx];
    }

    if (!user) {
      user = { _id: req.user.id, ...updates };
    }

    try { global.__broadcastUsersUpdate && global.__broadcastUsersUpdate({ type: 'users_updated', id: user._id || user.id }); } catch (_) { }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during profile update'
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password (hashed by model pre-save)
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // In a more advanced implementation, you might want to blacklist the token
    // For now, we'll just send a success response as the client will remove the token

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// @route   POST /api/auth/request-password-otp
// @desc    Send OTP to the logged-in user's email
// @access  Private
router.post('/request-password-otp', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('email');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const code = (Math.floor(100000 + Math.random() * 900000)).toString();
    const hash = await bcrypt.hash(code, 12);
    const expiresAt = Date.now() + 10 * 60 * 1000;
    await Settings.setSetting(`USER_PASSWORD_OTP:${user.email}`, { hash, expiresAt }, req.user.id, 'User password OTP');
    const t = await emailService.getTransporter();
    const fromAddr = process.env.EMAIL_FROM || process.env.EMAIL_USERNAME;
    const info = await t.sendMail({ from: `ReclaimDAO <${fromAddr}>`, to: user.email, subject: 'Password OTP', text: `OTP: ${code}`, replyTo: fromAddr, envelope: { from: fromAddr, to: user.email }, headers: { 'X-Mailer': 'ReclaimDAO System' } });
    const ok = Array.isArray(info.accepted) && info.accepted.length > 0;
    if (!ok) {
      return res.status(500).json({ success: false, message: 'Failed to send OTP', error: { response: info.response, rejected: info.rejected } });
    }
    res.json({ success: true, message: 'OTP sent', accepted: info.accepted, response: info.response });
  } catch (error) {
    console.error('Request password OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error while sending OTP' });
  }
});

// @route   POST /api/auth/change-password-otp
// @desc    Change password with OTP for logged-in user
// @access  Private
router.post('/change-password-otp', auth, [
  body('otp').isString().trim().notEmpty(),
  body('newPassword').isString().isLength({ min: 8 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    const { otp, newPassword } = req.body;
    let user = await User.findById(req.user.id).select('+password email');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const rec = await Settings.getSetting(`USER_PASSWORD_OTP:${user.email}`);
    if (!rec || !rec.hash || !rec.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP not requested' });
    }
    if (Date.now() > rec.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }
    const valid = await bcrypt.compare(otp, rec.hash);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    user.password = newPassword;
    await user.save();
    await Settings.setSetting(`USER_PASSWORD_OTP:${user.email}`, { hash: '', expiresAt: 0 }, req.user.id, 'User password OTP cleared');
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error while changing password' });
  }
});

// @route   GET /api/auth/verify-token
// @desc    Verify if token is valid
// @access  Private
router.get('/verify-token', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or user is inactive'
      });
    }

    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token verification'
    });
  }
});

module.exports = router;
