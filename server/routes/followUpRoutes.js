const express = require('express');

const {
  getFollowUps,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp
} = require('../controllers/followUpController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET all followups + CREATE followup
router.route('/')
  .get(protect, getFollowUps)
  .post(protect, createFollowUp);

// UPDATE + DELETE followup by ID
router.route('/:id')
  .put(protect, updateFollowUp)
  .delete(protect, deleteFollowUp);

module.exports = router;