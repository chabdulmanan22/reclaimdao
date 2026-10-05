import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Vote as VoteIcon, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Vote = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 12,
    minutes: 60,
    seconds: 5
  });
  const [votes, setVotes] = useState({
    question1: null,
    question2: null
  });
  const [hasVoted, setHasVoted] = useState(false);

  // Sample questions
  const questions = [
    {
      id: 'question1',
      title: 'Should we distribute funds?',
      options: [
        { id: 'A', label: 'YES' },
        { id: 'B', label: 'NO' },
        { id: 'C', label: 'MAYBE' }
      ]
    },
    {
      id: 'question2',
      title: 'Should we go LEFT, RIGHT, UP, or DOWN?',
      options: [
        { id: 'A', label: 'UP' },
        { id: 'B', label: 'DOWN' },
        { id: 'C', label: 'LEFT' },
        { id: 'D', label: 'RIGHT' }
      ]
    }
  ];

  // Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVoteChange = (questionId, optionId) => {
    setVotes(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmitVotes = () => {
    // Check if all questions are answered
    const unansweredQuestions = questions.filter(q => !votes[q.id]);
    
    if (unansweredQuestions.length > 0) {
      toast.error('Please answer all questions before submitting your vote');
      return;
    }

    // Simulate vote submission
    setHasVoted(true);
    toast.success('Your votes have been submitted successfully!');
    
    // In a real app, this would send the votes to the backend
    console.log('Submitted votes:', votes);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">DAO <span className="text-[#A85830]">Vote</span></h1>
          <p className="text-slate-600 text-sm sm:text-base">Cast your vote on important decisions</p>
        </motion.div>

        {/* Timer Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0a254d] text-white rounded-2xl border border-sky-400/25 p-6 sm:p-8 mb-6 sm:mb-8 text-center shadow-xl"
        >
          <h2 className="text-xl font-bold text-white mb-4">Time Remaining</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="bg-[#071d3d] border border-sky-400/20 rounded-xl p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#A85830]">{timeLeft.days}</div>
              <div className="text-slate-300 text-xs sm:text-sm">Days</div>
            </div>
            <div className="bg-[#071d3d] border border-sky-400/20 rounded-xl p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#A85830]">{timeLeft.hours}</div>
              <div className="text-slate-300 text-xs sm:text-sm">Hours</div>
            </div>
            <div className="bg-[#071d3d] border border-sky-400/20 rounded-xl p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#A85830]">{timeLeft.minutes}</div>
              <div className="text-slate-300 text-xs sm:text-sm">Minutes</div>
            </div>
            <div className="bg-[#071d3d] border border-sky-400/20 rounded-xl p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#A85830]">{timeLeft.seconds}</div>
              <div className="text-slate-300 text-xs sm:text-sm">Seconds</div>
            </div>
          </div>
          <p className="text-sky-300 font-semibold text-sm sm:text-base">
            You have 1 vote for this round
          </p>
        </motion.div>

        {/* Questions */}
        <div className="space-y-6 sm:space-y-8">
          {questions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#0a254d] border border-sky-400/25 rounded-2xl p-6 sm:p-8 shadow-xl"
            >
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
                {question.title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {question.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleVoteChange(question.id, option.id)}
                    className={`p-4 rounded-xl transition-all duration-300 text-left cursor-pointer ${
                      votes[question.id] === option.id
                        ? 'bg-[#A85830]/20 border-2 border-[#A85830] text-white shadow-lg'
                        : 'bg-[#071d3d] border-2 border-transparent text-slate-300 hover:border-sky-400/40 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm sm:text-base">{option.id}) {option.label}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        votes[question.id] === option.id
                          ? 'bg-[#A85830] border-[#A85830]'
                          : 'border-slate-500'
                      }`}>
                        {votes[question.id] === option.id && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 sm:mt-8 text-center"
        >
          <button
            onClick={handleSubmitVotes}
            disabled={questions.some(q => !votes[q.id])}
            className={`px-8 py-3.5 font-bold rounded-xl transition-all duration-300 flex items-center justify-center mx-auto text-base shadow-lg ${
              questions.some(q => !votes[q.id])
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'text-white cursor-pointer hover:scale-105'
            }`}
            style={!questions.some(q => !votes[q.id]) ? {
              background: 'linear-gradient(135deg, #A85830 0%, #964d28 50%, #854221 100%)',
              boxShadow: '0 8px 25px rgba(168, 88, 48, 0.35)'
            } : {}}
          >
            <VoteIcon className="w-5 h-5 mr-2" />
            Submit Votes ({Object.keys(votes).filter(key => votes[key]).length}/{questions.length})
          </button>
        </motion.div>

        {/* Back to Dashboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="text-slate-500 hover:text-slate-800 font-semibold transition-colors text-sm cursor-pointer"
          >
            ← Back to Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Vote;