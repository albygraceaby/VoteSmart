import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ChevronRight, ChevronLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import api from '../utils/api';

const TYPE_LABELS = { emotional_appeal: '😢 Emotional Appeal', false_claim: '❌ False Claim', misuse_of_data: '📊 Misuse of Data' };
const TYPE_COLORS = { emotional_appeal: 'bg-amber-500/20 text-amber-300 border-amber-500/30', false_claim: 'bg-red-500/20 text-red-300 border-red-500/30', misuse_of_data: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };

export default function SpotManipulation() {
  const [scenario, setScenario] = useState(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  const fetchScenario = async (idx) => {
    try {
      const res = await api.get(`/manipulation/scenario?index=${idx}`);
      setScenario(res.data);
      setSelected([]);
      setResult(null);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchScenario(0); }, []);

  const toggleSelect = (type) => {
    setSelected(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const submitAnswer = async () => {
    if (!selected.length) return;
    setLoading(true);
    try {
      const res = await api.post('/manipulation/answer', { scenarioId: scenario.id, selectedManipulations: selected });
      setResult(res.data);
      setTotalScore(prev => prev + res.data.score);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const nextScenario = () => {
    const next = index + 1;
    setIndex(next);
    fetchScenario(next);
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
            <Eye size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Spot the Manipulation</h1>
            <p className="text-sm text-surface-100/50">Identify propaganda tactics in campaign messages</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold gradient-text">{totalScore}</div>
            <div className="text-xs text-surface-100/40">Total Score</div>
          </div>
        </div>

        {scenario && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Scenario Card */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-surface-100/40 capitalize">
                  📄 {scenario.type?.replace('_', ' ') || 'Message'} — Scenario {scenario.currentIndex + 1}/{scenario.totalScenarios}
                </span>
              </div>
              <div className="p-5 rounded-xl bg-surface-900/60 border border-white/5 text-surface-100/80 leading-relaxed italic text-[15px]">
                "{scenario.content}"
              </div>
            </div>

            {/* Selection */}
            {!result && (
              <div className="glass-card p-6">
                <h2 className="font-semibold mb-3">What manipulation tactics do you see?</h2>
                <p className="text-xs text-surface-100/40 mb-4">Select all that apply</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  {scenario.options.map(type => (
                    <button key={type} onClick={() => toggleSelect(type)}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        selected.includes(type) ? TYPE_COLORS[type] + ' border-current' : 'border-transparent bg-surface-900/50 hover:border-white/10'
                      }`}>
                      <span className="text-lg block mb-1">{TYPE_LABELS[type].split(' ')[0]}</span>
                      <span className="text-sm font-medium">{TYPE_LABELS[type].substring(2)}</span>
                    </button>
                  ))}
                </div>
                <button onClick={submitAnswer} disabled={!selected.length || loading} className="btn-primary w-full !py-3">
                  {loading ? 'Checking...' : 'Submit Answer'}
                </button>
              </div>
            )}

            {/* Result */}
            <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                      {result.score >= 70 ? <CheckCircle className="text-accent-400" /> : result.score >= 40 ? <AlertTriangle className="text-amber-400" /> : <XCircle className="text-red-400" />}
                      <div>
                        <h2 className="font-semibold">Score: {result.score}/100</h2>
                        <p className="text-sm text-surface-100/50">{result.feedback}</p>
                      </div>
                    </div>
                    <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${result.score}%` }} /></div>
                  </div>

                  {result.correctManipulations.map((m, i) => (
                    <div key={i} className={`glass-card p-4 border ${TYPE_COLORS[m.type]}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">{TYPE_LABELS[m.type]}</span>
                        {selected.includes(m.type) ? <CheckCircle size={14} className="text-accent-400" /> : <XCircle size={14} className="text-red-400" />}
                      </div>
                      <p className="text-sm text-surface-100/70 mb-1 font-medium italic">"{m.highlight}"</p>
                      <p className="text-xs text-surface-100/50">{m.explanation}</p>
                    </div>
                  ))}

                  <button onClick={nextScenario} className="btn-primary w-full !py-3 flex items-center justify-center gap-2">
                    Next Scenario <ChevronRight size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
