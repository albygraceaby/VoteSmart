import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Plus, X, TrendingUp, Users, Shield, Send } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CATEGORIES = ['education', 'healthcare', 'defense', 'infrastructure', 'welfare'];
const LABELS = { education: '📚 Education', healthcare: '🏥 Healthcare', defense: '🛡️ Defense', infrastructure: '🏗️ Infrastructure', welfare: '🤝 Welfare' };
const COLORS = { education: '#818cf8', healthcare: '#34d399', defense: '#f87171', infrastructure: '#fbbf24', welfare: '#a78bfa' };

export default function BuildParty() {
  const [name, setName] = useState('');
  const [manifesto, setManifesto] = useState(['']);
  const [budget, setBudget] = useState({ education: 20, healthcare: 20, defense: 20, infrastructure: 20, welfare: 20 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = Object.values(budget).reduce((s, v) => s + v, 0);

  const handleSlider = (key, value) => {
    const newVal = parseInt(value);
    const others = CATEGORIES.filter(c => c !== key);
    const oldOtherTotal = others.reduce((s, c) => s + budget[c], 0);
    const newOtherTotal = 100 - newVal;

    const newBudget = { ...budget, [key]: newVal };
    if (oldOtherTotal > 0) {
      others.forEach(c => {
        newBudget[c] = Math.max(0, Math.round((budget[c] / oldOtherTotal) * newOtherTotal));
      });
    } else {
      const share = Math.floor(newOtherTotal / others.length);
      others.forEach((c, i) => {
        newBudget[c] = i === others.length - 1 ? newOtherTotal - share * (others.length - 1) : share;
      });
    }
    setBudget(newBudget);
  };

  const addManifesto = () => setManifesto([...manifesto, '']);
  const removeManifesto = (i) => setManifesto(manifesto.filter((_, idx) => idx !== i));
  const updateManifesto = (i, val) => { const m = [...manifesto]; m[i] = val; setManifesto(m); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Party name is required'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/party', {
        name, manifesto: manifesto.filter(m => m.trim()), budget
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create party');
    } finally {
      setLoading(false);
    }
  };

  const chartData = result ? {
    labels: ['Approval', 'Economic', 'Security'],
    datasets: [{
      label: 'Score',
      data: [result.scores.approval, result.scores.economic, result.scores.security],
      backgroundColor: ['rgba(99,102,241,0.7)', 'rgba(52,211,153,0.7)', 'rgba(248,113,113,0.7)'],
      borderColor: ['#6366f1', '#34d399', '#f87171'],
      borderWidth: 2,
      borderRadius: 8,
    }]
  } : null;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Building2 size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Build Your Own Party</h1>
            <p className="text-sm text-surface-100/50">Create a party, set your manifesto, and allocate your budget</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="font-semibold mb-4">Party Details</h2>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                className="input-field mb-4" placeholder="Enter party name..."
              />
              <h3 className="text-sm font-medium text-surface-100/60 mb-2">Manifesto Points</h3>
              {manifesto.map((m, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="text" value={m} onChange={e => updateManifesto(i, e.target.value)}
                    className="input-field" placeholder={`Point ${i + 1}...`}
                  />
                  {manifesto.length > 1 && (
                    <button type="button" onClick={() => removeManifesto(i)} className="text-red-400 hover:text-red-300 px-2">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addManifesto} className="text-primary-400 text-sm flex items-center gap-1 hover:text-primary-300 mt-1">
                <Plus size={14} /> Add point
              </button>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Budget Allocation</h2>
                <span className={`text-sm font-mono px-2 py-0.5 rounded ${Math.abs(total - 100) <= 1 ? 'text-accent-400 bg-accent-400/10' : 'text-red-400 bg-red-400/10'}`}>
                  {total}%
                </span>
              </div>
              {CATEGORIES.map(cat => (
                <div key={cat} className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{LABELS[cat]}</span>
                    <span className="text-sm font-mono text-primary-300">{budget[cat]}%</span>
                  </div>
                  <input
                    type="range" min="0" max="80" value={budget[cat]}
                    onChange={e => handleSlider(cat, e.target.value)}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: COLORS[cat] }}
                  />
                </div>
              ))}
              {/* Visual bar */}
              <div className="flex h-4 rounded-full overflow-hidden mt-2">
                {CATEGORIES.map(cat => (
                  <div key={cat} style={{ width: `${budget[cat]}%`, backgroundColor: COLORS[cat], transition: 'width 0.3s ease' }} />
                ))}
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full !py-3 flex items-center justify-center gap-2">
              <Send size={16} /> {loading ? 'Creating...' : 'Launch Party & Calculate Scores'}
            </button>
          </form>

          {/* Results */}
          <div className="space-y-6">
            {result ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="glass-card p-6">
                  <h2 className="font-semibold mb-4 text-lg">📊 Results: {result.name}</h2>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { label: 'Approval', value: result.scores.approval, icon: Users, color: 'text-indigo-400' },
                      { label: 'Economic', value: result.scores.economic, icon: TrendingUp, color: 'text-emerald-400' },
                      { label: 'Security', value: result.scores.security, icon: Shield, color: 'text-red-400' },
                    ].map(s => (
                      <div key={s.label} className="text-center p-3 rounded-xl bg-surface-900/50">
                        <s.icon size={20} className={`mx-auto mb-1 ${s.color}`} />
                        <div className="text-2xl font-bold">{s.value}</div>
                        <div className="text-xs text-surface-100/40">{s.label}</div>
                        <div className="progress-bar mt-2">
                          <div className="progress-bar-fill" style={{ width: `${s.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="h-64">
                    <Bar data={chartData} options={{
                      responsive: true, maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                      }
                    }} />
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="font-semibold mb-2">📝 Analysis</h3>
                  <p className="text-sm text-surface-100/60 leading-relaxed">{result.summary}</p>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                <Building2 size={48} className="text-surface-100/20 mb-4" />
                <h3 className="text-lg font-semibold text-surface-100/40 mb-1">No Results Yet</h3>
                <p className="text-sm text-surface-100/30">Fill in the form and submit to see your party's scores</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
