import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';

const DEFAULT_TRUSTPILOT = {
  title: 'Excellent',
  starRating: '4.5',
  subheading: 'We’ve helped over 10,000+ fraud victims already!',
  reviewCount: '780 reviews',
  reviewLink: 'https://www.trustpilot.com/review/reclaimdao.org',
  buttonText: 'Are you a victim? Request a refund'
};

const TrustpilotSection = () => {
  const [data, setData] = useState(DEFAULT_TRUSTPILOT);
  const navigate = useNavigate();

  useEffect(() => {
    loadTrustpilotData();
    window.addEventListener('datastore:update', loadTrustpilotData);
    return () => window.removeEventListener('datastore:update', loadTrustpilotData);
  }, []);

  const loadTrustpilotData = async () => {
    try {
      const res = await axios.get('/api/settings/TRUSTPILOT_DATA');
      const val = res.data?.data?.value;
      if (val && typeof val === 'object') {
        setData({
          title: val.title || DEFAULT_TRUSTPILOT.title,
          starRating: val.starRating || DEFAULT_TRUSTPILOT.starRating,
          subheading: val.subheading || DEFAULT_TRUSTPILOT.subheading,
          reviewCount: val.reviewCount || DEFAULT_TRUSTPILOT.reviewCount,
          reviewLink: val.reviewLink || DEFAULT_TRUSTPILOT.reviewLink,
          buttonText: (val.buttonText || DEFAULT_TRUSTPILOT.buttonText).replace('→', '').trim()
        });
      }
    } catch (_) {}
  };

  const handleAction = () => {
    const ref = localStorage.getItem('landingReferralCode');
    navigate(ref ? `/join-notice?ref=${encodeURIComponent(ref)}` : '/join-notice');
  };

  const renderStars = () => {
    const numericRating = parseFloat(data.starRating || 4.5);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (numericRating >= i) {
        stars.push(
          <div
            key={i}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-[#00b67a] flex items-center justify-center rounded-none shadow-xs"
            style={{ borderRadius: '0px' }}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-white" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </div>
        );
      } else if (numericRating >= i - 0.5) {
        stars.push(
          <div
            key={i}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-[#D4D4CE] relative overflow-hidden rounded-none shadow-xs"
            style={{ borderRadius: '0px' }}
          >
            <div className="absolute top-0 left-0 bottom-0 w-1/2 bg-[#00b67a]"></div>
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-white" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
          </div>
        );
      } else {
        stars.push(
          <div
            key={i}
            className="w-7 h-7 sm:w-8 sm:h-8 bg-[#D4D4CE] flex items-center justify-center rounded-none shadow-xs"
            style={{ borderRadius: '0px' }}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-white" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </div>
        );
      }
    }
    return stars;
  };

  return (
    <section className="w-full bg-white text-charcoal py-20 px-4 sm:px-6 lg:px-8 border-b border-[#D4D4CE] relative overflow-hidden">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center space-y-7 relative z-10">
        {/* Minimalist Top Indicator */}
        <div className="inline-flex items-center text-xs font-bold tracking-widest text-coolgray uppercase">
          <span>Independent Social Proof</span>
        </div>

        {/* Main Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-charcoal"
        >
          Rated <span className="text-[#3D7EFF]">{data.title || 'Excellent'}</span> on Trustpilot.
        </motion.h2>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-sm sm:text-base md:text-lg text-coolgray font-medium max-w-xl leading-relaxed"
        >
          {data.subheading}
        </motion.p>

        {/* Architectural Trustpilot Rating Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-none p-6 sm:p-8 flex flex-col items-center justify-center space-y-4 shadow-sm hover:shadow-md max-w-sm w-full transition-all bg-[#F4F4F0] border border-[#D4D4CE] hover:border-charcoal text-center"
          style={{ borderRadius: '0px' }}
        >
          {/* Top Row: Trustpilot Brand & Badge */}
          <div className="flex items-center justify-between w-full pb-3 border-b border-[#D4D4CE]/60">
            <a
              href={data.reviewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 group cursor-pointer"
            >
              <svg className="w-5 h-5 text-[#00b67a] fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span className="text-base font-bold tracking-tight text-charcoal group-hover:text-[#3D7EFF] transition-colors">
                Trustpilot
              </span>
            </a>
            <span
              className="text-[9px] font-mono font-semibold uppercase tracking-wider text-coolgray px-2 py-0.5 bg-white border border-[#D4D4CE] rounded-none"
              style={{ borderRadius: '0px' }}
            >
              Verified
            </span>
          </div>

          {/* Rating Title */}
          <div className="text-xl sm:text-2xl font-black tracking-tight text-charcoal">
            {data.title}
          </div>

          {/* 5 Stars Graphic (Sharp Corners) */}
          <div className="flex items-center space-x-1.5 py-0.5">
            {renderStars()}
          </div>

          {/* Review Link */}
          <div className="text-xs sm:text-sm text-charcoal font-medium pt-1">
            Based on{' '}
            <a
              href={data.reviewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline text-charcoal hover:text-[#3D7EFF] transition-colors cursor-pointer"
            >
              {data.reviewCount}
            </a>
          </div>
        </motion.div>

        {/* Action Button: Pure Matte Sharp-Cornered */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-2 w-full flex justify-center"
        >
          <button
            onClick={handleAction}
            className="btn-primary rounded-none px-8 py-4 text-sm sm:text-base font-bold tracking-wide text-white shadow-none hover:bg-electric-600 flex items-center justify-center gap-3 cursor-pointer w-full sm:w-auto max-w-sm"
            style={{
              borderRadius: '0px',
              backgroundColor: '#3D7EFF',
              boxShadow: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{data.buttonText}</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustpilotSection;