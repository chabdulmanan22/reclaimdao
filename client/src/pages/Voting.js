import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Vote,
  Clock,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getUserMeta, castVote, getActiveVotes as dsGetActiveVotes, submitVoteOption as dsSubmitVoteOption, addPoints } from '../utils/datastore';

const Voting = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [submittingVoteId, setSubmittingVoteId] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [votesRemaining, setVotesRemaining] = useState(0);
  const [votesAllowed, setVotesAllowed] = useState(0);
  const [activeVotes, setActiveVotes] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [selectedOptions, setSelectedOptions] = useState({}); // { [voteId]: optionId }

  // No dummy stats/history; page reflects live datastore state only

  const loadUserRights = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (!token) {
        setVotesAllowed(0);
        setVotesRemaining(0);
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get('/api/auth/me', { headers });
      const u = res.data?.user || res.data?.data?.user || {};
      const allowed = Number(u.votingRights) || 0;
      const used = Number(u.stats?.totalVotes) || 0;
      setVotesAllowed(allowed);
      setVotesRemaining(Math.max(0, allowed - used));
    } catch (_) {
      setVotesAllowed(0);
      setVotesRemaining(0);
    }
  };

  // Active votes loader and countdown ticker
  useEffect(() => {
    const loadVotes = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        // Get ALL active votes - no limit on number of simultaneous active votes
        const res = await axios.get('/api/votes', {
          params: { status: 'active', limit: 200 },
          headers
        });
        const apiVotes = res.data?.data?.votes || [];
        const transformed = apiVotes.map(v => ({
          id: v._id || v.id,
          title: v.title,
          description: v.description,
          options: (v.options || []).map(opt => ({
            id: opt.id,
            text: opt.text,
            votes: Number(opt.votes) || 0,
            votesOffset: Number(opt.votesOffset) || 0,
            targetVotes: Number(opt.targetVotes) || 0,
          })),
          status: v.status,
          isProgressive: !!v.isProgressive,
          startTime: v.startTime || null,
          endTime: v.endTime || null,
          maxVotesPerUser: v.maxVotesPerUser || 1,
          pointsReward: v.pointsReward || 0,
          totalVotes: v.totalVotes || 0,
          submissions: v.submissions ? (v.submissions instanceof Map ? Object.fromEntries(v.submissions) : v.submissions) : {},
          overrides: v.overrides ? (v.overrides instanceof Map ? Object.fromEntries(v.overrides) : v.overrides) : {},
          myVotingRights: v.myVotingRights
        }));
        setActiveVotes(transformed);
      } catch (error) {
        console.error('Error loading votes:', error);
        setActiveVotes(dsGetActiveVotes());
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadVotes();
    loadUserRights();

    // Ticker for smooth animation and progressive counting
    const tick = setInterval(() => setNow(Date.now()), 1000);

    // Polling for vote data updates (e.g. if admin changed offsets/targets)
    const poll = setInterval(loadVotes, 15000);

    const onUpdate = () => loadVotes();
    window.addEventListener('datastore:update', onUpdate);

    return () => {
      clearInterval(tick);
      clearInterval(poll);
      window.removeEventListener('datastore:update', onUpdate);
    };
  }, []);

  useEffect(() => {
    if (activeVotes.length > 0) {
      const params = new URLSearchParams(location.search);
      const voteId = params.get('voteId');
      if (voteId) {
        const el = document.getElementById(`vote-${voteId}`);
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-4', 'ring-purple-500');
            setTimeout(() => el.classList.remove('ring-4', 'ring-purple-500'), 3000);
          }, 500);
        }
      }
    }
  }, [activeVotes, location.search]);

  // Normalize user identifiers for submissions counting
  const userIds = [
    user?.email,
    user?._id,
    user?.id,
    String(user?._id || ''),
    String(user?.id || '')
  ].filter(Boolean);

  const countUsed = (submissions) => {
    const seen = new Set();
    let total = 0;
    for (const k of userIds) {
      if (seen.has(k)) continue;
      seen.add(k);
      total += Number(submissions?.[k] || 0);
    }
    return total;
  };

  const getVoteRights = (vote) => {
    if (vote.myVotingRights) {
      return {
        total: vote.myVotingRights.total,
        used: vote.myVotingRights.used,
        remaining: vote.myVotingRights.remaining
      };
    }

    const base = vote.maxVotesPerUser || 1;
    let offset = 0;

    if (vote.overrides) {
      for (const id of userIds) {
        if (vote.overrides[id] !== undefined) {
          offset = Number(vote.overrides[id]);
          break;
        }
      }
    }

    const total = Math.max(0, base + offset);
    const used = countUsed(vote.submissions);

    return {
      total,
      used,
      remaining: Math.max(0, total - used)
    };
  };

  useEffect(() => {
    if (!user?.email) return;
    loadUserRights();
    const onUpdate = () => { loadUserRights(); };
    window.addEventListener('datastore:update', onUpdate);
    return () => window.removeEventListener('datastore:update', onUpdate);
  }, [user?.email]);

  const formatRemaining = (endIso) => {
    if (!endIso) return null;
    const end = new Date(endIso).getTime();
    const diff = end - now;
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const getSmoothValue = (vote, option) => {
    const offset = Number(option.votesOffset) || 0;
    const realVotes = Number(option.votes) || 0;
    if (!vote.isProgressive || !vote.startTime || !vote.endTime) return realVotes + offset;
    const start = new Date(vote.startTime).getTime();
    const end = new Date(vote.endTime).getTime();
    const current = now;
    if (current <= start) return realVotes + offset;
    if (current >= end) return realVotes + (option.targetVotes || 0) + offset;
    const elapsed = current - start;
    const total = end - start;
    const progress = Math.min(1, Math.max(0, elapsed / total));
    return realVotes + (progress * (option.targetVotes || 0)) + offset;
  };

  const getDisplayedVotes = (vote, option) => {
    return Math.floor(getSmoothValue(vote, option));
  };

  const getSmoothProgress = (vote, option) => {
    const totalInRound = vote.options.reduce((acc, o) => acc + getSmoothValue(vote, o), 0);
    if (totalInRound <= 0) return 0;
    const displayed = getSmoothValue(vote, option);
    return (displayed / totalInRound) * 100;
  };

  const onSelectOption = (vote, option) => {
    if (!user?.email && !user?._id) {
      toast.error('Please log in to vote.');
      return;
    }
    const { remaining: perRoundRemaining } = getVoteRights(vote);
    if (perRoundRemaining <= 0) {
      toast.error(`No rights remaining for this round.`);
      return;
    }
    setSelectedOptions((prev) => ({ ...prev, [vote.id]: option.id }));
    toast.success(`Selected: ${option.text}`);
  };

  const onSubmitVote = async (vote) => {
    if (!user?.email || !vote || !user?._id) {
      toast.error('Please log in to vote.');
      return;
    }

    const selectedOptionId = selectedOptions[vote.id];
    if (selectedOptionId == null) {
      toast.error('Please select an option first.');
      return;
    }
    const { remaining: perRoundRemaining } = getVoteRights(vote);
    if (perRoundRemaining <= 0) {
      toast.error(`No rights remaining for this round.`);
      return;
    }

    setSubmittingVoteId(vote.id);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication required. Please log in.');
        setSubmittingVoteId(null);
        return;
      }
      const response = await axios.post(
        `/api/votes/${vote.id}/submit`,
        { optionId: Number(selectedOptionId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        const res = await axios.get('/api/votes', {
          params: { status: 'active', limit: 200 },
          headers: { Authorization: `Bearer ${token}` }
        });
        const apiVotes = res.data?.data?.votes || [];
        const transformed = apiVotes.map(v => ({
          id: v._id || v.id,
          title: v.title,
          description: v.description,
          options: (v.options || []).map(opt => ({
            id: opt.id,
            text: opt.text,
            votes: Number(opt.votes) || 0,
            votesOffset: Number(opt.votesOffset) || 0,
            targetVotes: Number(opt.targetVotes) || 0,
          })),
          status: v.status,
          isProgressive: !!v.isProgressive,
          startTime: v.startTime || null,
          endTime: v.endTime || null,
          maxVotesPerUser: v.maxVotesPerUser || 1,
          pointsReward: v.pointsReward || 0,
          totalVotes: v.totalVotes || 0,
          submissions: v.submissions ? (v.submissions instanceof Map ? Object.fromEntries(v.submissions) : v.submissions) : {},
          overrides: v.overrides ? (v.overrides instanceof Map ? Object.fromEntries(v.overrides) : v.overrides) : {},
          myVotingRights: v.myVotingRights
        }));
        setActiveVotes(transformed);
        setSelectedOptions((prev) => ({ ...prev, [vote.id]: null }));
        toast.success('Your vote has been submitted successfully!');
      }
    } catch (error) {
      console.error('Submit vote error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || error.message || 'Failed to submit vote';
      toast.error(errorMessage);
    } finally {
      setSubmittingVoteId(null);
    }
  };

  if (isInitialLoading && activeVotes.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-[#0d0c43] text-xl animate-pulse font-semibold">Loading voting data...</div>
      </div>
    );
  }

  const headerAllowed = activeVotes.reduce((acc, vote) => acc + getVoteRights(vote).total, 0);
  const headerUsed = activeVotes.reduce((acc, vote) => acc + getVoteRights(vote).used, 0);
  const headerRemaining = activeVotes.reduce((acc, vote) => acc + getVoteRights(vote).remaining, 0);

  const totalDisplayedVotes = (activeVotes || []).reduce((sum, v) => {
    return sum + (v.options || []).reduce((optSum, opt) => optSum + getDisplayedVotes(v, opt), 0);
  }, 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Vote className="w-8 h-8 text-slate-900" />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              DAO <span className="text-[#A85830]">Voting</span>
            </h1>
          </div>
          <p className="text-slate-600 text-sm sm:text-base max-w-3xl font-medium">
            Cast your vote on decisions and earn points
          </p>
        </motion.div>

        {/* Ineligibility Message for 0 Verified Loss */}
        {user && (user.verifiedLoss || 0) <= 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-6 rounded-2xl bg-red-950/90 border-2 border-red-500/70 backdrop-blur-md flex items-start gap-4 shadow-xl"
          >
            <div className="bg-red-600 rounded-full p-2.5 flex-shrink-0 animate-pulse shadow-md">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white text-xl font-black tracking-tight mb-1">Voting Restricted</h3>
              <p className="text-red-100 font-bold text-sm sm:text-base leading-snug">
                You are not eligible to vote because you do not have a verified loss.
              </p>
              <p className="text-red-200 font-bold text-xs mt-2.5 bg-red-900/80 px-3 py-1.5 rounded-lg border border-red-500/40 inline-block shadow-xs">
                Voting is reserved for verified holders who have experienced financial losses.
              </p>
            </div>
          </motion.div>
        )}

        {/* Voting Status Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">Voting <span className="text-[#A85830]">Status</span></h3>
          </div>
          <div className="bg-[#0a254d] text-white rounded-2xl p-6 sm:p-7 border border-sky-400/25 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-[#A85830]/15 text-[#A85830] rounded-xl mr-4 border border-[#A85830]/30">
                  <Vote className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Your Voting Allocation</h4>
                  <p className="text-white font-bold text-sm mt-0.5">
                    Voting rights: <span className="text-[#10b981] font-extrabold">{headerRemaining}</span> of <span className="text-white font-black">{headerAllowed}</span> remaining
                  </p>
                  <p className="text-white font-bold text-xs mt-0.5">
                    Used: <span className="text-white font-black">{headerUsed}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Active Votes Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">Active <span className="text-[#A85830]">Proposals</span></h3>
          </div>

          {(!activeVotes || activeVotes.length === 0) ? (
            <div className="bg-[#0a254d] text-white rounded-2xl p-10 border border-sky-400/25 shadow-xl text-center">
              <div className="flex flex-col items-center gap-3">
                <AlertCircle className="w-10 h-10 text-[#A85830]" />
                <p className="text-white text-base font-bold">No active voting round. Please check back later.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {activeVotes.map((vote) => (
                <motion.div
                  key={vote.id}
                  id={`vote-${vote.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0a254d] text-white rounded-2xl p-6 sm:p-8 border border-sky-400/25 hover:border-[#A85830]/50 shadow-xl transition-all"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-2.5 bg-sky-500/15 text-sky-300 rounded-xl mr-3 border border-sky-400/30">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{vote.title}</h3>
                  </div>
                  {vote.description && (
                    <p className="text-white font-bold text-sm sm:text-base mb-6 leading-relaxed">{vote.description}</p>
                  )}
                  {vote.endTime && (
                    <div className="mb-6 p-3.5 bg-[#061833] border border-sky-400/20 rounded-xl flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-[#A85830]" />
                      <span className="text-white font-bold text-sm">Time remaining:</span>
                      <span className="font-mono font-bold text-[#A85830]">{formatRemaining(vote.endTime)}</span>
                    </div>
                  )}
                  <div className="space-y-3.5">
                    {vote.options.map((opt) => {
                      const isSelected = selectedOptions[vote.id] === opt.id;
                      const { remaining: perRoundRemaining } = getVoteRights(vote);
                      const hasVerifiedLoss = (user?.verifiedLoss || 0) > 0;
                      const disabled = vote.status !== 'active' || perRoundRemaining <= 0 || !hasVerifiedLoss;

                      const displayedVotes = getDisplayedVotes(vote, opt);
                      const goalVotes = opt.targetVotes || 0;

                      const totalInRound = vote.options.reduce((acc, o) => acc + getDisplayedVotes(vote, o), 0);
                      const smoothDisplayed = getSmoothValue(vote, opt);
                      const smoothWidth = goalVotes > 0
                        ? Math.min(100, (smoothDisplayed / goalVotes) * 100)
                        : getSmoothProgress(vote, opt);

                      return (
                        <div key={opt.id} className="relative">
                          <button
                            onClick={() => !disabled && onSelectOption(vote, opt)}
                            disabled={disabled}
                            className={`w-full p-4 sm:p-5 rounded-xl border transition-all duration-300 flex items-center justify-between relative overflow-hidden ${
                              isSelected 
                                ? 'border-[#A85830] bg-[#0c2e5c] shadow-lg shadow-[#A85830]/20 ring-1 ring-[#A85830]/50' 
                                : 'border-sky-400/20 bg-[#061833]/80 hover:border-[#A85830]/40 hover:bg-[#061833]'
                            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {/* Background fill */}
                            <div
                              className="absolute left-0 top-0 bottom-0 bg-[#A85830]/15 transition-all duration-1000"
                              style={{ width: `${smoothWidth}%` }}
                            />

                            <div className="flex items-center gap-3 relative z-10">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? 'border-[#A85830] bg-[#A85830]' : 'border-slate-400 bg-transparent'
                              }`}>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-[#0a254d]" />}
                              </div>
                              <span className="font-bold text-white text-base">{opt.text}</span>
                            </div>
                            <div className="text-right relative z-10">
                              <span className="text-base font-black text-white block">
                                {displayedVotes}
                              </span>
                              <span className="text-[10px] text-white font-bold">
                                Total votes
                              </span>
                            </div>
                          </button>

                          {/* Animated bottom bar */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 rounded-b-xl overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${smoothWidth}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className="h-full bg-gradient-to-r from-[#A85830] to-[#ea580c]"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-5 text-xs text-white font-bold flex items-center justify-between">
                    <span>Your remaining in this round: <strong className="text-[#A85830] font-black">{getVoteRights(vote).remaining}</strong> of {getVoteRights(vote).total}</span>
                  </div>
                  <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                      onClick={() => onSubmitVote(vote)}
                      disabled={selectedOptions[vote.id] == null || vote.status !== 'active' || (
                        getVoteRights(vote).remaining <= 0
                      )}
                      className="px-6 py-2.5 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#A85830]/25 transition-all font-black text-sm cursor-pointer hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #A85830 0%, #964d28 50%, #854221 100%)' }}
                    >
                      Submit Vote
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Voting;
