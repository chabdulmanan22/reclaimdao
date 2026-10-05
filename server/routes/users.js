const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult, query } = require('express-validator');
const { readCollection, writeCollection } = require('../utils/localStore');


const User = require('../models/User');
const { auth, adminAuth, ownerOrAdmin } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

global.__UsersStreamClients = global.__UsersStreamClients || new Set();
global.__BroadcastThrottle = global.__BroadcastThrottle || Object.create(null);
global.__BroadcastMinInterval = global.__BroadcastMinInterval || 500;
global.__broadcastUsersUpdate = global.__broadcastUsersUpdate || function (payload) {
  const msg = payload || { type: 'users_updated' };
  const now = Date.now();
  const last = global.__BroadcastThrottle[msg.type] || 0;
  if (now - last < global.__BroadcastMinInterval) return;
  global.__BroadcastThrottle[msg.type] = now;
  try {
    for (const res of global.__UsersStreamClients) {
      res.write(`data: ${JSON.stringify(msg)}\n\n`);
    }
  } catch (_) { }
  try { global.__wsBroadcast && global.__wsBroadcast(msg); } catch (_) { }
};

const router = express.Router();

// @route   POST /api/users
// @desc    Create a new user (admin only)
// @access  Private/Admin
router.post('/', adminAuth, [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').optional().trim(),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('isVirtual').optional().isBoolean(),
  body('points').optional().isNumeric(),
  body('votingRights').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { firstName, lastName, email, password, isVirtual, points, votingRights } = req.body;

    // Generate email/password for virtual users if not provided
    let userEmail = email;
    let userPassword = password;

    if (isVirtual) {
      if (!userEmail) {
        userEmail = `virtual_${Date.now()}_${Math.floor(Math.random() * 1000)}@victim.dao`;
      }
      if (!userPassword) {
        userPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      }
    }

    if (!userEmail || !userPassword) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Check if user exists in DB or localStore
    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({ email: userEmail });
      } catch (dbErr) {
        console.warn('User DB check warning:', dbErr.message);
      }
    }
    const existingLocal = (readCollection('users') || []).find(u => u.email && u.email.toLowerCase() === String(userEmail).toLowerCase());
    if (user || existingLocal) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    if (mongoose.connection.readyState === 1) {
      try {
        user = new User({
          firstName,
          lastName,
          email: userEmail,
          password: userPassword,
          isVirtual: !!isVirtual,
          votingRights: votingRights !== undefined ? Number(votingRights) : 1,
          points: Number(points) || 0, 
          isActive: true
        });

        await user.save();

        if (points !== undefined && points > 0) {
          user.stats.votingPoints = Number(points) || 0;
          await user.save();
        }
      } catch (dbErr) {
        console.warn('User DB save error, fallback to localStore:', dbErr.message);
        user = null;
      }
    }

    const userId = user ? user._id : 'usr_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const localUserObj = {
      _id: userId,
      id: userId,
      firstName,
      lastName,
      email: userEmail,
      isVirtual: !!isVirtual,
      points: points || 0,
      votingRights: votingRights !== undefined ? votingRights : 1,
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const localUsers = readCollection('users');
    localUsers.unshift(localUserObj);
    writeCollection('users', localUsers);

    res.json({
      success: true,
      data: {
        user: {
          id: userId,
          firstName: firstName,
          lastName: lastName,
          email: userEmail,
          isVirtual: !!isVirtual,
          points: points || 0,
          votingRights: votingRights !== undefined ? votingRights : 1
        }
      }
    });

    try { global.__broadcastUsersUpdate({ type: 'user_created', id: userId }); } catch (_) { }

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', adminAuth, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 2000 })
    .withMessage('Limit must be between 1 and 2000'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),

  query('role')
    .optional()
    .isIn(['user', 'moderator', 'admin'])
    .withMessage('Invalid role'),

  query('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status'),

  query('type')
    .optional()
    .isIn(['real', 'virtual', 'all'])
    .withMessage('Invalid user type'),

  query('sortBy')
    .optional()
    .isIn(['firstName', 'lastName', 'email', 'points', 'votingRights', 'createdAt'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 20,
      search,
      role,
      status,
      type = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role && role !== 'all') {
      filter.role = role;
    } else {
      filter.role = { $ne: 'admin' };
      filter.email = { $nin: ['admin@reclaimdao.org', 'admin@example.com', 'admin@doa.com', 'support@reclaimdao.org', 'support@veritasaid.com'] };
    }
    if (status) filter.isActive = status === 'active';
    if (type === 'real') filter.isVirtual = { $ne: true };
    else if (type === 'virtual') filter.isVirtual = true;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let users = [];
    let total = 0;

    if (mongoose.connection.readyState === 1) {
      try {
        users = await User.find(filter)
          .select('-password')
          .populate('referredBy', 'firstName lastName')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit));
        total = await User.countDocuments(filter);
      } catch (dbErr) {
        console.warn('User.find error in GET /api/users:', dbErr.message);
      }
    }

    if (!users || users.length === 0) {
      let localUsers = readCollection('users');
      if (!role || role !== 'admin') {
        localUsers = localUsers.filter((u) => u.role !== 'admin' && u.email !== 'support@reclaimdao.org' && u.email !== 'support@veritasaid.com');
      }
      if (type === 'virtual') {
        localUsers = localUsers.filter((u) => u.isVirtual === true);
      } else if (type === 'real') {
        localUsers = localUsers.filter((u) => u.isVirtual !== true);
      }
      if (search) {
        const s = search.toLowerCase();
        localUsers = localUsers.filter(
          (u) =>
            (u.firstName && u.firstName.toLowerCase().includes(s)) ||
            (u.lastName && u.lastName.toLowerCase().includes(s)) ||
            (u.email && u.email.toLowerCase().includes(s))
        );
      }
      total = localUsers.length;
      users = localUsers.slice(skip, skip + parseInt(limit));
    }

    const totalPages = Math.ceil(total / parseInt(limit)) || 1;

    // Attach realStats & sync referral points for every user in the list
    users = await Promise.all(users.map(async (uDoc) => {
      const uObj = (typeof uDoc.toObject === 'function') ? uDoc.toObject() : { ...uDoc };
      try {
        if (typeof uDoc.calculateRealStats === 'function') {
          uObj.realStats = await uDoc.calculateRealStats();
        } else {
          const uidStr = String(uObj._id || uObj.id || '');
          const refCode = uObj.referralCode;
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
          uObj.realStats = {
            votingPoints: uObj.stats?.votingPoints || 0,
            contributionPoints: uObj.stats?.contributionPoints || 0,
            referralPoints: Math.max(uObj.stats?.referralPoints || 0, refPts),
            totalPoints: (uObj.stats?.votingPoints || 0) + (uObj.stats?.contributionPoints || 0) + Math.max(uObj.stats?.referralPoints || 0, refPts),
            referralCount: refCount
          };
        }

        if (uObj.realStats) {
          uObj.stats = uObj.stats || {};
          uObj.stats.votingPoints = Math.max(uObj.stats.votingPoints || 0, uObj.realStats.votingPoints);
          uObj.stats.contributionPoints = Math.max(uObj.stats.contributionPoints || 0, uObj.realStats.contributionPoints);
          uObj.stats.referralPoints = Math.max(uObj.stats.referralPoints || 0, uObj.realStats.referralPoints);
          uObj.points = Math.max(uObj.points || 0, uObj.realStats.totalPoints);
        }
      } catch (_) {}
      return uObj;
    }));

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

    try { global.__broadcastUsersUpdate({ type: 'users_fetched' }); } catch (_) { }

  } catch (error) {
    console.error('Get users error:', error);
    const localUsers = readCollection('users');
    res.json({
      success: true,
      data: {
        users: localUsers,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalUsers: localUsers.length,
          hasNextPage: false,
          hasPrevPage: false
        }
      }
    });
  }
});

// Helper to get unified ranked users across DB and localStore
async function getUnifiedRankedUsers() {
  let allUsers = [];
  if (mongoose.connection.readyState === 1) {
    try {
      allUsers = await User.find({
        isActive: true,
        role: { $ne: 'admin' },
        email: { $nin: ['support@veritasaid.com', 'support@reclaimdao.org'] }
      }).lean();
    } catch (dbErr) {
      console.warn('getUnifiedRankedUsers DB find error:', dbErr.message);
    }
  }

  const localList = readCollection('users') || [];
  localList.forEach(lu => {
    if (lu.isActive !== false && lu.role !== 'admin' && lu.email !== 'support@veritasaid.com' && lu.email !== 'support@reclaimdao.org') {
      const exists = allUsers.some(u =>
        String(u._id || u.id) === String(lu._id || lu.id) ||
        (u.email && lu.email && u.email.toLowerCase() === lu.email.toLowerCase())
      );
      if (!exists) {
        allUsers.push(lu);
      }
    }
  });

  const processed = allUsers.map(u => {
    const rawTotal = Number(u.points || 0);
    const offset = Number(u.overrides?.pointsOffset || 0);
    const effectiveTotal = Math.max(0, rawTotal + offset);
    const statsOffsets = u.overrides?.statsOffsets || {};

    const rawVoting = Number(u.stats?.votingPoints || 0);
    const rawContrib = Number(u.stats?.contributionPoints || 0);
    const rawReferral = Number(u.stats?.referralPoints || 0);

    return {
      _id: String(u._id || u.id || u.email),
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      points: effectiveTotal,
      stats: {
        votingPoints: Math.max(0, rawVoting + Number(statsOffsets.votingPoints || 0)),
        contributionPoints: Math.max(0, rawContrib + Number(statsOffsets.contributionPoints || 0)),
        referralPoints: Math.max(0, rawReferral + Number(statsOffsets.referralPoints || 0)),
        totalVotes: u.stats?.totalVotes || 0,
        totalContributions: u.stats?.totalContributions || 0,
      },
      isVirtual: !!u.isVirtual,
      createdAt: u.createdAt || new Date().toISOString(),
      lastLogin: u.lastLogin,
      overrides: u.overrides || {}
    };
  });

  // Sort strictly by points desc, createdAt asc, email asc
  processed.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    if (timeA !== timeB) {
      return timeA - timeB;
    }
    return (a.email || '').localeCompare(b.email || '');
  });

  // Assign ranks starting at 1 (or rankOverride if specified)
  return processed.map((u, i) => {
    const rank = (u.overrides?.rankOverride !== undefined && u.overrides?.rankOverride !== null)
      ? Number(u.overrides.rankOverride)
      : (i + 1);
    return {
      ...u,
      rank
    };
  });
}

// @route   GET /api/users/leaderboard
// @desc    Get user leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { page = 1, limit = 50, type = 'total' } = req.query;
    const limitNum = Math.min(parseInt(limit) || 50, 6000);
    const pageNum = parseInt(page) || 1;
    const skip = (pageNum - 1) * limitNum;

    const rankedUsers = await getUnifiedRankedUsers();
    const count = rankedUsers.length;
    const paginatedUsers = rankedUsers.slice(skip, skip + limitNum);

    let baseCount = 0;
    if (mongoose.connection.readyState === 1) {
      try {
        const Settings = require('../models/Settings');
        const b = await Settings.getSetting('BASE_USER_COUNT');
        if (b !== null && b !== undefined) baseCount = Number(b);
      } catch (_) {}
    }

    const baselineTotal = count + baseCount;
    const activeUsersBaseline = baselineTotal > 0 ? Math.floor(baselineTotal * 0.85) : 0;

    res.json({
      success: true,
      data: {
        users: paginatedUsers,
        totalUsers: baselineTotal,
        activeUsers: activeUsersBaseline,
        page: pageNum,
        totalPages: Math.ceil(count / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// @route   GET /api/users/:userId/referrals
// @desc    Get referrals for a user (self or admin)
// @access  Private
router.get('/:userId/referrals', ownerOrAdmin('userId'), [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('Limit must be between 1 and 200'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
], async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let userObj = null;
    if (mongoose.connection.readyState === 1) {
      try { userObj = await User.findById(userId); } catch (_) {}
    }
    const localUsers = readCollection('users') || [];
    if (!userObj) {
      userObj = localUsers.find(u => String(u._id || u.id) === String(userId));
    }
    const userRefCode = userObj?.referralCode;
    const selfEmailLower = String(userObj?.email || '').toLowerCase();
    const selfIdStr = String(userId);

    const referralsMap = new Map();

    if (mongoose.connection.readyState === 1) {
      try {
        const docs = await User.find({ 
          referredBy: userId,
          _id: { $ne: userId }
        })
          .select('firstName lastName email createdAt referralCode isActive')
          .sort({ createdAt: -1 });
        docs.forEach(u => {
          const uEmailLower = String(u.email || '').toLowerCase().trim();
          const uIdStr = String(u._id);
          if (uIdStr !== selfIdStr && uEmailLower !== selfEmailLower) {
            const key = uEmailLower || uIdStr;
            referralsMap.set(key, {
              id: u._id,
              firstName: u.firstName,
              lastName: u.lastName,
              email: u.email,
              referralCode: u.referralCode,
              createdAt: u.createdAt,
              status: u.isActive ? 'active' : 'inactive'
            });
          }
        });
      } catch (_) {}
    }

    localUsers.forEach(u => {
      const uIdStr = String(u._id || u.id || '');
      const uEmailLower = String(u.email || '').toLowerCase().trim();
      if (uIdStr !== selfIdStr && uEmailLower !== selfEmailLower) {
        if (String(u.referredBy || '') === selfIdStr || (userRefCode && u.referralCode === userRefCode && uIdStr !== selfIdStr)) {
          const key = uEmailLower || uIdStr;
          if (!referralsMap.has(key)) {
            referralsMap.set(key, {
              id: u._id || u.id,
              firstName: u.firstName,
              lastName: u.lastName,
              email: u.email,
              referralCode: u.referralCode,
              createdAt: u.createdAt,
              status: u.isActive ? 'active' : 'inactive'
            });
          }
        }
      }
    });

    if (userRefCode) {
      if (mongoose.connection.readyState === 1) {
        try {
          const JoinApplication = mongoose.model('JoinApplication');
          const dbApps = await JoinApplication.find({
            referralCode: userRefCode
          }).sort({ createdAt: -1 });
          dbApps.forEach(a => {
            const aEmailLower = String(a.email || '').toLowerCase().trim();
            const aIdStr = String(a._id || '');
            if (aEmailLower !== selfEmailLower && aEmailLower) {
              const key = aEmailLower || ('app_' + aIdStr);
              if (!referralsMap.has(key)) {
                referralsMap.set(key, {
                  id: a._id,
                  firstName: a.firstName,
                  lastName: a.lastName,
                  email: a.email,
                  referralCode: a.referralCode,
                  createdAt: a.createdAt,
                  status: a.status || 'registered'
                });
              }
            }
          });
        } catch (_) {}
      }

      const localApps = readCollection('applications') || [];
      localApps.forEach(a => {
        const aEmailLower = String(a.email || '').toLowerCase().trim();
        const aIdStr = String(a.id || a._id || '');
        if (aEmailLower !== selfEmailLower && a.referralCode === userRefCode && aEmailLower) {
          const key = aEmailLower || ('app_' + aIdStr);
          if (!referralsMap.has(key)) {
            referralsMap.set(key, {
              id: a.id || a._id || key,
              firstName: a.firstName,
              lastName: a.lastName,
              email: a.email,
              referralCode: a.referralCode,
              createdAt: a.createdAt,
              status: a.status || 'registered'
            });
          }
        }
      });
    }

    const allReferrals = Array.from(referralsMap.values());
    const total = allReferrals.length;
    const paginated = allReferrals.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        referrals: paginated,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.max(1, Math.ceil(total / parseInt(limit))),
          totalReferrals: total,
          hasNextPage: skip + parseInt(limit) < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

    try { global.__broadcastUsersUpdate({ type: 'user_referrals_fetched', id: userId }); } catch (_) { }
  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching referrals' });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics (admin only)
// @access  Private/Admin
router.get('/stats', adminAuth, async (req, res) => {
  try {
    let stats = null;

    if (mongoose.connection.readyState === 1) {
      try {
        stats = await User.getUserStats();
      } catch (dbErr) {
        console.warn('User.getUserStats db error:', dbErr.message);
      }
    }

    if (!stats || (!stats.realUsers && !stats.virtualUsers && !stats.totalUsers)) {
      const rawUsers = readCollection('users') || [];
      const localUsers = rawUsers.filter((u) => u.role !== 'admin' && u.email !== 'support@reclaimdao.org' && u.email !== 'support@veritasaid.com' && u.email !== 'admin@reclaimdao.org' && u.email !== 'admin@example.com' && u.email !== 'admin@doa.com');
      const active = localUsers.filter((u) => u.isActive !== false);
      const real = localUsers.filter((u) => !u.isVirtual);
      const virtual = localUsers.filter((u) => !!u.isVirtual);
      const points = localUsers.reduce((sum, u) => sum + (Number(u.points) || 0), 0);
      const votes = localUsers.reduce((sum, u) => sum + (Number(u.stats?.totalVotes) || Number(u.votingRights) || 0), 0);

      stats = {
        totalUsers: localUsers.length,
        activeUsers: active.length,
        realUsers: real.length || 0,
        virtualUsers: virtual.length || 0,
        totalPoints: points || 0,
        averagePoints: localUsers.length ? Math.round(points / localUsers.length) : 0,
        totalVotesSubmitted: votes || 0
      };
    }

    res.json({
      success: true,
      data: {
        stats
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    const rawUsers = readCollection('users') || [];
    const localUsers = rawUsers.filter((u) => u.role !== 'admin' && u.email !== 'support@veritasaid.com' && u.email !== 'support@reclaimdao.org' && u.email !== 'admin@reclaimdao.org');
    const active = localUsers.filter((u) => u.isActive !== false);
    const real = localUsers.filter((u) => !u.isVirtual);
    const virtual = localUsers.filter((u) => !!u.isVirtual);
    const points = localUsers.reduce((sum, u) => sum + (Number(u.points) || 0), 0);
    const votes = localUsers.reduce((sum, u) => sum + (Number(u.stats?.totalVotes) || Number(u.votingRights) || 0), 0);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers: localUsers.length,
          activeUsers: active.length,
          realUsers: real.length || 0,
          virtualUsers: virtual.length || 0,
          totalPoints: points || 0,
          averagePoints: localUsers.length ? Math.round(points / localUsers.length) : 0,
          totalVotesSubmitted: votes || 0
        }
      }
    });
  }
});


// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (own profile or admin)
router.get('/:id', ownerOrAdmin(), async (req, res) => {
  try {
    const { id } = req.params;
    let user = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        user = await User.findById(id).select('-password');
      } catch (_) {}
    }

    if (!user) {
      const localUsers = readCollection('users') || [];
      const found = localUsers.find(u => String(u._id || u.id) === String(id) || u.email === id);
      if (found) {
        user = { ...found };
        delete user.password;
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const obj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    const original = String(req.query.original || '').toLowerCase();
    const includeOverrides = !(original === 'true' || original === '1');
    if (includeOverrides && obj.overrides) {
      // 1. Voting Rights Offset
      if (typeof obj.overrides.votingRightsOffset === 'number') {
        obj.votingRights = Math.max(0, (obj.votingRights || 0) + obj.overrides.votingRightsOffset);
      } else if (typeof obj.overrides.votingRights === 'number') {
        obj.votingRights = obj.overrides.votingRights;
      }

      // 2. Stats Offsets
      obj.stats = obj.stats || {};
      const statsOffsets = obj.overrides.statsOffsets || {};
      const oStats = obj.overrides.stats || {};

      const rawVoting = typeof obj.stats.votingPoints === 'number' ? obj.stats.votingPoints : 0;
      const rawContrib = typeof obj.stats.contributionPoints === 'number' ? obj.stats.contributionPoints : 0;
      const rawReferral = typeof obj.stats.referralPoints === 'number' ? obj.stats.referralPoints : 0;

      if (typeof statsOffsets.votingPoints === 'number') {
        obj.stats.votingPoints = Math.max(0, rawVoting + statsOffsets.votingPoints);
      } else if (typeof oStats.votingPoints === 'number') {
        obj.stats.votingPoints = oStats.votingPoints;
      }

      if (typeof statsOffsets.contributionPoints === 'number') {
        obj.stats.contributionPoints = Math.max(0, rawContrib + statsOffsets.contributionPoints);
      } else if (typeof oStats.contributionPoints === 'number') {
        obj.stats.contributionPoints = oStats.contributionPoints;
      }

      if (typeof statsOffsets.referralPoints === 'number') {
        obj.stats.referralPoints = Math.max(0, rawReferral + statsOffsets.referralPoints);
      } else if (typeof oStats.referralPoints === 'number') {
        obj.stats.referralPoints = oStats.referralPoints;
      }

      // 3. Total Points Offset
      if (typeof obj.overrides.pointsOffset === 'number') {
        obj.points = Math.max(0, (obj.points || 0) + obj.overrides.pointsOffset);
      } else if (typeof obj.overrides.points === 'number') {
        obj.points = obj.overrides.points;
      }

      // Legacy other stats
      if (typeof oStats.totalVotes === 'number') obj.stats.totalVotes = oStats.totalVotes;
      if (typeof oStats.totalContributions === 'number') obj.stats.totalContributions = oStats.totalContributions;
      if (typeof oStats.contributionAmount === 'number') obj.stats.contributionAmount = oStats.contributionAmount;
    }

    // Always include real stats (unaffected by manipulation) for admin review
    try {
      if (typeof user.calculateRealStats === 'function') {
        obj.realStats = await user.calculateRealStats();
      } else {
        const uidStr = String(obj._id || obj.id || '');
        const refCode = obj.referralCode;
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
        obj.realStats = {
          votingPoints: obj.stats?.votingPoints || 0,
          contributionPoints: obj.stats?.contributionPoints || 0,
          referralPoints: Math.max(obj.stats?.referralPoints || 0, refPts),
          totalPoints: (obj.stats?.votingPoints || 0) + (obj.stats?.contributionPoints || 0) + Math.max(obj.stats?.referralPoints || 0, refPts),
          referralCount: refCount
        };
      }

      if (obj.realStats) {
        obj.stats = obj.stats || {};
        obj.stats.votingPoints = Math.max(obj.stats.votingPoints || 0, obj.realStats.votingPoints);
        obj.stats.contributionPoints = Math.max(obj.stats.contributionPoints || 0, obj.realStats.contributionPoints);
        obj.stats.referralPoints = Math.max(obj.stats.referralPoints || 0, obj.realStats.referralPoints);
        obj.points = Math.max(obj.points || 0, obj.realStats.totalPoints);
      }
    } catch (e) {
      console.error('Failed to calculate real stats:', e);
    }

    res.json({ success: true, data: { user: obj } });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
});

// @route   PUT /api/users/:id/overrides
// @desc    Set admin overrides for user stats/points (admin only)
// @access  Private/Admin
router.put('/:id/overrides', adminAuth, async (req, res) => {
  try {
    return res.status(410).json({ success: false, message: 'Overrides feature disabled' });
  } catch (error) {
    return res.status(410).json({ success: false, message: 'Overrides feature disabled' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (admin only)
// @access  Private/Admin
router.put('/:id', ownerOrAdmin(), [
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

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('username')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[a-zA-Z0-9_]{3,32}$/)
    .withMessage('Username must be 3-32 characters and contain only letters, numbers, and underscores'),



  body('votingRights')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Voting rights must be a non-negative integer'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters')
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

    const { id } = req.params;
    const updates = req.body;

    let user = null;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        user = await User.findById(id);
      } catch (_) {}
    }

    if (user) {
      if (updates.email && updates.email !== user.email) {
        const existingUser = await User.findOne({ email: updates.email });
        if (existingUser && String(existingUser._id) !== String(id)) {
          return res.status(400).json({
            success: false,
            message: 'Email is already taken'
          });
        }
      }
      if (updates.username && updates.username !== user.username) {
        const existingUserByUsername = await User.findOne({ username: updates.username });
        if (existingUserByUsername && String(existingUserByUsername._id) !== String(id)) {
          return res.status(400).json({
            success: false,
            message: 'Username is already taken'
          });
        }
      }

      Object.assign(user, updates);
      await user.save();
    }

    // Always update localStore fallback as well
    const localUsers = readCollection('users') || [];
    const idx = localUsers.findIndex(u => String(u._id || u.id) === String(id) || (user && u.email === user.email));
    let updatedLocalUser = null;
    if (idx !== -1) {
      localUsers[idx] = { ...localUsers[idx], ...updates, updatedAt: new Date().toISOString() };
      updatedLocalUser = localUsers[idx];
      writeCollection('users', localUsers);
    } else if (!user) {
      updatedLocalUser = {
        _id: id,
        id: id,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      localUsers.unshift(updatedLocalUser);
      writeCollection('users', localUsers);
    }

    const resultUser = user ? (typeof user.toObject === 'function' ? user.toObject() : user) : updatedLocalUser;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: resultUser
      }
    });

    try { global.__broadcastUsersUpdate({ type: 'user_updated', id }); } catch (_) { }

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
});

// @route   PUT /api/users/:id/dashboard-bulk
// @desc    Bulk update user dashboard data (points, losses, rank) (admin only)
// @access  Private/Admin
router.put('/:id/dashboard-bulk', adminAuth, [
  body('points').optional().isObject(),
  body('losses').optional().isObject(),
  body('rank').optional({ checkFalsy: true }).isNumeric(),
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const { id } = req.params;
    const { points, losses, rank, reason } = req.body;

    let user = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        user = await User.findById(id);
      } catch (dbErr) {
        console.warn('User.findById db error:', dbErr.message);
      }
    }

    if (user) {
      // 1. Handle Losses
      if (losses) {
        if (losses.verified !== undefined && losses.verified !== null) user.verifiedLoss = Number(losses.verified);
        if (losses.unverified !== undefined && losses.unverified !== null) user.unverifiedLoss = Number(losses.unverified);
        if (losses.restituted !== undefined && losses.restituted !== null) user.amountRestituted = Number(losses.restituted);
      }

      // 2. Handle Rank
      if (rank !== undefined) {
        user.overrides = user.overrides || {};
        user.overrides.rankOverride = (rank === null || rank === '') ? undefined : Number(rank);
        user.markModified('overrides');
      }

      // 3. Handle Points (Bulk)
      if (points) {
        user.pointsHistory = user.pointsHistory || [];
        const categories = ['total', 'voting', 'contributions', 'referral'];

        categories.forEach(cat => {
          const data = points[cat];
          if (data && !isNaN(parseFloat(data.amount)) && parseFloat(data.amount) > 0) {
            const amt = Math.abs(parseFloat(data.amount));
            const isAdd = data.type === 'add';
            const delta = isAdd ? amt : -amt;

            if (cat === 'total') {
              user.points = Math.max(0, (user.points || 0) + delta);
              user.pointsHistory.push({ category: 'total', amount: amt, type: data.type, reason: reason || 'Bulk update', performedBy: req.user?.id || 'admin' });
            } else {
              const field = cat === 'voting' ? 'votingPoints' : cat === 'contributions' ? 'contributionPoints' : 'referralPoints';
              user.stats = user.stats || {};
              user.stats[field] = Math.max(0, (user.stats[field] || 0) + delta);

              // Mirror change to total points
              user.points = Math.max(0, (user.points || 0) + delta);
              user.pointsHistory.push({ category: cat, amount: amt, type: data.type, reason: reason || 'Bulk update', performedBy: req.user?.id || 'admin' });
            }
          }
        });

        user.markModified('stats');
        user.markModified('pointsHistory');
      }

      await user.save();
    }

    // Always update localStore fallback as well
    const localUsers = readCollection('users') || [];
    const idx = localUsers.findIndex(u => String(u._id || u.id) === String(id) || u.email === (user ? user.email : ''));
    if (idx !== -1) {
      if (losses) {
        if (losses.verified !== undefined && losses.verified !== null) localUsers[idx].verifiedLoss = Number(losses.verified);
        if (losses.unverified !== undefined && losses.unverified !== null) localUsers[idx].unverifiedLoss = Number(losses.unverified);
        if (losses.restituted !== undefined && losses.restituted !== null) localUsers[idx].amountRestituted = Number(losses.restituted);
      }
      if (rank !== undefined) {
        localUsers[idx].rank = (rank === null || rank === '') ? undefined : Number(rank);
      }
      writeCollection('users', localUsers);
    } else if (!user) {
      const updatedUserObj = {
        _id: id,
        verifiedLoss: losses?.verified !== undefined ? Number(losses.verified) : 0,
        unverifiedLoss: losses?.unverified !== undefined ? Number(losses.unverified) : 0,
        amountRestituted: losses?.restituted !== undefined ? Number(losses.restituted) : 0,
        rank: rank !== undefined ? Number(rank) : undefined,
        updatedAt: new Date().toISOString()
      };
      localUsers.unshift(updatedUserObj);
      writeCollection('users', localUsers);
    }

    res.json({ success: true, message: 'Dashboard data updated successfully', data: { user: user || { id } } });
    try { global.__broadcastUsersUpdate({ type: 'user_updated', id }); } catch (_) { }
    try { global.__broadcastUsersUpdate({ type: 'user_points_updated', id }); } catch (_) { }
  } catch (error) {
    console.error('Bulk dashboard update error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// @route   PUT /api/users/:id/dashboard-data
// @desc    Update user dashboard data (admin only)
// @access  Private/Admin
router.put('/:id/dashboard-data', adminAuth, [
  body('verifiedLoss').optional().isNumeric(),
  body('unverifiedLoss').optional().isNumeric(),
  body('amountRestituted').optional().isNumeric(),
  body('rank').optional({ checkFalsy: true }).isNumeric()
], async (req, res) => {
  try {
    const { id } = req.params;
    const { verifiedLoss, unverifiedLoss, amountRestituted, rank } = req.body;

    let user = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        user = await User.findById(id);
      } catch (dbErr) {
        console.warn('User.findById db error:', dbErr.message);
      }
    }

    if (user) {
      if (verifiedLoss !== undefined && verifiedLoss !== null) user.verifiedLoss = Number(verifiedLoss);
      if (unverifiedLoss !== undefined && unverifiedLoss !== null) user.unverifiedLoss = Number(unverifiedLoss);
      if (amountRestituted !== undefined && amountRestituted !== null) user.amountRestituted = Number(amountRestituted);

      if (rank !== undefined) {
        user.overrides = user.overrides || {};
        user.overrides.rankOverride = (rank === null || rank === '') ? undefined : Number(rank);
        user.markModified('overrides');
      }

      await user.save();
    }

    const localUsers = readCollection('users') || [];
    const idx = localUsers.findIndex(u => String(u._id || u.id) === String(id) || u.email === (user ? user.email : ''));
    if (idx !== -1) {
      if (verifiedLoss !== undefined && verifiedLoss !== null) localUsers[idx].verifiedLoss = Number(verifiedLoss);
      if (unverifiedLoss !== undefined && unverifiedLoss !== null) localUsers[idx].unverifiedLoss = Number(unverifiedLoss);
      if (amountRestituted !== undefined && amountRestituted !== null) localUsers[idx].amountRestituted = Number(amountRestituted);
      if (rank !== undefined) localUsers[idx].rank = (rank === null || rank === '') ? undefined : Number(rank);
      writeCollection('users', localUsers);
    } else if (!user) {
      const updatedUserObj = {
        _id: id,
        verifiedLoss: verifiedLoss !== undefined ? Number(verifiedLoss) : 0,
        unverifiedLoss: unverifiedLoss !== undefined ? Number(unverifiedLoss) : 0,
        amountRestituted: amountRestituted !== undefined ? Number(amountRestituted) : 0,
        rank: rank !== undefined ? Number(rank) : undefined,
        updatedAt: new Date().toISOString()
      };
      localUsers.unshift(updatedUserObj);
      writeCollection('users', localUsers);
    }

    res.json({ success: true, message: 'Dashboard data updated', data: { user: user || { id } } });
    try { global.__broadcastUsersUpdate({ type: 'user_updated', id }); } catch (_) { }
  } catch (error) {
    console.error('Update dashboard data error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// @route   PUT /api/users/:id/points
// @desc    Add or deduct points from user (admin only)
// @access  Private/Admin
router.put('/:id/points', adminAuth, [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),

  body('type')
    .isIn(['add', 'deduct'])
    .withMessage('Type must be either add or deduct'),

  body('category')
    .optional()
    .isIn(['voting', 'contributions', 'referral', 'bonus', 'other'])
    .withMessage('Invalid category'),

  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Reason cannot exceed 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { amount, type, category = 'bonus', reason } = req.body;
    const pointsAmount = Math.abs(parseFloat(amount));
    const delta = type === 'add' ? pointsAmount : -pointsAmount;

    let user = null;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        user = await User.findById(id);
      } catch (_) {}
    }

    if (user) {
      if (['voting', 'contributions', 'referral'].includes(category)) {
        const field = category === 'voting' ? 'votingPoints'
          : category === 'contributions' ? 'contributionPoints'
            : 'referralPoints';

        user.stats = user.stats || {};
        user.stats[field] = Math.max(0, (user.stats[field] || 0) + delta);
        user.points = Math.max(0, (user.points || 0) + delta);
      } else {
        user.points = Math.max(0, (user.points || 0) + delta);
      }

      user.pointsHistory = user.pointsHistory || [];
      user.pointsHistory.push({
        category: ['voting', 'contributions', 'referral'].includes(category) ? category : 'total',
        amount: pointsAmount,
        type,
        reason: reason || 'Individual point adjustment',
        performedBy: req.user.id
      });

      user.markModified('stats');
      user.markModified('pointsHistory');
      await user.save();
    }

    // Always update localStore fallback as well
    const localUsers = readCollection('users') || [];
    const idx = localUsers.findIndex(u => String(u._id || u.id) === String(id) || (user && u.email === user.email));
    let updatedLocalUser = null;
    if (idx !== -1) {
      const uLoc = localUsers[idx];
      uLoc.stats = uLoc.stats || {};
      if (['voting', 'contributions', 'referral'].includes(category)) {
        const field = category === 'voting' ? 'votingPoints'
          : category === 'contributions' ? 'contributionPoints'
            : 'referralPoints';
        uLoc.stats[field] = Math.max(0, (uLoc.stats[field] || 0) + delta);
      }
      uLoc.points = Math.max(0, (uLoc.points || 0) + delta);
      uLoc.updatedAt = new Date().toISOString();
      updatedLocalUser = uLoc;
      writeCollection('users', localUsers);
    }

    if (!user && !updatedLocalUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updatedUserObj = user ? (typeof user.toObject === 'function' ? user.toObject() : user) : updatedLocalUser;

    res.json({
      success: true,
      message: `Points ${type === 'add' ? 'added' : 'deducted'} successfully`,
      data: {
        user: updatedUserObj,
        transaction: {
          amount: delta,
          category,
          reason,
          performedBy: req.user.id,
          timestamp: new Date()
        }
      }
    });

    try { global.__broadcastUsersUpdate({ type: 'user_points_updated', id }); } catch (_) { }

  } catch (error) {
    console.error('Update points error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating points'
    });
  }
});

// @route   PUT /api/users/:id/voting-rights
// @desc    Update user voting rights (admin only)
// @access  Private/Admin
router.put('/:id/voting-rights', adminAuth, [
  body('votingRights')
    .isInt({ min: 0 })
    .withMessage('Voting rights must be a non-negative integer'),

  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Reason cannot exceed 200 characters')
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

    const { id } = req.params;
    const { votingRights, reason } = req.body;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update voting rights via overrides only (do not change base real data)
    const previousRights = user.votingRights;
    try {
      user.overrides = user.overrides || {};
      // Calculate offset: Desired = Base + Offset => Offset = Desired - Base
      user.overrides.votingRightsOffset = votingRights - user.votingRights;

      // Clear absolute override if present
      if (user.overrides.votingRights !== undefined) user.overrides.votingRights = undefined;
    } catch (_) { }
    user.markModified('overrides');
    await user.save();

    res.json({
      success: true,
      message: 'Voting rights updated successfully',
      data: {
        user: await User.findById(id).select('-password'),
        change: {
          from: previousRights,
          to: votingRights,
          reason,
          performedBy: req.user.id,
          timestamp: new Date()
        }
      }
    });

    try { global.__broadcastUsersUpdate({ type: 'user_voting_updated', id }); } catch (_) { }
    try { global.__broadcastUsersUpdate({ type: 'user_overrides_updated', id }); } catch (_) { }

  } catch (error) {
    console.error('Update voting rights error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating voting rights'
    });
  }
});

// @route   PUT /api/users/:id/status
// @desc    Activate/deactivate user (admin only)
// @access  Private/Admin
router.put('/:id/status', ownerOrAdmin(), [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be boolean'),

  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Reason cannot exceed 200 characters')
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

    const { id } = req.params;
    const { isActive, reason } = req.body;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (id === req.user.id && !isActive) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    // Update status
    const previousStatus = user.isActive;
    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: await User.findById(id).select('-password'),
        change: {
          from: previousStatus,
          to: isActive,
          reason,
          performedBy: req.user.id,
          timestamp: new Date()
        }
      }
    });

    try { global.__broadcastUsersUpdate({ type: 'user_status_updated', id }); } catch (_) { }

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user status'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    let user = null;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        user = await User.findById(id);
      } catch (_) {}
    }

    const localUsers = readCollection('users') || [];
    const localIdx = localUsers.findIndex(u => String(u._id || u.id) === String(id) || (user && u.email === user.email));

    if (!user && localIdx === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    if (user) {
      await User.findByIdAndDelete(user._id);
    }

    let deletedEmail = user ? user.email : '';
    let deletedName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';

    if (localIdx !== -1) {
      if (!deletedEmail) deletedEmail = localUsers[localIdx].email;
      if (!deletedName) deletedName = localUsers[localIdx].fullName || localUsers[localIdx].firstName || 'User';
      localUsers.splice(localIdx, 1);
      writeCollection('users', localUsers);
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: {
        deletedUser: {
          id: id,
          email: deletedEmail,
          name: deletedName
        },
        deletedBy: req.user.id,
        deletedAt: new Date()
      }
    });

    try { global.__broadcastUsersUpdate({ type: 'user_deleted', id }); } catch (_) { }

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
});

router.get('/stream', async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(401).end();
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_) {
    return res.status(401).end();
  }
  const role = payload?.user?.role;
  if (role !== 'admin') return res.status(403).end();
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();
  global.__UsersStreamClients.add(res);
  res.write('data: {"type":"connected"}\n\n');
  req.on('close', () => {
    try { global.__UsersStreamClients.delete(res); } catch (_) { }
  });
});

module.exports = router;
module.exports.getUnifiedRankedUsers = getUnifiedRankedUsers;
