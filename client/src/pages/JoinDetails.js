import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getJoinWizard, setJoinWizard } from '../utils/datastore';

const JoinDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ firstName: '', lastName: '', gender: '', dob: '' });

  useEffect(() => {
    const wiz = getJoinWizard();
    const d = wiz.details || {};
    setForm({
      firstName: d.firstName || '',
      lastName: d.lastName || '',
      gender: d.gender || '',
      dob: d.dob || '',
    });
    try {
      const params = new URLSearchParams(location.search);
      let ref = params.get('ref');
      const email = params.get('email');
      if (!ref) ref = localStorage.getItem('landingReferralCode');
      const contact = wiz.contact || {};
      const mergedContact = { ...contact };
      if (email) mergedContact.email = email;
      const updates = { details: d, contact: mergedContact };
      if (ref) updates.referralCode = ref;
      setJoinWizard(updates);
    } catch { }
  }, []);

  const isValid = form.firstName && form.lastName && form.gender && form.dob;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (!isValid) return;
    setJoinWizard({ details: form });
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    const nextUrl = ref ? `/join-contact?ref=${encodeURIComponent(ref)}` : '/join-contact';
    navigate(nextUrl);
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
          <h1 className="text-2xl md:text-3xl font-black mb-6">Personal <span className="text-[#A85830]">Details</span></h1>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-white mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-[#061833] border border-sky-400/30 text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm font-semibold"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-white mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-[#061833] border border-sky-400/30 text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm font-semibold"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-white mb-2">Gender</label>
              <div className="flex items-center gap-6">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={form.gender === 'male'}
                    onChange={handleChange}
                    className="accent-[#A85830] w-4 h-4"
                  />
                  <span className="text-sm font-bold text-white">Male</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={form.gender === 'female'}
                    onChange={handleChange}
                    className="accent-[#A85830] w-4 h-4"
                  />
                  <span className="text-sm font-bold text-white">Female</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-white mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#061833] border border-sky-400/30 text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm font-semibold"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => navigate('/join-notice')}
              className="px-6 py-2.5 rounded-xl border border-sky-400/30 text-white hover:bg-[#061833] transition font-bold cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!isValid}
              className={`px-8 py-3 rounded-xl font-black transition cursor-pointer text-white ${isValid
                  ? 'hover:scale-105 shadow-lg'
                  : 'opacity-50 cursor-not-allowed bg-slate-700'
                }`}
              style={isValid ? {
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

export default JoinDetails;