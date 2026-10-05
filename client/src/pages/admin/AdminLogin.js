import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { 
  Shield, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  Clock,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);

  const { login, isAuthenticated, loginAttempts, isBlocked, maxAttempts } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isBlocked) {
      const blockTime = localStorage.getItem('adminBlockTime');
      if (blockTime) {
        const interval = setInterval(() => {
          const remaining = Math.max(0, parseInt(blockTime) - Date.now());
          setBlockTimeRemaining(remaining);
          
          if (remaining <= 0) {
            clearInterval(interval);
            setBlockTimeRemaining(0);
          }
        }, 1000);

        return () => clearInterval(interval);
      }
    }
  }, [isBlocked]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isBlocked) {
      toast.error('Account is temporarily blocked. Please wait.');
      return;
    }

    if (!credentials.username || !credentials.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      await login(credentials.username, credentials.password);
      toast.success('Login successful! Welcome to Admin Panel');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center gap-3.5 mb-4 select-none"
          >
            <img
              src="/images/favicon.png"
              alt="ReclaimDAO Favicon"
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain shrink-0 drop-shadow-lg"
            />
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-none">
              Reclaim<span className="text-[#A85830]">DAO</span>
            </span>
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-1 tracking-tight">Admin <span className="text-[#A85830]">Portal</span></h1>
          <p className="text-slate-700 text-sm sm:text-base font-bold">ReclaimDAO Administrative Access</p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0a254d] text-white rounded-3xl p-8 border border-sky-400/25 shadow-2xl"
        >
          {/* Security Status */}
          {isBlocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <p className="text-white text-sm font-black">Account Temporarily Blocked</p>
                  <p className="text-red-300 text-xs mt-1 font-bold">
                    Try again in: {formatTime(blockTimeRemaining)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-white mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-sky-400" />
                <input
                  type="text"
                  name="username"
                  value={credentials.username}
                  onChange={handleInputChange}
                  placeholder="Enter admin username"
                  disabled={isBlocked || isLoading}
                  className="w-full pl-11 pr-4 py-3 bg-[#061833] border border-sky-400/25 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm font-semibold transition-all disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-white mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-sky-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  placeholder="Enter admin password"
                  disabled={isBlocked || isLoading}
                  className="w-full pl-11 pr-12 py-3 bg-[#061833] border border-sky-400/25 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#A85830] text-sm font-semibold transition-all disabled:opacity-50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isBlocked || isLoading}
              className="w-full py-3.5 px-6 rounded-xl font-black text-white shadow-lg shadow-[#A85830]/25 transition-all text-base disabled:opacity-50 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #A85830 0%, #964d28 50%, #854221 100%)'
              }}
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Admin Panel'}
            </motion.button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#A85830] shrink-0" />
              <div>
                <p className="text-white font-black text-xs uppercase tracking-wider">Security Notice</p>
                <p className="text-white font-semibold text-xs mt-0.5">
                  This is a secure administrative area. All access attempts are logged.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-slate-700 text-xs sm:text-sm font-bold tracking-wide">
            ReclaimDAO Admin Panel • Secure Access Portal
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;