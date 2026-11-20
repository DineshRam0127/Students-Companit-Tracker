import React, { useState, useEffect } from 'react';
import { fetchComplaints, fetchComplaintStats } from '../services/api';

export default function AdminDashboard({
  onOpenView,
  onOpenEdit,
  onOpenStatus,
  onOpenDelete,
  refreshTrigger
}) {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [complaintList, statsData] = await Promise.all([
        fetchComplaints({ search, category, status }),
        fetchComplaintStats()
      ]);
      setComplaints(complaintList);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError(err.message || 'Unable to connect to MongoDB Atlas backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, category, status, refreshTrigger]);

  const resetFilters = () => {
    setSearch('');
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

  return (
    <section className="view-section active" id="viewAdminDashboard">
      {/* Backend Error Alert if connection fails */}
      {error && (
        <div className="alert alert-danger" style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <strong>Database Connection Error:</strong> {error}
            <span style={{ display: 'block', fontSize: '0.8rem', marginTop: '2px' }}>
              Ensure your MongoDB server is active or your MongoDB Atlas URI in <code>server/.env</code> is reachable.
            </span>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon-wrapper icon-blue">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Complaints</span>
            <h3 className="stat-value">{stats.total}</h3>
            <span className="stat-meta">All registered records</span>
          </div>
        </div>

        <div className="stat-card stat-pending">
          <div className="stat-icon-wrapper icon-amber">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Pending</span>
            <h3 className="stat-value">{stats.pending}</h3>
            <span className="stat-meta text-amber">Awaiting campus review</span>
          </div>
        </div>

        <div className="stat-card stat-progress">
          <div className="stat-icon-wrapper icon-sky">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">In Progress</span>
            <h3 className="stat-value">{stats.inProgress}</h3>
            <span className="stat-meta text-sky">Under active resolution</span>
          </div>
        </div>

        <div className="stat-card stat-resolved">
          <div className="stat-icon-wrapper icon-emerald">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Resolved</span>
            <h3 className="stat-value">{stats.resolved}</h3>
            <span className="stat-meta text-emerald">Closed successfully</span>
          </div>
        </div>
      </div>

      {/* Table Card with Search & Filters */}
      <div className="card table-card">
        <div className="card-header-tools">
          <div className="tools-left">
            <h3 className="card-title">All Campus Grievances</h3>
            <span className="badge badge-neutral">
              {complaints.length} of {stats.total} complaints
            </span>
          </div>

          {/* Filters and Search Toolbar */}
          <div className="toolbar-wrapper">
            <div className="search-box">
              <svg className="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="form-control"
                placeholder="Search by ID or Student Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="clear-search-btn" onClick={() => setSearch('')}>
                  &times;
                </button>
              )}
            </div>

            <div className="filter-group">
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Filter by Category"
              >
                <option value="ALL">All Categories</option>
                <option value="Hostel">Hostel</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Other">Other</option>
              </select>

              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                aria-label="Filter by Status"
              >
                <option value="ALL">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>

              <button className="btn btn-outline btn-sm" onClick={resetFilters} title="Reset all search filters">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Complaint Management Table */}
        <div className="table-responsive">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--slate-500)' }}>
              <div className="status-dot-pulse" style={{ display: 'inline-block', marginRight: '8px' }}></div>
              Loading complaints from MongoDB...
            </div>
          ) : complaints.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrap">
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </div>
              <h4>No complaints found</h4>
              <p>No complaints match your current search or filter criteria.</p>
              <button className="btn btn-secondary btn-sm" onClick={resetFilters}>
                Clear Filters
              </button>
            </div>
          ) : (
            <table className="data-table" id="adminComplaintsTable">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Complaint Title</th>
                  <th>Category</th>
                  <th>Submission Date</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((item) => {
                  const dateStr = item.createdAt
                    ? new Date(item.createdAt).toISOString().split('T')[0]
                    : item.date || 'N/A';

                  return (
                    <tr key={item._id || item.complaintId}>
                      <td>
                        <a
                          href="javascript:void(0)"
                          className="complaint-id-link"
                          onClick={() => onOpenView(item)}
                          title="Click to view details"
                        >
                          {item.complaintId}
                        </a>
                      </td>
                      <td>
                        <span className="table-student-name">{item.studentName}</span>
                        <span className="table-dept-name">{item.department}</span>
                      </td>
                      <td>
                        <span className="table-dept-name" style={{ fontWeight: 500, color: 'var(--slate-700)' }}>
                          {item.department}
                        </span>
                      </td>
                      <td>
                        <div className="table-title-cell" title={item.title}>
                          {item.title}
                        </div>
                      </td>
                      <td>
                        <span className={`category-badge ${getCategoryBadgeClass(item.category)}`}>
                          {item.category}
                        </span>
                      </td>
                      <td>{dateStr}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                          <span className="status-dot"></span> {item.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="table-actions">
                          <button
                            className="btn btn-xs btn-outline"
                            onClick={() => onOpenView(item)}
                            title="View Complaint Details"
                          >
                            View
                          </button>
                          <button
                            className="btn btn-xs btn-primary"
                            onClick={() => onOpenStatus(item)}
                            title="Update Resolution Status"
                          >
                            Status
                          </button>
                          <button
                            className="btn btn-xs btn-secondary"
                            onClick={() => onOpenEdit(item)}
                            title="Edit Complaint"
                          >
                            Edit
                          </button>
                          <button
                            className="btn-icon-only btn-icon-danger"
                            onClick={() => onOpenDelete(item)}
                            title="Delete Complaint"
                            aria-label="Delete"
                          >
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
