const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const User = require('../models/User');
const { getPullRequestFiles } = require('../services/githubService');
const { reviewCode } = require('../services/aiReviewService');

const router = express.Router();

router.post('/pr', requireAuth, async (req, res) => {
  try {
    const { owner, repo, prNumber } = req.body;
    if (!owner || !repo || !prNumber) {
      return res.status(400).json({ error: 'owner, repo, and prNumber are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const files = await getPullRequestFiles(user.githubAccessToken, owner, repo, prNumber);
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No changed files found for this pull request' });
    }

    const fileChunks = files
      .filter((f) => f.patch)
      .map((f) => ({ filename: f.filename, patch: f.patch }));

    const result = await reviewCode(fileChunks);
    res.json(result);
  } catch (err) {
    console.error('POST /api/review/pr failed:', err.message);
    if (err.message.startsWith('AI_')) {
      return res.status(502).json({ error: 'AI review failed. Please try again shortly.' });
    }
    res.status(502).json({ error: 'Failed to complete review' });
  }
});

router.post('/file', requireAuth, async (req, res) => {
  try {
    const { filename, code } = req.body;
    if (!filename || !code) {
      return res.status(400).json({ error: 'filename and code are required' });
    }

    const fileChunks = [{ filename, content: code }];
    const result = await reviewCode(fileChunks);
    res.json(result);
  } catch (err) {
    console.error('POST /api/review/file failed:', err.message);
    if (err.message.startsWith('AI_')) {
      return res.status(502).json({ error: 'AI review failed. Please try again shortly.' });
    }
    res.status(502).json({ error: 'Failed to complete review' });
  }
});

module.exports = router;