const mongoose = require('mongoose');
const { query, validationResult } = require('express-validator');
const Article = require('../models/Article');
const { readCollection } = require('../utils/localStore');

const publicActiveClause = { isActive: { $ne: false } };

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const serializeArticle = (article, options = {}) => {
  const { forAdmin = false, includeBody = false } = options;
  const out = {
    id: article._id || article.id,
    _id: article._id || article.id,
    title: article.title,
    shortDescription: article.shortDescription,
    slug: article.slug,
    heroImageUrl: article.heroImageUrl || '',
    createdDisplayDate: article.createdDisplayDate || null,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
  if (includeBody) {
    out.articleText = article.articleText;
  }
  if (forAdmin) {
    out.isActive = article.isActive !== false;
  }
  return out;
};

const adminArticleListQueryValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(['all', 'active', 'inactive']),
  query('sort').optional().isIn(['createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'title', '-title']),
  query('q').optional().trim().isLength({ max: 200 }),
];

async function handleAdminArticleList(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: errors.array(),
      });
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const status = req.query.status || 'all';
    const sortRaw = req.query.sort || '-createdAt';
    const q = req.query.q || '';

    const sort = {};
    const sortField = sortRaw.replace(/^-/, '');
    const sortDir = sortRaw.startsWith('-') ? -1 : 1;
    sort[sortField] = sortDir;

    const andParts = [];

    if (status === 'active') {
      andParts.push(publicActiveClause);
    } else if (status === 'inactive') {
      andParts.push({ isActive: false });
    }

    if (q) {
      const safe = escapeRegex(q);
      andParts.push({
        $or: [
          { title: new RegExp(safe, 'i') },
          { shortDescription: new RegExp(safe, 'i') },
          { slug: new RegExp(safe, 'i') },
        ],
      });
    }

    const filter = andParts.length ? { $and: andParts } : {};

    let total = 0;
    let articles = [];

    if (mongoose.connection.readyState === 1) {
      try {
        [total, articles] = await Promise.all([
          Article.countDocuments(filter),
          Article.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
        ]);
      } catch (dbErr) {
        console.warn('Article query error:', dbErr.message);
      }
    }

    if (!articles || articles.length === 0) {
      const localArticles = readCollection('articles');
      let filtered = localArticles;
      if (status === 'active') {
        filtered = filtered.filter((a) => a.isActive !== false);
      } else if (status === 'inactive') {
        filtered = filtered.filter((a) => a.isActive === false);
      }
      if (q) {
        const qLow = q.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            (a.title && a.title.toLowerCase().includes(qLow)) ||
            (a.shortDescription && a.shortDescription.toLowerCase().includes(qLow))
        );
      }
      const getArticleTimestamp = (a) => {
        if (a.createdDisplayDate) return new Date(a.createdDisplayDate).getTime();
        return new Date(a.createdAt || Date.now()).getTime();
      };
      filtered.sort((a, b) => getArticleTimestamp(b) - getArticleTimestamp(a));
      total = filtered.length;
      articles = filtered.slice((page - 1) * limit, page * limit);
    }

    res.json({
      success: true,
      data: articles.map((a) => serializeArticle(a, { forAdmin: true, includeBody: true })),
      pagination: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin list articles error:', error);
    const localArticles = readCollection('articles');
    res.json({
      success: true,
      data: localArticles.map((a) => serializeArticle(a, { forAdmin: true, includeBody: true })),
      pagination: {
        page: 1,
        limit: 10,
        total: localArticles.length,
        totalPages: 1,
      },
    });
  }
}


module.exports = {
  adminArticleListQueryValidators,
  handleAdminArticleList,
  serializeArticle,
  publicActiveClause,
  escapeRegex,
};
