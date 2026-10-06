import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  Edit3, 
  Save, 
  X,
  Shield,
  ShieldCheck,
  MapPin,
  Phone,
  Wallet,
  Send,
  Lock,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Coins
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    name: (user?.fullName || user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()),
    email: user?.email || '',
    username: user?.username || (user?.email ? String(user.email).split('@')[0] : ''),
    address: user?.address || '',
    telegramUsername: user?.telegramUsername || '',
    phoneNumber: user?.phoneNumber || '',
    walletAddress: user?.walletAddress || ''
  });

  useEffect(() => {
    const syncFromAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/auth/me', token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
        const u = res.data?.data?.user || user;
        if (u) {
          setFormData({
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            name: (u.fullName || u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim()),
            email: u.email || '',
            username: u.username || (u.email ? String(u.email).split('@')[0] : ''),
            address: u.address || '',
            telegramUsername: u.telegramUsername || '',
            phoneNumber: u.phoneNumber || '',
            walletAddress: u.walletAddress || ''
          });
        }
      } catch {
        if (user) {
          setFormData({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            name: (user?.fullName || user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()),
            email: user?.email || '',
            username: user?.username || (user?.email ? String(user.email).split('@')[0] : ''),
            address: user?.address || '',
            telegramUsername: user?.telegramUsername || '',
            phoneNumber: user?.phoneNumber || '',
            walletAddress: user?.walletAddress || ''
          });
        }
      }
    };
    syncFromAuth();
  }, [user]);

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      if (params.get('edit')) {
        setIsEditing(true);
      }
    } catch (_) {}
  }, [location.search]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {};
      const cleaned = {
        firstName: (formData.firstName || '').trim(),
        lastName: (formData.lastName || '').trim(),
        email: (formData.email || '').trim(),
        username: (formData.username || '').trim(),
        address: (formData.address || '').trim(),
        telegramUsername: (formData.telegramUsername || '').trim().replace(/^@+/, '').replace(/\s+/g, '_'),
        phoneNumber: (formData.phoneNumber || '').trim(),
        walletAddress: (formData.walletAddress || '').trim()
      };

      const errors = [];
      if (cleaned.firstName && cleaned.firstName.length < 2) errors.push('First name must be at least 2 characters');
      if (cleaned.lastName && cleaned.lastName.length < 2) errors.push('Last name must be at least 2 characters');
      if (cleaned.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned.email)) errors.push('Enter a valid email');
      if (cleaned.username && !/^[a-zA-Z0-9_]{3,32}$/.test(cleaned.username)) errors.push('Username must be 3-32 characters');
      if (cleaned.telegramUsername && !/^[a-zA-Z0-9_]{3,32}$/.test(cleaned.telegramUsername)) errors.push('Telegram username must be 3-32 characters (letters, numbers, underscore)');
      if (cleaned.phoneNumber && !/^\+?[0-9\s\-().]{7,20}$/.test(cleaned.phoneNumber)) errors.push('Phone number must be 7-20 digits and may include +, spaces, dashes, parentheses, dots');
      if (cleaned.walletAddress && cleaned.walletAddress.length < 10) errors.push('Wallet address must be at least 10 characters');
      if (errors.length) {
        toast.error(errors[0]);
        setLoading(false);
        return;
      }

      Object.entries(cleaned).forEach(([k, v]) => { if (v) payload[k] = v; });
      const token = localStorage.getItem('token');
      if (token && token.startsWith('placeholder-token-')) {
        const localUpdated = { ...user, ...payload };
        updateUser(localUpdated);
        localStorage.setItem('user', JSON.stringify(localUpdated));
        try { window.dispatchEvent(new Event('datastore:update')); } catch (_) {}
        setIsEditing(false);
        toast.success('Profile updated successfully');
        return;
      }

      const response = await axios.put('/api/auth/profile', payload, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
      const updated = response.data?.data?.user || response.data?.user;
      if (updated) {
        updateUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      const serverMsg = error.response?.data?.message;
      const firstDetail = Array.isArray(error.response?.data?.errors) && error.response.data.errors[0]?.msg;
      toast.error(firstDetail || serverMsg || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      name: (user?.fullName || user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()),
      email: user?.email || '',
      username: user?.username || (user?.email ? String(user.email).split('@')[0] : ''),
      address: user?.address || '',
      telegramUsername: user?.telegramUsername || '',
      phoneNumber: user?.phoneNumber || '',
      walletAddress: user?.walletAddress || ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] flex items-center justify-center">
        <div className="font-mono text-charcoal text-sm uppercase tracking-wider font-bold">
          Authenticating claimant node...
        </div>
      </div>
    );
  }

  const userDisplayName = user.fullName || user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Claimant';
  const userInitial = userDisplayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-charcoal py-6 sm:py-10 md:py-12 selection:bg-[#3D7EFF] selection:text-white">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

        {/* Masthead Header Section */}
        <div className="border-b border-[#D4D4CE] pb-6 space-y-2.5">
          <div className="flex items-center justify-between">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#D4D4CE] text-charcoal text-[11px] font-mono font-bold uppercase tracking-wider shadow-sm"
              style={{ borderRadius: '0px' }}
            >
              <User className="w-3.5 h-3.5 text-[#3D7EFF]" />
              <span>Claimant Profile • Restitution Identity Node</span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D4D4CE] text-charcoal hover:border-[#3D7EFF] text-xs font-mono font-bold uppercase transition-all shadow-sm cursor-pointer"
              style={{ borderRadius: '0px' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-charcoal tracking-tight">
            Beneficiary <span className="text-[#3D7EFF]">Profile</span>
          </h1>

          <p className="text-coolgray text-xs sm:text-base max-w-2xl leading-relaxed">
            Manage your authenticated recovery credentials, settlement wallet routing, and decentralized contact records.
          </p>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#D4D4CE] p-5 sm:p-8 shadow-sm space-y-6"
          style={{ borderRadius: '0px' }}
        >
          {/* Header Row: Avatar, Name, Edit Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D4D4CE]">
            <div className="flex items-center gap-4 min-w-0">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 bg-[#3D7EFF] text-white flex items-center justify-center font-black text-2xl sm:text-3xl shrink-0 shadow-md border-2 border-white"
                style={{ borderRadius: '0px' }}
              >
                {userInitial}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-charcoal tracking-tight truncate">
                    {userDisplayName}
                  </h2>
                  <span
                    className="px-2.5 py-0.5 bg-[#F8F8F6] border border-[#D4D4CE] font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal shrink-0"
                    style={{ borderRadius: '0px' }}
                  >
                    {user.role ? (user.role.toUpperCase()) : 'CLAIMANT'}
                  </span>
                </div>
                <p className="font-mono text-xs text-coolgray mt-0.5 truncate">{user.email}</p>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-coolgray mt-1">
                  <Calendar className="w-3.5 h-3.5 text-coolgray" />
                  <span>Dossier Created: {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto px-5 py-3 bg-[#3D7EFF] hover:bg-blue-600 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm cursor-pointer min-h-[44px]"
                style={{ borderRadius: '0px' }}
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* Profile Overview (Non-Editing View) */}
          {!isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#F8F8F6] border border-[#D4D4CE] space-y-1" style={{ borderRadius: '0px' }}>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-coolgray block">
                  Email Address
                </span>
                <div className="flex items-center gap-2 text-sm font-bold text-charcoal break-all">
                  <Mail className="w-4 h-4 text-[#3D7EFF] shrink-0" />
                  <span>{user.email || '—'}</span>
                </div>
              </div>

              <div className="p-4 bg-[#F8F8F6] border border-[#D4D4CE] space-y-1" style={{ borderRadius: '0px' }}>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-coolgray block">
                  Username / Protocol Handle
                </span>
                <div className="flex items-center gap-2 text-sm font-bold text-charcoal">
                  <User className="w-4 h-4 text-[#3D7EFF] shrink-0" />
                  <span>{user.username || (user.email ? user.email.split('@')[0] : '—')}</span>
                </div>
              </div>

              <div className="p-4 bg-[#F8F8F6] border border-[#D4D4CE] space-y-1" style={{ borderRadius: '0px' }}>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-coolgray block">
                  Phone Number
                </span>
                <div className="flex items-center gap-2 text-sm font-bold text-charcoal">
                  <Phone className="w-4 h-4 text-[#3D7EFF] shrink-0" />
                  <span>{user.phoneNumber || 'Not provided'}</span>
                </div>
              </div>

              <div className="p-4 bg-[#F8F8F6] border border-[#D4D4CE] space-y-1" style={{ borderRadius: '0px' }}>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-coolgray block">
                  Telegram Username
                </span>
                <div className="flex items-center gap-2 text-sm font-bold text-charcoal">
                  <Send className="w-4 h-4 text-[#3D7EFF] shrink-0" />
                  <span>{user.telegramUsername ? `@${user.telegramUsername}` : 'Not provided'}</span>
                </div>
              </div>

              <div className="p-4 bg-[#F8F8F6] border border-[#D4D4CE] space-y-1 md:col-span-2" style={{ borderRadius: '0px' }}>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-coolgray block">
                  Physical / Mailing Address
                </span>
                <div className="flex items-center gap-2 text-sm font-bold text-charcoal">
                  <MapPin className="w-4 h-4 text-[#3D7EFF] shrink-0" />
                  <span>{user.address || 'Not provided'}</span>
                </div>
              </div>

              <div className="p-4 bg-[#F8F8F6] border border-[#D4D4CE] space-y-1 md:col-span-2" style={{ borderRadius: '0px' }}>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-coolgray block">
                  Settlement Restitution Wallet Address
                </span>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-charcoal break-all">
                  <Wallet className="w-4 h-4 text-[#3D7EFF] shrink-0" />
                  <span>{user.walletAddress || 'No settlement address linked yet'}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Editing Form View - 100% Mobile Responsive */
            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between pb-3 border-b border-[#D4D4CE]">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#3D7EFF]" />
                  <span>Modify Claimant Information</span>
                </h3>
                <span className="font-mono text-[10px] text-coolgray uppercase">Dossier Update</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                    First Name <span className="text-[#3D7EFF]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-white border border-[#D4D4CE] px-3.5 py-3 text-base sm:text-sm font-medium text-charcoal focus:outline-none focus:border-[#3D7EFF] transition-colors"
                    placeholder="First Name"
                    style={{ borderRadius: '0px' }}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                    Last Name <span className="text-[#3D7EFF]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-white border border-[#D4D4CE] px-3.5 py-3 text-base sm:text-sm font-medium text-charcoal focus:outline-none focus:border-[#3D7EFF] transition-colors"
                    placeholder="Last Name"
                    style={{ borderRadius: '0px' }}
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-[#D4D4CE] px-3.5 py-3 text-base sm:text-sm font-medium text-charcoal focus:outline-none focus:border-[#3D7EFF] transition-colors"
                    placeholder="claimant@domain.com"
                    style={{ borderRadius: '0px' }}
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-white border border-[#D4D4CE] px-3.5 py-3 text-base sm:text-sm font-medium text-charcoal focus:outline-none focus:border-[#3D7EFF] transition-colors"
                    placeholder="Username"
                    style={{ borderRadius: '0px' }}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full bg-white border border-[#D4D4CE] px-3.5 py-3 text-base sm:text-sm font-medium text-charcoal focus:outline-none focus:border-[#3D7EFF] transition-colors"
                    placeholder="+1 555 123 4567"
                    style={{ borderRadius: '0px' }}
                  />
                </div>

                {/* Telegram Username */}
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                    Telegram Username
                  </label>
                  <input
                    type="text"
                    value={formData.telegramUsername}
                    onChange={(e) => setFormData({ ...formData, telegramUsername: e.target.value })}
                    className="w-full bg-white border border-[#D4D4CE] px-3.5 py-3 text-base sm:text-sm font-medium text-charcoal focus:outline-none focus:border-[#3D7EFF] transition-colors"
                    placeholder="username (without @)"
                    style={{ borderRadius: '0px' }}
                  />
                </div>

                {/* Physical Address */}
                <div className="sm:col-span-2">
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                    Physical / Residential Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-white border border-[#D4D4CE] px-3.5 py-3 text-base sm:text-sm font-medium text-charcoal focus:outline-none focus:border-[#3D7EFF] transition-colors"
                    placeholder="123 Financial Way, Suite 400"
                    style={{ borderRadius: '0px' }}
                  />
                </div>

                {/* Wallet Address */}
                <div className="sm:col-span-2">
                  <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                    Settlement Restitution Wallet Address (ERC-20 / TRC-20 / BTC)
                  </label>
                  <input
                    type="text"
                    value={formData.walletAddress}
                    onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                    className="w-full bg-white border border-[#D4D4CE] px-3.5 py-3 text-base sm:text-sm font-mono text-charcoal focus:outline-none focus:border-[#3D7EFF] transition-colors placeholder:font-sans"
                    placeholder="0x... or T..."
                    style={{ borderRadius: '0px' }}
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t border-[#D4D4CE]">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-6 py-3 bg-white border border-[#D4D4CE] hover:border-charcoal text-charcoal font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer min-h-[44px]"
                  style={{ borderRadius: '0px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 bg-[#3D7EFF] hover:bg-blue-600 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer min-h-[44px]"
                  style={{ borderRadius: '0px' }}
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Security & Loss Dossier Summary Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Card 1: Account Security */}
          <div
            className="bg-white border border-[#D4D4CE] p-6 shadow-sm space-y-4"
            style={{ borderRadius: '0px' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#D4D4CE]">
              <span className="font-mono text-[11px] font-bold text-coolgray uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#3D7EFF]" />
                <span>Account Security</span>
              </span>
              <span className="font-mono text-[10px] text-emerald-600 font-bold uppercase">Active 2FA</span>
            </div>

            <p className="text-xs text-coolgray leading-relaxed font-medium">
              Your account is secured with email OTP cryptographic verification. You can reset your password anytime from the top navigation profile menu.
            </p>

            <div className="pt-2 font-mono text-xs text-charcoal">
              <span>Account Status: </span>
              <strong className="text-emerald-600 font-bold uppercase">Audited Claimant</strong>
            </div>
          </div>

          {/* Card 2: Restitution Standing */}
          <div
            className="bg-white border border-[#D4D4CE] p-6 shadow-sm space-y-4"
            style={{ borderRadius: '0px' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#D4D4CE]">
              <span className="font-mono text-[11px] font-bold text-coolgray uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3D7EFF]" />
                <span>Restitution Standing</span>
              </span>
              <span className="font-mono text-[10px] text-[#3D7EFF] font-bold uppercase">Audited</span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 bg-[#F8F8F6] border border-[#D4D4CE]">
                <span className="text-[10px] text-coolgray uppercase block">Verified Loss</span>
                <span className="text-base font-black text-charcoal block mt-0.5">${(user.verifiedLoss || 0).toLocaleString()}</span>
              </div>
              <div className="p-3 bg-[#F8F8F6] border border-[#D4D4CE]">
                <span className="text-[10px] text-coolgray uppercase block">Restituted</span>
                <span className="text-base font-black text-[#3D7EFF] block mt-0.5">${(user.amountRestituted || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
