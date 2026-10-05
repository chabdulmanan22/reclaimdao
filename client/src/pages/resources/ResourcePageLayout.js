import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const joinNoticeHref = () => {
  try {
    const ref = localStorage.getItem('landingReferralCode');
    return ref ? `/join-notice?ref=${encodeURIComponent(ref)}` : '/join-notice';
  } catch {
    return '/join-notice';
  }
};

/**
 * Shared top area for static resource guides (matches article detail rhythm).
 */
const ResourcePageLayout = ({ iconSrc, iconAlt, title, children }) => (
  <div className="min-h-screen w-full overflow-x-hidden bg-slate-50">
    <header className="border-b border-slate-200/80 bg-white shadow-sm">
      <div className="w-full max-w-7xl mx-auto min-w-0 px-8 md:px-12 lg:px-16 py-8 md:py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#0284c7]"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="mx-auto mt-8 max-w-4xl min-w-0 text-center">
          {iconSrc ? (
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 p-2 shadow-sm ring-1 ring-slate-200/80">
              <img src={iconSrc} alt={iconAlt || ''} className="max-h-16 max-w-16 object-contain" loading="eager" />
            </div>
          ) : null}
          <h1 className="break-words text-3xl font-extrabold leading-tight text-slate-900 md:text-4xl">{title}</h1>
        </div>
      </div>
    </header>

    <div className="w-full max-w-7xl mx-auto min-w-0 px-8 md:px-12 lg:px-16 py-10 md:py-14">{children}</div>

    <div className="border-t border-slate-200 bg-slate-100/80 py-10 w-full">
      <div className="mobile-padding flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
          Back to home
        </Link>
        <Link
          to={joinNoticeHref()}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #A85830 0%, #964d28 50%, #854221 100%)',
            boxShadow: '0 4px 20px rgba(168, 88, 48, 0.4)'
          }}
        >
          Submit your claim
        </Link>
      </div>
    </div>
  </div>
);

export default ResourcePageLayout;
export { joinNoticeHref };
