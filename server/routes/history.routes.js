const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

// GET /api/history - list current user's review history (summary only)
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('reviewType repoFullName prNumber prTitle fileName scores status createdAt')
      .lean();

    res.status(200).json({ success: true, reviews });
  } catch (err) {
    console.error('GET /api/history error:', err);
    res.status(500).json({ success: false, message: 'Failed to load review history.' });
  }
});

// GET /api/history/:id - full details of a single past review
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, user: req.user._id }).lean();

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    res.status(200).json({ success: true, review });
  } catch (err) {
    console.error('GET /api/history/:id error:', err);
    res.status(500).json({ success: false, message: 'Failed to load review.' });
  }
});

// DELETE /api/history/:id - user deletes their own review
router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    res.status(200).json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    console.error('DELETE /api/history/:id error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
});

module.exports = router;