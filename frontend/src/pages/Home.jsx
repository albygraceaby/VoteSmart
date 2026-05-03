import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Vote, Building2, MapPin, Scale, Mic, Eye, Clock, Smartphone,
  BarChart3, FileText, Gamepad2, ArrowRight, Sparkles, Shield
} from 'lucide-react';

const modules = [
  { icon: Building2, title: 'Build Your Party', desc: 'Create a political party, set manifesto, allocate budgets', to: '/build-party', color: 'from-indigo-500 to-purple-500' },
  { icon: MapPin, title: 'Constituency Sim', desc: 'Strategize campaign focus across regions', to: '/constituency', color: 'from-emerald-500 to-teal-500' },
  { icon: Scale, title: 'Law Impact', desc: 'Visualize policy costs, benefits, and trade-offs', to: '/law-impact', color: 'from-amber-500 to-orange-500' },
  { icon: Mic, title: 'Debate Arena', desc: 'Debate AI opponents on key political topics', to: '/debate', color: 'from-rose-500 to-pink-500' },
  { icon: Eye, title: 'Spot Manipulation', desc: 'Identify propaganda tactics in campaign messages', to: '/spot-manipulation', color: 'from-red-500 to-rose-500' },
  { icon: Clock, title: 'Time Travel Vote', desc: 'Vote in historical elections, see consequences', to: '/time-travel', color: 'from-cyan-500 to-blue-500' },
  { icon: Smartphone, title: 'Social Media Sim', desc: 'Navigate misinformation in a simulated feed', to: '/social-media', color: 'from-violet-500 to-purple-500' },
  { icon: BarChart3, title: 'Seat Prediction', desc: 'See parliament seat distribution from your results', to: '/seat-prediction', color: 'from-blue-500 to-indigo-500' },
  { icon: FileText, title: 'Voter Report', desc: 'Get your personalized voter profile card', to: '/voter-report', color: 'from-emerald-500 to-green-500' },
  { icon: Gamepad2, title: 'Story Mode', desc: 'Guided first-time voter journey', to: '/story-mode', color: 'from-fuchsia-500 to-pink-500' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Hero */}
      <section className="relative page-container flex flex-col items-center text-center pt-16 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-sm text-primary-300 mb-6">
            <Sparkles size={14} /> Interactive Civic Education
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Learn Democracy<br />
            <span className="gradient-text">By Doing It</span>
          </h1>
          <p className="text-lg md:text-xl text-surface-100/60 max-w-2xl mx-auto mb-8">
            Build parties, debate policies, spot fake news, predict elections — 
            10 interactive modules that make civic education engaging and unforgettable.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {user ? (
              <Link to="/dashboard" className="btn-primary text-lg !px-8 !py-3 flex items-center gap-2">
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-lg !px-8 !py-3 flex items-center gap-2">
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-secondary text-lg !px-8 !py-3">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="grid grid-cols-3 gap-6 mt-16 w-full max-w-lg"
        >
          {[
            { label: 'Modules', value: '10' },
            { label: 'Scenarios', value: '50+' },
            { label: 'Skills', value: '6' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold gradient-text">{s.value}</div>
              <div className="text-sm text-surface-100/40">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Modules Grid */}
      <section className="page-container pt-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="gradient-text">10 Interactive Modules</span>
          </h2>
          <p className="text-surface-100/50">Each module builds a different civic thinking skill</p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
        >
          {modules.map((mod) => (
            <motion.div key={mod.title} variants={item}>
              <Link
                to={user ? mod.to : '/register'}
                className="glass-card-hover p-5 flex flex-col items-start h-full block"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center mb-3`}>
                  <mod.icon size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{mod.title}</h3>
                <p className="text-xs text-surface-100/50 leading-relaxed">{mod.desc}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="page-container pb-20">
        <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-accent-500/10"></div>
          <div className="relative z-10">
            <Shield size={40} className="text-primary-400 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to become a smarter voter?</h2>
            <p className="text-surface-100/50 mb-6 max-w-lg mx-auto">
              Join VoteSmart and build the critical thinking skills every citizen needs in a democracy.
            </p>
            <Link to={user ? '/dashboard' : '/register'} className="btn-primary !px-8 !py-3 inline-flex items-center gap-2">
              {user ? 'Open Dashboard' : 'Start Learning Now'} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
