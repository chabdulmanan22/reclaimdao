import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Users,
  Award,
  Star,
  Target,
  Calendar,
  Filter,
  Search,
  ChevronUp,
  ChevronDown,
  User,
  Coins,
  Vote
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { getUsersList, getUserMeta, getReceipts } from '../utils/datastore';
import toast from 'react-hot-toast';


let _cachedLeaderboard = null;
let _cachedStats = {
  totalUsers: 0,
  activeUsers: 0,
  totalPoints: 0,
  averagePoints: 0
};
let _cachedUserRank = null;

const Leaderboard = () => {
  const { user } = useContext(AuthContext);
  const [leaderboard, setLeaderboard] = useState(_cachedLeaderboard || []);
  const [userRank, setUserRank] = useState(_cachedUserRank || null);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('all');
  const [baseUserCount, setBaseUserCount] = useState(0);
  const [category, setCategory] = useState('total');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(_cachedStats);
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef(0);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe, category, currentPage]);

  // Real-time updates disabled for ranks

  const fetchLeaderboard = async () => {
    try {
      if (fetchingRef.current) return;
      fetchingRef.current = true;


      // Fetch base user count setting
      try {
        const baseRes = await axios.get('/api/settings/BASE_USER_COUNT');
        if (baseRes.data?.success && baseRes.data?.data?.value) {
          setBaseUserCount(Number(baseRes.data.data.value));
        }
      } catch (e) { }

      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const typeParam = category === 'contributions' ? 'contributions' : category;
      const res = await axios.get('/api/users/leaderboard', { params: { limit: 50, type: typeParam }, headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      const rawList = res?.data?.data?.users || res?.data?.data?.leaderboard || [];
      const apiList = rawList.filter(u => u.role !== 'admin' && u.email !== 'support@reclaimdao.org' && u.email !== 'support@veritasaid.com');
      let data = apiList.map(u => ({
        _id: u._id || u.email,
        username: (u.email || '').split('@')[0],
        firstName: u.firstName || ((u.email || '').split('@')[0]),
        lastName: u.lastName || '',
        email: u.email,
        role: u.role,
        points: {
          total: u.points || 0,
          voting: u.stats?.votingPoints || 0,
          contributions: u.stats?.contributionPoints || 0,
        },
        stats: {
          totalVotes: u.stats?.totalVotes || 0,
          totalContributions: u.stats?.totalContributions || 0,
        },
        createdAt: u.createdAt || new Date().toISOString(),
        lastActivity: u.lastLogin || u.updatedAt || u.createdAt || new Date().toISOString(),
        profileImage: null,
        fullName: u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || (u.email || '').split('@')[0],
        badges: [],
        rank: u.rank,
        rankOverride: u.overrides?.rankOverride,
      }));

      // Sync current user points with dashboard state
      if (user && user.email) {
        data = data.map(u => {
          if (u.email === user.email) {
            return {
              ...u,
              points: {
                total: user.points || 0,
                voting: user.stats?.votingPoints || 0,
                contributions: user.stats?.contributionPoints || 0,
              }
            };
          }
          return u;
        });
      }

      // Ensure the current user is in 'data' even if not returned by API
      if (user && user.email && !data.find((u) => u.email === user.email)) {
        data.push({
          _id: user._id || user.email,
          username: (user.email || '').split('@')[0],
          firstName: user.firstName || user.name || 'You',
          lastName: user.lastName || '',
          email: user.email,
          points: {
            total: user.points || 0,
            voting: user.stats?.votingPoints || 0,
            contributions: user.stats?.contributionPoints || 0,
          },
          stats: {
            totalVotes: user.stats?.totalVotes || 0,
            totalContributions: user.stats?.totalContributions || 0,
          },
          createdAt: user.createdAt || new Date().toISOString(),
          fullName: user.fullName || user.name || (user.email || '').split('@')[0],
          badges: [],
          overrides: user.overrides || {},
        });
      }

      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        data = data.filter(
          (u) =>
            (u.username || '').toLowerCase().includes(term) ||
            (u.fullName || '').toLowerCase().includes(term) ||
            (u.email || '').toLowerCase().includes(term)
        );
      }

      // Sort by selected category points (desc)
      const getCat = (ud) => {
        if (!ud.points) return 0;
        switch (category) {
          case 'voting':
            return ud.points.voting || 0;
          case 'contributions':
            return ud.points.contributions || 0;
          case 'total':
          default:
            return ud.points.total || 0;
        }
      };

      data.sort((a, b) => getCat(b) - getCat(a));

      // Display rank matching 1, 2, 3, 4, 5, 6, 7, 8, 9, 10...
      data = data.map((u, i) => {
        u.displayRank = u.rankOverride !== undefined ? u.rankOverride : (u.rank || (i + 1));
        return u;
      });

      setLeaderboard(data);
      setTotalPages(1);

      const totalUsers = res?.data?.data?.totalUsers !== undefined ? res?.data?.data?.totalUsers : data.length;
      const totalPoints = data.reduce((sum, u) => sum + (u.points?.total || 0), 0);
      const activeUsersBase = res?.data?.data?.activeUsers !== undefined ? res?.data?.data?.activeUsers : (data.filter(u => u.isActive !== false).length);
      const averagePoints = data.length > 0 ? Math.round(totalPoints / data.length) : 0;

      const newStats = {
        totalUsers,
        activeUsers: activeUsersBase,
        totalPoints,
        averagePoints,
      };
      setStats(newStats);

      _cachedLeaderboard = data;
      _cachedStats = newStats;

      // Current user rank: use user.rank from auth context (/me endpoint) for consistency
      if (user && (user.email || user._id)) {
        const rankIndex = data.findIndex(u =>
          (user.email && u.email === user.email) ||
          (user._id && String(u._id) === String(user._id))
        );
        const authRank = user.rank;
        if (rankIndex !== -1) {
          const ud = data[rankIndex];
          const displayRank = ud.displayRank || authRank || (rankIndex + 1);
          const userRankObj = { position: displayRank, displayRank, user: ud, hardRank: displayRank };
          setUserRank(userRankObj);
          _cachedUserRank = userRankObj;
        } else {
          // User not in current page but we still know their rank from /me
          const userRankObj = authRank ? { position: authRank, displayRank: authRank, user: null, hardRank: authRank } : null;
          setUserRank(userRankObj);
          _cachedUserRank = userRankObj;
        }
      } else {
        setUserRank(null);
        _cachedUserRank = null;
      }


    } catch (error) {
      try {
        const users = getUsersList();
        const receipts = getReceipts();
        let data = users.map(u => {
          const meta = getUserMeta(u.email);
          const userReceipts = receipts.filter(r => r.userEmail === u.email);
          return {
            _id: u.email,
            username: (u.email || '').split('@')[0],
            firstName: u.name || (u.email || '').split('@')[0],
            lastName: '',
            email: u.email,
            role: u.role || 'user',
            points: {
              total: meta.points || 0,
              voting: meta.pointsVoting || 0,
              contributions: meta.pointsContribution || 0,
            },
            stats: {
              totalVotes: meta.votesUsed || 0,
              totalContributions: userReceipts.length || 0,
            },
            createdAt: u.createdAt || new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            profileImage: null,
            fullName: u.name || (u.email || '').split('@')[0],
            badges: [],
          };
        });

        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          data = data.filter(user =>
            (user.username || '').toLowerCase().includes(term) ||
            (user.fullName || '').toLowerCase().includes(term)
          );
        }

        // Add 13780 anonymous users
        const mockUsers = Array.from({ length: 13780 }, (_, i) => ({
          _id: `mock_${i}`,
          username: `anon_${Math.floor(Math.random() * 100000) + 10000}`,
          firstName: `Anonymous`,
          lastName: ``,
          email: `hidden@user.local`,
          role: 'user',
          points: {
            total: 0,
            voting: 0,
            contributions: 0,
          },
          stats: {
            totalVotes: 0,
            totalContributions: 0,
          },
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          profileImage: null,
          fullName: `Anonymous User`,
          badges: [],
        }));

        data = [...data, ...mockUsers];

        // Sync current user points with dashboard state (Offline mode)
        if (user && user.email) {
          data = data.map(u => {
            if (u.email === user.email || (user._id && u._id === user._id)) {
              return {
                ...u,
                points: {
                  total: user.points || 0,
                  voting: user.stats?.votingPoints || 0,
                  contributions: user.stats?.contributionPoints || 0,
                }
              };
            }
            return u;
          });
        }

        const sortByCategory = (a, b) => {
          const getCat = (ud) => {
            switch (category) {
              case 'voting': return ud.points?.voting || 0;
              case 'contributions': return ud.points?.contributions || 0;
              case 'total':
              default: return ud.points?.total || 0;
            }
          };
          const valB = getCat(b);
          const valA = getCat(a);
          if (valB !== valA) return valB - valA;
          if (String(a._id).startsWith('mock_')) return 1;
          if (String(b._id).startsWith('mock_')) return -1;
          return 0;
        };
        data.sort(sortByCategory);

        // Restricted to Top 10 Elite only
        const top10Data = data.slice(0, 10);

        setLeaderboard(top10Data);
        setTotalPages(1);
        const actualDbTotal = users.length;
        const totalUsers = actualDbTotal;
        const totalPoints = data.reduce((sum, u) => sum + (u.points?.total || 0), 0);
        const activeUsers = users.filter(u => u.isActive !== false).length;
        const averagePoints = actualDbTotal > 0 ? Math.round(totalPoints / actualDbTotal) : 0;
        setStats({ totalUsers, activeUsers, totalPoints, averagePoints });

        if (user?.email) {
          const rankIndex = data.findIndex(u => u.email === user.email || (user._id && u._id === user._id));
          if (rankIndex !== -1) {
            setUserRank({ position: rankIndex + 1, displayRank: rankIndex + 1, user: data[rankIndex] });
          } else {
            setUserRank(null);
          }
        } else {
          setUserRank(null);
        }
      } catch (err2) {
        console.error('Fetch leaderboard error (offline fallback):', error, err2);
        toast.error('Failed to load leaderboard. Showing Top 10 from local data.');
        setLeaderboard([]);
        setStats({ totalUsers: 0, activeUsers: 0, totalPoints: 0, averagePoints: 0 });
        setUserRank(null);
      }
    } finally {
      lastFetchRef.current = Date.now();
      fetchingRef.current = false;
      setLoading(false);
    }
  };

  const getRankIcon = (data_or_pos, isPersonal = false) => {
    // If it's a number (used for Champion/Silver/Bronze icons in layout)
    if (typeof data_or_pos === 'number') {
      const pos = data_or_pos;
      switch (pos) {
        case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
        case 2: return <Medal className="w-6 h-6 text-gray-400" />;
        case 3: return <Trophy className="w-6 h-6 text-orange-500" />;
        default: return <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold">{pos}</div>;
      }
    }
    // If it's the full user object
    const u = data_or_pos;
    const disp = u.displayRank;
    const actualPos = leaderboard.findIndex(l => l._id === u._id) + 1;

    // For Top 10 list, we hide the server badge unless it's the personal section header
    if (!isPersonal) {
      if (actualPos >= 1 && actualPos <= 3) {
        return getRankIcon(actualPos);
      }
      if (actualPos > 3 && actualPos <= 10) {
        return null;
      }
    }

    return (
      <div className="min-w-[4.5rem] h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-gray-300 text-xs font-bold px-3 text-center whitespace-nowrap">
        #{disp}
      </div>
    );
  };

  const getRankColor = (position) => {
    switch (position) {
      case 1:
        return 'from-[#fcb420] to-[#f59e0b]';
      case 2:
        return 'from-slate-300 to-slate-400';
      case 3:
        return 'from-amber-600 to-amber-700';
      default:
        return 'from-[#3772ff] to-[#4886d9]';
    }
  };

  const HardRankCircle = ({ rank, displayRank, isFirst = false }) => {
    const val = displayRank || rank;
    return (
      <div className={`w-12 h-10 rounded-xl border flex items-center justify-center font-bold text-xs px-2 shadow-md flex-shrink-0 whitespace-nowrap ${
        isFirst 
          ? 'border-[#A85830] bg-[#A85830]/20 text-[#A85830]' 
          : 'border-sky-400/40 bg-sky-500/15 text-sky-300'
      }`}>
        #{val}
      </div>
    );
  };

  const getPointsForCategory = (userData, cat) => {
    switch (cat) {
      case 'voting':
        return userData.points?.voting || 0;
      case 'contributions':
        return userData.points?.contributions || 0;
      case 'total':
      default:
        return userData.points?.total || 0;
    }
  };

  const LeaderboardCard = ({ userData, position, hardRank, isCurrentUser = false, isPersonal = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: isPersonal ? 0 : Math.min((hardRank || 1) * 0.02, 0.15) }}
      className={`backdrop-blur-xl rounded-2xl p-5 sm:p-6 border transition-all duration-300 ${
        isCurrentUser
          ? 'border-[#A85830] bg-[#0a254d] text-white shadow-xl ring-1 ring-[#A85830]/40'
          : 'border-sky-400/25 bg-[#0a254d] hover:bg-[#0c2e5c] text-white hover:border-[#A85830]/40 shadow-lg'
      } ${position <= 3 ? 'relative overflow-hidden' : ''}`}
    >
      {/* Top 3 Background Subtle Glow */}
      {position <= 3 && (
        <div className={`absolute inset-0 bg-gradient-to-r ${getRankColor(position)} opacity-5 pointer-events-none`} />
      )}

      <div className="relative flex items-center space-x-4">
        {/* Unified Rank Badge */}
        <div className="flex-shrink-0">
          <HardRankCircle
            rank={hardRank}
            displayRank={isPersonal ? (user?.rank || (5000 + (position || 1))) : (userData.displayRank || userData.rank)}
            isFirst={position === 1}
          />
        </div>

        {/* Avatar */}
        <div className="flex-shrink-0">
          {userData.profileImage ? (
            <img
              src={userData.profileImage}
              alt={userData.firstName}
              className={`w-12 h-12 rounded-full object-cover border-2 ${position === 1 ? 'border-[#A85830]' : 'border-white/20'}`}
            />
          ) : (
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRankColor(position)} flex items-center justify-center shadow-md`}>
              <User className={`w-6 h-6 ${position === 1 ? 'text-white' : 'text-white'}`} />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-white font-semibold truncate text-base sm:text-lg">
              {userData.fullName}
            </h3>
            {isCurrentUser && (
              <span className="px-2.5 py-0.5 bg-gradient-to-r from-[#A85830] to-[#ea580c] text-white font-bold text-xs rounded-full shadow-sm">
                You
              </span>
            )}

            {userData.role === 'admin' && (
              <Crown className="w-4 h-4 text-[#A85830]" />
            )}
          </div>
          <p className="text-white text-xs sm:text-sm font-semibold">
            Member since {new Date(userData.createdAt).toLocaleDateString()}
          </p>
          {userData.bio && (
            <p className="text-white text-xs sm:text-sm font-semibold mt-1 line-clamp-1">{userData.bio}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex-shrink-0 text-right">
          <div className="flex items-center justify-end space-x-1.5 mb-1">
            <Star className="w-4 h-4 text-[#A85830] fill-[#A85830]" />
            <span className="text-white font-black text-base sm:text-xl tracking-tight">
              {getPointsForCategory(userData, category).toLocaleString()}
            </span>
          </div>
          <p className="text-white text-xs font-bold">
            {category === 'total' ? 'Total Points' :
              category === 'voting' ? 'Voting Points' : 'Contribution Points'}
          </p>
        </div>
      </div>

      {/* Clean Modern Progress Bar for Top 10 */}
      {position <= 10 && leaderboard.length > 0 && (
        <div className="mt-4">
          <div className="w-full bg-[#061833] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getRankColor(position)} transition-all duration-500`}
              style={{
                width: `${Math.max(5, (getPointsForCategory(userData, category) / (getPointsForCategory(leaderboard[0], category) || 1)) * 100)}%`
              }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );

  const StatCard = ({ icon: Icon, title, value, subtitle, isGold = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0a254d] text-white rounded-2xl p-6 sm:p-7 border border-sky-400/25 hover:border-[#A85830]/40 shadow-xl transition-all duration-300"
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3.5 rounded-xl shadow-lg ${
          isGold 
            ? 'bg-gradient-to-br from-[#A85830] to-[#ea580c] text-white' 
            : 'bg-gradient-to-br from-sky-500 to-blue-600 text-white'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{value}</h3>
          <p className="text-white text-sm font-bold">{title}</p>
          {subtitle && <p className="text-white text-xs font-semibold mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl sm:text-4xl">🏆</span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Leader<span className="text-[#A85830]">board</span>
            </h1>
          </div>
          <p className="text-slate-600 text-sm sm:text-base max-w-3xl font-medium">
            See how you rank among beneficiaries and celebrate top beneficiaries shaping platform decisions through regular voting.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats.totalUsers?.toLocaleString() || '0'}
            isGold={true}
          />
          <StatCard
            icon={TrendingUp}
            title="Active Users"
            value={stats.activeUsers?.toLocaleString() || '0'}
            subtitle="Last 30 days"
            isGold={false}
          />
        </div>

        {/* Your Rank Section */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-slate-900" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Your <span className="text-[#A85830]">Ranking</span></h2>
              </div>
            </div>

            <div className="rounded-2xl border border-sky-400/25 shadow-xl overflow-hidden">
              <LeaderboardCard
                userData={userRank?.user || {
                  ...user,
                  fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || (user.email || '').split('@')[0],
                  points: {
                    total: user.points || 0,
                    voting: user.stats?.votingPoints || 0,
                    contributions: user.stats?.contributionPoints || 0
                  },
                  createdAt: user.createdAt || new Date().toISOString(),
                  displayRank: user?.overrides?.rankOverride || user?.rank || 5000
                }}
                position={userRank?.displayRank || user?.overrides?.rankOverride || user?.rank || 5000}
                hardRank={userRank?.hardRank}
                isPersonal={true}
                isCurrentUser={true}
              />
            </div>
          </motion.div>
        )}

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Crown className="w-6 h-6 text-[#A85830]" />
                <span>Top Champions <span className="text-[#A85830]">Podium</span></span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 2nd Place */}
              <div className="order-2 md:order-1">
                <LeaderboardCard
                  userData={leaderboard[1]}
                  position={2}
                  hardRank={2}
                  isCurrentUser={user?._id === leaderboard[1]?._id}
                />
              </div>

              {/* 1st Place */}
              <div className="order-1 md:order-2">
                <div className="relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-[#A85830] to-[#ea580c] text-white px-3.5 py-1 rounded-full text-xs font-black shadow-lg uppercase tracking-wider flex items-center gap-1">
                      👑 CHAMPION
                    </div>
                  </div>
                  <LeaderboardCard
                    userData={leaderboard[0]}
                    position={1}
                    hardRank={1}
                    isCurrentUser={user?._id === leaderboard[0]?._id}
                  />
                </div>
              </div>

              {/* 3rd Place */}
              <div className="order-3 md:order-3">
                <LeaderboardCard
                  userData={leaderboard[2]}
                  position={3}
                  hardRank={3}
                  isCurrentUser={user?._id === leaderboard[2]?._id}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#A85830]" />
              Top Champions
            </h2>
          </div>

          {leaderboard.length > 0 ? (
            <div className="space-y-4">
              {leaderboard
                .filter((u, i) => {
                  const r = u.displayRank !== undefined ? u.displayRank : (u.rank !== undefined ? u.rank : (i + 1));
                  return Number(r) <= 10;
                })
                .slice(0, 10)
                .map((userData, index) => {
                  const position = index + 1;
                  return (
                    <LeaderboardCard
                      key={userData._id}
                      userData={userData}
                      position={position}
                      hardRank={position}
                      isCurrentUser={user?._id === userData._id}
                    />
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#0a254d] rounded-2xl border border-sky-400/25">
              <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
              <p className="text-slate-300">
                {searchTerm
                  ? 'Try adjusting your search criteria.'
                  : 'Be the first to earn points and claim the top spot!'
                }
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;
