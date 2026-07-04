const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  votes: {
    type: Number,
    default: 0
  }
});

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Poll question is required'],
    trim: true,
    maxlength: [300, 'Question cannot exceed 300 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  options: {
    type: [optionSchema],
    validate: {
      validator: function (opts) {
        return opts.length >= 2 && opts.length <= 6;
      },
      message: 'A poll must have between 2 and 6 options'
    }
  },
  voters: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    optionIndex: Number,
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiryDate: {
    type: Date,
    required: [true, 'Poll expiry date is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['event-planning', 'budget', 'vendor', 'community', 'general'],
    default: 'general'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Poll', pollSchema);
