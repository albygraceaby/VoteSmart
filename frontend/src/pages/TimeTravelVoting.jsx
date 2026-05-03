import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Vote, ChevronRight, Check, X } from 'lucide-react';
import api from '../utils/api';

export default function TimeTravelVoting() {
  const [scenario, setScenario] = useState(null);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchScenario = async (idx) => {
    try {
      const res = await api.get(`/time-travel/scenario?index=${idx}`);
      setScenario(res.data);
      setResult(null);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchScenario(0); }, []);

  const handleVote = async (candidateId) => {
    setLoading(true);
    try {
      const res = await api.post('/time-travel/vote', { scenarioId: scenario.id, candidateId });
      setResult(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const nextScenario = () => { const next = index + 1; setIndex(next); fetchScenario(next); };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <Clock size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Time Travel Voting</h1>
            <p className="text-sm text-surface-100/50">Vote in past elections, see what actually happened</p>
          </div>
        </div>

        {scenario && !result && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-sm font-medium">📅 {scenario.year}</span>
                <span className="text-xs text-surface-100/40">Scenario {scenario.currentIndex + 1}/{scenario.totalScenarios}</span>
              </div>
              <h2 className="text-xl font-bold mb-3">{scenario.title}</h2>
              <p className="text-sm text-surface-100/60 leading-relaxed">{scenario.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenario.candidates.map(c => (
                <motion.button
                  key={c.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleVote(c.id)}
                  disabled={loading}
                  className="glass-card-hover p-6 text-left"
                >
                  <div className="text-3xl mb-3">{c.id === 'A' ? '🔵' : '🔴'}</div>
                  <h3 className="text-lg font-bold mb-1">{c.name}</h3>
                  <p className="text-sm text-primary-300 mb-2">{c.party}</p>
                  <p className="text-sm text-surface-100/50 mb-3">{c.platform}</p>
                  <span className="text-xs text-surface-100/30 italic">{c.personality}</span>
                  <div className="mt-4 flex items-center gap-1 text-primary-400 text-sm font-medium">
                    <Vote size={14} /> Vote for {c.name.split(' ')[0]}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
              {/* Comparison */}
              <div className="glass-card p-6">
                <h2 className="font-semibold text-lg mb-4">📊 Election Results — {result.year}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border ${result.votedForWinner ? 'border-accent-500/30 bg-accent-500/5' : 'border-white/10 bg-surface-900/30'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">Your Choice</span>
                      {result.votedForWinner ? <Check size={14} className="text-accent-400" /> : <X size={14} className="text-red-400" />}
                    </div>
                    <h3 className="font-bold">{result.userChoice.name}</h3>
                    <p className="text-xs text-primary-300">{result.userChoice.party}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">Actual Winner</span>
                      <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded">🏆</span>
                    </div>
                    <h3 className="font-bold">{result.actualWinner.name}</h3>
                    <p className="text-xs text-primary-300">{result.actualWinner.party}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-semibold mb-2">📜 What Happened Next</h3>
                <p className="text-sm text-surface-100/60 leading-relaxed">{result.consequences}</p>
              </div>

              <div className="glass-card p-6 border border-primary-500/20">
                <h3 className="font-semibold mb-2">🎓 Lesson</h3>
                <p className="text-sm text-surface-100/60 leading-relaxed">{result.lesson}</p>
              </div>

              <button onClick={nextScenario} className="btn-primary w-full !py-3 flex items-center justify-center gap-2">
                Next Era <ChevronRight size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
