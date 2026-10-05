import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
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

  const handleForgotPassword = () => {
    setShowForgot(true);
  };

  const sendOtp = async () => {
    if (!formData.email) {
      toast.error('Enter your email first');
      return;
    }
    setSendingOtp(true);
    try {
      await axios.post('/api/password/forgot-otp', { email: formData.email });
      toast.success('OTP sent to your email');
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to send OTP';
      toast.error(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  const changePasswordWithOtp = async () => {
    if (!formData.email) {
      toast.error('Enter your email');
      return;
    }
    if (!otpCode) {
      toast.error('Enter the OTP');
      return;
    }
    if (!newPass || newPass.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPass !== confirmPass) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPwd(true);
    try {
      await axios.post('/api/password/reset-otp', { email: formData.email, otp: otpCode, newPassword: newPass });
      toast.success('Password changed. You can log in now');
      setShowForgot(false);
      setOtpCode('');
      setNewPass('');
      setConfirmPass('');
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to change password';
      toast.error(msg);
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative max-w-lg w-full space-y-6"
      >
        <div className="bg-[#0a254d] text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-sky-400/25">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Log <span className="text-[#A85830]">in</span></h2>
            <p className="text-slate-300 text-sm font-medium">Welcome back to ReclaimDAO</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-sky-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 bg-[#061833] border border-sky-400/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm font-semibold"
                  placeholder="Enter your email"
                />
              </div>
              {serverErrors.filter(e => e.path === 'email').map((e, i) => (
                <p key={i} className="mt-1 text-sm text-red-400">{e.msg || e.message}</p>
              ))}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-sky-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-10 py-3.5 bg-[#061833] border border-sky-400/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm font-semibold"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-200" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-200" />
                  )}
                </button>
              </div>
              {serverErrors.filter(e => e.path === 'password').map((e, i) => (
                <p key={i} className="mt-1 text-sm text-red-400">{e.msg || e.message}</p>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#A85830] focus:ring-[#A85830] border-slate-700 bg-[#061833] rounded"
                />

                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300 font-medium">
                  Remember me
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl font-black text-white shadow-xl transition-all text-base disabled:opacity-50 cursor-pointer hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #A85830 0%, #964d28 50%, #854221 100%)',
                boxShadow: '0 8px 30px rgba(168, 88, 48, 0.45)'
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                'Log in'
              )}
            </button>
          </form>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="text-sm font-semibold text-sky-300 hover:text-[#A85830] transition-colors cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {showForgot && (
            <div className="mt-6 space-y-4 pt-4 border-t border-white/10">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#061833] border border-sky-400/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm font-semibold"
                  placeholder="Enter your email"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={sendingOtp}
                  className="px-4 py-2.5 rounded-xl font-bold text-white shadow-lg disabled:opacity-50 cursor-pointer shrink-0"
                  style={{ background: 'linear-gradient(135deg, #A85830 0%, #964d28 50%, #854221 100%)' }}
                >
                  {sendingOtp ? 'Sending...' : 'Send OTP'}
                </button>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-4 py-3 bg-[#061833] border border-sky-400/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm font-semibold"
                  placeholder="Enter OTP"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-4 py-3 bg-[#061833] border border-sky-400/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm font-semibold pr-10"
                    placeholder="New password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPass ? (
                      <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-200" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400 hover:text-slate-200" />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full px-4 py-3 bg-[#061833] border border-sky-400/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm font-semibold pr-10"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPass ? (
                      <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-200" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400 hover:text-slate-200" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={changePasswordWithOtp}
                disabled={changingPwd}
                className="w-full py-3 px-6 rounded-xl font-bold text-white shadow-lg disabled:opacity-50 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #A85830 0%, #964d28 50%, #854221 100%)' }}
              >
                {changingPwd ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;