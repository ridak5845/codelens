const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const User = require('../models/User');
const {
  getUserRepos,
  getRepoPullRequests,
  getPullRequestFiles
} = require('../services/githubService');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const repos = await getUserRepos(user.githubAccessToken);
    res.json(repos);
  } catch (err) {
    console.error('GET /api/repos failed:', err.response?.data || err.message);
    res.status(502).json({ error: 'Failed to fetch repositories from GitHub' });
  }
});

router.get('/:owner/:repo/pulls', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const { owner, repo } = req.params;
    const pulls = await getRepoPullRequests(user.githubAccessToken, owner, repo);
    res.json(pulls);
  } catch (err) {
    console.error('GET pulls failed:', err.response?.data || err.message);
    res.status(502).json({ error: 'Failed to fetch pull requests from GitHub' });
  }
});

router.get('/:owner/:repo/pulls/:number/files', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const { owner, repo, number } = req.params;
    const files = await getPullRequestFiles(user.githubAccessToken, owner, repo, number);
    res.json(files);
  } catch (err) {
    console.error('GET pull files failed:', err.response?.data || err.message);
    res.status(502).json({ error: 'Failed to fetch PR files from GitHub' });
  }
});

module.exports = router;