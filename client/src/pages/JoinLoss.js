import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { addJoinApplication as dsAddJoinApplication, getJoinWizard, setJoinWizard } from '../utils/datastore';

const JoinLoss = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialized, setInitialized] = useState(false);

  const [form, setForm] = useState({ totalAmount: '', breakdown: '', period: '' });

  useEffect(() => {
    const wiz = getJoinWizard();
    const l = wiz.loss || {};
    setForm({
      totalAmount: l.totalAmount || '',
      breakdown: l.breakdown || '',
      period: l.period || '',
    });
    setInitialized(true);
  }, []);

  const requiredFilled = form.totalAmount && form.period;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!requiredFilled) return;
    const wiz = getJoinWizard();
    const details = wiz.details || {};
    const contact = wiz.contact || {};

    // Check URL first, then wiz, then localStorage
    const params = new URLSearchParams(location.search);
    const referralCode = params.get('ref') || wiz.referralCode || localStorage.getItem('landingReferralCode') || undefined;

    const combinedPrefill = { ...details, ...contact, ...form };
    setJoinWizard({ loss: form });

    setSubmitting(true);
    try {
      await axios.post('/api/join', {
        firstName: combinedPrefill.firstName,
        lastName: combinedPrefill.lastName,
        email: combinedPrefill.email,
        details: combinedPrefill,
        referralCode
      });
      // Optional: keep saving locally for some components if they depend on it
      dsAddJoinApplication({
        firstName: combinedPrefill.firstName,
        lastName: combinedPrefill.lastName,
        email: combinedPrefill.email,
        details: combinedPrefill,
        referralCode
      });
      navigate('/join-submitted', { state: { prefill: { ...combinedPrefill, referralCode } } });
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
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
          <h1 className="text-2xl md:text-3xl font-black mb-6">Loss <span className="text-[#A85830]">Details</span></h1>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-white mb-1">
                Total Amount Lost
              </label>
              <p className="text-xs text-white mb-2 font-bold">
                Enter the total amount lost across all companies. Use USD or specify the currency.
              </p>
              <input
                type="text"
                name="totalAmount"
                value={form.totalAmount}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#061833] border border-sky-400/30 text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm font-semibold"
                placeholder="$3,500 USD"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-white mb-1">
                Breakdown of Loss by Company
              </label>
              <p className="text-xs text-white mb-2 font-bold">
                If the loss was spread across multiple companies, list each company with the corresponding amount.
                Example: Company A – $2,000, Company B – $1,500
              </p>
              <textarea
                name="breakdown"
                value={form.breakdown}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-3 rounded-xl bg-[#061833] border border-sky-400/30 text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm font-semibold"
                placeholder="Company A – $2,000&#10;Company B – $1,500"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-white mb-1">Period of Incident</label>
              <p className="text-xs text-white mb-2 font-bold">
                Enter the time period over which the loss occurred. Example: 2016 – 2025
              </p>
              <input
                type="text"
                name="period"
                value={form.period}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#061833] border border-sky-400/30 text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm font-semibold"
                placeholder="2016 – 2025"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => navigate('/join-contact')}
              className="px-6 py-2.5 rounded-xl border border-sky-400/30 text-white hover:bg-[#061833] transition font-bold cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!requiredFilled || submitting}
              className={`px-8 py-3 rounded-xl font-black transition cursor-pointer text-white ${!requiredFilled || submitting
                  ? 'opacity-50 cursor-not-allowed bg-slate-700'
                  : 'hover:scale-105 shadow-lg'
                }`}
              style={requiredFilled && !submitting ? {
                background: 'linear-gradient(135deg, #A85830 0%, #964d28 50%, #854221 100%)',
                boxShadow: '0 4px 20px rgba(168, 88, 48, 0.4)'
              } : {}}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinLoss;