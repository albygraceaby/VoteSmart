import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BuildParty from './pages/BuildParty';
import ConstituencySimulator from './pages/ConstituencySimulator';
import LawImpact from './pages/LawImpact';
import DebateSimulator from './pages/DebateSimulator';
import SpotManipulation from './pages/SpotManipulation';
import TimeTravelVoting from './pages/TimeTravelVoting';
import SocialMediaFeed from './pages/SocialMediaFeed';
import SeatPrediction from './pages/SeatPrediction';
import VoterReport from './pages/VoterReport';
import StoryMode from './pages/StoryMode';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/build-party" element={<ProtectedRoute><BuildParty /></ProtectedRoute>} />
          <Route path="/constituency" element={<ProtectedRoute><ConstituencySimulator /></ProtectedRoute>} />
          <Route path="/law-impact" element={<ProtectedRoute><LawImpact /></ProtectedRoute>} />
          <Route path="/debate" element={<ProtectedRoute><DebateSimulator /></ProtectedRoute>} />
          <Route path="/spot-manipulation" element={<ProtectedRoute><SpotManipulation /></ProtectedRoute>} />
          <Route path="/time-travel" element={<ProtectedRoute><TimeTravelVoting /></ProtectedRoute>} />
          <Route path="/social-media" element={<ProtectedRoute><SocialMediaFeed /></ProtectedRoute>} />
          <Route path="/seat-prediction" element={<ProtectedRoute><SeatPrediction /></ProtectedRoute>} />
          <Route path="/voter-report" element={<ProtectedRoute><VoterReport /></ProtectedRoute>} />
          <Route path="/story-mode" element={<ProtectedRoute><StoryMode /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
