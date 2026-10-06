import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Loader2, Check, X, Shield, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email cryptographic token...');
  const hasRun = React.useRef(false);

  useEffect(() => {
    if (hasRun.current) return;

    const performVerification = async () => {
      hasRun.current = true;
      try {
        const response = await axios.get(`/api/auth/verify-email/${token}`);

        if (response.data.success) {
          if (response.data.alreadyVerified) {
            setStatus('success');
            setMessage(response.data.message);
            return;
          }

          const { token: jwtToken, user } = response.data.data;

          localStorage.setItem('token', jwtToken);
          localStorage.setItem('user', JSON.stringify(user));
          axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
          updateUser(user);

          setStatus('success');
          setMessage(response.data.message || 'Email verified successfully! Welcome to ReclaimDAO.');
          toast.success('Email verified! Welcome to ReclaimDAO.');

          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
        toast.error('Verification failed');
      }
    };

    if (token) {
      performVerification();
    } else {
      setStatus('error');
      setMessage('Invalid verification token.');
    }
  }, [token, navigate, updateUser]);

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-charcoal flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#3D7EFF] selection:text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-lg w-full bg-white text-charcoal border border-[#D4D4CE] p-8 sm:p-12 shadow-sm text-center"
        style={{ borderRadius: '0px' }}
      >
        {/* Architectural Icon Box */}
        <div className="mb-6 flex justify-center">
          {status === 'verifying' && (
            <div
              className="w-16 h-16 bg-[#3D7EFF]/10 border-2 border-[#3D7EFF] flex items-center justify-center shadow-xs"
              style={{ borderRadius: '0px' }}
            >
              <Loader2 className="h-8 w-8 text-[#3D7EFF] animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div
              className="w-16 h-16 bg-[#3D7EFF] text-white flex items-center justify-center shadow-sm"
              style={{ borderRadius: '0px' }}
            >
              <Check className="h-8 w-8 text-white stroke-[3]" />
            </div>
          )}
          {status === 'error' && (
            <div
              className="w-16 h-16 bg-[#EF4444] text-white flex items-center justify-center shadow-sm"
              style={{ borderRadius: '0px' }}
            >
              <X className="h-8 w-8 text-white stroke-[3]" />
            </div>
          )}
        </div>

        {/* Eyebrow Badge */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-charcoal text-white font-mono text-xs font-bold mb-3 uppercase tracking-wider"
          style={{ borderRadius: '0px' }}
        >
          <Shield className="w-3.5 h-3.5 text-[#3D7EFF]" />
          <span>
            {status === 'verifying' && 'Token Verification In Progress'}
            {status === 'success' && 'Cryptographic Token Verified'}
            {status === 'error' && 'Verification Unsuccessful'}
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-black text-charcoal mb-3 tracking-tight">
          {status === 'verifying' && 'Authenticating Token...'}
          {status === 'success' && 'Email Successfully Verified'}
          {status === 'error' && 'Verification Error'}
        </h2>

        {/* Message */}
        <p className="text-sm text-coolgray mb-8 leading-relaxed font-normal px-2">
          {message}
        </p>

        {/* Success Redirect Progress Bar */}
        {status === 'success' && !message.includes('safely login') && (
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-full bg-[#E8E8E3] h-1.5 overflow-hidden mb-3"
              style={{ borderRadius: '0px' }}
            >
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3, ease: 'linear' }}
                className="h-full bg-[#3D7EFF]"
              />
            </div>
            <p className="text-xs font-mono font-semibold text-coolgray">Redirecting to claimant dashboard...</p>
          </div>
        )}

        {/* Action Buttons */}
        {status === 'success' && message.includes('safely login') && (
          <button
            onClick={() => navigate('/login')}
            className="w-full py-4 px-6 bg-[#3D7EFF] hover:bg-electric-600 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            style={{ borderRadius: '0px' }}
          >
            <span>Proceed to Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <button
              onClick={() => navigate('/register')}
              className="w-full py-4 px-6 bg-[#3D7EFF] hover:bg-electric-600 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              style={{ borderRadius: '0px' }}
            >
              <span>Back to Registration</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/login"
              className="inline-block text-xs font-mono font-bold text-coolgray hover:text-charcoal uppercase tracking-wider pt-2"
            >
              Return to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
