import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  CheckCircle,
  X,
  Shield,
  ArrowRight,
  Check
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [serverErrors, setServerErrors] = useState([]);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [emailLocked, setEmailLocked] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const email = params.get('email');
      const ref = params.get('ref');
      if (email) {
        setFormData((prev) => ({ ...prev, email }));
        setEmailLocked(true);
      }
      if (ref) {
        setFormData((prev) => ({ ...prev, referralCode: ref }));
      }
    } catch { }

    if (location.state?.prefill) {
      const { firstName, lastName, email, referralCode } = location.state.prefill;
      setFormData(prev => ({
        ...prev,
        firstName: firstName || '',
        lastName: lastName || '',
        email: email || '',
        referralCode: referralCode || prev.referralCode || ''
      }));
      if (email) setEmailLocked(true);
      setIsAutoFilled(true);
    }
  }, [location.search, location.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setServerErrors((prev) => prev.filter(err => err.path !== e.target.name));
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);
    return { minLength, hasNumber, hasLetter, hasUpper, hasLower, hasSpecial };
  };

  const passwordValidation = validatePassword(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword;

  const isFormValid =
    acceptTerms &&
    passwordsMatch &&
    formData.firstName?.trim() &&
    formData.lastName?.trim().length >= 2 &&
    passwordValidation.minLength &&
    passwordValidation.hasNumber &&
    passwordValidation.hasUpper &&
    passwordValidation.hasLower &&
    passwordValidation.hasSpecial;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    setLoading(true);

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      acceptTerms,
      referralCode: formData.referralCode
    });

    if (result.success) {
      setRegistrationSuccess(true);
    } else {
      setServerErrors(result.errors || []);
    }

    setLoading(false);
  };

  // Registration Success / Verification View
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] text-charcoal flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#3D7EFF] selection:text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative max-w-lg w-full bg-white text-charcoal border border-[#D4D4CE] p-8 sm:p-12 shadow-sm text-center"
          style={{ borderRadius: '0px' }}
        >
          <div className="mb-6 flex justify-center">
            <div
              className="w-16 h-16 bg-[#3D7EFF] text-white flex items-center justify-center shadow-sm"
              style={{ borderRadius: '0px' }}
            >
              <Mail className="h-8 w-8" />
            </div>
          </div>

          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-charcoal text-white font-mono text-xs font-bold mb-3 uppercase tracking-wider"
            style={{ borderRadius: '0px' }}
          >
            <span>Verification Required</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-charcoal mb-3 tracking-tight">
            Verify Your Email
          </h2>

          <p className="text-sm text-coolgray mb-6 leading-relaxed">
            We have transmitted a secure verification token to <strong className="font-bold text-charcoal">{formData.email}</strong>. Please follow the link in your email to activate your account and access case telemetry.
          </p>

          <div
            className="bg-[#F8F8F6] border border-[#D4D4CE] p-4 mb-8 text-left text-xs font-mono text-coolgray"
            style={{ borderRadius: '0px' }}
          >
            <p className="leading-relaxed">
              If the message is not visible in your inbox within two minutes, inspect your spam or junk folder and mark it as <strong className="text-charcoal font-bold">Not Spam</strong>.
            </p>
          </div>

          <div className="pt-4 border-t border-[#D4D4CE]">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#3D7EFF] hover:underline"
            >
              <span>Return to Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-charcoal flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#3D7EFF] selection:text-white">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-lg w-full"
      >
        <div
          className="bg-white text-charcoal border border-[#D4D4CE] p-8 sm:p-10 shadow-sm"
          style={{ borderRadius: '0px' }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 mb-2 text-coolgray font-mono text-[11px] font-bold uppercase tracking-widest">
              <Shield className="w-3.5 h-3.5 text-[#3D7EFF]" />
              <span>Decentralized Restitution Protocol</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-charcoal tracking-tight leading-tight mb-2">
              Sign Up
            </h1>
            <p className="text-xs sm:text-sm text-coolgray font-normal">
              Create your ReclaimDAO restitution tracking account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5"
                >
                  First name <span className="text-[#3D7EFF]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-coolgray">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3.5 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium transition-colors ${
                      isAutoFilled ? 'bg-[#F8F8F6] cursor-not-allowed opacity-90' : ''
                    } ${serverErrors.some(e => e.path === 'firstName') ? 'border-red-500' : ''}`}
                    placeholder="First name"
                    readOnly={isAutoFilled}
                    style={{ borderRadius: '0px' }}
                  />
                </div>
                {serverErrors.filter(e => e.path === 'firstName').map((e, i) => (
                  <p key={i} className="mt-1 text-xs text-red-500 font-medium">{e.msg || e.message}</p>
                ))}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5"
                >
                  Last name <span className="text-[#3D7EFF]">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium transition-colors ${
                    isAutoFilled ? 'bg-[#F8F8F6] cursor-not-allowed opacity-90' : ''
                  } ${formData.lastName && formData.lastName.trim().length < 2 ? 'border-red-500' : ''} ${
                    serverErrors.some(e => e.path === 'lastName') ? 'border-red-500' : ''
                  }`}
                  placeholder="Last name"
                  readOnly={isAutoFilled}
                  style={{ borderRadius: '0px' }}
                />
                {formData.lastName && formData.lastName.trim().length < 2 && (
                  <p className="mt-1 text-xs text-red-500 font-medium">Last name must be at least 2 characters</p>
                )}
                {serverErrors.filter(e => e.path === 'lastName').map((e, i) => (
                  <p key={i} className="mt-1 text-xs text-red-500 font-medium">{e.msg || e.message}</p>
                ))}
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5"
              >
                Email address <span className="text-[#3D7EFF]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-coolgray">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium transition-colors ${
                    emailLocked ? 'bg-[#F8F8F6] cursor-not-allowed text-charcoal/80' : ''
                  }`}
                  readOnly={emailLocked}
                  placeholder="claimant@example.com"
                  style={{ borderRadius: '0px' }}
                />
              </div>
              {emailLocked && (
                <p className="mt-1.5 text-xs text-coolgray font-mono">
                  Email locked from your verified restitution claim submission
                </p>
              )}
              {serverErrors.filter(e => e.path === 'email').map((e, i) => (
                <p key={i} className="mt-1 text-xs text-red-500 font-medium">{e.msg || e.message}</p>
              ))}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5"
              >
                Password <span className="text-[#3D7EFF]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-coolgray">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium transition-colors ${
                    serverErrors.some(e => e.path === 'password') ? 'border-red-500' : ''
                  }`}
                  placeholder="Create a strong password"
                  style={{ borderRadius: '0px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-coolgray hover:text-charcoal cursor-pointer"
                  style={{ borderRadius: '0px' }}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password Requirements Checklist */}
              {formData.password && (
                <div className="mt-2.5 p-3 bg-[#F8F8F6] border border-[#D4D4CE] space-y-1 text-xs font-mono" style={{ borderRadius: '0px' }}>
                  <div className={`flex items-center space-x-2 ${passwordValidation.minLength ? 'text-charcoal font-semibold' : 'text-coolgray'}`}>
                    <span className={`w-3.5 h-3.5 flex items-center justify-center ${passwordValidation.minLength ? 'text-[#10B981]' : 'text-coolgray'}`}>
                      {passwordValidation.minLength ? '✓' : '•'}
                    </span>
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.hasNumber ? 'text-charcoal font-semibold' : 'text-coolgray'}`}>
                    <span className={`w-3.5 h-3.5 flex items-center justify-center ${passwordValidation.hasNumber ? 'text-[#10B981]' : 'text-coolgray'}`}>
                      {passwordValidation.hasNumber ? '✓' : '•'}
                    </span>
                    <span>Contains a number</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.hasUpper ? 'text-charcoal font-semibold' : 'text-coolgray'}`}>
                    <span className={`w-3.5 h-3.5 flex items-center justify-center ${passwordValidation.hasUpper ? 'text-[#10B981]' : 'text-coolgray'}`}>
                      {passwordValidation.hasUpper ? '✓' : '•'}
                    </span>
                    <span>Contains an uppercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.hasLower ? 'text-charcoal font-semibold' : 'text-coolgray'}`}>
                    <span className={`w-3.5 h-3.5 flex items-center justify-center ${passwordValidation.hasLower ? 'text-[#10B981]' : 'text-coolgray'}`}>
                      {passwordValidation.hasLower ? '✓' : '•'}
                    </span>
                    <span>Contains a lowercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.hasSpecial ? 'text-charcoal font-semibold' : 'text-coolgray'}`}>
                    <span className={`w-3.5 h-3.5 flex items-center justify-center ${passwordValidation.hasSpecial ? 'text-[#10B981]' : 'text-coolgray'}`}>
                      {passwordValidation.hasSpecial ? '✓' : '•'}
                    </span>
                    <span>Contains a special character (@$!%*?&)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Password Confirmation */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5"
              >
                Password confirmation <span className="text-[#3D7EFF]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-coolgray">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium transition-colors ${
                    formData.confirmPassword && !passwordsMatch ? 'border-red-500' : ''
                  } ${serverErrors.some(e => e.path === 'confirmPassword') ? 'border-red-500' : ''}`}
                  placeholder="Confirm your password"
                  style={{ borderRadius: '0px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-coolgray hover:text-charcoal cursor-pointer"
                  style={{ borderRadius: '0px' }}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {formData.confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-xs text-red-500 font-medium">Passwords do not match</p>
              )}
            </div>

            {/* Terms and Privacy Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  id="accept-terms"
                  name="accept-terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#3D7EFF] border-[#D4D4CE] rounded-none cursor-pointer"
                  style={{ borderRadius: '0px' }}
                />
                <span className="text-xs text-coolgray leading-normal select-none">
                  I accept the{' '}
                  <Link to="/privacy" className="text-[#3D7EFF] font-semibold hover:underline">
                    Privacy Policy
                  </Link>{' '}
                  and{' '}
                  <Link to="/terms" className="text-[#3D7EFF] font-semibold hover:underline">
                    Terms of Service
                  </Link>
                  *
                </span>
              </label>
              {!acceptTerms && (
                <p className="mt-1 pl-6 text-xs text-red-500 font-medium">
                  You must accept the terms to continue
                </p>
              )}
              {serverErrors.filter(e => e.path === 'acceptTerms').map((e, i) => (
                <p key={i} className="mt-1 pl-6 text-xs text-red-500 font-medium">{e.msg || e.message}</p>
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className={`w-full py-4 px-6 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                isFormValid && !loading
                  ? 'bg-[#3D7EFF] hover:bg-electric-600 text-white cursor-pointer shadow-sm'
                  : 'bg-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed'
              }`}
              style={{ borderRadius: '0px' }}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <>
                  <span>Sign Up</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-6 border-t border-[#D4D4CE] text-center">
            <p className="text-coolgray text-xs">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-[#3D7EFF] hover:underline transition-colors ml-1"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
