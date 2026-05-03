import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, ThumbsUp, X, Search, CheckCircle, XCircle, BadgeCheck } from 'lucide-react';
import api from '../utils/api';

export default function SocialMediaFeed() {
  const [feed, setFeed] = useState([]);
  const [results, setResults] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    api.get('/social-media/feed').then(res => setFeed(res.data)).catch(() => {});
  }, []);

  const handleAction = async (postId, action) => {
    if (results[postId]) return;
    try {
      const res = await api.post('/social-media/action', { postId, action });
      setResults(prev => ({ ...prev, [postId]: res.data }));
      setTotalScore(prev => prev + res.data.score);
      setCompleted(prev => prev + 1);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <Smartphone size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Social Media Feed</h1>
            <p className="text-sm text-surface-100/50">Can you spot misinformation in your feed?</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold gradient-text">{totalScore}</div>
            <div className="text-xs text-surface-100/40">{completed}/{feed.length} reviewed</div>
          </div>
        </div>

        {/* Score bar */}
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-surface-100/50">Media Literacy Score</span>
            <span className="font-mono text-primary-300">{totalScore} pts</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${Math.min(100, (completed / feed.length) * 100)}%` }} />
          </div>
        </div>

        {/* Feed */}
        <div className="max-w-2xl mx-auto space-y-4">
          {feed.map(post => {
            const r = results[post.id];
            return (
              <motion.div key={post.id} layout className="glass-card overflow-hidden">
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">{post.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm">{post.author}</span>
                        {post.verified && <BadgeCheck size={14} className="text-blue-400" />}
                      </div>
                      <span className="text-xs text-surface-100/30">{post.timestamp}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-surface-100/70 leading-relaxed mb-4">{post.content}</p>

                  {/* Stats */}
                  <div className="flex gap-4 text-xs text-surface-100/30 mb-4">
                    <span>❤️ {(post.likes / 1000).toFixed(1)}K</span>
                    <span>🔄 {(post.shares / 1000).toFixed(1)}K</span>
                    <span>💬 {post.comments}</span>
                  </div>

                  {/* Actions */}
                  {!r ? (
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => handleAction(post.id, 'trust')}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition text-sm font-medium">
                        <ThumbsUp size={14} /> Trust
                      </button>
                      <button onClick={() => handleAction(post.id, 'ignore')}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-surface-700/50 text-surface-100/50 hover:bg-surface-700/80 transition text-sm font-medium">
                        <X size={14} /> Ignore
                      </button>
                      <button onClick={() => handleAction(post.id, 'fact_check')}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition text-sm font-medium">
                        <Search size={14} /> Fact-check
                      </button>
                    </div>
                  ) : (
                    <AnimatePresence>
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        className={`p-4 rounded-xl ${r.score > 0 ? 'bg-accent-500/10 border border-accent-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {r.score > 0 ? <CheckCircle size={16} className="text-accent-400" /> : <XCircle size={16} className="text-red-400" />}
                          <span className="text-sm font-medium">{r.isGenuine ? '✅ Genuine Post' : '🚨 Misinformation'}</span>
                          <span className={`ml-auto text-sm font-bold ${r.score > 0 ? 'text-accent-400' : 'text-red-400'}`}>
                            {r.score > 0 ? '+' : ''}{r.score} pts
                          </span>
                        </div>
                        <p className="text-xs text-surface-100/60 mb-1">{r.feedback}</p>
                        <p className="text-xs text-surface-100/40 italic mt-2">{r.explanation}</p>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
