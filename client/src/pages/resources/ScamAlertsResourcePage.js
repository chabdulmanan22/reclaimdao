import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, AlertTriangle, ChevronRight, Search, ShieldCheck } from 'lucide-react';
import ResourcePageLayout, { joinNoticeHref } from './ResourcePageLayout';
import { scamAlertsIntro, scamAlertsSections } from '../../data/scamAlertsContent';

const ScamAlertsResourcePage = () => {
  const [sections, setSections] = useState(scamAlertsSections);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    axios.get('/api/scam-companies')
      .then((res) => {
        if (active && res.data?.success && Array.isArray(res.data.data?.sections)) {
          setSections(res.data.data.sections);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredSections = sections.map((sec) => {
    if (!search.trim()) return sec;
    const s = search.toLowerCase();
    const items = sec.items.filter((item) => item.toLowerCase().includes(s));
    return { ...sec, items };
  }).filter((sec) => sec.items.length > 0);

  return (
    <ResourcePageLayout
      title={scamAlertsIntro.kicker}
      iconSrc="/images/resources/scam_alerticon.jpg"
      iconAlt="Scam alert"
    >
      <div className="mx-auto max-w-4xl min-w-0 space-y-6 sm:space-y-8">
        {/* Intro Banner */}
        <div
          className="border-l-4 border-l-amber-500 border border-[#D4D4CE] bg-white p-5 sm:p-6 shadow-sm"
          style={{ borderRadius: '0px' }}
        >
          <div className="flex items-start gap-4">
            <div
              className="p-2 bg-amber-50 border border-amber-200 text-amber-700 shrink-0"
              style={{ borderRadius: '0px' }}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-charcoal font-medium">
              {scamAlertsIntro.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 border border-[#D4D4CE] shadow-sm"
          style={{ borderRadius: '0px' }}
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-coolgray" />
            <input
              type="text"
              placeholder="Search entity, token, or scam program..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8F8F6] border border-[#D4D4CE] outline-none focus:border-[#3D7EFF] text-base sm:text-xs font-mono text-charcoal placeholder:text-coolgray/70 transition-colors"
              style={{ borderRadius: '0px' }}
            />
          </div>

          <Link
            to={joinNoticeHref()}
            className="px-5 py-2.5 bg-[#3D7EFF] hover:bg-blue-600 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 min-h-[44px]"
            style={{ borderRadius: '0px' }}
          >
            <span>Submit Claim</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Reported Companies Sections */}
        <div id="reported-programs" className="scroll-mt-24 space-y-6 sm:space-y-8 pt-2">
          {loading ? (
            <div className="p-12 text-center text-coolgray font-mono text-xs">
              Loading scam alert database...
            </div>
          ) : filteredSections.length === 0 ? (
            <div
              className="p-12 bg-white border border-[#D4D4CE] text-center text-coolgray font-mono text-xs"
              style={{ borderRadius: '0px' }}
            >
              No flagged entities found matching &quot;{search}&quot;.
            </div>
          ) : (
            filteredSections.map((section) => (
              <section
                key={section.title}
                className="bg-white p-5 sm:p-7 border border-[#D4D4CE] shadow-sm space-y-4"
                style={{ borderRadius: '0px' }}
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#D4D4CE]">
                  <h2 className="text-base sm:text-lg font-black text-charcoal flex items-center gap-2 tracking-tight">
                    <ShieldAlert className="w-4 h-4 text-[#3D7EFF]" />
                    <span>{section.title}</span>
                  </h2>
                  <span
                    className="font-mono text-[10px] font-bold text-charcoal bg-[#F8F8F6] border border-[#D4D4CE] px-2.5 py-0.5 uppercase tracking-wider"
                    style={{ borderRadius: '0px' }}
                  >
                    {section.items.length} flagged
                  </span>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {section.items.map((name) => (
                    <div
                      key={name}
                      className="border border-[#D4D4CE] bg-[#F8F8F6] hover:bg-white hover:border-charcoal px-3.5 py-2.5 text-xs font-mono font-bold text-charcoal transition-all flex items-center justify-between group"
                      style={{ borderRadius: '0px' }}
                    >
                      <span className="truncate pr-2">{name}</span>
                      <span className="h-1.5 w-1.5 bg-rose-500 shrink-0" title="Reported Entity" />
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </ResourcePageLayout>
  );
};

export default ScamAlertsResourcePage;
