import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, MapPin, MessageSquare, Plus, Trash2, Edit3, Save, ExternalLink, Eye, EyeOff, RefreshCw, Image } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PRESET_LOGOS = [
  { name: 'Yahoo Finance', url: 'https://img.icons8.com/color/144/yahoo.png' },
  { name: 'Bloomberg', url: 'https://img.icons8.com/color/144/bloomberg.png' },
  { name: 'CoinDesk', url: 'https://img.icons8.com/color/144/bitcoin.png' },
  { name: 'Cointelegraph', url: 'https://img.icons8.com/color/144/ethereum.png' },
  { name: 'Business Insider', url: 'https://img.icons8.com/color/144/news.png' },
  { name: 'MarketWatch', url: 'https://img.icons8.com/color/144/line-chart.png' },
  { name: 'Forbes', url: 'https://img.icons8.com/color/144/forbes.png' },
  { name: 'Reuters', url: 'https://img.icons8.com/color/144/globe.png' }
];

const PRManagement = () => {
  const [whatsappLink, setWhatsappLink] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyAddress2, setCompanyAddress2] = useState('');
  const [prLinks, setPrLinks] = useState([]);
  
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [savingPr, setSavingPr] = useState(false);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUrl, setModalUrl] = useState('');
  const [modalLogoUrl, setModalLogoUrl] = useState('');
  const [modalActive, setModalActive] = useState(true);
  const [trustpilotData, setTrustpilotData] = useState({
    title: 'Excellent',
    starRating: '4.5',
    subheading: 'We’ve helped over 10,000+ fraud victims already!',
    reviewCount: '780 reviews',
    reviewLink: 'https://www.trustpilot.com/review/reclaimdao.org',
    buttonText: 'Are you a victim? Request a refund →'
  });
  const [savingTrustpilot, setSavingTrustpilot] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [waRes, addrRes, addr2Res, prRes, tpRes] = await Promise.all([
        axios.get('/api/settings/WHATSAPP_LINK').catch(() => ({ data: {} })),
        axios.get('/api/settings/COMPANY_ADDRESS').catch(() => ({ data: {} })),
        axios.get('/api/settings/COMPANY_ADDRESS_2').catch(() => ({ data: {} })),
        axios.get('/api/settings/PR_LINKS').catch(() => ({ data: {} })),
        axios.get('/api/settings/TRUSTPILOT_DATA').catch(() => ({ data: {} }))
      ]);

      setWhatsappLink(waRes.data?.data?.value || 'https://wa.me/message/QO7NOBRERE3MO1');
      setCompanyAddress(addrRes.data?.data?.value || '12 N 2nd Street STE 100, Richmond, KY 40475');
      setCompanyAddress2(addr2Res.data?.data?.value || '');
      
      const tpVal = tpRes.data?.data?.value;
      if (tpVal && typeof tpVal === 'object') {
        setTrustpilotData({
          title: tpVal.title || 'Excellent',
          starRating: tpVal.starRating || '4.5',
          subheading: tpVal.subheading || 'We’ve helped over 10,000+ fraud victims already!',
          reviewCount: tpVal.reviewCount || '780 reviews',
          reviewLink: tpVal.reviewLink || 'https://www.trustpilot.com/review/reclaimdao.org',
          buttonText: tpVal.buttonText || 'Are you a victim? Request a refund →'
        });
      }

      const links = prRes.data?.data?.value;
      if (Array.isArray(links)) {
        setPrLinks(links);
      } else {
        setPrLinks([
          { id: '1', title: 'Yahoo Finance', url: 'https://finance.yahoo.com', logoUrl: 'https://img.icons8.com/color/144/yahoo.png', active: true },
          { id: '2', title: 'Bloomberg', url: 'https://www.bloomberg.com', logoUrl: 'https://img.icons8.com/color/144/bloomberg.png', active: true },
          { id: '3', title: 'CoinDesk', url: 'https://www.coindesk.com', logoUrl: 'https://img.icons8.com/color/144/bitcoin.png', active: true },
          { id: '4', title: 'Cointelegraph', url: 'https://cointelegraph.com', logoUrl: 'https://img.icons8.com/color/144/ethereum.png', active: true }
        ]);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const saveWhatsappSetting = async () => {
    if (!whatsappLink.trim()) return toast.error('WhatsApp link cannot be empty');
    setSavingWhatsapp(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      await axios.put('/api/settings/WHATSAPP_LINK', {
        value: whatsappLink.trim(),
        description: 'WhatsApp Support Link'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('WhatsApp link updated successfully!');
      window.dispatchEvent(new Event('datastore:update'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update WhatsApp link');
    } finally {
      setSavingWhatsapp(false);
    }
  };

  const saveAddressSetting = async () => {
    if (!companyAddress.trim() && !companyAddress2.trim()) return toast.error('At least one address must be provided');
    setSavingAddress(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await Promise.all([
        axios.put('/api/settings/COMPANY_ADDRESS', {
          value: companyAddress.trim(),
          description: 'Official Company Address (Primary)'
        }, { headers }),
        axios.put('/api/settings/COMPANY_ADDRESS_2', {
          value: companyAddress2.trim(),
          description: 'Official Company Address (Secondary / Branch)'
        }, { headers })
      ]);
      toast.success('Company addresses updated successfully!');
      window.dispatchEvent(new Event('datastore:update'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update company addresses');
    } finally {
      setSavingAddress(false);
    }
  };

  const saveTrustpilotSetting = async () => {
    setSavingTrustpilot(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put('/api/settings/TRUSTPILOT_DATA', {
        value: trustpilotData,
        description: 'Trustpilot Rating Section Settings'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Trustpilot section settings updated!');
      window.dispatchEvent(new Event('datastore:update'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update Trustpilot settings');
    } finally {
      setSavingTrustpilot(false);
    }
  };

  const savePrLinksSetting = async (updatedLinks) => {
    setSavingPr(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put('/api/settings/PR_LINKS', {
        value: updatedLinks,
        description: 'PR Coverage & Media Links'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrLinks(updatedLinks);
      toast.success('PR links updated successfully!');
      window.dispatchEvent(new Event('datastore:update'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update PR links');
    } finally {
      setSavingPr(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setModalTitle('');
    setModalUrl('');
    setModalLogoUrl(PRESET_LOGOS[0].url);
    setModalActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (link) => {
    setEditingId(link.id);
    setModalTitle(link.title);
    setModalUrl(link.url);
    setModalLogoUrl(link.logoUrl);
    setModalActive(link.active !== false);
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!modalTitle.trim()) return toast.error('PR Title/Publisher Name is required');
    if (!modalUrl.trim()) return toast.error('PR Article Link URL is required');

    let updated;
    if (editingId) {
      updated = prLinks.map(item => item.id === editingId ? {
        ...item,
        title: modalTitle.trim(),
        url: modalUrl.trim(),
        logoUrl: modalLogoUrl.trim() || PRESET_LOGOS[0].url,
        active: modalActive
      } : item);
    } else {
      const newItem = {
        id: Date.now().toString(),
        title: modalTitle.trim(),
        url: modalUrl.trim(),
        logoUrl: modalLogoUrl.trim() || PRESET_LOGOS[0].url,
        active: modalActive
      };
      updated = [...prLinks, newItem];
    }

    setIsModalOpen(false);
    savePrLinksSetting(updated);
  };

  const handleDeletePrLink = (id) => {
    if (window.confirm('Are you sure you want to delete this PR link?')) {
      const updated = prLinks.filter(item => item.id !== id);
      savePrLinksSetting(updated);
    }
  };

  const handleToggleActive = (id) => {
    const updated = prLinks.map(item => item.id === id ? { ...item, active: !item.active } : item);
    savePrLinksSetting(updated);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3b82f6] to-[#38bdf8] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-xl">
            <Link2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Site & PR Media Settings</h1>
            <p className="text-sky-100 text-sm">Manage WhatsApp Support Link, Official Address, and Live PR Coverage Links with Logos</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feature 1: WhatsApp Link */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-bold text-gray-900">WhatsApp Link</h2>
          </div>
          <p className="text-xs text-gray-500">Update the live WhatsApp link displayed in the footer and contact sections across the platform.</p>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">WhatsApp Link URL</label>
            <input
              type="text"
              value={whatsappLink}
              onChange={(e) => setWhatsappLink(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3b82f6] outline-none text-sm"
              placeholder="https://wa.me/message/..."
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline flex items-center gap-1">
              <span>Test Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={saveWhatsappSetting}
              disabled={savingWhatsapp}
              className="px-4 py-2 bg-gradient-to-r from-[#3b82f6] to-[#38bdf8] text-white font-semibold text-xs rounded-xl shadow hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
            >
              {savingWhatsapp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Link
            </button>
          </div>
        </motion.div>

        {/* Feature 2: Company Addresses */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#3b82f6]" />
              <h2 className="text-lg font-bold text-gray-900">Company Addresses (Administrative & Registered)</h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 text-blue-700 border border-sky-200 rounded-full">
              Multi-Office Supported
            </span>
          </div>
          <p className="text-xs text-gray-500">Update official company addresses shown on footer, contact, and legal/about pages.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px]">Office 1</span>
                Administrative Office Address
              </label>
              <textarea
                rows={3}
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3b82f6] outline-none text-sm font-medium"
                placeholder="e.g. 12 N 2nd Street STE 100, Richmond, KY 40475"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-sky-100 text-sky-800 rounded text-[10px]">Office 2</span>
                Registered Office Address
              </label>
              <textarea
                rows={3}
                value={companyAddress2}
                onChange={(e) => setCompanyAddress2(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3b82f6] outline-none text-sm font-medium"
                placeholder="e.g. 100 Wall Street, Suite 500, New York, NY 10005 (Optional)"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              onClick={saveAddressSetting}
              disabled={savingAddress}
              className="px-4 py-2.5 bg-gradient-to-r from-[#3b82f6] to-[#38bdf8] text-white font-bold text-xs rounded-xl shadow hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
            >
              {savingAddress ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Addresses
            </button>
          </div>
        </motion.div>

        {/* Feature 2.5: Trustpilot Rating Section */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[#00b67a] text-xl">★</span>
              <h2 className="text-lg font-bold text-gray-900">Trustpilot Rating Section Settings</h2>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full">
              Live Homepage Section
            </span>
          </div>
          <p className="text-xs text-gray-500">Manage the Trustpilot rating title, review count, embedded link, victims helped text, and button label.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Rating Title (e.g. Excellent / GOOD)</label>
              <input
                type="text"
                value={trustpilotData.title}
                onChange={(e) => setTrustpilotData({ ...trustpilotData, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                placeholder="e.g. GOOD"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Star Rating (Stars Displayed)</label>
              <select
                value={trustpilotData.starRating || '4.5'}
                onChange={(e) => setTrustpilotData({ ...trustpilotData, starRating: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold text-blue-700"
              >
                <option value="5.0">★★★★★ 5.0 Stars (5 Full Green Stars)</option>
                <option value="4.5">★★★★½ 4.5 Stars (4 Full Stars + 1 Half Star)</option>
                <option value="4.0">★★★★☆ 4.0 Stars (4 Full Green Stars)</option>
                <option value="3.5">★★★½☆ 3.5 Stars (3 Full Stars + 1 Half Star)</option>
                <option value="3.0">★★★☆☆ 3.0 Stars (3 Full Green Stars)</option>
                <option value="2.5">★★½☆☆ 2.5 Stars (2 Full Stars + 1 Half Star)</option>
                <option value="2.0">★★☆☆☆ 2.0 Stars (2 Full Green Stars)</option>
                <option value="1.5">★½☆☆☆ 1.5 Stars (1 Full Star + 1 Half Star)</option>
                <option value="1.0">★☆☆☆☆ 1.0 Stars (1 Full Green Star)</option>
                <option value="0.5">½☆☆☆☆ 0.5 Stars (1 Half Star)</option>
                <option value="0.0">☆☆☆☆☆ 0.0 Stars (No Stars)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Reviews Count & Text (e.g. 880 reviews)</label>
              <input
                type="text"
                value={trustpilotData.reviewCount}
                onChange={(e) => setTrustpilotData({ ...trustpilotData, reviewCount: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                placeholder="e.g. 880 reviews"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Subheading / Victims Helped Text</label>
            <input
              type="text"
              value={trustpilotData.subheading}
              onChange={(e) => setTrustpilotData({ ...trustpilotData, subheading: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
              placeholder="e.g. We’ve helped over 10,000+ fraud victims already!"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Trustpilot Embedded Link URL</label>
            <input
              type="url"
              value={trustpilotData.reviewLink}
              onChange={(e) => setTrustpilotData({ ...trustpilotData, reviewLink: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
              placeholder="https://www.trustpilot.com/review/..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Call-To-Action Button Text</label>
            <input
              type="text"
              value={trustpilotData.buttonText}
              onChange={(e) => setTrustpilotData({ ...trustpilotData, buttonText: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
              placeholder="Are you a victim? Request a refund →"
            />
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              onClick={saveTrustpilotSetting}
              disabled={savingTrustpilot}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {savingTrustpilot ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Trustpilot Settings
            </button>
          </div>
        </motion.div>
      </div>

      {/* Feature 3: PR Coverage Links & Logos */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Image className="w-6 h-6 text-[#2563eb]" />
              PR & Media Coverage Links
            </h2>
            <p className="text-xs text-gray-500 mt-1">Manage press release (PR) links and site logos displayed on the live website.</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-gradient-to-r from-[#0f172a] to-[#2563eb] text-white font-semibold text-xs rounded-xl shadow hover:opacity-90 flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add New PR Link
          </button>
        </div>

        {/* PR Links Table/Grid */}
        {prLinks.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Link2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">No PR Links Added Yet</p>
            <p className="text-xs mt-1">Click "Add New PR Link" above to add your live media articles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prLinks.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  item.active !== false ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 p-1 flex items-center justify-center overflow-hidden shrink-0">
                      {item.logoUrl ? (
                        <img src={item.logoUrl} alt={item.title} className="w-full h-full object-contain" onError={(e) => { e.target.onerror = null; e.target.src = 'https://img.icons8.com/color/144/news.png'; }} />
                      ) : (
                        <Image className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm leading-tight">{item.title}</h3>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5 max-w-[180px] truncate">
                        <span className="truncate">{item.url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${item.active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {item.active !== false ? 'Active' : 'Hidden'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleToggleActive(item.id)}
                    className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1"
                    title={item.active !== false ? 'Hide from website' : 'Show on website'}
                  >
                    {item.active !== false ? <EyeOff className="w-3.5 h-3.5 text-gray-400" /> : <Eye className="w-3.5 h-3.5 text-green-600" />}
                    <span>{item.active !== false ? 'Hide' : 'Show'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePrLink(item.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal for Add / Edit PR Link */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[#0f172a] to-[#2563eb] p-5 text-white flex items-center justify-between">
                <h3 className="font-bold text-lg">{editingId ? 'Edit PR Link & Logo' : 'Add New PR Link & Logo'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white text-xl">✕</button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">PR Publisher / Site Title</label>
                  <input
                    type="text"
                    value={modalTitle}
                    onChange={(e) => setModalTitle(e.target.value)}
                    placeholder="e.g. Yahoo Finance, Bloomberg, CoinDesk"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">PR Article Link URL</label>
                  <input
                    type="url"
                    value={modalUrl}
                    onChange={(e) => setModalUrl(e.target.value)}
                    placeholder="e.g. https://finance.yahoo.com/news/reclaimdao-announces-..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">PR Site Logo Image URL</label>
                  <input
                    type="text"
                    value={modalLogoUrl}
                    onChange={(e) => setModalLogoUrl(e.target.value)}
                    placeholder="https://... or select preset below"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none text-sm"
                  />
                </div>

                {/* Preset Logos Picker */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Or Choose Standard Preset Logo:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_LOGOS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setModalLogoUrl(preset.url);
                          if (!modalTitle) setModalTitle(preset.name);
                        }}
                        className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                          modalLogoUrl === preset.url ? 'border-blue-500 bg-blue-50 shadow-sm ring-2 ring-blue-400' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-8 h-8 object-contain" />
                        <span className="text-[10px] font-medium text-gray-700 truncate w-full">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="modalActiveToggle"
                    checked={modalActive}
                    onChange={(e) => setModalActive(e.target.checked)}
                    className="w-4 h-4 text-[#2563eb] border-gray-300 rounded focus:ring-[#10b981]"
                  />
                  <label htmlFor="modalActiveToggle" className="text-xs text-gray-700 font-medium cursor-pointer">
                    Show on live website (Active)
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveModal}
                  className="px-5 py-2 bg-gradient-to-r from-[#0f172a] to-[#2563eb] text-white font-semibold text-xs rounded-xl shadow hover:opacity-90"
                >
                  Save PR Link
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PRManagement;
