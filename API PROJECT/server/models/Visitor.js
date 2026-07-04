const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Visitor name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  purpose: {
    type: String,
    required: [true, 'Purpose of visit is required'],
    enum: ['guest', 'delivery', 'service', 'cab', 'other'],
    default: 'guest'
  },
  visitingFlat: {
    type: String,
    required: [true, 'Visiting flat number is required']
  },
  visitingWing: {
    type: String,
    required: true,
    uppercase: true
  },
  resident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  entryTime: {
    type: Date,
    default: Date.now
  },
  exitTime: Date,
  vehicleNumber: String,
  numberOfVisitors: {
    type: Number,
    default: 1
  },
  photo: String,
  remarks: String
}, {
  timestamps: true
});

// Index for faster querying by date and flat
visitorSchema.index({ entryTime: -1 });
visitorSchema.index({ visitingFlat: 1, visitingWing: 1 });

module.exports = mongoose.model('Visitor', visitorSchema);
