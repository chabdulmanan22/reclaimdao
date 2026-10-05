import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Vote,
  Coins,
  Users,
  Settings,
  Copy,
  Eye,
  EyeOff,
  LogOut,
  User,
  Lock,
  Clock,
  Timer
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
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
        // In development, if we are on port 3006, the server is on 3000
        let host = window.location.host;
        if (host.includes(':3006')) {
          host = host.replace('3006', '3000');
        } else if (window.location.hostname === 'localhost' && !host.includes(':')) {
          // If just localhost (unlikely without port), assume 3000? No, usually has port.
          // If we are in production build served by express, host is correct.
        }

        const url = process.env.REACT_APP_WS_URL || `${protocol}//${host}/ws`;
        console.log('Connecting to WebSocket at:', url);
        ws = new WebSocket(url);

        ws.onopen = () => {
          console.log('WebSocket connected');
          reconnectAttempts = 0;
        };

        ws.onmessage = (ev) => {
          try {
            const payload = JSON.parse(ev.data);
            console.log('Dashboard received WebSocket event:', payload.type);
            if (payload && payload.type) {
              if (payload.type === 'vote_created_notification') {
                // Also refresh data
                load();
              }
              // Match all user-related events (including admin overrides)
              if (/user_(vote|contribution|referral|points|voting|status|updated|registered|deleted|overrides|voting_updated)/i.test(payload.type)) {
                console.log('Dashboard: Reloading due to user event:', payload.type);
                load();
              }
              // Match vote status changes and updates
              if (/vote_(started|paused|resumed|completed|created|updated|deleted)/i.test(payload.type)) {
                console.log('Dashboard: Reloading due to vote event:', payload.type);
                load();
              }
              // Match contribution status changes
              if (/contribution_(approved|rejected|verified)/i.test(payload.type)) {
                console.log('Dashboard: Reloading due to contribution event:', payload.type);
                load();
              }
              // Also match general users_updated events
              if (/users?_(updated|fetched)/i.test(payload.type)) {
                console.log('Dashboard: Reloading due to users event:', payload.type);
                load();
              }
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          ws = null;
          // Attempt to reconnect
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            reconnectTimeout = setTimeout(() => {
              connectWebSocket();
            }, Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)); // Exponential backoff, max 30s
          }
        };
      } catch (err) {
        console.error('Error creating WebSocket connection:', err);
      }
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

  const handleVote = () => {
    navigate('/voting');
  };

  const handleContribute = () => {
    navigate('/contribute');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditProfile = () => {
    navigate('/profile?edit=1');
  };
  const openResetPassword = () => {
    setResetEmail(user?.email || '');
    setShowResetPassword(true);
  };
  const dashSendOtp = async () => {
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
  const dashChangePasswordWithOtp = async () => {
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
      toast.success('Password changed. You can log in now');
      setShowResetPassword(false);
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


  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-[#0d0c43] text-xl font-bold">Loading...</div>
      </div>
    );
  }

  const dashCountUsed = (vote) => {
    if (vote.myVotingRights) {
      return vote.myVotingRights.used;
    }
    // Fallback if myVotingRights is missing (e.g. not populated correctly or older API)
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
    <div className="min-h-screen bg-[#f8fafc] py-6">
      {/* Top Full-Width Header & Spam Banner Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1700px] mx-auto space-y-4 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-left w-full"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, <span className="text-[#A85830]">{user?.firstName}</span>!
          </h1>
        </motion.div>

        {/* Full-Width Spam Notification Banner */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#0a254d] border border-sky-400/25 rounded-2xl p-4 shadow-sm flex items-start gap-3.5 w-full"
        >
          <div className="p-2 bg-[#A85830]/20 text-[#A85830] rounded-xl shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#A85830]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-white text-sm md:text-base font-bold py-1">
            If our emails have landed in your spam or junk folder, please mark them as “Not Spam” to ensure you receive future restitution updates.
          </p>
        </motion.div>
      </div>

      {/* Cards Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

        {/* Active Votes Notifications */}
        {activeVotes && activeVotes.length > 0 && (
          <div className="space-y-4">
            {activeVotes.map((vote) => (
              <motion.div
                key={vote._id || vote.id || Math.random()}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#0a254d] text-white rounded-2xl shadow-xl border-l-4 border-[#A85830] overflow-hidden flex flex-col md:flex-row items-center justify-between p-4 sm:p-5 border border-sky-400/25"
              >
                <div className="flex items-center gap-4 mb-4 md:mb-0 w-full md:w-auto">
                  <div className="p-3 bg-[#A85830]/15 text-[#A85830] rounded-xl shrink-0 border border-[#A85830]/30">
                    <Vote className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white">{vote.title || 'New Vote Created!'}</h4>
                    <p className="text-sm text-white font-semibold">A new proposal needs your attention</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-between">
                  <div className="text-sm flex flex-col gap-1 items-start md:items-end w-full sm:w-auto">
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <Clock className="w-4 h-4 text-sky-400" />
                      <span>Starts: {vote.startTime ? new Date(vote.startTime).toLocaleString() : 'Now'}</span>
                    </div>
                    {vote.endTime && (
                      <div className="flex items-center gap-2 text-white font-semibold">
                        <Timer className="w-4 h-4 text-[#A85830]" />
                        <span>Ends: {new Date(vote.endTime).toLocaleString()}</span>
                        <span className="ml-2 font-mono font-bold text-[#A85830] bg-[#A85830]/15 px-2.5 py-0.5 rounded-full border border-[#A85830]/30">
                          <LiveTimer endTime={vote.endTime} />
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/voting?voteId=${vote._id || vote.id}`)}
                    className="px-6 py-2.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto shadow-lg shadow-[#A85830]/25 transition-all cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #A85830 0%, #964d28 50%, #854221 100%)' }}
                  >
                    Vote Now <Vote className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/voting')}
            className="bg-[#0a254d] hover:bg-[#0d2f61] text-white rounded-2xl p-6 border border-sky-400/25 hover:border-sky-400/50 shadow-xl transition-all duration-300 group text-left cursor-pointer"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="p-3.5 sm:p-4 bg-[#A85830]/15 border border-[#A85830]/30 rounded-xl mr-4 shadow-sm text-[#A85830] group-hover:scale-105 transition-transform">
                  <Vote className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">VOTE</h3>
                  <p className="text-white font-bold text-sm sm:text-base">Provide feedback on refunds and vote on decisions.</p>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-[#A85830] font-bold text-sm sm:text-base">
                  Active rounds: {activeRoundsCount}
                </div>
                <p className="text-white font-bold text-xs sm:text-sm mt-0.5">Voting status</p>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Loss & Restitution Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <span>Restitution <span className="text-[#A85830]">Status</span></span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-[#0a254d] text-white border border-sky-400/25 rounded-2xl p-6 shadow-xl">
              <h4 className="text-white font-bold mb-2 text-sm sm:text-base">Verified Loss</h4>
              <div className="text-2xl sm:text-3xl font-black text-white">
                ${verifiedLoss.toLocaleString()}
              </div>
            </div>
            <div className="bg-[#0a254d] text-white border border-sky-400/25 rounded-2xl p-6 shadow-xl">
              <h4 className="text-white font-bold mb-2 text-sm sm:text-base">Unverified Loss</h4>
              <div className="text-2xl sm:text-3xl font-black text-white">
                ${unverifiedLoss.toLocaleString()}
              </div>
            </div>
            <div className="bg-[#0a254d] text-white border border-sky-400/25 rounded-2xl p-6 shadow-xl">
              <h4 className="text-white font-bold mb-2 text-sm sm:text-base">Amount Restituted</h4>
              <div className="text-2xl sm:text-3xl font-black text-[#10b981]">
                ${amountRestituted.toLocaleString()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Your Stats & Activity (Live) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">Your <span className="text-[#A85830]">Stats</span></h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="rounded-2xl p-6 text-white transition-all duration-300 bg-[#0a254d] shadow-xl border border-sky-400/25">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-bold text-sm sm:text-base">Leaderboard Ranking</h4>
                <Trophy className="w-5 h-5 text-[#A85830]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">#{userRank || 1}</span>
                <span className="text-xs text-white bg-[#A85830] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Top Tier</span>
              </div>
              <p className="text-white font-semibold text-xs mt-1">Global standing in the ecosystem</p>
            </div>
            <div className="bg-[#0a254d] text-white border border-sky-400/25 rounded-2xl p-6 shadow-xl">
              <h4 className="text-white font-bold mb-2 text-sm sm:text-base">Voting Rights</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white font-bold">Allowed:</span>
                  <span className="text-white font-extrabold">{dashAllowed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white font-bold">Used:</span>
                  <span className="text-white font-extrabold">{dashUsed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white font-bold">Remaining:</span>
                  <span className="text-[#10b981] font-extrabold">{dashRemaining}</span>
                </div>
              </div>
            </div>
            <div className="bg-[#0a254d] text-white border border-sky-400/25 rounded-2xl p-6 shadow-xl">
              <h4 className="text-white font-bold mb-2 text-sm sm:text-base">Voting Rounds</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white font-bold">Active Rounds:</span>
                  <span className="text-white font-extrabold">{activeRoundsCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white font-bold">Total Points:</span>
                  <span className="text-[#A85830] font-black">{totalPoints.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="bg-[#0a254d] text-white border border-sky-400/25 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-bold text-sm sm:text-base">Referral Points</h4>
                <Users className="w-5 h-5 text-sky-400" />
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-black text-sky-300">{pointsReferral.toLocaleString()}</div>
                <p className="text-white font-bold text-xs">Real points from invited users (+10 each)</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Your Recent Activity</h4>
            <div className="bg-[#0a254d] text-white border border-sky-400/25 rounded-2xl p-5 shadow-xl space-y-2 max-h-48 overflow-y-auto">
              {recentActivity.length === 0 ? (
                <div className="py-6 px-4 text-center">
                  <p className="text-white font-bold text-base sm:text-lg md:text-xl tracking-wide">No recent activity.</p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="bg-[#071d3d] rounded-xl p-3 border border-sky-400/20">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm font-bold">{activity.message}</span>
                      <span className="text-white font-bold text-xs">{new Date(activity.time).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-white font-semibold text-xs mt-0.5">{activity.type}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Settings Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">Account <span className="text-[#A85830]">Settings</span></h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <button onClick={handleEditProfile} className="flex items-center p-6 bg-[#0a254d] text-white border border-sky-400/25 rounded-2xl hover:border-[#A85830]/50 shadow-xl transition-all group text-left cursor-pointer">
              <User className="w-6 h-6 text-sky-400 mr-4 group-hover:scale-110 transition-transform shrink-0" />
              <div>
                <h4 className="text-white font-bold text-base">Edit Profile</h4>
                <p className="text-white font-bold text-xs sm:text-sm mt-0.5">Update your information</p>
              </div>
            </button>
            <button onClick={openResetPassword} className="flex items-center p-6 bg-[#0a254d] text-white border border-sky-400/25 rounded-2xl hover:border-[#A85830]/50 shadow-xl transition-all group text-left cursor-pointer">
              <Lock className="w-6 h-6 text-sky-400 mr-4 group-hover:scale-110 transition-transform shrink-0" />
              <div>
                <h4 className="text-white font-bold text-base">Reset Password</h4>
                <p className="text-white font-bold text-xs sm:text-sm mt-0.5">Change security key</p>
              </div>
            </button>
            <button onClick={handleLogout} className="flex items-center p-6 bg-[#0a254d] text-white border border-sky-400/25 rounded-2xl hover:border-[#ec4e70]/50 shadow-xl transition-all group text-left cursor-pointer">
              <LogOut className="w-6 h-6 text-[#ec4e70] mr-4 group-hover:scale-110 transition-transform shrink-0" />
              <div>
                <h4 className="text-white font-bold text-base">Sign Out</h4>
                <p className="text-white font-bold text-xs sm:text-sm mt-0.5">End session</p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>

      {showResetPassword && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a254d] border border-sky-400/30 rounded-3xl p-8 w-full max-w-md shadow-2xl"
          >
            <h2 className="text-2xl font-black text-white mb-4">Reset <span className="text-[#A85830]">Password</span></h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#061833] border border-sky-400/30 text-white focus:outline-none focus:border-[#A85830]"
                  placeholder="Enter your email"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={dashSendOtp}
                  disabled={sendingOtp}
                  className="px-4 py-2.5 rounded-xl font-bold text-white shadow-lg disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #A85830 0%, #964d28 50%, #854221 100%)' }}
                >
                  {sendingOtp ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">OTP Code</label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#061833] border border-sky-400/30 text-white focus:outline-none focus:border-[#A85830]"
                  placeholder="Enter 6-digit OTP"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#061833] border border-sky-400/30 text-white focus:outline-none focus:border-[#A85830]"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#061833] border border-sky-400/30 text-white focus:outline-none focus:border-[#A85830]"
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowResetPassword(false)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={dashChangePasswordWithOtp}
                  disabled={changingPwd}
                  className="px-5 py-2.5 rounded-xl font-bold text-white shadow-lg disabled:opacity-50 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #A85830 0%, #964d28 50%, #854221 100%)' }}
                >
                  {changingPwd ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
