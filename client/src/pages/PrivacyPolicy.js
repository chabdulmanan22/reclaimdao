import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ShieldCheck, Check, ArrowLeft, ExternalLink, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
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
              <Lock className="w-3.5 h-3.5 text-[#3D7EFF]" />
              <span>Legal Compliance • Data Encryption Protocol</span>
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
            Protocol <span className="text-[#3D7EFF]">Privacy Policy</span>
          </h1>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span
              className="px-2.5 py-0.5 bg-white border border-[#D4D4CE] font-mono text-[11px] text-coolgray font-bold uppercase tracking-wider"
              style={{ borderRadius: '0px' }}
            >
              Effective Date: November 2025
            </span>
            <span
              className="px-2.5 py-0.5 bg-[#3D7EFF]/10 border border-[#3D7EFF]/30 font-mono text-[11px] text-[#3D7EFF] font-bold uppercase tracking-wider"
              style={{ borderRadius: '0px' }}
            >
              Revision 2.4
            </span>
          </div>
        </div>

        {/* Main Document Body */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white border border-[#D4D4CE] p-6 sm:p-10 md:p-12 shadow-sm space-y-8"
          style={{ borderRadius: '0px' }}
        >
          {/* Preamble */}
          <div className="space-y-3 pb-6 border-b border-[#D4D4CE]">
            <p className="text-sm sm:text-base text-charcoal font-medium leading-relaxed">
              This Privacy Policy explains how ReclaimDAO (&quot;we,&quot; &quot;our,&quot; or &quot;the platform&quot;) collects, uses, and safeguards evidentiary information when claimants interact with our portal, decentralized smart contracts, and restitution consensus mechanisms.
            </p>
            <p className="text-xs sm:text-sm text-coolgray leading-relaxed">
              ReclaimDAO is architected to protect victims of financial exploitation, uphold immutable accountability, and maintain institutional community trust through cryptographic minimization of personal identifiers.
            </p>
          </div>

          {/* Section 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-black text-[#3D7EFF] bg-[#F8F8F6] border border-[#D4D4CE] px-2 py-0.5" style={{ borderRadius: '0px' }}>
                01
              </span>
              <h2 className="text-lg sm:text-xl font-black text-charcoal tracking-tight">
                What We Collect
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-coolgray leading-relaxed">
              ReclaimDAO is built on data-minimization principles. We collect only what is strictly necessary to conduct forensic evidentiary verification and operate restitution pools.
            </p>
            <div className="bg-[#F8F8F6] border border-[#D4D4CE] p-4 space-y-2" style={{ borderRadius: '0px' }}>
              <span className="font-mono text-[11px] font-bold text-charcoal uppercase tracking-wider block">
                Information You Voluntarily Provide:
              </span>
              <ul className="text-xs text-coolgray space-y-1.5 font-mono">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#3D7EFF] shrink-0 mt-0.5" />
                  <span>Public settlement wallet addresses and fraudulent transaction hashes (TXIDs)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#3D7EFF] shrink-0 mt-0.5" />
                  <span>Evidentiary records (screenshots, communication receipts, routing links)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#3D7EFF] shrink-0 mt-0.5" />
                  <span>Cryptographic contact identifiers (email, optional Telegram/phone handle)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#3D7EFF] shrink-0 mt-0.5" />
                  <span>Narrative description of the custody loss incident</span>
                </li>
              </ul>
            </div>
            <p className="text-xs text-coolgray italic">
              <strong>Notice:</strong> Please do not upload unredacted government passports, national IDs, or bank accounts unless specifically requested by verification council compliance channels.
            </p>
          </div>

          {/* Section 2: On-chain Blockchain Data */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-black text-[#3D7EFF] bg-[#F8F8F6] border border-[#D4D4CE] px-2 py-0.5" style={{ borderRadius: '0px' }}>
                02
              </span>
              <h2 className="text-lg sm:text-xl font-black text-charcoal tracking-tight">
                Blockchain Data & Immutable Ledger Records
              </h2>
            </div>
            <div className="p-4 bg-[#F8F8F6] border-l-4 border-l-[#3D7EFF] border border-[#D4D4CE] space-y-2" style={{ borderRadius: '0px' }}>
              <p className="text-xs sm:text-sm text-charcoal leading-relaxed font-medium">
                When interacting with decentralized smart contracts, certain telemetry is permanently committed to distributed ledgers:
              </p>
              <ul className="text-xs text-coolgray font-mono space-y-1">
                <li>• Public settlement destination wallet addresses</li>
                <li>• On-chain Proof-of-Loss (RFND) token ledger minting</li>
                <li>• Consensus ballot submissions and proposal quorum casting</li>
              </ul>
              <p className="text-[11px] font-mono text-coolgray pt-1 border-t border-[#D4D4CE]">
                Distributed ledger records are globally public, mathematically permanent, and impossible to retroactively erase or amend.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-black text-[#3D7EFF] bg-[#F8F8F6] border border-[#D4D4CE] px-2 py-0.5" style={{ borderRadius: '0px' }}>
                03
              </span>
              <h2 className="text-lg sm:text-xl font-black text-charcoal tracking-tight">
                How We Utilize Claimant Information
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-coolgray leading-relaxed">
              We process dossier information exclusively for protocol operational validity:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#F8F8F6] border border-[#D4D4CE]" style={{ borderRadius: '0px' }}>
                <span className="font-bold text-charcoal block">• Claim Verification</span>
                <span className="text-coolgray text-[11px]">Audit loss dossiers against blockchain analytics</span>
              </div>
              <div className="p-3 bg-[#F8F8F6] border border-[#D4D4CE]" style={{ borderRadius: '0px' }}>
                <span className="font-bold text-charcoal block">• Quorum Allocation</span>
                <span className="text-coolgray text-[11px]">Calculate governance weights and ballot quotas</span>
              </div>
              <div className="p-3 bg-[#F8F8F6] border border-[#D4D4CE]" style={{ borderRadius: '0px' }}>
                <span className="font-bold text-charcoal block">• Claimant Communications</span>
                <span className="text-coolgray text-[11px]">Transmit critical restitution distribution notices</span>
              </div>
              <div className="p-3 bg-[#F8F8F6] border border-[#D4D4CE]" style={{ borderRadius: '0px' }}>
                <span className="font-bold text-charcoal block">• Fraud Prevention</span>
                <span className="text-coolgray text-[11px]">Prevent duplicate submissions and sybil exploitation</span>
              </div>
            </div>
            <p className="text-xs font-bold text-charcoal pt-1">
              We do not sell, rent, monetize, or commercialize claimant records to third parties.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-black text-[#3D7EFF] bg-[#F8F8F6] border border-[#D4D4CE] px-2 py-0.5" style={{ borderRadius: '0px' }}>
                04
              </span>
              <h2 className="text-lg sm:text-xl font-black text-charcoal tracking-tight">
                Security Infrastructure & Protection
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-coolgray leading-relaxed">
              We enforce rigorous technical safeguards including end-to-end encrypted storage, rate-limited submission gateways, authenticated session telemetry, and compartmentalized forensic review access.
            </p>
          </div>

          {/* Section 5 & 6 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-black text-[#3D7EFF] bg-[#F8F8F6] border border-[#D4D4CE] px-2 py-0.5" style={{ borderRadius: '0px' }}>
                05
              </span>
              <h2 className="text-lg sm:text-xl font-black text-charcoal tracking-tight">
                Retention & Claimant Privacy Rights
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-coolgray leading-relaxed">
              Off-chain telemetry is retained only for the duration required to complete forensic audit and compliance verification. Depending on your jurisdiction, you have the right to request access, correction, or deletion of off-chain records by contacting protocol operations.
            </p>
          </div>

          {/* Contact Box */}
          <div className="pt-6 border-t border-[#D4D4CE] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold text-[#3D7EFF] uppercase tracking-wider block">
                  Official Communication Channel
                </span>
                <h3 className="text-base font-black text-charcoal tracking-tight">
                  Contact Protocol Data Protection
                </h3>
              </div>
              <ShieldCheck className="w-5 h-5 text-[#3D7EFF]" />
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

export default PrivacyPolicy;
