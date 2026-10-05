import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LIVE_RECOVERIES_DATA } from '../data/liveRecoveriesData';
import { X } from 'lucide-react';

const LiveRecoveryNotification = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    if (isDismissed) return;

    // Initial delay before showing first notification
    const startTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(startTimeout);
  }, [isDismissed]);

  useEffect(() => {
    if (isDismissed) return;

    let timer;
    if (isVisible) {
      // Stay visible for 5.0 seconds for comfortable reading
      timer = setTimeout(() => {
        if (!isHoveredRef.current) {
          setIsVisible(false);
        }
      }, 5000);
    } else {
      // Stay hidden for 2.2 seconds before showing next item in sequence
      timer = setTimeout(() => {
        if (!isHoveredRef.current) {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % LIVE_RECOVERIES_DATA.length);
          setIsVisible(true);
        }
      }, 2200);
    }

    return () => clearTimeout(timer);
  }, [isVisible, isDismissed]);

  if (isDismissed) return null;

  const current = LIVE_RECOVERIES_DATA[currentIndex];
  if (!current) return null;

  return (
    <div
      className="fixed bottom-5 left-4 sm:left-6 z-50 pointer-events-none select-none"
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
        if (isVisible) {
          setTimeout(() => setIsVisible(false), 2500);
        }
      }}
    >
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto flex items-center gap-3.5 p-3 sm:p-3.5 bg-white/95 hover:bg-white text-charcoal shadow-[0_8px_30px_rgba(47,47,52,0.12)] border border-[#D4D4CE] hover:border-charcoal backdrop-blur-md transition-all duration-200 max-w-[92vw] sm:max-w-[420px] rounded-none group"
            style={{ borderRadius: '0px' }}
          >
            {/* Square Portrait Photo (Choras Shape with Sharp 0px Corners) */}
            <div className="relative shrink-0">
              <img
                src={current.image}
                alt={current.name}
                className="w-12 h-12 sm:w-13 sm:h-13 object-cover rounded-none border border-[#D4D4CE] shadow-2xs group-hover:scale-102 transition-transform duration-200"
                style={{ borderRadius: '0px' }}
              />
              <span
                className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#10B981] border border-white rounded-none"
                style={{ borderRadius: '0px' }}
                title="Verified Live Recovery"
              />
            </div>

            {/* Notification Text with Primary Brand Typography */}
            <div className="flex-1 min-w-0 pr-1 text-left">
              <p className="text-[12px] sm:text-[13px] text-charcoal leading-snug">
                <strong className="font-bold text-charcoal">{current.name}</strong>
                <span className="text-coolgray"> from </span>
                <span className="font-semibold text-charcoal/90">{current.location}</span>
                <span className="text-coolgray"> just recovered </span>
                <strong className="font-black text-[#10B981] whitespace-nowrap">
                  {current.amount}
                </strong>
              </p>

              {/* Micro Status Badges Row */}
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-charcoal">
                  <span
                    className="w-1.5 h-1.5 bg-[#10B981] inline-block"
                    style={{ borderRadius: '0px' }}
                  />
                  <span>{current.status || 'Verified Restitution'}</span>
                </span>
                <span className="text-[#D4D4CE]">•</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-coolgray font-semibold">
                  CASE #{current.id}
                </span>
              </div>
            </div>

            {/* Close Button: Strict Sharp 0px Square */}
            <button
              onClick={() => setIsDismissed(true)}
              className="shrink-0 w-6 h-6 rounded-none border border-transparent hover:border-[#D4D4CE] flex items-center justify-center text-coolgray hover:text-charcoal hover:bg-[#F4F4F0] transition-colors cursor-pointer"
              style={{ borderRadius: '0px' }}
              title="Dismiss"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveRecoveryNotification;
