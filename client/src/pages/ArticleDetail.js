import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
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
      <div className="min-h-screen w-full overflow-x-hidden bg-white">
        <div className="w-full min-w-0 mobile-padding py-20">
          <div className="mx-auto max-w-2xl min-w-0">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
            <div className="mt-10 flex flex-col items-center text-center">
              <div className="h-16 w-16 animate-pulse rounded-full bg-gray-100" />
              <div className="mt-6 h-8 w-full max-w-md animate-pulse rounded bg-gray-100" />
            </div>
            <div className="mx-auto mt-12 max-w-2xl min-w-0 space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-[85%] animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden bg-white">
        <div className="w-full min-w-0 mobile-padding py-20">
          <div className="mx-auto max-w-md min-w-0 rounded-xl border border-gray-200 bg-white px-8 py-12 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#3b82f6] to-[#38bdf8] text-white">
              <FileText className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Article not found</h1>
            <p className="mt-2 text-gray-600">This article may have been removed or is not available.</p>
            <Link
              to="/"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#38bdf8]"
            >
              <ArrowLeft size={18} />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const paragraphs = String(article.articleText || '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white">
      <header className="border-b border-slate-200 bg-white">
        <div className="w-full max-w-7xl mx-auto min-w-0 px-8 md:px-12 lg:px-16 py-8 md:py-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#3b82f6]"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>

          <div className="mx-auto mt-10 max-w-3xl min-w-0 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#3b82f6] to-[#38bdf8] text-white shadow-sm">
              <FileText size={32} className="text-white" strokeWidth={1.5} aria-hidden />
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="break-words text-3xl font-bold leading-tight tracking-tight text-gray-900 md:text-4xl md:leading-tight"
            >
              {article.title}
            </motion.h1>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto min-w-0 px-8 md:px-12 lg:px-16 py-10 md:py-14">
        <article className="mx-auto max-w-2xl min-w-0">
          {paragraphs.length === 0 ? (
            <p className="text-gray-600">This article has no content yet.</p>
          ) : (
            <div className="space-y-6 md:space-y-7">
              {paragraphs.map((paragraph, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.15) }}
                  className="break-words text-lg leading-relaxed text-gray-600 md:text-xl whitespace-pre-line [overflow-wrap:anywhere]"
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>
          )}

          <div className="mt-12 border-t border-gray-100 pt-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
            >
              <ArrowLeft size={18} />
              Back to home
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
};

export default ArticleDetail;
