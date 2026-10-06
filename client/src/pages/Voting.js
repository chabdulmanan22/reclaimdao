import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Vote,
  Clock,
  AlertCircle,
  BarChart3,
  ShieldCheck,
  Check,
  ArrowRight,
  CheckCircle2,
  Users
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getActiveVotes as dsGetActiveVotes } from '../utils/datastore';

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

    const tick = setInterval(() => setNow(Date.now()), 1000);
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
            el.classList.add('border-2', 'border-[#3D7EFF]');
            setTimeout(() => el.classList.remove('border-2', 'border-[#3D7EFF]'), 3000);
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
      <div className="min-h-screen bg-[#F8F8F6] flex items-center justify-center">
        <div className="font-mono text-charcoal text-sm uppercase tracking-wider font-bold animate-pulse">
          Synchronizing consensus ledger...
        </div>
      </div>
    );
  }

  const headerAllowed = activeVotes.reduce((acc, vote) => acc + getVoteRights(vote).total, 0);
  const headerUsed = activeVotes.reduce((acc, vote) => acc + getVoteRights(vote).used, 0);
  const headerRemaining = activeVotes.reduce((acc, vote) => acc + getVoteRights(vote).remaining, 0);

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-charcoal py-6 sm:py-10 md:py-12 selection:bg-[#3D7EFF] selection:text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

        {/* Masthead Header Section */}
        <div className="border-b border-[#D4D4CE] pb-6 space-y-2.5">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#D4D4CE] text-charcoal text-[11px] font-mono font-bold uppercase tracking-wider shadow-sm"
            style={{ borderRadius: '0px' }}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#3D7EFF]" />
            <span>Decentralized Consensus • Protocol Ballot Node</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-charcoal tracking-tight">
            DAO <span className="text-[#3D7EFF]">Voting</span>
          </h1>

          <p className="text-coolgray text-xs sm:text-base max-w-2xl leading-relaxed">
            Cast your consensus votes on restitution disbursements, escrow payouts, and community decisions.
          </p>
        </div>

        {/* Ineligibility Warning (Only if user has 0 verified loss) */}
        {user && (user.verifiedLoss || 0) <= 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-white border-l-4 border-l-red-500 border border-[#D4D4CE] shadow-sm flex items-start gap-3.5"
            style={{ borderRadius: '0px' }}
          >
            <div className="p-2 bg-red-50 border border-red-200 text-red-600 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-red-600">
                Restricted Participation
              </span>
              <h3 className="text-base font-black text-charcoal tracking-tight mt-0.5">
                Voting Allocation Restricted
              </h3>
              <p className="text-xs text-coolgray font-medium mt-1 leading-relaxed">
                You are not currently eligible to submit ballots because your profile does not have an audited loss dossier. Voting rights are reserved for authenticated claimants with on-chain damage.
              </p>
            </div>
          </motion.div>
        )}

        {/* Voting Status / Quorum Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#D4D4CE] p-6 sm:p-7 shadow-sm space-y-5"
          style={{ borderRadius: '0px' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D4D4CE]">
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 bg-[#F8F8F6] border border-[#D4D4CE] text-[#3D7EFF]"
                style={{ borderRadius: '0px' }}
              >
                <Vote className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#3D7EFF]">
                  Claimant Allocation
                </span>
                <h3 className="text-lg sm:text-xl font-black text-charcoal tracking-tight">
                  Your Voting Quorum
                </h3>
              </div>
            </div>

            <div
              className="font-mono text-xs text-charcoal bg-[#F8F8F6] border border-[#D4D4CE] px-3 py-1.5 self-start sm:self-auto"
              style={{ borderRadius: '0px' }}
            >
              <span>Active Rounds: <strong className="text-charcoal font-black">{activeVotes.length}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            <div
              className="p-4 bg-[#F8F8F6] border border-[#D4D4CE] flex flex-col justify-between"
              style={{ borderRadius: '0px' }}
            >
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-coolgray">
                Total Allocated
              </span>
              <span className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight mt-1">
                {headerAllowed}
              </span>
              <span className="text-[11px] font-mono text-coolgray mt-1">
                Authorized voting rights
              </span>
            </div>

            <div
              className="p-4 bg-[#F8F8F6] border border-[#D4D4CE] flex flex-col justify-between"
              style={{ borderRadius: '0px' }}
            >
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-coolgray">
                Ballots Cast
              </span>
              <span className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight mt-1">
                {headerUsed}
              </span>
              <span className="text-[11px] font-mono text-coolgray mt-1">
                Submissions finalized
              </span>
            </div>

            <div
              className="p-4 bg-[#F8F8F6] border border-[#D4D4CE] flex flex-col justify-between"
              style={{ borderRadius: '0px' }}
            >
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#3D7EFF]">
                Remaining Rights
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#3D7EFF] tracking-tight mt-1">
                {headerRemaining}
              </span>
              <span className="text-[11px] font-mono text-coolgray mt-1">
                Available to cast
              </span>
            </div>
          </div>
        </motion.div>

        {/* Active Proposals Section */}
        <div
          className="bg-white border border-[#D4D4CE] p-6 sm:p-8 shadow-sm space-y-6"
          style={{ borderRadius: '0px' }}
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#D4D4CE]">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#3D7EFF]">
                Active Ballots
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-charcoal tracking-tight mt-0.5">
                Active Governance Proposals
              </h2>
            </div>
            <span className="font-mono text-[10px] sm:text-[11px] text-coolgray uppercase tracking-widest hidden sm:inline">
              Consensus Engine
            </span>
          </div>

          {(!activeVotes || activeVotes.length === 0) ? (
            <div
              className="p-10 text-center bg-[#F8F8F6] border border-[#D4D4CE] space-y-3"
              style={{ borderRadius: '0px' }}
            >
              <Vote className="w-10 h-10 text-coolgray mx-auto" />
              <h4 className="text-base font-black text-charcoal">No Active Ballot Proposals</h4>
              <p className="text-xs text-coolgray font-mono max-w-md mx-auto">
                There are currently no active governance rounds open for voting. Please check back when a new restitution proposal is staged.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {activeVotes.map((vote) => {
                const { remaining: perRoundRemaining, total: perRoundTotal } = getVoteRights(vote);
                const hasVerifiedLoss = (user?.verifiedLoss || 0) > 0;
                const isRoundDisabled = vote.status !== 'active' || perRoundRemaining <= 0 || !hasVerifiedLoss;

                return (
                  <motion.div
                    key={vote.id}
                    id={`vote-${vote.id}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-[#D4D4CE] p-6 sm:p-7 hover:border-charcoal transition-all space-y-5"
                    style={{ borderRadius: '0px' }}
                  >
                    {/* Proposal Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className="p-2.5 bg-[#F8F8F6] border border-[#D4D4CE] text-[#3D7EFF] shrink-0"
                          style={{ borderRadius: '0px' }}
                        >
                          <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#3D7EFF]">
                            Proposal ID: #{String(vote.id).slice(-6).toUpperCase()}
                          </span>
                          <h3 className="text-lg sm:text-xl font-black text-charcoal tracking-tight mt-0.5">
                            {vote.title}
                          </h3>
                        </div>
                      </div>

                      {/* Time Remaining Badge */}
                      {vote.endTime && (
                        <div
                          className="p-2 px-3 bg-[#F8F8F6] border border-[#D4D4CE] flex items-center gap-2 self-start sm:self-auto"
                          style={{ borderRadius: '0px' }}
                        >
                          <Clock className="w-3.5 h-3.5 text-[#3D7EFF]" />
                          <span className="text-[11px] font-mono text-coolgray uppercase">Closes:</span>
                          <span className="font-mono font-bold text-xs text-charcoal">
                            {formatRemaining(vote.endTime)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Proposal Description */}
                    {vote.description && (
                      <p className="text-xs sm:text-sm text-coolgray leading-relaxed border-l-2 border-[#D4D4CE] pl-3 py-0.5">
                        {vote.description}
                      </p>
                    )}

                    {/* Options Grid */}
                    <div className="space-y-3">
                      {vote.options.map((opt) => {
                        const isSelected = selectedOptions[vote.id] === opt.id;
                        const displayedVotes = getDisplayedVotes(vote, opt);
                        const goalVotes = opt.targetVotes || 0;
                        const smoothDisplayed = getSmoothValue(vote, opt);
                        const smoothWidth = goalVotes > 0
                          ? Math.min(100, (smoothDisplayed / goalVotes) * 100)
                          : getSmoothProgress(vote, opt);

                        return (
                          <div key={opt.id} className="relative">
                            <button
                              type="button"
                              onClick={() => !isRoundDisabled && onSelectOption(vote, opt)}
                              disabled={isRoundDisabled}
                              className={`w-full p-4 border transition-all flex items-center justify-between relative overflow-hidden text-left cursor-pointer min-h-[48px] ${
                                isSelected
                                  ? 'border-[#3D7EFF] bg-[#F8F8F6] shadow-sm ring-1 ring-[#3D7EFF]'
                                  : 'border-[#D4D4CE] bg-white hover:border-charcoal'
                              } ${isRoundDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                              style={{ borderRadius: '0px' }}
                            >
                              {/* Background Progress Fill */}
                              <div
                                className="absolute left-0 top-0 bottom-0 bg-[#3D7EFF]/10 transition-all duration-700 pointer-events-none"
                                style={{ width: `${smoothWidth}%` }}
                              />

                              {/* Option Text & Checkmark */}
                              <div className="flex items-center gap-3 relative z-10 min-w-0 pr-4">
                                <div
                                  className={`w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${
                                    isSelected
                                      ? 'border-[#3D7EFF] bg-[#3D7EFF] text-white'
                                      : 'border-[#D4D4CE] bg-white'
                                  }`}
                                  style={{ borderRadius: '0px' }}
                                >
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <span className="font-bold text-charcoal text-xs sm:text-sm break-words line-clamp-2">
                                  {opt.text}
                                </span>
                              </div>

                              {/* Votes Numbers */}
                              <div className="text-right relative z-10 shrink-0 font-mono">
                                <span className="text-xs sm:text-sm font-black text-charcoal block">
                                  {displayedVotes.toLocaleString()}
                                </span>
                                <span className="text-[10px] text-coolgray uppercase">
                                  {Math.round(smoothWidth)}% votes
                                </span>
                              </div>
                            </button>

                            {/* Hairline Bottom Indicator */}
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-transparent overflow-hidden pointer-events-none">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${smoothWidth}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="h-full bg-[#3D7EFF]"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer Bar: Quorum Info & Submit Button */}
                    <div className="pt-4 border-t border-[#D4D4CE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs font-mono text-coolgray">
                        <span>Your round allowance: </span>
                        <strong className="text-charcoal font-black">{perRoundRemaining}</strong>
                        <span> of {perRoundTotal} remaining</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSubmitVote(vote)}
                        disabled={
                          selectedOptions[vote.id] == null ||
                          vote.status !== 'active' ||
                          perRoundRemaining <= 0 ||
                          submittingVoteId === vote.id
                        }
                        className="w-full sm:w-auto px-6 py-3 bg-[#3D7EFF] hover:bg-electric-600 text-white font-mono font-bold text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
                        style={{ borderRadius: '0px' }}
                      >
                        <Vote className="w-4 h-4" />
                        <span>
                          {submittingVoteId === vote.id ? 'Submitting Vote...' : 'Submit Consensus Vote'}
                        </span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Voting;
