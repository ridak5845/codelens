const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const User = require('../models/User');
const Review = require('../models/Review');
const { getPullRequestFiles, getPullRequest, postReviewComments } = require('../services/githubService');
const { reviewCode } = require('../services/aiReviewService');
const { getValidCommentLines } = require('../utils/diffLines');
const { compareFindings, compareScores } = require('../services/reviewComparisonService');

const router = express.Router();
const MAX_CODE_LENGTH = 50000;

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

    const previousReview = await Review.findOne({
      userId: user._id,
      source: 'pr',
      repoOwner: owner,
      repoName: repo,
      prNumber: parsedPrNumber
    }).sort({ createdAt: -1 });

    const reviewData = {
      userId: user._id,
      source: 'pr',
      repoOwner: owner,
      repoName: repo,
      prNumber: parsedPrNumber,
      scores: result.scores,
      findings: result.findings
    };

    let comparison = null;
    if (previousReview) {
      const diff = compareFindings(previousReview.findings, result.findings);
      const scoreDeltas = compareScores(previousReview.scores, result.scores);
      comparison = { ...diff, scoreDeltas };
      reviewData.comparedToReviewId = previousReview._id;
      reviewData.diffSummary = {
        resolvedCount: diff.resolvedCount,
        newCount: diff.newCount,
        unchangedCount: diff.unchangedCount,
        scoreDeltas
      };
    }

    const saved = await Review.create(reviewData);

    res.json({ ...result, reviewId: saved._id, comparison });
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
      .select('source repoOwner repoName prNumber fileName scores createdAt published diffSummary')
      .lean();
    res.json(reviews);
  } catch (err) {
    console.error('GET /api/review/history failed:', err.message);
    next(err);
  }
});

// STRETCH PRIORITY 3: must come before /:reviewId/publish so Express doesn't treat "analytics" as an ID
router.get('/analytics', requireAuth, async (req, res, next) => {
  try {
    const reviews = await Review.find({ userId: req.user.id })
      .sort({ createdAt: 1 })
      .select('scores findings createdAt source repoName fileName prNumber')
      .lean();

    if (reviews.length === 0) {
      return res.json({ totalReviews: 0, categoryCounts: {}, scoreTrend: [] });
    }

    const categoryCounts = { bug: 0, security: 0, performance: 0, quality: 0 };
    reviews.forEach((review) => {
      (review.findings || []).forEach((finding) => {
        if (categoryCounts[finding.category] !== undefined) {
          categoryCounts[finding.category] += 1;
        }
      });
    });

    const recentReviews = reviews.slice(-10);
    const scoreTrend = recentReviews.map((review, index) => ({
      index: index + 1,
      label: review.source === 'pr' ? `PR #${review.prNumber}` : review.fileName,
      date: review.createdAt,
      security: review.scores.security,
      performance: review.scores.performance,
      maintainability: review.scores.maintainability
    }));

    res.json({
      totalReviews: reviews.length,
      categoryCounts,
      scoreTrend
    });
  } catch (err) {
    console.error('GET /api/review/analytics failed:', err.message);
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

router.post('/:reviewId/publish', requireAuth, async (req, res, next) => {
  try {
    if (!req.params.reviewId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }

    const review = await Review.findOne({ _id: req.params.reviewId, userId: req.user.id });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.source !== 'pr') {
      return res.status(400).json({ error: 'Only PR-based reviews can be published to GitHub' });
    }
    if (review.published) {
      return res.status(400).json({ error: 'This review has already been published to GitHub' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const [files, prDetails] = await Promise.all([
      getPullRequestFiles(user.githubAccessToken, review.repoOwner, review.repoName, review.prNumber),
      getPullRequest(user.githubAccessToken, review.repoOwner, review.repoName, review.prNumber)
    ]);

    const validLinesByFile = {};
    files.forEach((f) => {
      validLinesByFile[f.filename] = getValidCommentLines(f.patch);
    });

    const commentable = review.findings.filter((f) => {
      if (!f.line) return false;
      const validLines = validLinesByFile[f.file];
      return validLines && validLines.has(f.line);
    });

    if (commentable.length === 0) {
      return res.status(400).json({
        error: 'None of this review\'s findings have line numbers that fall within the PR\'s current diff. The PR may have changed since this review ran — try running a fresh review first.'
      });
    }

    const comments = commentable.map((f) => ({
      path: f.file,
      line: f.line,
      side: 'RIGHT',
      body: `**[${f.category.toUpperCase()}]** ${f.message}\n\n*— Posted automatically by CodeLens*`
    }));

    await postReviewComments(user.githubAccessToken, review.repoOwner, review.repoName, review.prNumber, prDetails.headSha, comments);

    review.published = true;
    review.publishedAt = new Date();
    await review.save();

    res.json({ posted: comments.length, skipped: review.findings.length - commentable.length });
  } catch (err) {
    console.error('POST /api/review/:reviewId/publish failed:', err.message);
    if (err.response?.status === 422) {
      return res.status(422).json({ error: 'GitHub rejected the comments — the PR may have new commits since this review ran. Try running a fresh review.' });
    }
    if (err.response?.status === 403 || err.response?.status === 404) {
      return res.status(403).json({ error: 'GitHub denied permission to post comments on this repository. Try logging out and back in to refresh permissions.' });
    }
    next(err);
  }
});

module.exports = router;