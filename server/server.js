require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth.routes');
const reposRoutes = require('./routes/repos.routes');
const reviewRoutes = require('./routes/review.routes');
const errorHandler = require('./middleware/errorHandler');

const REQUIRED_ENV_VARS = ['MONGO_URI', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'GITHUB_CALLBACK_URL', 'GEMINI_API_KEY', 'JWT_SECRET'];
const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
  console.error(`FATAL: Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Server cannot start safely without these. Check your .env file (local) or dashboard environment settings (Render/Vercel).');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Render sits behind a reverse proxy — required for secure cookies and correct req.ip to work.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(passport.initialize());

// Global rate limit: protects the free-tier Gemini quota and DB from abuse by anonymous traffic.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again in a few minutes.' }
});
app.use('/api', globalLimiter);

// Stricter limit on AI review calls specifically — the most expensive/quota-sensitive endpoint.
const reviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many review requests. Please wait a few minutes before trying again.' }
});
app.use('/api/review/pr', reviewLimiter);
app.use('/api/review/file', reviewLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/repos', reposRoutes);
app.use('/api/review', reviewRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Any unmatched /api/* route gets a clean JSON 404 instead of Express's default HTML page.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use(errorHandler);

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 8000 // fail fast instead of hanging 30+ seconds if the DB is unreachable
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection failed:', err.message));

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected — Mongoose will attempt to reconnect automatically.');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});