import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail,
  MapPin,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Building,
  Headphones,
  ShieldCheck,
  PhoneCall,
  Clock,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ContactUs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get('type') === 'inquiry' ? 'inquiry' : 'support';

  const [mode, setMode] = useState(initialType); // 'support' or 'inquiry'
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [companyAddress, setCompanyAddress] = useState('12 N 2nd Street STE 100, Richmond, KY 40475');
  const [companyAddress2, setCompanyAddress2] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('https://wa.me/message/QO7NOBRERE3MO1');

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

  // Sync mode with URL search parameters
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'inquiry') {
      setMode('inquiry');
      setSubmitted(false);
    } else if (type === 'support') {
      setMode('support');
      setSubmitted(false);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [addrRes, addr2Res, waRes] = await Promise.all([
          axios.get('/api/settings/COMPANY_ADDRESS').catch(() => ({ data: {} })),
          axios.get('/api/settings/COMPANY_ADDRESS_2').catch(() => ({ data: {} })),
          axios.get('/api/settings/WHATSAPP_LINK').catch(() => ({ data: {} }))
        ]);
        if (addrRes.data?.data?.value) setCompanyAddress(addrRes.data.data.value);
        if (addr2Res.data?.data?.value) setCompanyAddress2(addr2Res.data.data.value);
        if (waRes.data?.data?.value) setWhatsappLink(waRes.data.data.value);
      } catch (_) {}
    };
    loadSettings();
    window.addEventListener('datastore:update', loadSettings);
    return () => window.removeEventListener('datastore:update', loadSettings);
  }, []);

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setSubmitted(false);
    setSearchParams({ type: newMode });
  };

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
    <div
      className="min-h-screen text-white py-10 md:py-16"
      style={{
        background: 'linear-gradient(180deg, #020a1a 0%, #031026 50%, #020814 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header section */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-sky-950/70 border border-sky-400/30 text-sky-300 text-xs font-bold tracking-widest uppercase shadow-inner">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Dedicated Communication Channels</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Contact <span className="bg-gradient-to-r from-sky-400 via-[#0070f3] to-amber-400 bg-clip-text text-transparent">ReclaimDAO</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Reach the right team directly. Services & enterprise inquiries route to{' '}
            <strong className="text-sky-300 font-semibold">info@reclaimdao.org</strong> and technical support tickets route to{' '}
            <strong className="text-amber-300 font-semibold">support@reclaimdao.org</strong>.
          </p>
        </div>

        {/* Main Grid: Directory Sidebar on Left + Sleek Form Card on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Directory Sidebar (Left Column on Desktop) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-5 order-2 lg:order-1">
            {/* Quick Channel Selectors */}
            <div className="bg-[#081225] border border-sky-500/20 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10 uppercase tracking-wider">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <span>Contact Channels</span>
              </h3>

              <div className="space-y-3">
                {/* Inquiry Channel Card */}
                <div
                  onClick={() => handleModeSwitch('inquiry')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    mode === 'inquiry'
                      ? 'bg-blue-950/60 border-sky-400 ring-1 ring-sky-400/50'
                      : 'bg-[#050b18] border-white/10 hover:border-sky-500/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 shrink-0 border border-sky-500/20">
                      <Building className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Services Inquiries</h4>
                        {mode === 'inquiry' && (
                          <span className="text-[10px] font-bold text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-extrabold text-white mt-0.5 truncate">info@reclaimdao.org</p>
                      <p className="text-[11px] text-sky-300/80 mt-0.5 flex items-center gap-1">
                        Enterprise & Partnerships <ArrowRight className="w-3 h-3" />
                      </p>
                    </div>
                  </div>
                </div>

                {/* Support Channel Card */}
                <div
                  onClick={() => handleModeSwitch('support')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    mode === 'support'
                      ? 'bg-blue-950/60 border-sky-400 ring-1 ring-sky-400/50'
                      : 'bg-[#050b18] border-white/10 hover:border-sky-500/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 shrink-0 border border-sky-500/20">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Contact & Support</h4>
                        {mode === 'support' && (
                          <span className="text-[10px] font-bold text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-extrabold text-white mt-0.5 truncate">support@reclaimdao.org</p>
                      <p className="text-[11px] text-sky-300/80 mt-0.5 flex items-center gap-1">
                        Customer & Tech Support <ArrowRight className="w-3 h-3" />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Offices & Direct Support */}
            <div className="bg-[#081225] border border-sky-500/20 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10 uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>Office Locations</span>
              </h3>

              <div className="space-y-3.5 text-xs text-slate-300">
                {companyAddress && (
                  <div className="p-3 bg-[#050b18] rounded-xl border border-white/10 space-y-1">
                    <h5 className="font-bold text-sky-300 uppercase tracking-wider text-[11px]">Administrative Office</h5>
                    <p className="text-slate-200 font-medium whitespace-pre-line leading-relaxed">{companyAddress}</p>
                  </div>
                )}

                {companyAddress2 && (
                  <div className="p-3 bg-[#050b18] rounded-xl border border-white/10 space-y-1">
                    <h5 className="font-bold text-sky-300 uppercase tracking-wider text-[11px]">Registered Office</h5>
                    <p className="text-slate-200 font-medium whitespace-pre-line leading-relaxed">{companyAddress2}</p>
                  </div>
                )}

                {/* WhatsApp */}
                <div className="pt-1">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] font-bold text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    <span className="text-base">💬</span>
                    <span>Chat Directly on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-4 rounded-2xl bg-[#0a1a36]/80 border border-sky-500/30 text-xs text-slate-300 leading-relaxed shadow-lg">
              <p className="font-bold text-sky-300 mb-1 flex items-center gap-1.5 text-xs">
                <AlertCircle className="w-4 h-4 text-sky-400" /> Isolated Transporter Security
              </p>
              <p className="text-[11px] text-slate-300">
                To guarantee zero message collision, inquiries are dispatched exclusively through the institutional <strong className="text-white">info@reclaimdao.org</strong> SMTP gateway, while support tickets are routed through the dedicated <strong className="text-white">support@reclaimdao.org</strong> node.
              </p>
            </div>
          </div>

          {/* Main Form Container (Right Column on Desktop - Matches Dark Sleek UI from Screenshots) */}
          <div className="lg:col-span-7 xl:col-span-8 order-1 lg:order-2">
            <div className="relative w-full bg-[#081225] border border-sky-500/20 rounded-2xl shadow-2xl overflow-hidden">
              {/* Card Header */}
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
                <div className="text-[11px] font-semibold text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                  SSL Encrypted
                </div>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="px-6 pt-5">
                <div className="grid grid-cols-2 p-1 bg-[#040814] rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('inquiry')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      mode === 'inquiry'
                        ? 'bg-[#0070f3] text-white shadow-lg shadow-blue-600/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Building className="w-4 h-4 text-sky-300" />
                    <span>Services Inquiries</span>
                    <span className="hidden sm:inline text-[11px] opacity-75">(info@)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeSwitch('support')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      mode === 'support'
                        ? 'bg-[#0070f3] text-white shadow-lg shadow-blue-600/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Headphones className="w-4 h-4 text-sky-300" />
                    <span>Contact Support</span>
                    <span className="hidden sm:inline text-[11px] opacity-75">(support@)</span>
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <div className="p-6">
                {submitted ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/30">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-2xl font-bold text-white">
                      {mode === 'inquiry' ? 'Service Inquiry Sent!' : 'Support Request Submitted!'}
                    </h4>
                    <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                      {mode === 'inquiry' ? (
                        <>
                          Your inquiry has been routed directly to{' '}
                          <strong className="text-sky-400">info@reclaimdao.org</strong>. Our enterprise and solutions team will get in touch with you shortly.
                        </>
                      ) : (
                        <>
                          Your support ticket has been routed directly to{' '}
                          <strong className="text-sky-400">support@reclaimdao.org</strong>. Our support team will review and reply to your email promptly.
                        </>
                      )}
                    </p>
                    <div className="pt-4 flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSubmitted(false)}
                        className="px-6 py-2.5 bg-gradient-to-r from-[#0066ff] to-[#0052cc] hover:from-[#1a75ff] hover:to-[#0060e6] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
                      >
                        Send Another Message
                      </button>
                    </div>
                  </div>
                ) : mode === 'inquiry' ? (
                  /* INQUIRY FORM (info@reclaimdao.org) */
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    {/* Banner */}
                    <div className="p-3.5 rounded-xl bg-[#0a1a36] border border-sky-500/30 text-center text-xs text-sky-200 flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>
                        Institutional & General Inquiries: <strong className="text-white">info@reclaimdao.org</strong>
                      </span>
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
                          <option value="Asset Recovery & Refund Services" className="bg-[#081225] text-white">
                            Asset Recovery & Refund Services
                          </option>
                          <option value="Institutional Verification Protocol" className="bg-[#081225] text-white">
                            Institutional Verification Protocol
                          </option>
                          <option value="Enterprise Blockchain Engineering" className="bg-[#081225] text-white">
                            Enterprise Blockchain Engineering
                          </option>
                          <option value="Partnership & Integration" className="bg-[#081225] text-white">
                            Partnership & Integration
                          </option>
                          <option value="General Service Inquiry" className="bg-[#081225] text-white">
                            General Service Inquiry
                          </option>
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
                      <span>
                        Customer & Technical Support: <strong className="text-white">support@reclaimdao.org</strong>
                      </span>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;

