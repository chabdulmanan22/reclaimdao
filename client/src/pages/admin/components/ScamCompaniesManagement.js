import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  X,
  Save,
  Building2,
  Tag,
  AlertTriangle,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Historic / Infamous Ponzi & Fraud Cases',
  'Rug Pulls / Pump-and-Dump / Scam Tokens',
  'Fake / Rogue Platforms and Exchanges',
  'Other Frequently Reported Scam Programs / Platforms'
];

const emptyForm = {
  name: '',
  category: 'Other Frequently Reported Scam Programs / Platforms',
  status: 'confirmed',
  notes: ''
};

const ScamCompaniesManagement = () => {
  const [customCompanies, setCustomCompanies] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/scam-companies');
      if (res.data?.success) {
        setCustomCompanies(res.data.data.customCompanies || []);
        setSections(res.data.data.sections || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load scam companies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (company) => {
    setEditingId(company.id);
    setForm({
      name: company.name || '',
      category: company.category || 'Other Frequently Reported Scam Programs / Platforms',
      status: company.status || 'confirmed',
      notes: company.notes || ''
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Company / Program name is required');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      if (editingId) {
        await axios.put(`/api/scam-companies/${editingId}`, form, { headers });
        toast.success('Company updated successfully');
      } else {
        await axios.post('/api/scam-companies', form, { headers });
        toast.success('Company added to scam alert list');
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save company');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (company) => {
    if (!window.confirm(`Are you sure you want to remove "${company.name}" from custom alerts?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      await axios.delete(`/api/scam-companies/${company.id}`, { headers });
      toast.success('Company removed successfully');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete company');
    }
  };

  const filteredSections = sections.map(sec => {
    if (selectedCategory !== 'all' && sec.title !== selectedCategory) return null;
    let items = sec.items;
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      items = items.filter(item => item.toLowerCase().includes(s));
    }
    return { ...sec, items };
  }).filter(Boolean);

  return (
    <div className="space-y-6 admin-scope">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-[#2563eb]" />
            Scam Alert Companies
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
            Manage reported fraudulent companies, rogue platforms, and scam tokens on public site
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            onClick={loadData}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-bold text-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </motion.button>

          <motion.button
            onClick={openCreate}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0f172a] to-[#2563eb] text-white rounded-xl font-bold text-sm shadow-md shadow-blue-900/20 hover:brightness-110 transition-all"
          >
            <Plus className="w-4 h-4" />
            + Add Company
          </motion.button>
        </div>
      </div>

      {/* Controls / Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search company or program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#10b981] text-sm"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <Tag className="w-4 h-4 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#10b981] text-xs font-semibold text-gray-700"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom Admin Added Companies Section */}
      {customCompanies.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#2563eb] uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Admin Custom Added Alerts ({customCompanies.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customCompanies.map((comp) => (
              <div
                key={comp.id}
                className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col justify-between hover:border-[#2563eb] transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-gray-900 text-sm">{comp.name}</h4>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                      comp.status === 'confirmed' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {comp.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-1">{comp.category}</p>
                  {comp.notes && <p className="text-xs text-gray-600 italic mt-2 bg-white p-2 rounded border">{comp.notes}</p>}
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => openEdit(comp)}
                    className="p-1.5 text-slate-600 hover:text-[#2563eb] hover:bg-slate-200 rounded-lg transition-all text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(comp)}
                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Categories & Default Lists */}
      <div className="space-y-6">
        {filteredSections.map((section) => (
          <div key={section.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
              <Building2 className="w-4 h-4 text-gray-400" />
              {section.title} ({section.items.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {section.items.map((item) => (
                <div
                  key={typeof item === 'string' ? item : item.name}
                  className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-800"
                >
                  <span className="truncate pr-2">{typeof item === 'string' ? item : item.name}</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-gray-200 text-gray-600 shrink-0">
                    System
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-100"
            >
              <div className="bg-gradient-to-r from-[#0f172a] to-[#2563eb] p-5 text-white flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" />
                  {editingId ? 'Edit Scam Company' : 'Add Scam Company / Alert'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 text-white/80 hover:text-white rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Company / Program Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Crypto Trading"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#10b981] text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Alert Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#10b981] text-xs font-bold"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Risk / Alert Level
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#10b981] text-xs font-bold"
                  >
                    <option value="confirmed">Confirmed Fraud / Scam</option>
                    <option value="warning">Regulatory Warning</option>
                    <option value="investigating">Under Investigation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Notes / Reference (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description or case note..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#10b981] text-sm font-medium"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#0f172a] to-[#2563eb] text-white font-bold text-sm rounded-xl shadow-md hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Company'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScamCompaniesManagement;
