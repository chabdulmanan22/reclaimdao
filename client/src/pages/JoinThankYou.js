import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const JoinThankYou = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-[#0a254d] border border-sky-400/25 p-8 sm:p-10 text-white text-center shadow-2xl"
        >
          <h1 className="text-2xl md:text-3xl font-black mb-4">Thank <span className="text-[#A85830]">You</span></h1>
          <p className="text-white font-bold mb-6">You have successfully submitted your claim application.</p>
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-xl border border-sky-400/30 text-white hover:bg-[#061833] transition font-bold cursor-pointer"
            >
              Back to Home
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 rounded-xl text-white font-black shadow-lg transition cursor-pointer hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #A85830 0%, #964d28 50%, #854221 100%)',
                boxShadow: '0 4px 20px rgba(168, 88, 48, 0.4)'
              }}
            >
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinThankYou;