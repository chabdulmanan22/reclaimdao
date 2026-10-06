import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  addReceipt as dsAddReceipt,
  getActiveWallets as dsGetActiveWallets,
  getContributionTimer as dsGetContributionTimer,
  clearContributionTimer as dsClearContributionTimer,
  getReceipts as dsGetReceipts,
  getUsersMap as dsGetUsersMap
} from '../utils/datastore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Coins,
  Users,
  DollarSign,
  Copy,
  CheckCircle,
  ShieldCheck,
  Check,
  Upload,
  X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Contribute = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timer, setTimer] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [selectedCoin, setSelectedCoin] = useState('');
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [transactionHash, setTransactionHash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [recentContributions, setRecentContributions] = useState([]);
  const [isContributionActive, setIsContributionActive] = useState(true);
  const [isRoundWindowActive, setIsRoundWindowActive] = useState(false);
  const [hasContributionRound, setHasContributionRound] = useState(false);
  const [roundFinished, setRoundFinished] = useState(false);
  const [publicContributionsEnabled, setPublicContributionsEnabled] = useState(false);

  const finalizeRound = () => {
    if (roundFinished) return;
    setRoundFinished(true);
    try { dsClearContributionTimer(); } catch (_) { }
    setTimer(null);
    setHasContributionRound(false);
    setIsRoundWindowActive(false);
    toast('Contribution round finished');
  };

  const canContribute = isContributionActive && (publicContributionsEnabled || hasContributionRound);

  // Load admin-defined wallets and contribution timer
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get('/api/settings/contributionActive');
        if (data.success) {
          setIsContributionActive(data.data.value);
        }
      } catch (error) {
        console.error('Error fetching contribution status:', error);
      }
      try {
        const { data } = await axios.get('/api/settings/publicContributionsEnabled');
        if (data.success) {
          setPublicContributionsEnabled(data.data.value === true);
        }
      } catch (error) {
        setPublicContributionsEnabled(false);
      }

      setTimer(dsGetContributionTimer());

      try {
        const wRes = await axios.get('/api/settings/activeWallets');
        const sWallets = wRes?.data?.data?.value;
        if (Array.isArray(sWallets)) {
          const activeOnly = sWallets.filter(w => w.isActive);
          setWallets(activeOnly);
        } else {
          setWallets(dsGetActiveWallets());
        }
      } catch (e) {
        console.error('Failed to fetch wallets from server:', e);
        setWallets(dsGetActiveWallets());
      }

      try {
        const res = await axios.get('/api/settings/contributionRound');
        const round = res?.data?.data?.value || null;
        const endMs = round?.endTime ? new Date(round.endTime).getTime() : 0;
        const startMs = round?.startTime ? new Date(round.startTime).getTime() : 0;
        const nowMs = Date.now();
        const hasRound = Boolean(round && round.startTime && round.endTime && nowMs <= endMs);
        setHasContributionRound(hasRound);
        setIsRoundWindowActive(Boolean(nowMs >= startMs && nowMs <= endMs));
      } catch (_) {
        const nowMs = Date.now();
        const localTimer = dsGetContributionTimer();
        setHasContributionRound(Boolean(localTimer?.endTime && nowMs <= localTimer.endTime));
        setIsRoundWindowActive(Boolean(localTimer?.endTime && nowMs <= localTimer.endTime));
      }

      let mapped = [];
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await axios.get('/api/contributions/mine', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const list = res?.data?.data?.contributions || [];
          mapped = list.map(c => ({
            id: c._id || c.id,
            user: (c.user?.firstName || 'Me'),
            amount: c.amount || 0,
            currency: c.currency || 'USD',
            usdValue: c.amount || 0,
            status: c.status === 'approved' ? 'verified' : (c.status || 'pending'),
            submittedAt: c.createdAt || new Date().toISOString(),
          }));
        }
      } catch (e) {
        console.error('Error fetching server contributions:', e);
      }

      if (mapped.length === 0) {
        const raw = dsGetReceipts();
        const users = dsGetUsersMap ? dsGetUsersMap() : {};
        mapped = raw.map((r) => ({
          id: r.id,
          user: ((users[r.userEmail]?.email || r.userEmail || '').split('@')[0]) || 'user',
          amount: r.amount || 0,
          currency: r.currency || 'USD',
          usdValue: r.amount || 0,
          status: r.verified ? 'verified' : (r.status || 'pending'),
          submittedAt: new Date(r.time).toISOString(),
        }));
      }

      setRecentContributions(mapped.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 5));
    };
    load();
    const interval = setInterval(load, 15000);
    const onUpdate = () => load();
    window.addEventListener('datastore:update', onUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('datastore:update', onUpdate);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      if (!timer?.endTime) {
        setCountdown('');
        return;
      }
      const now = Date.now();
      const diff = timer.endTime - now;
      if (diff <= 0) {
        setCountdown('00:00:00');
        finalizeRound();
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Calculate crypto amount
  useEffect(() => {
    if (amount && selectedCoin) {
      const w = wallets.find(c => c.symbol === selectedCoin);
      if (w && w.rate) {
        const cryptoValue = (parseFloat(amount) / Number(w.rate)).toFixed(6);
        setCryptoAmount(cryptoValue);
        setWalletAddress(w.address);
      } else if (w) {
        setWalletAddress(w.address);
        setCryptoAmount('');
      }
    } else {
      setCryptoAmount('');
      setWalletAddress('');
    }
  }, [amount, selectedCoin, wallets]);

  const getPointsForAmount = (usdAmount) => {
    const amt = parseFloat(usdAmount);
    if (amt >= 1000) return 1000;
    if (amt >= 500) return 300;
    if (amt >= 300) return 100;
    if (amt >= 100) return 30;
    if (amt >= 50) return 15;
    return 0;
  };

  const handleGenerateQR = () => {
    if (!amount || !selectedCoin) {
      toast.error('Please enter an amount and select a cryptocurrency');
      return;
    }

    if (parseFloat(amount) < 50) {
      toast.error('Minimum contribution amount is $50');
      return;
    }

    setShowQR(true);
    if (!hasContributionRound) {
      toast('No active round: QR available, points will be credited upon admin audit');
    } else {
      toast.success('Payment address ready. Scan QR or copy address');
    }
  };

  const copyWalletAddress = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    toast.success('Wallet address copied to clipboard!');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const generateQRCodeData = () => {
    return `${selectedCoin}:${walletAddress}?amount=${cryptoAmount}&label=ReclaimDAO`;
  };

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      toast.error('Only PNG, JPG, WEBP, and PDF files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }
    setReceiptFile(file);
  };

  const handleSubmitProof = async () => {
    try {
      if (!amount || parseFloat(amount) < 50) {
        toast.error('Minimum contribution amount is $50');
        return;
      }
      if (!selectedCoin) {
        toast.error('Please select a cryptocurrency');
        return;
      }
      if (!walletAddress) {
        toast.error('Wallet address is missing');
        return;
      }
      if (!receiptFile) {
        toast.error('Please upload a payment receipt screenshot or PDF');
        return;
      }

      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('receipt', receiptFile);
      formData.append('amount', amount);
      formData.append('currency', selectedCoin);
      formData.append('walletAddress', walletAddress);
      if (transactionHash) formData.append('transactionHash', transactionHash);

      const { data } = await axios.post('/api/contributions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data?.success) {
        dsAddReceipt({
          userEmail: user?.email || 'anonymous@local',
          amount: Number(amount) || 0,
          currency: selectedCoin || 'USD',
          url: data?.data?.receiptUrl || transactionHash || '',
          notes: `Uploaded via API${transactionHash ? ` • tx ${transactionHash}` : ''}`
        });
        toast.success('Proof submitted! We will audit and credit points.');
        setReceiptFile(null);
        setTransactionHash('');
        setShowQR(false);
        setAmount('');
        setSelectedCoin('');
        setWalletAddress('');
        setCryptoAmount('');
      } else {
        toast.error(data?.message || 'Failed to submit proof');
      }
    } catch (err) {
      dsAddReceipt({
        userEmail: user?.email || 'anonymous@local',
        amount: Number(amount) || 0,
        currency: selectedCoin || 'USD',
        url: transactionHash || '',
        notes: receiptFile?.name || 'Local submission'
      });
      toast.success('Proof recorded for verification by administrator.');
      setReceiptFile(null);
      setTransactionHash('');
      setShowQR(false);
      setAmount('');
      setSelectedCoin('');
      setWalletAddress('');
      setCryptoAmount('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-charcoal py-6 sm:py-10 md:py-12 selection:bg-[#3D7EFF] selection:text-white">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

        {/* Masthead Header Section */}
        <div className="border-b border-[#D4D4CE] pb-6 space-y-3">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#D4D4CE] text-charcoal text-[11px] font-mono font-bold uppercase tracking-wider shadow-sm"
            style={{ borderRadius: '0px' }}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#3D7EFF]" />
            <span>DAO Ecosystem • Protocol Contribution Node</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleBackToDashboard}
              className="p-2.5 bg-white hover:bg-[#F8F8F6] text-charcoal border border-[#D4D4CE] transition-all shadow-sm cursor-pointer shrink-0"
              style={{ borderRadius: '0px' }}
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-charcoal" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-charcoal tracking-tight">
                DAO <span className="text-[#3D7EFF]">Contribution</span>
              </h1>
              <p className="text-xs sm:text-sm text-coolgray font-medium mt-0.5">
                Support protocol recovery operations and earn restitution governance points
              </p>
            </div>
          </div>
        </div>

        {/* Voluntary Contribution Banner */}
        <div
          className="p-4 bg-white border border-[#D4D4CE] flex items-start gap-3.5 shadow-sm"
          style={{ borderRadius: '0px' }}
        >
          <div
            className="p-1.5 bg-[#F8F8F6] border border-[#D4D4CE] text-[#3D7EFF] shrink-0 mt-0.5"
            style={{ borderRadius: '0px' }}
          >
            <CheckCircle className="w-4 h-4 text-[#3D7EFF]" />
          </div>
          <p className="text-xs sm:text-sm text-coolgray leading-relaxed">
            Contributions to ReclaimDAO are strictly <strong className="text-charcoal font-bold">voluntary and optional</strong>. Your community support assists escrow funding, but is never mandatory for individual claims.
          </p>
        </div>

        {/* Timer Section (If Active Contribution Round is Running) */}
        {timer?.endTime && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#D4D4CE] p-6 text-center shadow-sm space-y-2"
            style={{ borderRadius: '0px' }}
          >
            <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold text-[#3D7EFF] uppercase tracking-wider">
              <Clock className="w-4 h-4 text-[#3D7EFF]" />
              <span>Active Contribution Round Closes In</span>
            </div>
            <div className="text-3xl sm:text-4xl font-mono font-black text-charcoal tracking-tight">
              {countdown}
            </div>
            <p className="text-xs font-mono text-coolgray">
              Special governance point multipliers apply during active rounds
            </p>
          </motion.div>
        )}

        {/* Contribution Tiers & Points */}
        {canContribute && (
          <div
            className="bg-white border border-[#D4D4CE] p-6 shadow-sm space-y-4"
            style={{ borderRadius: '0px' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#D4D4CE]">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#3D7EFF]" />
                <span>Contribution Tiers & Governance Points</span>
              </h3>
              <span className="font-mono text-[10px] text-coolgray uppercase tracking-widest">Protocol Ratio</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 font-mono">
              <div className="p-3 bg-[#F8F8F6] border border-[#D4D4CE] text-center" style={{ borderRadius: '0px' }}>
                <span className="text-[11px] text-coolgray block">$50 – $99</span>
                <span className="text-sm font-bold text-[#3D7EFF] block mt-1">+15 pts</span>
              </div>
              <div className="p-3 bg-[#F8F8F6] border border-[#D4D4CE] text-center" style={{ borderRadius: '0px' }}>
                <span className="text-[11px] text-coolgray block">$100 – $299</span>
                <span className="text-sm font-bold text-[#3D7EFF] block mt-1">+30 pts</span>
              </div>
              <div className="p-3 bg-[#F8F8F6] border border-[#D4D4CE] text-center" style={{ borderRadius: '0px' }}>
                <span className="text-[11px] text-coolgray block">$300 – $499</span>
                <span className="text-sm font-bold text-[#3D7EFF] block mt-1">+100 pts</span>
              </div>
              <div className="p-3 bg-[#F8F8F6] border border-[#D4D4CE] text-center" style={{ borderRadius: '0px' }}>
                <span className="text-[11px] text-coolgray block">$500 – $999</span>
                <span className="text-sm font-bold text-[#3D7EFF] block mt-1">+300 pts</span>
              </div>
              <div className="p-3 bg-[#F8F8F6] border border-[#D4D4CE] text-center col-span-2 sm:col-span-1" style={{ borderRadius: '0px' }}>
                <span className="text-[11px] text-coolgray block">$1,000+</span>
                <span className="text-sm font-bold text-[#3D7EFF] block mt-1">+1,000 pts</span>
              </div>
            </div>
          </div>
        )}

        {/* Contribution Form Card */}
        <div
          className="bg-white border border-[#D4D4CE] p-6 sm:p-8 shadow-sm space-y-6"
          style={{ borderRadius: '0px' }}
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#D4D4CE]">
            <div>
              <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#3D7EFF]">
                Step 1
              </span>
              <h3 className="text-lg sm:text-xl font-black text-charcoal tracking-tight mt-0.5">
                Make a Contribution
              </h3>
            </div>
            <span className="font-mono text-[10px] text-coolgray uppercase tracking-wider">
              {canContribute ? 'Contributions Active' : 'Contributions Standby'}
            </span>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
              Enter Amount in USD (Min $50) <span className="text-[#3D7EFF]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-coolgray">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                type={canContribute ? "number" : "text"}
                value={canContribute ? amount : "Contributions currently paused"}
                onChange={(e) => canContribute && setAmount(e.target.value)}
                placeholder="50"
                min="50"
                disabled={!canContribute}
                className={`w-full pl-10 pr-3.5 py-3 bg-white border border-[#D4D4CE] text-charcoal text-base sm:text-sm font-medium focus:border-[#3D7EFF] focus:outline-none transition-colors ${
                  !canContribute ? 'bg-[#F8F8F6] text-coolgray cursor-not-allowed opacity-80' : ''
                }`}
                style={{ borderRadius: '0px' }}
              />
            </div>
            {amount && (hasContributionRound || publicContributionsEnabled) && (
              <div className="mt-2 font-mono text-xs text-coolgray flex items-center justify-between">
                <span>Governance points credit:</span>
                <strong className="text-[#3D7EFF] font-black">+{getPointsForAmount(amount)} points</strong>
              </div>
            )}
          </div>

          {/* Cryptocurrency Selection */}
          <div>
            <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-2">
              Select Protocol Cryptocurrency <span className="text-[#3D7EFF]">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {wallets.map((crypto) => {
                const isSelected = selectedCoin === crypto.symbol;
                return (
                  <button
                    key={crypto.symbol}
                    type="button"
                    onClick={() => setSelectedCoin(crypto.symbol)}
                    disabled={wallets.length === 0 || !canContribute}
                    className={`p-3.5 border transition-all text-left cursor-pointer min-h-[58px] ${
                      isSelected
                        ? 'bg-[#F8F8F6] border-2 border-[#3D7EFF] shadow-sm'
                        : 'bg-white border-[#D4D4CE] hover:border-charcoal'
                    } ${!canContribute ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ borderRadius: '0px' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-sm text-charcoal">{crypto.symbol}</span>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-[#3D7EFF]" />
                      )}
                    </div>
                    <div className="text-[11px] text-coolgray mt-0.5 truncate">{crypto.name}</div>
                    {crypto.rate && (
                      <div className="font-mono text-[10px] text-[#3D7EFF] mt-1 font-bold">
                        1 {crypto.symbol} = ${crypto.rate}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Estimate Preview */}
          {amount && selectedCoin && cryptoAmount && (
            <div
              className="p-4 bg-[#F8F8F6] border border-[#D4D4CE] space-y-2 font-mono text-xs"
              style={{ borderRadius: '0px' }}
            >
              <div className="flex justify-between">
                <span className="text-coolgray">USD Value:</span>
                <span className="text-charcoal font-bold">${amount} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-coolgray">Estimated Crypto:</span>
                <span className="text-[#3D7EFF] font-bold">{cryptoAmount} {selectedCoin}</span>
              </div>
              {(hasContributionRound || publicContributionsEnabled) && (
                <div className="flex justify-between pt-1 border-t border-[#D4D4CE]">
                  <span className="text-coolgray">Points Awarded:</span>
                  <span className="text-charcoal font-bold">+{getPointsForAmount(amount)} points</span>
                </div>
              )}
            </div>
          )}

          {/* Generate QR Button */}
          <button
            type="button"
            onClick={handleGenerateQR}
            disabled={!amount || !selectedCoin || parseFloat(amount) < 50 || (!cryptoAmount && !walletAddress)}
            className="w-full py-3.5 px-6 bg-[#3D7EFF] hover:bg-electric-600 text-white font-mono font-bold text-xs sm:text-sm uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer min-h-[44px]"
            style={{ borderRadius: '0px' }}
          >
            Generate Payment QR & Destination Address
          </button>
        </div>

        {/* Submit Proof of Payment Card */}
        <div
          className="bg-white border border-[#D4D4CE] p-6 sm:p-8 shadow-sm space-y-5"
          style={{ borderRadius: '0px' }}
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#D4D4CE]">
            <div>
              <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#3D7EFF]">
                Step 2
              </span>
              <h3 className="text-lg sm:text-xl font-black text-charcoal tracking-tight mt-0.5">
                Submit Proof of Payment
              </h3>
            </div>
            <span className="font-mono text-[10px] text-coolgray uppercase tracking-wider">
              Verification Dossier
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Upload Receipt File (PNG / JPG / WEBP / PDF under 5MB) <span className="text-[#3D7EFF]">*</span>
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/heic,application/pdf"
                onChange={handleReceiptChange}
                className="w-full p-2.5 bg-white border border-[#D4D4CE] text-xs font-mono text-charcoal file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-xs file:font-mono file:font-bold file:uppercase file:bg-[#3D7EFF] file:text-white cursor-pointer"
                style={{ borderRadius: '0px' }}
              />
              {receiptFile && (
                <div className="mt-2 text-xs font-mono text-[#3D7EFF] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Selected: {receiptFile.name}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Transaction Hash / Reference ID (Optional)
              </label>
              <input
                type="text"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                placeholder="0x..."
                className="w-full px-3.5 py-3 bg-white border border-[#D4D4CE] text-charcoal text-base sm:text-sm font-medium focus:border-[#3D7EFF] focus:outline-none placeholder:text-coolgray/50"
                style={{ borderRadius: '0px' }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmitProof}
            disabled={isSubmitting || !receiptFile}
            className="w-full py-3.5 px-6 bg-charcoal hover:bg-black text-white font-mono font-bold text-xs sm:text-sm uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer min-h-[44px]"
            style={{ borderRadius: '0px' }}
          >
            {isSubmitting ? 'Uploading & Ingesting Proof...' : 'Submit Contribution Proof'}
          </button>
        </div>

        {/* Recent Contributions History */}
        <div
          className="bg-white border border-[#D4D4CE] p-6 sm:p-8 shadow-sm space-y-5"
          style={{ borderRadius: '0px' }}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#D4D4CE]">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
              <Users className="w-4 h-4 text-[#3D7EFF]" />
              <span>Recent Protocol Contributions</span>
            </h3>
            <span className="font-mono text-[10px] text-coolgray uppercase tracking-widest">Live Ledger</span>
          </div>

          <div className="space-y-2.5">
            {recentContributions.length === 0 ? (
              <div className="py-6 text-center">
                <p className="font-mono text-xs text-coolgray uppercase tracking-wider">
                  No contribution receipts recorded in session ledger.
                </p>
              </div>
            ) : (
              recentContributions.map((c, i) => {
                const isVerified = c.status === 'verified' || c.status === 'approved';
                return (
                  <div
                    key={i}
                    className="p-3.5 bg-[#F8F8F6] border border-[#D4D4CE] flex items-center justify-between gap-3 text-xs"
                    style={{ borderRadius: '0px' }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-2 h-2 rounded-full ${isVerified ? 'bg-[#3D7EFF]' : 'bg-amber-500'}`}
                      />
                      <div>
                        <p className="font-bold text-charcoal">{c.user}</p>
                        <p className="font-mono text-[10px] text-coolgray">
                          {new Date(c.submittedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <p className="font-black text-charcoal">${c.usdValue}</p>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isVerified ? 'text-[#3D7EFF]' : 'text-amber-600'
                        }`}
                      >
                        {isVerified ? 'Verified' : 'Under Review'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Swiss Architectural QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#D4D4CE] p-6 sm:p-8 w-full max-w-md shadow-2xl relative space-y-4"
              style={{ borderRadius: '0px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#D4D4CE]">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#3D7EFF]">
                    Payment Terminal
                  </span>
                  <h3 className="text-xl font-black text-charcoal tracking-tight">
                    Scan to Pay ({selectedCoin})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQR(false)}
                  className="p-1 text-coolgray hover:text-charcoal cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* QR Code Container */}
              <div className="bg-[#F8F8F6] p-5 border border-[#D4D4CE] flex items-center justify-center" style={{ borderRadius: '0px' }}>
                {wallets.find(c => c.symbol === selectedCoin)?.qrCode ? (
                  <img
                    src={wallets.find(c => c.symbol === selectedCoin)?.qrCode}
                    alt="Payment QR"
                    className="mx-auto h-52 w-52 object-contain"
                  />
                ) : (
                  <QRCodeSVG value={generateQRCodeData()} size={208} />
                )}
              </div>

              {/* Payment Amount Display */}
              <div className="text-center font-mono py-1">
                <p className="text-lg font-black text-charcoal">{cryptoAmount} {selectedCoin}</p>
                <p className="text-xs text-coolgray">≈ ${amount} USD Equivalent</p>
              </div>

              {/* Destination Address Copy Box */}
              <div className="p-3 bg-[#F8F8F6] border border-[#D4D4CE] space-y-1" style={{ borderRadius: '0px' }}>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-coolgray block">
                  Send to Destination Address:
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-charcoal break-all select-all font-medium">
                    {walletAddress}
                  </span>
                  <button
                    type="button"
                    onClick={copyWalletAddress}
                    className="p-2 bg-white hover:bg-[#F8F8F6] border border-[#D4D4CE] text-charcoal shrink-0 cursor-pointer"
                    style={{ borderRadius: '0px' }}
                    title="Copy Address"
                  >
                    <Copy className="w-4 h-4 text-[#3D7EFF]" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowQR(false)}
                className="w-full py-3 bg-[#3D7EFF] hover:bg-electric-600 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer"
                style={{ borderRadius: '0px' }}
              >
                Done / Close Terminal
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contribute;
