const Poll = require('../models/Poll');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create a poll
// @route   POST /api/polls
// @access  Private/Admin
exports.createPoll = async (req, res) => {
  try {
    const { question, description, options, expiryDate, category } = req.body;

    // Format options
    const formattedOptions = options.map(opt => ({
      text: typeof opt === 'string' ? opt : opt.text,
      votes: 0
    }));

    const poll = await Poll.create({
      question,
      description,
      options: formattedOptions,
      expiryDate,
      category,
      createdBy: req.user.id
    });

    // Notify all residents
    const residents = await User.find({ role: 'resident', isActive: true });

    const notifications = residents.map(r => ({
      recipient: r._id,
      title: 'New Poll',
      message: `A new poll is live: "${question}". Cast your vote!`,
      type: 'poll',
      relatedId: poll._id,
      relatedModel: 'Poll'
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: 'Poll created',
      poll
    });
  } catch (error) {
    console.error('Create poll error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating poll'
    });
  }
};

// @desc    Get all polls
// @route   GET /api/polls
// @access  Private
exports.getPolls = async (req, res) => {
  try {
    const { active } = req.query;
    let query = {};

    if (active === 'true') {
      query.isActive = true;
      query.expiryDate = { $gte: new Date() };
    } else if (active === 'false') {
      query.$or = [
        { isActive: false },
        { expiryDate: { $lt: new Date() } }
      ];
    }

    const polls = await Poll.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // Add whether current user has voted
    const pollsWithVoteInfo = polls.map(poll => {
      const pollObj = poll.toObject();
      pollObj.hasVoted = poll.voters.some(
        v => v.user && v.user.toString() === req.user.id
      );
      pollObj.totalVotes = poll.voters.length;
      return pollObj;
    });

    res.json({
      success: true,
      count: polls.length,
      polls: pollsWithVoteInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching polls'
    });
  }
};

// @desc    Get single poll with results
// @route   GET /api/polls/:id
// @access  Private
exports.getPoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    const pollObj = poll.toObject();
    pollObj.hasVoted = poll.voters.some(
      v => v.user && v.user.toString() === req.user.id
    );
    pollObj.totalVotes = poll.voters.length;

    res.json({
      success: true,
      poll: pollObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching poll'
    });
  }
};

// @desc    Cast a vote
// @route   POST /api/polls/:id/vote
// @access  Private/Resident
exports.castVote = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Check if poll is still active
    if (!poll.isActive || new Date() > poll.expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'This poll has ended'
      });
    }

    // Check if already voted
    const alreadyVoted = poll.voters.find(
      v => v.user && v.user.toString() === req.user.id
    );

    if (alreadyVoted) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted in this poll'
      });
    }

    // Validate option index
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid option selected'
      });
    }

    // Record the vote
    poll.options[optionIndex].votes += 1;
    poll.voters.push({
      user: req.user.id,
      optionIndex
    });

    await poll.save();

    res.json({
      success: true,
      message: 'Vote recorded',
      poll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error casting vote'
    });
  }
};

// @desc    Close a poll
// @route   PUT /api/polls/:id/close
// @access  Private/Admin
exports.closePoll = async (req, res) => {
  try {
    const poll = await Poll.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    res.json({
      success: true,
      message: 'Poll closed',
      poll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error closing poll'
    });
  }
};
