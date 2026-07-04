const express = require('express');
const router = express.Router();
const {
  registerVisitor,
  getVisitors,
  getMyVisitors,
  getVisitor,
  approveVisitor,
  recordExit
} = require('../controllers/visitorController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Security registers visitors
router.post('/', authorize('security', 'admin'), registerVisitor);

// Get all visitors (security/admin)
router.get('/', authorize('security', 'admin'), getVisitors);

// Resident's visitors
router.get('/myvisitors', authorize('resident'), getMyVisitors);

// Single visitor
router.get('/:id', getVisitor);

// Resident approves/rejects
router.put('/:id/approve', authorize('resident'), approveVisitor);

// Security records exit
router.put('/:id/exit', authorize('security', 'admin'), recordExit);

module.exports = router;
