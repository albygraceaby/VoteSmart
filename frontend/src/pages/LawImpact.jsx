import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scale, DollarSign, Users, TrendingUp } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import api from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function LawImpact() {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState('');
  const [budgetAllocation, setBudgetAllocation] = useState(50);
  const [taxRate, setTaxRate] = useState(50);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/law/policies').then(res => { setPolicies(res.data); if (res.data.length) setSelectedPolicy(res.data[0].id); }).catch(() => {});
  }, []);

  const handleSimulate = async () => {
    if (!selectedPolicy) return;
    setLoading(true);
    try {
      const res = await api.post('/law/simulate', { policyId: selectedPolicy, budgetAllocation, taxRate });
      setResult(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const chartData = result ? {
    labels: result.chartData.labels,
    datasets: [
      {
        label: 'Cost ($B)', data: result.chartData.costs,
        borderColor: '#f87171', backgroundColor: 'rgba(248,113,113,0.1)',
        fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6
      },
      {
        label: 'Benefit Score', data: result.chartData.benefits,
        borderColor: '#34d399', backgroundColor: 'rgba(52,211,153,0.1)',
        fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6
      }
    ]
  } : null;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Scale size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Law Impact Visualizer</h1>
            <p className="text-sm text-surface-100/50">See the real cost and benefit of policy decisions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="font-semibold mb-4">Select Policy</h2>
              <div className="space-y-2">
                {policies.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPolicy(p.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${selectedPolicy === p.id ? 'bg-primary-500/20 border border-primary-500/40' : 'bg-surface-900/30 border border-transparent hover:border-white/10'}`}
                  >
                    <h3 className="font-medium text-sm">{p.name}</h3>
                    <p className="text-xs text-surface-100/40 mt-0.5">{p.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="font-semibold mb-4">Adjust Parameters</h2>
              <div className="mb-5">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-surface-100/60">💰 Budget Allocation</span>
                  <span className="font-mono text-primary-300">{budgetAllocation}%</span>
                </div>
                <input type="range" min="10" max="100" value={budgetAllocation} onChange={e => setBudgetAllocation(+e.target.value)} className="w-full" style={{ accentColor: '#f59e0b' }} />
                <div className="flex justify-between text-xs text-surface-100/30 mt-1"><span>Low</span><span>High</span></div>
              </div>
              <div className="mb-5">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-surface-100/60">📊 Tax Rate</span>
                  <span className="font-mono text-primary-300">{taxRate}%</span>
                </div>
                <input type="range" min="10" max="100" value={taxRate} onChange={e => setTaxRate(+e.target.value)} className="w-full" style={{ accentColor: '#6366f1' }} />
                <div className="flex justify-between text-xs text-surface-100/30 mt-1"><span>Low</span><span>High</span></div>
              </div>
              <button onClick={handleSimulate} disabled={loading} className="btn-primary w-full !py-3">
                {loading ? 'Simulating...' : 'Simulate Impact'}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {result ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="glass-card p-6">
                  <h2 className="font-semibold mb-4">{result.policy} — Impact</h2>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { label: 'Government Cost', value: result.analysis.costLabel, icon: DollarSign, color: 'text-amber-400' },
                      { label: 'Tax Impact', value: result.analysis.taxLabel, icon: TrendingUp, color: result.results.taxBurden >= 0 ? 'text-red-400' : 'text-green-400' },
                      { label: 'Population Benefit', value: result.analysis.benefitLabel, icon: Users, color: 'text-emerald-400' },
                      { label: 'GDP Impact', value: `${result.results.gdpImpact > 0 ? '+' : ''}${result.results.gdpImpact}%`, icon: TrendingUp, color: result.results.gdpImpact >= 0 ? 'text-emerald-400' : 'text-red-400' },
                    ].map(s => (
                      <div key={s.label} className="p-3 rounded-xl bg-surface-900/50 text-center">
                        <s.icon size={18} className={`mx-auto mb-1 ${s.color}`} />
                        <div className="text-sm font-bold">{s.value}</div>
                        <div className="text-xs text-surface-100/40">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="h-64">
                    <Line data={chartData} options={{
                      responsive: true, maintainAspectRatio: false,
                      plugins: { legend: { labels: { color: '#94a3b8' } } },
                      scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                      }
                    }} />
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="font-semibold mb-3">📋 Analysis</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="text-accent-400 font-medium mb-1">Who Benefits</h4>
                      <p className="text-surface-100/60">{result.analysis.beneficiaries}</p>
                    </div>
                    <div>
                      <h4 className="text-amber-400 font-medium mb-1">Trade-offs</h4>
                      <p className="text-surface-100/60">{result.analysis.tradeoffs}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <Scale size={48} className="text-surface-100/20 mb-4" />
                <h3 className="text-lg font-semibold text-surface-100/40">Select a policy and simulate</h3>
                <p className="text-sm text-surface-100/30 mt-1">Adjust budget and tax sliders to see impact</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
