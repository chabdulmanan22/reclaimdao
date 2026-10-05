import React, { useState } from 'react';
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
  Mail
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import logoImg from '../assets/logo.svg';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const [canContribute, setCanContribute] = useState(false);

  React.useEffect(() => {
    const checkContributionStatus = async () => {
      try {
        const [activeRes, publicRes, roundRes] = await Promise.all([
          axios.get('/api/settings/contributionActive'),
          axios.get('/api/settings/publicContributionsEnabled'),
          axios.get('/api/settings/contributionRound')
        ]);

        const isActive = activeRes.data?.data?.value ?? true;
        const isPublic = publicRes.data?.data?.value === true;
        const round = roundRes.data?.data?.value;
        const nowMs = Date.now();
        const hasRound = Boolean(round && round.startTime && round.endTime && nowMs <= new Date(round.endTime).getTime());

        setCanContribute(isActive && (isPublic || hasRound));
      } catch (error) {}
    };

    checkContributionStatus();
    const handleUpdate = () => checkContributionStatus();
    window.addEventListener('datastore:update', handleUpdate);
    return () => window.removeEventListener('datastore:update', handleUpdate);
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3, protected: true },
    { name: 'Voting', path: '/voting', icon: BarChart3, protected: true },
    { name: 'Contribute', path: '/contribute', icon: Coins },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy, protected: true },
    { name: 'Referral', path: '/referral', icon: User, protected: true },
    { name: 'Contact Us', path: '/contact', icon: Mail },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (item.name === 'Contribute') return canContribute;
    if (item.name === 'Home' && !user) return false;
    if (item.name === 'Contact Us' && !user) return false;
    if (item.protected && !user) return false;
    return true;
  });

  const adminItems = [
    { name: 'Admin Panel', path: '/admin', icon: Shield },
    { name: 'User Management', path: '/admin/users', icon: User },
    { name: 'Vote Management', path: '/admin/votes', icon: BarChart3 },
    { name: 'Contribution Management', path: '/admin/contributions', icon: Coins },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/95 border-b border-[#E2E5E8] shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-20 overflow-visible flex-nowrap">
          {/* Logo */}
          <div className="flex items-center h-full flex-shrink-0">
            <Link to="/" className="flex items-center h-full group">
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

          {/* Right Action / User Profile */}
          <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 px-3 py-2 bg-[#F4F5F7] border border-[#E2E5E8] hover:border-electric/50 transition-all duration-200"
                  style={{ borderRadius: '0px' }}
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-electric text-white" style={{ borderRadius: '0px' }}>
                    <span className="text-white text-sm font-bold">
                      {(user.fullName || user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-charcoal text-sm font-medium">{user.fullName || user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()}</span>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 border border-[#E2E5E8] shadow-xl p-2 bg-white/98 backdrop-blur-xl"
                      style={{ borderRadius: '0px' }}
                    >
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-3 py-2 text-charcoal hover:text-electric hover:bg-electric-50 transition-all text-sm font-medium"
                        onClick={() => setIsProfileOpen(false)}
                        style={{ borderRadius: '0px' }}
                      >
                        <User className="w-4 h-4 text-coolgray" />
                        <span>Profile</span>
                      </Link>

                      {user.role === 'admin' && (
                        <>
                          <div className="border-t border-[#E2E5E8] my-1.5"></div>
                          {adminItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.name}
                                to={item.path}
                                className="flex items-center space-x-2 px-3 py-2 text-charcoal hover:text-electric hover:bg-electric-50 transition-all text-sm font-medium"
                                onClick={() => setIsProfileOpen(false)}
                                style={{ borderRadius: '0px' }}
                              >
                                <Icon className="w-4 h-4 text-coolgray" />
                                <span>{item.name}</span>
                              </Link>
                            );
                          })}
                        </>
                      )}

                      <div className="border-t border-[#E2E5E8] my-1.5"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-all text-sm w-full font-medium"
                        style={{ borderRadius: '0px' }}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
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
              className="text-sky-400 hover:text-white p-2"
            >
              {isOpen ? <X className="w-6 h-6 text-charcoal" /> : <Menu className="w-6 h-6 text-charcoal" />}
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
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-3.5 py-2.5 rounded-none text-charcoal hover:text-electric hover:bg-electric-50 transition-all font-medium"
                    style={{ borderRadius: '0px' }}
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-4 h-4 text-coolgray" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-2 px-3.5 py-2.5 rounded-none text-rose-600 hover:bg-rose-50 transition-all w-full font-medium"
                    style={{ borderRadius: '0px' }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
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
    </nav>
  );
};

export default Navbar;