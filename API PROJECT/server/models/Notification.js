const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'visitor-approval',
      'complaint-update',
      'payment-reminder',
      'booking-confirmation',
      'notice',
      'poll',
      'general'
    ],
    default: 'general'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  relatedModel: {
    type: String,
    enum: ['Visitor', 'Complaint', 'MaintenanceBill', 'FacilityBooking', 'Notice', 'Poll']
  }
}, {
  timestamps: true
});

// Show unread and newest first
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
