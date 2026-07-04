const express = require('express');
const router = express.Router();
const {
  getFacilities,
  checkAvailability,
  bookFacility,
  getBookings,
  approveBooking,
  cancelBooking
} = require('../controllers/facilityController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// List all facilities
router.get('/', getFacilities);

// Check availability
router.get('/availability', checkAvailability);

// Book a facility
router.post('/book', authorize('resident'), bookFacility);

// Get bookings
router.get('/bookings', getBookings);

// Admin approves/rejects
router.put('/bookings/:id/approve', authorize('admin'), approveBooking);

// Cancel booking
router.put('/bookings/:id/cancel', cancelBooking);

module.exports = router;
