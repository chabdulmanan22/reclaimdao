import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Shield, Lock, ArrowRight } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    passwordConfirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      return toast.error('Passwords do not match');
    }
    if (formData.password.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }
    setLoading(true);
    try {
      const res = await axios.post(`/api/password/reset/${token}`, {
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
      });
      toast.success(res.data.message || 'Password reset successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-charcoal flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#3D7EFF] selection:text-white">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-md w-full"
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
            <h1 className="text-3xl font-black text-charcoal tracking-tight leading-tight mb-2">
              Reset Password
            </h1>
            <p className="text-xs sm:text-sm text-coolgray font-normal">
              Enter and confirm your updated secure credentials
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5"
              >
                New Password <span className="text-[#3D7EFF]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-coolgray">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-10 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium transition-colors"
                  placeholder="Minimum 8 characters"
                  style={{ borderRadius: '0px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-coolgray hover:text-charcoal cursor-pointer"
                  style={{ borderRadius: '0px' }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="passwordConfirm"
                className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5"
              >
                Confirm New Password <span className="text-[#3D7EFF]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-coolgray">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="passwordConfirm"
                  id="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-10 py-3 bg-white border border-[#D4D4CE] focus:border-[#3D7EFF] focus:outline-none text-charcoal text-sm font-medium transition-colors"
                  placeholder="Re-enter new password"
                  style={{ borderRadius: '0px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-coolgray hover:text-charcoal cursor-pointer"
                  style={{ borderRadius: '0px' }}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.password || !formData.passwordConfirm}
              className={`w-full py-4 px-6 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                formData.password && formData.passwordConfirm && !loading
                  ? 'bg-[#3D7EFF] hover:bg-electric-600 text-white cursor-pointer shadow-sm'
                  : 'bg-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed'
              }`}
              style={{ borderRadius: '0px' }}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating Password...</span>
                </div>
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#D4D4CE] text-center">
            <Link
              to="/login"
              className="text-xs font-mono font-bold uppercase tracking-wider text-[#3D7EFF] hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;