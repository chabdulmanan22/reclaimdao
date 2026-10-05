import React from 'react';
import { Mail, Send } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">ReclaimDAO - Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: November 2025</p>
        <div className="space-y-6 text-gray-800">
          <p>Welcome to ReclaimDAO ("we," "our," or "ReclaimDAO"). By accessing or using reclaimdao.org, our applications, smart contracts, portals, or any associated services (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use our Services.</p>
          <h2 className="text-xl font-bold text-gray-900">1. Nature of the Platform</h2>
          <p>ReclaimDAO is a decentralized asset recovery protocol designed to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Verify fraud victims</li>
            <li>Issue on-chain proof-of-loss tokens ("RFND")</li>
            <li>Facilitate government-backed fund distribution to verified victims</li>
            <li>Support recovery efforts through transparent on-chain processes</li>
          </ul>
          <p>ReclaimDAO is not an insurance company, financial institution, broker, or legal service provider. All functions are executed through blockchain-based smart contracts.</p>
          <h2 className="text-xl font-bold text-gray-900">2. Eligibility</h2>
          <p>By using our Services, you confirm that you:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Are at least 18 years old</li>
            <li>Are legally permitted to use blockchain-based protocols in your jurisdiction</li>
            <li>Are not located in a sanctioned country or on any government blacklist</li>
            <li>Understand the risks of using decentralized technologies</li>
          </ul>
          <p>We reserve the right to restrict access where legally required.</p>
          <h2 className="text-xl font-bold text-gray-900">3. No Guarantees of Compensation</h2>
          <p>Submitting a claim does not guarantee verification, token issuance, fund distribution, or any level of financial compensation. All distribution decisions are made through structured, verifiable processes. ReclaimDAO assumes no responsibility for outcomes.</p>
          <h2 className="text-xl font-bold text-gray-900">4. User Responsibilities</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Submit fraudulent, misleading, or inaccurate victim claims</li>
            <li>Upload harmful, malicious, or illegal content</li>
            <li>Manipulate governance or token economics</li>
            <li>Interfere with smart contracts or system integrity</li>
            <li>Impersonate another person or entity</li>
          </ul>
          <p>Violations may result in denial of services, claim rejection, or permanent banning.</p>
          <h2 className="text-xl font-bold text-gray-900">5. Token (RFND) Terms</h2>
          <p>RFND tokens are on-chain Proof-of-Loss tokens representing verified victim claims. They are minted based on validated losses and used to access the refund liquidity pool. RFND is not a security, investment, or guarantee of value.</p>
          <h2 className="text-xl font-bold text-gray-900">6. Smart Contract Risks</h2>
          <p>By using ReclaimDAO, you acknowledge and accept smart contract bugs, possible loss of tokens, network failures, and that transactions are irreversible. ReclaimDAO provides no warranties, explicit or implied.</p>
          <h2 className="text-xl font-bold text-gray-900">7. No Legal or Financial Advice</h2>
          <p>Content on this site is provided for informational purposes only. Nothing in our Services constitutes legal, financial, tax, or investment advice. Always consult licensed professionals.</p>
          <h2 className="text-xl font-bold text-gray-900">8. Third-Party Links and Partners</h2>
          <p>ReclaimDAO may link to third-party platforms, wallet providers, and exchange platforms. We do not control or endorse third-party services and are not responsible for their actions or policies.</p>
          <h2 className="text-xl font-bold text-gray-900">9. Intellectual Property</h2>
          <p>Unless otherwise stated, all website text, design, and branding belong to ReclaimDAO. You may not copy, modify, or distribute our content without permission.</p>
          <h2 className="text-xl font-bold text-gray-900">10. Termination</h2>
          <p>We may suspend or restrict your access to the Services if you violate these Terms, engage in fraudulent or abusive behavior, harm the protocol, or submit false claims.</p>
          <h2 className="text-xl font-bold text-gray-900">11. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, ReclaimDAO, its contributors, members, and partners are not liable for loss of funds or tokens, service interruptions, errors in claim verification, or any indirect, incidental, or consequential damages. Your use of the platform is at your own risk.</p>
          <h2 className="text-xl font-bold text-gray-900">12. Changes to These Terms</h2>
          <p>We may update these Terms at any time. Changes will be posted on this page with a new "Last Updated" date. Continued use of the Services means you accept the updated Terms.</p>
          <h2 className="text-xl font-bold text-gray-900">13. Contact</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-900"><Mail className="w-5 h-5 text-[#10b981]" /><span>support@reclaimdao.org</span></div>
            <div className="flex items-center gap-2 text-gray-900"><Send className="w-5 h-5 text-[#10b981]" /><span>reclaimdao.org</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
