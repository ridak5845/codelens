const Review = require('../models/Review');

// Save a completed review (called internally after AI engine returns a result)
async function saveReview({
  userId,
  reviewType,
  repoFullName = null,
  prNumber = null,
  prTitle = null,
  prUrl = null,
  fileName = null,
  scores,
  findings,
  rawSummary = '',
  status = 'completed',
  errorMessage = null
}) {
  const review = new Review({
    user: userId,
    reviewType,
    repoFullName,
    prNumber,
    prTitle,
    prUrl,
    fileName,
    scores,
    findings,
    rawSummary,
    status,
    errorMessage
  });
  await review.save();
  return review;
}

// GET /api/reviews - list current user's review history (summary only)
async function getReviewHistory(req, res) {
  try {
    const userId = req.user._id;
    const reviews = await Review.find({ user: userId })
      .sort({ createdAt: -1 })
      .select('reviewType repoFullName prNumber prTitle fileName scores status createdAt')
      .lean();

    res.status(200).json({ success: true, reviews });
  } catch (err) {
    console.error('getReviewHistory error:', err);
    res.status(500).json({ success: false, message: 'Failed to load review history.' });
  }
}

// GET /api/reviews/:id - full details of a single past review
async function getReviewById(req, res) {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const review = await Review.findOne({ _id: id, user: userId }).lean();

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    res.status(200).json({ success: true, review });
  } catch (err) {
    console.error('getReviewById error:', err);
    res.status(500).json({ success: false, message: 'Failed to load review.' });
  }
}

// DELETE /api/reviews/:id - optional cleanup, user can delete their own review
async function deleteReview(req, res) {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const review = await Review.findOneAndDelete({ _id: id, user: userId });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    res.status(200).json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    console.error('deleteReview error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
}

module.exports = {
  saveReview,
  getReviewHistory,
  getReviewById,
  deleteReview
};