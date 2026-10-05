import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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
      title="ReclaimDAO REFUND PROGRAMS"
      iconSrc="/images/resources/Refund_program_icon.png"
      iconAlt="Refund programs"
    >
      <div className="mx-auto max-w-4xl min-w-0 space-y-8">
        <div className="space-y-4 text-lg leading-relaxed text-gray-600">
          <p>
            ReclaimDAO is a decentralized asset recovery protocol that helps government agencies securely distribute
            cryptocurrency recovered from illegal business practices and return funds to those who lost money.
            Below are active refund programs for which ReclaimDAO has helped securely distribute recovered funds.
          </p>
        </div>

        <aside
          className="rounded-2xl border-l-4 border-[#A85830] bg-[#0a254d] text-white px-6 py-5 text-base leading-relaxed shadow-lg"
          role="note"
        >
          <p className="font-black text-[#A85830] uppercase tracking-wider text-sm">ReclaimDAO REFUND PROGRAMS</p>
          <p className="mt-2 text-slate-200">
            <strong className="text-white">ReclaimDAO will never request payment</strong> to help you pursue a claim, make threats, or instruct
            you to transfer money. If you have been targeted by an illegal business practice or scam,{' '}
            <strong className="text-white">report it to ReclaimDAO</strong> through our official channels only.
          </p>
        </aside>

        <div className="overflow-x-auto rounded-3xl border border-sky-400/25 bg-[#0a254d] shadow-2xl">
          <h2 className="border-b border-white/10 px-6 py-5 text-center font-serif text-xl font-bold tracking-wide text-white md:text-2xl">
            Active <span className="text-[#A85830]">Refund Programs</span>
          </h2>
          {loading ? (
            <p className="px-5 py-10 text-center text-slate-300">Loading programs…</p>
          ) : rows.length === 0 ? (
            <p className="px-5 py-10 text-center text-slate-300">
              No active articles are published yet. Check back soon or contact us if you believe a program should be
              listed.
            </p>
          ) : (
            <table className="w-full min-w-[280px] border-collapse text-left text-slate-200">
              <thead>
                <tr className="border-b border-white/10 bg-[#061833]">
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-200 md:px-6">
                    Refund Program
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-200 md:px-6">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((article) => (
                  <tr key={article.slug || article._id} className="border-b border-slate-800 last:border-0">
                    <td className="px-4 py-4 align-top md:px-6">
                      <Link
                        to={`/articles/${article.slug}`}
                        className="font-medium text-sky-400 underline decoration-sky-500/50 underline-offset-2 transition hover:text-sky-300"
                      >
                        {article.title}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top text-slate-400 md:px-6">
                      {formatArticleDate(article.createdDisplayDate || article.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </ResourcePageLayout>
  );
};

export default RefundProgramsResourcePage;
