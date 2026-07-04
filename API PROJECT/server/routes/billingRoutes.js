const express = require('express');
const router = express.Router();
const {
  generateBills,
  getBills,
  getBill,
  recordPayment,
  getBillingSummary
} = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Admin generates bills
router.post('/generate', authorize('admin'), generateBills);

// Admin sees summary
router.get('/summary', authorize('admin'), getBillingSummary);

// Get all bills
router.get('/', getBills);

// Single bill
router.get('/:id', getBill);

// Record payment
router.put('/:id/pay', recordPayment);

module.exports = router;
