const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { getTransporter } = require('../services/emailService');
const ContactMessage = require('../models/ContactMessage');

const sendApplicationStatusEmail = async (to, status, link, clientTime, clientTzOffset) => {
  let subject, html;
  let text;

  if (status === 'accepted') {
    let refCode = null;
    if (mongoose.connection.readyState === 1) {
      try {
        const JoinApplication = require('../models/JoinApplication');
        const app = await JoinApplication.findOne({ email: new RegExp('^' + String(to).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') });
        if (app && app.referralCode) refCode = app.referralCode;
      } catch (_) {}
    }
    if (!refCode) {
      try {
        const { readCollection } = require('../utils/localStore');
        const apps = readCollection('applications') || [];
        const localApp = apps.find(a => a.email && a.email.toLowerCase() === String(to).toLowerCase());
        if (localApp && localApp.referralCode) refCode = localApp.referralCode;
      } catch (_) {}
    }

    let defaultClient = (process.env.NODE_ENV === 'production') ? 'https://reclaimdao.org' : (process.env.CLIENT_URL || 'http://localhost:3001');
    let baseReg = (link && String(link).trim()) ? link : `${defaultClient.replace(/\/+$/, '')}/register`;
    if (process.env.NODE_ENV === 'production' || baseReg.includes('reclaimdao.org')) {
      baseReg = baseReg.replace(/http:\/\/localhost:\d+/g, 'https://reclaimdao.org');
    }
    let regLink = baseReg;
    try {
      const u = new URL(baseReg);
      u.searchParams.set('email', to);
      if (refCode) u.searchParams.set('ref', refCode);
      regLink = u.toString();
    } catch {}
    subject = 'Your Application to ReclaimDAO has been Accepted';
    text = [
      'Congratulations!',
      'Your application to join ReclaimDAO has been accepted. We are excited to have you on board.',
      'Please click the link below to complete your registration:',
      `Complete Registration: ${regLink}`,
      'If you have any questions, please don\'t hesitate to contact us.',
      'Sincerely,',
      'The ReclaimDAO Team'
    ].join('\n');
    html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1f2937;">
        <h2 style="margin: 0 0 12px; color: #111827;">Congratulations!</h2>
        <p style="margin: 8px 0;">Your application to join ReclaimDAO has been accepted. We are excited to have you on board.</p>
        <p style="margin: 8px 0;">Please click the link below to complete your registration:</p>
        <p style="margin: 16px 0;">
          <a href="${regLink}" style="background-color: #085464; color: #ffffff; padding: 10px 16px; text-decoration: none; border-radius: 6px; display: inline-block;">Complete Registration</a>
        </p>
        <p style="margin: 8px 0;">If you have any questions, please don\'t hesitate to contact us.</p>
        <p style="margin: 16px 0 4px;">Sincerely,</p>
        <p style="margin: 0;">The ReclaimDAO Team</p>
      </div>
    `;
  } else {
    subject = 'Update on Your Application to ReclaimDAO';
    text = [
      'Thank you for your interest in joining ReclaimDAO. After careful consideration, we regret to inform you that your application has been rejected at this time.',
      'We appreciate the time you took to apply and wish you the best in your future endeavors.',
      'Sincerely,',
      'The ReclaimDAO Team'
    ].join('\n');
    html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1f2937;">
        <h2 style="margin: 0 0 12px; color: #111827;">Application Update</h2>
        <p style="margin: 8px 0;">Thank you for your interest in joining ReclaimDAO. After careful consideration, we regret to inform you that your application has been rejected at this time.</p>
        <p style="margin: 8px 0;">We appreciate the time you took to apply and wish you the best in your future endeavors.</p>
        <div style="margin: 16px 0; display: inline-block; background-color: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; border-radius: 6px; padding: 10px 16px; font-weight: 600;">Application Status Update</div>
        <p style="margin: 16px 0 4px;">Sincerely,</p>
        <p style="margin: 0;">The ReclaimDAO Team</p>
      </div>
    `;
  }

  try {
    const transporter = await getTransporter('info');
    const fromAddr = process.env.EMAIL_INFO || 'info@reclaimdao.org';
    const domain = 'reclaimdao.org';
    const msgId = `<app-${Date.now()}-${Math.random().toString(36).slice(2)}@${domain}>`;
    const tz = typeof clientTzOffset === 'number' ? clientTzOffset : 0;
    const base = clientTime ? new Date(clientTime) : new Date();
    const localDate = new Date(base.getTime() - tz * 60000);
    const pad = (n) => (n < 10 ? '0' + n : '' + n);
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const sign = tz <= 0 ? '+' : '-';
    const abs = Math.abs(tz);
    const hh = pad(Math.floor(abs / 60));
    const mm = pad(abs % 60);
    const dateHeader = `${days[localDate.getUTCDay()]}, ${pad(localDate.getUTCDate())} ${months[localDate.getUTCMonth()]} ${localDate.getUTCFullYear()} ${pad(localDate.getUTCHours())}:${pad(localDate.getUTCMinutes())}:${pad(localDate.getUTCSeconds())} ${sign}${hh}${mm}`;
    const info = await transporter.sendMail({
      from: `ReclaimDAO Services <${fromAddr}>`,
      to,
      subject,
      html,
      text,
      replyTo: fromAddr,
      envelope: { from: fromAddr, to: to },
      headers: { 'List-Unsubscribe': `<mailto:${fromAddr}>`, 'X-Mailer': 'ReclaimDAO System', 'Date': dateHeader },
      messageId: msgId,
      date: localDate,
    });

    console.log('Message sent: %s', info.messageId);
    console.log('SMTP response: %s', info.response);
    console.log('Accepted recipients:', info.accepted);
    console.log('Rejected recipients:', info.rejected);
    const preview = nodemailer.getTestMessageUrl(info);
    const ok = Array.isArray(info.accepted) && info.accepted.length > 0;
    if (!ok) {
      return { success: false, error: { message: 'No recipients accepted by SMTP', response: info.response, rejected: info.rejected } };
    }
    return { success: true, previewUrl: preview, accepted: info.accepted, response: info.response };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

router.post('/send-email', async (req, res) => {
  const { to, status, link, clientTime, clientTzOffset } = req.body;

  if (!to || !status) {
    return res.status(400).json({ message: 'Missing required fields: to, status' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(to))) {
    return res.status(400).json({ message: 'Invalid recipient email' });
  }

  let result;
  try {
    const rawOrigin = req.get('origin') || req.headers.origin || '';
    let baseOrigin = (process.env.NODE_ENV === 'production' || rawOrigin.includes('reclaimdao.org'))
      ? 'https://reclaimdao.org'
      : (rawOrigin || process.env.CLIENT_URL || 'http://localhost:3001');
    
    let effectiveLink = link;
    if (process.env.NODE_ENV === 'production' && effectiveLink && effectiveLink.includes('localhost')) {
      effectiveLink = effectiveLink.replace(/http:\/\/localhost:\d+/g, 'https://reclaimdao.org');
    }
    const statusNorm = String(status || '').toLowerCase();
    if (statusNorm === 'accepted') {
      const baseClean = String(baseOrigin).replace(/\/+$/, '');
      if (!effectiveLink) effectiveLink = `${baseClean}/register`;
    }
    result = await sendApplicationStatusEmail(to, statusNorm, effectiveLink, clientTime, clientTzOffset);
  } catch (e) {
    return res.status(500).json({ message: 'Failed to send email', error: { message: e.message } });
  }

  if (result.success) {
    res.status(200).json({ message: 'Email sent successfully', previewUrl: result.previewUrl, accepted: result.accepted, response: result.response });
  } else {
    const e = result.error || {};
    res.status(500).json({
      message: 'Failed to send email',
      error: {
        message: e.message,
        code: e.code,
        response: e.response,
        command: e.command,
      }
    });
  }
});

const { sendEmail } = require('../services/emailService');
const { adminAuth } = require('../middleware/auth');

router.get('/contact-messages', adminAuth, async (req, res) => {
  try {
    let messages = [];
    if (mongoose.connection.readyState === 1) {
      messages = await ContactMessage.find().sort({ createdAt: -1 });
    }
    if (!messages || messages.length === 0) {
      messages = global.contactMessagesStore || [];
    }
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/mail/contact (Support Form)
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required fields' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const targetEmail = 'support@reclaimdao.org';
    const emailSubject = subject || `Support Request from ${name}`;

    // 1. Save message to MongoDB
    let savedDoc = null;
    if (mongoose.connection.readyState === 1) {
      try {
        savedDoc = await ContactMessage.create({
          name,
          email,
          subject: emailSubject,
          message,
          type: 'support',
          targetEmail: 'support@reclaimdao.org'
        });
      } catch (dbErr) {
        console.warn('DB ContactMessage save warning:', dbErr.message);
      }
    }

    // Also persist in memory store
    try {
      if (!global.contactMessagesStore) {
        global.contactMessagesStore = [];
      }
      global.contactMessagesStore.unshift({
        id: savedDoc ? savedDoc._id : `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name,
        email,
        subject: emailSubject,
        message,
        type: 'support',
        targetEmail: 'support@reclaimdao.org',
        status: 'new',
        createdAt: new Date().toISOString()
      });
    } catch (saveErr) {
      console.warn('Failed to persist contact message in memory:', saveErr.message);
    }

    const text = [
      `New Website Support Request from ${name}:`,
      `-----------------------------------------`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${emailSubject}`,
      `Department: Customer & Technical Support`,
      `Submitted At: ${new Date().toLocaleString()}`,
      `-----------------------------------------`,
      `Message:`,
      message
    ].join('\n');

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1f2937; max-width: 600px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #085464; margin-top: 0;">🎧 New Support Request</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 6px 0; font-weight: bold; width: 120px;">Name:</td><td>${name}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">User Email:</td><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Subject:</td><td>${emailSubject}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Department:</td><td>Support (support@reclaimdao.org)</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Date:</td><td>${new Date().toLocaleString()}</td></tr>
        </table>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; border-left: 4px solid #085464;">
          <h4 style="margin: 0 0 8px; color: #374151;">Message:</h4>
          <p style="margin: 0; white-space: pre-wrap; color: #1f2937;">${message}</p>
        </div>
        <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">This email was routed automatically from the ReclaimDAO Support Form to support@reclaimdao.org.</p>
      </div>
    `;

    // 2. Send email to support@reclaimdao.org using support transporter
    await sendEmail({
      account: 'support',
      fromAddr: 'support@reclaimdao.org',
      from: `"ReclaimDAO Support Form" <support@reclaimdao.org>`,
      email: targetEmail,
      subject: emailSubject,
      message: text,
      html: html,
      replyTo: email
    });

    // 3. Send auto-reply receipt copy to user's email
    try {
      const userReplyHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1f2937; max-width: 600px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h3 style="color: #085464; margin-top: 0;">We Received Your Support Request</h3>
          <p>Hi ${name},</p>
          <p>Thank you for reaching out to <strong>ReclaimDAO Customer & Technical Support</strong>. We have received your message and our support team will respond directly to your email shortly.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 13px; color: #6b7280; margin: 0;"><strong>Your Message Details:</strong></p>
          <p style="font-size: 13px; color: #4b5563; font-style: italic;">"${message}"</p>
          <br />
          <p style="font-size: 14px; color: #374151;">Best regards,<br /><strong>ReclaimDAO Support Team</strong><br/><a href="mailto:support@reclaimdao.org" style="color: #085464;">support@reclaimdao.org</a></p>
        </div>
      `;
      await sendEmail({
        account: 'support',
        fromAddr: 'support@reclaimdao.org',
        from: `"ReclaimDAO Support" <support@reclaimdao.org>`,
        email: email,
        subject: `Support Request Received - ReclaimDAO`,
        message: `Hi ${name}, Thank you for contacting ReclaimDAO Support. We have received your request and will reply shortly.`,
        html: userReplyHtml
      });
    } catch (userMailErr) {
      console.warn('User confirmation auto-reply notice:', userMailErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Your support request has been submitted successfully and routed to support@reclaimdao.org'
    });

  } catch (error) {
    console.error('Contact form endpoint error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message via email: ' + (error.message || 'SMTP error') });
  }
});

// POST /api/mail/inquiry (Services & Enterprise Inquiry Form)
router.post('/inquiry', async (req, res) => {
  try {
    const { name, email, category = 'General Services', subject, message, details } = req.body;
    const effectiveMessage = message || details;

    if (!name || !email || !effectiveMessage) {
      return res.status(400).json({ success: false, message: 'Name, email, and inquiry details are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const targetEmail = 'info@reclaimdao.org';
    const emailSubject = subject || `[Services Inquiry] ${category} from ${name}`;

    // 1. Save inquiry to MongoDB
    let savedDoc = null;
    if (mongoose.connection.readyState === 1) {
      try {
        savedDoc = await ContactMessage.create({
          name,
          email,
          subject: emailSubject,
          category,
          message: effectiveMessage,
          type: 'inquiry',
          targetEmail: 'info@reclaimdao.org'
        });
      } catch (dbErr) {
        console.warn('DB ContactMessage (inquiry) save warning:', dbErr.message);
      }
    }

    // Also persist in memory store
    try {
      if (!global.contactMessagesStore) {
        global.contactMessagesStore = [];
      }
      global.contactMessagesStore.unshift({
        id: savedDoc ? savedDoc._id : `inq_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name,
        email,
        subject: emailSubject,
        category,
        message: effectiveMessage,
        type: 'inquiry',
        targetEmail: 'info@reclaimdao.org',
        status: 'new',
        createdAt: new Date().toISOString()
      });
    } catch (saveErr) {
      console.warn('Failed to persist inquiry in memory:', saveErr.message);
    }

    const text = [
      `New Services & Enterprise Inquiry from ${name}:`,
      `-----------------------------------------`,
      `Name: ${name}`,
      `Work / Organization Email: ${email}`,
      `Inquiry Category: ${category}`,
      `Subject: ${emailSubject}`,
      `Submitted At: ${new Date().toLocaleString()}`,
      `-----------------------------------------`,
      `Project & Requirement Details:`,
      effectiveMessage
    ].join('\n');

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1f2937; max-width: 600px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #085464; margin-top: 0;">🏢 New Services & Enterprise Inquiry</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 6px 0; font-weight: bold; width: 140px;">Contact Name:</td><td>${name}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Work Email:</td><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Inquiry Category:</td><td><span style="background-color: #dbeafe; color: #1e40af; padding: 3px 8px; border-radius: 4px; font-weight: bold;">${category}</span></td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Subject:</td><td>${emailSubject}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Routing:</td><td>Inquiries (info@reclaimdao.org)</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Submitted Date:</td><td>${new Date().toLocaleString()}</td></tr>
        </table>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #085464;">
          <h4 style="margin: 0 0 8px; color: #374151;">Project & Requirement Details:</h4>
          <p style="margin: 0; white-space: pre-wrap; color: #1f2937;">${effectiveMessage}</p>
        </div>
        <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">This inquiry was routed directly from the ReclaimDAO Services Inquiry Form to info@reclaimdao.org.</p>
      </div>
    `;

    // 2. Send email to info@reclaimdao.org using info transporter
    await sendEmail({
      account: 'info',
      fromAddr: 'info@reclaimdao.org',
      from: `"ReclaimDAO Services Inquiry" <info@reclaimdao.org>`,
      email: targetEmail,
      subject: emailSubject,
      message: text,
      html: html,
      replyTo: email
    });

    // 3. Send auto-reply receipt copy to user's email
    try {
      const userReplyHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1f2937; max-width: 600px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h3 style="color: #085464; margin-top: 0;">We Received Your Service Inquiry</h3>
          <p>Hi ${name},</p>
          <p>Thank you for inquiring about <strong>ReclaimDAO Solutions & Services</strong> (${category}).</p>
          <p>Our institutional and enterprise team is reviewing your requirements and will reach out to you directly shortly.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 13px; color: #6b7280; margin: 0;"><strong>Inquiry Details:</strong></p>
          <p style="font-size: 13px; color: #4b5563; font-style: italic;">"${effectiveMessage}"</p>
          <br />
          <p style="font-size: 14px; color: #374151;">Best regards,<br /><strong>ReclaimDAO Services & Institutional Team</strong><br/><a href="mailto:info@reclaimdao.org" style="color: #085464;">info@reclaimdao.org</a></p>
        </div>
      `;
      await sendEmail({
        account: 'info',
        fromAddr: 'info@reclaimdao.org',
        from: `"ReclaimDAO Services" <info@reclaimdao.org>`,
        email: email,
        subject: `Service Inquiry Received - ReclaimDAO`,
        message: `Hi ${name}, Thank you for your service inquiry to ReclaimDAO. We have received your request and will contact you shortly.`,
        html: userReplyHtml
      });
    } catch (userMailErr) {
      console.warn('User confirmation auto-reply notice (inquiry):', userMailErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Your service inquiry has been submitted successfully and routed to info@reclaimdao.org'
    });

  } catch (error) {
    console.error('Inquiry form endpoint error:', error);
    res.status(500).json({ success: false, message: 'Failed to send inquiry: ' + (error.message || 'SMTP error') });
  }
});

module.exports = router;
