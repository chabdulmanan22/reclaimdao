const express = require('express');
const { body, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { adminAuth } = require('../middleware/auth');
const Article = require('../models/Article');
const { readCollection, writeCollection } = require('../utils/localStore');
const {
  adminArticleListQueryValidators,
  handleAdminArticleList,
  serializeArticle,
  publicActiveClause,
} = require('../controllers/articleAdminListController');

const router = express.Router();

const heroImageValidators = [
  body('heroImageUrl')
    .optional()
    .trim()
    .isLength({ max: 2048 })
    .custom((value) => {
      if (value === undefined || value === null || value === '') return true;
      try {
        const u = new URL(value);
        if (!['http:', 'https:'].includes(u.protocol)) {
          throw new Error('Invalid URL protocol');
        }
        return true;
      } catch {
        throw new Error('Hero image must be a valid http(s) URL');
      }
    }),
];

const isActiveValidators = [
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

const createdDisplayDateValidators = [
  body('createdDisplayDate')
    .optional()
    .custom((value) => value === undefined || value === null || value === '' || /^\d{4}-\d{2}-\d{2}$/.test(String(value)))
    .withMessage('createdDisplayDate must be YYYY-MM-DD or empty'),
];

const parseCreatedDisplayDate = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const s = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  return new Date(`${s}T12:00:00.000Z`);
};

// @route   GET /api/articles/admin/list
// @desc    Paginated list for admin (all statuses)
// @access  Private/Admin
router.get('/admin/list', adminAuth, adminArticleListQueryValidators, handleAdminArticleList);
router.get('/list', adminAuth, adminArticleListQueryValidators, handleAdminArticleList);

// @route   GET /api/articles
// @desc    Public list of active articles (newest first); excludes full body
// @access  Public
router.get('/', async (req, res) => {
  try {
    let articles = [];
    if (mongoose.connection.readyState === 1) {
      try {
        articles = await Article.find(publicActiveClause)
          .sort({ createdDisplayDate: -1, createdAt: -1 })
          .select('title shortDescription slug heroImageUrl createdDisplayDate createdAt updatedAt')
          .lean();
      } catch (dbErr) {
        console.warn('Public articles DB query error:', dbErr.message);
      }
    }

    const getTs = (a) => (a.createdDisplayDate ? new Date(a.createdDisplayDate).getTime() : new Date(a.createdAt || 0).getTime());

    if (!articles || articles.length === 0) {
      articles = readCollection('articles').filter((a) => a.isActive !== false);
    }

    articles.sort((a, b) => getTs(b) - getTs(a));

    res.json({
      success: true,
      data: articles.map((a) => serializeArticle(a, { includeBody: false })),
    });
  } catch (error) {
    console.error('List articles error:', error);
    const getTs = (a) => (a.createdDisplayDate ? new Date(a.createdDisplayDate).getTime() : new Date(a.createdAt || 0).getTime());
    const articles = readCollection('articles').filter((a) => a.isActive !== false);
    articles.sort((a, b) => getTs(b) - getTs(a));
    res.json({
      success: true,
      data: articles.map((a) => serializeArticle(a, { includeBody: false })),
    });
  }
});

// @route   GET /api/articles/:slug
// @desc    Public fetch of a single active article by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    let article = null;
    if (mongoose.connection.readyState === 1) {
      try {
        article = await Article.findOne({
          slug: String(slug).toLowerCase(),
          ...publicActiveClause,
        }).lean();
      } catch (dbErr) {
        console.warn('Single article DB query error:', dbErr.message);
      }
    }

    if (!article) {
      article = readCollection('articles').find(
        (a) => a.slug === String(slug).toLowerCase() && a.isActive !== false
      );
    }

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    res.json({
      success: true,
      data: serializeArticle(article, { includeBody: true }),
    });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching article',
    });
  }
});


// @route   POST /api/articles
// @desc    Create a new article (admin)
// @access  Private/Admin
router.post(
  '/',
  adminAuth,
  [
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required (max 200 chars)'),
    body('shortDescription')
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Short description is required (max 500 chars)'),
    body('articleText').isString().isLength({ min: 1 }).withMessage('Article text is required'),
    ...isActiveValidators,
    ...heroImageValidators,
    ...createdDisplayDateValidators,
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

      const { title, shortDescription, articleText } = req.body;
      let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (!slug) slug = 'article-' + Date.now();

      const isActive = typeof req.body.isActive === 'boolean' ? req.body.isActive : true;
      const heroImageUrl =
        typeof req.body.heroImageUrl === 'string' ? req.body.heroImageUrl.trim().slice(0, 2048) : '';
      const createdDisplayDate = parseCreatedDisplayDate(req.body.createdDisplayDate);

      let article = null;
      if (mongoose.connection.readyState === 1) {
        try {
          slug = await Article.generateUniqueSlug(title);
          article = await Article.create({
            title,
            shortDescription,
            articleText,
            slug,
            isActive,
            heroImageUrl,
            createdDisplayDate,
            createdBy: req.user?.id,
          });
        } catch (dbErr) {
          console.warn('Article create DB error:', dbErr.message);
        }
      }

      if (!article) {
        const id = 'art_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        article = {
          _id: id,
          id,
          title,
          shortDescription,
          articleText,
          slug,
          isActive,
          heroImageUrl,
          createdDisplayDate: req.body.createdDisplayDate || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const local = readCollection('articles');
        local.unshift(article);
        writeCollection('articles', local);
      }

      res.status(201).json({
        success: true,
        message: 'Article created successfully',
        data: serializeArticle(article, { forAdmin: true, includeBody: true }),
      });
    } catch (error) {
      console.error('Create article error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while creating article',
      });
    }
  },
);

// @route   PUT /api/articles/:id
// @desc    Update an article (admin)
// @access  Private/Admin
router.put(
  '/:id',
  adminAuth,
  [
    param('id').notEmpty().withMessage('Article id is required'),
    body('title').optional().trim().isLength({ min: 1, max: 200 }),
    body('shortDescription').optional().trim().isLength({ min: 1, max: 500 }),
    body('articleText').optional().isString().isLength({ min: 1 }),
    ...isActiveValidators,
    ...heroImageValidators,
    ...createdDisplayDateValidators,
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

      const { id } = req.params;
      let article = null;
      if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
        try {
          article = await Article.findById(id);
        } catch (dbErr) {}
      }

      const { title, shortDescription, articleText } = req.body;

      if (article) {
        if (typeof title === 'string' && title.trim() && title.trim() !== article.title) {
          article.title = title.trim();
          article.slug = await Article.generateUniqueSlug(article.title, article._id);
        }
        if (typeof shortDescription === 'string') {
          article.shortDescription = shortDescription.trim();
        }
        if (typeof articleText === 'string') {
          article.articleText = articleText;
        }
        if (typeof req.body.isActive === 'boolean') {
          article.isActive = req.body.isActive;
        }
        if (typeof req.body.heroImageUrl === 'string') {
          article.heroImageUrl = req.body.heroImageUrl.trim().slice(0, 2048);
        }
        if (Object.prototype.hasOwnProperty.call(req.body, 'createdDisplayDate')) {
          article.createdDisplayDate = parseCreatedDisplayDate(req.body.createdDisplayDate);
        }
        await article.save();
      }

      // Also update localStore
      const local = readCollection('articles');
      const idx = local.findIndex((a) => String(a._id || a.id) === String(id));
      if (idx !== -1) {
        const item = local[idx];
        if (typeof title === 'string' && title.trim()) item.title = title.trim();
        if (typeof shortDescription === 'string') item.shortDescription = shortDescription.trim();
        if (typeof articleText === 'string') item.articleText = articleText;
        if (typeof req.body.isActive === 'boolean') item.isActive = req.body.isActive;
        if (typeof req.body.heroImageUrl === 'string') item.heroImageUrl = req.body.heroImageUrl.trim();
        if (Object.prototype.hasOwnProperty.call(req.body, 'createdDisplayDate')) {
          item.createdDisplayDate = req.body.createdDisplayDate || null;
        }
        item.updatedAt = new Date().toISOString();
        local[idx] = item;
        writeCollection('articles', local);
        if (!article) article = item;
      }

      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found',
        });
      }

      res.json({
        success: true,
        message: 'Article updated successfully',
        data: serializeArticle(article, { forAdmin: true, includeBody: true }),
      });
    } catch (error) {
      console.error('Update article error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating article',
      });
    }
  },
);

// @route   DELETE /api/articles/:id
// @desc    Delete an article (admin)
// @access  Private/Admin
router.delete(
  '/:id',
  adminAuth,
  [param('id').notEmpty().withMessage('Article id is required')],
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

      const { id } = req.params;
      let removed = false;
      if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
        try {
          const resMongo = await Article.findByIdAndDelete(id);
          if (resMongo) removed = true;
        } catch (dbErr) {}
      }

      const local = readCollection('articles');
      const filtered = local.filter((a) => String(a._id || a.id) !== String(id));
      if (filtered.length !== local.length) {
        writeCollection('articles', filtered);
        removed = true;
      }

      if (!removed) {
        return res.status(404).json({
          success: false,
          message: 'Article not found',
        });
      }

      res.json({
        success: true,
        message: 'Article deleted successfully',
      });
    } catch (error) {
      console.error('Delete article error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while deleting article',
      });
    }
  },
);


module.exports = router;
