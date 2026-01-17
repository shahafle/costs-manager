const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userid: {
    type: Number,
    required: true,
    index: true,
  },
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  costs: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
}, {
  timestamps: true,
});

// Compound index for efficient lookups
reportSchema.index({ userid: 1, year: 1, month: 1 }, { unique: true });

// Transform to remove _id and __v
reportSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

module.exports = mongoose.model('Report', reportSchema);
