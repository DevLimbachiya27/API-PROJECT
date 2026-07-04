const Notice = require('../models/Notice');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create a notice
// @route   POST /api/notices
// @access  Private/Admin
exports.createNotice = async (req, res) => {
  try {
    const { title, content, category, priority, expiryDate } = req.body;

    const notice = await Notice.create({
      title,
      content,
      category,
      priority,
      expiryDate,
      postedBy: req.user.id
    });

    // Notify all residents about the new notice
    const residents = await User.find({ role: 'resident', isActive: true });

    const notifications = residents.map(resident => ({
      recipient: resident._id,
      title: 'New Notice',
      message: `${priority === 'urgent' ? '🚨 URGENT: ' : ''}${title}`,
      type: 'notice',
      relatedId: notice._id,
      relatedModel: 'Notice'
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: 'Notice published',
      notice
    });
  } catch (error) {
    console.error('Create notice error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating notice'
    });
  }
};

// @desc    Get all active notices
// @route   GET /api/notices
// @access  Private
exports.getNotices = async (req, res) => {
  try {
    const { category, priority } = req.query;
    let query = { isActive: true };

    if (category) query.category = category;
    if (priority) query.priority = priority;

    // Don't show expired notices
    query.$or = [
      { expiryDate: { $gte: new Date() } },
      { expiryDate: null }
    ];

    const notices = await Notice.find(query)
      .populate('postedBy', 'name')
      .sort({ priority: -1, createdAt: -1 });

    res.json({
      success: true,
      count: notices.length,
      notices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notices'
    });
  }
};

// @desc    Get single notice
// @route   GET /api/notices/:id
// @access  Private
exports.getNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('postedBy', 'name email');

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    res.json({
      success: true,
      notice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notice'
    });
  }
};

// @desc    Update notice
// @route   PUT /api/notices/:id
// @access  Private/Admin
exports.updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    res.json({
      success: true,
      message: 'Notice updated',
      notice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating notice'
    });
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private/Admin
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    res.json({
      success: true,
      message: 'Notice deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting notice'
    });
  }
};
