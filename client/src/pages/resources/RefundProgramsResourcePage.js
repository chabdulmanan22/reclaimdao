import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, ArrowRight, Clock, FileText } from 'lucide-react';
import ResourcePageLayout from './ResourcePageLayout';

const formatArticleDate = (val) => {
  if (!val) return '—';
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [year, month] = str.split('-');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const idx = parseInt(month, 10) - 1;
    if (idx >= 0 && idx < 12) return `${months[idx]} ${year}`;
  }
  try {
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  } catch {
    return str;
  }
};

const RefundProgramsResourcePage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get('/api/articles');
        if (cancelled) return;
        let list = Array.isArray(res.data?.data) ? res.data.data : [];
        const getTs = (a) => (a.createdDisplayDate ? new Date(a.createdDisplayDate).getTime() : new Date(a.createdAt || 0).getTime());
        list.sort((a, b) => getTs(b) - getTs(a));
        setRows(list);
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ResourcePageLayout
      title="Protocol Refund Programs"
      iconSrc="/images/resources/Refund_program_icon.png"
      iconAlt="Refund programs"
    >
      <div className="mx-auto max-w-4xl min-w-0 space-y-6 sm:space-y-8">
        <div className="space-y-3 text-sm sm:text-base leading-relaxed text-charcoal font-medium">
          <p>
            ReclaimDAO is a decentralized asset recovery protocol assisting claimants and government oversight agencies in securely cataloging cryptocurrency recovered from illicit exchange operators and returning funds through audited smart contracts.
          </p>
        </div>

        {/* Advisory Box */}
        <div
          className="border-l-4 border-l-[#3D7EFF] bg-white border border-[#D4D4CE] p-5 sm:p-6 shadow-sm space-y-2"
          style={{ borderRadius: '0px' }}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-black uppercase tracking-wider text-[#3D7EFF]">
              Restitution Security Standard
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal leading-relaxed">
            <strong className="text-charcoal font-black">ReclaimDAO will never request upfront payment</strong> or private keys to process a restitution dossier. If you have been targeted by impersonators or an illegal platform, report it through official protocol verification channels only.
          </p>
        </div>

        {/* Programs Table / Ledger Card */}
        <div
          className="bg-white border border-[#D4D4CE] shadow-sm overflow-hidden"
          style={{ borderRadius: '0px' }}
        >
          <div className="p-4 sm:p-6 border-b border-[#D4D4CE] flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-charcoal tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#3D7EFF]" />
              <span>Active Restitution Catalogs</span>
            </h2>
            <span
              className="font-mono text-[10px] text-coolgray uppercase font-bold bg-[#F8F8F6] border border-[#D4D4CE] px-2.5 py-0.5"
              style={{ borderRadius: '0px' }}
            >
              {rows.length} Published
            </span>
          </div>

          {loading ? (
            <p className="p-10 text-center font-mono text-xs text-coolgray">
              Synchronizing active program ledgers…
            </p>
          ) : rows.length === 0 ? (
            <p className="p-10 text-center font-mono text-xs text-coolgray">
              No active restitution programs cataloged yet. Check back soon for updated case dockets.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F8F6] border-b border-[#D4D4CE] font-mono text-[11px] font-bold text-coolgray uppercase tracking-wider">
                    <th className="py-3 px-4 sm:px-6">Restitution Docket / Article</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Publication Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4D4CE] text-xs font-mono">
                  {rows.map((article) => (
                    <tr
                      key={article.slug || article._id}
                      className="hover:bg-[#F8F8F6] transition-colors"
                    >
                      <td className="py-4 px-4 sm:px-6">
                        <Link
                          to={`/articles/${article.slug}`}
                          className="font-bold font-sans text-sm text-charcoal hover:text-[#3D7EFF] transition-colors flex items-center gap-1.5 group"
                        >
                          <span className="group-hover:underline">{article.title}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-coolgray group-hover:text-[#3D7EFF] transition-colors shrink-0" />
                        </Link>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right text-coolgray whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <Clock className="w-3.5 h-3.5 text-coolgray" />
                          <span>{formatArticleDate(article.createdDisplayDate || article.createdAt)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ResourcePageLayout>
  );
};

export default RefundProgramsResourcePage;
