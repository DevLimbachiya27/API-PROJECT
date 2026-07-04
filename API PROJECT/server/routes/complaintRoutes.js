const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaint,
  assignComplaint,
  updateStatus,
  addComment
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.route('/')
  .get(getComplaints)
  .post(authorize('resident'), upload.array('images', 3), createComplaint);

router.get('/:id', getComplaint);

// Admin assigns complaint
router.put('/:id/assign', authorize('admin'), assignComplaint);

// Admin or maintenance updates status
router.put('/:id/status', authorize('admin', 'maintenance'), updateStatus);

// Anyone involved can comment
router.post('/:id/comments', addComment);

module.exports = router;
