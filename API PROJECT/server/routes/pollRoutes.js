const express = require('express');
const router = express.Router();
const {
  createPoll,
  getPolls,
  getPoll,
  castVote,
  closePoll
} = require('../controllers/pollController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getPolls)
  .post(authorize('admin'), createPoll);

router.get('/:id', getPoll);
router.post('/:id/vote', authorize('resident'), castVote);
router.put('/:id/close', authorize('admin'), closePoll);

module.exports = router;
