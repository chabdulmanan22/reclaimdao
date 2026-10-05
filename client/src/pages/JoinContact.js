import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getJoinWizard, setJoinWizard } from '../utils/datastore';
import axios from 'axios';
import toast from 'react-hot-toast';

const JoinContact = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialized, setInitialized] = useState(false);

  const [form, setForm] = useState({
    email: '',
    countryCode: '+1',
    phone: '',
    telegramUsername: '',
    address1: '',
    address2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
  });

  // Contact form state
  const [contactMsg, setContactMsg] = useState({ name: '', email: '', message: '' });
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    const wiz = getJoinWizard();
    const d = wiz.details || {};
    const c = wiz.contact || {};
    setForm({
      email: c.email || d.email || '',
      countryCode: c.countryCode || '',
      phone: c.phone || '',
      telegramUsername: c.telegramUsername || '',
      address1: c.address1 || '',
      address2: c.address2 || '',
      city: c.city || '',
      stateProvince: c.stateProvince || '',
      postalCode: c.postalCode || '',
    });
    setInitialized(true);
  }, []);

  const requiredFilled =
    form.email &&
    form.countryCode &&
    form.phone &&
    form.address1 &&
    form.city &&
    form.stateProvince &&
    form.postalCode;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (!requiredFilled) return;
    setJoinWizard({ contact: form });
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    const nextUrl = ref ? `/join-loss?ref=${encodeURIComponent(ref)}` : '/join-loss';
    navigate(nextUrl);
  };

  const handleContactMsgChange = (e) => {
    const { name, value } = e.target;
    setContactMsg((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!contactMsg.name || !contactMsg.email || !contactMsg.message) {
      toast.error('Please fill in all fields.');
      return;
    }
    setSendingMsg(true);
    try {
      await axios.post('/api/mail', {
        to: 'support@reclaimdao.org',
        subject: `Contact Form Message from ${contactMsg.name}`,
        text: `Name: ${contactMsg.name}\nEmail: ${contactMsg.email}\n\nMessage:\n${contactMsg.message}`,
      });
      toast.success('Message sent! We will get back to you soon.');
      setContactMsg({ name: '', email: '', message: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSendingMsg(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-[#0a254d] border border-sky-400/25 p-8 sm:p-10 text-white shadow-2xl"
        >
          <h1 className="text-2xl md:text-3xl font-black mb-6">Contact & <span className="text-[#A85830]">Address</span></h1>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-white mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#061833] border border-sky-400/30 text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm font-semibold"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-white mb-1">Phone Number</label>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  name="countryCode"
                  value={form.countryCode}
                  onChange={handleChange}
                  className="col-span-1 px-4 py-3 rounded-xl bg-[#061833] border border-sky-400/30 text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm font-semibold"
                  placeholder="+1"
                />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="col-span-2 px-4 py-3 rounded-xl bg-[#061833] border border-sky-400/30 text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm font-semibold"
                  placeholder="555-123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-white mb-1">Telegram Username</label>
              <input
                type="text"
                name="telegramUsername"
                value={form.telegramUsername}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#061833] border border-sky-400/30 text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm font-semibold"
                placeholder="@yourusername"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-white mb-1">Street Address</label>
              <input
                type="text"
                name="address1"
                value={form.address1}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#061833] border border-sky-400/30 text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm font-semibold"
                placeholder="123 Main St"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-white mb-1">Street Address Line 2 (Optional)</label>
              <input
                type="text"
                name="address2"
                value={form.address2}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#061833] border border-sky-400/30 text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm font-semibold"
                placeholder="Apt, suite, unit, building, floor, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-white mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-[#061833] border border-sky-400/30 text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm font-semibold"
                  placeholder="San Francisco"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-white mb-1">Province / State</label>
                <input
                  type="text"
                  name="stateProvince"
                  value={form.stateProvince}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-[#061833] border border-sky-400/30 text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm font-semibold"
                  placeholder="CA"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-white mb-1">Postal / ZIP Code</label>
              <input
                type="text"
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#061833] border border-sky-400/30 text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm font-semibold"
                placeholder="94103"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => navigate('/join-details')}
              className="px-6 py-2.5 rounded-xl border border-sky-400/30 text-white hover:bg-[#061833] transition font-bold cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!requiredFilled}
              className={`px-8 py-3 rounded-xl font-black transition cursor-pointer text-white ${requiredFilled
                  ? 'hover:scale-105 shadow-lg'
                  : 'opacity-50 cursor-not-allowed bg-slate-700'
                }`}
              style={requiredFilled ? {
                background: 'linear-gradient(135deg, #A85830 0%, #964d28 50%, #854221 100%)',
                boxShadow: '0 4px 20px rgba(168, 88, 48, 0.4)'
              } : {}}
            >
              Next
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinContact;
