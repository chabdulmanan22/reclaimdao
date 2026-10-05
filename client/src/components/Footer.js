import React from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import {
  ArrowUpRight,
  ArrowUp,
  Building2,
  Headphones,
  Mail,
  MessageSquare,
  MapPin
} from "lucide-react";
import PrCoverageSection from "./PrCoverageSection";
import TrustpilotSection from "./TrustpilotSection";
import logoImg from "../assets/logo.svg";

const Footer = () => {
  const location = useLocation();
  const [canContribute, setCanContribute] = React.useState(false);
  const [whatsappLink, setWhatsappLink] = React.useState("https://wa.me/message/QO7NOBRERE3MO1");
  const [companyAddress, setCompanyAddress] = React.useState("12 N 2nd Street STE 100, Richmond, KY 40475");
  const [companyAddress2, setCompanyAddress2] = React.useState("");

  React.useEffect(() => {
    const checkStatusAndSettings = async () => {
      try {
        const [activeRes, publicRes, roundRes, waRes, addrRes, addr2Res] = await Promise.all([
          axios.get("/api/settings/contributionActive").catch(() => ({ data: {} })),
          axios.get("/api/settings/publicContributionsEnabled").catch(() => ({ data: {} })),
          axios.get("/api/settings/contributionRound").catch(() => ({ data: {} })),
          axios.get("/api/settings/WHATSAPP_LINK").catch(() => ({ data: {} })),
          axios.get("/api/settings/COMPANY_ADDRESS").catch(() => ({ data: {} })),
          axios.get("/api/settings/COMPANY_ADDRESS_2").catch(() => ({ data: {} }))
        ]);

        const isActive = activeRes.data?.data?.value ?? true;
        const isPublic = publicRes.data?.data?.value === true;
        const round = roundRes.data?.data?.value;
        const nowMs = Date.now();
        const hasRound = Boolean(round && round.startTime && round.endTime && nowMs <= new Date(round.endTime).getTime());
        setCanContribute(isActive && (isPublic || hasRound));

        if (waRes.data?.data?.value) setWhatsappLink(waRes.data.data.value);
        if (addrRes.data?.data?.value) setCompanyAddress(addrRes.data.data.value);
        if (addr2Res.data?.data?.value) setCompanyAddress2(addr2Res.data.data.value);
      } catch (error) {}
    };
    checkStatusAndSettings();
    window.addEventListener("datastore:update", checkStatusAndSettings);
    return () => window.removeEventListener("datastore:update", checkStatusAndSettings);
  }, []);

  return (
    <>
      {location.pathname === '/' && (
        <>
          <PrCoverageSection />
          <TrustpilotSection />
        </>
      )}

      {/* Swiss Architectural Footer */}
      <footer
        className="w-full bg-[#F8F8F5] border-t border-[#D4D4CE] text-charcoal mt-auto relative overflow-hidden"
        style={{ borderRadius: '0px' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Top Architectural Brand Bar */}
          <div className="pb-10 mb-10 border-b border-[#D4D4CE] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-md">
              <Link to="/" onClick={() => window.scrollTo(0, 0)} className="inline-block group">
                <img
                  src={logoImg}
                  alt="ReclaimDAO"
                  className="h-12 sm:h-14 w-auto object-contain group-hover:opacity-90 transition-opacity"
                />
              </Link>
              <p className="text-xs sm:text-sm text-coolgray font-medium leading-relaxed">
                Decentralized recovery governance protocol empowering victims of digital fraud through non-custodial consensus and institutional claim management.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#D4D4CE] rounded-none text-[11px] font-mono font-semibold uppercase tracking-wider text-charcoal shadow-xs"
                style={{ borderRadius: '0px' }}
              >
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                <span>Protocol Active • 100% Non-Custodial</span>
              </div>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#D4D4CE] hover:border-[#25D366] hover:bg-[#F9FCFA] rounded-none text-xs font-bold text-charcoal hover:text-[#25D366] transition-all shadow-xs group"
                style={{ borderRadius: '0px' }}
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp Official</span>
                <ArrowUpRight className="w-3 h-3 text-coolgray group-hover:text-[#25D366] transition-colors" />
              </a>
            </div>
          </div>

          {/* 5 Column Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 items-start">
            {/* Column 1: Platform */}
            <div className="space-y-3.5">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-[#3D7EFF]"></span>
                <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-charcoal">
                  Platform
                </h3>
              </div>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    to="/voting"
                    onClick={() => window.scrollTo(0, 0)}
                    className="text-xs sm:text-[13px] text-charcoal/80 hover:text-[#3D7EFF] font-medium transition-colors duration-150 flex items-center justify-between group"
                  >
                    <span>Voting</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#3D7EFF] text-[10px] font-mono">→</span>
                  </Link>
                </li>
                {canContribute && (
                  <li>
                    <Link
                      to="/contribute"
                      onClick={() => window.scrollTo(0, 0)}
                      className="text-xs sm:text-[13px] text-charcoal/80 hover:text-[#3D7EFF] font-medium transition-colors duration-150 flex items-center justify-between group"
                    >
                      <span>Contribute</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#3D7EFF] text-[10px] font-mono">→</span>
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    to="/leaderboard"
                    onClick={() => window.scrollTo(0, 0)}
                    className="text-xs sm:text-[13px] text-charcoal/80 hover:text-[#3D7EFF] font-medium transition-colors duration-150 flex items-center justify-between group"
                  >
                    <span>Leaderboard</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#3D7EFF] text-[10px] font-mono">→</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    onClick={() => window.scrollTo(0, 0)}
                    className="text-xs sm:text-[13px] text-charcoal/80 hover:text-[#3D7EFF] font-medium transition-colors duration-150 flex items-center justify-between group"
                  >
                    <span>Dashboard</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#3D7EFF] text-[10px] font-mono">→</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/referral"
                    onClick={() => window.scrollTo(0, 0)}
                    className="text-xs sm:text-[13px] text-charcoal/80 hover:text-[#3D7EFF] font-medium transition-colors duration-150 flex items-center justify-between group"
                  >
                    <span>Referral</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#3D7EFF] text-[10px] font-mono">→</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Resources */}
            <div className="space-y-3.5">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-[#3D7EFF]"></span>
                <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-charcoal">
                  Resources
                </h3>
              </div>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    to="/resources/scam-alerts"
                    onClick={() => window.scrollTo(0, 0)}
                    className="text-xs sm:text-[13px] text-charcoal/80 hover:text-[#3D7EFF] font-medium transition-colors duration-150 flex items-center justify-between group"
                  >
                    <span>Scam Alerts</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#3D7EFF] text-[10px] font-mono">→</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/resources/refund-programs"
                    onClick={() => window.scrollTo(0, 0)}
                    className="text-xs sm:text-[13px] text-charcoal/80 hover:text-[#3D7EFF] font-medium transition-colors duration-150 flex items-center justify-between group"
                  >
                    <span>Refund Programs</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#3D7EFF] text-[10px] font-mono">→</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/resources/how-refunds-work"
                    onClick={() => window.scrollTo(0, 0)}
                    className="text-xs sm:text-[13px] text-charcoal/80 hover:text-[#3D7EFF] font-medium transition-colors duration-150 flex items-center justify-between group"
                  >
                    <span>How Refunds Work</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#3D7EFF] text-[10px] font-mono">→</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal */}
            <div className="space-y-3.5">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-[#3D7EFF]"></span>
                <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-charcoal">
                  Legal
                </h3>
              </div>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    to="/privacy"
                    onClick={() => window.scrollTo(0, 0)}
                    className="text-xs sm:text-[13px] text-charcoal/80 hover:text-[#3D7EFF] font-medium transition-colors duration-150 flex items-center justify-between group"
                  >
                    <span>Privacy Policy</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#3D7EFF] text-[10px] font-mono">→</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    onClick={() => window.scrollTo(0, 0)}
                    className="text-xs sm:text-[13px] text-charcoal/80 hover:text-[#3D7EFF] font-medium transition-colors duration-150 flex items-center justify-between group"
                  >
                    <span>Terms of Service</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#3D7EFF] text-[10px] font-mono">→</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div className="space-y-3.5">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-[#3D7EFF]"></span>
                <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-charcoal">
                  Direct Contact
                </h3>
              </div>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/contact"
                    onClick={() => window.scrollTo(0, 0)}
                    className="text-xs sm:text-[13px] font-semibold text-[#3D7EFF] hover:underline flex items-center gap-1.5 group"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Contact & Support Forms</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact?type=inquiry"
                    onClick={() => window.scrollTo(0, 0)}
                    className="text-xs sm:text-[13px] text-charcoal/80 hover:text-[#3D7EFF] transition-colors block group"
                  >
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-coolgray block">
                      Enterprise Inquiries
                    </span>
                    <span className="font-semibold text-charcoal group-hover:text-[#3D7EFF]">
                      info@reclaimdao.org
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact?type=support"
                    onClick={() => window.scrollTo(0, 0)}
                    className="text-xs sm:text-[13px] text-charcoal/80 hover:text-[#3D7EFF] transition-colors block group"
                  >
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-coolgray block">
                      Technical Support
                    </span>
                    <span className="font-semibold text-charcoal group-hover:text-[#3D7EFF]">
                      support@reclaimdao.org
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 5: Offices */}
            <div className="space-y-3.5">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-[#3D7EFF]"></span>
                <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-charcoal">
                  Offices
                </h3>
              </div>
              <div className="space-y-2.5">
                {companyAddress && (
                  <div
                    className="p-3 bg-white border border-[#D4D4CE] rounded-none shadow-2xs hover:border-charcoal transition-colors"
                    style={{ borderRadius: '0px' }}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-coolgray">
                      <Building2 className="w-3 h-3 text-[#3D7EFF]" />
                      <span>Administrative Office</span>
                    </div>
                    <p className="text-xs text-charcoal/90 font-medium leading-relaxed whitespace-pre-line">
                      {companyAddress}
                    </p>
                  </div>
                )}
                {companyAddress2 && (
                  <div
                    className="p-3 bg-white border border-[#D4D4CE] rounded-none shadow-2xs hover:border-charcoal transition-colors"
                    style={{ borderRadius: '0px' }}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-coolgray">
                      <MapPin className="w-3 h-3 text-[#3D7EFF]" />
                      <span>Registered Office</span>
                    </div>
                    <p className="text-xs text-charcoal/90 font-medium leading-relaxed whitespace-pre-line">
                      {companyAddress2}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Contact Bar */}
          <div className="border-t border-[#D4D4CE] mt-10 pt-6 pb-2">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-coolgray font-medium">
              <Link
                to="/contact?type=inquiry"
                onClick={() => window.scrollTo(0, 0)}
                className="flex items-center gap-2 hover:text-[#3D7EFF] transition-colors group"
              >
                <div
                  className="w-6 h-6 rounded-none bg-white border border-[#D4D4CE] flex items-center justify-center text-charcoal group-hover:border-[#3D7EFF] group-hover:text-[#3D7EFF] transition-colors"
                  style={{ borderRadius: '0px' }}
                >
                  <Building2 className="w-3 h-3" />
                </div>
                <span>Enterprise Inquiries (<strong className="font-semibold text-charcoal group-hover:text-[#3D7EFF]">info@reclaimdao.org</strong>)</span>
              </Link>
              <span className="text-[#D4D4CE] hidden sm:inline">•</span>
              <Link
                to="/contact?type=support"
                onClick={() => window.scrollTo(0, 0)}
                className="flex items-center gap-2 hover:text-[#3D7EFF] transition-colors group"
              >
                <div
                  className="w-6 h-6 rounded-none bg-white border border-[#D4D4CE] flex items-center justify-center text-charcoal group-hover:border-[#3D7EFF] group-hover:text-[#3D7EFF] transition-colors"
                  style={{ borderRadius: '0px' }}
                >
                  <Headphones className="w-3 h-3" />
                </div>
                <span>Contact Support (<strong className="font-semibold text-charcoal group-hover:text-[#3D7EFF]">support@reclaimdao.org</strong>)</span>
              </Link>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Protocol Standard */}
          <div className="border-t border-[#D4D4CE] mt-6 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-coolgray gap-3">
            <div className="flex items-center gap-3">
              <p>© {new Date().getFullYear()} ReclaimDAO. All rights reserved.</p>
              <span className="text-[#D4D4CE]">•</span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal font-semibold">
                100% Non-Custodial
              </span>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-charcoal font-semibold tracking-tight">Decentralized Recovery Protocol</p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-7 h-7 rounded-none bg-white border border-[#D4D4CE] hover:border-charcoal hover:bg-charcoal hover:text-white flex items-center justify-center text-charcoal transition-all cursor-pointer shadow-xs"
                style={{ borderRadius: '0px' }}
                title="Back to top"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
