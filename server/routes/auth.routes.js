const express = require('express');
const passport = require('passport');
const generateToken = require('../utils/generateToken');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

router.get('/github', passport.authenticate('github', { session: false }));

router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/' }),
  (req, res) => {
    const token = generateToken(req.user);
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',       // 'none' + secure:true in production (Day 10)
      secure: false,         // true in production
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.redirect('http://localhost:5173/dashboard');
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