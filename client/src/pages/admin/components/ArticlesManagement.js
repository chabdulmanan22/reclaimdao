import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  X,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import toast from 'react-hot-toast';

const todayInputDate = () => new Date().toISOString().slice(0, 10);

const toDateInputValue = (isoOrDate) => {
  if (!isoOrDate) return '';
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

const emptyForm = {
  title: '',
  shortDescription: '',
  articleText: '',
  createdDisplayDate: '',
  isActive: true,
};

const VisibilityToggle = ({ active, onToggle, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={active}
    aria-label={active ? 'Active on website' : 'Hidden from website'}
    disabled={disabled}
    onClick={onToggle}
    className={`relative h-7 w-11 shrink-0 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:opacity-50 ${
      active ? 'bg-blue-500' : 'bg-slate-300'
    }`}
  >
    <span
      className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
        active ? 'left-5' : 'left-0.5'
      }`}
    />
  </button>
);

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest first' },
  { value: 'createdAt', label: 'Oldest first' },
  { value: '-updatedAt', label: 'Recently updated' },
  { value: 'title', label: 'Title A–Z' },
  { value: '-title', label: 'Title Z–A' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const ArticlesManagement = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sort, setSort] = useState('-createdAt');
  const [status, setStatus] = useState('all');
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 320);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort, status]);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Admin authentication required');
        setArticles([]);
        return;
      }
      const params = {
        page,
        limit,
        sort,
        status,
      };
      if (debouncedSearch) params.q = debouncedSearch;
      const res = await axios.get('/api/admin/articles/list', {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = res.data?.data || [];
      setArticles(list);
      const p = res.data?.pagination;
      if (p) {
        setPagination({ total: p.total ?? 0, totalPages: p.totalPages ?? 0 });
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to load articles';
      toast.error(msg);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sort, status, debouncedSearch]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, createdDisplayDate: todayInputDate() });
    setShowModal(true);
  };

  const openEdit = (article) => {
    setEditingId(article.id || article._id);
    setForm({
      title: article.title || '',
      shortDescription: article.shortDescription || '',
      articleText: article.articleText || '',
      createdDisplayDate: toDateInputValue(article.createdDisplayDate || article.createdAt),
      isActive: article.isActive !== false,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const title = form.title.trim();
    const shortDescription = form.shortDescription.trim();
    const articleText = form.articleText.trim();

    if (!title) {
      toast.error('Title is required');
      return;
    }
    if (!shortDescription) {
      toast.error('Short description is required');
      return;
    }
    if (!articleText) {
      toast.error('Article text is required');
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error('Admin authentication required');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    const payload = {
      title,
      shortDescription,
      articleText,
      isActive: !!form.isActive,
      createdDisplayDate: (form.createdDisplayDate || '').trim(),
    };

    setSaving(true);
    try {
      if (editingId) {
        const res = await axios.put(`/api/articles/${editingId}`, payload, { headers });
        if (res.data?.success) {
          toast.success('Article updated');
          closeModal();
          await loadArticles();
        }
      } else {
        const res = await axios.post('/api/articles', payload, { headers });
        if (res.data?.success) {
          toast.success('Article created');
          closeModal();
          await loadArticles();
        }
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to save article';
      const errs = error?.response?.data?.errors;
      if (Array.isArray(errs) && errs[0]?.msg) {
        toast.error(errs[0].msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (article) => {
    const id = article.id || article._id;
    if (!id) return;
    if (!window.confirm(`Delete article "${article.title}"?`)) return;

    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error('Admin authentication required');
      return;
    }

    try {
      const res = await axios.delete(`/api/articles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        toast.success('Article deleted');
        await loadArticles();
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to delete article';
      toast.error(msg);
    }
  };

  const toggleActive = async (article) => {
    const id = article.id || article._id;
    if (!id) return;
    const currentlyActive = article.isActive !== false;
    const next = !currentlyActive;
    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error('Admin authentication required');
      return;
    }
    try {
      const res = await axios.put(
        `/api/articles/${id}`,
        { isActive: next },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data?.success) {
        toast.success(next ? 'Article is now active' : 'Article is now inactive');
        await loadArticles();
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to update status';
      toast.error(msg);
    }
  };

  const rangeLabel = useMemo(() => {
    if (pagination.total === 0) return '0 articles';
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, pagination.total);
    return `${start}–${end} of ${pagination.total}`;
  }, [page, limit, pagination.total]);

  const canPrev = page > 1;
  const canNext = pagination.totalPages > 0 && page < pagination.totalPages;

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6 md:flex md:items-end md:justify-between md:p-7">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-600">
            <FileText className="h-3.5 w-3.5" />
            Content
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Articles</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-600 md:text-base">
            Only articles with visibility <span className="font-medium text-slate-800">on</span> appear on the public site.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="mt-5 inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 md:mt-0 md:w-auto"
        >
          <Plus className="h-4 w-4" />
          New article
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between md:p-5">
          <div className="relative flex-1 min-w-0 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, description, or slug…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-1.5">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border-0 bg-transparent text-sm font-medium text-slate-800 focus:outline-none focus:ring-0"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-2 py-1.5">
              <ArrowUpDown className="h-4 w-4 text-slate-500" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="max-w-[11rem] border-0 bg-transparent text-sm font-medium text-slate-800 focus:outline-none focus:ring-0 sm:max-w-none"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            <p className="text-sm">Loading articles…</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileText className="h-7 w-7" />
            </div>
            <p className="text-slate-700 font-medium">
              {pagination.total === 0 ? 'No articles yet.' : 'No articles match your filters.'}
            </p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {pagination.total === 0
                ? 'Publish your first article to show it on the homepage carousel.'
                : 'Try adjusting search or status filters.'}
            </p>
            {pagination.total === 0 && (
              <button
                type="button"
                onClick={openCreate}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <Plus className="h-4 w-4" />
                Create article
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3.5">Article</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {articles.map((article) => {
                    const id = article.id || article._id;
                    const active = article.isActive !== false;
                    const rawDate = article.createdDisplayDate || article.createdAt;
                    let displayDate = '—';
                    if (rawDate) {
                      const str = String(rawDate).trim();
                      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
                        const [year, month] = str.split('-');
                        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                        const idx = parseInt(month, 10) - 1;
                        if (idx >= 0 && idx < 12) displayDate = `${months[idx]} ${year}`;
                      } else {
                        try {
                          const d = new Date(str);
                          if (!isNaN(d.getTime())) displayDate = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
                        } catch (_) {}
                      }
                    }
                    return (
                      <tr key={id} className="group transition-colors hover:bg-violet-50/30">
                        <td className="px-5 py-4 align-top">
                          <div className="flex gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 ring-1 ring-violet-200/60">
                              <FileText className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 line-clamp-2">{article.title}</div>
                              <p className="mt-0.5 line-clamp-2 text-slate-600">{article.shortDescription}</p>
                              <a
                                href={`/articles/${article.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-800"
                              >
                                /articles/{article.slug}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <div className="flex items-center gap-3">
                            <VisibilityToggle
                              active={active}
                              onToggle={() => toggleActive(article)}
                            />
                            <span className="text-xs font-medium text-slate-600">
                              {active ? 'On site' : 'Hidden'}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top whitespace-nowrap font-medium text-slate-700">
                          {displayDate}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(article)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-violet-200 hover:bg-violet-50"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(article)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {articles.map((article) => {
                const id = article.id || article._id;
                const active = article.isActive !== false;
                return (
                  <div key={id} className="p-4">
                    <div className="flex gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 ring-1 ring-violet-200/60">
                        <FileText className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-900">{article.title}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <VisibilityToggle
                            active={active}
                            onToggle={() => toggleActive(article)}
                          />
                          <span className="text-[11px] font-medium text-slate-600">
                            {active ? 'Visible on site' : 'Hidden'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm text-slate-600">{article.shortDescription}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(article)}
                        className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(article)}
                        className="flex-1 rounded-lg border border-red-200 py-2 text-xs font-semibold text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-slate-500 sm:text-sm">
                <span className="font-medium text-slate-700">{rangeLabel}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!canPrev}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>
                <span className="px-2 text-sm text-slate-600">
                  Page {page}
                  {pagination.totalPages > 0 ? ` / ${pagination.totalPages}` : ''}
                </span>
                <button
                  type="button"
                  disabled={!canNext}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="flex max-h-[min(92vh,900px)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingId ? 'Edit article' : 'New article'}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Rich text is split into paragraphs using blank lines on the public page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  disabled={saving}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5">
                    <div>
                      <span className="text-sm font-semibold text-slate-900">Visible on website</span>
                      <p className="text-xs text-slate-500">
                        <span className="font-medium text-blue-700">On</span> = live on the site ·{' '}
                        <span className="font-medium text-slate-600">Off</span> = hidden
                      </p>
                    </div>
                    <VisibilityToggle
                      active={form.isActive}
                      onToggle={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-800">Title</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                      placeholder="Article title"
                      maxLength={200}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                      Listed date (refund programs table)
                    </label>
                    <input
                      type="date"
                      value={form.createdDisplayDate}
                      onChange={(e) => setForm((prev) => ({ ...prev, createdDisplayDate: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Shown in the “Date” column on the Refund Programs resource page. Leave empty to use the real
                      creation time instead.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-800">Short description</label>
                    <textarea
                      value={form.shortDescription}
                      onChange={(e) => setForm((prev) => ({ ...prev, shortDescription: e.target.value }))}
                      rows={3}
                      maxLength={500}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                      placeholder="Shown on cards and under the headline"
                      required
                    />
                    <p className="mt-1 text-xs text-slate-500">{form.shortDescription.length}/500</p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-800">Article text</label>
                    <textarea
                      value={form.articleText}
                      onChange={(e) => setForm((prev) => ({ ...prev, articleText: e.target.value }))}
                      rows={12}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-sm leading-relaxed text-slate-900 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                      placeholder="Full article body"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create article'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArticlesManagement;
