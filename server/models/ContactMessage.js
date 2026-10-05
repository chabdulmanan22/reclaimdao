const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  subject: { type: String, trim: true },
  category: { type: String, trim: true, default: 'General' },
  message: { type: String, required: true },
  type: { type: String, enum: ['support', 'inquiry'], default: 'support' },
  targetEmail: { type: String, trim: true, default: 'support@reclaimdao.org' },
  status: { type: String, enum: ['new', 'read', 'replied'], default: 'new' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
