const express = require('express');
const router = express.Router();
const JoinApplication = require('../models/JoinApplication');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// POST /api/join
// Public route to submit a join application
router.post('/', [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('details').isObject().withMessage('Details object is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { firstName, lastName, email, details, referralCode } = req.body;

        if (mongoose.connection.readyState === 1) {
            try {
                const application = new JoinApplication({
                    firstName,
                    lastName,
                    email,
                    details,
                    referralCode
                });
                await application.save();
            } catch (dbErr) {
                console.warn('JoinApplication DB save error:', dbErr.message);
            }
        }

        try {
            const apps = readCollection('applications') || [];
            apps.unshift({
                id: 'app_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                firstName,
                lastName,
                email,
                details,
                referralCode,
                status: 'pending',
                createdAt: new Date().toISOString()
            });
            writeCollection('applications', apps);
        } catch (_) {}

        res.status(201).json({ success: true, message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Submit application error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

const mongoose = require('mongoose');
const { readCollection, writeCollection } = require('../utils/localStore');

// GET /api/join
// Admin route to get all join applications
router.get('/', adminAuth, async (req, res) => {
    try {
        let applications = [];
        if (mongoose.connection.readyState === 1) {
            try {
                applications = await JoinApplication.find().sort({ createdAt: -1 });
            } catch (dbErr) {
                console.warn('JoinApplication find error:', dbErr.message);
            }
        }

        if (!applications || applications.length === 0) {
            applications = readCollection('applications');
        }

        let registeredEmailSet = new Set();
        if (mongoose.connection.readyState === 1) {
            try {
                const emails = applications.map(a => a.email).filter(Boolean);
                const registeredUsers = await User.find(
                    { email: { $in: emails.map(e => new RegExp('^' + String(e).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i')) } },
                    { email: 1 }
                ).lean();
                registeredUsers.forEach(u => {
                    if (u.email) registeredEmailSet.add(u.email.toLowerCase());
                });
            } catch (_) {}
        }
        const localUsersList = readCollection('users') || [];
        localUsersList.forEach(u => {
            if (u.email) registeredEmailSet.add(String(u.email).toLowerCase());
        });

        const enriched = await Promise.all(applications.map(async (app) => {
            const appObj = typeof app.toObject === 'function' ? app.toObject() : { ...app };
            appObj.id = appObj._id || appObj.id;
            const appEmailNorm = String(app.email || '').trim().toLowerCase();
            const isRegistered = registeredEmailSet.has(appEmailNorm);
            appObj.hasAccount = isRegistered;
            if (isRegistered) {
                appObj.status = 'registered';
            }

            if (app.referralCode) {
                let referrer = null;
                if (mongoose.connection.readyState === 1) {
                    try {
                        referrer = await User.findOne({
                            $or: [{ referralCode: app.referralCode }, { username: app.referralCode }]
                        }, { firstName: 1, lastName: 1, email: 1 });
                    } catch (_) {}
                }
                if (!referrer) {
                    referrer = localUsersList.find(u =>
                        u.referralCode === app.referralCode || u.username === app.referralCode
                    );
                }
                if (!referrer) {
                    const allLocalApps = readCollection('applications') || [];
                    const refApp = allLocalApps.find(a => a.referralCode === app.referralCode && a.email !== app.email);
                    if (refApp) {
                        referrer = localUsersList.find(u => u.email === refApp.email) || refApp;
                    }
                }

                if (referrer) {
                    appObj.referrerName = `${referrer.firstName || ''} ${referrer.lastName || ''}`.trim() || referrer.fullName || referrer.email;
                }
            }
            return appObj;
        }));

        res.json({ success: true, applications: enriched });
    } catch (error) {
        console.error('Get applications error:', error);
        const applications = readCollection('applications');
        res.json({ success: true, applications });
    }
});

module.exports = router;

