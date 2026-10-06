import React from 'react';
import { Check } from 'lucide-react';
import ResourcePageLayout from './ResourcePageLayout';
import { howRefundsSections } from '../../data/howRefundsContent';

const HowRefundsResourcePage = () => (
  <ResourcePageLayout
    title="How ReclaimDAO Facilitates Restitution"
    iconSrc="/images/resources/how_dao_offer_refund_icon.jpg"
    iconAlt="How refunds work"
  >
    <article className="mx-auto max-w-4xl min-w-0 space-y-6 sm:space-y-8">
      {howRefundsSections.map((section, sIdx) => (
        <section
          key={sIdx}
          className="bg-white border border-[#D4D4CE] p-6 sm:p-8 shadow-sm space-y-4"
          style={{ borderRadius: '0px' }}
        >
          {section.title && (
            <div className="flex items-center gap-2 pb-3 border-b border-[#D4D4CE]">
              <span
                className="font-mono text-[10px] font-black text-[#3D7EFF] bg-[#F8F8F6] border border-[#D4D4CE] px-2 py-0.5 uppercase"
                style={{ borderRadius: '0px' }}
              >
                0{sIdx + 1}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-charcoal tracking-tight">
                {section.title}
              </h2>
            </div>
          )}

          <div className="space-y-3">
            {section.paragraphs?.map((p, i) => (
              <p
                key={i}
                className="text-xs sm:text-sm leading-relaxed text-coolgray font-medium whitespace-pre-line [overflow-wrap:anywhere]"
              >
                {p}
              </p>
            ))}
          </div>

          {section.bullets && (
            <div className="bg-[#F8F8F6] border border-[#D4D4CE] p-4 mt-3" style={{ borderRadius: '0px' }}>
              <ul className="space-y-2 text-xs font-mono text-charcoal">
                {section.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#3D7EFF] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ))}
    </article>
  </ResourcePageLayout>
);

export default HowRefundsResourcePage;
