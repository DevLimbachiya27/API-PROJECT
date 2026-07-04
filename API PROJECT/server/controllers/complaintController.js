const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');

// @desc    Raise a new complaint
// @route   POST /api/complaints
// @access  Private/Resident
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, flatNumber, wing } = req.body;

    // Handle uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.filename);
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority: priority || 'medium',
      flatNumber,
      wing,
      raisedBy: req.user.id,
      images
    });

    // Notify admin about new complaint
    const User = require('../models/User');
    const admins = await User.find({ role: 'admin' });

    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        title: 'New Complaint Raised',
        message: `${req.user.name} raised a complaint: ${title} (${category})`,
        type: 'complaint-update',
        relatedId: complaint._id,
        relatedModel: 'Complaint'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (error) {
    console.error('Create complaint error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error submitting complaint'
    });
  }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
exports.getComplaints = async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    let query = {};

    // Residents see only their own complaints
    if (req.user.role === 'resident') {
      query.raisedBy = req.user.id;
    }

    // Maintenance staff see only assigned complaints
    if (req.user.role === 'maintenance') {
      query.assignedTo = req.user.id;
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const complaints = await Complaint.find(query)
      .populate('raisedBy', 'name email')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints'
    });
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('raisedBy', 'name email phone')
      .populate('assignedTo', 'name phone')
      .populate('comments.user', 'name role');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint details'
    });
  }
};

// @desc    Assign complaint to maintenance staff
// @route   PUT /api/complaints/:id/assign
// @access  Private/Admin
exports.assignComplaint = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo,
        status: 'assigned'
      },
      { new: true }
    ).populate('assignedTo', 'name');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Notify assigned staff
    await Notification.create({
      recipient: assignedTo,
      title: 'Complaint Assigned',
      message: `You have been assigned: ${complaint.title}`,
      type: 'complaint-update',
      relatedId: complaint._id,
      relatedModel: 'Complaint'
    });

    // Notify the resident who raised it
    await Notification.create({
      recipient: complaint.raisedBy,
      title: 'Complaint Update',
      message: `Your complaint "${complaint.title}" has been assigned to ${complaint.assignedTo.name}`,
      type: 'complaint-update',
      relatedId: complaint._id,
      relatedModel: 'Complaint'
    });

    res.json({
      success: true,
      message: 'Complaint assigned',
      complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning complaint'
    });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private/Admin,Maintenance
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { status };

    if (status === 'resolved') updateData.resolvedAt = new Date();
    if (status === 'closed') updateData.closedAt = new Date();

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Notify the resident about status change
    await Notification.create({
      recipient: complaint.raisedBy,
      title: 'Complaint Status Updated',
      message: `Your complaint "${complaint.title}" is now ${status}`,
      type: 'complaint-update',
      relatedId: complaint._id,
      relatedModel: 'Complaint'
    });

    res.json({
      success: true,
      message: `Complaint marked as ${status}`,
      complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating complaint status'
    });
  }
};

// @desc    Add comment to complaint
// @route   POST /api/complaints/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    complaint.comments.push({
      user: req.user.id,
      text: req.body.text
    });

    await complaint.save();
    await complaint.populate('comments.user', 'name role');

    res.status(201).json({
      success: true,
      message: 'Comment added',
      comments: complaint.comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding comment'
    });
  }
};
