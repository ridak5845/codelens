const express = require('express');
const passport = require('passport');
const generateToken = require('../utils/generateToken');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

router.get('/github', passport.authenticate('github', { session: false }));

router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/' }),
  (req, res) => {
    const token = generateToken(req.user);
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: IS_PRODUCTION ? 'none' : 'lax',
      secure: IS_PRODUCTION,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.redirect(`${CLIENT_URL}/dashboard`);
  }
);

router.get('/me', requireAuth, (req, res) => {
  res.json({ id: req.user.id, username: req.user.username });
});

router.post('/logout', requireAuth, (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

module.exports = router;