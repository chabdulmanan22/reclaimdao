import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight, KeyRound, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [serverErrors, setServerErrors] = useState([]);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setServerErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password, rememberMe);

    if (result.success) {
      const from = location.state?.from?.pathname || "/dashboard";
      const search = location.state?.from?.search || "";
      navigate(`${from}${search}`, { replace: true });
    } else {
      setServerErrors(result.errors || []);
    }

    setLoading(false);
  };

  const sendOtp = async () => {
    if (!formData.email) {
      toast.error('Enter your email address first');
      return;
    }
    setSendingOtp(true);
    try {
      await axios.post('/api/password/forgot-otp', { email: formData.email });
      toast.success('Security OTP transmitted to your email');
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to send OTP';
      toast.error(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  const changePasswordWithOtp = async () => {
    if (!formData.email) {
      toast.error('Enter your email address');
      return;
    }
    if (!otpCode) {
      toast.error('Enter the OTP received');
      return;
    }
    if (!newPass || newPass.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPass !== confirmPass) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPwd(true);
    try {
      await axios.post('/api/password/reset-otp', { email: formData.email, otp: otpCode, newPassword: newPass });
      toast.success('Password updated successfully. You may now log in.');
      setShowForgot(false);
      setOtpCode('');
      setNewPass('');
      setConfirmPass('');
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to reset password';
      toast.error(msg);
    } finally {
      setChangingPwd(false);
    }
  };

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
              Log In
            </h1>
            <p className="text-xs sm:text-sm text-coolgray font-normal">
              Access your ReclaimDAO restitution dashboard
            </p>
          </div>

          {!showForgot ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
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
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium transition-colors"
                    placeholder="claimant@example.com"
                    style={{ borderRadius: '0px' }}
                  />
                </div>
                {serverErrors.filter(e => e.path === 'email').map((e, i) => (
                  <p key={i} className="mt-1 text-xs text-red-500 font-medium">{e.msg || e.message}</p>
                ))}
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal"
                  >
                    Password <span className="text-[#3D7EFF]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs font-semibold text-[#3D7EFF] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
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
                    className="w-full pl-10 pr-10 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium transition-colors"
                    placeholder="Enter your account password"
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
                {serverErrors.filter(e => e.path === 'password').map((e, i) => (
                  <p key={i} className="mt-1 text-xs text-red-500 font-medium">{e.msg || e.message}</p>
                ))}
              </div>

              {/* Remember Me */}
              <div className="flex items-center pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 accent-[#3D7EFF] border-[#D4D4CE] rounded-none cursor-pointer"
                    style={{ borderRadius: '0px' }}
                  />
                  <span className="text-xs text-coolgray">Remember credentials on this workstation</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !formData.email || !formData.password}
                className={`w-full py-4 px-6 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  formData.email && formData.password && !loading
                    ? 'bg-[#3D7EFF] hover:bg-electric-600 text-white cursor-pointer shadow-sm'
                    : 'bg-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed'
                }`}
                style={{ borderRadius: '0px' }}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <>
                    <span>Log In to Dashboard</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Forgot Password Flow in Swiss Architectural Style */
            <div className="space-y-5">
              <div
                className="p-3.5 bg-[#F8F8F6] border border-[#D4D4CE] flex items-center gap-2 text-xs font-mono"
                style={{ borderRadius: '0px' }}
              >
                <KeyRound className="w-4 h-4 text-[#3D7EFF] shrink-0" />
                <span className="text-charcoal font-semibold">Self-Service Account Recovery Protocol</span>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Claimant Email Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="flex-1 px-3.5 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium"
                    placeholder="claimant@example.com"
                    style={{ borderRadius: '0px' }}
                  />
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={sendingOtp || !formData.email}
                    className="px-4 py-3 bg-[#2F2F34] hover:bg-charcoal text-white font-mono text-xs font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                    style={{ borderRadius: '0px' }}
                  >
                    {sendingOtp ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Verification OTP
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-3.5 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-mono tracking-widest"
                  placeholder="Enter 6-digit OTP"
                  style={{ borderRadius: '0px' }}
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-3.5 pr-10 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm"
                    placeholder="Minimum 8 characters"
                    style={{ borderRadius: '0px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-coolgray"
                  >
                    {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full px-3.5 pr-10 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm"
                    placeholder="Re-enter new password"
                    style={{ borderRadius: '0px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-coolgray"
                  >
                    {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="flex-1 py-3.5 px-4 bg-white border border-[#D4D4CE] hover:border-charcoal text-charcoal font-bold text-xs uppercase tracking-wider cursor-pointer"
                  style={{ borderRadius: '0px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={changePasswordWithOtp}
                  disabled={changingPwd || !otpCode || !newPass}
                  className="flex-1 py-3.5 px-4 bg-[#3D7EFF] hover:bg-electric-600 text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer shadow-sm"
                  style={{ borderRadius: '0px' }}
                >
                  {changingPwd ? 'Updating...' : 'Set Password'}
                </button>
              </div>
            </div>
          )}

          {/* Footer Link */}
          <div className="mt-6 pt-6 border-t border-[#D4D4CE] text-center">
            <p className="text-coolgray text-xs">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                className="font-bold text-[#3D7EFF] hover:underline transition-colors ml-1"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;