import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Vote, TrendingUp, DollarSign, BarChart3, ArrowRight, CheckCircle, ShieldCheck, Sparkles, Activity, Lock, ArrowUpRight, Award } from 'lucide-react';
import StaticResourceCard from '../components/StaticResourceCard';
import LiveRecoveryNotification from '../components/LiveRecoveryNotification';
import { STATIC_FEATURED_RESOURCES } from '../data/staticFeaturedResources';
import heroVisual from '../assets/hero-visual.jpg';

import L1Img from '../assets/hero-cards/L1.webp';
import L2Img from '../assets/hero-cards/L2.webp';
import L3Img from '../assets/hero-cards/L3.webp';
import L4Img from '../assets/hero-cards/L4.webp';
import L5Img from '../assets/hero-cards/L5.webp';
import L6Img from '../assets/hero-cards/L6.webp';
import L7Img from '../assets/hero-cards/L7.webp';
import L8Img from '../assets/hero-cards/L8.webp';
import L9Img from '../assets/hero-cards/L9.webp';
import L10Img from '../assets/hero-cards/L10.webp';
import L11Img from '../assets/hero-cards/L11.webp';
import L12Img from '../assets/hero-cards/L12.webp';
import L13Img from '../assets/hero-cards/L13.webp';

// 13 Restitution Cases in 7 Columns (WebP Portraits, Bold Names, Thin Country/State/City)
const MODULE_COLUMNS = [
  {
    colIndex: 1,
    cards: [
      {
        id: '01',
        name: 'Robert H. Miller',
        location: 'Austin, Texas • USA',
        image: L1Img,
        tag: 'CASE #01 • VERIFIED',
        status: 'Restitution Approved',
        refundedAmount: '$184,500 Refunded',
      },
      {
        id: '02',
        name: 'Marcus Vance',
        location: 'Brisbane, Queensland • Australia',
        image: L2Img,
        tag: 'CASE #02 • VERIFIED',
        status: 'Claim Documented',
        refundedAmount: '$92,400 Refunded',
      },
    ],
  },
  {
    colIndex: 2,
    cards: [
      {
        id: '03',
        name: 'Alastair Sterling',
        location: 'London, Greater London • UK',
        image: L3Img,
        tag: 'CASE #03 • VERIFIED',
        status: 'Restitution In Progress',
        refundedAmount: '$245,000 Refunded',
      },
      {
        id: '04',
        name: 'Chloe Martinez',
        location: 'San Diego, California • USA',
        image: L4Img,
        tag: 'CASE #04 • ACTIVE',
        status: 'Recovery Allocated',
        active: true,
        refundedAmount: '$130,000 Refunded',
      },
    ],
  },
  {
    colIndex: 3,
    cards: [
      {
        id: '05',
        name: 'Sophie Campbell',
        location: 'Melbourne, Victoria • Australia',
        image: L5Img,
        tag: 'CASE #05 • VERIFIED',
        status: 'Forensic Verified',
        refundedAmount: '$278,000 Refunded',
      },
      {
        id: '06',
        name: 'Gemma Thornton',
        location: 'Manchester, Greater Manchester • UK',
        image: L6Img,
        tag: 'CASE #06 • VERIFIED',
        status: 'Asset Traced',
        refundedAmount: '$115,200 Refunded',
      },
    ],
  },
  {
    colIndex: 4,
    cards: [
      {
        id: '07',
        name: 'Dr. Lucas Bennett',
        location: 'Denver, Colorado • USA',
        image: L7Img,
        tag: 'CASE #07 • VERIFIED',
        status: 'Claim Documented',
        refundedAmount: '$198,000 Refunded',
      },
      {
        id: '08',
        name: 'Charlotte Hayes',
        location: 'Sydney, New South Wales • Australia',
        image: L8Img,
        tag: 'CASE #08 • VERIFIED',
        status: 'Restitution In Progress',
        refundedAmount: '$86,500 Refunded',
      },
    ],
  },
  {
    colIndex: 5,
    cards: [
      {
        id: '09',
        name: 'David Kowalski',
        location: 'Chicago, Illinois • USA',
        image: L9Img,
        tag: 'CASE #09 • VERIFIED',
        status: 'Claim Documented',
        refundedAmount: '$210,000 Refunded',
      },
      {
        id: '10',
        name: 'Oliver Wright',
        location: 'Birmingham, West Midlands • UK',
        image: L10Img,
        tag: 'CASE #10 • VERIFIED',
        status: 'Claim Documented',
        refundedAmount: '$142,800 Refunded',
      },
    ],
  },
  {
    colIndex: 6,
    cards: [
      {
        id: '11',
        name: 'Marcus J. Reynolds',
        location: 'Atlanta, Georgia • USA',
        image: L11Img,
        tag: 'CASE #11 • VERIFIED',
        status: 'Claim Verified',
        refundedAmount: '$265,000 Refunded',
      },
      {
        id: '12',
        name: 'Kwame Adewale',
        location: 'Bristol, South West England • UK',
        image: L12Img,
        tag: 'CASE #12 • VERIFIED',
        status: 'Restitution Approved',
        refundedAmount: '$158,400 Refunded',
      },
    ],
  },
  {
    colIndex: 7,
    cards: [
      {
        id: '13',
        name: 'Graeme MacIntyre',
        location: 'Perth, Western Australia • Australia',
        image: L13Img,
        tag: 'CASE #13 • VERIFIED',
        status: 'Claim Documented',
        refundedAmount: '$289,000 Refunded',
      },
    ],
  },
];

const ALL_CARDS = MODULE_COLUMNS.flatMap((col) => col.cards);

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const heroScrollRef = useRef(null);
  const trackRef = useRef(null);
  const [trackShift, setTrackShift] = useState({ totalScroll: 1530 });

  useEffect(() => {
    const calcDimensions = () => {
      if (trackRef.current) {
        const fullTrackWidth = trackRef.current.scrollWidth;
        // Visible container width (596px on desktop, or clientWidth on mobile/tablet)
        const visibleContainerWidth = trackRef.current.parentElement?.clientWidth || 596;
        // Total travel needed so that the very last card (Column 7) stops
        // precisely flush at the right edge of the cards container, leaving NO trailing empty space:
        const maxScroll = Math.max(fullTrackWidth - visibleContainerWidth, 0);
        setTrackShift({
          totalScroll: maxScroll,
        });
      }
    };
    calcDimensions();
    window.addEventListener('resize', calcDimensions);
    return () => window.removeEventListener('resize', calcDimensions);
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroScrollRef,
    offset: ['start 80px', 'end end'],
  });

  // Left Content Scroll Transformations (fades out and scrolls up smoothly)
  const leftOpacity = useTransform(scrollYProgress, [0, 0.16], [1, 0]);
  const leftY = useTransform(scrollYProgress, [0, 0.16], [0, -130]);
  const leftPointerEvents = useTransform(scrollYProgress, (v) => (v > 0.12 ? 'none' : 'auto'));

  // Cards Horizontal Track Transformation:
  // Glides smoothly from 0 to -totalScroll, stopping when the last card aligns with the right edge
  const cardsX = useTransform(
    scrollYProgress,
    [0, 0.88, 1],
    [0, -trackShift.totalScroll, -trackShift.totalScroll]
  );

  // Columns 3 to 7 Opacity: strictly 0 at scroll 0, smoothly fading in during scroll
  const col3Opacity = useTransform(scrollYProgress, [0.06, 0.18], [0, 1]);
  const col4Opacity = useTransform(scrollYProgress, [0.18, 0.32], [0, 1]);
  const col5Opacity = useTransform(scrollYProgress, [0.32, 0.46], [0, 1]);
  const col6Opacity = useTransform(scrollYProgress, [0.46, 0.60], [0, 1]);
  const col7Opacity = useTransform(scrollYProgress, [0.60, 0.74], [0, 1]);

  // Columns 3 to 7 Visibility & Pointer Events: completely hidden before scroll starts
  const col3Visibility = useTransform(scrollYProgress, (v) => (v < 0.03 ? 'hidden' : 'visible'));
  const col4Visibility = useTransform(scrollYProgress, (v) => (v < 0.15 ? 'hidden' : 'visible'));
  const col5Visibility = useTransform(scrollYProgress, (v) => (v < 0.28 ? 'hidden' : 'visible'));
  const col6Visibility = useTransform(scrollYProgress, (v) => (v < 0.42 ? 'hidden' : 'visible'));
  const col7Visibility = useTransform(scrollYProgress, (v) => (v < 0.55 ? 'hidden' : 'visible'));

  const col3PointerEvents = useTransform(scrollYProgress, (v) => (v < 0.03 ? 'none' : 'auto'));
  const col4PointerEvents = useTransform(scrollYProgress, (v) => (v < 0.15 ? 'none' : 'auto'));
  const col5PointerEvents = useTransform(scrollYProgress, (v) => (v < 0.28 ? 'none' : 'auto'));
  const col6PointerEvents = useTransform(scrollYProgress, (v) => (v < 0.42 ? 'none' : 'auto'));
  const col7PointerEvents = useTransform(scrollYProgress, (v) => (v < 0.55 ? 'none' : 'auto'));

  // Dynamic progress tracker line width
  const progressPercent = useTransform(scrollYProgress, [0, 0.88], ['15%', '100%']);

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const ref = params.get('ref');
      if (ref) localStorage.setItem('landingReferralCode', ref);
    } catch {}
  }, [location.search]);

  const features = [
    {
      icon: DollarSign,
      tag: 'PILLAR • 01',
      title: 'Proof-of-Loss Tokens (RFND)',
      description: 'Eligible victims receive non-transferable on-chain tokens representing verified losses, granting access to private liquidity pools for secure fund recovery.'
    },
    {
      icon: TrendingUp,
      tag: 'PILLAR • 02',
      title: 'Restitution Distribution',
      description: 'Recovered cryptocurrency from government actions and civil forfeitures is pooled into secure smart contracts for automated, fair distribution.'
    },
    {
      icon: ShieldCheck,
      tag: 'PILLAR • 03',
      title: 'Victim Verification',
      description: 'Strict verification protocols ensure only legitimate scam victims can claim tokens and participate in the restitution process.'
    },
    {
      icon: Vote,
      tag: 'PILLAR • 04',
      title: 'Community Governance',
      description: 'Participate in transparent voting to provide feedback on recovery campaigns and fund distribution, helping improve future efforts and promote accountability.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-charcoal">
      {/* 
        ============================================================
        MINIMALIST ARCHITECTURAL HERO SECTION
        Inspiration: Clean minimalism with architectural line art & 2x2 cards
        Palette: Charcoal (#2F2F34), Cool Gray (#8B9098), Electric Blue (#3D7EFF)
        ============================================================
      */}
      {/* 
        ============================================================
        DESKTOP HERO SECTION (Horizontal expanding & sliding cards)
        ============================================================
      */}
      <div className="hidden lg:block">
        {/* Outer Scroll Runway for Pinned Hero Interaction */}
        <div ref={heroScrollRef} className="relative w-full" style={{ height: '360vh' }}>
          {/* Sticky Pinned Hero Stage */}
          <section
            className="sticky top-20 w-full h-[calc(100vh-5rem)] min-h-[600px] flex flex-col justify-center items-center overflow-hidden px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 bg-[#E8E8E3] border-b border-[#D4D4CE]"
          >
          {/* Main Hero Container */}
          <div className="relative z-10 w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-14 overflow-visible">
            
            {/* Left Column: Minimalist Content (Scrolls up and fades out smoothly) */}
            <motion.div
              style={{
                opacity: leftOpacity,
                y: leftY,
                pointerEvents: leftPointerEvents,
              }}
              className="w-full lg:w-[46%] text-left flex-shrink-0"
            >
              {/* Inner wrapper with 1.5s load entrance animation */}
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                {/* Minimalist Top Indicator */}
                <div className="inline-flex items-center text-xs font-semibold tracking-wider text-coolgray uppercase">
                  <span>Decentralized Restitution Protocol</span>
                </div>

                {/* Main Headline */}
                <div className="space-y-3">
                  <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-charcoal tracking-tight leading-[1.08]">
                    ReclaimDAO
                    <span className="block text-xl sm:text-2xl lg:text-[28px] font-semibold text-charcoal/85 mt-2 tracking-normal leading-snug">
                      Reclaim What Is Rightfully Yours together.
                    </span>
                  </h1>
                </div>

                {/* Narrative Description */}
                <div className="space-y-3.5 max-w-xl text-coolgray text-sm sm:text-base leading-relaxed">
                  <p className="font-medium text-charcoal/85">
                    A community-driven nonprofit initiative helping victims of fraud and digital-asset theft navigate the path toward recovery.
                  </p>
                  <p className="text-coolgray text-xs sm:text-sm">
                    ReclaimDAO is a decentralized recovery ecosystem designed to identify legitimate claims, document verified losses, coordinate recovery initiatives, and support eligible victims through transparent, accountable processes.
                  </p>
                </div>

                {/* Action Button: Pure Matte Sharp-Cornered */}
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <button
                    onClick={() => {
                      const ref = localStorage.getItem('landingReferralCode');
                      navigate(ref ? `/join-notice?ref=${encodeURIComponent(ref)}` : '/join-notice');
                    }}
                    className="btn-primary rounded-none px-8 py-4 text-sm font-semibold tracking-wide text-white shadow-none hover:bg-electric-600 flex items-center gap-3 cursor-pointer"
                    style={{
                      borderRadius: '0px',
                      backgroundColor: '#3D7EFF',
                      boxShadow: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>Affected by Fraud? Submit a Claim</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column / Expanding Cards Stage (2.0s load entrance animation) */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
              className="w-full lg:w-[596px] overflow-visible flex-shrink-0"
            >
              
              {/* Active Protocols Counter */}
              <div className="flex items-center justify-between mb-3 px-1 text-xs text-charcoal font-medium">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-wider uppercase text-charcoal text-[11px] sm:text-xs">
                    Verified Claims
                  </span>
                </div>
              </div>

              {/* The Expanding 13 Cards Track (2 parallel rows, 7 columns) */}
              <motion.div
                ref={trackRef}
                style={{ x: cardsX }}
                className="flex gap-4 w-max overflow-visible"
              >
                {MODULE_COLUMNS.map((col) => {
                  let colOpacity = undefined;
                  let colVisibility = undefined;
                  let colPointerEvents = undefined;
                  if (col.colIndex === 3) {
                    colOpacity = col3Opacity;
                    colVisibility = col3Visibility;
                    colPointerEvents = col3PointerEvents;
                  }
                  if (col.colIndex === 4) {
                    colOpacity = col4Opacity;
                    colVisibility = col4Visibility;
                    colPointerEvents = col4PointerEvents;
                  }
                  if (col.colIndex === 5) {
                    colOpacity = col5Opacity;
                    colVisibility = col5Visibility;
                    colPointerEvents = col5PointerEvents;
                  }
                  if (col.colIndex === 6) {
                    colOpacity = col6Opacity;
                    colVisibility = col6Visibility;
                    colPointerEvents = col6PointerEvents;
                  }
                  if (col.colIndex === 7) {
                    colOpacity = col7Opacity;
                    colVisibility = col7Visibility;
                    colPointerEvents = col7PointerEvents;
                  }

                  return (
                    <motion.div
                      key={`col-${col.colIndex}`}
                      style={{
                        ...(colOpacity ? { opacity: colOpacity } : {}),
                        ...(colVisibility ? { visibility: colVisibility } : {}),
                        ...(colPointerEvents ? { pointerEvents: colPointerEvents } : {}),
                      }}
                      className="flex flex-col gap-4 w-[280px] sm:w-[290px] flex-shrink-0"
                    >
                      {col.cards.map((card) => (
                        <div
                          key={card.id}
                          onClick={() => navigate(`/cases/${card.id}`)}
                          className={`group relative overflow-hidden rounded-none border border-[#D4D4CE] ${
                            col.colIndex === 7 ? 'h-full min-h-[500px]' : 'h-[240px] sm:h-[250px]'
                          } flex flex-col justify-end transition-all duration-300 hover:border-charcoal cursor-pointer shadow-sm`}
                          style={{ borderRadius: '0px' }}
                          role="button"
                          tabIndex={0}
                          title={`Read Case #${card.id} - ${card.name}'s Story`}
                        >
                          {/* Full-bleed WebP Image (covers full card to borders) */}
                          <img
                            src={card.image}
                            alt={card.name}
                            className="absolute inset-0 w-full h-full object-cover object-center filter contrast-[1.03] brightness-[0.97] group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                            loading="lazy"
                          />

                          {/* Smooth Bottom Gradient Overlay for High Text Contrast */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

                          {/* Top Right Refunded Amount Badge */}
                          <div className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 z-20 pointer-events-none">
                            <div
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-sm border border-[#D4D4CE] text-charcoal font-mono text-[11px] sm:text-xs font-bold tracking-tight shadow-xs group-hover:border-charcoal transition-colors duration-200"
                              style={{ borderRadius: '0px' }}
                            >
                              <span className="w-1.5 h-1.5 bg-[#10B981] inline-block"></span>
                              <span>{card.refundedAmount}</span>
                            </div>
                          </div>

                          {/* Bottom Content: Bold Name, Thin Location, and Black Arrow in Right Bottom Corner */}
                          <div className="relative z-10 p-4 sm:p-5 flex items-end justify-between gap-3 w-full">
                            <div className="space-y-0.5 min-w-0 pr-2">
                              <h3 className="font-bold text-white text-[15px] sm:text-base leading-snug tracking-tight truncate drop-shadow-sm">
                                {card.name}
                              </h3>
                              <p className="text-[11px] sm:text-xs text-white/80 font-normal leading-normal tracking-normal drop-shadow-sm">
                                {card.location}
                              </p>
                            </div>

                            {/* Black Arrow in Right Bottom Corner */}
                            <div
                              className="w-8 h-8 rounded-none bg-white text-black flex items-center justify-center shadow-md flex-shrink-0 group-hover:bg-[#3D7EFF] group-hover:text-white transition-colors duration-200"
                              style={{ borderRadius: '0px' }}
                              title="Read Full Story"
                            >
                              <ArrowUpRight className="w-4 h-4 text-black group-hover:text-white stroke-[2.2]" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Progress Line Track at bottom */}
              <div className="w-full bg-[#D8D8D2] h-1 mt-4 overflow-hidden rounded-none" style={{ borderRadius: '0px' }}>
                <motion.div
                  className="bg-electric h-full"
                  style={{
                    width: progressPercent,
                  }}
                />
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>

      {/* 
        ============================================================
        MOBILE HERO SECTION (Stacked Cards Deck Interaction)
        ============================================================
      */}
      <section className="block lg:hidden w-full bg-[#E8E8E3] border-b border-[#D4D4CE] pt-6 pb-16 px-4 sm:px-6">
        {/* Mobile Hero Content (Minimalist Text & Button with 1.5s entrance, Center-Oriented) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-5 max-w-xl mx-auto mb-10 text-center flex flex-col items-center"
        >
          {/* Minimalist Top Indicator */}
          <div className="inline-flex items-center justify-center text-[11px] font-bold tracking-widest text-coolgray uppercase">
            <span>Decentralized Restitution Protocol</span>
          </div>

          {/* Main Headline (Boldest Tier: font-black & font-extrabold) */}
          <div className="space-y-2 text-center">
            <h1 className="text-4xl sm:text-[44px] font-black text-charcoal tracking-tight leading-[1.08]">
              ReclaimDAO
              <span className="block text-xl sm:text-2xl font-extrabold text-charcoal/90 mt-2.5 tracking-tight leading-snug">
                Reclaim What Is Rightfully Yours together.
              </span>
            </h1>
          </div>

          {/* Narrative Description (Stepped Hierarchy) */}
          <div className="space-y-3.5 text-center max-w-md mx-auto">
            {/* Tier 2: Bold but less than headline (font-semibold, high contrast) */}
            <p className="font-semibold text-charcoal/90 text-[15px] sm:text-base leading-snug">
              A community-driven nonprofit initiative helping victims of fraud and digital-asset theft navigate the path toward recovery.
            </p>
            {/* Tier 3: Less bold than Tier 2 (font-medium, readable and crisp) */}
            <p className="font-medium text-charcoal/75 text-xs sm:text-[13px] leading-relaxed">
              ReclaimDAO is a decentralized recovery ecosystem designed to identify legitimate claims, document verified losses, coordinate recovery initiatives, and support eligible victims through transparent, accountable processes.
            </p>
          </div>

          {/* Action Button: Pure Matte Sharp-Cornered & Centered */}
          <div className="pt-2 w-full flex justify-center">
            <button
              onClick={() => {
                const ref = localStorage.getItem('landingReferralCode');
                navigate(ref ? `/join-notice?ref=${encodeURIComponent(ref)}` : '/join-notice');
              }}
              className="btn-primary w-full sm:w-auto max-w-md rounded-none px-7 py-3.5 text-[15px] font-bold tracking-wide text-white shadow-none hover:bg-electric-600 flex items-center justify-center gap-3 cursor-pointer mx-auto"
              style={{
                borderRadius: '0px',
                backgroundColor: '#3D7EFF',
                boxShadow: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span>Affected by Fraud? Submit a Claim</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Mobile Verified Claims Section (2 Cards per Row Responsive Grid) */}
        <div className="w-full max-w-2xl mx-auto">
          {/* Minimalist Section Header */}
          <div className="flex items-center mb-3 px-1 text-xs text-charcoal font-medium">
            <span className="font-extrabold tracking-wider uppercase text-charcoal text-[11px] sm:text-xs">
              Verified Claims
            </span>
          </div>

          {/* Responsive 2-Cards per Row Grid (Vertically scrollable) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full">
            {ALL_CARDS.map((card, index) => (
              <motion.div
                key={`mobile-card-${card.id}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.35, delay: (index % 2) * 0.06 }}
                onClick={() => navigate(`/cases/${card.id}`)}
                className="group relative overflow-hidden rounded-none border border-[#D4D4CE] h-[220px] sm:h-[260px] flex flex-col justify-end shadow-xs bg-[#1F1F23] cursor-pointer hover:border-charcoal transition-all duration-200"
                style={{ borderRadius: '0px' }}
                role="button"
                tabIndex={0}
                title={`Read Case #${card.id} - ${card.name}'s Story`}
              >
                {/* Full-bleed WebP Image */}
                <img
                  src={card.image}
                  alt={card.name}
                  className="absolute inset-0 w-full h-full object-cover object-center filter contrast-[1.03] brightness-[0.97] group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                  loading="lazy"
                />

                {/* Smooth Bottom Gradient Overlay for High Text Contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />

                {/* Top Right Refunded Amount Badge */}
                <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 pointer-events-none">
                  <div
                    className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white/95 backdrop-blur-sm border border-[#D4D4CE] text-charcoal font-mono text-[9px] sm:text-[11px] font-bold tracking-tight shadow-xs"
                    style={{ borderRadius: '0px' }}
                  >
                    <span className="w-1.5 h-1.5 bg-[#10B981] inline-block flex-shrink-0"></span>
                    <span className="truncate">{card.refundedAmount}</span>
                  </div>
                </div>

                {/* Bottom Content: Bold Name, Thin Location, and Black Arrow in Right Bottom Corner */}
                <div className="relative z-10 p-2.5 sm:p-3.5 flex items-end justify-between gap-1.5 w-full">
                  <div className="space-y-0.5 min-w-0 pr-1 flex-1">
                    <h3 className="font-bold text-white text-[12px] sm:text-[14px] leading-tight truncate drop-shadow-sm">
                      {card.name}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-white/80 font-normal leading-tight truncate drop-shadow-sm">
                      {card.location}
                    </p>
                  </div>

                  {/* Black Arrow in Right Bottom Corner */}
                  <div
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-none bg-white text-black flex items-center justify-center shadow-xs flex-shrink-0 group-hover:bg-[#3D7EFF] group-hover:text-white transition-colors duration-200"
                    style={{ borderRadius: '0px' }}
                    title="Read Full Story"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 
        ============================================================
        REST OF HOMEPAGE CONTENT (White Backgrounds with Deep Cobalt Cards)
        ============================================================
      */}
      {/* Recovery Resources Section */}
      <section className="w-full overflow-x-hidden pt-20 pb-24 bg-white border-b border-[#D4D4CE]">
        <div className="w-full min-w-0 mobile-padding max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            {/* Minimalist Top Indicator */}
            <div className="inline-flex items-center text-xs font-bold tracking-widest text-coolgray uppercase mb-3">
              <span>Knowledge Base & Guidance</span>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black text-charcoal tracking-tight"
            >
              Recovery resources and <span className="text-[#3D7EFF]">guides</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mx-auto max-w-2xl text-sm sm:text-base text-coolgray font-medium leading-relaxed mt-3"
            >
              Scam alerts, ReclaimDAO refund programs, and an overview of how we help eligible victims recover funds.
            </motion.p>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 justify-items-center gap-8 md:grid-cols-3 md:justify-items-stretch md:gap-8">
            {STATIC_FEATURED_RESOURCES.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-24px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="w-full max-w-[380px] md:max-w-none flex"
              >
                <StaticResourceCard
                  id={item.id}
                  to={item.path}
                  title={item.title}
                  description={item.description}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How ReclaimDAO Helps Section */}
      <section className="w-full pt-20 pb-24 bg-[#E8E8E3] border-b border-[#D4D4CE]">
        <div className="w-full min-w-0 mobile-padding max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            {/* Minimalist Top Indicator */}
            <div className="inline-flex items-center text-xs font-bold tracking-widest text-coolgray uppercase mb-3">
              <span>Core Protocol Pillars</span>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black text-charcoal tracking-tight"
            >
              How <span className="text-[#3D7EFF]">ReclaimDAO</span> Helps
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mx-auto max-w-2xl text-sm sm:text-base text-coolgray font-medium leading-relaxed mt-3"
            >
              Verify eligible victims, issue on-chain Proof-of-Loss tokens, and facilitate the secure distribution of recovered funds.
            </motion.p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-stretch max-w-7xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-24px' }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group relative flex flex-col justify-between h-full min-h-[320px] w-full p-6 sm:p-7 bg-[#F4F4F0] border border-[#D4D4CE] rounded-none hover:border-charcoal hover:bg-[#EFEFEA] transition-all duration-300 shadow-sm hover:shadow-md text-left"
                  style={{ borderRadius: '0px' }}
                >
                  {/* Top Row: Vector Icon & Pillar Tag */}
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className="w-12 h-12 rounded-none bg-white border border-[#D4D4CE] flex items-center justify-center text-charcoal group-hover:bg-[#3D7EFF] group-hover:text-white group-hover:border-[#3D7EFF] transition-colors duration-200 shadow-xs"
                        style={{ borderRadius: '0px' }}
                      >
                        <Icon className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <span className="text-[10px] font-mono tracking-widest uppercase text-coolgray font-semibold">
                        {feature.tag}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-2.5">
                      <h3 className="text-lg font-bold text-charcoal tracking-tight leading-snug group-hover:text-[#3D7EFF] transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-xs sm:text-[13px] text-charcoal/75 leading-relaxed font-normal">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action / Status Indicator */}
                  <div className="pt-4 mt-5 border-t border-[#D4D4CE]/60 flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-coolgray group-hover:text-charcoal transition-colors">
                      Protocol Standard
                    </span>
                    <div
                      className="w-7 h-7 rounded-none bg-white border border-[#D4D4CE] text-charcoal flex items-center justify-center group-hover:bg-[#3D7EFF] group-hover:text-white group-hover:border-[#3D7EFF] transition-colors duration-200 shadow-xs flex-shrink-0"
                      style={{ borderRadius: '0px' }}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Direct Assistance CTA Section (Open Architectural Layout - No Card Box) */}
      <section className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#D4D4CE]">
        <div className="w-full max-w-3xl mx-auto text-center space-y-6">
          {/* Minimalist Top Indicator */}
          <div className="inline-flex items-center text-xs font-bold tracking-widest text-coolgray uppercase">
            <span>Direct Restitution Assistance</span>
          </div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-4xl lg:text-[48px] font-black text-charcoal tracking-tight leading-[1.12]"
          >
            You Don't Have to Navigate This <span className="text-[#3D7EFF]">Alone</span>
          </motion.h2>

          {/* Narrative Body Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm sm:text-base text-coolgray font-medium leading-relaxed max-w-2xl mx-auto space-y-2.5"
          >
            <p>If you've lost funds to a scam or need help understanding the recovery process, reach out to ReclaimDAO.</p>
            <p>Tell us what happened, ask your questions, and learn more about the options available to you.</p>
          </motion.div>

          {/* Action Button: Pure Matte Sharp-Cornered */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-4 flex justify-center"
          >
            <Link
              to="/contact"
              className="btn-primary rounded-none px-9 py-4 text-sm sm:text-base font-bold tracking-wide text-white shadow-none hover:bg-electric-600 flex items-center justify-center gap-3 cursor-pointer"
              style={{
                borderRadius: '0px',
                backgroundColor: '#3D7EFF',
                boxShadow: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span>Talk to ReclaimDAO</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Live 1-by-1 Recovery Notification Ticker */}
      <LiveRecoveryNotification />
    </div>
  );
};

export default Home;