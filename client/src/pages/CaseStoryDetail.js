import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Lock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getCaseById, getAllCases } from '../data/caseStoriesData';

const CaseStoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const caseItem = getCaseById(id);
  const allCases = getAllCases();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (!caseItem) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-black text-charcoal mb-4">Case File Not Found</h1>
        <p className="text-coolgray text-sm mb-6">The requested forensic restitution dossier does not exist or has been archived.</p>
        <Link
          to="/"
          className="px-6 py-3 bg-[#3D7EFF] text-white font-bold text-sm hover:bg-electric-600 transition-colors"
          style={{ borderRadius: '0px' }}
        >
          Return to Verified Claims
        </Link>
      </div>
    );
  }

  // Find previous and next cases
  const currentIndex = allCases.findIndex((c) => c.id === caseItem.id);
  const prevCase = currentIndex > 0 ? allCases[currentIndex - 1] : allCases[allCases.length - 1];
  const nextCase = currentIndex < allCases.length - 1 ? allCases[currentIndex + 1] : allCases[0];

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-charcoal font-sans selection:bg-[#3D7EFF] selection:text-white pb-16 sm:pb-24 overflow-x-hidden">
      {/* Newspaper Top Editorial Masthead / Breadcrumb Bar */}
      <div className="bg-[#EFEFEA] border-b border-[#D4D4CE] py-3 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-bold text-charcoal hover:text-[#3D7EFF] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
              <span>Back to Verified Claims</span>
            </Link>
            <span className="text-[#D4D4CE]">|</span>
            <span className="text-coolgray font-mono uppercase tracking-wider text-[11px]">
              Dossier #{caseItem.id}
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-6 sm:pt-10 lg:pt-12">
        {/* Newspaper Article Header */}
        <header className="border-b-2 border-charcoal pb-6 sm:pb-8 mb-8 sm:mb-10">

          {/* Newspaper Main Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-charcoal tracking-tight leading-[1.15] mb-5 sm:mb-6 max-w-5xl">
            {caseItem.headline}
          </h1>

          {/* Editorial Bylines & Metadata Ribbon (100% Mobile Responsive, Removed 100% Recovered Badge) */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 border-t border-[#D4D4CE] text-xs">
            <div>
              <span className="text-coolgray uppercase font-mono text-[10px] block">Victim Subject</span>
              <span className="font-bold text-charcoal text-sm">{caseItem.name}</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-[#D4D4CE]" />
            <div>
              <span className="text-coolgray uppercase font-mono text-[10px] block">Jurisdiction</span>
              <span className="font-semibold text-charcoal/90 text-sm flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#3D7EFF] shrink-0" />
                <span>{caseItem.location}</span>
              </span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-[#D4D4CE]" />
            <div>
              <span className="text-coolgray uppercase font-mono text-[10px] block">Lead Examiner</span>
              <span className="font-medium text-charcoal text-sm">{caseItem.investigator}</span>
            </div>
          </div>
        </header>

        {/* 2-Column Editorial Grid: Left Sidebar (Portrait & Forensic Facts) + Right Article Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* ========================================================= */}
          {/* LEFT SIDEBAR: Photo, Quick Facts, and Claim Action (5 cols) */}
          {/* ========================================================= */}
          <aside className="lg:col-span-5 space-y-6">
            {/* Primary Portrait Card (Sharp 0px Corners, Architectural Frame) */}
            <div
              className="bg-white border border-[#D4D4CE] p-3 sm:p-4 shadow-sm"
              style={{ borderRadius: '0px' }}
            >
              {/* Image Frame */}
              <div
                className="relative overflow-hidden border border-[#D4D4CE] bg-charcoal aspect-[4/5] sm:aspect-auto sm:h-[420px]"
                style={{ borderRadius: '0px' }}
              >
                <img
                  src={caseItem.image}
                  alt={caseItem.name}
                  className="w-full h-full object-cover object-center filter contrast-[1.03]"
                />
                {/* Photo Corner Badge */}
                <div className="absolute top-3 right-3">
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1 bg-white/95 backdrop-blur-sm border border-[#D4D4CE] text-charcoal font-mono text-[11px] sm:text-xs font-bold shadow-xs"
                    style={{ borderRadius: '0px' }}
                  >
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#10B981] inline-block"></span>
                    <span>{caseItem.refundedAmount}</span>
                  </div>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white">
                  <h3 className="font-bold text-base sm:text-lg leading-tight truncate">{caseItem.name}</h3>
                  <p className="text-xs text-white/80 font-normal truncate">{caseItem.location}</p>
                </div>
              </div>

              {/* Photo Caption in Journalistic Style */}
              <div className="pt-3 px-1">
                <p className="text-xs text-coolgray leading-relaxed italic border-l-2 border-[#3D7EFF] pl-3 py-0.5">
                  Archived photographic record and verified identification document for Case Dossier #{caseItem.id}. Restitution disbursed via authorized cryptographic settlement.
                </p>
              </div>
            </div>

            {/* Forensic Case Ledger / Technical Data Box */}
            <div
              className="bg-white border border-[#D4D4CE] p-4 sm:p-6 shadow-sm"
              style={{ borderRadius: '0px' }}
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D4D4CE]">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-charcoal flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#3D7EFF] shrink-0" />
                  <span>Forensic Audit Parameters</span>
                </h3>
                <span className="font-mono text-[11px] text-coolgray font-semibold">VERIFIED</span>
              </div>

              <dl className="space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-3 pb-2.5 border-b border-gray-100">
                  <dt className="text-coolgray font-medium">Attack Vector</dt>
                  <dd className="font-bold text-charcoal sm:text-right">{caseItem.forensicData.attackVector}</dd>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-3 pb-2.5 border-b border-gray-100">
                  <dt className="text-coolgray font-medium">Network Affected</dt>
                  <dd className="font-mono font-semibold text-charcoal sm:text-right">{caseItem.forensicData.network}</dd>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-3 pb-2.5 border-b border-gray-100">
                  <dt className="text-coolgray font-medium">Hops Traced</dt>
                  <dd className="font-mono font-semibold text-charcoal sm:text-right">{caseItem.forensicData.hopsTraced}</dd>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-3 pb-2.5 border-b border-gray-100">
                  <dt className="text-coolgray font-medium">Counterparty Action</dt>
                  <dd className="font-semibold text-[#059669] sm:text-right">{caseItem.forensicData.counterpartyStatus}</dd>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-3 pb-2.5 border-b border-gray-100">
                  <dt className="text-coolgray font-medium">Investigation Time</dt>
                  <dd className="font-mono font-bold text-charcoal sm:text-right">{caseItem.forensicData.recoveryTimeline}</dd>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-3 pt-1">
                  <dt className="text-coolgray font-medium">Restitution Status</dt>
                  <dd className="font-mono font-black text-[#10B981] sm:text-right text-xs sm:text-sm">
                    Restitution Approved & Disbursed
                  </dd>
                </div>
              </dl>
            </div>

            {/* Call To Action Box (Sharp 0px, Charcoal & Electric Blue) */}
            <div
              className="bg-charcoal text-white p-5 sm:p-6 border border-charcoal shadow-md"
              style={{ borderRadius: '0px' }}
            >
              <div className="flex items-center gap-2 mb-2 text-[#3D7EFF]">
                <Lock className="w-4 h-4 shrink-0" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
                  Decentralized Restitution Network
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                Victim of Digital Asset Fraud or Unauthorized Drainage?
              </h4>
              <p className="text-xs text-white/75 leading-relaxed mb-5">
                Every transaction leaves a permanent cryptographic trail. Submit your transaction hashes for forensic evaluation by ReclaimDAO's verified tracing investigators.
              </p>
              <button
                onClick={() => {
                  const ref = localStorage.getItem('landingReferralCode');
                  navigate(ref ? `/join-notice?ref=${encodeURIComponent(ref)}` : '/join-notice');
                }}
                className="w-full py-3.5 px-4 bg-[#3D7EFF] hover:bg-electric-600 text-white font-bold text-xs uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-2 cursor-pointer"
                style={{ borderRadius: '0px' }}
              >
                <span>Submit a Fraud Claim</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </aside>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Full Newspaper Article & Narrative (7 cols) */}
          {/* ========================================================= */}
          <article className="lg:col-span-7 space-y-6 sm:space-y-8">
            {/* Editorial Pull Quote (Classic Newspaper Drop Quote Style) */}
            <blockquote className="border-l-4 border-charcoal pl-4 sm:pl-6 py-2 bg-white border border-[#D4D4CE] p-4 sm:p-6 shadow-sm">
              <p className="text-lg sm:text-2xl font-serif italic text-charcoal font-medium leading-relaxed">
                {caseItem.pullQuote}
              </p>
              <footer className="mt-3 text-[11px] sm:text-xs font-mono font-bold text-coolgray uppercase tracking-wider">
                — {caseItem.name}, Documented Sworn Testimony
              </footer>
            </blockquote>

            {/* Executive Summary (Bold Lead Journalistic Style) */}
            <div className="bg-white border border-[#D4D4CE] p-4 sm:p-7 shadow-sm">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-coolgray font-mono mb-2.5 sm:mb-3">
                EXECUTIVE SUMMARY & CASE RECORD
              </h3>
              <p className="text-sm sm:text-base text-charcoal/90 leading-relaxed font-serif font-normal">
                {caseItem.summary}
              </p>
            </div>

            {/* Full Structured Story Sections */}
            <div className="space-y-5 sm:space-y-6">
              {caseItem.sections.map((section, idx) => (
                <section
                  key={idx}
                  className="bg-white border border-[#D4D4CE] p-4 sm:p-8 shadow-sm space-y-3.5 sm:space-y-4"
                  style={{ borderRadius: '0px' }}
                >
                  {/* Section Eyebrow & Number */}
                  <div className="flex items-center gap-2 text-coolgray font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider pb-2 border-b border-gray-100">
                    <span className="text-[#3D7EFF]">SECTION {String(idx + 1).padStart(2, '0')}</span>
                    <span>•</span>
                    <span>INVESTIGATIVE CHRONICLE</span>
                  </div>

                  <h2 className="text-lg sm:text-2xl font-bold text-charcoal tracking-tight leading-snug">
                    {section.heading}
                  </h2>

                  <div className="space-y-3 text-sm sm:text-[15px] text-charcoal/85 leading-relaxed font-sans">
                    {section.paragraphs.map((para, pIdx) => (
                      <p key={pIdx}>
                        {para}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Case Dossier Navigation (Prev / Next Case Controls, 100% Mobile Responsive) */}
            <div
              className="bg-white border border-[#D4D4CE] p-3.5 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shadow-sm"
              style={{ borderRadius: '0px' }}
            >
              <Link
                to={`/cases/${prevCase.id}`}
                className="flex-1 inline-flex items-center gap-2 text-xs font-bold text-charcoal hover:text-[#3D7EFF] transition-colors py-2.5 px-3 border border-[#D4D4CE] hover:border-charcoal"
                style={{ borderRadius: '0px' }}
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5] shrink-0" />
                <div className="text-left min-w-0">
                  <span className="text-[10px] text-coolgray block font-mono">PREVIOUS CASE</span>
                  <span className="truncate block">#{prevCase.id} • {prevCase.name}</span>
                </div>
              </Link>

              <Link
                to="/"
                className="text-xs font-mono font-bold text-coolgray hover:text-charcoal uppercase tracking-wider text-center py-1 sm:py-0 px-2"
              >
                All 13 Cases
              </Link>

              <Link
                to={`/cases/${nextCase.id}`}
                className="flex-1 inline-flex items-center justify-end gap-2 text-xs font-bold text-charcoal hover:text-[#3D7EFF] transition-colors py-2.5 px-3 border border-[#D4D4CE] hover:border-charcoal text-right"
                style={{ borderRadius: '0px' }}
              >
                <div className="text-right min-w-0">
                  <span className="text-[10px] text-coolgray block font-mono">NEXT CASE</span>
                  <span className="truncate block">#{nextCase.id} • {nextCase.name}</span>
                </div>
                <ChevronRight className="w-4 h-4 stroke-[2.5] shrink-0" />
              </Link>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
};

export default CaseStoryDetail;
