import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Copy,
  Check,
  Share2,
  Award,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  UserCheck,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getJoinApplications } from '../utils/datastore';

const Referral = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const userEmailLower = String(user?.email || '').toLowerCase().trim();
        const userIdStr = String(user?._id || user?.id || '');

        if (!user?._id && !user?.id) {
          const apps = getJoinApplications();
          const code = String(user?.referralCode || '').trim();
          const seen = new Set();
          const list = [];
          for (const a of apps) {
            const aEmail = String(a.email || '').toLowerCase().trim();
            if (String(a.referralCode || '').trim() === code && aEmail !== userEmailLower && aEmail) {
              if (!seen.has(aEmail)) {
                seen.add(aEmail);
                list.push({
                  firstName: a.firstName,
                  lastName: a.lastName,
                  email: a.email,
                  time: a.createdAt || a.time,
                  status: a.status || 'registered'
                });
              }
            }
          }
          setReferrals(list);
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const uid = String(user?._id || user?.id);
        const res = await axios.get(`/api/users/${uid}/referrals`, { params: { limit: 100 }, headers });
        const apiRefs = res.data?.data?.referrals || [];
        const seen = new Set();
        const validRefs = [];
        for (const r of apiRefs) {
          const rEmail = String(r.email || '').toLowerCase().trim();
          const rId = String(r.id || r._id || '');
          if (rEmail === userEmailLower || (userIdStr && rId === userIdStr)) {
            continue;
          }
          const dedupeKey = rEmail || rId;
          if (dedupeKey && seen.has(dedupeKey)) {
            continue;
          }
          if (dedupeKey) seen.add(dedupeKey);
          validRefs.push({
            firstName: r.firstName,
            lastName: r.lastName,
            email: r.email,
            time: r.createdAt || r.time,
            status: r.status || 'active'
          });
        }
        setReferrals(validRefs);
      } catch (e) {
        const apps = getJoinApplications();
        const code = String(user?.referralCode || '').trim();
        const userEmailLower = String(user?.email || '').toLowerCase().trim();
        const seen = new Set();
        const list = [];
        for (const a of apps) {
          const aEmail = String(a.email || '').toLowerCase().trim();
          if (String(a.referralCode || '').trim() === code && aEmail !== userEmailLower && aEmail) {
            if (!seen.has(aEmail)) {
              seen.add(aEmail);
              list.push({
                firstName: a.firstName,
                lastName: a.lastName,
                email: a.email,
                time: a.createdAt || a.time,
                status: a.status || 'registered'
              });
            }
          }
        }
        setReferrals(list);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.referralCode, user?._id, user?.id, user?.email]);

  const link = user?.referralCode ? `${window.location.origin}/home?ref=${user.referralCode}` : '';

  const copyLink = () => {
    if (!link) return;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Referral link copied to clipboard');
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = link;
      textArea.style.position = 'absolute';
      textArea.style.left = '-999999px';
      document.body.prepend(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Referral link copied to clipboard');
      } catch (error) {
        toast.error('Failed to copy');
      } finally {
        textArea.remove();
      }
    }
  };

  const filteredReferrals = referrals.filter(r => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const fullName = `${r.firstName || ''} ${r.lastName || ''}`.toLowerCase();
    const email = (r.email || '').toLowerCase();
    return fullName.includes(term) || email.includes(term);
  });

  const activeCount = referrals.filter(
    r => (r.status || 'active').toLowerCase() === 'active' || (r.status || '').toLowerCase() === 'registered'
  ).length;

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-charcoal py-6 sm:py-10 md:py-12 selection:bg-[#3D7EFF] selection:text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

        {/* Masthead Header Section */}
        <div className="border-b border-[#D4D4CE] pb-6 space-y-2.5">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#D4D4CE] text-charcoal text-[11px] font-mono font-bold uppercase tracking-wider shadow-sm"
            style={{ borderRadius: '0px' }}
          >
            <Users className="w-3.5 h-3.5 text-[#3D7EFF]" />
            <span>Community Referrals • Protocol Expansion Network</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-charcoal tracking-tight">
            Community <span className="text-[#3D7EFF]">Referrals</span>
          </h1>

          <p className="text-coolgray text-xs sm:text-base max-w-2xl leading-relaxed">
            Invite fellow claimants, expand decentralized recovery consensus, and track your active network referrals in real time.
          </p>
        </div>

        {/* Protocol Referral Stats Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Total Referrals */}
          <div
            className="bg-white border border-[#D4D4CE] p-5 sm:p-6 shadow-sm flex items-center justify-between"
            style={{ borderRadius: '0px' }}
          >
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-coolgray block">
                Total Invited
              </span>
              <span className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight mt-1 block font-mono">
                {referrals.length}
              </span>
              <span className="font-mono text-xs text-coolgray mt-1 block">
                Total invitations generated
              </span>
            </div>
            <div
              className="p-3 bg-[#F8F8F6] border border-[#D4D4CE] text-[#3D7EFF] shrink-0"
              style={{ borderRadius: '0px' }}
            >
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Active Claimants */}
          <div
            className="bg-white border border-[#D4D4CE] p-5 sm:p-6 shadow-sm flex items-center justify-between"
            style={{ borderRadius: '0px' }}
          >
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-coolgray block">
                Active Claimants
              </span>
              <span className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight mt-1 block font-mono">
                {activeCount}
              </span>
              <span className="font-mono text-xs text-coolgray mt-1 block">
                Verified protocol members
              </span>
            </div>
            <div
              className="p-3 bg-[#F8F8F6] border border-[#D4D4CE] text-emerald-600 shrink-0"
              style={{ borderRadius: '0px' }}
            >
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Governance Points */}
          <div
            className="bg-white border border-[#D4D4CE] p-5 sm:p-6 shadow-sm flex items-center justify-between"
            style={{ borderRadius: '0px' }}
          >
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-coolgray block">
                Points Accrued
              </span>
              <span className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight mt-1 block font-mono">
                +{referrals.length * 10} <span className="text-xs font-normal text-coolgray">PTS</span>
              </span>
              <span className="font-mono text-xs text-coolgray mt-1 block">
                +10 PTS per verified claimant
              </span>
            </div>
            <div
              className="p-3 bg-[#F8F8F6] border border-[#D4D4CE] text-[#3D7EFF] shrink-0"
              style={{ borderRadius: '0px' }}
            >
              <Award className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Protocol Referral Code */}
          <div
            className="bg-white border border-[#D4D4CE] p-5 sm:p-6 shadow-sm flex items-center justify-between"
            style={{ borderRadius: '0px' }}
          >
            <div className="min-w-0 pr-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-coolgray block">
                Protocol Code
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#3D7EFF] tracking-tight mt-1 block font-mono truncate">
                {user?.referralCode || 'UNASSIGNED'}
              </span>
              <span className="font-mono text-xs text-coolgray mt-1 block">
                Cryptographic routing identifier
              </span>
            </div>
            <div
              className="p-3 bg-[#F8F8F6] border border-[#D4D4CE] text-charcoal shrink-0"
              style={{ borderRadius: '0px' }}
            >
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Your Referral Link Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-[#D4D4CE] p-6 sm:p-8 shadow-sm space-y-6"
          style={{ borderRadius: '0px' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D4D4CE] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#3D7EFF]" />
                <h2 className="text-lg sm:text-xl font-black text-charcoal tracking-tight">
                  Unique Referral Protocol Link
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-coolgray mt-1 font-medium">
                Distribute this unique entry portal to fellow restitution beneficiaries to expand verified network quorum.
              </p>
            </div>
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F8F8F6] border border-[#D4D4CE] font-mono text-[11px] font-bold text-coolgray uppercase self-start sm:self-center"
              style={{ borderRadius: '0px' }}
            >
              <Sparkles className="w-3 h-3 text-[#3D7EFF]" />
              <span>+10 PTS / Claimant</span>
            </div>
          </div>

          {/* Link Box Container */}
          <div className="space-y-3">
            <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal">
              Cryptographic Invitation URL
            </label>
            {user?.referralCode ? (
              <div
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-[#F8F8F6] border border-[#D4D4CE]"
                style={{ borderRadius: '0px' }}
              >
                <div className="flex items-center gap-2 min-w-0 px-2 py-1 flex-1">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs sm:text-sm font-bold text-charcoal hover:text-[#3D7EFF] break-all underline transition-colors"
                  >
                    {link}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={copyLink}
                  className="px-5 py-3 bg-[#3D7EFF] hover:bg-blue-600 active:scale-[0.99] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm"
                  style={{ borderRadius: '0px' }}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div
                className="p-4 bg-[#F8F8F6] border border-[#D4D4CE] font-mono text-xs text-coolgray"
                style={{ borderRadius: '0px' }}
              >
                No referral code allocated yet. Complete your identity verification dossier to generate your link.
              </div>
            )}
          </div>

          {/* 3 Step Protocol Expansion Guide */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div
              className="p-4 bg-[#F8F8F6] border border-[#D4D4CE] space-y-1.5"
              style={{ borderRadius: '0px' }}
            >
              <span className="font-mono text-[10px] font-black uppercase text-[#3D7EFF] tracking-wider block">
                01 • Dispatch Link
              </span>
              <h4 className="text-sm font-bold text-charcoal">Share with Claimants</h4>
              <p className="text-xs text-coolgray leading-relaxed">
                Send your unique referral URL to individuals impacted by exchange or custodian asset freezing.
              </p>
            </div>

            <div
              className="p-4 bg-[#F8F8F6] border border-[#D4D4CE] space-y-1.5"
              style={{ borderRadius: '0px' }}
            >
              <span className="font-mono text-[10px] font-black uppercase text-[#3D7EFF] tracking-wider block">
                02 • Submit Dossier
              </span>
              <h4 className="text-sm font-bold text-charcoal">Dossier Verification</h4>
              <p className="text-xs text-coolgray leading-relaxed">
                Claimants register their loss claims and submit evidence through the transparent decentralized gateway.
              </p>
            </div>

            <div
              className="p-4 bg-[#F8F8F6] border border-[#D4D4CE] space-y-1.5"
              style={{ borderRadius: '0px' }}
            >
              <span className="font-mono text-[10px] font-black uppercase text-[#3D7EFF] tracking-wider block">
                03 • Earn Governance
              </span>
              <h4 className="text-sm font-bold text-charcoal">Accrue Protocol Points</h4>
              <p className="text-xs text-coolgray leading-relaxed">
                Receive +10 Governance Points per confirmed claimant, increasing your weighting in consensus votes.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Active Referrals Ledger Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-[#D4D4CE] p-6 sm:p-8 shadow-sm space-y-6"
          style={{ borderRadius: '0px' }}
        >
          {/* Header + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4D4CE] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#3D7EFF]" />
                <h3 className="text-lg sm:text-xl font-black text-charcoal tracking-tight">
                  Your Active Referrals
                </h3>
                <span
                  className="ml-2 px-2.5 py-0.5 bg-[#F8F8F6] border border-[#D4D4CE] font-mono text-xs font-bold text-charcoal"
                  style={{ borderRadius: '0px' }}
                >
                  {referrals.length}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-coolgray mt-1">
                Verified beneficiary invitations linked to your protocol governance record.
              </p>
            </div>

            {/* Search Input if referrals exist */}
            {referrals.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-coolgray absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-[#F8F8F6] border border-[#D4D4CE] pl-9 pr-3 py-2 text-xs font-mono text-charcoal focus:outline-none focus:border-[#3D7EFF] transition-colors placeholder:text-coolgray/70"
                  style={{ borderRadius: '0px' }}
                />
              </div>
            )}
          </div>

          {/* Ledger Content */}
          {loading ? (
            <div className="py-12 text-center text-coolgray font-mono text-xs">
              Loading protocol referral ledger...
            </div>
          ) : referrals.length === 0 ? (
            /* Empty State */
            <div
              className="border border-dashed border-[#D4D4CE] bg-[#F8F8F6] p-8 sm:p-14 text-center space-y-4"
              style={{ borderRadius: '0px' }}
            >
              <div
                className="w-12 h-12 bg-white border border-[#D4D4CE] text-[#3D7EFF] flex items-center justify-center mx-auto shadow-sm"
                style={{ borderRadius: '0px' }}
              >
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-base font-black text-charcoal tracking-tight">
                  No Referrals Registered Yet
                </h4>
                <p className="text-xs text-coolgray leading-relaxed">
                  You haven't referred any claimants yet. Share your unique invite link above with affected victims to expand the restitution protocol and accrue governance points.
                </p>
              </div>
              {link && (
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3D7EFF] hover:bg-blue-600 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                  style={{ borderRadius: '0px' }}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Your Referral Link</span>
                </button>
              )}
            </div>
          ) : filteredReferrals.length === 0 ? (
            <div className="py-10 text-center text-coolgray font-mono text-xs">
              No referrals match your search query "{searchTerm}".
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto border border-[#D4D4CE]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F8F6] border-b border-[#D4D4CE] font-mono text-[11px] font-bold text-coolgray uppercase tracking-wider">
                      <th className="py-3 px-4">Claimant</th>
                      <th className="py-3 px-4">Email Address</th>
                      <th className="py-3 px-4">Registration Date</th>
                      <th className="py-3 px-4">Protocol Status</th>
                      <th className="py-3 px-4 text-right">Points Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4D4CE] text-xs font-mono">
                    {filteredReferrals.map((r, idx) => {
                      const name = `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'Claimant';
                      const initial = name.charAt(0).toUpperCase();
                      const dateStr = new Date(r.time || Date.now()).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      });

                      return (
                        <tr
                          key={idx}
                          className="hover:bg-[#F8F8F6] transition-colors"
                        >
                          <td className="py-3.5 px-4 font-sans font-bold text-charcoal">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 bg-[#3D7EFF] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm"
                                style={{ borderRadius: '0px' }}
                              >
                                {initial}
                              </div>
                              <span className="truncate">{name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-coolgray truncate">
                            {r.email || '—'}
                          </td>
                          <td className="py-3.5 px-4 text-charcoal">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-coolgray" />
                              <span>{dateStr}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-black uppercase tracking-wider"
                              style={{ borderRadius: '0px' }}
                            >
                              <Check className="w-2.5 h-2.5" />
                              <span>{r.status || 'Active'}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-[#3D7EFF]">
                            +10 PTS
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View (100% responsive for small screens) */}
              <div className="block md:hidden space-y-3">
                {filteredReferrals.map((r, idx) => {
                  const name = `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'Claimant';
                  const initial = name.charAt(0).toUpperCase();
                  const dateStr = new Date(r.time || Date.now()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <div
                      key={idx}
                      className="bg-[#F8F8F6] border border-[#D4D4CE] p-4 space-y-3"
                      style={{ borderRadius: '0px' }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-8 h-8 bg-[#3D7EFF] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm"
                            style={{ borderRadius: '0px' }}
                          >
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-charcoal truncate">{name}</h4>
                            <p className="text-xs font-mono text-coolgray truncate">{r.email}</p>
                          </div>
                        </div>
                        <span
                          className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 font-mono text-[10px] font-black uppercase shrink-0"
                          style={{ borderRadius: '0px' }}
                        >
                          {r.status || 'Active'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#D4D4CE] font-mono text-xs">
                        <span className="text-coolgray flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {dateStr}
                        </span>
                        <span className="font-black text-[#3D7EFF]">
                          +10 PTS
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
};

export default Referral;
