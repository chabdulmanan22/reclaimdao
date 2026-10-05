import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const JoinSubmitted = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state?.prefill || {};

  const handleCreateAccount = () => {
    navigate('/register', { state: { prefill } });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl bg-[#0a254d] border border-sky-400/25 p-8 sm:p-10 text-white max-w-md w-full text-center shadow-2xl"
      >
        {/* Success icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#10b981]/20 border-2 border-[#10b981] flex items-center justify-center shadow-lg shadow-[#10b981]/20">
            <svg className="w-8 h-8 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-black mb-3 text-white">Claim <span className="text-[#A85830]">Submitted!</span></h1>
        <p className="text-white font-bold text-sm mb-8">Your claim will be verified within <span className="text-[#A85830] font-black">48 hours</span>. Create your account now to track your status.</p>

        {/* Pulsing glow ring */}
        <div className="relative inline-block w-full">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#A85830] to-[#ea580c] blur-lg opacity-40 animate-pulse" />
          <motion.button
            onClick={handleCreateAccount}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="relative w-full text-white px-8 py-4 rounded-xl font-black text-lg shadow-xl flex items-center justify-center gap-3 transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #A85830 0%, #964d28 50%, #854221 100%)',
              boxShadow: '0 8px 30px rgba(168, 88, 48, 0.45)'
            }}
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Create Your Account →
          </motion.button>
        </div>

        <p className="text-white font-bold text-xs mt-4">Free to join · Track your claim status · Earn points</p>
      </motion.div>
    </div>
  );
};

export default JoinSubmitted;

