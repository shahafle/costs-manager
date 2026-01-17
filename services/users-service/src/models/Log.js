const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
    enum: ['error', 'warn', 'info', 'debug', 'fatal', 'trace'],
  },
  time: {
    type: Date,
    required: true,
    index: true,
  },
  pid: {
    type: Number,
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: false, // We use 'time' field instead
});

// Index for better query performance
logSchema.index({ time: -1 });
logSchema.index({ service: 1, time: -1 });
logSchema.index({ level: 1, time: -1 });

module.exports = mongoose.model('Log', logSchema);
