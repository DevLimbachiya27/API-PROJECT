const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  relation: {
    type: String,
    required: true,
    enum: ['spouse', 'child', 'parent', 'sibling', 'other']
  },
  age: Number,
  phone: String
});

const vehicleSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['car', 'bike', 'scooter', 'bicycle', 'other']
  },
  number: {
    type: String,
    required: true,
    uppercase: true
  },
  model: String,
  color: String
});

const residentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  flatNumber: {
    type: String,
    required: [true, 'Flat number is required'],
    trim: true
  },
  wing: {
    type: String,
    required: [true, 'Wing/Block is required'],
    uppercase: true,
    trim: true
  },
  floor: {
    type: Number,
    required: true
  },
  occupancyType: {
    type: String,
    enum: ['owner', 'tenant'],
    default: 'owner'
  },
  familyMembers: [familyMemberSchema],
  vehicles: [vehicleSchema],
  moveInDate: {
    type: Date,
    default: Date.now
  },
  moveOutDate: Date,
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Make flat+wing combination unique
residentSchema.index({ flatNumber: 1, wing: 1 }, { unique: true });

module.exports = mongoose.model('Resident', residentSchema);
