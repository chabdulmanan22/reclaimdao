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
      } catch (_) { }
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
    <div className="min-h-screen bg-[#F8F8F6] text-charcoal py-6 sm:py-10 md:py-16 selection:bg-[#3D7EFF] selection:text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 md:space-y-10">

        {/* Masthead Header Section */}
        <div className="text-center space-y-2.5 sm:space-y-3 max-w-3xl mx-auto px-1">
          <div
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-1 bg-white border border-[#D4D4CE] text-charcoal text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider shadow-sm max-w-full text-center"
            style={{ borderRadius: '0px' }}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#3D7EFF] shrink-0" />
            <span className="truncate sm:whitespace-normal">Dedicated Channels • Official Liaison</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-charcoal tracking-tight break-words">
            Contact <span className="text-[#3D7EFF]">ReclaimDAO</span>
          </h1>

          <p className="text-coolgray text-xs sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Reach the right team directly. Services & enterprise inquiries route to{' '}
            <strong className="text-charcoal font-bold break-all">info@reclaimdao.org</strong> and technical & claim support tickets route to{' '}
            <strong className="text-[#3D7EFF] font-bold break-all">support@reclaimdao.org</strong>.
          </p>
        </div>

        {/* Main Grid: Directory Sidebar + Sleek Form Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* Directory Sidebar (2nd on mobile, 1st on desktop) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4 sm:space-y-5 order-2 lg:order-1">

            {/* Quick Channel Selectors */}
            <div
              className="bg-white border border-[#D4D4CE] p-4 sm:p-6 space-y-3.5 sm:space-y-4 shadow-sm"
              style={{ borderRadius: '0px' }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#D4D4CE]">
                <h3 className="text-xs font-mono font-bold text-charcoal flex items-center gap-2 uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4 text-[#3D7EFF] shrink-0" />
                  <span>Contact Channels</span>
                </h3>
                <span className="font-mono text-[10px] text-coolgray uppercase tracking-widest">Select Route</span>
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                {/* Inquiry Channel Card */}
                <button
                  type="button"
                  onClick={() => {
                    handleModeSwitch('inquiry');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full text-left p-3 sm:p-4 border transition-all cursor-pointer ${
                    mode === 'inquiry'
                      ? 'bg-[#F8F8F6] border-2 border-[#3D7EFF] shadow-sm'
                      : 'bg-white border-[#D4D4CE] hover:border-charcoal'
                  }`}
                  style={{ borderRadius: '0px' }}
                >
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div
                      className={`p-2 shrink-0 border ${
                        mode === 'inquiry'
                          ? 'bg-[#3D7EFF] text-white border-[#3D7EFF]'
                          : 'bg-[#F8F8F6] text-charcoal border-[#D4D4CE]'
                      }`}
                      style={{ borderRadius: '0px' }}
                    >
                      <Building className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-[11px] font-mono font-bold text-charcoal uppercase tracking-wider truncate">
                          Services Inquiries
                        </h4>
                        {mode === 'inquiry' && (
                          <span
                            className="text-[9px] sm:text-[10px] font-mono font-bold text-white bg-[#3D7EFF] px-1.5 sm:px-2 py-0.5 uppercase tracking-wider shrink-0"
                            style={{ borderRadius: '0px' }}
                          >
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-black text-charcoal mt-0.5 sm:mt-1 truncate">info@reclaimdao.org</p>
                      <p className="text-[10px] sm:text-[11px] font-mono text-coolgray mt-0.5 sm:mt-1 flex items-center gap-1">
                        Enterprise & Partnerships <ArrowRight className="w-3 h-3 text-[#3D7EFF] shrink-0" />
                      </p>
                    </div>
                  </div>
                </button>

                {/* Support Channel Card */}
                <button
                  type="button"
                  onClick={() => {
                    handleModeSwitch('support');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full text-left p-3 sm:p-4 border transition-all cursor-pointer ${
                    mode === 'support'
                      ? 'bg-[#F8F8F6] border-2 border-[#3D7EFF] shadow-sm'
                      : 'bg-white border-[#D4D4CE] hover:border-charcoal'
                  }`}
                  style={{ borderRadius: '0px' }}
                >
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div
                      className={`p-2 shrink-0 border ${
                        mode === 'support'
                          ? 'bg-[#3D7EFF] text-white border-[#3D7EFF]'
                          : 'bg-[#F8F8F6] text-charcoal border-[#D4D4CE]'
                      }`}
                      style={{ borderRadius: '0px' }}
                    >
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-[11px] font-mono font-bold text-charcoal uppercase tracking-wider truncate">
                          Contact & Support
                        </h4>
                        {mode === 'support' && (
                          <span
                            className="text-[9px] sm:text-[10px] font-mono font-bold text-white bg-[#3D7EFF] px-1.5 sm:px-2 py-0.5 uppercase tracking-wider shrink-0"
                            style={{ borderRadius: '0px' }}
                          >
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-black text-charcoal mt-0.5 sm:mt-1 truncate">support@reclaimdao.org</p>
                      <p className="text-[10px] sm:text-[11px] font-mono text-coolgray mt-0.5 sm:mt-1 flex items-center gap-1">
                        Victim & Tech Support <ArrowRight className="w-3 h-3 text-[#3D7EFF] shrink-0" />
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Offices & Direct Support */}
            <div
              className="bg-white border border-[#D4D4CE] p-4 sm:p-6 space-y-3.5 sm:space-y-4 shadow-sm"
              style={{ borderRadius: '0px' }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#D4D4CE]">
                <h3 className="text-xs font-mono font-bold text-charcoal flex items-center gap-2 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-[#3D7EFF] shrink-0" />
                  <span>Office Locations</span>
                </h3>
                <span className="font-mono text-[10px] text-coolgray uppercase tracking-widest">Global Ops</span>
              </div>

              <div className="space-y-3 text-xs text-charcoal">
                {companyAddress && (
                  <div
                    className="p-3 sm:p-3.5 bg-[#F8F8F6] border border-[#D4D4CE] space-y-1"
                    style={{ borderRadius: '0px' }}
                  >
                    <h5 className="font-mono font-bold text-charcoal uppercase tracking-wider text-[11px]">
                      Administrative Office
                    </h5>
                    <p className="text-coolgray font-medium whitespace-pre-line leading-relaxed text-xs break-words">
                      {companyAddress}
                    </p>
                  </div>
                )}

                {companyAddress2 && (
                  <div
                    className="p-3 sm:p-3.5 bg-[#F8F8F6] border border-[#D4D4CE] space-y-1"
                    style={{ borderRadius: '0px' }}
                  >
                    <h5 className="font-mono font-bold text-charcoal uppercase tracking-wider text-[11px]">
                      Registered Office
                    </h5>
                    <p className="text-coolgray font-medium whitespace-pre-line leading-relaxed text-xs break-words">
                      {companyAddress2}
                    </p>
                  </div>
                )}

                {/* WhatsApp Direct Liaison Button */}
                <div className="pt-1">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[44px] flex items-center justify-center gap-2 p-3 sm:p-3.5 bg-white hover:bg-[#F8F8F6] border border-[#25D366] text-[#128C7E] font-bold font-mono text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer text-center"
                    style={{ borderRadius: '0px' }}
                  >
                    <span className="text-base shrink-0">💬</span>
                    <span className="truncate">Chat Directly on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div
              className="p-3.5 sm:p-4 bg-white border border-[#D4D4CE] text-xs text-charcoal leading-relaxed shadow-sm space-y-1.5"
              style={{ borderRadius: '0px' }}
            >
              <p className="font-mono font-bold text-charcoal flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-[#3D7EFF] shrink-0" />
                <span>Isolated Transporter Security</span>
              </p>
              <p className="text-[11px] text-coolgray leading-relaxed">
                To guarantee zero message collision, enterprise inquiries route exclusively through <strong className="text-charcoal font-semibold break-all">info@reclaimdao.org</strong>, while support tickets dispatch through <strong className="text-charcoal font-semibold break-all">support@reclaimdao.org</strong>.
              </p>
            </div>
          </div>

          {/* Main Form Container (1st on mobile, 2nd on desktop) */}
          <div className="lg:col-span-7 xl:col-span-8 order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full bg-white border border-[#D4D4CE] shadow-sm overflow-hidden"
              style={{ borderRadius: '0px' }}
            >
              {/* Card Header (Fully Mobile Responsive) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#D4D4CE] bg-[#F8F8F6]">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  {mode === 'inquiry' ? (
                    <>
                      <div
                        className="w-8 h-8 bg-charcoal text-white flex items-center justify-center shrink-0"
                        style={{ borderRadius: '0px' }}
                      >
                        <Building className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-mono font-bold text-charcoal uppercase tracking-wider truncate">
                          Services & Enterprise Inquiries
                        </h3>
                        <p className="text-[10px] sm:text-[11px] font-mono text-coolgray truncate">Node: info@reclaimdao.org</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="w-8 h-8 bg-[#3D7EFF] text-white flex items-center justify-center shrink-0"
                        style={{ borderRadius: '0px' }}
                      >
                        <Headphones className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-mono font-bold text-charcoal uppercase tracking-wider truncate">
                          Contact ReclaimDAO Support
                        </h3>
                        <p className="text-[10px] sm:text-[11px] font-mono text-coolgray truncate">Node: support@reclaimdao.org</p>
                      </div>
                    </>
                  )}
                </div>
                <div
                  className="self-start sm:self-auto text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal bg-white border border-[#D4D4CE] px-2 py-0.5 sm:px-2.5 sm:py-1 shrink-0"
                  style={{ borderRadius: '0px' }}
                >
                  SSL 256-Bit Encrypted
                </div>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="px-3 sm:px-6 pt-3.5 sm:pt-5">
                <div
                  className="grid grid-cols-2 p-1 bg-[#F8F8F6] border border-[#D4D4CE]"
                  style={{ borderRadius: '0px' }}
                >
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('inquiry')}
                    className={`min-h-[42px] flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2 sm:px-3 text-[11px] sm:text-xs md:text-sm font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      mode === 'inquiry'
                        ? 'bg-[#3D7EFF] text-white shadow-sm'
                        : 'text-coolgray hover:text-charcoal bg-transparent'
                    }`}
                    style={{ borderRadius: '0px' }}
                  >
                    <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="truncate">Services Inquiries</span>
                    <span className="hidden md:inline text-[10px] opacity-80 font-mono">(info@)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeSwitch('support')}
                    className={`min-h-[42px] flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2 sm:px-3 text-[11px] sm:text-xs md:text-sm font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      mode === 'support'
                        ? 'bg-[#3D7EFF] text-white shadow-sm'
                        : 'text-coolgray hover:text-charcoal bg-transparent'
                    }`}
                    style={{ borderRadius: '0px' }}
                  >
                    <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="truncate">Contact Support</span>
                    <span className="hidden md:inline text-[10px] opacity-80 font-mono">(support@)</span>
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <div className="p-4 sm:p-6 md:p-8">
                {submitted ? (
                  <div className="py-8 sm:py-12 px-2 sm:px-4 text-center space-y-3.5 sm:space-y-4">
                    <div
                      className="w-14 h-14 sm:w-16 sm:h-16 bg-[#3D7EFF] text-white flex items-center justify-center mx-auto shadow-sm"
                      style={{ borderRadius: '0px' }}
                    >
                      <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>

                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-charcoal text-white font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider"
                      style={{ borderRadius: '0px' }}
                    >
                      <span>Transmission Confirmed</span>
                    </div>

                    <h4 className="text-xl sm:text-3xl font-black text-charcoal tracking-tight">
                      {mode === 'inquiry' ? 'Service Inquiry Dispatched' : 'Support Ticket Transmitted'}
                    </h4>

                    <p className="text-coolgray text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                      {mode === 'inquiry' ? (
                        <>
                          Your inquiry has been routed directly to{' '}
                          <strong className="text-charcoal font-semibold break-all">info@reclaimdao.org</strong>. Our enterprise and solutions team will get in touch with you promptly.
                        </>
                      ) : (
                        <>
                          Your support ticket has been routed directly to{' '}
                          <strong className="text-[#3D7EFF] font-semibold break-all">support@reclaimdao.org</strong>. Our technical liaison team will review and reply to your email promptly.
                        </>
                      )}
                    </p>

                    <div className="pt-3 sm:pt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setSubmitted(false)}
                        className="w-full sm:w-auto min-h-[44px] px-6 py-3 bg-[#3D7EFF] hover:bg-electric-600 text-white font-bold font-mono text-xs sm:text-sm uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                        style={{ borderRadius: '0px' }}
                      >
                        Send Another Message
                      </button>
                    </div>
                  </div>
                ) : mode === 'inquiry' ? (
                  /* INQUIRY FORM (info@reclaimdao.org) */
                  <form onSubmit={handleInquirySubmit} className="space-y-4 sm:space-y-5">
                    {/* Destination Banner */}
                    <div
                      className="p-2.5 sm:p-3 bg-[#F8F8F6] border border-[#D4D4CE] text-center text-[11px] sm:text-xs text-coolgray flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2"
                      style={{ borderRadius: '0px' }}
                    >
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Mail className="w-3.5 h-3.5 text-[#3D7EFF]" />
                        <span>Institutional Inquiries:</span>
                      </div>
                      <strong className="text-charcoal font-bold break-all">info@reclaimdao.org</strong>
                    </div>

                    <div className="text-center pt-0.5 sm:pt-1 pb-1 sm:pb-2">
                      <h4 className="text-lg sm:text-xl font-black text-charcoal tracking-tight">
                        Inquire About ReclaimDAO Solutions
                      </h4>
                      <p className="text-[11px] sm:text-xs font-mono text-coolgray mt-0.5">
                        Submit institutional, forensic, or integration requirements
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      <div>
                        <label className="block font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1 sm:mb-1.5">
                          Full Name <span className="text-[#3D7EFF]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Your full name"
                          value={inquiryForm.name}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                          className="w-full px-3 sm:px-3.5 py-2.5 sm:py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-base sm:text-sm font-medium transition-colors placeholder:text-coolgray/60 min-h-[44px]"
                          style={{ borderRadius: '0px' }}
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1 sm:mb-1.5">
                          Work / Org Email <span className="text-[#3D7EFF]">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="name@company.com"
                          value={inquiryForm.email}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                          className="w-full px-3 sm:px-3.5 py-2.5 sm:py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-base sm:text-sm font-medium transition-colors placeholder:text-coolgray/60 min-h-[44px]"
                          style={{ borderRadius: '0px' }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      <div>
                        <label className="block font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1 sm:mb-1.5">
                          Inquiry Category <span className="text-[#3D7EFF]">*</span>
                        </label>
                        <select
                          value={inquiryForm.category}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, category: e.target.value })}
                          className="w-full px-3 sm:px-3.5 py-2.5 sm:py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-base sm:text-sm font-medium transition-colors min-h-[44px]"
                          style={{ borderRadius: '0px' }}
                        >
                          <option value="Asset Recovery & Refund Services">Asset Recovery & Refund Services</option>
                          <option value="Institutional Verification Protocol">Institutional Verification Protocol</option>
                          <option value="Enterprise Blockchain Engineering">Enterprise Blockchain Engineering</option>
                          <option value="Partnership & Integration">Partnership & Integration</option>
                          <option value="General Service Inquiry">General Service Inquiry</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1 sm:mb-1.5">
                          Subject
                        </label>
                        <input
                          type="text"
                          placeholder="Topic of inquiry"
                          value={inquiryForm.subject}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, subject: e.target.value })}
                          className="w-full px-3 sm:px-3.5 py-2.5 sm:py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-base sm:text-sm font-medium transition-colors placeholder:text-coolgray/60 min-h-[44px]"
                          style={{ borderRadius: '0px' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1 sm:mb-1.5">
                        Project & Requirement Details <span className="text-[#3D7EFF]">*</span>
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Tell us about your organization, loss details, specifications, or timeline..."
                        value={inquiryForm.message}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                        className="w-full px-3 sm:px-3.5 py-2.5 sm:py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-base sm:text-sm font-medium transition-colors placeholder:text-coolgray/60"
                        style={{ borderRadius: '0px' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full min-h-[44px] flex items-center justify-center gap-2 py-3 sm:py-3.5 px-4 sm:px-6 font-mono font-bold text-xs sm:text-sm uppercase tracking-wider text-white bg-[#3D7EFF] hover:bg-electric-600 shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                      style={{ borderRadius: '0px' }}
                    >
                      <Send className="w-4 h-4 shrink-0" />
                      <span>{loading ? 'Transmitting Inquiry...' : 'Send Service Inquiry'}</span>
                    </button>
                  </form>
                ) : (
                  /* SUPPORT FORM (support@reclaimdao.org) */
                  <form onSubmit={handleSupportSubmit} className="space-y-4 sm:space-y-5">
                    {/* Destination Banner */}
                    <div
                      className="p-2.5 sm:p-3 bg-[#F8F8F6] border border-[#D4D4CE] text-center text-[11px] sm:text-xs text-coolgray flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2"
                      style={{ borderRadius: '0px' }}
                    >
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Mail className="w-3.5 h-3.5 text-[#3D7EFF]" />
                        <span>Technical Support:</span>
                      </div>
                      <strong className="text-charcoal font-bold break-all">support@reclaimdao.org</strong>
                    </div>

                    <div className="text-center pt-0.5 sm:pt-1 pb-1 sm:pb-2">
                      <h4 className="text-lg sm:text-xl font-black text-charcoal tracking-tight">
                        How Can We Assist You?
                      </h4>
                      <p className="text-[11px] sm:text-xs font-mono text-coolgray mt-0.5">
                        Submit a priority ticket to our support and victim liaison desk
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      <div>
                        <label className="block font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1 sm:mb-1.5">
                          Full Name <span className="text-[#3D7EFF]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Your full name"
                          value={supportForm.name}
                          onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                          className="w-full px-3 sm:px-3.5 py-2.5 sm:py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-base sm:text-sm font-medium transition-colors placeholder:text-coolgray/60 min-h-[44px]"
                          style={{ borderRadius: '0px' }}
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1 sm:mb-1.5">
                          Email Address <span className="text-[#3D7EFF]">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="your@email.com"
                          value={supportForm.email}
                          onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                          className="w-full px-3 sm:px-3.5 py-2.5 sm:py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-base sm:text-sm font-medium transition-colors placeholder:text-coolgray/60 min-h-[44px]"
                          style={{ borderRadius: '0px' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1 sm:mb-1.5">
                        Subject
                      </label>
                      <input
                        type="text"
                        placeholder="Brief summary of your issue or request"
                        value={supportForm.subject}
                        onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                        className="w-full px-3 sm:px-3.5 py-2.5 sm:py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-base sm:text-sm font-medium transition-colors placeholder:text-coolgray/60 min-h-[44px]"
                        style={{ borderRadius: '0px' }}
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1 sm:mb-1.5">
                        Message <span className="text-[#3D7EFF]">*</span>
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Describe your issue, case ID, transaction hash, or technical question..."
                        value={supportForm.message}
                        onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                        className="w-full px-3 sm:px-3.5 py-2.5 sm:py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-base sm:text-sm font-medium transition-colors placeholder:text-coolgray/60"
                        style={{ borderRadius: '0px' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full min-h-[44px] flex items-center justify-center gap-2 py-3 sm:py-3.5 px-4 sm:px-6 font-mono font-bold text-xs sm:text-sm uppercase tracking-wider text-white bg-[#3D7EFF] hover:bg-electric-600 shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                      style={{ borderRadius: '0px' }}
                    >
                      <Send className="w-4 h-4 shrink-0" />
                      <span>{loading ? 'Transmitting Request...' : 'Submit Support Request'}</span>
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactUs;
