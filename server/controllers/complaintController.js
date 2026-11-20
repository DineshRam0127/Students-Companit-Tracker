const Complaint = require('../models/Complaint');
const { INITIAL_SAMPLE_COMPLAINTS } = require('../config/db');

/**
 * @desc    Create a new complaint
 * @route   POST /api/complaints
 * @access  Public (Student)
 */
const createComplaint = async (req, res, next) => {
  try {
    const { studentName, department, title, description, category } = req.body;

    if (!studentName || !department || !title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: studentName, department, title, description, category'
      });
    }

    // Auto-generate unique sequential complaint ID
    const complaintId = await Complaint.generateComplaintId();

    const complaint = await Complaint.create({
      complaintId,
      studentName,
      department,
      title,
      description,
      category,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      data: complaint,
      message: `Complaint ${complaintId} lodged successfully.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all complaints with optional filtering & search
 * @route   GET /api/complaints
 * @access  Public
 */
const getComplaints = async (req, res, next) => {
  try {
    const { category, status, search } = req.query;
    const filter = {};

    if (category && category !== 'ALL') {
      filter.category = category;
    }

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { complaintId: regex },
        { studentName: regex },
        { title: regex },
        { department: regex }
      ];
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/complaints/stats/summary
 * @access  Public (Admin)
 */
const getComplaintStats = async (req, res, next) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        inProgress,
        resolved
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single complaint by Complaint ID (e.g. CMP-2026-1001)
 * @route   GET /api/complaints/id/:complaintId
 * @access  Public (Student Tracker)
 */
const getComplaintByComplaintId = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findOne({
      complaintId: { $regex: new RegExp(`^${complaintId.trim()}$`, 'i') }
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `No complaint found matching ID '${complaintId}'`
      });
    }

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single complaint by MongoDB _id
 * @route   GET /api/complaints/:id
 * @access  Public
 */
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update complaint details (title, description, category)
 * @route   PUT /api/complaints/:id
 * @access  Public (Student / Admin)
 */
const updateComplaint = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (title !== undefined) complaint.title = title;
    if (description !== undefined) complaint.description = description;
    if (category !== undefined) complaint.category = category;

    const updated = await complaint.save();

    res.status(200).json({
      success: true,
      data: updated,
      message: `Complaint ${complaint.complaintId} updated successfully.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update complaint status (Pending, In Progress, Resolved)
 * @route   PATCH /api/complaints/:id/status
 * @access  Public (Admin)
 */
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Resolved'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    complaint.status = status;
    const updated = await complaint.save();

    res.status(200).json({
      success: true,
      data: updated,
      message: `Complaint ${complaint.complaintId} status updated to '${status}'.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete complaint by MongoDB _id
 * @route   DELETE /api/complaints/:id
 * @access  Public
 */
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    const deletedId = complaint.complaintId;
    await complaint.deleteOne();

    res.status(200).json({
      success: true,
      message: `Complaint ${deletedId} permanently deleted.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset collection to initial 6 sample complaints (matching UI reset button)
 * @route   POST /api/complaints/reset-samples
 * @access  Public
 */
const resetSampleComplaints = async (req, res, next) => {
  try {
    await Complaint.deleteMany({});
    const inserted = await Complaint.insertMany(INITIAL_SAMPLE_COMPLAINTS);

    res.status(200).json({
      success: true,
      count: inserted.length,
      data: inserted,
      message: 'Sample complaints restored successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintStats,
  getComplaintByComplaintId,
  getComplaintById,
  updateComplaint,
  updateComplaintStatus,
  deleteComplaint,
  resetSampleComplaints
};
