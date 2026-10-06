import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Clock, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const ArticleDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadArticle = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await axios.get(`/api/articles/${encodeURIComponent(slug)}`);
        if (cancelled) return;
        const data = res.data?.data;
        if (data) {
          setArticle(data);
        } else {
          setNotFound(true);
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadArticle();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] text-charcoal py-12 px-4 flex items-center justify-center">
        <div className="font-mono text-xs uppercase tracking-wider text-coolgray font-bold animate-pulse">
          Ingesting evidentiary article dossier...
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] text-charcoal py-12 px-4 flex items-center justify-center">
        <div
          className="max-w-md w-full bg-white border border-[#D4D4CE] p-8 sm:p-10 shadow-sm text-center space-y-4"
          style={{ borderRadius: '0px' }}
        >
          <div
            className="w-12 h-12 bg-[#F8F8F6] border border-[#D4D4CE] text-coolgray flex items-center justify-center mx-auto"
            style={{ borderRadius: '0px' }}
          >
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-charcoal tracking-tight">Article Dossier Not Found</h1>
          <p className="text-xs text-coolgray leading-relaxed font-mono">
            The requested restitution document has either been archived or has not yet completed peer-review verification.
          </p>
          <Link
            to="/resources/refund-programs"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3D7EFF] hover:bg-blue-600 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
            style={{ borderRadius: '0px' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Refund Catalogs</span>
          </Link>
        </div>
      </div>
    );
  }

  const paragraphs = String(article.articleText || '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-charcoal py-8 sm:py-12 md:py-16 selection:bg-[#3D7EFF] selection:text-white">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

        {/* Masthead Header Section */}
        <div className="border-b border-[#D4D4CE] pb-6 space-y-3">
          <div className="flex items-center justify-between">
            <Link
              to="/resources/refund-programs"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D4D4CE] text-charcoal hover:border-[#3D7EFF] text-xs font-mono font-bold uppercase transition-all shadow-sm"
              style={{ borderRadius: '0px' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Refund Catalogs</span>
            </Link>

            <span
              className="px-2.5 py-0.5 bg-white border border-[#D4D4CE] font-mono text-[10px] text-coolgray font-bold uppercase tracking-wider"
              style={{ borderRadius: '0px' }}
            >
              Restitution Docket
            </span>
          </div>

          <div className="pt-2">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#D4D4CE] text-charcoal text-[11px] font-mono font-bold uppercase tracking-wider shadow-sm mb-3"
              style={{ borderRadius: '0px' }}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#3D7EFF]" />
              <span>Verified Restitution Case Record</span>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="break-words text-2xl sm:text-3xl md:text-4xl font-black text-charcoal tracking-tight"
            >
              {article.title}
            </motion.h1>
          </div>
        </div>

        {/* Main Article Container */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white border border-[#D4D4CE] p-6 sm:p-10 md:p-12 shadow-sm space-y-6"
          style={{ borderRadius: '0px' }}
        >
          {paragraphs.length === 0 ? (
            <p className="text-coolgray font-mono text-xs">This evidentiary document has no published text.</p>
          ) : (
            <div className="space-y-5">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-sm sm:text-base leading-relaxed text-charcoal/90 font-normal whitespace-pre-line [overflow-wrap:anywhere]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {/* Document Footer Navigation */}
          <div className="pt-8 border-t border-[#D4D4CE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link
              to="/resources/refund-programs"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white border border-[#D4D4CE] hover:border-charcoal text-charcoal font-mono font-bold text-xs uppercase tracking-wider transition-all"
              style={{ borderRadius: '0px' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Programs</span>
            </Link>

            <Link
              to="/join-notice"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#3D7EFF] hover:bg-blue-600 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
              style={{ borderRadius: '0px' }}
            >
              <span>Submit a Claim on this Case</span>
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default ArticleDetail;
