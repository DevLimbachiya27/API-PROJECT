const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Complaint title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please describe the issue'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'electrical',
      'plumbing',
      'water-supply',
      'cleaning',
      'security',
      'parking',
      'lift',
      'pest-control',
      'noise',
      'other'
    ]
  },
  images: [{
    type: String
  }],
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  flatNumber: String,
  wing: String,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['open', 'assigned', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  comments: [commentSchema],
  resolvedAt: Date,
  closedAt: Date
}, {
  timestamps: true
});

// Index for efficient filtering
complaintSchema.index({ status: 1 });
complaintSchema.index({ raisedBy: 1 });
complaintSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
