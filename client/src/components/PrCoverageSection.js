import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import axios from 'axios';

const DEFAULT_PR_LINKS = [
  { id: '1', title: 'Yahoo Finance', url: 'https://finance.yahoo.com', logoUrl: 'https://img.icons8.com/color/144/yahoo.png', active: true },
  { id: '2', title: 'Bloomberg', url: 'https://www.bloomberg.com', logoUrl: 'https://img.icons8.com/color/144/bloomberg.png', active: true },
  { id: '3', title: 'CoinDesk', url: 'https://www.coindesk.com', logoUrl: 'https://img.icons8.com/color/144/bitcoin.png', active: true },
  { id: '4', title: 'Cointelegraph', url: 'https://cointelegraph.com', logoUrl: 'https://img.icons8.com/color/144/ethereum.png', active: true }
];

const PrCoverageSection = () => {
  const [prLinks, setPrLinks] = useState(DEFAULT_PR_LINKS);

  useEffect(() => {
    loadPrLinks();
    window.addEventListener('datastore:update', loadPrLinks);
    return () => window.removeEventListener('datastore:update', loadPrLinks);
  }, []);

  const loadPrLinks = async () => {
    try {
      const res = await axios.get('/api/settings/PR_LINKS');
      const val = res.data?.data?.value;
      if (Array.isArray(val) && val.length > 0) {
        setPrLinks(val.filter(item => item.active !== false));
      }
    } catch (_) {}
  };

  const activeLinks = prLinks.filter(item => item.active !== false);
  if (activeLinks.length === 0) return null;

  return (
    <section className="w-full bg-[#E8E8E3] border-b border-[#D4D4CE] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center text-center">
        {/* Minimalist Top Indicator */}
        <div className="inline-flex items-center text-xs font-bold tracking-widest text-coolgray uppercase mb-2">
          <span>Institutional Coverage</span>
        </div>

        {/* Section Heading */}
        <h3 className="text-xl sm:text-2xl font-black text-charcoal tracking-tight mb-7 flex items-center justify-center gap-2.5">
          <span>As Seen On</span>
          <span
            className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-white border border-[#D4D4CE] text-charcoal rounded-none"
            style={{ borderRadius: '0px' }}
          >
            Verified Press
          </span>
        </h3>

        {/* Compact Architectural Cards Grid */}
        <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-5 max-w-5xl mx-auto">
          {activeLinks.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col justify-between w-[155px] sm:w-[190px] md:w-[210px] h-[105px] sm:h-[115px] p-3.5 sm:p-4 bg-[#F4F4F0] border border-[#D4D4CE] rounded-none hover:border-charcoal hover:bg-[#EFEFEA] hover:shadow-md transition-all duration-300 text-left shadow-xs cursor-pointer"
              style={{ borderRadius: '0px' }}
              title={`Read PR coverage on ${item.title}`}
            >
              {/* Top Row: Mini Logo Box & Arrow Button */}
              <div className="flex items-center justify-between w-full">
                <div
                  className="w-8 h-8 rounded-none bg-white border border-[#D4D4CE] p-1 flex items-center justify-center shrink-0 shadow-xs"
                  style={{ borderRadius: '0px' }}
                >
                  <img
                    src={item.logoUrl}
                    alt={item.title}
                    className="w-full h-full object-contain filter contrast-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://img.icons8.com/color/144/news.png';
                    }}
                  />
                </div>

                <div
                  className="w-6 h-6 rounded-none bg-white border border-[#D4D4CE] text-charcoal flex items-center justify-center group-hover:bg-[#3D7EFF] group-hover:text-white group-hover:border-[#3D7EFF] transition-colors duration-200 shadow-xs flex-shrink-0"
                  style={{ borderRadius: '0px' }}
                >
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
              </div>

              {/* Bottom Row: Publication Title & Press Label */}
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-charcoal group-hover:text-[#3D7EFF] transition-colors truncate">
                  {item.title}
                </h4>
                <span className="text-[9px] font-mono tracking-wider uppercase text-coolgray font-semibold block mt-0.5">
                  Verified Press
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PrCoverageSection;
