const mongoose = require('mongoose');

const costSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  userid: {
    type: Number,
    required: [true, 'User ID is required'],
    index: true,
  },
  sum: {
    type: Number,
    cast: '{VALUE} is not a valid sum. Please enter a number.',
    required: [true, 'Sum is required'],
    min: [0, 'Sum must be a positive number'],
  },
}, {
  timestamps: true,
});

// Transform to include id instead of _id
costSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

// Index for better query performance
costSchema.index({ userid: 1, createdAt: -1 });

module.exports = mongoose.model('Cost', costSchema);

