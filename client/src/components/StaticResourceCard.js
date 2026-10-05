import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ShieldAlert, BadgeDollarSign, Workflow } from 'lucide-react';

const ICON_MAP = {
  'scam-alerts': {
    icon: ShieldAlert,
    tag: 'VERIFIED INTEL • 01',
  },
  'refund-programs': {
    icon: BadgeDollarSign,
    tag: 'RESTITUTION POOL • 02',
  },
  'how-refunds': {
    icon: Workflow,
    tag: 'PROCEDURAL STEPS • 03',
  },
};

const StaticResourceCard = ({ to, title, description, id }) => {
  const meta = ICON_MAP[id] || { icon: ShieldAlert, tag: 'OFFICIAL GUIDE' };
  const Icon = meta.icon;

  return (
    <Link
      to={to}
      className="group relative flex flex-col justify-between h-full min-h-[350px] w-full p-7 sm:p-8 bg-[#F4F4F0] border border-[#D4D4CE] rounded-none hover:border-charcoal hover:bg-[#EFEFEA] transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer text-left"
      style={{ borderRadius: '0px' }}
    >
      {/* Top Row: Professional Vector Icon & Minimalist Index Tag */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div
            className="w-12 h-12 rounded-none bg-white border border-[#D4D4CE] flex items-center justify-center text-charcoal group-hover:bg-[#3D7EFF] group-hover:text-white group-hover:border-[#3D7EFF] transition-colors duration-200 shadow-xs"
            style={{ borderRadius: '0px' }}
          >
            <Icon className="w-6 h-6 stroke-[1.8]" />
          </div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-coolgray font-semibold">
            {meta.tag}
          </span>
        </div>

        {/* Content: Title & Description */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-charcoal tracking-tight leading-snug group-hover:text-[#3D7EFF] transition-colors">
            {title}
          </h3>
          <p className="text-sm text-charcoal/75 leading-relaxed font-normal">
            {description}
          </p>
        </div>
      </div>

      {/* Bottom Action: Read Guide text + Sharp Corner Arrow Button */}
      <div className="pt-6 mt-6 border-t border-[#D4D4CE]/60 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-charcoal group-hover:text-[#3D7EFF] transition-colors">
          Read Guide
        </span>
        <div
          className="w-8 h-8 rounded-none bg-white border border-[#D4D4CE] text-charcoal flex items-center justify-center group-hover:bg-[#3D7EFF] group-hover:text-white group-hover:border-[#3D7EFF] transition-colors duration-200 shadow-xs flex-shrink-0"
          style={{ borderRadius: '0px' }}
        >
          <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />
        </div>
      </div>
    </Link>
  );
};

export default StaticResourceCard;
