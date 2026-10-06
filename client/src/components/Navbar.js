import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Home,
  BarChart3,
  Coins,
  Trophy,
  User,
  LogOut,
  Shield,
  LogIn,
  Mail,
  ChevronDown,
  Lock,
  Vote
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import logoImg from '../assets/logo.svg';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileTimeoutRef = useRef(null);

  // Reset Password Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleJoinNow = () => {
    try {
      const ref = localStorage.getItem('landingReferralCode');
      navigate(ref ? `/join-notice?ref=${encodeURIComponent(ref)}` : '/join-notice');
    } catch {
      navigate('/join-notice');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const [canContribute, setCanContribute] = useState(false);

  React.useEffect(() => {
    const checkContributionStatus = async () => {
      try {
        const [activeRes, publicRes, roundRes] = await Promise.all([
          axios.get('/api/settings/contributionActive').catch(() => ({ data: {} })),
          axios.get('/api/settings/publicContributionsEnabled').catch(() => ({ data: {} })),
          axios.get('/api/settings/contributionRound').catch(() => ({ data: {} }))
        ]);

        const isActive = activeRes.data?.data?.value ?? true;
        const isPublic = publicRes.data?.data?.value ?? true;
        const round = roundRes.data?.data?.value;

        setCanContribute(isActive && isPublic && (!round || round.status === 'active'));
      } catch (error) {
        setCanContribute(true);
      }
    };

    checkContributionStatus();
    const handleUpdate = () => checkContributionStatus();
    window.addEventListener('datastore:update', handleUpdate);
    return () => window.removeEventListener('datastore:update', handleUpdate);
  }, []);

  const handleMouseEnter = () => {
    if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    setIsProfileOpen(true);
  };

  const handleMouseLeave = () => {
    profileTimeoutRef.current = setTimeout(() => {
      setIsProfileOpen(false);
    }, 150);
  };

  // Send OTP
  const sendOtp = async () => {
    if (!resetEmail) {
      toast.error('Enter your email first');
      return;
    }
    setSendingOtp(true);
    try {
      await axios.post('/api/password/forgot-otp', { email: resetEmail });
      toast.success('OTP sent to your email');
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to send OTP';
      toast.error(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  // Change Password with OTP
  const changePasswordWithOtp = async () => {
    if (!resetEmail) {
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
      await axios.post('/api/password/reset-otp', { email: resetEmail, otp: otpCode, newPassword: newPass });
      toast.success('Password updated successfully');
      setShowResetModal(false);
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

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3, protected: true },
    { name: 'Voting', path: '/voting', icon: Vote, protected: true },
    { name: 'Contribute', path: '/contribute', icon: Coins, protected: true },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy, protected: true },
    { name: 'Referral', path: '/referral', icon: User, protected: true },
    { name: 'Contact Us', path: '/contact', icon: Mail, protected: true },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!user) return false;
    if (item.name === 'Contribute') return canContribute;
    return true;
  });

  const adminItems = [
    { name: 'Admin Panel', path: '/admin', icon: Shield },
    { name: 'User Management', path: '/admin/users', icon: User },
    { name: 'Vote Management', path: '/admin/votes', icon: BarChart3 },
    { name: 'Contribution Management', path: '/admin/contributions', icon: Coins },
  ];

  const isActive = (path) => location.pathname === path;

  const userDisplayName = user?.fullName || user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
  const userInitial = userDisplayName.charAt(0).toUpperCase();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/95 border-b border-[#E2E5E8] shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-20 overflow-visible flex-nowrap">
          {/* Logo */}
          <div className="flex items-center h-full flex-shrink-0">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center h-full group">
              <img
                src={logoImg}
                alt="ReclaimDAO"
                className="h-14 sm:h-[62px] md:h-[66px] w-auto max-h-[70px] object-contain group-hover:scale-105 transition-transform duration-200"
              />
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex flex-1 items-center justify-center space-x-2 lg:space-x-4 min-w-0">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 transition-all duration-200 text-sm font-medium ${
                    isActive(item.path)
                      ? 'bg-electric-50 text-electric font-semibold border border-electric/30'
                      : 'text-charcoal/80 hover:text-electric hover:bg-[#F4F5F7]'
                  }`}
                  style={{ borderRadius: '0px' }}
                >
                  <Icon className={`w-4 h-4 ${isActive(item.path) ? 'text-electric' : 'text-coolgray'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Action / User Profile Avatar + Animated Hover Dropdown */}
          <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
            {user ? (
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {/* Profile Avatar Button with Arrow Indicator */}
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-[#F4F5F7] border border-transparent hover:border-[#D4D4CE] transition-all cursor-pointer group focus:outline-none"
                  style={{ borderRadius: '0px' }}
                  aria-expanded={isProfileOpen}
                >
                  {/* Circular Avatar */}
                  <div
                    className="w-10 h-10 rounded-full bg-[#3D7EFF] text-white font-bold flex items-center justify-center text-sm shadow-sm ring-2 ring-[#E2E5E8] group-hover:ring-[#3D7EFF] transition-all shrink-0"
                  >
                    <span>{userInitial}</span>
                  </div>

                  {/* Animated Arrow Sign */}
                  <ChevronDown
                    className={`w-4 h-4 text-coolgray group-hover:text-charcoal transition-transform duration-200 ${
                      isProfileOpen ? 'rotate-180 text-[#3D7EFF]' : ''
                    }`}
                  />
                </button>

                {/* Animated Dropdown Menu */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute right-0 mt-1.5 w-64 bg-white border border-[#D4D4CE] shadow-xl z-50 overflow-hidden"
                      style={{ borderRadius: '0px' }}
                    >
                      {/* Top Header: User Full Name */}
                      <div className="p-4 bg-[#F8F8F6] border-b border-[#D4D4CE]">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full bg-[#3D7EFF] text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0"
                          >
                            <span>{userInitial}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-charcoal truncate" title={userDisplayName}>
                              {userDisplayName}
                            </p>
                            <p className="text-[11px] font-mono text-coolgray truncate" title={user.email}>
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Account Settings 3 Options */}
                      <div className="p-1.5 space-y-0.5">
                        {/* Option 1: Edit Profile */}
                        <Link
                          to="/profile?edit=1"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-charcoal hover:bg-[#F8F8F6] hover:text-[#3D7EFF] transition-colors text-xs font-mono font-bold uppercase tracking-wider group"
                          style={{ borderRadius: '0px' }}
                        >
                          <div className="p-1.5 bg-[#F8F8F6] border border-[#D4D4CE] text-coolgray group-hover:text-[#3D7EFF] group-hover:border-[#3D7EFF] transition-colors">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-charcoal group-hover:text-[#3D7EFF]">Edit Profile</div>
                            <div className="text-[10px] font-normal text-coolgray normal-case">Update personal information</div>
                          </div>
                        </Link>

                        {/* Option 2: Reset Password */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileOpen(false);
                            setResetEmail(user.email || '');
                            setShowResetModal(true);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-charcoal hover:bg-[#F8F8F6] hover:text-[#3D7EFF] transition-colors text-xs font-mono font-bold uppercase tracking-wider group text-left cursor-pointer"
                          style={{ borderRadius: '0px' }}
                        >
                          <div className="p-1.5 bg-[#F8F8F6] border border-[#D4D4CE] text-coolgray group-hover:text-[#3D7EFF] group-hover:border-[#3D7EFF] transition-colors">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-charcoal group-hover:text-[#3D7EFF]">Reset Password</div>
                            <div className="text-[10px] font-normal text-coolgray normal-case">Change security key</div>
                          </div>
                        </button>

                        {/* Admin Link if admin */}
                        {user.role === 'admin' && (
                          <>
                            <div className="border-t border-[#D4D4CE] my-1"></div>
                            <Link
                              to="/admin"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2 text-charcoal hover:bg-[#F8F8F6] hover:text-[#3D7EFF] transition-colors text-xs font-mono font-bold uppercase tracking-wider"
                              style={{ borderRadius: '0px' }}
                            >
                              <div className="p-1.5 bg-[#F8F8F6] border border-[#D4D4CE] text-[#3D7EFF]">
                                <Shield className="w-3.5 h-3.5" />
                              </div>
                              <span>Admin Panel</span>
                            </Link>
                          </>
                        )}

                        {/* Hairline Divider */}
                        <div className="border-t border-[#D4D4CE] my-1"></div>

                        {/* Option 3: Sign Out */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-xs font-mono font-bold uppercase tracking-wider group text-left cursor-pointer"
                          style={{ borderRadius: '0px' }}
                        >
                          <div className="p-1.5 bg-red-50 border border-red-200 text-red-600">
                            <LogOut className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-red-600">Sign Out</div>
                            <div className="text-[10px] font-normal text-red-400 normal-case">End session</div>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Link
                  to="/"
                  className={`flex items-center space-x-1.5 px-3 py-2 transition-all text-sm ${
                    isActive('/')
                      ? 'bg-electric-50 text-electric font-semibold border border-electric/30'
                      : 'text-charcoal hover:text-electric hover:bg-[#F4F5F7] font-medium'
                  }`}
                  style={{ borderRadius: '0px' }}
                >
                  <Home className={`w-4 h-4 ${isActive('/') ? 'text-electric' : 'text-coolgray'}`} />
                  <span>Home</span>
                </Link>
                <Link
                  to="/contact"
                  className={`flex items-center space-x-1.5 px-3 py-2 transition-all text-sm ${
                    isActive('/contact')
                      ? 'bg-electric-50 text-electric font-semibold border border-electric/30'
                      : 'text-charcoal hover:text-electric hover:bg-[#F4F5F7] font-medium'
                  }`}
                  style={{ borderRadius: '0px' }}
                >
                  <Mail className={`w-4 h-4 ${isActive('/contact') ? 'text-electric' : 'text-coolgray'}`} />
                  <span>Contact Us</span>
                </Link>
                <Link
                  to="/login"
                  className={`flex items-center space-x-1.5 px-3 py-2 transition-all text-sm ${
                    isActive('/login')
                      ? 'bg-electric-50 text-electric font-semibold border border-electric/30'
                      : 'text-charcoal hover:text-electric hover:bg-[#F4F5F7] font-medium'
                  }`}
                  style={{ borderRadius: '0px' }}
                >
                  <LogIn className={`w-4 h-4 ${isActive('/login') ? 'text-electric' : 'text-coolgray'}`} />
                  <span>Login</span>
                </Link>
                <button
                  onClick={handleJoinNow}
                  className="btn-primary rounded-none px-6 py-2.5 text-white font-semibold text-sm shadow-none hover:bg-electric-600 transition-colors cursor-pointer"
                  style={{ borderRadius: '0px', backgroundColor: '#3D7EFF', boxShadow: 'none' }}
                >
                  Submit a Claim
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-charcoal p-2 focus:outline-none cursor-pointer"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden backdrop-blur-xl border-t border-[#E2E5E8] bg-white/98 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-xl"
          >
            <div className="px-4 py-4 pb-6 space-y-2">
              {!user && (
                <>
                  <Link
                    to="/"
                    className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-none transition-all ${
                      isActive('/')
                        ? 'bg-electric-50 text-electric font-semibold border border-electric/25'
                        : 'text-charcoal hover:text-electric hover:bg-[#F4F5F7]'
                    }`}
                    style={{ borderRadius: '0px' }}
                    onClick={() => setIsOpen(false)}
                  >
                    <Home className={`w-4 h-4 ${isActive('/') ? 'text-electric' : 'text-coolgray'}`} />
                    <span>Home</span>
                  </Link>
                  <Link
                    to="/contact"
                    className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-none transition-all ${
                      isActive('/contact')
                        ? 'bg-electric-50 text-electric font-semibold border border-electric/25'
                        : 'text-charcoal hover:text-electric hover:bg-[#F4F5F7]'
                    }`}
                    style={{ borderRadius: '0px' }}
                    onClick={() => setIsOpen(false)}
                  >
                    <Mail className={`w-4 h-4 ${isActive('/contact') ? 'text-electric' : 'text-coolgray'}`} />
                    <span>Contact Us</span>
                  </Link>
                </>
              )}

              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-none transition-all ${
                      isActive(item.path)
                        ? 'bg-electric-50 text-electric font-semibold border border-electric/25'
                        : 'text-charcoal hover:text-electric hover:bg-[#F4F5F7]'
                    }`}
                    style={{ borderRadius: '0px' }}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className={`w-4 h-4 ${isActive(item.path) ? 'text-electric' : 'text-coolgray'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {user && user.role === 'admin' && (
                <>
                  <div className="border-t border-[#E2E5E8] my-2"></div>
                  {adminItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className="flex items-center space-x-2 px-3.5 py-2.5 rounded-none text-charcoal hover:text-electric hover:bg-electric-50 transition-all font-medium"
                        style={{ borderRadius: '0px' }}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="w-4 h-4 text-coolgray" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </>
              )}

              {user ? (
                <>
                  <div className="border-t border-[#E2E5E8] my-2"></div>
                  <div className="px-3.5 py-2 bg-[#F8F8F6] border border-[#D4D4CE] mb-2 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#3D7EFF] text-white font-bold flex items-center justify-center text-xs">
                      {userInitial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-charcoal truncate">{userDisplayName}</p>
                      <p className="text-[10px] font-mono text-coolgray truncate">{user.email}</p>
                    </div>
                  </div>

                  <Link
                    to="/profile?edit=1"
                    className="flex items-center space-x-2 px-3.5 py-2.5 rounded-none text-charcoal hover:text-electric hover:bg-electric-50 transition-all font-medium text-sm"
                    style={{ borderRadius: '0px' }}
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-4 h-4 text-coolgray" />
                    <span>Edit Profile</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setResetEmail(user.email || '');
                      setShowResetModal(true);
                    }}
                    className="flex items-center space-x-2 px-3.5 py-2.5 rounded-none text-charcoal hover:text-electric hover:bg-electric-50 transition-all font-medium text-sm w-full text-left cursor-pointer"
                    style={{ borderRadius: '0px' }}
                  >
                    <Lock className="w-4 h-4 text-coolgray" />
                    <span>Reset Password</span>
                  </button>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-2 px-3.5 py-2.5 rounded-none text-rose-600 hover:bg-rose-50 transition-all w-full font-medium text-sm"
                    style={{ borderRadius: '0px' }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-[#E2E5E8] my-2"></div>
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 px-3.5 py-2.5 rounded-none text-charcoal hover:text-electric hover:bg-[#F4F5F7] transition-all font-medium"
                    style={{ borderRadius: '0px' }}
                    onClick={() => setIsOpen(false)}
                  >
                    <LogIn className="w-4 h-4 text-coolgray" />
                    <span>Login</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleJoinNow();
                      setIsOpen(false);
                    }}
                    className="btn-primary rounded-none px-5 py-3 text-white font-semibold text-sm shadow-none w-full flex items-center justify-center cursor-pointer mt-2"
                    style={{ borderRadius: '0px', backgroundColor: '#3D7EFF', boxShadow: 'none' }}
                  >
                    <span>Submit a Claim</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swiss Architectural Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#D4D4CE] p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-5"
            style={{ borderRadius: '0px' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#D4D4CE]">
              <div>
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#3D7EFF]">
                  Security Credentials
                </span>
                <h2 className="text-xl font-black text-charcoal tracking-tight mt-0.5">
                  Reset Password
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="p-1 text-coolgray hover:text-charcoal cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
                  Email Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#D4D4CE] text-charcoal text-base sm:text-sm focus:border-[#3D7EFF] focus:outline-none"
                    placeholder="Enter account email"
                    style={{ borderRadius: '0px' }}
                  />
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={sendingOtp}
                    className="px-3.5 py-2.5 bg-[#3D7EFF] hover:bg-electric-600 text-white font-mono font-bold text-xs uppercase tracking-wider whitespace-nowrap disabled:opacity-50 cursor-pointer min-h-[44px]"
                    style={{ borderRadius: '0px' }}
                  >
                    {sendingOtp ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
                  Verification OTP Code
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#D4D4CE] text-charcoal text-base sm:text-sm focus:border-[#3D7EFF] focus:outline-none placeholder:text-coolgray/50"
                  placeholder="Enter 6-digit OTP code"
                  style={{ borderRadius: '0px' }}
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#D4D4CE] text-charcoal text-base sm:text-sm focus:border-[#3D7EFF] focus:outline-none"
                  placeholder="At least 8 characters"
                  style={{ borderRadius: '0px' }}
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#D4D4CE] text-charcoal text-base sm:text-sm focus:border-[#3D7EFF] focus:outline-none"
                  placeholder="Re-enter password"
                  style={{ borderRadius: '0px' }}
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-[#D4D4CE]">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 border border-[#D4D4CE] text-charcoal font-mono text-xs uppercase tracking-wider hover:bg-[#F8F8F6] cursor-pointer min-h-[44px]"
                  style={{ borderRadius: '0px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={changePasswordWithOtp}
                  disabled={changingPwd}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#3D7EFF] hover:bg-electric-600 text-white font-mono font-bold text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer shadow-sm min-h-[44px]"
                  style={{ borderRadius: '0px' }}
                >
                  {changingPwd ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;