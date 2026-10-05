const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { sendPasswordResetEmail, getTransporter } = require('../services/emailService');
const crypto = require('crypto');
const { auth } = require('../middleware/auth');
const Settings = require('../models/Settings');
const bcrypt = require('bcryptjs');

const router = express.Router();

// @route   POST /api/password/forgot
// @desc    Request password reset
// @access  Public
router.post(
  '/forgot',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User with that email does not exist',
        });
      }

      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });

      try {
        await sendPasswordResetEmail({
          email: user.email,
          firstName: user.firstName,
          token: resetToken,
        });

        res.json({
          success: true,
          message: 'Password reset token sent to email',
        });
      } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        console.error('Send email error:', error);
        return res.status(500).json({
          success: false,
          message: 'There was an error sending the email. Please try again later.',
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

const { readCollection, writeCollection } = require('../utils/localStore');

router.post('/forgot-otp', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    const email = String(req.body.email || '').trim().toLowerCase();

    // Check MongoDB and localStore for user
    let user = null;
    try {
      user = await User.findOne({ email });
    } catch (err) {
      console.warn('DB search user error in forgot-otp:', err.message);
    }

    if (!user) {
      const localUsers = readCollection('users') || [];
      const localUser = localUsers.find(u => String(u.email || '').toLowerCase() === email);
      if (localUser) {
        user = {
          _id: localUser.id || localUser._id || 'local_' + Date.now(),
          email: localUser.email,
          firstName: localUser.firstName || localUser.name || 'User'
        };
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User with that email does not exist' });
    }

    const code = (Math.floor(100000 + Math.random() * 900000)).toString();
    const hash = await bcrypt.hash(code, 10);
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

    // Store in DB Settings
    try {
      await Settings.setSetting(`USER_PASSWORD_OTP:${email}`, { hash, expiresAt }, user._id || 'system', 'User password OTP');
    } catch (err) {
      console.warn('Settings setSetting error in forgot-otp:', err.message);
    }

    // Always store in localStore otps.json as backup
    try {
      const otps = readCollection('otps') || [];
      const filtered = otps.filter(o => String(o.email).toLowerCase() !== email);
      filtered.push({ email, hash, expiresAt });
      writeCollection('otps', filtered);
    } catch (err) {
      console.warn('otps.json write error in forgot-otp:', err.message);
    }

    // Dispatch email
    const { sendOTPEmail } = require('../services/emailService');
    await sendOTPEmail({
      email: user.email,
      firstName: user.firstName,
      code,
      type: 'Password Reset'
    });

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Forgot OTP error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send OTP' });
  }
});

router.post('/reset-otp', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isString().trim().notEmpty(),
  body('newPassword').isLength({ min: 8 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    const email = String(req.body.email || '').trim().toLowerCase();
    const otp = String(req.body.otp || '').trim();
    const { newPassword } = req.body;

    // Get OTP record from DB Settings or localStore otps.json
    let rec = null;
    try {
      rec = await Settings.getSetting(`USER_PASSWORD_OTP:${email}`);
    } catch (err) {
      console.warn('Settings getSetting error in reset-otp:', err.message);
    }

    if (!rec || !rec.hash || !rec.expiresAt) {
      const otps = readCollection('otps') || [];
      const found = otps.find(o => String(o.email).toLowerCase() === email);
      if (found) rec = found;
    }

    if (!rec || !rec.hash || !rec.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP not requested or expired' });
    }
    if (Date.now() > rec.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }
    const valid = await bcrypt.compare(otp, rec.hash);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    // Update password in DB User
    let updated = false;
    try {
      let user = await User.findOne({ email }).select('+password');
      if (user) {
        user.password = newPassword;
        await user.save();
        updated = true;
      }
    } catch (err) {
      console.warn('DB User password update error in reset-otp:', err.message);
    }

    // Always update password in localStore users.json
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const localUsers = readCollection('users') || [];
    const localIdx = localUsers.findIndex(u => String(u.email || '').toLowerCase() === email);
    if (localIdx !== -1) {
      localUsers[localIdx].password = hashedPassword;
      writeCollection('users', localUsers);
      updated = true;
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    // Clear OTP from DB and localStore
    try {
      await Settings.setSetting(`USER_PASSWORD_OTP:${email}`, { hash: '', expiresAt: 0 }, 'system', 'User password OTP cleared');
    } catch (_) {}
    try {
      const otps = readCollection('otps') || [];
      const cleanOtps = otps.filter(o => String(o.email).toLowerCase() !== email);
      writeCollection('otps', cleanOtps);
    } catch (_) {}

    res.json({ success: true, message: 'Password updated successfully! You can now log in.' });
  } catch (error) {
    console.error('Reset OTP error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// @route   POST /api/password/reset/:token
// @desc    Reset password
// @access  Public
router.post(
  '/reset/:token',
  [
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('passwordConfirm')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Token is invalid or has expired',
        });
      }

      user.password = req.body.password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      // Log the user in (optional)
      // const token = user.getSignedJwtToken();
      // res.json({ success: true, token });

      res.json({
        success: true,
        message: 'Password reset successful',
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
);

// @route   PUT /api/password/update
// @desc    Update password for logged-in user
// @access  Private
router.put(
  '/update',
  auth,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id).select('+password');

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect current password',
        });
      }

      user.password = newPassword;
      await user.save();

      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      console.error('Update password error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

module.exports = router;