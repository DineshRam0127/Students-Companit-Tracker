import React from 'react';

export default function ViewModal({ complaint, onClose }) {
  if (!complaint) return null;

  const dateStr = complaint.createdAt
    ? new Date(complaint.createdAt).toISOString().split('T')[0]
    : complaint.date || 'N/A';

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'In Progress': return 'status-progress';
      case 'Resolved': return 'status-resolved';
      default: return 'status-pending';
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Hostel': return 'cat-hostel';
      case 'Food': return 'cat-food';
      case 'Transport': return 'cat-transport';
      case 'Infrastructure': return 'cat-infrastructure';
      case 'Other': return 'cat-other';
      default: return 'cat-other';
    }
  };

  return (
    <div className="modal-backdrop open" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-kicker">COMPLAINT DETAILS</span>
            <h3 className="modal-title">{complaint.title}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-detail-badges">
            <span className="complaint-id-tag">{complaint.complaintId || complaint.id}</span>
            <span className={`status-badge ${getStatusBadgeClass(complaint.status)}`}>
              <span className="status-dot"></span> {complaint.status}
            </span>
            <span className={`category-badge ${getCategoryBadgeClass(complaint.category)}`}>
              {complaint.category}
            </span>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Student Name</span>
              <span className="detail-value">{complaint.studentName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Department</span>
              <span className="detail-value">{complaint.department}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Submission Date</span>
              <span className="detail-value">{dateStr}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Category</span>
              <span className="detail-value">{complaint.category}</span>
            </div>
          </div>

          <div className="detail-description-block">
            <span className="detail-label">Full Complaint Description</span>
            <div className="description-box">{complaint.description}</div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
