const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const User = require('../models/User');
const Review = require('../models/Review');
const { getPullRequestFiles } = require('../services/githubService');
const { reviewCode } = require('../services/aiReviewService');

const router = express.Router();
const MAX_CODE_LENGTH = 50000; // ~50KB — generous for any real single file, prevents abuse/huge prompts

router.post('/pr', requireAuth, async (req, res, next) => {
  try {
    const { owner, repo, prNumber } = req.body;

    if (!owner || typeof owner !== 'string' || !repo || typeof repo !== 'string') {
      return res.status(400).json({ error: 'owner and repo are required and must be valid strings' });
    }

    const parsedPrNumber = Number(prNumber);
    if (!prNumber || !Number.isInteger(parsedPrNumber) || parsedPrNumber <= 0) {
      return res.status(400).json({ error: 'prNumber must be a positive integer' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const files = await getPullRequestFiles(user.githubAccessToken, owner, repo, parsedPrNumber);
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No changed files found for this pull request' });
    }

    const fileChunks = files
      .filter((f) => f.patch)
      .map((f) => ({ filename: f.filename, patch: f.patch }));

    if (fileChunks.length === 0) {
      return res.status(400).json({ error: 'This pull request has no reviewable text changes (binary files or removals only)' });
    }

    const result = await reviewCode(fileChunks);

    const saved = await Review.create({
      userId: user._id,
      source: 'pr',
      repoOwner: owner,
      repoName: repo,
      prNumber: parsedPrNumber,
      scores: result.scores,
      findings: result.findings
    });

    res.json({ ...result, reviewId: saved._id });
  } catch (err) {
    console.error('POST /api/review/pr failed:', err.message);
    if (err.message.startsWith('AI_')) {
      return res.status(502).json({ error: 'AI review failed. Please try again shortly.' });
    }
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'Pull request not found, or you no longer have access to this repository' });
    }
    if (err.response?.status === 403) {
      return res.status(429).json({ error: 'GitHub API rate limit reached. Please try again in a few minutes.' });
    }
    next(err);
  }
});

router.post('/file', requireAuth, async (req, res, next) => {
  try {
    const { filename, code } = req.body;

    if (!filename || typeof filename !== 'string' || !filename.trim()) {
      return res.status(400).json({ error: 'A filename is required' });
    }
    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ error: 'Code content is required' });
    }
    if (code.length > MAX_CODE_LENGTH) {
      return res.status(400).json({ error: `Code is too large (max ${MAX_CODE_LENGTH.toLocaleString()} characters). Please review a smaller file or snippet.` });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const fileChunks = [{ filename: filename.trim(), content: code }];
    const result = await reviewCode(fileChunks);

    const saved = await Review.create({
      userId: user._id,
      source: 'file',
      fileName: filename.trim(),
      scores: result.scores,
      findings: result.findings
    });

    res.json({ ...result, reviewId: saved._id });
  } catch (err) {
    console.error('POST /api/review/file failed:', err.message);
    if (err.message.startsWith('AI_')) {
      return res.status(502).json({ error: 'AI review failed. Please try again shortly.' });
    }
    next(err);
  }
});

router.get('/history', requireAuth, async (req, res, next) => {
  try {
    const reviews = await Review.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('source repoOwner repoName prNumber fileName scores createdAt')
      .lean();
    res.json(reviews);
  } catch (err) {
    console.error('GET /api/review/history failed:', err.message);
    next(err);
  }
});

router.get('/history/:id', requireAuth, async (req, res, next) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }
    const review = await Review.findOne({ _id: req.params.id, userId: req.user.id }).lean();
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) {
    console.error('GET /api/review/history/:id failed:', err.message);
    next(err);
  }
});

module.exports = router;