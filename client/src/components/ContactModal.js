import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Send, Building, Headphones, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ContactModal = ({ isOpen, onClose, initialMode = 'support' }) => {
  const [mode, setMode] = useState(initialMode); // 'support' or 'inquiry'
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Support Form State
  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Inquiry Form State
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    category: 'Asset Recovery & Refund Services',
    subject: '',
    message: ''
  });

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
    setSubmitted(false);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!supportForm.name.trim() || !supportForm.email.trim() || !supportForm.message.trim()) {
      toast.error('Please fill in all required fields (Name, Email, Message)');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/mail/contact', supportForm);
      if (res.data?.success) {
        toast.success('Your support request has been sent to support@reclaimdao.org');
        setSubmitted(true);
        setSupportForm({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(res.data?.message || 'Failed to send message');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryForm.name.trim() || !inquiryForm.email.trim() || !inquiryForm.message.trim()) {
      toast.error('Please fill in all required fields (Name, Email, Project Details)');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/mail/inquiry', inquiryForm);
      if (res.data?.success) {
        toast.success('Your service inquiry has been sent to info@reclaimdao.org');
        setSubmitted(true);
        setInquiryForm({
          name: '',
          email: '',
          category: 'Asset Recovery & Refund Services',
          subject: '',
          message: ''
        });
      } else {
        toast.error(res.data?.message || 'Failed to send inquiry');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-[#081225] border border-sky-500/20 rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#060e1d]">
            <div className="flex items-center gap-3">
              {mode === 'inquiry' ? (
                <>
                  <Building className="w-5 h-5 text-sky-400" />
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Services & Enterprise Inquiries
                  </h3>
                </>
              ) : (
                <>
                  <Headphones className="w-5 h-5 text-sky-400" />
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Contact ReclaimDAO Support
                  </h3>
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="px-6 pt-5">
            <div className="grid grid-cols-2 p-1 bg-[#040814] rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => { setMode('inquiry'); setSubmitted(false); }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  mode === 'inquiry'
                    ? 'bg-[#0070f3] text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Services Inquiries</span>
                <span className="hidden sm:inline text-[11px] opacity-75">(info@)</span>
              </button>

              <button
                type="button"
                onClick={() => { setMode('support'); setSubmitted(false); }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  mode === 'support'
                    ? 'bg-[#0070f3] text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Headphones className="w-4 h-4" />
                <span>Contact Support</span>
                <span className="hidden sm:inline text-[11px] opacity-75">(support@)</span>
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6">
            {submitted ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-16 h-16 bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-white">
                  {mode === 'inquiry' ? 'Service Inquiry Sent!' : 'Support Request Submitted!'}
                </h4>
                <p className="text-slate-300 text-sm max-w-md mx-auto">
                  {mode === 'inquiry' ? (
                    <>Your inquiry has been routed directly to <span className="font-bold text-sky-400">info@reclaimdao.org</span>. Our enterprise team will get in touch shortly.</>
                  ) : (
                    <>Your request has been routed directly to <span className="font-bold text-sky-400">support@reclaimdao.org</span>. Our support team will reply to your email shortly.</>
                  )}
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-5 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition-all"
                  >
                    Send Another
                  </button>
                  <button
                    onClick={onClose}
                    className="px-5 py-2 bg-[#0070f3] hover:bg-sky-600 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : mode === 'inquiry' ? (
              /* INQUIRY FORM (info@reclaimdao.org) */
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                {/* Banner */}
                <div className="p-3.5 rounded-xl bg-[#0a1a36] border border-sky-500/30 text-center text-xs text-sky-200 flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Institutional & General Inquiries: <strong className="text-white">info@reclaimdao.org</strong></span>
                </div>

                <div className="text-center pt-1 pb-2">
                  <h4 className="text-lg font-black text-white">Inquire About ReclaimDAO Solutions</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <span>👤</span> Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your full name"
                      value={inquiryForm.name}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#050b18] border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <span>✉️</span> Work / Organization Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={inquiryForm.email}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#050b18] border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <span>🏷️</span> Inquiry Category *
                    </label>
                    <select
                      value={inquiryForm.category}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#050b18] border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                    >
                      <option value="Asset Recovery & Refund Services">Asset Recovery & Refund Services</option>
                      <option value="Institutional Verification Protocol">Institutional Verification Protocol</option>
                      <option value="Enterprise Blockchain Engineering">Enterprise Blockchain Engineering</option>
                      <option value="Partnership & Integration">Partnership & Integration</option>
                      <option value="General Service Inquiry">General Service Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <span>💬</span> Subject
                    </label>
                    <input
                      type="text"
                      placeholder="Topic of inquiry"
                      value={inquiryForm.subject}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#050b18] border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <span>📝</span> Project & Requirement Details *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your organization, requirement details, specifications, or timeline..."
                    value={inquiryForm.message}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#050b18] border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#0066ff] to-[#0052cc] hover:from-[#1a75ff] hover:to-[#0060e6] shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Sending Inquiry...' : 'Send Service Inquiry'}
                </button>
              </form>
            ) : (
              /* SUPPORT FORM (support@reclaimdao.org) */
              <form onSubmit={handleSupportSubmit} className="space-y-4">
                {/* Banner */}
                <div className="p-3.5 rounded-xl bg-[#0a1a36] border border-sky-500/30 text-center text-xs text-sky-200 flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Customer & Technical Support: <strong className="text-white">support@reclaimdao.org</strong></span>
                </div>

                <div className="text-center pt-1 pb-2">
                  <h4 className="text-lg font-black text-white">How Can We Help You?</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <span>👤</span> Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your full name"
                      value={supportForm.name}
                      onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#050b18] border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <span>✉️</span> Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={supportForm.email}
                      onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#050b18] border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <span>💬</span> Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Brief summary of your issue or request"
                    value={supportForm.subject}
                    onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#050b18] border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <span>📝</span> Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your issue, transaction hash, or technical question..."
                    value={supportForm.message}
                    onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#050b18] border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#0066ff] to-[#0052cc] hover:from-[#1a75ff] hover:to-[#0060e6] shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Submitting Request...' : 'Submit Support Request'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ContactModal;
