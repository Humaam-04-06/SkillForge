require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const helmet = require('helmet');
const corsMiddleware = require('./middleware/cors');
const { initChallengeScheduler } = require('./services/challengeScheduler');

// Require Passport Configuration
require('./config/passport');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillforge';

// Database Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB database successfully.'))
  .catch(err => console.error('MongoDB database connection error:', err));

// Global Security & Request Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Deactivate in development if it interferes with client communication
}));
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Session Management (using connect-mongo to save sessions)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_express_session_secret_key_change_me',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60 // 14 days
  }),
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Mount API Routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/github', require('./routes/github'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/roadmap', require('./routes/roadmap'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/settings', require('./routes/settings'));

// Base status route
app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'SkillForge API Backend', timestamp: new Date() });
});

// 404 Fallback Route Handler
app.use((req, res, next) => {
  res.status(404).json({ message: `API route ${req.method} ${req.url} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ message: 'Internal Server Error.', error: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`  SKILLFORGE SERVER STARTED ON PORT: ${PORT}`);
  console.log(`  CLIENT_URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log(`===================================================`);
  
  // Initialize cron daily scheduler
  initChallengeScheduler();
});
