const MaintenanceBill = require('../models/MaintenanceBill');
const Resident = require('../models/Resident');
const Notification = require('../models/Notification');
const { calculatePenalty, getMonthName } = require('../utils/helpers');

// @desc    Generate bills for all residents
// @route   POST /api/billing/generate
// @access  Private/Admin
exports.generateBills = async (req, res) => {
  try {
    const { month, year, breakdown, dueDate } = req.body;

    // Calculate total amount from breakdown
    const amount = Object.values(breakdown).reduce((sum, val) => sum + (Number(val) || 0), 0);

    // Get all active residents
    const residents = await Resident.find({ isActive: true }).populate('user', 'name');

    let generatedCount = 0;
    let skippedCount = 0;

    for (const resident of residents) {
      // Skip if bill already exists for this month
      const existingBill = await MaintenanceBill.findOne({
        flatNumber: resident.flatNumber,
        wing: resident.wing,
        month,
        year
      });

      if (existingBill) {
        skippedCount++;
        continue;
      }

      await MaintenanceBill.create({
        resident: resident.user._id,
        flatNumber: resident.flatNumber,
        wing: resident.wing,
        month,
        year,
        amount,
        breakdown,
        dueDate: new Date(dueDate),
        generatedBy: req.user.id
      });

      // Send notification to resident
      await Notification.create({
        recipient: resident.user._id,
        title: 'New Maintenance Bill',
        message: `Your maintenance bill for ${getMonthName(month)} ${year} of ₹${amount} has been generated. Due: ${new Date(dueDate).toLocaleDateString()}`,
        type: 'payment-reminder',
        relatedModel: 'MaintenanceBill'
      });

      generatedCount++;
    }

    res.status(201).json({
      success: true,
      message: `Bills generated: ${generatedCount}, Skipped (already exist): ${skippedCount}`,
      generatedCount,
      skippedCount
    });
  } catch (error) {
    console.error('Generate bills error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error generating bills'
    });
  }
};

// @desc    Get all bills (admin) or resident's bills
// @route   GET /api/billing
// @access  Private
exports.getBills = async (req, res) => {
  try {
    const { month, year, status, wing } = req.query;
    let query = {};

    // Residents see only their bills
    if (req.user.role === 'resident') {
      query.resident = req.user.id;
    }

    if (month) query.month = Number(month);
    if (year) query.year = Number(year);
    if (status) query.status = status;
    if (wing) query.wing = wing.toUpperCase();

    const bills = await MaintenanceBill.find(query)
      .populate('resident', 'name email')
      .sort({ year: -1, month: -1 });

    // Calculate penalties for overdue bills
    for (let bill of bills) {
      if (bill.status === 'pending' && new Date() > bill.dueDate) {
        bill.status = 'overdue';
        bill.penalty = calculatePenalty(bill.dueDate, bill.amount);
        await bill.save();
      }
    }

    res.json({
      success: true,
      count: bills.length,
      bills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bills'
    });
  }
};

// @desc    Get single bill
// @route   GET /api/billing/:id
// @access  Private
exports.getBill = async (req, res) => {
  try {
    const bill = await MaintenanceBill.findById(req.params.id)
      .populate('resident', 'name email phone')
      .populate('generatedBy', 'name');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Check penalty if overdue
    if (bill.status === 'pending' && new Date() > bill.dueDate) {
      bill.status = 'overdue';
      bill.penalty = calculatePenalty(bill.dueDate, bill.amount);
      await bill.save();
    }

    res.json({
      success: true,
      bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bill details'
    });
  }
};

// @desc    Record payment
// @route   PUT /api/billing/:id/pay
// @access  Private
exports.recordPayment = async (req, res) => {
  try {
    const { paymentMethod, transactionId } = req.body;

    const bill = await MaintenanceBill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    if (bill.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This bill has already been paid'
      });
    }

    bill.status = 'paid';
    bill.paidDate = new Date();
    bill.paymentMethod = paymentMethod || 'online';
    bill.transactionId = transactionId;

    await bill.save();

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error recording payment'
    });
  }
};

// @desc    Get billing summary/stats
// @route   GET /api/billing/summary
// @access  Private/Admin
exports.getBillingSummary = async (req, res) => {
  try {
    const { year } = req.query;
    const filterYear = Number(year) || new Date().getFullYear();

    const totalBills = await MaintenanceBill.countDocuments({ year: filterYear });
    const paidBills = await MaintenanceBill.countDocuments({ year: filterYear, status: 'paid' });
    const pendingBills = await MaintenanceBill.countDocuments({ year: filterYear, status: 'pending' });
    const overdueBills = await MaintenanceBill.countDocuments({ year: filterYear, status: 'overdue' });

    // Calculate total revenue
    const paidAggregation = await MaintenanceBill.aggregate([
      { $match: { year: filterYear, status: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' }, totalPenalty: { $sum: '$penalty' } } }
    ]);

    const pendingAggregation = await MaintenanceBill.aggregate([
      { $match: { year: filterYear, status: { $in: ['pending', 'overdue'] } } },
      { $group: { _id: null, totalPending: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      summary: {
        year: filterYear,
        totalBills,
        paidBills,
        pendingBills,
        overdueBills,
        totalRevenue: paidAggregation[0]?.totalRevenue || 0,
        totalPenalty: paidAggregation[0]?.totalPenalty || 0,
        totalPending: pendingAggregation[0]?.totalPending || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching billing summary'
    });
  }
};
