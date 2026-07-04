const Resident = require('../models/Resident');
const User = require('../models/User');

// @desc    Create resident profile
// @route   POST /api/residents
// @access  Private/Admin
exports.createResident = async (req, res) => {
  try {
    const { userId, flatNumber, wing, floor, occupancyType, moveInDate, emergencyContact } = req.body;

    // Check if flat is already occupied
    const existingResident = await Resident.findOne({
      flatNumber,
      wing,
      isActive: true
    });

    if (existingResident) {
      return res.status(400).json({
        success: false,
        message: `Flat ${wing}-${flatNumber} is already occupied`
      });
    }

    const resident = await Resident.create({
      user: userId,
      flatNumber,
      wing,
      floor,
      occupancyType,
      moveInDate,
      emergencyContact
    });

    await resident.populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Resident profile created',
      resident
    });
  } catch (error) {
    console.error('Create resident error:', error.message);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This flat is already assigned to a resident'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating resident profile'
    });
  }
};

// @desc    Get all residents
// @route   GET /api/residents
// @access  Private/Admin
exports.getAllResidents = async (req, res) => {
  try {
    const { wing, floor, occupancyType, search } = req.query;
    let query = { isActive: true };

    if (wing) query.wing = wing.toUpperCase();
    if (floor) query.floor = Number(floor);
    if (occupancyType) query.occupancyType = occupancyType;

    let residents = await Resident.find(query)
      .populate('user', 'name email phone avatar')
      .sort({ wing: 1, flatNumber: 1 });

    // Filter by search term if provided (search across user name)
    if (search) {
      residents = residents.filter(r =>
        r.user && r.user.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({
      success: true,
      count: residents.length,
      residents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching residents'
    });
  }
};

// @desc    Get single resident
// @route   GET /api/residents/:id
// @access  Private
exports.getResident = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id)
      .populate('user', 'name email phone avatar role');

    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident not found'
      });
    }

    res.json({
      success: true,
      resident
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching resident details'
    });
  }
};

// @desc    Get resident profile for logged-in user
// @route   GET /api/residents/myprofile
// @access  Private/Resident
exports.getMyProfile = async (req, res) => {
  try {
    const resident = await Resident.findOne({ user: req.user.id })
      .populate('user', 'name email phone avatar');

    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident profile not found. Contact admin.'
      });
    }

    res.json({
      success: true,
      resident
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your profile'
    });
  }
};

// @desc    Update resident details
// @route   PUT /api/residents/:id
// @access  Private/Admin
exports.updateResident = async (req, res) => {
  try {
    const { flatNumber, wing, floor, occupancyType, emergencyContact } = req.body;

    const resident = await Resident.findByIdAndUpdate(
      req.params.id,
      { flatNumber, wing, floor, occupancyType, emergencyContact },
      { new: true, runValidators: true }
    ).populate('user', 'name email phone');

    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident not found'
      });
    }

    res.json({
      success: true,
      message: 'Resident updated',
      resident
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating resident'
    });
  }
};

// @desc    Add family member
// @route   POST /api/residents/:id/family
// @access  Private
exports.addFamilyMember = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);

    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident not found'
      });
    }

    // Residents can only edit their own profile
    if (req.user.role === 'resident' && resident.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this profile'
      });
    }

    resident.familyMembers.push(req.body);
    await resident.save();

    res.status(201).json({
      success: true,
      message: 'Family member added',
      familyMembers: resident.familyMembers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding family member'
    });
  }
};

// @desc    Remove family member
// @route   DELETE /api/residents/:id/family/:memberId
// @access  Private
exports.removeFamilyMember = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);

    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident not found'
      });
    }

    if (req.user.role === 'resident' && resident.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    resident.familyMembers = resident.familyMembers.filter(
      member => member._id.toString() !== req.params.memberId
    );

    await resident.save();

    res.json({
      success: true,
      message: 'Family member removed',
      familyMembers: resident.familyMembers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing family member'
    });
  }
};

// @desc    Add vehicle
// @route   POST /api/residents/:id/vehicles
// @access  Private
exports.addVehicle = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);

    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident not found'
      });
    }

    if (req.user.role === 'resident' && resident.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    resident.vehicles.push(req.body);
    await resident.save();

    res.status(201).json({
      success: true,
      message: 'Vehicle registered',
      vehicles: resident.vehicles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering vehicle'
    });
  }
};

// @desc    Remove vehicle
// @route   DELETE /api/residents/:id/vehicles/:vehicleId
// @access  Private
exports.removeVehicle = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);

    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident not found'
      });
    }

    if (req.user.role === 'resident' && resident.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    resident.vehicles = resident.vehicles.filter(
      v => v._id.toString() !== req.params.vehicleId
    );

    await resident.save();

    res.json({
      success: true,
      message: 'Vehicle removed',
      vehicles: resident.vehicles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing vehicle'
    });
  }
};

// @desc    Deactivate resident (move out)
// @route   PUT /api/residents/:id/deactivate
// @access  Private/Admin
exports.deactivateResident = async (req, res) => {
  try {
    const resident = await Resident.findByIdAndUpdate(
      req.params.id,
      { isActive: false, moveOutDate: new Date() },
      { new: true }
    );

    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident not found'
      });
    }

    res.json({
      success: true,
      message: 'Resident deactivated',
      resident
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating resident'
    });
  }
};
