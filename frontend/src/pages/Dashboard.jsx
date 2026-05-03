import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Building2, MapPin, Scale, Mic, Eye, Clock, Smartphone,
  BarChart3, FileText, Gamepad2, ArrowRight, Zap
} from 'lucide-react';

const modules = [
  { icon: Building2, title: 'Build Your Party', desc: 'Create a party, set budget, see approval scores', to: '/build-party', color: 'from-indigo-500 to-purple-500', emoji: '🧩' },
  { icon: MapPin, title: 'Constituency Simulator', desc: 'Allocate campaign resources across regions', to: '/constituency', color: 'from-emerald-500 to-teal-500', emoji: '🗺️' },
  { icon: Scale, title: 'Law Impact Visualizer', desc: 'See the real cost of policy decisions', to: '/law-impact', color: 'from-amber-500 to-orange-500', emoji: '🧑‍⚖️' },
  { icon: Mic, title: 'Debate Simulator', desc: 'Argue your stance against AI opponent', to: '/debate', color: 'from-rose-500 to-pink-500', emoji: '🎤' },
  { icon: Eye, title: 'Spot Manipulation', desc: 'Identify propaganda in campaign messages', to: '/spot-manipulation', color: 'from-red-500 to-rose-500', emoji: '🧠' },
  { icon: Clock, title: 'Time Travel Voting', desc: 'Vote in past elections, see what happened', to: '/time-travel', color: 'from-cyan-500 to-blue-500', emoji: '⏳' },
  { icon: Smartphone, title: 'Social Media Feed', desc: 'Navigate fake vs real political content', to: '/social-media', color: 'from-violet-500 to-purple-500', emoji: '📱' },
  { icon: BarChart3, title: 'Seat Prediction', desc: 'Parliament seat distribution engine', to: '/seat-prediction', color: 'from-blue-500 to-indigo-500', emoji: '🧮' },
  { icon: FileText, title: 'Voter Report', desc: 'Your personalized voter profile card', to: '/voter-report', color: 'from-emerald-500 to-green-500', emoji: '🎯' },
  { icon: Gamepad2, title: 'Story Mode', desc: 'Guided first-time voter experience', to: '/story-mode', color: 'from-fuchsia-500 to-pink-500', emoji: '🎮' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="page-container">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Zap size={24} className="text-primary-400" />
          <h1 className="text-3xl font-bold">Welcome back, <span className="gradient-text">{user?.username}</span></h1>
        </div>
        <p className="text-surface-100/50">Choose a module to continue your civic education journey</p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/story-mode" className="glass-card-hover p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center shrink-0">
            <Gamepad2 size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Start Story Mode</h3>
            <p className="text-xs text-surface-100/40">Guided first-time voter journey</p>
          </div>
          <ArrowRight size={16} className="text-surface-100/30 ml-auto" />
        </Link>
        <Link to="/voter-report" className="glass-card-hover p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shrink-0">
            <FileText size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">View Report Card</h3>
            <p className="text-xs text-surface-100/40">Your voter profile & strengths</p>
          </div>
          <ArrowRight size={16} className="text-surface-100/30 ml-auto" />
        </Link>
        <Link to="/build-party" className="glass-card-hover p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
            <Building2 size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Build a Party</h3>
            <p className="text-xs text-surface-100/40">Create & simulate policies</p>
          </div>
          <ArrowRight size={16} className="text-surface-100/30 ml-auto" />
        </Link>
      </motion.div>

      {/* All Modules Grid */}
      <h2 className="text-xl font-bold mb-4">All Modules</h2>
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules.map((mod) => (
          <motion.div key={mod.title} variants={item}>
            <Link to={mod.to} className="glass-card-hover p-5 flex flex-col h-full block">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center shrink-0`}>
                  <mod.icon size={18} className="text-white" />
                </div>
                <span className="text-2xl">{mod.emoji}</span>
              </div>
              <h3 className="font-semibold text-white mb-1">{mod.title}</h3>
              <p className="text-xs text-surface-100/50 mb-3 flex-1">{mod.desc}</p>
              <div className="flex items-center gap-1 text-primary-400 text-xs font-medium">
                Launch <ArrowRight size={12} />
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
