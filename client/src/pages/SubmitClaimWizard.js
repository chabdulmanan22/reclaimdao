import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  User,
  Mail,
  DollarSign,
  FileText,
  Clock,
  Check,
  Send
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  getJoinWizard,
  setJoinWizard,
  clearJoinWizard,
  addJoinApplication as dsAddJoinApplication
} from '../utils/datastore';

const STEPS = [
  { id: 1, path: '/join-notice', label: 'NOTICE', short: 'Guidelines' },
  { id: 2, path: '/join-details', label: 'DETAILS', short: 'Identity' },
  { id: 3, path: '/join-contact', label: 'CONTACT', short: 'Coordinates' },
  { id: 4, path: '/join-loss', label: 'LOSS', short: 'Audit Data' },
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 140 : -140,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 320, damping: 32 },
      opacity: { duration: 0.26 },
      scale: { duration: 0.26 },
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? -140 : 140,
    opacity: 0,
    scale: 0.98,
    transition: {
      x: { type: 'spring', stiffness: 320, damping: 32 },
      opacity: { duration: 0.22 },
      scale: { duration: 0.22 },
    },
  }),
};

const SubmitClaimWizard = ({ initialStep = 1 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const refParam = searchParams.get('ref') || localStorage.getItem('landingReferralCode') || '';

  // Determine active step from route if available
  const getStepFromPath = () => {
    const p = location.pathname;
    if (p.includes('/join-details')) return 2;
    if (p.includes('/join-contact')) return 3;
    if (p.includes('/join-loss')) return 4;
    if (p.includes('/join-submitted')) return 5;
    return initialStep || 1;
  };

  const [step, setStep] = useState(getStepFromPath());
  const [direction, setDirection] = useState(1); // 1 = forward (left out, right in), -1 = back

  // Form states
  const [details, setDetails] = useState({
    firstName: '',
    lastName: '',
    gender: 'male',
    dob: '',
  });

  const [contact, setContact] = useState({
    email: '',
    countryCode: '+1',
    phone: '',
    telegramUsername: '',
    address1: '',
    address2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
  });

  const [loss, setLoss] = useState({
    totalAmount: '',
    breakdown: '',
    period: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedPrefill, setSubmittedPrefill] = useState(location.state?.prefill || null);

  // Initialize from datastore
  useEffect(() => {
    const wiz = getJoinWizard();
    if (wiz.details) setDetails((prev) => ({ ...prev, ...wiz.details }));
    if (wiz.contact) setContact((prev) => ({ ...prev, ...wiz.contact }));
    if (wiz.loss) setLoss((prev) => ({ ...prev, ...wiz.loss }));

    if (refParam && (!wiz.referralCode || wiz.referralCode !== refParam)) {
      setJoinWizard({ referralCode: refParam });
    }
  }, [refParam]);

  // Sync route on step change
  const goToStep = (nextStep, dir) => {
    setDirection(dir);
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const stepObj = STEPS.find((s) => s.id === nextStep);
    let targetPath = stepObj ? stepObj.path : nextStep === 5 ? '/join-submitted' : '/join-notice';
    if (refParam) {
      targetPath += `?ref=${encodeURIComponent(refParam)}`;
    }
    // Update browser URL without triggering full reload
    window.history.pushState(null, '', targetPath);
  };

  // Step 2 validations
  const isDetailsValid = details.firstName.trim() && details.lastName.trim() && details.gender && details.dob;

  // Step 3 validations
  const isContactValid =
    contact.email.trim() &&
    contact.countryCode.trim() &&
    contact.phone.trim() &&
    contact.address1.trim() &&
    contact.city.trim() &&
    contact.stateProvince.trim() &&
    contact.postalCode.trim();

  // Step 4 validations
  const isLossValid = loss.totalAmount.trim() && loss.period.trim();

  // Submit Handler
  const handleSubmit = async () => {
    if (!isLossValid) {
      toast.error('Please specify the total amount lost and incident period.');
      return;
    }

    setSubmitting(true);
    const combined = {
      ...details,
      ...contact,
      ...loss,
      referralCode: refParam || undefined,
    };

    try {
      setJoinWizard({ loss });
      await axios.post('/api/join', {
        firstName: combined.firstName,
        lastName: combined.lastName,
        email: combined.email,
        details: combined,
        referralCode: refParam || undefined,
      });

      dsAddJoinApplication({
        firstName: combined.firstName,
        lastName: combined.lastName,
        email: combined.email,
        details: combined,
        referralCode: refParam || undefined,
      });

      setSubmittedPrefill(combined);
      goToStep(5, 1);
    } catch (err) {
      console.error('Submission error:', err);
      // Fallback local save in case offline / demo backend
      dsAddJoinApplication({
        firstName: combined.firstName,
        lastName: combined.lastName,
        email: combined.email,
        details: combined,
        referralCode: refParam || undefined,
      });
      setSubmittedPrefill(combined);
      goToStep(5, 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-charcoal font-sans selection:bg-[#3D7EFF] selection:text-white pb-20 pt-6 sm:pt-10 overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Section in Swiss Architectural Style */}
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-2 text-coolgray font-mono text-[11px] font-bold uppercase tracking-widest">
            <Shield className="w-3.5 h-3.5 text-[#3D7EFF]" />
            <span>Decentralized Restitution Protocol</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-charcoal tracking-tight leading-tight mb-2">
            Submit a Restitution Claim
          </h1>
          <p className="text-xs sm:text-sm text-coolgray font-normal leading-relaxed">
            Document verified digital-asset losses for cryptographic tracking and legal recovery coordination.
          </p>
        </div>

        {/* Step Progress Bar (Only visible during steps 1-4) */}
        {step <= 4 && (
          <div
            className="bg-white border border-[#D4D4CE] p-3 sm:p-4 mb-6 shadow-xs"
            style={{ borderRadius: '0px' }}
          >
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              {STEPS.map((s) => {
                const isCurrent = step === s.id;
                const isComplete = step > s.id;
                return (
                  <div
                    key={s.id}
                    className={`flex flex-col border-t-2 pt-2 transition-colors ${
                      isCurrent
                        ? 'border-[#3D7EFF]'
                        : isComplete
                        ? 'border-[#10B981]'
                        : 'border-[#D4D4CE]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono uppercase font-bold tracking-wider">
                      <span
                        className={
                          isCurrent
                            ? 'text-[#3D7EFF]'
                            : isComplete
                            ? 'text-[#10B981]'
                            : 'text-coolgray'
                        }
                      >
                        STEP 0{s.id}
                      </span>
                      {isComplete && <span className="text-[#10B981]">✓</span>}
                    </div>
                    <span
                      className={`text-xs font-bold truncate mt-0.5 ${
                        isCurrent
                          ? 'text-charcoal'
                          : isComplete
                          ? 'text-charcoal/80'
                          : 'text-coolgray/70'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Card Stage with Fluid Left/Right Slide Transitions */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {/* ========================================================= */}
            {/* STEP 1: IMPORTANT NOTICE */}
            {/* ========================================================= */}
            {step === 1 && (
              <motion.div
                key="step-1-notice"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="bg-white border border-[#D4D4CE] p-6 sm:p-10 shadow-sm"
                style={{ borderRadius: '0px' }}
              >
                <div className="flex items-center gap-2 pb-3 mb-6 border-b border-[#D4D4CE]">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#3D7EFF]">
                    STEP 01 OF 04 • MANDATORY NOTICE
                  </span>
                </div>

                <div className="space-y-4 text-charcoal/90 text-sm sm:text-[15px] leading-relaxed">
                  <h2 className="text-xl sm:text-2xl font-black text-charcoal tracking-tight">
                    Important Notice & Filing Guidelines
                  </h2>

                  <p className="text-coolgray leading-relaxed">
                    Please read carefully before proceeding. ReclaimDAO facilitates cryptographic asset tracing and legal recovery coordination for eligible victims of fraud, phishing attacks, and unauthorized smart-contract drainage.
                  </p>

                  <p className="text-coolgray leading-relaxed">
                    To process your request accurately, you will be asked to document your legal identity, verified contact coordinates, and on-chain loss specifics (including transaction hashes and addresses).
                  </p>

                  {/* Warning Box in Swiss Architectural Style */}
                  <div
                    className="p-4 sm:p-5 bg-[#FEF2F2] border border-[#FCA5A5] border-l-4 border-l-[#EF4444] text-[#991B1B] text-xs sm:text-sm leading-relaxed"
                    style={{ borderRadius: '0px' }}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold block text-sm mb-1 text-[#991B1B]">
                          Legal Warning Regarding Falsified Claims
                        </strong>
                        <span>
                          Any individual found to have submitted counterfeit documentation, falsified transaction hashes, or fraudulent loss claims will be permanently disqualified from recovery assistance and immediately reported to domestic and international cybercrime enforcement authorities.
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-coolgray leading-relaxed pt-2">
                    By proceeding, you affirm that the information submitted is truthful and complete to the best of your knowledge. All submitted evidence is encrypted in transit and handled under strict confidentiality protocols.
                  </p>
                </div>

                {/* Footer Navigation Buttons */}
                <div className="mt-10 pt-6 border-t border-[#D4D4CE] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="px-6 py-3.5 bg-white border border-[#D4D4CE] hover:border-charcoal text-charcoal font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
                    style={{ borderRadius: '0px' }}
                  >
                    ← Return to Homepage
                  </button>

                  <button
                    type="button"
                    onClick={() => goToStep(2, 1)}
                    className="px-8 py-3.5 bg-[#3D7EFF] hover:bg-electric-600 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    style={{ borderRadius: '0px' }}
                  >
                    <span>Acknowledge & Proceed</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* STEP 2: PERSONAL DETAILS */}
            {/* ========================================================= */}
            {step === 2 && (
              <motion.div
                key="step-2-details"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="bg-white border border-[#D4D4CE] p-6 sm:p-10 shadow-sm"
                style={{ borderRadius: '0px' }}
              >
                <div className="flex items-center gap-2 pb-3 mb-6 border-b border-[#D4D4CE]">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#3D7EFF]">
                    STEP 02 OF 04 • IDENTITY VERIFICATION
                  </span>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-black text-charcoal tracking-tight mb-1">
                    Personal Details
                  </h2>
                  <p className="text-xs sm:text-sm text-coolgray">
                    Provide the victim's verified legal identity for court-ready forensic restitution records.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                        First Name <span className="text-[#3D7EFF]">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={details.firstName}
                        onChange={(e) => {
                          const v = e.target.value;
                          setDetails((prev) => ({ ...prev, firstName: v }));
                          setJoinWizard({ details: { ...details, firstName: v } });
                        }}
                        placeholder="e.g. Robert"
                        className="w-full px-4 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium transition-colors"
                        style={{ borderRadius: '0px' }}
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                        Last Name <span className="text-[#3D7EFF]">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={details.lastName}
                        onChange={(e) => {
                          const v = e.target.value;
                          setDetails((prev) => ({ ...prev, lastName: v }));
                          setJoinWizard({ details: { ...details, lastName: v } });
                        }}
                        placeholder="e.g. Miller"
                        className="w-full px-4 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium transition-colors"
                        style={{ borderRadius: '0px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-2">
                      Gender <span className="text-[#3D7EFF]">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['male', 'female', 'other'].map((opt) => {
                        const isSelected = details.gender === opt;
                        const label = opt === 'male' ? 'Male' : opt === 'female' ? 'Female' : 'Other';
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setDetails((prev) => ({ ...prev, gender: opt }));
                              setJoinWizard({ details: { ...details, gender: opt } });
                            }}
                            className={`py-3 px-4 border text-center font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#3D7EFF] text-white border-[#3D7EFF]'
                                : 'bg-white text-charcoal border-[#D4D4CE] hover:border-charcoal'
                            }`}
                            style={{ borderRadius: '0px' }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                      Date of Birth <span className="text-[#3D7EFF]">*</span>
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={details.dob}
                      onChange={(e) => {
                        const v = e.target.value;
                        setDetails((prev) => ({ ...prev, dob: v }));
                        setJoinWizard({ details: { ...details, dob: v } });
                      }}
                      className="w-full px-4 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium transition-colors"
                      style={{ borderRadius: '0px' }}
                    />
                  </div>
                </div>

                {/* Footer Navigation Buttons */}
                <div className="mt-10 pt-6 border-t border-[#D4D4CE] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => goToStep(1, -1)}
                    className="px-6 py-3.5 bg-white border border-[#D4D4CE] hover:border-charcoal text-charcoal font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
                    style={{ borderRadius: '0px' }}
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    disabled={!isDetailsValid}
                    onClick={() => {
                      if (!isDetailsValid) {
                        toast.error('Please complete all required fields.');
                        return;
                      }
                      goToStep(3, 1);
                    }}
                    className={`px-8 py-3.5 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      isDetailsValid
                        ? 'bg-[#3D7EFF] hover:bg-electric-600 text-white cursor-pointer shadow-sm'
                        : 'bg-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed'
                    }`}
                    style={{ borderRadius: '0px' }}
                  >
                    <span>Continue to Contact</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* STEP 3: CONTACT & ADDRESS */}
            {/* ========================================================= */}
            {step === 3 && (
              <motion.div
                key="step-3-contact"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="bg-white border border-[#D4D4CE] p-6 sm:p-10 shadow-sm"
                style={{ borderRadius: '0px' }}
              >
                <div className="flex items-center gap-2 pb-3 mb-6 border-b border-[#D4D4CE]">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#3D7EFF]">
                    STEP 03 OF 04 • JURISDICTION & COORDINATES
                  </span>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-black text-charcoal tracking-tight mb-1">
                    Contact & Address
                  </h2>
                  <p className="text-xs sm:text-sm text-coolgray">
                    Used by lead investigators to transmit recovery status notifications and legal dossiers.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                      Email Address <span className="text-[#3D7EFF]">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={contact.email}
                      onChange={(e) => {
                        const v = e.target.value;
                        setContact((prev) => ({ ...prev, email: v }));
                        setJoinWizard({ contact: { ...contact, email: v } });
                      }}
                      placeholder="claimant@example.com"
                      className="w-full px-4 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium transition-colors"
                      style={{ borderRadius: '0px' }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                        Country Code <span className="text-[#3D7EFF]">*</span>
                      </label>
                      <input
                        type="text"
                        name="countryCode"
                        value={contact.countryCode}
                        onChange={(e) => {
                          const v = e.target.value;
                          setContact((prev) => ({ ...prev, countryCode: v }));
                          setJoinWizard({ contact: { ...contact, countryCode: v } });
                        }}
                        placeholder="+1"
                        className="w-full px-4 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium transition-colors"
                        style={{ borderRadius: '0px' }}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                        Phone Number <span className="text-[#3D7EFF]">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={contact.phone}
                        onChange={(e) => {
                          const v = e.target.value;
                          setContact((prev) => ({ ...prev, phone: v }));
                          setJoinWizard({ contact: { ...contact, phone: v } });
                        }}
                        placeholder="(555) 000-0000"
                        className="w-full px-4 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium transition-colors"
                        style={{ borderRadius: '0px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                      Telegram Username <span className="text-coolgray text-[10px]">(Optional for expedited alerts)</span>
                    </label>
                    <input
                      type="text"
                      name="telegramUsername"
                      value={contact.telegramUsername}
                      onChange={(e) => {
                        const v = e.target.value;
                        setContact((prev) => ({ ...prev, telegramUsername: v }));
                        setJoinWizard({ contact: { ...contact, telegramUsername: v } });
                      }}
                      placeholder="@username"
                      className="w-full px-4 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium transition-colors"
                      style={{ borderRadius: '0px' }}
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                      Physical Street Address <span className="text-[#3D7EFF]">*</span>
                    </label>
                    <input
                      type="text"
                      name="address1"
                      value={contact.address1}
                      onChange={(e) => {
                        const v = e.target.value;
                        setContact((prev) => ({ ...prev, address1: v }));
                        setJoinWizard({ contact: { ...contact, address1: v } });
                      }}
                      placeholder="Street address or P.O. Box"
                      className="w-full px-4 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium transition-colors"
                      style={{ borderRadius: '0px' }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                        City <span className="text-[#3D7EFF]">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={contact.city}
                        onChange={(e) => {
                          const v = e.target.value;
                          setContact((prev) => ({ ...prev, city: v }));
                          setJoinWizard({ contact: { ...contact, city: v } });
                        }}
                        placeholder="Austin"
                        className="w-full px-4 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium transition-colors"
                        style={{ borderRadius: '0px' }}
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                        State / Province <span className="text-[#3D7EFF]">*</span>
                      </label>
                      <input
                        type="text"
                        name="stateProvince"
                        value={contact.stateProvince}
                        onChange={(e) => {
                          const v = e.target.value;
                          setContact((prev) => ({ ...prev, stateProvince: v }));
                          setJoinWizard({ contact: { ...contact, stateProvince: v } });
                        }}
                        placeholder="Texas"
                        className="w-full px-4 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium transition-colors"
                        style={{ borderRadius: '0px' }}
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                        Postal Code <span className="text-[#3D7EFF]">*</span>
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={contact.postalCode}
                        onChange={(e) => {
                          const v = e.target.value;
                          setContact((prev) => ({ ...prev, postalCode: v }));
                          setJoinWizard({ contact: { ...contact, postalCode: v } });
                        }}
                        placeholder="78701"
                        className="w-full px-4 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium transition-colors"
                        style={{ borderRadius: '0px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Navigation Buttons */}
                <div className="mt-10 pt-6 border-t border-[#D4D4CE] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => goToStep(2, -1)}
                    className="px-6 py-3.5 bg-white border border-[#D4D4CE] hover:border-charcoal text-charcoal font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
                    style={{ borderRadius: '0px' }}
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    disabled={!isContactValid}
                    onClick={() => {
                      if (!isContactValid) {
                        toast.error('Please complete all required fields.');
                        return;
                      }
                      goToStep(4, 1);
                    }}
                    className={`px-8 py-3.5 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      isContactValid
                        ? 'bg-[#3D7EFF] hover:bg-electric-600 text-white cursor-pointer shadow-sm'
                        : 'bg-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed'
                    }`}
                    style={{ borderRadius: '0px' }}
                  >
                    <span>Continue to Loss Details</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* STEP 4: LOSS DETAILS & SUBMISSION */}
            {/* ========================================================= */}
            {step === 4 && (
              <motion.div
                key="step-4-loss"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="bg-white border border-[#D4D4CE] p-6 sm:p-10 shadow-sm"
                style={{ borderRadius: '0px' }}
              >
                <div className="flex items-center gap-2 pb-3 mb-6 border-b border-[#D4D4CE]">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#3D7EFF]">
                    STEP 04 OF 04 • FORENSIC INCIDENT TELEMETRY
                  </span>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-black text-charcoal tracking-tight mb-1">
                    Loss Details & Evidence
                  </h2>
                  <p className="text-xs sm:text-sm text-coolgray">
                    Specify the total value and transaction references for on-chain cluster mapping.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
                      Total Documented Loss <span className="text-[#3D7EFF]">*</span>
                    </label>
                    <p className="text-xs text-coolgray mb-2">
                      Enter the total aggregate value lost across all incidents (specify USD or cryptocurrency amount).
                    </p>
                    <input
                      type="text"
                      name="totalAmount"
                      value={loss.totalAmount}
                      onChange={(e) => {
                        const v = e.target.value;
                        setLoss((prev) => ({ ...prev, totalAmount: v }));
                        setJoinWizard({ loss: { ...loss, totalAmount: v } });
                      }}
                      placeholder="e.g. $184,500 USD or 62.5 ETH"
                      className="w-full px-4 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium transition-colors font-mono"
                      style={{ borderRadius: '0px' }}
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
                      Incident Breakdown, Platforms & Transaction Hashes
                    </label>
                    <p className="text-xs text-coolgray mb-2">
                      List the rogue platforms, imposter domains, recipient wallet addresses, or transaction hashes (TXIDs) if available.
                    </p>
                    <textarea
                      name="breakdown"
                      value={loss.breakdown}
                      onChange={(e) => {
                        const v = e.target.value;
                        setLoss((prev) => ({ ...prev, breakdown: v }));
                        setJoinWizard({ loss: { ...loss, breakdown: v } });
                      }}
                      rows={5}
                      placeholder="e.g. Phishing wallet domain, TXID: 0x8f3c..., Target Address: 0x71a2..."
                      className="w-full px-4 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium transition-colors font-mono leading-relaxed"
                      style={{ borderRadius: '0px' }}
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
                      Incident Period / Date Range <span className="text-[#3D7EFF]">*</span>
                    </label>
                    <p className="text-xs text-coolgray mb-2">
                      Approximate time period or date when the loss took place.
                    </p>
                    <input
                      type="text"
                      name="period"
                      value={loss.period}
                      onChange={(e) => {
                        const v = e.target.value;
                        setLoss((prev) => ({ ...prev, period: v }));
                        setJoinWizard({ loss: { ...loss, period: v } });
                      }}
                      placeholder="e.g. October 2025 or Late 2024"
                      className="w-full px-4 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium transition-colors"
                      style={{ borderRadius: '0px' }}
                    />
                  </div>
                </div>

                {/* Footer Navigation Buttons */}
                <div className="mt-10 pt-6 border-t border-[#D4D4CE] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => goToStep(3, -1)}
                    className="px-6 py-3.5 bg-white border border-[#D4D4CE] hover:border-charcoal text-charcoal font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
                    style={{ borderRadius: '0px' }}
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    disabled={!isLossValid || submitting}
                    onClick={handleSubmit}
                    className={`px-8 py-3.5 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      isLossValid && !submitting
                        ? 'bg-[#3D7EFF] hover:bg-electric-600 text-white cursor-pointer shadow-sm'
                        : 'bg-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed'
                    }`}
                    style={{ borderRadius: '0px' }}
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Transmitting Dossier...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Verified Claim</span>
                        <Send className="w-4 h-4 stroke-[2.2]" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* STEP 5: SUBMITTED CONFIRMATION */}
            {/* ========================================================= */}
            {step === 5 && (
              <motion.div
                key="step-5-submitted"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="bg-white border border-[#D4D4CE] p-8 sm:p-12 shadow-sm text-center max-w-xl mx-auto"
                style={{ borderRadius: '0px' }}
              >
                {/* Sharp Architectural Success Seal in Primary Brand Colors */}
                <div
                  className="w-14 h-14 bg-[#3D7EFF] text-white mx-auto flex items-center justify-center mb-5 shadow-sm"
                  style={{ borderRadius: '0px' }}
                >
                  <Check className="w-7 h-7 text-white stroke-[3]" />
                </div>

                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-charcoal text-white font-mono text-xs font-bold mb-3 uppercase tracking-wider"
                  style={{ borderRadius: '0px' }}
                >
                  <span>Claim Dossier Ingested</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight mb-3">
                  Claim Successfully Submitted
                </h2>

                <p className="text-sm text-coolgray leading-relaxed mb-6">
                  Your restitution claim has been cataloged into the ReclaimDAO verified forensic review queue. An assigned forensic investigator will examine the on-chain telemetry within 48 business hours.
                </p>

                {/* Claim Summary Box */}
                {submittedPrefill && (
                  <div
                    className="bg-[#F8F8F6] border border-[#D4D4CE] p-4 text-left font-mono text-xs mb-8 space-y-2"
                    style={{ borderRadius: '0px' }}
                  >
                    <div className="flex justify-between pb-1.5 border-b border-[#D4D4CE]/50">
                      <span className="text-coolgray">Claimant:</span>
                      <span className="font-bold text-charcoal">
                        {submittedPrefill.firstName} {submittedPrefill.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-[#D4D4CE]/50">
                      <span className="text-coolgray">Contact:</span>
                      <span className="font-bold text-charcoal truncate max-w-[200px]">
                        {submittedPrefill.email}
                      </span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-[#D4D4CE]/50">
                      <span className="text-coolgray">Claimed Loss:</span>
                      <span className="font-bold text-charcoal">
                        {submittedPrefill.totalAmount || 'Documented'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-coolgray">Review Status:</span>
                      <span className="font-bold text-[#3D7EFF]">Awaiting Forensic Ingestion</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      clearJoinWizard();
                      navigate('/register', { state: { prefill: submittedPrefill } });
                    }}
                    className="w-full py-4 px-6 bg-[#3D7EFF] hover:bg-electric-600 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    style={{ borderRadius: '0px' }}
                  >
                    <span>Create Account to Track Status</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <Link
                    to="/"
                    className="inline-block text-xs font-mono font-bold text-coolgray hover:text-charcoal uppercase tracking-wider pt-2"
                  >
                    Return to Homepage
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SubmitClaimWizard;
