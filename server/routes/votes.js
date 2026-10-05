const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult, query } = require('express-validator');
const { readCollection, writeCollection } = require('../utils/localStore');

const { auth, adminAuth, optionalAuth } = require('../middleware/auth');
const Vote = require('../models/Vote');
const User = require('../models/User');
const { getTransporter } = require('../services/emailService');

const nodemailer = require('nodemailer');

const mkTransporter = async () => getTransporter();

// Helper function to send vote notifications with chunking
const sendVoteNotifications = async (vote) => {
  try {
    const voteIdStr = vote._id || vote.id;
    console.log(`[Vote Notification] Starting process for vote: ${voteIdStr}`);

    // 1. Dashboard Notification (via WebSocket broadcast)
    if (global.__broadcastUsersUpdate) {
      global.__broadcastUsersUpdate({
        type: 'vote_created_notification',
        vote: { id: voteIdStr, title: vote.title, startTime: vote.startTime, endTime: vote.endTime }
      });
    }

    // 2. Collect emails from DB, LocalStore users, and registered applicants
    const targetMap = new Map();
    if (mongoose.connection.readyState === 1) {
      try {
        const users = await User.find({}).select('email firstName role isVirtual').lean();
        users.forEach(u => {
          const em = String(u.email || '').trim();
          if (em && !em.includes('@victim.dao') && u.role !== 'admin' && !u.isVirtual) {
            targetMap.set(em.toLowerCase(), { email: em, firstName: u.firstName || 'Member' });
          }
        });
      } catch (dbErr) {
        console.warn('[Vote Notification] DB user query notice:', dbErr.message);
      }
    }

    try {
      const localUsersList = readCollection('users') || [];
      localUsersList.forEach(u => {
        const em = String(u.email || '').trim();
        if (em && !em.includes('@victim.dao') && u.role !== 'admin' && !u.isVirtual) {
          const norm = em.toLowerCase();
          if (!targetMap.has(norm)) {
            targetMap.set(norm, { email: em, firstName: u.firstName || 'Member' });
          }
        }
      });
    } catch (_) {}

    try {
      const localApps = readCollection('applications') || [];
      localApps.forEach(a => {
        const em = String(a.email || '').trim();
        if (em && !em.includes('@victim.dao') && (a.status === 'registered' || a.hasAccount || a.status === 'accepted')) {
          const norm = em.toLowerCase();
          if (!targetMap.has(norm)) {
            targetMap.set(norm, { email: em, firstName: a.firstName || 'Member' });
          }
        }
      });
    } catch (_) {}

    const targetList = Array.from(targetMap.values());
    console.log(`[Vote Notification] Found ${targetList.length} users targeted for notification`);

    const { sendVoteAnnouncementEmail } = require('../services/emailService');

    // Dispatch emails to all targeted users
    const results = await Promise.allSettled(targetList.map(user =>
      sendVoteAnnouncementEmail({
        email: user.email,
        firstName: user.firstName,
        voteTitle: vote.title,
        voteId: voteIdStr
      })
    ));

    let successCount = 0;
    let failCount = 0;

    results.forEach((res, idx) => {
      if (res.status === 'fulfilled') {
        successCount++;
      } else {
        failCount++;
        const email = targetList[idx]?.email;
        console.error(`[Vote Notification] Failed for ${email}:`, res.reason);
      }
    });

    console.log(`[Vote Notification] Complete. Success: ${successCount}, Failed: ${failCount}`);
  } catch (error) {
    console.error('[Vote Notification] Critical error in notification cycle:', error);
  }
};

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'OK', route: 'votes' });
});

router.get('/', optionalAuth, [
  query('status').optional().isIn(['draft', 'active', 'paused', 'completed']),
  query('limit').optional().isInt({ min: 1, max: 200 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    const { status, limit = 200 } = req.query;
    const filter = {};
    const userRole = (req.user && req.user.role) ? req.user.role : 'user';

    if (status) {
      filter.status = status;
    }
    if (userRole !== 'admin') {
      filter.status = 'active';
    }

    let votes = [];
    if (mongoose.connection.readyState === 1) {
      try {
        votes = await Vote.find(filter).sort({ createdAt: -1 }).limit(parseInt(limit));
      } catch (dbErr) {
        console.warn('Vote.find db error:', dbErr.message);
      }
    }

    const fileVotes = readCollection('votes') || [];
    if (!global.inMemoryVotes) {
      global.inMemoryVotes = fileVotes;
    } else {
      fileVotes.forEach(fv => {
        const idStr = String(fv._id || fv.id);
        const exists = global.inMemoryVotes.some(mv => String(mv._id || mv.id) === idStr);
        if (!exists) global.inMemoryVotes.push(fv);
      });
    }

    const dbVoteObjs = votes.map(v => (typeof v.toObject === 'function' ? v.toObject() : v));
    const memoryVotes = (global.inMemoryVotes || []).filter(v => {
      if (userRole !== 'admin' && v.status !== 'active') return false;
      if (status && v.status !== status) return false;
      return true;
    });

    const voteMap = new Map();
    [...memoryVotes, ...dbVoteObjs].forEach(v => {
      const vid = String(v._id || v.id);
      if (vid) voteMap.set(vid, v);
    });
    const allVotes = Array.from(voteMap.values());

    // Convert submissions Map to object for JSON serialization
    const votesWithSubmissions = allVotes.map(voteObj => {
      const vObj = { ...voteObj };
      if (vObj.submissions instanceof Map) {
        vObj.submissions = Object.fromEntries(vObj.submissions);
      }
      if (vObj.overrides instanceof Map) {
        vObj.overrides = Object.fromEntries(vObj.overrides);
      }
      if (vObj._id && !vObj.id) {
        vObj.id = vObj._id.toString();
      }

      if (req.user) {
        const userIdStr = String(req.user.id);
        const userEmail = req.user.email;
        const userIds = [userIdStr, userEmail].filter(Boolean);
        const overridesMap = vObj.overrides || {};
        let offset = 0;
        for (const uid of userIds) {
          if (overridesMap[uid] !== undefined) {
            offset = Number(overridesMap[uid]);
            break;
          }
        }
        const base = Number(vObj.maxVotesPerUser) || 1;
        const total = Math.max(0, base + offset);

        const submissionsMap = vObj.submissions || {};
        let used = 0;
        const seen = new Set();
        for (const uid of userIds) {
          if (seen.has(uid)) continue;
          seen.add(uid);
          used += Number(submissionsMap[uid] || 0);
        }
        vObj.myVotingRights = {
          total,
          used,
          remaining: Math.max(0, total - used)
        };
      }

      return vObj;
    });
    res.json({ success: true, data: { votes: votesWithSubmissions } });
  } catch (error) {
    console.error('Get votes error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching votes' });
  }
});

router.get('/:id/voters', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let vote = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        vote = await Vote.findById(id).populate('voterDetails.userId', 'firstName lastName email');
      } catch (dbErr) {}
    }

    const localUsers = readCollection('users') || [];

    if (!vote && global.inMemoryVotes) {
      const memVote = global.inMemoryVotes.find(v => String(v._id || v.id) === String(id));
      if (memVote) vote = memVote;
    }

    if (!vote) {
      const fileVotes = readCollection('votes') || [];
      vote = fileVotes.find(v => String(v._id || v.id) === String(id));
    }

    if (!vote) return res.status(404).json({ success: false, message: 'Vote not found' });

    let voters = [];

    if (Array.isArray(vote.voterDetails) && vote.voterDetails.length > 0) {
      voters = vote.voterDetails.map(detail => {
        const uObj = (typeof detail.userId === 'object' && detail.userId !== null) ? detail.userId : localUsers.find(u => String(u._id || u.id) === String(detail.userId));
        const option = (vote.options || []).find(o => Number(o.id) === Number(detail.optionId));
        return {
          userId: uObj ? (uObj._id || uObj.id) : detail.userId,
          fullName: uObj ? (uObj.fullName || `${uObj.firstName || ''} ${uObj.lastName || ''}`.trim()) : 'Voter User',
          email: uObj ? uObj.email : 'N/A',
          optionId: detail.optionId,
          optionText: option ? option.text : `Option #${detail.optionId}`,
          votedAt: detail.votedAt || new Date().toISOString()
        };
      });
    } else if (vote.submissions && typeof vote.submissions === 'object') {
      const subObj = vote.submissions instanceof Map ? Object.fromEntries(vote.submissions) : vote.submissions;
      Object.entries(subObj).forEach(([voterKey, count]) => {
        if (Number(count) > 0) {
          const uObj = localUsers.find(u => String(u._id || u.id) === String(voterKey) || u.email === voterKey);
          voters.push({
            userId: uObj ? (uObj._id || uObj.id) : voterKey,
            fullName: uObj ? (uObj.fullName || `${uObj.firstName || ''} ${uObj.lastName || ''}`.trim()) : (voterKey.includes('@') ? voterKey.split('@')[0] : 'Voter User'),
            email: uObj ? uObj.email : (voterKey.includes('@') ? voterKey : 'N/A'),
            optionId: 1,
            optionText: vote.options?.[0]?.text || 'Submitted Vote',
            votedAt: vote.updatedAt || vote.createdAt || new Date().toISOString()
          });
        }
      });
    }

    res.json({ success: true, data: { voters: voters.reverse() } });
  } catch (error) {
    console.error('Get vote voters error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching voters' });
  }
});

router.get('/user/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const votes = await Vote.find({ 'voterDetails.userId': userId });

    const history = [];
    votes.forEach(vote => {
      const details = vote.voterDetails.filter(d => d.userId.toString() === userId);
      details.forEach(d => {
        const option = vote.options.find(o => o.id === d.optionId);
        history.push({
          voteId: vote._id,
          voteTitle: vote.title,
          optionId: d.optionId,
          optionText: option ? option.text : 'Unknown Option',
          votedAt: d.votedAt
        });
      });
    });

    res.json({ success: true, data: { history: history.sort((a, b) => new Date(b.votedAt) - new Date(a.votedAt)) } });
  } catch (error) {
    console.error('Get user vote history error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', adminAuth, [
  body('title').isString().trim().notEmpty(),
  body('description').optional().isString(),
  body('options').isArray({ min: 2 }),
  body('pointsReward').optional().isNumeric(),
  body('maxVotesPerUser').optional().isInt({ min: 1 }),
  body('durationHours').optional().isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    const { title, description = '', options = [], pointsReward = 0, maxVotesPerUser = 1, durationHours, isProgressive = false } = req.body;

    const mappedOptions = options.map((opt, idx) => {
      if (typeof opt === 'object' && opt.text) {
        return {
          id: idx + 1,
          text: String(opt.text).trim(),
          votes: 0,
          votesOffset: Number(opt.votesOffset) || 0,
          targetVotes: Number(opt.targetVotes) || 0
        };
      }
      return { id: idx + 1, text: String(opt).trim(), votes: 0, votesOffset: 0, targetVotes: 0 };
    });

    const createdBy = (req.user && req.user.id && mongoose.Types.ObjectId.isValid(req.user.id)) ? req.user.id : null;
    let voteObj = null;

    if (mongoose.connection.readyState === 1) {
      try {
        const vote = new Vote({
          title,
          description,
          options: mappedOptions,
          isProgressive: !!isProgressive,
          pointsReward: Number(pointsReward) || 0,
          maxVotesPerUser: Number(maxVotesPerUser) || 1,
          status: 'draft',
          createdBy
        });
        await vote.save();
        if (durationHours) {
          await vote.start(durationHours);
        }
        const fresh = await Vote.findById(vote._id);
        if (fresh) {
          voteObj = fresh.toObject();
          if (voteObj.submissions instanceof Map) voteObj.submissions = Object.fromEntries(voteObj.submissions);
          if (voteObj.overrides instanceof Map) voteObj.overrides = Object.fromEntries(voteObj.overrides);
        }
      } catch (dbErr) {
        console.warn('Vote DB save warning:', dbErr.message);
      }
    }

    if (!voteObj) {
      const now = new Date();
      const voteId = new mongoose.Types.ObjectId().toString();
      const durationMs = durationHours ? Math.max(1, Number(durationHours)) * 3600000 : null;
      voteObj = {
        _id: voteId,
        id: voteId,
        title,
        description,
        options: mappedOptions,
        isProgressive: !!isProgressive,
        pointsReward: Number(pointsReward) || 0,
        maxVotesPerUser: Number(maxVotesPerUser) || 1,
        status: durationHours ? 'active' : 'draft',
        startTime: durationHours ? now : null,
        endTime: durationHours ? new Date(now.getTime() + durationMs) : null,
        totalVotes: 0,
        submissions: {},
        overrides: {},
        voterDetails: [],
        createdBy,
        createdAt: now,
        updatedAt: now
      };
      if (!global.inMemoryVotes) global.inMemoryVotes = readCollection('votes') || [];
      global.inMemoryVotes.unshift(voteObj);
      writeCollection('votes', global.inMemoryVotes);
    } else {
      if (!global.inMemoryVotes) global.inMemoryVotes = readCollection('votes') || [];
      const existingIdx = global.inMemoryVotes.findIndex(v => String(v._id || v.id) === String(voteObj._id || voteObj.id));
      if (existingIdx !== -1) global.inMemoryVotes[existingIdx] = voteObj;
      else global.inMemoryVotes.unshift(voteObj);
      writeCollection('votes', global.inMemoryVotes);
    }

    try { global.__broadcastUsersUpdate && global.__broadcastUsersUpdate({ type: 'vote_created', id: voteObj._id }); } catch (_) { }
    if (voteObj.status === 'active') {
      try { global.__broadcastUsersUpdate && global.__broadcastUsersUpdate({ type: 'vote_started', id: voteObj._id }); } catch (_) { }
    }

    // Always dispatch vote announcement emails to all registered users upon vote creation
    try {
      await sendVoteNotifications(voteObj);
    } catch (err) {
      console.error('[Vote Notification] Error during vote creation notification:', err);
    }

    res.status(201).json({ success: true, message: voteObj.status === 'active' ? 'Vote created and started' : 'Vote created', data: { vote: voteObj } });
  } catch (error) {
    console.error('Create vote error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating vote' });
  }
});

// @route   PUT /api/votes/:id
// @desc    Update a vote (admin only)
// @access  Private/Admin
router.put('/:id', adminAuth, [
  body('title').optional().isString().trim(),
  body('description').optional().isString(),
  body('options').optional().isArray(),
  body('pointsReward').optional().isNumeric(),
  body('maxVotesPerUser').optional().isInt({ min: 1 }),
  body('isProgressive').optional().isBoolean(),
  body('durationHours').optional().isNumeric()
], async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, options, pointsReward, maxVotesPerUser, isProgressive, durationHours } = req.body;
    let voteObj = null;

    if (mongoose.connection.readyState === 1) {
      try {
        const vote = await Vote.findById(id);
        if (vote) {
          if (title) vote.title = title;
          if (description !== undefined) vote.description = description;
          if (pointsReward !== undefined) vote.pointsReward = Number(pointsReward);
          if (maxVotesPerUser !== undefined) vote.maxVotesPerUser = Number(maxVotesPerUser);
          if (isProgressive !== undefined) vote.isProgressive = !!isProgressive;
          if (options && Array.isArray(options)) {
            vote.options = options.map((opt, idx) => ({
              id: opt.id || idx + 1,
              text: String(opt.text || '').trim(),
              votes: Number(opt.votes) || 0,
              votesOffset: Number(opt.votesOffset) || 0,
              targetVotes: Number(opt.targetVotes) || 0
            }));
          }
          await vote.save();
          voteObj = typeof vote.toObject === 'function' ? vote.toObject() : vote;
        }
      } catch (dbErr) {}
    }

    if (!voteObj && global.inMemoryVotes) {
      const idx = global.inMemoryVotes.findIndex(v => String(v._id || v.id) === String(id));
      if (idx !== -1) {
        if (title) global.inMemoryVotes[idx].title = title;
        if (description !== undefined) global.inMemoryVotes[idx].description = description;
        if (pointsReward !== undefined) global.inMemoryVotes[idx].pointsReward = Number(pointsReward);
        if (maxVotesPerUser !== undefined) global.inMemoryVotes[idx].maxVotesPerUser = Number(maxVotesPerUser);
        if (isProgressive !== undefined) global.inMemoryVotes[idx].isProgressive = !!isProgressive;
        if (options && Array.isArray(options)) {
          global.inMemoryVotes[idx].options = options.map((opt, i) => ({
            id: opt.id || i + 1,
            text: String(opt.text || '').trim(),
            votes: Number(opt.votes) || 0,
            votesOffset: Number(opt.votesOffset) || 0,
            targetVotes: Number(opt.targetVotes) || 0
          }));
        }
        voteObj = global.inMemoryVotes[idx];
      }
    }

    if (!voteObj) return res.status(404).json({ success: false, message: 'Vote not found' });

    if (voteObj.submissions instanceof Map) voteObj.submissions = Object.fromEntries(voteObj.submissions);
    if (voteObj.overrides instanceof Map) voteObj.overrides = Object.fromEntries(voteObj.overrides);
    if (voteObj._id && !voteObj.id) voteObj.id = voteObj._id.toString();

    try { global.__broadcastUsersUpdate && global.__broadcastUsersUpdate({ type: 'vote_updated', id: voteObj.id, voteId: voteObj.id }); } catch (_) { }

    res.json({ success: true, message: 'Vote updated', data: { vote: voteObj } });
  } catch (error) {
    console.error('Update vote error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating vote' });
  }
});

router.put('/:id/start', adminAuth, [
  body('durationHours').optional().isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    const { id } = req.params;
    const { durationHours = 24 } = req.body;
    let voteObj = null;

    if (mongoose.connection.readyState === 1) {
      try {
        const vote = await Vote.findById(id);
        if (vote) {
          await vote.start(durationHours);
          const updatedVote = await Vote.findById(id);
          if (updatedVote) {
            voteObj = typeof updatedVote.toObject === 'function' ? updatedVote.toObject() : updatedVote;
          }
        }
      } catch (dbErr) {}
    }

    if (!voteObj && global.inMemoryVotes) {
      const idx = global.inMemoryVotes.findIndex(v => String(v._id || v.id) === String(id));
      if (idx !== -1) {
        const now = new Date();
        const durationMs = Math.max(1, Number(durationHours)) * 3600000;
        global.inMemoryVotes[idx].status = 'active';
        global.inMemoryVotes[idx].startTime = now;
        global.inMemoryVotes[idx].endTime = new Date(now.getTime() + durationMs);
        voteObj = global.inMemoryVotes[idx];
      }
    }

    if (!voteObj) return res.status(404).json({ success: false, message: 'Vote not found' });

    if (voteObj.submissions instanceof Map) voteObj.submissions = Object.fromEntries(voteObj.submissions);
    if (voteObj.overrides instanceof Map) voteObj.overrides = Object.fromEntries(voteObj.overrides);
    if (voteObj._id && !voteObj.id) voteObj.id = voteObj._id.toString();

    try { global.__broadcastUsersUpdate && global.__broadcastUsersUpdate({ type: 'vote_started', id: voteObj.id, voteId: voteObj.id }); } catch (_) { }

    try {
      await sendVoteNotifications(voteObj);
    } catch (err) {
      console.error('[Vote Notification] Error in start vote notification:', err);
    }

    res.json({ success: true, message: 'Vote started', data: { vote: voteObj } });
  } catch (error) {
    console.error('Start vote error:', error);
    res.status(500).json({ success: false, message: 'Server error while starting vote' });
  }
});

router.put('/:id/pause', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let voteObj = null;

    if (mongoose.connection.readyState === 1) {
      try {
        const vote = await Vote.findById(id);
        if (vote) {
          await vote.pause();
          const updatedVote = await Vote.findById(id);
          if (updatedVote) voteObj = typeof updatedVote.toObject === 'function' ? updatedVote.toObject() : updatedVote;
        }
      } catch (dbErr) {}
    }

    if (!voteObj && global.inMemoryVotes) {
      const idx = global.inMemoryVotes.findIndex(v => String(v._id || v.id) === String(id));
      if (idx !== -1) {
        global.inMemoryVotes[idx].status = 'paused';
        voteObj = global.inMemoryVotes[idx];
      }
    }

    if (!voteObj) return res.status(404).json({ success: false, message: 'Vote not found' });

    if (voteObj.submissions instanceof Map) voteObj.submissions = Object.fromEntries(voteObj.submissions);
    if (voteObj.overrides instanceof Map) voteObj.overrides = Object.fromEntries(voteObj.overrides);
    if (voteObj._id && !voteObj.id) voteObj.id = voteObj._id.toString();

    try { global.__broadcastUsersUpdate && global.__broadcastUsersUpdate({ type: 'vote_paused', id: voteObj.id, voteId: voteObj.id }); } catch (_) { }
    res.json({ success: true, message: 'Vote paused', data: { vote: voteObj } });
  } catch (error) {
    console.error('Pause vote error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error while pausing vote' });
  }
});

router.put('/:id/resume', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let voteObj = null;

    if (mongoose.connection.readyState === 1) {
      try {
        const vote = await Vote.findById(id);
        if (vote) {
          await vote.resume();
          const updatedVote = await Vote.findById(id);
          if (updatedVote) voteObj = typeof updatedVote.toObject === 'function' ? updatedVote.toObject() : updatedVote;
        }
      } catch (dbErr) {}
    }

    if (!voteObj && global.inMemoryVotes) {
      const idx = global.inMemoryVotes.findIndex(v => String(v._id || v.id) === String(id));
      if (idx !== -1) {
        global.inMemoryVotes[idx].status = 'active';
        voteObj = global.inMemoryVotes[idx];
      }
    }

    if (!voteObj) return res.status(404).json({ success: false, message: 'Vote not found' });

    if (voteObj.submissions instanceof Map) voteObj.submissions = Object.fromEntries(voteObj.submissions);
    if (voteObj.overrides instanceof Map) voteObj.overrides = Object.fromEntries(voteObj.overrides);
    if (voteObj._id && !voteObj.id) voteObj.id = voteObj._id.toString();

    try { global.__broadcastUsersUpdate && global.__broadcastUsersUpdate({ type: 'vote_resumed', id: voteObj.id, voteId: voteObj.id }); } catch (_) { }
    res.json({ success: true, message: 'Vote resumed', data: { vote: voteObj } });
  } catch (error) {
    console.error('Resume vote error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error while resuming vote' });
  }
});

router.put('/:id/complete', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid vote ID' });
    }
    const vote = await Vote.findById(id);
    if (!vote) {
      return res.status(404).json({ success: false, message: 'Vote not found' });
    }
    await vote.complete();
    // Reload vote to get fresh data
    const updatedVote = await Vote.findById(id);
    if (!updatedVote) {
      return res.status(404).json({ success: false, message: 'Vote not found after update' });
    }
    // Convert submissions Map to object for JSON serialization
    const voteObj = updatedVote.toObject();
    if (voteObj.submissions instanceof Map) {
      voteObj.submissions = Object.fromEntries(voteObj.submissions);
    }
    if (voteObj.overrides instanceof Map) {
      voteObj.overrides = Object.fromEntries(voteObj.overrides);
    }
    try { global.__broadcastUsersUpdate && global.__broadcastUsersUpdate({ type: 'vote_completed', id: vote._id }); } catch (_) { }
    res.json({ success: true, message: 'Vote completed', data: { vote: voteObj } });
  } catch (error) {
    console.error('Complete vote error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error while completing vote' });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let deleted = false;

    if (mongoose.connection.readyState === 1) {
      try {
        const vote = await Vote.findById(id);
        if (vote) {
          await Vote.findByIdAndDelete(id);
          deleted = true;
        }
      } catch (dbErr) {}
    }

    if (!global.inMemoryVotes) {
      global.inMemoryVotes = readCollection('votes') || [];
    }
    const idx = global.inMemoryVotes.findIndex(v => String(v._id || v.id) === String(id));
    if (idx !== -1) {
      global.inMemoryVotes.splice(idx, 1);
      writeCollection('votes', global.inMemoryVotes);
      deleted = true;
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Vote not found' });
    }

    try { global.__broadcastUsersUpdate && global.__broadcastUsersUpdate({ type: 'vote_deleted', id }); } catch (_) { }
    res.json({ success: true, message: 'Vote deleted', data: { id } });
  } catch (error) {
    console.error('Delete vote error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error while deleting vote' });
  }
});

router.post('/:id/submit', auth, [
  body('optionId').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    const { id } = req.params;
    const { optionId } = req.body;

    let vote = null;
    let voter = null;

    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        try { vote = await Vote.findById(id); } catch (_) {}
      }
      if (req.user?.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
        try { voter = await User.findById(req.user.id); } catch (_) {}
      }
    }

    if (!voter) {
      const localUsers = readCollection('users') || [];
      voter = localUsers.find(u => String(u._id || u.id) === String(req.user?.id) || u.email === req.user?.email);
    }

    if (!voter) {
      voter = { _id: req.user?.id || 'user_1', email: req.user?.email, isActive: true, verifiedLoss: 5000 };
    }

    if (voter.isActive === false) {
      return res.status(403).json({ success: false, message: 'User is disabled and cannot vote' });
    }

    // Helper to award points to user (both DB and localStore)
    const awardPoints = async (pts) => {
      const reward = Math.max(1, Number(pts) || 10);
      if (voter && typeof voter.addCategoryPoints === 'function') {
        try {
          await voter.addCategoryPoints(reward, 'voting');
        } catch (_) {}
      } else {
        const localUsers = readCollection('users') || [];
        const uIdx = localUsers.findIndex(u => String(u._id || u.id) === String(req.user.id) || u.email === req.user.email);
        if (uIdx !== -1) {
          localUsers[uIdx].points = (localUsers[uIdx].points || 0) + reward;
          localUsers[uIdx].stats = localUsers[uIdx].stats || {};
          localUsers[uIdx].stats.votingPoints = (localUsers[uIdx].stats.votingPoints || 0) + reward;
          localUsers[uIdx].stats.totalVotes = (localUsers[uIdx].stats.totalVotes || 0) + 1;
          writeCollection('users', localUsers);
        }
      }
      try { global.__broadcastUsersUpdate && global.__broadcastUsersUpdate({ type: 'user_points_updated', id: req.user.id }); } catch (_) { }
    };

    // Handle in-memory vote if DB vote not found
    if (!vote && global.inMemoryVotes) {
      const memVote = global.inMemoryVotes.find(v => String(v._id || v.id) === String(id));
      if (memVote) {
        memVote.submissions = memVote.submissions || {};
        memVote.submissions[req.user.id] = (memVote.submissions[req.user.id] || 0) + 1;
        const opt = (memVote.options || []).find(o => o.id === Number(optionId));
        if (opt) opt.votes = (opt.votes || 0) + 1;
        memVote.totalVotes = (memVote.totalVotes || 0) + 1;

        memVote.voterDetails = memVote.voterDetails || [];
        memVote.voterDetails.push({
          userId: req.user.id,
          optionId: Number(optionId),
          votedAt: new Date().toISOString()
        });

        // Save to localStore votes.json
        writeCollection('votes', global.inMemoryVotes);

        // Award points reward to user
        await awardPoints(memVote.pointsReward);

        try { global.__broadcastUsersUpdate({ type: 'vote_updated', id: memVote._id || memVote.id }); } catch (_) {}
        return res.json({ success: true, message: 'Vote submitted', data: { vote: memVote } });
      }
    }

    if (!vote) return res.status(404).json({ success: false, message: 'Vote not found' });

    await vote.submitVote(req.user.id, optionId);
    await awardPoints(vote.pointsReward);

    // Reload vote
    const updatedVote = await Vote.findById(id);
    const voteObj = updatedVote ? updatedVote.toObject() : vote;
    if (voteObj.submissions instanceof Map) {
      voteObj.submissions = Object.fromEntries(voteObj.submissions);
    }
    if (voteObj.overrides instanceof Map) {
      voteObj.overrides = Object.fromEntries(voteObj.overrides);
    }

    try { global.__broadcastUsersUpdate && global.__broadcastUsersUpdate({ type: 'vote_updated', id: vote._id }); } catch (_) { }

    res.json({ success: true, message: 'Vote submitted', data: { vote: voteObj } });
  } catch (error) {
    console.error('Submit vote error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to submit vote' });
  }
});

// @route   PUT /api/votes/:id/users/:userId/override
// @desc    Override user voting rights for a specific vote (admin only)
// @access  Private/Admin
router.put('/:id/users/:userId/override', adminAuth, [
  body('offset').isInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    const { id, userId } = req.params;
    const { offset } = req.body;

    let vote = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        vote = await Vote.findById(id);
      } catch (dbErr) {}
    }

    if (vote) {
      if (!vote.overrides) vote.overrides = new Map();
      if (typeof vote.overrides.set === 'function') {
        vote.overrides.set(String(userId), Number(offset));
        if (Number(offset) === 0) vote.overrides.delete(String(userId));
      } else {
        vote.overrides[String(userId)] = Number(offset);
      }
      await vote.save();
    }

    if (global.inMemoryVotes) {
      const memVote = global.inMemoryVotes.find(v => String(v._id || v.id) === String(id));
      if (memVote) {
        memVote.overrides = memVote.overrides || {};
        memVote.overrides[String(userId)] = Number(offset);
        if (Number(offset) === 0) delete memVote.overrides[String(userId)];
      }
    }

    try { global.__broadcastUsersUpdate && global.__broadcastUsersUpdate({ type: 'vote_updated', id }); } catch (_) { }
    try { global.__broadcastUsersUpdate && global.__broadcastUsersUpdate({ type: 'user_voting_updated', id: userId }); } catch (_) { }

    res.json({ success: true, message: 'Voting rights override updated' });
  } catch (error) {
    console.error('Override vote rights error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error while updating override' });
  }
});

module.exports = router;
