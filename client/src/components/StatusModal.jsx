import React, { useState, useEffect } from 'react';

export default function StatusModal({ complaint, onClose, onUpdateStatus }) {
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (complaint) {
      setSelectedStatus(complaint.status || 'Pending');
      setIsUpdating(false);
    }
  }, [complaint]);

  if (!complaint) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      await onUpdateStatus(complaint._id || complaint.id, selectedStatus);
      onClose();
    } catch (err) {
      // Handled by parent toast
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="modal-backdrop open" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-dialog modal-dialog-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-kicker">ADMIN ACTION</span>
            <h3 className="modal-title">Update Resolution Status</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="status-modal-intro">
              Change progress status for <strong>{complaint.complaintId || complaint.id}</strong> ({complaint.title}).
            </p>

            <div className="status-options-group">
              <label className="status-option-card">
                <input
                  type="radio"
                  name="complaintStatusRadio"
                  value="Pending"
                  checked={selectedStatus === 'Pending'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />
                <div className="status-option-content">
                  <span className="status-badge status-pending">
                    <span className="status-dot"></span> Pending
                  </span>
                  <span className="status-option-desc">
                    Grievance received and waiting for administrative review.
                  </span>
                </div>
              </label>

              <label className="status-option-card">
                <input
                  type="radio"
                  name="complaintStatusRadio"
                  value="In Progress"
                  checked={selectedStatus === 'In Progress'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />
                <div className="status-option-content">
                  <span className="status-badge status-progress">
                    <span className="status-dot"></span> In Progress
                  </span>
                  <span className="status-option-desc">
                    Active maintenance or staff currently attending to the issue.
                  </span>
                </div>
              </label>

              <label className="status-option-card">
                <input
                  type="radio"
                  name="complaintStatusRadio"
                  value="Resolved"
                  checked={selectedStatus === 'Resolved'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />
                <div className="status-option-content">
                  <span className="status-badge status-resolved">
                    <span className="status-dot"></span> Resolved
                  </span>
                  <span className="status-option-desc">
                    Issue resolved, verified, and officially completed.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isUpdating}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
