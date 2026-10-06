import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Vote,
  Coins,
  Users,
  Copy,
  Clock,
  Timer,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getUserMeta, getActivityLog, getActiveVotes as dsGetActiveVotes } from '../utils/datastore';

const LiveTimer = ({ endTime, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (!endTime) return;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft('Ended');
        clearInterval(interval);
        if (onExpire) onExpire();
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      let str = '';
      if (days > 0) str += `${days}d `;
      str += `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      setTimeLeft(str);
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime, onExpire]);

  if (!endTime) return null;
  return <span>{timeLeft}</span>;
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [totalPoints, setTotalPoints] = useState(0);
  const [pointsVoting, setPointsVoting] = useState(0);
  const [pointsContribution, setPointsContribution] = useState(0);
  const [pointsReferral, setPointsReferral] = useState(0);
  const [votesAllowed, setVotesAllowed] = useState(0);
  const [votesUsed, setVotesUsed] = useState(0);
  const [activeRoundsCount, setActiveRoundsCount] = useState(0);
  const [activeVotes, setActiveVotes] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [verifiedLoss, setVerifiedLoss] = useState(0);
  const [unverifiedLoss, setUnverifiedLoss] = useState(0);
  const [amountRestituted, setAmountRestituted] = useState(0);
  const [userRank, setUserRank] = useState(0);

  // Load live user dashboard data
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const me = await axios.get('/api/auth/me', { headers });
        const u = me.data?.user || me.data?.data?.user || {};
        setTotalPoints(u.points || 0);
        setPointsVoting(u.stats?.votingPoints || 0);
        setPointsContribution(u.stats?.contributionPoints || 0);
        setPointsReferral(u.stats?.referralPoints || 0);
        setVotesAllowed(u.votingRights || 0);
        setVotesUsed(u.stats?.totalVotes || 0);
        setVerifiedLoss(u.verifiedLoss || 0);
        setUnverifiedLoss(u.unverifiedLoss || 0);
        setAmountRestituted(u.amountRestituted || 0);
        let rankVal = u.rank || u.overrides?.rankOverride;
        if (!rankVal || rankVal === 0) {
          try {
            const lbRes = await axios.get('/api/users/leaderboard?limit=100', { headers });
            const lbUsers = lbRes.data?.data?.users || lbRes.data?.data?.leaderboard || [];
            const myEmail = (u.email || user?.email || '').toLowerCase();
            const idx = lbUsers.findIndex(usr => (usr.email || '').toLowerCase() === myEmail);
            if (idx !== -1) {
              rankVal = lbUsers[idx].rank || lbUsers[idx].displayRank || (idx + 1);
            }
          } catch (_) {}
        }
        setUserRank(rankVal || 1);
        try {
          const vr = await axios.get('/api/votes', { params: { status: 'active', limit: 200 }, headers });
          const votes = vr.data?.data?.votes || [];
          setActiveRoundsCount(votes.length || 0);
          setActiveVotes(votes);
        } catch {
          setActiveRoundsCount(0);
          setActiveVotes([]);
        }
        const activity = getActivityLog().filter((a) => a.userEmail === (u.email || user.email));
        setRecentActivity(activity.slice(0, 10));
      } catch (_) {
        // fallback to local meta
        if (user?.email) {
          const meta = getUserMeta(user.email);
          setTotalPoints(meta.points || 0);
          setPointsVoting(meta.pointsVoting || 0);
          setPointsContribution(meta.pointsContribution || 0);
          setPointsReferral(meta.pointsReferral || 0);
          setVotesAllowed(meta.votesAllowed || 0);
          setVotesUsed(meta.votesUsed || 0);
          setVerifiedLoss(user?.verifiedLoss || 0);
          setUnverifiedLoss(user?.unverifiedLoss || 0);
          setAmountRestituted(user?.amountRestituted || 0);
          setUserRank(user?.rank || 1);
          const dsVotes = dsGetActiveVotes();
          setActiveRoundsCount(dsVotes.length);
          setActiveVotes(dsVotes);
          const activity = getActivityLog().filter((a) => a.userEmail === user.email);
          setRecentActivity(activity.slice(0, 10));
        }
      }
    };
    load();
    const onUpdate = () => load();
    window.addEventListener('datastore:update', onUpdate);

    // WebSocket connection with reconnection logic
    let ws = null;
    let reconnectTimeout = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        let host = window.location.host;
        if (host.includes(':3006')) {
          host = host.replace('3006', '3000');
        }

        const url = process.env.REACT_APP_WS_URL || `${protocol}//${host}/ws`;
        ws = new WebSocket(url);

        ws.onopen = () => {
          reconnectAttempts = 0;
        };

        ws.onmessage = (ev) => {
          try {
            const payload = JSON.parse(ev.data);
            if (payload && payload.type) {
              if (payload.type === 'vote_created_notification') {
                load();
              }
              if (/user_(vote|contribution|referral|points|voting|status|updated|registered|deleted|overrides|voting_updated)/i.test(payload.type)) {
                load();
              }
              if (/vote_(started|paused|resumed|completed|created|updated|deleted)/i.test(payload.type)) {
                load();
              }
              if (/contribution_(approved|rejected|verified)/i.test(payload.type)) {
                load();
              }
              if (/users?_(updated|fetched)/i.test(payload.type)) {
                load();
              }
            }
          } catch (err) {}
        };

        ws.onclose = () => {
          ws = null;
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            reconnectTimeout = setTimeout(() => {
              connectWebSocket();
            }, Math.min(1000 * Math.pow(2, reconnectAttempts), 30000));
          }
        };
      } catch (err) {}
    };

    connectWebSocket();

    return () => {
      window.removeEventListener('datastore:update', onUpdate);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        ws.close();
        ws = null;
      }
    };
  }, [user?.email]);

  const copyReferralCode = () => {
    if (!user?.referralCode) {
      toast.error('Referral code not available');
      return;
    }
    const link = `${window.location.origin}/home?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied to clipboard!');
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

  const dashCountUsed = (vote) => {
    if (vote.myVotingRights) {
      return vote.myVotingRights.used;
    }
    const submissions = vote.submissions;
    const dashUserIds = [
      user?.email,
      user?._id,
      user?.id,
      String(user?._id || ''),
      String(user?.id || '')
    ].filter(Boolean);
    const seen = new Set();
    let total = 0;
    for (const k of dashUserIds) {
      if (seen.has(k)) continue;
      seen.add(k);
      total += Number(submissions?.[k] || 0);
    }
    return total;
  };

  const dashAllowedSum = (activeVotes || []).reduce((sum, v) => {
    if (v.myVotingRights && typeof v.myVotingRights.total === 'number') {
      return sum + v.myVotingRights.total;
    }
    const dashUserIds = [
      user?.email,
      user?._id,
      user?.id,
      String(user?._id || ''),
      String(user?.id || '')
    ].filter(Boolean);
    let offset = 0;
    if (v.overrides) {
      for (const uid of dashUserIds) {
        if (v.overrides[uid] !== undefined) {
          offset = Number(v.overrides[uid]);
          break;
        }
      }
    }
    const base = Number(v.maxVotesPerUser) || Number(votesAllowed) || 1;
    return sum + Math.max(0, base + offset);
  }, 0);

  const dashUsedSum = (activeVotes || []).reduce((sum, v) => sum + dashCountUsed(v), 0);
  const dashAllowed = (activeVotes && activeVotes.length > 0) ? dashAllowedSum : (votesAllowed || 0);
  const dashUsed = (activeVotes && activeVotes.length > 0) ? dashUsedSum : (votesUsed || 0);
  const dashRemaining = Math.max(0, dashAllowed - dashUsed);

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-charcoal py-6 sm:py-10 md:py-12 selection:bg-[#3D7EFF] selection:text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

        {/* Top Header Section (No Card for the Spam statement) */}
        <div className="space-y-2 border-b border-[#D4D4CE] pb-6">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#D4D4CE] text-charcoal text-[11px] font-mono font-bold uppercase tracking-wider shadow-sm"
            style={{ borderRadius: '0px' }}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#3D7EFF]" />
            <span>Decentralized Restitution Protocol • Claimant Telemetry</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-charcoal tracking-tight break-words">
            Welcome back, <span className="text-[#3D7EFF]">{user?.firstName}</span>!
          </h1>

          {/* Spam Notice: Simple typography without any card container */}
          <p className="text-coolgray text-xs sm:text-sm font-mono mt-1.5 leading-relaxed">
            <span className="text-[#3D7EFF] font-bold">ℹ NOTICE:</span> If our emails have landed in your spam or junk folder, please mark them as <strong className="text-charcoal font-bold">"Not Spam"</strong> to ensure you receive future restitution updates.
          </p>
        </div>

        {/* Active Votes Banner (If Active Votes Exist) */}
        {activeVotes && activeVotes.length > 0 && (
          <div className="space-y-4">
            {activeVotes.map((vote) => (
              <motion.div
                key={vote._id || vote.id || Math.random()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white text-charcoal border-l-4 border-l-[#3D7EFF] border border-[#D4D4CE] shadow-sm p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                style={{ borderRadius: '0px' }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="p-3 bg-[#F8F8F6] border border-[#D4D4CE] text-[#3D7EFF] shrink-0"
                    style={{ borderRadius: '0px' }}
                  >
                    <Vote className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#3D7EFF] mb-0.5">
                      <span>Active Ballot Round</span>
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-charcoal">{vote.title || 'New Vote Created!'}</h4>
                    <p className="text-xs text-coolgray font-medium">A protocol disbursement proposal requires your consensus</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto justify-between shrink-0">
                  <div className="text-xs font-mono flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-charcoal font-medium">
                      <Clock className="w-3.5 h-3.5 text-coolgray" />
                      <span>Starts: {vote.startTime ? new Date(vote.startTime).toLocaleString() : 'Now'}</span>
                    </div>
                    {vote.endTime && (
                      <div className="flex items-center gap-2 text-charcoal font-bold">
                        <Timer className="w-3.5 h-3.5 text-[#3D7EFF]" />
                        <span>Ends: {new Date(vote.endTime).toLocaleString()}</span>
                        <span className="font-mono text-[11px] text-[#3D7EFF] bg-[#3D7EFF]/10 px-2 py-0.5 border border-[#3D7EFF]/30">
                          <LiveTimer endTime={vote.endTime} />
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/voting?voteId=${vote._id || vote.id}`)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#3D7EFF] hover:bg-electric-600 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                    style={{ borderRadius: '0px' }}
                  >
                    <span>Vote Now</span>
                    <Vote className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* 
          PRIMARY 4 CARDS IN ONE ROW (EXACT SAME SIZE & HEIGHT):
          Card 1: VOTE (First)
          Card 2: Verified Loss
          Card 3: Unverified Loss
          Card 4: Amount Restituted
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">

          {/* CARD 1: VOTE (First Card) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate('/voting')}
            className="bg-white border border-[#D4D4CE] p-6 shadow-sm flex flex-col justify-between hover:border-[#3D7EFF] transition-all cursor-pointer group h-full"
            style={{ borderRadius: '0px' }}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#D4D4CE]">
                <span className="font-mono text-[11px] font-bold text-[#3D7EFF] uppercase tracking-wider">
                  Governance & Voting
                </span>
                <div
                  className="p-2 bg-[#F8F8F6] border border-[#D4D4CE] text-[#3D7EFF] group-hover:bg-[#3D7EFF] group-hover:text-white transition-colors"
                  style={{ borderRadius: '0px' }}
                >
                  <Vote className="w-4 h-4" />
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-charcoal tracking-tight mt-4">
                VOTE
              </h3>

              <p className="text-xs text-coolgray font-medium mt-1.5 leading-relaxed">
                Provide feedback on restitution disbursements and vote on active decisions.
              </p>
            </div>

            <div className="pt-4 mt-6 border-t border-[#D4D4CE] flex items-center justify-between text-xs font-mono">
              <span className="text-charcoal font-bold">
                Active: {activeRoundsCount} Rounds
              </span>
              <span className="text-[#3D7EFF] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Vote Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </motion.div>

          {/* CARD 2: VERIFIED LOSS */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="bg-white border border-[#D4D4CE] p-6 shadow-sm flex flex-col justify-between h-full"
            style={{ borderRadius: '0px' }}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#D4D4CE]">
                <span className="font-mono text-[11px] font-bold text-coolgray uppercase tracking-wider">
                  Restitution Status
                </span>
                <div
                  className="p-2 bg-[#F8F8F6] border border-[#D4D4CE] text-charcoal"
                  style={{ borderRadius: '0px' }}
                >
                  <ShieldCheck className="w-4 h-4 text-[#3D7EFF]" />
                </div>
              </div>

              <h4 className="text-xs font-mono font-bold text-coolgray uppercase tracking-wider mt-4">
                Verified Loss
              </h4>

              <div className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight mt-1">
                ${verifiedLoss.toLocaleString()}
              </div>

              <p className="text-xs text-coolgray font-medium mt-1.5 leading-relaxed">
                Confirmed forensic damage audited through protocol evidentiary ingestion.
              </p>
            </div>

            <div className="pt-4 mt-6 border-t border-[#D4D4CE] flex items-center justify-between text-xs font-mono">
              <span className="text-coolgray">Status</span>
              <span
                className="text-charcoal font-bold bg-[#F8F8F6] px-2 py-0.5 border border-[#D4D4CE]"
                style={{ borderRadius: '0px' }}
              >
                Audited
              </span>
            </div>
          </motion.div>

          {/* CARD 3: UNVERIFIED LOSS */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white border border-[#D4D4CE] p-6 shadow-sm flex flex-col justify-between h-full"
            style={{ borderRadius: '0px' }}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#D4D4CE]">
                <span className="font-mono text-[11px] font-bold text-coolgray uppercase tracking-wider">
                  Restitution Status
                </span>
                <div
                  className="p-2 bg-[#F8F8F6] border border-[#D4D4CE] text-coolgray"
                  style={{ borderRadius: '0px' }}
                >
                  <Clock className="w-4 h-4 text-coolgray" />
                </div>
              </div>

              <h4 className="text-xs font-mono font-bold text-coolgray uppercase tracking-wider mt-4">
                Unverified Loss
              </h4>

              <div className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight mt-1">
                ${unverifiedLoss.toLocaleString()}
              </div>

              <p className="text-xs text-coolgray font-medium mt-1.5 leading-relaxed">
                Supplemental claims currently pending transaction hash & KYC verification.
              </p>
            </div>

            <div className="pt-4 mt-6 border-t border-[#D4D4CE] flex items-center justify-between text-xs font-mono">
              <span className="text-coolgray">Review</span>
              <span
                className="text-coolgray font-bold bg-[#F8F8F6] px-2 py-0.5 border border-[#D4D4CE]"
                style={{ borderRadius: '0px' }}
              >
                Under Review
              </span>
            </div>
          </motion.div>

          {/* CARD 4: AMOUNT RESTITUTED */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="bg-white border border-[#D4D4CE] p-6 shadow-sm flex flex-col justify-between h-full"
            style={{ borderRadius: '0px' }}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#D4D4CE]">
                <span className="font-mono text-[11px] font-bold text-[#3D7EFF] uppercase tracking-wider">
                  Restitution Status
                </span>
                <div
                  className="p-2 bg-[#3D7EFF]/10 border border-[#3D7EFF]/30 text-[#3D7EFF]"
                  style={{ borderRadius: '0px' }}
                >
                  <Coins className="w-4 h-4 text-[#3D7EFF]" />
                </div>
              </div>

              <h4 className="text-xs font-mono font-bold text-coolgray uppercase tracking-wider mt-4">
                Amount Restituted
              </h4>

              <div className="text-2xl sm:text-3xl font-black text-[#3D7EFF] tracking-tight mt-1">
                ${amountRestituted.toLocaleString()}
              </div>

              <p className="text-xs text-coolgray font-medium mt-1.5 leading-relaxed">
                Settlement funds disbursed directly through on-chain restitution escrow.
              </p>
            </div>

            <div className="pt-4 mt-6 border-t border-[#D4D4CE] flex items-center justify-between text-xs font-mono">
              <span className="text-coolgray">Disbursement</span>
              <span
                className="text-[#3D7EFF] font-bold bg-[#3D7EFF]/10 px-2 py-0.5 border border-[#3D7EFF]/30"
                style={{ borderRadius: '0px' }}
              >
                Disbursed
              </span>
            </div>
          </motion.div>

        </div>

        {/* Your Stats Section (Swiss Architectural Style) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#D4D4CE] p-6 sm:p-8 shadow-sm space-y-6"
          style={{ borderRadius: '0px' }}
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#D4D4CE]">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#3D7EFF]">
                Claimant Metrics
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-charcoal tracking-tight mt-0.5">
                Your <span className="text-[#3D7EFF]">Stats</span>
              </h3>
            </div>
            <div
              className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal bg-[#F8F8F6] border border-[#D4D4CE] px-2.5 py-1"
              style={{ borderRadius: '0px' }}
            >
              Realtime Telemetry
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Stat 1: Leaderboard Ranking */}
            <div
              className="p-5 bg-[#F8F8F6] border border-[#D4D4CE] flex flex-col justify-between space-y-4"
              style={{ borderRadius: '0px' }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-coolgray uppercase tracking-wider">
                  Ranking
                </span>
                <Trophy className="w-4 h-4 text-[#3D7EFF]" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-charcoal">#{userRank || 1}</span>
                  <span
                    className="text-[10px] font-mono font-bold text-white bg-charcoal px-2 py-0.5 uppercase tracking-wider"
                    style={{ borderRadius: '0px' }}
                  >
                    Top Tier
                  </span>
                </div>
                <p className="text-[11px] font-mono text-coolgray mt-1">Community standing</p>
              </div>
            </div>

            {/* Stat 2: Voting Rights */}
            <div
              className="p-5 bg-[#F8F8F6] border border-[#D4D4CE] flex flex-col justify-between space-y-4"
              style={{ borderRadius: '0px' }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-coolgray uppercase tracking-wider">
                  Voting Rights
                </span>
                <Vote className="w-4 h-4 text-[#3D7EFF]" />
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-coolgray">Allowed:</span>
                  <span className="text-charcoal font-bold">{dashAllowed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-coolgray">Used:</span>
                  <span className="text-charcoal font-bold">{dashUsed}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#D4D4CE]">
                  <span className="text-charcoal font-bold">Remaining:</span>
                  <span className="text-[#3D7EFF] font-bold">{dashRemaining}</span>
                </div>
              </div>
            </div>

            {/* Stat 3: Voting Rounds & Points */}
            <div
              className="p-5 bg-[#F8F8F6] border border-[#D4D4CE] flex flex-col justify-between space-y-4"
              style={{ borderRadius: '0px' }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-coolgray uppercase tracking-wider">
                  Rounds & Points
                </span>
                <Activity className="w-4 h-4 text-[#3D7EFF]" />
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-coolgray">Active Rounds:</span>
                  <span className="text-charcoal font-bold">{activeRoundsCount}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#D4D4CE]">
                  <span className="text-charcoal font-bold">Total Points:</span>
                  <span className="text-[#3D7EFF] font-bold">{totalPoints.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Stat 4: Referral Points */}
            <div
              className="p-5 bg-[#F8F8F6] border border-[#D4D4CE] flex flex-col justify-between space-y-4"
              style={{ borderRadius: '0px' }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-coolgray uppercase tracking-wider">
                  Referral Points
                </span>
                <Users className="w-4 h-4 text-[#3D7EFF]" />
              </div>
              <div>
                <div className="text-2xl font-black text-charcoal">
                  {pointsReferral.toLocaleString()}
                </div>
                <button
                  type="button"
                  onClick={copyReferralCode}
                  className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#3D7EFF] hover:underline cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Invite Link</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity Stream */}
          <div className="pt-4 border-t border-[#D4D4CE]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#3D7EFF]" />
                <span>Recent Activity Log</span>
              </h4>
              <span className="font-mono text-[10px] text-coolgray uppercase tracking-widest">
                Immutable Ledger
              </span>
            </div>

            <div
              className="bg-[#F8F8F6] border border-[#D4D4CE] p-3 sm:p-4 max-h-56 overflow-y-auto space-y-2"
              style={{ borderRadius: '0px' }}
            >
              {recentActivity.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="font-mono text-xs text-coolgray uppercase tracking-wider">
                    No recent events recorded in session ledger.
                  </p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-3 bg-white border border-[#D4D4CE] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 text-xs"
                    style={{ borderRadius: '0px' }}
                  >
                    <div className="min-w-0 pr-1">
                      <p className="font-bold text-charcoal break-words">{activity.message}</p>
                      <p className="font-mono text-[10px] text-coolgray uppercase tracking-wider mt-0.5">{activity.type}</p>
                    </div>
                    <span className="font-mono text-[10px] sm:text-[11px] text-coolgray shrink-0 self-start sm:self-auto">
                      {new Date(activity.time).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Dashboard;
