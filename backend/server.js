require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));

// CORS — allow dev origins + production CLIENT_URL
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, same-origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return callback(null, true);
    }
    callback(null, false);
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));

// ─── API Routes ────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/party', require('./routes/party'));
app.use('/api/constituency', require('./routes/constituency'));
app.use('/api/law', require('./routes/law'));
app.use('/api/debate', require('./routes/debate'));
app.use('/api/manipulation', require('./routes/manipulation'));
app.use('/api/time-travel', require('./routes/timeTravel'));
app.use('/api/social-media', require('./routes/socialMedia'));
app.use('/api/seat-prediction', require('./routes/seatPrediction'));
app.use('/api/voter-report', require('./routes/voterReport'));
app.use('/api/story-mode', require('./routes/storyMode'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'VoteSmart API is running', timestamp: new Date() });
});

// ─── Error handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// ─── Serve frontend in production ──────────────────────────
const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
const fs = require('fs');

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  // SPA catch-all — only for non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
  console.log('📦 Serving frontend from:', frontendPath);
} else {
  console.log('⚠️  Frontend build not found. Run "npm run build" in /frontend to enable production mode.');
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 VoteSmart API running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
