const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintStats,
  getComplaintByComplaintId,
  getComplaintById,
  updateComplaint,
  updateComplaintStatus,
  deleteComplaint,
  resetSampleComplaints
} = require('../controllers/complaintController');

// Specific routes registered first to prevent dynamic route conflicts
router.get('/stats/summary', getComplaintStats);
router.get('/id/:complaintId', getComplaintByComplaintId);
router.post('/reset-samples', resetSampleComplaints);

// Root collection routes
router.route('/')
  .post(createComplaint)
  .get(getComplaints);

// Dynamic parameter routes
router.route('/:id')
  .get(getComplaintById)
  .put(updateComplaint)
  .delete(deleteComplaint);

router.patch('/:id/status', updateComplaintStatus);

module.exports = router;
