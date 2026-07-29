const mongoose = require('mongoose');

const findingSchema = new mongoose.Schema({
  category: { type: String, enum: ['bug', 'security', 'performance', 'quality'], required: true },
  file: { type: String, required: true },
  line: { type: Number, default: null },
  message: { type: String, required: true }
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  source: { type: String, enum: ['pr', 'file'], required: true },

  // present when source === 'pr'
  repoOwner: { type: String },
  repoName: { type: String },
  prNumber: { type: Number },
  prTitle: { type: String },

  // present when source === 'file'
  fileName: { type: String },

  scores: {
    security: { type: Number, min: 0, max: 100, required: true },
    performance: { type: Number, min: 0, max: 100, required: true },
    maintainability: { type: Number, min: 0, max: 100, required: true }
  },
  findings: [findingSchema],

  createdAt: { type: Date, default: Date.now, index: true }
});

reviewSchema.index({ userId: 1, createdAt: -1,
  published: { type: Boolean, default: false },
  publishedAt: { type: Date, default: null }, 
comparedToReviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', default: null },
  diffSummary: {
    resolvedCount: { type: Number, default: null },
    newCount: { type: Number, default: null },
    unchangedCount: { type: Number, default: null },
    scoreDeltas: {
      security: { type: Number, default: null },
      performance: { type: Number, default: null },
      maintainability: { type: Number, default: null }
    }
  },
});

module.exports = mongoose.model('Review', reviewSchema);