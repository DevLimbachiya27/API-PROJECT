const Visitor = require('../models/Visitor');
const Notification = require('../models/Notification');
const Resident = require('../models/Resident');

// @desc    Register new visitor
// @route   POST /api/visitors
// @access  Private/Security
exports.registerVisitor = async (req, res) => {
  try {
    const {
      name, phone, purpose, visitingFlat, visitingWing,
      vehicleNumber, numberOfVisitors, remarks
    } = req.body;

    // Find the resident of the visiting flat
    const resident = await Resident.findOne({
      flatNumber: visitingFlat,
      wing: visitingWing.toUpperCase(),
      isActive: true
    });

    const visitorData = {
      name,
      phone,
      purpose,
      visitingFlat,
      visitingWing: visitingWing.toUpperCase(),
      registeredBy: req.user.id,
      vehicleNumber,
      numberOfVisitors,
      remarks
    };

    // If resident found, link them and create notification
    if (resident) {
      visitorData.resident = resident.user;

      // Create approval notification for the resident
      await Notification.create({
        recipient: resident.user,
        title: 'Visitor Approval Required',
        message: `${name} is at the gate to visit flat ${visitingWing}-${visitingFlat}. Purpose: ${purpose}`,
        type: 'visitor-approval',
        relatedModel: 'Visitor'
      });
    }

    const visitor = await Visitor.create(visitorData);

    res.status(201).json({
      success: true,
      message: 'Visitor registered. Waiting for resident approval.',
      visitor
    });
  } catch (error) {
    console.error('Register visitor error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error registering visitor'
    });
  }
};

// @desc    Get all visitors (with filters)
// @route   GET /api/visitors
// @access  Private/Security,Admin
exports.getVisitors = async (req, res) => {
  try {
    const { date, flat, wing, status, purpose } = req.query;
    let query = {};

    if (status) query.approvalStatus = status;
    if (purpose) query.purpose = purpose;
    if (flat) query.visitingFlat = flat;
    if (wing) query.visitingWing = wing.toUpperCase();

    // Filter by date if provided
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.entryTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const visitors = await Visitor.find(query)
      .populate('resident', 'name')
      .populate('registeredBy', 'name')
      .sort({ entryTime: -1 })
      .limit(100);

    res.json({
      success: true,
      count: visitors.length,
      visitors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching visitors'
    });
  }
};

// @desc    Get visitors for a specific resident
// @route   GET /api/visitors/myvisitors
// @access  Private/Resident
exports.getMyVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find({ resident: req.user.id })
      .populate('registeredBy', 'name')
      .sort({ entryTime: -1 });

    res.json({
      success: true,
      count: visitors.length,
      visitors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your visitors'
    });
  }
};

// @desc    Approve or reject visitor
// @route   PUT /api/visitors/:id/approve
// @access  Private/Resident
exports.approveVisitor = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor record not found'
      });
    }

    // Only the resident being visited can approve
    if (visitor.resident && visitor.resident.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only approve visitors for your flat'
      });
    }

    visitor.approvalStatus = status;
    await visitor.save();

    res.json({
      success: true,
      message: `Visitor ${status}`,
      visitor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating visitor status'
    });
  }
};

// @desc    Record visitor exit
// @route   PUT /api/visitors/:id/exit
// @access  Private/Security
exports.recordExit = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { exitTime: new Date() },
      { new: true }
    );

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor record not found'
      });
    }

    res.json({
      success: true,
      message: 'Visitor exit recorded',
      visitor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error recording exit'
    });
  }
};

// @desc    Get visitor by ID
// @route   GET /api/visitors/:id
// @access  Private
exports.getVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id)
      .populate('resident', 'name phone')
      .populate('registeredBy', 'name');

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found'
      });
    }

    res.json({
      success: true,
      visitor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching visitor details'
    });
  }
};
