import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, ChevronRight, RotateCcw, Award, AlertCircle } from 'lucide-react';
import api from '../utils/api';

export default function StoryMode() {
  const [stageData, setStageData] = useState(null);
  const [currentStage, setCurrentStage] = useState(1);
  const [totalStages, setTotalStages] = useState(7);
  const [previousDecisions, setPreviousDecisions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const res = await api.get('/story-mode/progress');
      if (res.data.completed) {
        setCompleted(true);
        setPreviousDecisions(res.data.decisions || []);
      } else {
        setStageData(res.data.stageData);
        setCurrentStage(res.data.stage);
        setTotalStages(res.data.totalStages);
        setPreviousDecisions(res.data.previousDecisions || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleChoice = async (optionIndex) => {
    setAdvancing(true);
    try {
      const res = await api.post('/story-mode/advance', { stage: currentStage, optionIndex });
      setPreviousDecisions(prev => [...prev, res.data.decision]);

      if (res.data.isComplete || res.data.summary) {
        setSummary(res.data.summary);
        setCompleted(true);
      } else if (res.data.nextStageData) {
        setStageData(res.data.nextStageData);
        setCurrentStage(res.data.nextStage);
      }
    } catch (err) { console.error(err); }
    finally { setAdvancing(false); }
  };

  const resetStory = async () => {
    try {
      await api.post('/story-mode/reset');
      setCompleted(false);
      setSummary(null);
      setPreviousDecisions([]);
      fetchProgress();
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="page-container flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center">
            <Gamepad2 size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Story Mode</h1>
            <p className="text-sm text-surface-100/50">Your first-time voter journey</p>
          </div>
        </div>

        {/* Progress Bar */}
        {!completed && (
          <div className="glass-card p-4 mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-surface-100/50">Journey Progress</span>
              <span className="font-mono text-primary-300">Stage {currentStage}/{totalStages}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${(currentStage / totalStages) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          {/* Active Stage */}
          {!completed && stageData && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="glass-card p-8 text-center">
                  <div className="text-6xl mb-4">{stageData.image}</div>
                  <h2 className="text-xl font-bold mb-2">{stageData.title}</h2>
                  <p className="text-sm text-surface-100/60 leading-relaxed whitespace-pre-line">{stageData.content}</p>
                </div>

                {stageData.decision && (
                  <div className="glass-card p-6">
                    <h3 className="font-semibold mb-4 text-center">{stageData.decision}</h3>
                    <div className="space-y-3">
                      {stageData.options.map((opt, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleChoice(i)}
                          disabled={advancing}
                          className="w-full text-left p-4 rounded-xl bg-surface-900/50 border border-white/5 hover:border-primary-500/30 hover:bg-primary-500/5 transition-all flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-sm font-bold text-primary-300 shrink-0">
                            {String.fromCharCode(65 + i)}
                          </div>
                          <span className="text-sm text-surface-100/70">{opt.text}</span>
                          <ChevronRight size={16} className="text-surface-100/20 ml-auto shrink-0" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {stageData.options.length === 1 && !stageData.decision && (
                  <button onClick={() => handleChoice(0)} disabled={advancing}
                    className="btn-primary w-full !py-3 flex items-center justify-center gap-2">
                    {advancing ? 'Loading...' : stageData.options[0].text} <ChevronRight size={16} />
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Completed / Summary */}
          {completed && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="glass-card p-8 text-center">
                <div className="text-6xl mb-4">🎓</div>
                <h2 className="text-2xl font-bold mb-2">Journey Complete!</h2>
                <p className="text-surface-100/50">You've completed your first-time voter experience</p>
              </div>

              {summary && (
                <>
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Award size={18} className="text-amber-400" /> Your Grade
                      </h3>
                      <span className={`text-4xl font-black ${
                        summary.grade === 'A' ? 'text-accent-400' :
                        summary.grade === 'B' ? 'text-blue-400' :
                        summary.grade === 'C' ? 'text-amber-400' : 'text-red-400'
                      }`}>{summary.grade}</span>
                    </div>
                    <p className="text-sm text-surface-100/60 leading-relaxed">{summary.profile}</p>
                  </div>

                  {summary.biases.length > 0 && (
                    <div className="glass-card p-6 border border-amber-500/20">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertCircle size={18} className="text-amber-400" /> Bias Warnings
                      </h3>
                      <p className="text-sm text-surface-100/60">{summary.biasWarning}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {[...new Set(summary.biases)].map(b => (
                          <span key={b} className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs capitalize">
                            {b.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Decision Timeline */}
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">📜 Your Decision Timeline</h3>
                <div className="space-y-3">
                  {previousDecisions.map((d, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center text-xs text-primary-300 font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{d.title}</h4>
                        <p className="text-xs text-surface-100/40">{d.choice}</p>
                        {d.trait && <span className="text-xs text-primary-300 capitalize">Trait: {d.trait.replace(/_/g, ' ')}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={resetStory} className="btn-secondary w-full !py-3 flex items-center justify-center gap-2">
                <RotateCcw size={16} /> Restart Journey
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
