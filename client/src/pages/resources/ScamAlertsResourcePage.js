import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, AlertTriangle, ChevronRight, Search } from 'lucide-react';
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
      <div className="mx-auto max-w-4xl min-w-0 space-y-8">
        {/* Intro Banner */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-3 text-base leading-relaxed text-amber-950 font-medium">
              {scamAlertsIntro.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search company, token, or scam program..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0284c7] text-sm font-medium text-slate-800"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to={joinNoticeHref()}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #A85830 0%, #964d28 50%, #854221 100%)',
                boxShadow: '0 4px 20px rgba(168, 88, 48, 0.4)'
              }}
            >
              Submit claim
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {/* Reported Companies Sections */}
        <div id="reported-programs" className="scroll-mt-24 space-y-8 pt-2">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-semibold">
              Loading scam alert database...
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 font-medium">
              No scam companies found matching "{search}".
            </div>
          ) : (
            filteredSections.map((section) => (
              <section
                key={section.title}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-[#0284c7]" />
                    {section.title}
                  </h2>
                  <span className="text-xs font-bold text-[#0284c7] bg-sky-50 border border-sky-200/80 px-3 py-1 rounded-full">
                    {section.items.length} reported
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {section.items.map((name) => (
                    <div
                      key={name}
                      className="rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-sky-50/40 hover:border-sky-200/80 px-4 py-3 text-sm font-semibold text-slate-800 transition-all flex items-center justify-between group"
                    >
                      <span className="truncate pr-2">{name}</span>
                      <span className="h-2 w-2 rounded-full bg-red-500 shrink-0 opacity-75 group-hover:opacity-100 transition-opacity" title="Reported Fraud" />
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
