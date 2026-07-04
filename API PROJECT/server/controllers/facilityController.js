const FacilityBooking = require('../models/FacilityBooking');
const Notification = require('../models/Notification');

// Facility details with capacity and rates
const FACILITY_INFO = {
  'clubhouse': { name: 'Club House', capacity: 50, ratePerHour: 500 },
  'gymnasium': { name: 'Gymnasium', capacity: 20, ratePerHour: 0 },
  'community-hall': { name: 'Community Hall', capacity: 200, ratePerHour: 1000 },
  'swimming-pool': { name: 'Swimming Pool', capacity: 30, ratePerHour: 200 },
  'sports-court': { name: 'Sports Court', capacity: 10, ratePerHour: 300 },
  'garden-area': { name: 'Garden Area', capacity: 100, ratePerHour: 800 },
  'party-lawn': { name: 'Party Lawn', capacity: 150, ratePerHour: 1500 },
  'meeting-room': { name: 'Meeting Room', capacity: 15, ratePerHour: 200 }
};

// @desc    Get all available facilities
// @route   GET /api/facilities
// @access  Private
exports.getFacilities = async (req, res) => {
  try {
    const facilities = Object.entries(FACILITY_INFO).map(([key, info]) => ({
      id: key,
      ...info
    }));

    res.json({
      success: true,
      facilities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching facilities'
    });
  }
};

// @desc    Check facility availability
// @route   GET /api/facilities/availability
// @access  Private
exports.checkAvailability = async (req, res) => {
  try {
    const { facility, date } = req.query;

    if (!facility || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide facility and date'
      });
    }

    const queryDate = new Date(date);
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

    // Find existing bookings for that date
    const bookings = await FacilityBooking.find({
      facility,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'approved'] }
    }).select('startTime endTime status bookedBy')
      .populate('bookedBy', 'name');

    res.json({
      success: true,
      facility: FACILITY_INFO[facility]?.name || facility,
      date: date,
      bookedSlots: bookings,
      facilityInfo: FACILITY_INFO[facility]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking availability'
    });
  }
};

// @desc    Book a facility
// @route   POST /api/facilities/book
// @access  Private/Resident
exports.bookFacility = async (req, res) => {
  try {
    const { facility, date, startTime, endTime, purpose, numberOfGuests, flatNumber, wing } = req.body;

    // Check for time conflicts
    const bookingDate = new Date(date);
    const dayStart = new Date(bookingDate.setHours(0, 0, 0, 0));
    const dayEnd = new Date(bookingDate.setHours(23, 59, 59, 999));

    const conflicting = await FacilityBooking.findOne({
      facility,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (conflicting) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose a different time.'
      });
    }

    // Calculate charges based on duration
    const facilityRate = FACILITY_INFO[facility]?.ratePerHour || 0;
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    const hours = endHour - startHour;
    const charges = hours * facilityRate;

    const booking = await FacilityBooking.create({
      facility,
      bookedBy: req.user.id,
      flatNumber,
      wing,
      date: new Date(date),
      startTime,
      endTime,
      purpose,
      numberOfGuests,
      charges
    });

    res.status(201).json({
      success: true,
      message: 'Booking request submitted. Awaiting admin approval.',
      booking
    });
  } catch (error) {
    console.error('Book facility error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating booking'
    });
  }
};

// @desc    Get all bookings
// @route   GET /api/facilities/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    const { facility, status, date } = req.query;
    let query = {};

    // Residents see their own bookings
    if (req.user.role === 'resident') {
      query.bookedBy = req.user.id;
    }

    if (facility) query.facility = facility;
    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd = new Date(d.setHours(23, 59, 59, 999));
      query.date = { $gte: dayStart, $lte: dayEnd };
    }

    const bookings = await FacilityBooking.find(query)
      .populate('bookedBy', 'name email')
      .populate('approvedBy', 'name')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings'
    });
  }
};

// @desc    Approve or reject booking
// @route   PUT /api/facilities/bookings/:id/approve
// @access  Private/Admin
exports.approveBooking = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const booking = await FacilityBooking.findByIdAndUpdate(
      req.params.id,
      {
        status,
        approvedBy: req.user.id,
        remarks
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Notify the resident
    const facilityName = FACILITY_INFO[booking.facility]?.name || booking.facility;
    await Notification.create({
      recipient: booking.bookedBy,
      title: `Booking ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your booking for ${facilityName} on ${new Date(booking.date).toLocaleDateString()} has been ${status}. ${remarks || ''}`,
      type: 'booking-confirmation',
      relatedId: booking._id,
      relatedModel: 'FacilityBooking'
    });

    res.json({
      success: true,
      message: `Booking ${status}`,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating booking'
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/facilities/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await FacilityBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only the person who booked or admin can cancel
    if (req.user.role !== 'admin' && booking.bookedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled',
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking'
    });
  }
};
