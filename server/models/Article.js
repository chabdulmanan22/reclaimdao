const mongoose = require('mongoose');

const slugify = (value) => {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  shortDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  articleText: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  /** When false, article is hidden from all public list/detail API responses */
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  /** Optional hero image (https URL) for cards and detail page */
  heroImageUrl: {
    type: String,
    trim: true,
    default: '',
    maxlength: 2048,
  },
  /** Shown in refund-programs table “Date” column; falls back to document createdAt when unset */
  createdDisplayDate: {
    type: Date,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

articleSchema.statics.generateUniqueSlug = async function(title, excludeId = null) {
  const base = slugify(title) || 'article';
  let candidate = base;
  let counter = 2;

  while (true) {
    const query = { slug: candidate };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const existing = await this.findOne(query).lean();
    if (!existing) return candidate;
    candidate = `${base}-${counter}`;
    counter += 1;
  }
};

module.exports = mongoose.model('Article', articleSchema);
