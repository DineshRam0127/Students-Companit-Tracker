import React, { useState } from 'react';

export default function DeleteModal({ complaint, onClose, onConfirmDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!complaint) return null;

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirmDelete(complaint._id || complaint.id);
      onClose();
    } catch (err) {
      // Handled by parent
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop open" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-dialog modal-dialog-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header modal-header-danger">
          <div className="modal-title-wrap">
            <h3 className="modal-title">Confirm Deletion</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        <div className="modal-body text-center">
          <div className="danger-icon-circle">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#ef4444" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>
          <h4>Are you sure you want to delete this complaint?</h4>
          <p className="delete-warning-text">
            Complaint <strong>{complaint.complaintId || complaint.id}</strong> will be permanently removed from MongoDB Atlas. This action cannot be undone.
          </p>
        </div>

        <div className="modal-footer justify-center">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Complaint'}
          </button>
        </div>
      </div>
    </div>
  );
}
