import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Award, AlertTriangle, TrendingUp, Shield, Brain, Users, Sparkles } from 'lucide-react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import api from '../utils/api';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function VoterReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/voter-report').then(res => setReport(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-container flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!report) return (
    <div className="page-container flex items-center justify-center min-h-[60vh]">
      <p className="text-surface-100/40">Failed to load report. Please try again.</p>
    </div>
  );

  const radarData = {
    labels: report.radarData.labels,
    datasets: [{
      label: 'Your Skills',
      data: report.radarData.values,
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderColor: '#6366f1',
      borderWidth: 2,
      pointBackgroundColor: '#6366f1',
      pointBorderColor: '#fff',
      pointHoverRadius: 6
    }]
  };

  const priorityEmoji = { education: '📚', healthcare: '🏥', defense: '🛡️', infrastructure: '🏗️', welfare: '🤝' };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
            <FileText size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Voter Report Card</h1>
            <p className="text-sm text-surface-100/50">Your personalized civic profile based on all activities</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <div className="glass-card p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-3xl">
                🗳️
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold">{report.username}</h2>
                <p className="text-sm text-surface-100/40">Member since {new Date(report.memberSince).toLocaleDateString()}</p>
                <p className="text-sm text-primary-300 mt-1">{report.votingStyle}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-xl bg-surface-900/50">
                  <div className="text-xl font-bold gradient-text">{report.totalActions}</div>
                  <div className="text-xs text-surface-100/40">Actions</div>
                </div>
                <div className="p-3 rounded-xl bg-surface-900/50">
                  <div className="text-xl font-bold gradient-text">{report.modulesExplored}</div>
                  <div className="text-xs text-surface-100/40">Modules</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Brain size={18} className="text-primary-400" /> Skill Assessment
              </h3>
              <div className="h-72">
                <Radar data={radarData} options={{
                  responsive: true, maintainAspectRatio: false,
                  scales: {
                    r: {
                      beginAtZero: true, max: 100,
                      grid: { color: 'rgba(255,255,255,0.05)' },
                      ticks: { display: false },
                      pointLabels: { color: '#94a3b8', font: { size: 11 } }
                    }
                  },
                  plugins: { legend: { display: false } }
                }} />
              </div>
            </div>

            {/* Voting Style & Priorities */}
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-400" /> Your Voting Style
                </h3>
                <p className="text-sm text-surface-100/60 leading-relaxed">{report.votingStyle}</p>
                {report.topPriorities.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs text-surface-100/40 mb-2 uppercase tracking-wider">Top Priorities</h4>
                    <div className="flex flex-wrap gap-2">
                      {report.topPriorities.map(p => (
                        <span key={p} className="px-3 py-1.5 rounded-full bg-primary-500/10 text-primary-300 text-sm capitalize">
                          {priorityEmoji[p] || '📌'} {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Scores */}
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-400" /> Module Scores
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Manipulation Detection', value: report.scores.manipulation, icon: Shield, color: 'from-red-500 to-rose-500' },
                    { label: 'Media Literacy', value: report.scores.socialMedia, icon: Users, color: 'from-violet-500 to-purple-500' },
                    { label: 'Debate Skills', value: report.scores.debate, icon: Brain, color: 'from-rose-500 to-pink-500' },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-surface-100/60">{s.label}</span>
                        <span className="font-bold text-primary-300">{s.value || 0}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${Math.min(100, s.value || 0)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Strengths & Warnings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Award size={18} className="text-accent-400" /> Your Strengths
              </h3>
              <ul className="space-y-2">
                {report.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-surface-100/60">
                    <span className="text-accent-400 mt-0.5">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-400" /> Watch Out For
              </h3>
              <ul className="space-y-2">
                {report.warnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-surface-100/60">
                    <span className="text-amber-400 mt-0.5">⚠</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recent Parties */}
          {report.recentParties.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-3">🏛️ Recent Party Creations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {report.recentParties.map((p, i) => (
                  <div key={i} className="p-3 rounded-xl bg-surface-900/50">
                    <h4 className="font-medium text-sm mb-1">{p.name}</h4>
                    <div className="flex gap-3 text-xs text-surface-100/40">
                      <span>👍 {p.scores.approval}</span>
                      <span>📊 {p.scores.economic}</span>
                      <span>🛡️ {p.scores.security}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
