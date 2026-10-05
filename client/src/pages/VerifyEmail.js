import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { updateUser } = useAuth();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email address...');
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

                    // Set authentication data
                    localStorage.setItem('token', jwtToken);
                    localStorage.setItem('user', JSON.stringify(user));
                    axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
                    updateUser(user);

                    setStatus('success');
                    setMessage(response.data.message || 'Email verified successfully!');
                    toast.success('Email verified! Welcome to ReclaimDAO.');

                    // Redirect to dashboard after a short delay
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 3000);
                }
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
                // Only show toast once
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
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative max-w-lg w-full bg-[#0a254d] text-white border border-sky-400/25 p-10 rounded-3xl shadow-2xl text-center"
            >
                <div className="mb-8 flex justify-center">
                    {status === 'verifying' && (
                        <Loader2 className="h-20 w-20 text-[#A85830] animate-spin" />
                    )}
                    {status === 'success' && (
                        <CheckCircle className="h-20 w-20 text-[#10b981]" />
                    )}
                    {status === 'error' && (
                        <XCircle className="h-20 w-20 text-red-500" />
                    )}
                </div>

                <h2 className={`text-4xl font-black text-white mb-6 text-center leading-tight`}>
                    {status === 'verifying' && 'One Moment...'}
                    {status === 'success' && 'Email Verified!'}
                    {status === 'error' && 'Verification Error'}
                </h2>

                <p className="text-xl text-slate-200 mb-10 leading-relaxed font-medium text-center px-4">
                    {message}
                </p>

                {status === 'success' && !message.includes('safely login') && (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden mb-4">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 3 }}
                                className="h-full bg-emerald-400"
                            />
                        </div>
                        <p className="text-sm text-slate-400">Redirecting to dashboard...</p>
                    </div>
                )}

                {status === 'success' && message.includes('safely login') && (
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-4 text-lg font-black text-white rounded-xl shadow-lg cursor-pointer hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #A85830 0%, #964d28 50%, #854221 100%)' }}
                    >
                        Go to Login
                    </button>
                )}

                {status === 'error' && (
                    <button
                        onClick={() => navigate('/register')}
                        className="w-full py-4 text-lg font-black text-white rounded-xl shadow-lg cursor-pointer hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #A85830 0%, #964d28 50%, #854221 100%)' }}
                    >
                        Back to Registration
                    </button>
                )}
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
