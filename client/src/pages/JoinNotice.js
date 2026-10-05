import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { clearJoinWizard, setJoinWizard } from '../utils/datastore';


const JoinNotice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const ref = searchParams.get('ref');

  useEffect(() => {
    clearJoinWizard();
    if (ref) {
      setJoinWizard({ referralCode: ref });
    }
  }, [ref]);

  const handleNext = () => {
    const nextUrl = ref ? `/join-details?ref=${encodeURIComponent(ref)}` : '/join-details';
    navigate(nextUrl);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a254d] rounded-3xl p-6 sm:p-10 border border-sky-400/25 text-white shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-[#A85830]" />
            <h1 className="text-2xl sm:text-3xl font-black">Important <span className="text-[#A85830]">Notice</span></h1>
          </div>

          <div className="space-y-4 text-white text-sm sm:text-base leading-relaxed font-bold">
            <p>
              Please read carefully before proceeding. ReclaimDAO helps eligible fraud victims access refund allocations through structured verification.
            </p>
            <p>
              To process your request accurately, you will need to provide basic incident details, your contact email, and documentation or transaction hashes related to your loss.
            </p>
            <p>
              All submitted evidence is encrypted and reviewed securely by our verification system.
            </p>
            <p className="font-bold text-red-300 bg-red-950/60 p-4 rounded-xl border border-red-500/40">
              🔺 Warning: Any individual found to have submitted false or misleading information may be disqualified from recovery assistance and could be prosecuted for fraud or attempted extortion.
            </p>
            <p>
              By completing this form, you confirm that the information provided is accurate to the best of your knowledge. If you are unsure about any details, we recommend you review your records before submitting.
            </p>
            <p>
              Thank you for your cooperation.
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-xl border border-sky-400/30 text-white hover:bg-[#061833] transition font-bold cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-8 py-3 rounded-xl text-white font-black shadow-lg transition cursor-pointer hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #A85830 0%, #964d28 50%, #854221 100%)',
                boxShadow: '0 4px 20px rgba(168, 88, 48, 0.4)'
              }}
            >
              Next
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JoinNotice;