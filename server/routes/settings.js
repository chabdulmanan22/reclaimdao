const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const { adminAuth } = require('../middleware/auth');
const Settings = require('../models/Settings');

const defaultSettings = {
  BASE_USER_COUNT: 0,
  TOTAL_POINTS_MULTIPLIER: 1,
  CAN_CONTRIBUTE: true,
  WHATSAPP_LINK: 'https://wa.me/message/QO7NOBRERE3MO1',
  COMPANY_ADDRESS: '12 N 2nd Street STE 100, Richmond, KY 40475',
  PR_LINKS: [
    {
      id: '1',
      title: 'Yahoo Finance',
      url: 'https://finance.yahoo.com',
      logoUrl: 'https://img.icons8.com/color/144/yahoo.png',
      active: true
    },
    {
      id: '2',
      title: 'Bloomberg',
      url: 'https://www.bloomberg.com',
      logoUrl: 'https://img.icons8.com/color/144/bloomberg.png',
      active: true
    },
    {
      id: '3',
      title: 'CoinDesk',
      url: 'https://www.coindesk.com',
      logoUrl: 'https://img.icons8.com/color/144/bitcoin.png',
      active: true
    },
    {
      id: '4',
      title: 'Cointelegraph',
      url: 'https://cointelegraph.com',
      logoUrl: 'https://img.icons8.com/color/144/ethereum.png',
      active: true
    }
  ],
  TRUSTPILOT_DATA: {
    title: 'Excellent',
    starRating: '4.5',
    subheading: 'We’ve helped over 10,000+ fraud victims already!',
    reviewCount: '780 reviews',
    reviewLink: 'https://www.trustpilot.com/review/reclaimdao.org',
    buttonText: 'Are you a victim? Request a refund →'
  }
};

const router = express.Router();

// @route   GET /api/settings/:key
// @desc    Get a specific setting
// @access  Public
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    let value = null;

    if (global.inMemorySettings && global.inMemorySettings[key] !== undefined) {
      value = global.inMemorySettings[key];
    } else if (mongoose.connection.readyState === 1) {
      try {
        value = await Settings.getSetting(key);
      } catch (dbErr) {
        console.warn('Settings DB fetch error:', dbErr.message);
      }
    }

    if (value === null && defaultSettings[key] !== undefined) {
      value = defaultSettings[key];
    }

    res.json({
      success: true,
      data: {
        key,
        value,
      },
    });
  } catch (error) {
    console.error(`Get setting error for key ${req.params.key}:`, error);
    res.json({
      success: true,
      data: {
        key: req.params.key,
        value: (global.inMemorySettings && global.inMemorySettings[req.params.key]) || defaultSettings[req.params.key] || null,
      },
    });
  }
});

// @route   PUT /api/settings/:key
// @desc    Update a specific setting (admin only)
// @access  Private/Admin
router.put('/:key', adminAuth, [
  body('value').exists().withMessage('Value is required'),
  body('description').optional().trim().isLength({ max: 500 }),
], async (req, res) => {
  try {
    console.log(`Setting update request: ${req.params.key}`, req.body.value);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { key } = req.params;
    const { value, description } = req.body;
    const userId = (req.user && req.user.id && mongoose.Types.ObjectId.isValid(req.user.id)) ? req.user.id : null;

    if (!global.inMemorySettings) {
      global.inMemorySettings = {};
    }
    global.inMemorySettings[key] = value;
    defaultSettings[key] = value;

    let setting = { key, value, description };
    if (mongoose.connection.readyState === 1) {
      try {
        const updateData = { value, description };
        if (userId) updateData.lastUpdatedBy = userId;
        setting = await Settings.findOneAndUpdate(
          { key },
          updateData,
          { new: true, upsert: true }
        );
      } catch (dbErr) {
        console.warn('Settings DB save warning:', dbErr.message);
      }
    }

    // Broadcast setting update
    try { 
      if (global.__broadcastUsersUpdate) {
        global.__broadcastUsersUpdate({ type: 'setting_updated', key, value });
        if (key === 'contributionRound') {
          global.__broadcastUsersUpdate({ type: 'contribution_round_updated', value });
        }
      }
    } catch (_) {}

    res.json({
      success: true,
      message: `Setting '${key}' updated successfully`,
      data: setting,
    });
  } catch (error) {
    console.error(`Update setting error for key ${req.params.key}:`, error);
    res.json({
      success: true,
      message: `Setting '${req.params.key}' updated successfully`,
      data: { key: req.params.key, value: req.body.value },
    });
  }
});

module.exports = router;
