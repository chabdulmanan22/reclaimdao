const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { getTransporter } = require('../services/emailService');
const Settings = require('../models/Settings');
const User = require('../models/User');
const Contribution = require('../models/Contribution');
const Vote = require('../models/Vote');
const Coin = require('../models/Coin');
const { adminAuth } = require('../middleware/auth');
const {
  adminArticleListQueryValidators,
  handleAdminArticleList,
} = require('../controllers/articleAdminListController');

const { readCollection, writeCollection } = require('../utils/localStore');

const mkTransporter = async () => getTransporter();

router.get('/health', (req, res) => {
  res.json({ status: 'OK', route: 'admin' });
});

// @route   GET /api/admin/profile
// @desc    Get admin profile credentials
// @access  Private/Admin
router.get('/profile', adminAuth, async (req, res) => {
  try {
    let adminUser = null;
    if (mongoose.connection.readyState === 1 && req.user?.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
      try {
        adminUser = await User.findById(req.user.id);
      } catch (_) {}
    }
    const email = adminUser?.email || req.user?.email || process.env.ADMIN_EMAIL || 'admin@example.com';
    const username = adminUser?.username || process.env.ADMIN_USERNAME || 'ADMIN';
    res.json({
      success: true,
      data: {
        id: req.user?.id || 'admin_1',
        email,
        username,
        role: 'admin'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/update-username
// @desc    Update admin username
// @access  Private/Admin
router.post('/update-username', adminAuth, [
  body('username').isString().trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Username is required', errors: errors.array() });
    }
    const { username } = req.body;
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '..', '.env');
    try {
      if (fs.existsSync(envPath)) {
        const raw = fs.readFileSync(envPath, 'utf8');
        const lines = raw.split(/\r?\n/).map(l => {
          if (l.startsWith('ADMIN_USERNAME=')) return 'ADMIN_USERNAME=' + username;
          return l;
        });
        fs.writeFileSync(envPath, lines.join('\n'));
      }
    } catch (err) {
      console.error('Error writing ADMIN_USERNAME to .env:', err.message);
    }
    process.env.ADMIN_USERNAME = username;

    if (mongoose.connection.readyState === 1) {
      try {
        await User.updateMany({ role: 'admin' }, { username });
      } catch (_) {}
    }

    const localUsers = readCollection('users') || [];
    localUsers.forEach(u => {
      if (u.role === 'admin' || String(u._id || u.id) === String(req.user?.id)) {
        u.username = username;
      }
    });
    writeCollection('users', localUsers);

    res.json({ success: true, message: 'Username updated successfully' });
  } catch (error) {
    console.error('Update admin username error:', error);
    res.status(500).json({ success: false, message: 'Failed to update username' });
  }
});

// @route   POST /api/admin/update-password
// @desc    Update admin password
// @access  Private/Admin
router.post('/update-password', adminAuth, [
  body('newPassword').isString().isLength({ min: 8 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters', errors: errors.array() });
    }
    const { newPassword } = req.body;
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '..', '.env');
    try {
      if (fs.existsSync(envPath)) {
        const raw = fs.readFileSync(envPath, 'utf8');
        const lines = raw.split(/\r?\n/).map(l => {
          if (l.startsWith('ADMIN_PASSWORD=')) return 'ADMIN_PASSWORD=' + newPassword;
          return l;
        });
        fs.writeFileSync(envPath, lines.join('\n'));
      }
    } catch (err) {
      console.error('Error writing ADMIN_PASSWORD to .env:', err.message);
    }
    process.env.ADMIN_PASSWORD = newPassword;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    if (mongoose.connection.readyState === 1) {
      try {
        await User.updateMany({ role: 'admin' }, { password: hashedPassword });
      } catch (_) {}
    }

    const localUsers = readCollection('users') || [];
    localUsers.forEach(u => {
      if (u.role === 'admin' || String(u._id || u.id) === String(req.user?.id)) {
        u.password = hashedPassword;
      }
    });
    writeCollection('users', localUsers);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update admin password error:', error);
    res.status(500).json({ success: false, message: 'Failed to update password' });
  }
});

router.post('/login', [
  body('username').isString().trim().notEmpty(),
  body('password').isString().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  const { username, password } = req.body;
  const usernameInput = String(username || '').trim().toLowerCase();
  const inputPass = String(password || '').trim();

  let isAuthenticated = false;
  let adminId = '000000000000000000000001';
  let adminEmail = process.env.ADMIN_EMAIL || 'admin@reclaimdao.org';
  let adminUsername = username;

  // 1. Try DB check
  if (mongoose.connection.readyState === 1) {
    try {
      const adminUsers = await User.find({ role: 'admin' }).select('+password');
      for (const adminUser of adminUsers) {
        const uMatch = [
          String(adminUser.username || '').toLowerCase(),
          String(adminUser.email || '').toLowerCase(),
          String(process.env.ADMIN_USERNAME || '').toLowerCase(),
          String(process.env.ADMIN_EMAIL || '').toLowerCase()
        ].filter(Boolean).includes(usernameInput);

        if (uMatch) {
          let pMatch = false;
          if (adminUser.password) {
            try { pMatch = await bcrypt.compare(inputPass, adminUser.password); } catch (_) {}
            if (!pMatch) pMatch = (inputPass === adminUser.password);
          }
          if (pMatch) {
            isAuthenticated = true;
            adminId = adminUser._id;
            adminEmail = adminUser.email || adminEmail;
            adminUsername = adminUser.username || username;
            break;
          }
        }
      }
    } catch (dbErr) {
      console.warn('MongoDB query warning in admin login:', dbErr.message);
    }
  }

  // 2. Try localStore users.json check
  if (!isAuthenticated) {
    const localUsers = readCollection('users') || [];
    const localAdmins = localUsers.filter(u => u.role === 'admin');
    for (const localAdmin of localAdmins) {
      const uMatch = [
        String(localAdmin.username || '').toLowerCase(),
        String(localAdmin.email || '').toLowerCase(),
        String(process.env.ADMIN_USERNAME || '').toLowerCase(),
        String(process.env.ADMIN_EMAIL || '').toLowerCase()
      ].filter(Boolean).includes(usernameInput);

      if (uMatch) {
        let pMatch = false;
        if (localAdmin.password) {
          try { pMatch = await bcrypt.compare(inputPass, localAdmin.password); } catch (_) {}
          if (!pMatch) pMatch = (inputPass === String(localAdmin.password).trim());
        }
        if (pMatch) {
          isAuthenticated = true;
          adminId = localAdmin._id || localAdmin.id || adminId;
          adminEmail = localAdmin.email || adminEmail;
          adminUsername = localAdmin.username || username;
          break;
        }
      }
    }
  }

  // 3. Fallback Env check
  if (!isAuthenticated) {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      require('dotenv').config({ path: envPath, override: true });
    }
    const envUsername = process.env.ADMIN_USERNAME;
    const envEmail = process.env.ADMIN_EMAIL;
    const envPassword = process.env.ADMIN_PASSWORD;
    if (envPassword) {
      const allowedIdentifiers = [
        String(envUsername || '').trim().toLowerCase(),
        String(envEmail || '').trim().toLowerCase()
      ].filter(Boolean);
      const uMatch = allowedIdentifiers.includes(usernameInput);
      const pMatch = inputPass === String(envPassword).trim();
      if (uMatch && pMatch) {
        isAuthenticated = true;
        adminUsername = envUsername || username;
        adminEmail = envEmail || adminEmail;
      }
    }
  }

  if (!isAuthenticated) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const payload = { user: { id: adminId, email: adminEmail, role: 'admin' } };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: process.env.JWT_EXPIRE || '7d' });
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      admin: {
        id: adminId,
        username: adminUsername,
        email: adminEmail,
        role: 'super_admin'
      }
    }
  });
});

router.post('/request-password-otp', adminAuth, async (req, res) => {
  const code = (Math.floor(100000 + Math.random() * 900000)).toString();
  const hash = await bcrypt.hash(code, 12);
  const expiresAt = Date.now() + 10 * 60 * 1000;
  const adminUser = await User.findById(req.user.id);
  const firstName = adminUser ? adminUser.firstName : 'Admin';

  await Settings.setSetting('ADMIN_PASSWORD_OTP', { hash, expiresAt }, req.user.id, 'Admin password OTP');

  try {
    const { sendOTPEmail } = require('../services/emailService');
    const toAddr = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || process.env.EMAIL_USERNAME;

    await sendOTPEmail({
      email: toAddr,
      firstName,
      code,
      type: 'Admin Password Reset'
    });

    res.json({ success: true, message: 'OTP sent' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to send OTP', error: e.message });
  }
});

router.post('/send-invite', adminAuth, [
  body('email').isEmail().withMessage('Valid email is required'),
  body('firstName').optional().isString()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  const { email, firstName } = req.body;
  const name = firstName || 'there';
  const signupLink = process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/register` : 'http://localhost:3001/register';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
      <h2 style="color: #085464;">Welcome to ReclaimDAO</h2>
      <p>Hi ${name},</p>
      <p>Thank you for your interest in joining <strong>ReclaimDAO</strong>. We have reviewed your application and would like to invite you to join our platform.</p>
      <p>To complete your registration and gain access to the dashboard, please click the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${signupLink}" style="background-color: #085464; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Complete Registration</a>
      </div>

      <p style="font-size: 14px; color: #777;">If you did not submit this request, you can safely ignore this email.</p>
      <br />
      <hr style="border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 14px; color: #777;">Best regards,<br />The ReclaimDAO Team</p>
    </div>
  `;

  try {
    const { sendEmail } = require('../services/emailService');

    // Send invite in background
    sendEmail({
      email,
      subject: 'Complete your ReclaimDAO Registration',
      message: `Hi ${name}, Finish your registration at: ${signupLink}`,
      html
    }).then(info => {
      console.log(`[Background Invite] Success for ${email}: ${info.response}`);
    }).catch(error => {
      console.error(`[Background Invite] Error for ${email}:`, error);
    });

    res.json({
      success: true,
      message: 'Invitation email scheduled for delivery'
    });
  } catch (error) {
    console.error('Send invite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while scheduling invitation'
    });
  }
});


router.post('/change-password', adminAuth, [
  body('otp').isString().trim().notEmpty(),
  body('newPassword').isString().isLength({ min: 8 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  const { otp, newPassword } = req.body;
  const rec = await Settings.getSetting('ADMIN_PASSWORD_OTP');
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
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '..', '.env');
  try {
    const raw = fs.readFileSync(envPath, 'utf8');
    const lines = raw.split(/\r?\n/).map(l => {
      if (l.startsWith('ADMIN_PASSWORD=')) return 'ADMIN_PASSWORD=' + newPassword;
      return l;
    });
    fs.writeFileSync(envPath, lines.join('\n'));
  } catch { }
  const email = process.env.ADMIN_EMAIL;
  let admin = await User.findOne({ email }).select('+password');
  if (!admin) {
    admin = new User({ firstName: 'Admin', lastName: 'User', email, password: newPassword, role: 'admin', isActive: true });
    await admin.save();
  } else {
    admin.password = newPassword;
    await admin.save();
  }
  await Settings.setSetting('ADMIN_PASSWORD_OTP', { hash: '', expiresAt: 0 }, req.user.id, 'Admin password OTP cleared');
  res.json({ success: true, message: 'Password updated' });
});

router.post('/users/request-password-otp', adminAuth, [
  body('email').isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  const { email } = req.body;
  const code = (Math.floor(100000 + Math.random() * 900000)).toString();
  const hash = await bcrypt.hash(code, 12);
  const expiresAt = Date.now() + 10 * 60 * 1000;
  const targetUser = await User.findOne({ email });
  const firstName = targetUser ? targetUser.firstName : 'there';

  await Settings.setSetting(`USER_PASSWORD_OTP:${email}`, { hash, expiresAt }, req.user.id, 'User password OTP');

  try {
    const { sendOTPEmail } = require('../services/emailService');
    await sendOTPEmail({
      email,
      firstName,
      code,
      type: 'Password Security'
    });

    res.json({ success: true, message: 'OTP sent' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to send OTP', error: e.message });
  }
});

router.post('/users/change-password', adminAuth, [
  body('email').isEmail(),
  body('otp').isString().trim().notEmpty(),
  body('newPassword').isString().isLength({ min: 8 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  const { email, otp, newPassword } = req.body;
  const rec = await Settings.getSetting(`USER_PASSWORD_OTP:${email}`);
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
  let user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  user.password = newPassword;
  await user.save();
  await Settings.setSetting(`USER_PASSWORD_OTP:${email}`, { hash: '', expiresAt: 0 }, req.user.id, 'User password OTP cleared');
  res.json({ success: true, message: 'User password updated' });
});

router.delete('/purge/users', adminAuth, async (req, res) => {
  try {
    const includeAdmin = String(req.query.includeAdmin || '').toLowerCase() === 'true';
    const userFilter = includeAdmin ? {} : { _id: { $ne: req.user.id } };

    const usersResult = await User.deleteMany(userFilter);
    const contributionsResult = await Contribution.deleteMany({});

    const votes = await Vote.find({});
    let votesReset = 0;
    for (const v of votes) {
      v.submissions = new Map();
      v.totalVotes = 0;
      if (Array.isArray(v.options)) {
        v.options = v.options.map(o => ({ id: o.id, text: o.text, votes: 0 }));
      }
      await v.save();
      votesReset += 1;
    }

    const coinsResult = await Coin.updateMany({}, {
      $set: {
        'stats.totalContributions': 0,
        'stats.totalAmount': 0,
        'stats.totalPointsAwarded': 0,
        'stats.uniqueContributors': 0,
        'stats.averageContribution': 0,
        'stats.lastContributionAt': null
      }
    });

    res.json({
      success: true,
      message: 'All users and related data purged',
      data: {
        usersDeleted: usersResult.deletedCount || 0,
        contributionsDeleted: contributionsResult.deletedCount || 0,
        votesReset,
        coinsUpdated: coinsResult.modifiedCount || coinsResult.nModified || 0
      }
    });
  } catch (error) {
    console.error('Purge users error:', error);
    res.status(500).json({ success: false, message: 'Server error during purge' });
  }
});

// @route   GET /api/admin/articles/list
// @desc    Admin paginated articles list
router.get('/articles/list', adminAuth, adminArticleListQueryValidators, handleAdminArticleList);

// @route   GET /api/admin/audit-logs
// @desc    Admin audit logs
router.get('/audit-logs', adminAuth, (req, res) => {
  res.json({ success: true, logs: [], data: [] });
});

module.exports = router;
