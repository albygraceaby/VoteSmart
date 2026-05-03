import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Bot, User, Trophy } from 'lucide-react';
import api from '../utils/api';

const TOPICS = ['Jobs', 'Environment', 'Economy'];
const STANCES = ['Support', 'Oppose'];

export default function DebateSimulator() {
  const [topic, setTopic] = useState('');
  const [stance, setStance] = useState('');
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [round, setRound] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const startDebate = async () => {
    if (!topic || !stance) return;
    setLoading(true);
    try {
      const res = await api.post('/debate/start', { topic, stance });
      setMessages([
        { role: 'system', text: `Debate Topic: ${res.data.topic} | You: ${stance} | Opponent: ${res.data.opponentStance}` },
        { role: 'opponent', text: res.data.opponentArgument }
      ]);
      setRound(1);
      setStarted(true);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const sendResponse = async () => {
    if (!userInput.trim() || loading) return;
    const newMessages = [...messages, { role: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setLoading(true);

    try {
      const res = await api.post('/debate/respond', { topic, stance, round, userArgument: userInput });
      const updated = [...newMessages];
      if (res.data.counterpoint) {
        updated.push({ role: 'opponent', text: res.data.counterpoint, type: 'counterpoint' });
      }
      if (!res.data.isLastRound) {
        updated.push({ role: 'opponent', text: res.data.opponentArgument });
      }
      setMessages(updated);
      setRound(res.data.round);

      if (res.data.isLastRound) {
        setFinished(true);
        setFeedback({ score: res.data.debateScore, text: res.data.feedback });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const reset = () => {
    setTopic(''); setStance(''); setMessages([]); setRound(0);
    setStarted(false); setFinished(false); setFeedback(null);
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
            <Mic size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Debate Simulator</h1>
            <p className="text-sm text-surface-100/50">Argue your stance in a 3-round debate</p>
          </div>
        </div>

        {!started ? (
          <div className="max-w-lg mx-auto space-y-6">
            <div className="glass-card p-6">
              <h2 className="font-semibold mb-4">Choose Your Topic</h2>
              <div className="grid grid-cols-3 gap-3">
                {TOPICS.map(t => (
                  <button key={t} onClick={() => setTopic(t)}
                    className={`p-4 rounded-xl text-center transition-all ${topic === t ? 'bg-primary-500/20 border-2 border-primary-500' : 'bg-surface-900/50 border-2 border-transparent hover:border-white/10'}`}>
                    <span className="text-2xl block mb-1">{t === 'Jobs' ? '💼' : t === 'Environment' ? '🌍' : '💰'}</span>
                    <span className="text-sm font-medium">{t}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="glass-card p-6">
              <h2 className="font-semibold mb-4">Choose Your Stance</h2>
              <div className="grid grid-cols-2 gap-3">
                {STANCES.map(s => (
                  <button key={s} onClick={() => setStance(s)}
                    className={`p-4 rounded-xl text-center transition-all ${stance === s ? 'bg-primary-500/20 border-2 border-primary-500' : 'bg-surface-900/50 border-2 border-transparent hover:border-white/10'}`}>
                    <span className="text-2xl block mb-1">{s === 'Support' ? '👍' : '👎'}</span>
                    <span className="text-sm font-medium">{s}</span>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={startDebate} disabled={!topic || !stance || loading}
              className="btn-primary w-full !py-3 flex items-center justify-center gap-2">
              {loading ? 'Starting...' : 'Start Debate'} <Mic size={16} />
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* Chat Messages */}
            <div className="glass-card p-4 mb-4 max-h-[60vh] overflow-y-auto space-y-3">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    {msg.role !== 'system' && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary-500' : 'bg-rose-500'}`}>
                        {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
                      </div>
                    )}
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'system' ? 'bg-surface-900/50 text-surface-100/50 text-center mx-auto text-xs' :
                      msg.role === 'user' ? 'bg-primary-500/20 text-white' :
                      msg.type === 'counterpoint' ? 'bg-amber-500/10 text-amber-200 border border-amber-500/20' :
                      'bg-rose-500/10 text-surface-100/80 border border-rose-500/20'
                    }`}>
                      {msg.type === 'counterpoint' && <span className="text-xs text-amber-400 font-medium block mb-1">💡 Counterpoint:</span>}
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-rose-500/10 p-3 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Feedback */}
            {feedback && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <Trophy size={24} className="text-amber-400" />
                  <h2 className="font-semibold">Debate Complete!</h2>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-4xl font-bold gradient-text">{feedback.score}/100</div>
                  <div className="progress-bar flex-1"><div className="progress-bar-fill" style={{ width: `${feedback.score}%` }} /></div>
                </div>
                <p className="text-sm text-surface-100/60">{feedback.text}</p>
                <button onClick={reset} className="btn-secondary mt-4 w-full">Start New Debate</button>
              </motion.div>
            )}

            {/* Input */}
            {!finished && (
              <div className="flex gap-2">
                <input
                  type="text" value={userInput} onChange={e => setUserInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendResponse()}
                  className="input-field flex-1" placeholder={`Round ${round}/3 — Type your argument...`}
                  disabled={loading}
                />
                <button onClick={sendResponse} disabled={loading || !userInput.trim()} className="btn-primary !px-4">
                  <Send size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
