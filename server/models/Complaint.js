const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: [true, 'Complaint ID is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      minlength: [2, 'Student name must be at least 2 characters long'],
      maxlength: [60, 'Student name cannot exceed 60 characters']
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      minlength: [2, 'Department must be at least 2 characters long'],
      maxlength: [60, 'Department cannot exceed 60 characters']
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      minlength: [5, 'Complaint title must be at least 5 characters long'],
      maxlength: [120, 'Complaint title cannot exceed 120 characters']
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true,
      minlength: [15, 'Complaint description must be at least 15 characters long']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Hostel', 'Food', 'Transport', 'Infrastructure', 'Other'],
        message: '{VALUE} is not a supported complaint category'
      }
    },
    status: {
      type: String,
      required: true,
      default: 'Pending',
      enum: {
        values: ['Pending', 'In Progress', 'Resolved'],
        message: '{VALUE} is not a valid status'
      }
    }
  },
  {
    timestamps: true
  }
);

/**
 * Static method to generate next unique complaint ID
 * Format: CMP-YYYY-XXXX (e.g. CMP-2026-1001)
 */
complaintSchema.statics.generateComplaintId = async function () {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `CMP-${currentYear}-`;

  // Find the highest sequence number for this year
  const latestComplaint = await this.findOne({
    complaintId: new RegExp(`^${yearPrefix}`)
  })
    .sort({ complaintId: -1 })
    .collation({ locale: 'en', numericOrdering: true });

  let nextSequence = 1001;

  if (latestComplaint && latestComplaint.complaintId) {
    const parts = latestComplaint.complaintId.split('-');
    if (parts.length === 3) {
      const parsedSeq = parseInt(parts[2], 10);
      if (!isNaN(parsedSeq)) {
        nextSequence = parsedSeq + 1;
      }
    }
  }

  // Ensure uniqueness in case of race condition
  let candidateId = `${yearPrefix}${nextSequence}`;
  let exists = await this.findOne({ complaintId: candidateId });
  while (exists) {
    nextSequence += 1;
    candidateId = `${yearPrefix}${nextSequence}`;
    exists = await this.findOne({ complaintId: candidateId });
  }

  return candidateId;
};

module.exports = mongoose.model('Complaint', complaintSchema);
