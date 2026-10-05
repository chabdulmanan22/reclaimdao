import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Mail, Clock, RefreshCw, User, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const ContactMessagesManagement = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('/api/mail/contact-messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        setMessages(res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-400" />
            Website Contact Messages
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            View all support inquiries and messages submitted via the website contact form
          </p>
        </div>
        <button
          onClick={fetchMessages}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
          Loading contact messages...
        </div>
      ) : messages.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
          No contact messages submitted yet.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={msg.id || msg._id || index}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-bold text-white">{msg.name}</span>
                  <span className="text-xs text-slate-400">({msg.email})</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'Just now'}
                </div>
              </div>

              {msg.subject && (
                <div className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                  Subject: {msg.subject}
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                <MessageSquare className="w-4 h-4 text-slate-500 inline mr-2" />
                {msg.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactMessagesManagement;
