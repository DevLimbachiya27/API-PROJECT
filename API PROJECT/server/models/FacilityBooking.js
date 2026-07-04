const mongoose = require('mongoose');

const facilityBookingSchema = new mongoose.Schema({
  facility: {
    type: String,
    required: [true, 'Please select a facility'],
    enum: [
      'clubhouse',
      'gymnasium',
      'community-hall',
      'swimming-pool',
      'sports-court',
      'garden-area',
      'party-lawn',
      'meeting-room'
    ]
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  flatNumber: String,
  wing: String,
  date: {
    type: Date,
    required: [true, 'Booking date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  },
  purpose: {
    type: String,
    trim: true,
    maxlength: [200, 'Purpose cannot exceed 200 characters']
  },
  numberOfGuests: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  remarks: String,
  charges: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index to check for overlapping bookings
facilityBookingSchema.index({ facility: 1, date: 1, status: 1 });

module.exports = mongoose.model('FacilityBooking', facilityBookingSchema);
