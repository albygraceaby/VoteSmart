import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Send, Trophy, XCircle, Building, Trees, Factory } from 'lucide-react';
import api from '../utils/api';

const TYPE_ICONS = { urban: Building, rural: Trees, industrial: Factory };
const TYPE_COLORS = { urban: 'from-blue-500 to-cyan-500', rural: 'from-green-500 to-emerald-500', industrial: 'from-orange-500 to-amber-500' };

export default function ConstituencySimulator() {
  const [regions, setRegions] = useState([]);
  const [allocations, setAllocations] = useState({ urban: 34, rural: 33, industrial: 33 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/constituency/regions').then(res => setRegions(res.data)).catch(() => {});
  }, []);

  const total = allocations.urban + allocations.rural + allocations.industrial;

  const handleSlider = (key, value) => {
    const newVal = parseInt(value);
    const others = ['urban', 'rural', 'industrial'].filter(k => k !== key);
    const oldOtherTotal = others.reduce((s, k) => s + allocations[k], 0);
    const newOtherTotal = 100 - newVal;
    const newAlloc = { ...allocations, [key]: newVal };
    if (oldOtherTotal > 0) {
      others.forEach(k => { newAlloc[k] = Math.max(0, Math.round((allocations[k] / oldOtherTotal) * newOtherTotal)); });
    } else {
      others.forEach((k, i) => { newAlloc[k] = i === 0 ? Math.ceil(newOtherTotal / 2) : Math.floor(newOtherTotal / 2); });
    }
    setAllocations(newAlloc);
  };

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/constituency/simulate', { allocations });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <MapPin size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Constituency Simulator</h1>
            <p className="text-sm text-surface-100/50">Allocate campaign focus and win regions strategically</p>
          </div>
        </div>

        {/* Allocation Controls */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Campaign Focus Allocation</h2>
            <span className={`text-sm font-mono px-2 py-0.5 rounded ${Math.abs(total - 100) <= 1 ? 'text-accent-400 bg-accent-400/10' : 'text-red-400 bg-red-400/10'}`}>{total}%</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['urban', 'rural', 'industrial'].map(key => {
              const Icon = TYPE_ICONS[key];
              return (
                <div key={key} className="text-center">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${TYPE_COLORS[key]} flex items-center justify-center mx-auto mb-2`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="font-medium capitalize mb-1">{key}</h3>
                  <span className="text-2xl font-bold text-primary-300">{allocations[key]}%</span>
                  <input
                    type="range" min="0" max="80" value={allocations[key]}
                    onChange={e => handleSlider(key, e.target.value)}
                    className="w-full mt-2" style={{ accentColor: key === 'urban' ? '#3b82f6' : key === 'rural' ? '#22c55e' : '#f97316' }}
                  />
                </div>
              );
            })}
          </div>
          <button onClick={handleSimulate} disabled={loading} className="btn-primary w-full mt-6 !py-3 flex items-center justify-center gap-2">
            <Send size={16} /> {loading ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>

        {/* Region Info */}
        {!result && regions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {regions.map(r => {
              const Icon = TYPE_ICONS[r.type] || Building;
              return (
                <div key={r.name} className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={16} className="text-primary-400" />
                    <h3 className="font-medium text-sm">{r.name}</h3>
                    <span className="ml-auto text-xs text-surface-100/40">{r.totalSeats} seats</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {r.keyIssues.map(issue => (
                      <span key={issue} className="text-xs px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-300">{issue}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Results */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Summary */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Election Results</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${result.wonMajority ? 'bg-accent-500/20 text-accent-400' : 'bg-red-400/20 text-red-400'}`}>
                  {result.wonMajority ? '🎉 Majority Won!' : '❌ No Majority'}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-xl bg-surface-900/50">
                  <div className="text-3xl font-bold gradient-text">{result.totalSeats}</div>
                  <div className="text-xs text-surface-100/40">Seats Won</div>
                </div>
                <div className="p-3 rounded-xl bg-surface-900/50">
                  <div className="text-3xl font-bold">{result.totalPossible}</div>
                  <div className="text-xs text-surface-100/40">Total Seats</div>
                </div>
                <div className="p-3 rounded-xl bg-surface-900/50">
                  <div className="text-3xl font-bold text-amber-400">{result.majority}</div>
                  <div className="text-xs text-surface-100/40">Majority Mark</div>
                </div>
              </div>
            </div>

            {/* Region Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.regionResults.map(r => {
                const won = r.winProbability >= 50;
                const Icon = TYPE_ICONS[r.type] || Building;
                return (
                  <motion.div
                    key={r.region}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`glass-card p-4 border ${won ? 'border-accent-500/30' : 'border-red-400/30'}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {won ? <Trophy size={16} className="text-accent-400" /> : <XCircle size={16} className="text-red-400" />}
                      <h3 className="font-medium text-sm">{r.region}</h3>
                      <span className="ml-auto text-xs capitalize px-2 py-0.5 rounded-full bg-white/5">{r.type}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-surface-100/40">Win Probability</span>
                      <span className={`text-sm font-bold ${won ? 'text-accent-400' : 'text-red-400'}`}>{r.winProbability}%</span>
                    </div>
                    <div className="progress-bar mb-3">
                      <div className="h-full rounded-full transition-all duration-1000" style={{
                        width: `${r.winProbability}%`,
                        background: won ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #ef4444, #f87171)'
                      }} />
                    </div>
                    <div className="text-center text-sm">
                      <span className="font-bold text-white">{r.seatsWon}</span>
                      <span className="text-surface-100/40"> / {r.totalSeats} seats</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
