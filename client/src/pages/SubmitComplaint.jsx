import React, { useState } from 'react';
import { createComplaint } from '../services/api';

export default function SubmitComplaint({ onComplaintCreated, onNotify }) {
  const [studentName, setStudentName] = useState('');
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Validation errors
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  const resetForm = () => {
    setStudentName('');
    setDepartment('');
    setCategory('');
    setTitle('');
    setDescription('');
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!studentName.trim() || studentName.trim().length < 2) {
      newErrors.studentName = 'Please enter a valid student name (at least 2 characters).';
    }

    if (!department.trim() || department.trim().length < 2) {
      newErrors.department = 'Please enter your department/branch name.';
    }

    if (!category) {
      newErrors.category = 'Please select an issue category.';
    }

    if (!title.trim() || title.trim().length < 5) {
      newErrors.title = 'Complaint title must be at least 5 characters long.';
    }

    if (!description.trim() || description.trim().length < 15) {
      newErrors.description = 'Please provide a detailed description (at least 15 characters).';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      onNotify('Please fix the highlighted errors before submitting.', 'danger');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createComplaint({
        studentName: studentName.trim(),
        department: department.trim(),
        category,
        title: title.trim(),
        description: description.trim()
      });

      const created = res.data;
      setSuccessInfo(created);
      resetForm();
      onNotify(`Complaint ${created.complaintId} lodged successfully!`, 'success');
      if (onComplaintCreated) onComplaintCreated();
    } catch (err) {
      console.error('Submission failed:', err);
      onNotify(err.message || 'Failed to submit complaint to database', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="view-section active" id="viewSubmitComplaint">
      <div className="form-container-card card">
        <div className="form-header">
          <div className="icon-avatar">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <div>
            <h3 className="form-title">Lodge a Campus Complaint</h3>
            <p className="form-subtitle">
              Fill in the accurate details below. Your issue will be assigned a unique Complaint ID and submitted directly to campus administration via MongoDB.
            </p>
          </div>
        </div>

        {/* Submission Notification Banner */}
        {successInfo && (
          <div className="alert alert-success" id="submitSuccessAlert">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <div className="alert-content">
              <strong>Complaint Lodged Successfully!</strong>
              <p>
                Your Complaint ID is <span className="id-tag">{successInfo.complaintId}</span>. Status is automatically set to <strong className="text-amber">Pending</strong>.
              </p>
            </div>
            <button type="button" className="alert-close" onClick={() => setSuccessInfo(null)}>
              &times;
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid-2">
            {/* Student Name */}
            <div className="form-group">
              <label htmlFor="studentName" className="form-label">
                Student Name <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  id="studentName"
                  className={`form-control ${errors.studentName ? 'is-invalid' : ''}`}
                  placeholder="e.g. Alex Johnson"
                  maxLength={60}
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    if (errors.studentName) setErrors({ ...errors, studentName: '' });
                  }}
                  required
                />
              </div>
              {errors.studentName && <span className="field-error visible">{errors.studentName}</span>}
            </div>

            {/* Department */}
            <div className="form-group">
              <label htmlFor="studentDept" className="form-label">
                Department / Branch <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                <input
                  type="text"
                  id="studentDept"
                  className={`form-control ${errors.department ? 'is-invalid' : ''}`}
                  placeholder="e.g. Computer Science & Eng."
                  maxLength={60}
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    if (errors.department) setErrors({ ...errors, department: '' });
                  }}
                  required
                />
              </div>
              {errors.department && <span className="field-error visible">{errors.department}</span>}
            </div>
          </div>

          <div className="form-grid-2">
            {/* Category */}
            <div className="form-group">
              <label htmlFor="complaintCategory" className="form-label">
                Issue Category <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <select
                  id="complaintCategory"
                  className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (errors.category) setErrors({ ...errors, category: '' });
                  }}
                  required
                >
                  <option value="" disabled>Select issue category...</option>
                  <option value="Hostel">Hostel (Rooms, Water, Cleanliness, Electricity)</option>
                  <option value="Food">Food (Cafeteria, Mess Hygiene, Quality)</option>
                  <option value="Transport">Transport (Bus Schedule, Routes, Facilities)</option>
                  <option value="Infrastructure">Infrastructure (Classrooms, Labs, Wi-Fi, HVAC)</option>
                  <option value="Other">Other (General, Library, Sports, Administrative)</option>
                </select>
              </div>
              {errors.category && <span className="field-error visible">{errors.category}</span>}
            </div>

            {/* Initial Status Notice */}
            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <div className="readonly-badge-input">
                <span className="status-badge status-pending">
                  <span className="status-dot"></span> Pending
                </span>
                <span className="help-text">Automatically queued as Pending upon submission.</span>
              </div>
            </div>
          </div>

          {/* Complaint Title */}
          <div className="form-group">
            <label htmlFor="complaintTitle" className="form-label">
              Complaint Title <span className="required">*</span>
            </label>
            <div className="input-with-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              <input
                type="text"
                id="complaintTitle"
                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                placeholder="Brief summary of the issue (e.g. Wi-Fi down in Hostel Block C)"
                maxLength={120}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                required
              />
            </div>
            {errors.title && <span className="field-error visible">{errors.title}</span>}
          </div>

          {/* Complaint Description */}
          <div className="form-group">
            <label htmlFor="complaintDesc" className="form-label">
              Detailed Description <span className="required">*</span>
            </label>
            <textarea
              id="complaintDesc"
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              rows={5}
              placeholder="Provide complete specifics, location, timing, and any relevant details to expedite resolution..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              required
            />
            <div className="textarea-footer">
              <span className={`field-error ${errors.description ? 'visible' : ''}`}>
                {errors.description}
              </span>
              <span className="char-count">{description.length} characters</span>
            </div>
          </div>

          {/* Form Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              <span>Clear Form</span>
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              <span>{isSubmitting ? 'Submitting...' : 'Submit Complaint'}</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
