require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection failed:', err.message));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});