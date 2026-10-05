import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Copy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getJoinApplications } from '../utils/datastore';

const Referral = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    const load = async () => {
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
      }
    };
    load();
  }, [user?.referralCode, user?._id, user?.id, user?.email]);

  const link = user?.referralCode ? `${window.location.origin}/home?ref=${user.referralCode}` : '';

  const copyLink = () => {
    if (!link) return;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(link);
      toast.success('Referral link copied to clipboard');
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = link;
      textArea.style.position = "absolute";
      textArea.style.left = "-999999px";
      document.body.prepend(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success('Referral link copied to clipboard');
      } catch (error) {
        toast.error('Failed to copy');
      } finally {
        textArea.remove();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-slate-900" />
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Community <span className="text-[#A85830]">Referrals</span>
            </h1>
          </div>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl font-medium">
            Invite fellow beneficiaries, grow the DAO network, and track all your active referrals.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>Your Referral <span className="text-[#A85830]">Link</span></span>
            </h3>
          </div>
          <div className="bg-[#0a254d] text-white rounded-2xl p-6 sm:p-7 border border-sky-400/25 shadow-xl">
            {user?.referralCode ? (
              <div className="flex items-center justify-between bg-[#061833] border border-sky-400/20 hover:border-[#A85830]/40 rounded-xl px-4 py-3.5 transition-all">
                <a href={link} target="_blank" rel="noopener noreferrer" className="underline text-sky-300 hover:text-[#A85830] break-all font-mono text-sm font-bold">
                  {link}
                </a>
                <button 
                  onClick={copyLink} 
                  className="ml-3 p-2.5 rounded-xl bg-[#A85830]/15 text-[#A85830] hover:bg-[#A85830] hover:text-white transition-all shrink-0 cursor-pointer"
                  title="Copy Link"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-white font-bold text-sm">No referral code available</div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#A85830]" />
              <span>Your <span className="text-[#A85830]">Referrals</span></span>
            </h3>
          </div>
          <div className="bg-[#0a254d] text-white rounded-2xl p-6 sm:p-8 border border-sky-400/25 shadow-xl">
            {referrals.length === 0 ? (
              <div className="text-white font-bold py-8 text-center bg-[#061833] rounded-xl border border-sky-400/20">
                No referrals yet. Share your referral link above to invite members!
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((r, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#061833] border border-sky-400/20 hover:border-[#A85830]/30 rounded-xl p-4 transition-all">
                    <div>
                      <p className="text-white font-bold">{`${r.firstName || ''} ${r.lastName || ''}`.trim() || (r.email || 'user')}</p>
                      <p className="text-xs text-white font-semibold mt-0.5">{r.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white font-bold">{new Date(r.time || Date.now()).toLocaleString()}</p>
                      <p className="text-xs font-black text-[#10b981] uppercase tracking-wider mt-0.5">{r.status || 'active'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Referral;
