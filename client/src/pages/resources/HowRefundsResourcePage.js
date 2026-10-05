import React from 'react';
import ResourcePageLayout from './ResourcePageLayout';
import { howRefundsSections } from '../../data/howRefundsContent';

const HowRefundsResourcePage = () => (
  <ResourcePageLayout
    title="How ReclaimDAO Provides Refunds"
    iconSrc="/images/resources/how_dao_offer_refund_icon.jpg"
    iconAlt="How refunds work"
  >

    <article className="mx-auto max-w-3xl min-w-0 space-y-10">
      {howRefundsSections.map((section, sIdx) => (
        <section key={sIdx} className="scroll-mt-24">
          {section.title ? (
            <h2 className="mb-4 text-2xl font-bold text-gray-900">{section.title}</h2>
          ) : null}
          {section.paragraphs?.map((p, i) => (
            <p
              key={i}
              className="mb-4 text-lg leading-relaxed text-gray-600 last:mb-0 whitespace-pre-line [overflow-wrap:anywhere]"
            >
              {p}
            </p>
          ))}
          {section.bullets ? (
            <ul className="mt-4 list-disc space-y-2 pl-6 text-lg leading-relaxed text-gray-600">
              {section.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </article>
  </ResourcePageLayout>
);

export default HowRefundsResourcePage;
