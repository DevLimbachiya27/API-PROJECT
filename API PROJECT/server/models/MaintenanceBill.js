const mongoose = require('mongoose');

const maintenanceBillSchema = new mongoose.Schema({
  resident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  flatNumber: {
    type: String,
    required: true
  },
  wing: {
    type: String,
    required: true,
    uppercase: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  breakdown: {
    maintenance: { type: Number, default: 0 },
    water: { type: Number, default: 0 },
    electricity: { type: Number, default: 0 },
    parking: { type: Number, default: 0 },
    sinkingFund: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: Date,
  status: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending'
  },
  penalty: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'bank-transfer', 'cheque', 'online'],
    default: 'online'
  },
  transactionId: String,
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Prevent duplicate bills for same flat/month/year
maintenanceBillSchema.index(
  { flatNumber: 1, wing: 1, month: 1, year: 1 },
  { unique: true }
);

module.exports = mongoose.model('MaintenanceBill', maintenanceBillSchema);
