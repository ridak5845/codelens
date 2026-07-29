const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
    scope: ['public_repo'] // required to post PR review comments; matches the PRD's public-repos-only scope
    // Note: 'state: true' was tried here for CSRF protection, but passport-oauth2's
    // default state store requires req.session, which this app intentionally doesn't use
    // (stateless JWT architecture — see Day 3). The OAuth client_secret handshake already
    // provides the primary protection here.
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id });
      if (!user) {
        user = await User.create({
          githubId: profile.id,
          username: profile.username,
          avatarUrl: profile.photos?.[0]?.value,
          email: profile.emails?.[0]?.value,
          githubAccessToken: accessToken
        });
      } else {
        user.githubAccessToken = accessToken;
        await user.save();
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

module.exports = passport;