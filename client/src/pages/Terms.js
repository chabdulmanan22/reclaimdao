import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Mail, ShieldAlert, Check, ArrowLeft, Globe, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#F8F8F6] text-charcoal py-8 sm:py-12 md:py-16 selection:bg-[#3D7EFF] selection:text-white">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

        {/* Masthead Header Section */}
        <div className="border-b border-[#D4D4CE] pb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#D4D4CE] text-charcoal text-[11px] font-mono font-bold uppercase tracking-wider shadow-sm"
              style={{ borderRadius: '0px' }}
            >
              <Scale className="w-3.5 h-3.5 text-[#3D7EFF]" />
              <span>Legal Protocol • Terms of Service Agreement</span>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D4D4CE] text-charcoal hover:border-[#3D7EFF] text-xs font-mono font-bold uppercase transition-all shadow-sm"
              style={{ borderRadius: '0px' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-charcoal tracking-tight">
            Terms of <span className="text-[#3D7EFF]">Service</span>
          </h1>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span
              className="px-2.5 py-0.5 bg-white border border-[#D4D4CE] font-mono text-[11px] text-coolgray font-bold uppercase tracking-wider"
              style={{ borderRadius: '0px' }}
            >
              Last Updated: November 2025
            </span>
            <span
              className="px-2.5 py-0.5 bg-[#3D7EFF]/10 border border-[#3D7EFF]/30 font-mono text-[11px] text-[#3D7EFF] font-bold uppercase tracking-wider"
              style={{ borderRadius: '0px' }}
            >
              Binding Agreement
            </span>
          </div>
        </div>

        {/* Main Terms Document Body */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white border border-[#D4D4CE] p-6 sm:p-10 md:p-12 shadow-sm space-y-8"
          style={{ borderRadius: '0px' }}
        >
          {/* Welcome Intro */}
          <div className="space-y-3 pb-6 border-b border-[#D4D4CE]">
            <p className="text-sm sm:text-base text-charcoal font-medium leading-relaxed">
              Welcome to ReclaimDAO (&quot;we,&quot; &quot;our,&quot; or &quot;ReclaimDAO&quot;). By accessing or using reclaimdao.org, our web applications, decentralized smart contracts, evidentiary review portals, or consensus services (collectively, the &quot;Services&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;).
            </p>
            <p className="text-xs sm:text-sm text-coolgray leading-relaxed">
              If you do not agree to these Terms, do not interact with our applications, sign transactions, or submit claim dossiers.
            </p>
          </div>

          {/* Section 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-black text-[#3D7EFF] bg-[#F8F8F6] border border-[#D4D4CE] px-2 py-0.5" style={{ borderRadius: '0px' }}>
                01
              </span>
              <h2 className="text-lg sm:text-xl font-black text-charcoal tracking-tight">
                Nature of the Platform
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-coolgray leading-relaxed">
              ReclaimDAO is a decentralized asset recovery protocol designed to:
            </p>
            <div className="bg-[#F8F8F6] border border-[#D4D4CE] p-4 space-y-2 font-mono text-xs" style={{ borderRadius: '0px' }}>
              <div className="flex items-center gap-2 text-charcoal font-bold">
                <Check className="w-4 h-4 text-[#3D7EFF] shrink-0" />
                <span>Verify claims of individuals affected by digital asset fraud & exchange collapse</span>
              </div>
              <div className="flex items-center gap-2 text-charcoal font-bold">
                <Check className="w-4 h-4 text-[#3D7EFF] shrink-0" />
                <span>Catalog on-chain Proof-of-Loss records (&quot;RFND&quot;)</span>
              </div>
              <div className="flex items-center gap-2 text-charcoal font-bold">
                <Check className="w-4 h-4 text-[#3D7EFF] shrink-0" />
                <span>Facilitate structured fund distribution through transparent on-chain quorum</span>
              </div>
            </div>
            <p className="text-xs text-coolgray leading-relaxed pt-1">
              ReclaimDAO is <strong>not</strong> an insurance company, banking institution, custodian, broker-dealer, or legal representation firm. Protocol operations are governed mathematically through algorithmic smart contracts.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-black text-[#3D7EFF] bg-[#F8F8F6] border border-[#D4D4CE] px-2 py-0.5" style={{ borderRadius: '0px' }}>
                02
              </span>
              <h2 className="text-lg sm:text-xl font-black text-charcoal tracking-tight">
                Claimant Eligibility & Requirements
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-coolgray leading-relaxed">
              By submitting telemetry or connecting an address, you confirm that you are at least 18 years old, possess legal authority under your local jurisdiction to participate in decentralized systems, and are not designated on OFAC or international sanctions lists.
            </p>
          </div>

          {/* Section 3: No Guarantee of Compensation */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-black text-[#3D7EFF] bg-[#F8F8F6] border border-[#D4D4CE] px-2 py-0.5" style={{ borderRadius: '0px' }}>
                03
              </span>
              <h2 className="text-lg sm:text-xl font-black text-charcoal tracking-tight">
                No Guarantees of Compensation or Recovery
              </h2>
            </div>
            <div className="p-4 bg-[#F8F8F6] border-l-4 border-l-amber-500 border border-[#D4D4CE] space-y-2" style={{ borderRadius: '0px' }}>
              <div className="flex items-center gap-2 text-amber-700 font-mono text-xs font-bold uppercase">
                <ShieldAlert className="w-4 h-4" />
                <span>Essential Risk Disclaimer</span>
              </div>
              <p className="text-xs sm:text-sm text-charcoal leading-relaxed font-medium">
                Submission of an evidentiary dossier does not guarantee claim verification, token allocation, escrow disbursement, or any fixed financial reimbursement. All distribution actions depend on community verification and escrow liquidity availability.
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-black text-[#3D7EFF] bg-[#F8F8F6] border border-[#D4D4CE] px-2 py-0.5" style={{ borderRadius: '0px' }}>
                04
              </span>
              <h2 className="text-lg sm:text-xl font-black text-charcoal tracking-tight">
                Claimant Responsibilities & Prohibited Conduct
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-coolgray leading-relaxed">
              Claimants warrant that all submitted transactional documentation is truthful, accurate, and represents genuine forensic loss. Submitting falsified hashes, forged identity credentials, or attempting sybil manipulation will result in immediate disqualification and permanent protocol blacklisting.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-black text-[#3D7EFF] bg-[#F8F8F6] border border-[#D4D4CE] px-2 py-0.5" style={{ borderRadius: '0px' }}>
                05
              </span>
              <h2 className="text-lg sm:text-xl font-black text-charcoal tracking-tight">
                Proof-of-Loss (RFND) & Smart Contract Risks
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-coolgray leading-relaxed">
              RFND tokens represent cryptographic proof of verified victim losses. RFND is not an investment contract, security, currency, or guarantee of monetary yield. Users acknowledge inherent blockchain risks including network forks, smart contract execution latency, and irreversible transactions.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-black text-[#3D7EFF] bg-[#F8F8F6] border border-[#D4D4CE] px-2 py-0.5" style={{ borderRadius: '0px' }}>
                06
              </span>
              <h2 className="text-lg sm:text-xl font-black text-charcoal tracking-tight">
                Limitation of Liability
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-coolgray leading-relaxed">
              To the maximum extent permitted under applicable law, ReclaimDAO, its contributors, forensic reviewers, and community members shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from decentralized protocol participation.
            </p>
          </div>

          {/* Contact Box */}
          <div className="pt-6 border-t border-[#D4D4CE] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold text-[#3D7EFF] uppercase tracking-wider block">
                  Legal Inquiries
                </span>
                <h3 className="text-base font-black text-charcoal tracking-tight">
                  Protocol Legal Governance Contact
                </h3>
              </div>
              <Scale className="w-5 h-5 text-[#3D7EFF]" />
            </div>

            <div className="p-4 bg-[#F8F8F6] border border-[#D4D4CE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono" style={{ borderRadius: '0px' }}>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#3D7EFF]" />
                <span className="text-charcoal font-bold">support@reclaimdao.org</span>
              </div>
              <div className="flex items-center gap-2 text-coolgray">
                <Globe className="w-4 h-4 text-[#3D7EFF]" />
                <span>reclaimdao.org</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Terms;
