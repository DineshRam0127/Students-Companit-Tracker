import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchComplaints, fetchComplaintByComplaintId } from '../services/api';

export default function MyComplaints({
  onOpenView,
  onOpenEdit,
  onOpenDelete,
  refreshTrigger,
  onNotify
}) {
  const navigate = useNavigate();

  // List of complaints
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  // Single ticket tracking state
  const [trackInput, setTrackInput] = useState('');
  const [trackedItem, setTrackedItem] = useState(null);
  const [trackError, setTrackError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await fetchComplaints({ category, status });
      setComplaints(data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [category, status, refreshTrigger]);

  const handleTrackLookup = async (e) => {
    if (e) e.preventDefault();

    if (!trackInput.trim()) {
      onNotify('Please enter a Complaint ID to track', 'info');
      return;
    }

    try {
      setIsTracking(true);
      setTrackError(null);
      const res = await fetchComplaintByComplaintId(trackInput.trim());
      setTrackedItem(res);
    } catch (err) {
      setTrackedItem(null);
      setTrackError(trackInput.trim());
    } finally {
      setIsTracking(false);
    }
  };

  const handleShowAll = () => {
    setTrackedItem(null);
    setTrackError(null);
    setTrackInput('');
    setCategory('ALL');
    setStatus('ALL');
  };

  const getStatusBadgeClass = (s) => {
    switch (s) {
      case 'Pending': return 'status-pending';
      case 'In Progress': return 'status-progress';
      case 'Resolved': return 'status-resolved';
      default: return 'status-pending';
    }
  };

  const getCategoryBadgeClass = (c) => {
    switch (c) {
      case 'Hostel': return 'cat-hostel';
      case 'Food': return 'cat-food';
      case 'Transport': return 'cat-transport';
      case 'Infrastructure': return 'cat-infrastructure';
      case 'Other': return 'cat-other';
      default: return 'cat-other';
    }
  };

  // Stepper state evaluation
  const getStepClass = (stepName) => {
    if (!trackedItem) return '';
    const st = trackedItem.status;

    if (stepName === 'Pending') {
      if (st === 'Pending') return 'current';
      return 'completed';
    }
    if (stepName === 'In Progress') {
      if (st === 'Pending') return '';
      if (st === 'In Progress') return 'current';
      return 'completed';
    }
    if (stepName === 'Resolved') {
      if (st === 'Resolved') return 'completed current';
      return '';
    }
    return '';
  };

  const isLineCompleted = (lineNum) => {
    if (!trackedItem) return false;
    const st = trackedItem.status;
    if (lineNum === 1) return st === 'In Progress' || st === 'Resolved';
    if (lineNum === 2) return st === 'Resolved';
    return false;
  };

  return (
    <section className="view-section active" id="viewMyComplaints">
      {/* Tracker Banner Card */}
      <div className="card tracker-card">
        <div className="tracker-header">
          <div>
            <h3 className="card-title">Track Specific Complaint Status</h3>
            <p className="card-subtitle">
              Enter your assigned Complaint ID (e.g. <code>CMP-2026-1001</code>) to track real-time resolution progress in MongoDB.
            </p>
          </div>
          <form className="track-input-row" onSubmit={handleTrackLookup}>
            <div className="search-box tracker-search-box">
              <svg className="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                id="trackComplaintInput"
                className="form-control"
                placeholder="Enter Complaint ID (e.g. CMP-2026-1002)..."
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" id="btnTrackComplaint" disabled={isTracking}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
              <span>{isTracking ? 'Tracking...' : 'Track Status'}</span>
            </button>
            <button type="button" className="btn btn-outline" id="btnShowAllStudentComplaints" onClick={handleShowAll}>
              Show All
            </button>
          </form>
        </div>

        {/* Single Track Result Box */}
        {trackedItem && (
          <div className="track-result-box" id="trackResultBox" style={{ display: 'block' }}>
            <div className="track-result-header">
              <div className="track-meta">
                <span className="track-id-badge" id="trackResultId">
                  {trackedItem.complaintId}
                </span>
                <span className="track-date" id="trackResultDate">
                  Filed: {trackedItem.createdAt ? new Date(trackedItem.createdAt).toISOString().split('T')[0] : 'N/A'}
                </span>
              </div>
              <div id="trackResultStatusBadge">
                <span className={`status-badge ${getStatusBadgeClass(trackedItem.status)}`}>
                  <span className="status-dot"></span> {trackedItem.status}
                </span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="stepper-wrap" id="trackStepper">
              <div className={`stepper-step ${getStepClass('Pending')}`}>
                <div className="step-circle">1</div>
                <div className="step-label">Submitted</div>
                <div className="step-sub">Initial Ticket Queued</div>
              </div>
              <div className={`step-line ${isLineCompleted(1) ? 'completed' : ''}`}></div>
              <div className={`stepper-step ${getStepClass('In Progress')}`}>
                <div className="step-circle">2</div>
                <div className="step-label">In Progress</div>
                <div className="step-sub">Under Review / Maintenance</div>
              </div>
              <div className={`step-line ${isLineCompleted(2) ? 'completed' : ''}`}></div>
              <div className={`stepper-step ${getStepClass('Resolved')}`}>
                <div className="step-circle">3</div>
                <div className="step-label">Resolved</div>
                <div className="step-sub">Issue Closed &amp; Verified</div>
              </div>
            </div>

            <div className="track-body-details">
              <h4 id="trackResultTitle">{trackedItem.title}</h4>
              <p id="trackResultDesc">{trackedItem.description}</p>
              <div className="track-footer-tags">
                <span className="tag-pill" id="trackResultCategory">
                  Category: {trackedItem.category}
                </span>
                <span className="tag-pill" id="trackResultStudent">
                  {trackedItem.studentName} ({trackedItem.department})
                </span>
                <button
                  type="button"
                  className="btn btn-xs btn-outline"
                  onClick={() => onOpenView(trackedItem)}
                >
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Not Found Box */}
        {trackError && (
          <div className="track-not-found" style={{ display: 'flex' }}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>
              No complaint found matching the ID: <strong>{trackError}</strong>. Please check the spelling and try again.
            </span>
          </div>
        )}
      </div>

      {/* Student Complaints Grid/Cards */}
      <div className="student-complaints-section">
        <div className="section-title-bar">
          <div>
            <h3 className="card-title">Submitted Campus Grievances</h3>
            <p className="card-subtitle">
              Review status, update details, or remove complaints you have submitted.
            </p>
          </div>
          <div className="student-filters">
            <select
              className="form-select form-select-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter student complaints"
            >
              <option value="ALL">All Categories</option>
              <option value="Hostel">Hostel</option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Other">Other</option>
            </select>
            <select
              className="form-select form-select-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter student status"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--slate-500)' }}>
            <div className="status-dot-pulse" style={{ display: 'inline-block', marginRight: '8px' }}></div>
            Loading complaints...
          </div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h4>No complaints to display</h4>
            <p>You haven't submitted any complaints under this filter yet.</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/submit')}>
              Lodge New Complaint
            </button>
          </div>
        ) : (
          <div className="cards-grid">
            {complaints.map((item) => {
              const dateStr = item.createdAt
                ? new Date(item.createdAt).toISOString().split('T')[0]
                : item.date || 'N/A';

              return (
                <div key={item._id || item.complaintId} className="complaint-card">
                  <div>
                    <div className="card-top-row">
                      <span className="complaint-id-link" onClick={() => onOpenView(item)}>
                        {item.complaintId}
                      </span>
                      <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                        <span className="status-dot"></span> {item.status}
                      </span>
                    </div>

                    <h4 className="card-complaint-title" title={item.title}>
                      {item.title}
                    </h4>
                    <p className="card-complaint-desc">{item.description}</p>
                  </div>

                  <div>
                    <div className="card-metadata">
                      <span className={`category-badge ${getCategoryBadgeClass(item.category)}`}>
                        {item.category}
                      </span>
                      <span>📅 {dateStr}</span>
                    </div>

                    <div className="card-bottom-actions">
                      <button className="btn btn-xs btn-outline" onClick={() => onOpenView(item)}>
                        View Details
                      </button>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button className="btn btn-xs btn-secondary" onClick={() => onOpenEdit(item)}>
                          Edit
                        </button>
                        <button className="btn btn-xs btn-danger" onClick={() => onOpenDelete(item)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
