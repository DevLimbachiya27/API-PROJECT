const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notice title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  content: {
    type: String,
    required: [true, 'Notice content is required'],
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: true,
    enum: ['notice', 'alert', 'event', 'meeting', 'maintenance'],
    default: 'notice'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  attachments: [{
    type: String
  }],
  expiryDate: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Show newest notices first
noticeSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notice', noticeSchema);
