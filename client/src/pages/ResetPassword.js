import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

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
    setLoading(true);
    try {
      const res = await axios.post(`/api/password/reset/${token}`, {
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
      });
      toast.success(res.data.message);
      navigate('/login');
    } catch (error) {
      toast.error(error.response.data.message || 'An error occurred');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
       <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative max-w-md w-full space-y-8"
      >
        <div className="bg-[#0a254d] text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-sky-400/25">
          <h2 className="text-3xl font-black text-white mb-6 text-center tracking-tight">Reset <span className="text-[#A85830]">Password</span></h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#061833] border border-sky-400/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm"
                  placeholder="Enter new password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showPassword ? <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-200" /> : <Eye className="h-5 w-5 text-slate-400 hover:text-slate-200" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="passwordConfirm" className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="passwordConfirm"
                  id="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#061833] border border-sky-400/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm"
                  placeholder="Confirm new password"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showConfirm ? <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-200" /> : <Eye className="h-5 w-5 text-slate-400 hover:text-slate-200" />}
                </button>
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
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;