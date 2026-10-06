import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const joinNoticeHref = () => {
  try {
    const ref = localStorage.getItem('landingReferralCode');
    return ref ? `/join-notice?ref=${encodeURIComponent(ref)}` : '/join-notice';
  } catch {
    return '/join-notice';
  }
};

/**
 * Swiss Architectural Layout for static resource guides.
 */
const ResourcePageLayout = ({ iconSrc, iconAlt, title, children }) => (
  <div className="min-h-screen w-full overflow-x-hidden bg-[#F8F8F6] text-charcoal py-6 sm:py-10 md:py-12 selection:bg-[#3D7EFF] selection:text-white">
    {/* Top Header Section */}
    <header className="border-b border-[#D4D4CE] pb-6 mb-8 max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D4D4CE] text-charcoal hover:border-[#3D7EFF] text-xs font-mono font-bold uppercase transition-all shadow-sm"
          style={{ borderRadius: '0px' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Back</span>
        </Link>

        <span
          className="px-2.5 py-0.5 bg-white border border-[#D4D4CE] font-mono text-[10px] text-coolgray font-bold uppercase tracking-wider"
          style={{ borderRadius: '0px' }}
        >
          Protocol Knowledge Base
        </span>
      </div>

      <div className="text-center max-w-3xl mx-auto space-y-4">
        {iconSrc && (
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center bg-white p-2 border border-[#D4D4CE] shadow-sm"
            style={{ borderRadius: '0px' }}
          >
            <img src={iconSrc} alt={iconAlt || ''} className="max-h-12 max-w-12 object-contain" loading="eager" />
          </div>
        )}
        <h1 className="break-words text-3xl sm:text-4xl md:text-5xl font-black text-charcoal tracking-tight">
          {title}
        </h1>
      </div>
    </header>

    {/* Content Body */}
    <main className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8">
      {children}
    </main>

    {/* Bottom Sticky/Call-to-action Footer Bar */}
    <div className="border-t border-[#D4D4CE] mt-12 pt-8 max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white border border-[#D4D4CE] shadow-sm" style={{ borderRadius: '0px' }}>
        <div>
          <h3 className="text-base font-black text-charcoal tracking-tight">
            Affected by Custodial Loss or Deceptive Schemes?
          </h3>
          <p className="text-xs text-coolgray mt-0.5">
            Submit your evidentiary claim dossier to join the decentralized restitution quorum.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/"
            className="flex-1 sm:flex-initial px-4 py-3 bg-white border border-[#D4D4CE] hover:border-charcoal text-charcoal font-mono font-bold text-xs uppercase tracking-wider transition-all text-center"
            style={{ borderRadius: '0px' }}
          >
            Home
          </Link>
          <Link
            to={joinNoticeHref()}
            className="flex-1 sm:flex-initial px-6 py-3 bg-[#3D7EFF] hover:bg-blue-600 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 text-center"
            style={{ borderRadius: '0px' }}
          >
            <span>Submit a Claim</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default ResourcePageLayout;
export { joinNoticeHref };
