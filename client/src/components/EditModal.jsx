import React, { useState, useEffect } from 'react';

export default function EditModal({ complaint, onClose, onSave }) {
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');
  const [descError, setDescError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (complaint) {
      setCategory(complaint.category || 'Hostel');
      setTitle(complaint.title || '');
      setDescription(complaint.description || '');
      setTitleError('');
      setDescError('');
      setIsSubmitting(false);
    }
  }, [complaint]);

  if (!complaint) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    let valid = true;
    if (!title.trim() || title.trim().length < 5) {
      setTitleError('Complaint title must be at least 5 characters long.');
      valid = false;
    } else {
      setTitleError('');
    }

    if (!description.trim() || description.trim().length < 15) {
      setDescError('Please provide a detailed description (at least 15 characters).');
      valid = false;
    } else {
      setDescError('');
    }

    if (!valid) return;

    try {
      setIsSubmitting(true);
      await onSave(complaint._id || complaint.id, {
        category,
        title: title.trim(),
        description: description.trim()
      });
      onClose();
    } catch (err) {
      // Error handled by parent toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop open" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-kicker">UPDATE COMPLAINT</span>
            <h3 className="modal-title">Edit Complaint Information</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <div className="alert alert-info">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>
                Editing Complaint: <strong>{complaint.complaintId || complaint.id}</strong>. Note: Status can only be changed by administration.
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="editCategory" className="form-label">
                Category <span className="required">*</span>
              </label>
              <select
                id="editCategory"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="Hostel">Hostel</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="editTitle" className="form-label">
                Complaint Title <span className="required">*</span>
              </label>
              <input
                type="text"
                id="editTitle"
                className={`form-control ${titleError ? 'is-invalid' : ''}`}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError('');
                }}
                maxLength={120}
                required
              />
              {titleError && <span className="field-error visible">{titleError}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="editDesc" className="form-label">
                Complaint Description <span className="required">*</span>
              </label>
              <textarea
                id="editDesc"
                className={`form-control ${descError ? 'is-invalid' : ''}`}
                rows={5}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (descError) setDescError('');
                }}
                required
              />
              {descError && <span className="field-error visible">{descError}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
