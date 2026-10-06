import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, ArrowRight, ArrowLeft, Clock } from 'lucide-react';

const JoinThankYou = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-charcoal py-8 sm:py-16 md:py-20 flex items-center justify-center px-3 sm:px-6 lg:px-8 selection:bg-[#3D7EFF] selection:text-white">
      <div className="max-w-2xl w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-[#D4D4CE] p-6 sm:p-10 md:p-12 shadow-sm text-center space-y-6"
          style={{ borderRadius: '0px' }}
        >
          {/* Architectural Success Icon */}
          <div
            className="w-14 h-14 bg-[#3D7EFF] text-white mx-auto flex items-center justify-center shadow-sm"
            style={{ borderRadius: '0px' }}
          >
            <Check className="w-7 h-7 stroke-[3]" />
          </div>

          {/* Eyebrow Badge */}
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#D4D4CE] text-charcoal font-mono text-[11px] font-bold uppercase tracking-wider shadow-xs mb-2"
              style={{ borderRadius: '0px' }}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#3D7EFF]" />
              <span>Claim Dossier Ingested • Protocol Receipt</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-charcoal tracking-tight mt-1">
              Claim Successfully <span className="text-[#3D7EFF]">Submitted</span>
            </h1>

            <p className="text-xs sm:text-sm text-coolgray max-w-lg mx-auto mt-2 leading-relaxed font-normal">
              Your restitution dossier has been cataloged into the ReclaimDAO evidentiary audit queue. On-chain telemetry and submitted hashes will undergo forensic review within 48 business hours.
            </p>
          </div>

          {/* Process Timeline Box */}
          <div
            className="bg-[#F8F8F6] border border-[#D4D4CE] p-4 sm:p-5 text-left font-mono text-xs space-y-3"
            style={{ borderRadius: '0px' }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#D4D4CE]">
              <span className="text-coolgray uppercase font-bold text-[10px]">Transmission Status</span>
              <span className="text-emerald-600 font-black uppercase text-[10px] flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" /> Ingested & Signed
              </span>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <Clock className="w-4 h-4 text-[#3D7EFF] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-charcoal">Next Steps: Review & Restitution Allocation</p>
                <p className="text-coolgray text-[11px] mt-0.5 leading-relaxed font-sans">
                  Access your claimant dashboard to monitor claim verification progress, participate in consensus voting, and manage your cryptographic routing settings.
                </p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-[#F8F8F6] text-charcoal border border-[#D4D4CE] font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              style={{ borderRadius: '0px' }}
            >
              <ArrowLeft className="w-4 h-4 text-coolgray" />
              <span>Back to Home</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#3D7EFF] hover:bg-blue-600 active:scale-[0.99] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer min-h-[44px]"
              style={{ borderRadius: '0px' }}
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinThankYou;