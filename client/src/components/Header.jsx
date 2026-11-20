import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Header({ onToggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamic titles depending on active route
  let title = 'Admin Dashboard';
  let subtitle = 'Manage, filter, and track resolution of student campus grievances.';
  let isAdminActive = location.pathname.startsWith('/admin') || location.pathname === '/';
  let isStudentActive = location.pathname.startsWith('/my-complaints') || location.pathname.startsWith('/submit');

  if (location.pathname.startsWith('/submit')) {
    title = 'Submit Complaint';
    subtitle = 'Lodge a new grievance with your campus administration.';
  } else if (location.pathname.startsWith('/my-complaints')) {
    title = 'Student Portal';
    subtitle = 'Track your complaints, review status, and update ticket details.';
  }

  return (
    <header className="top-header">
      <div className="top-header-left">
        <button
          className="mobile-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div>
          <h2 className="view-title">{title}</h2>
          <p className="view-desc">{subtitle}</p>
        </div>
      </div>

      <div className="top-header-right">
        {/* Quick Role / View Switcher */}
        <div className="role-switcher">
          <span className="role-label">Switch View:</span>
          <div className="segmented-control">
            <button
              className={`segment-btn ${isAdminActive ? 'active' : ''}`}
              onClick={() => navigate('/admin')}
            >
              Admin
            </button>
            <button
              className={`segment-btn ${isStudentActive ? 'active' : ''}`}
              onClick={() => navigate('/my-complaints')}
            >
              Student
            </button>
          </div>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate('/submit')}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>New Complaint</span>
        </button>
      </div>
    </header>
  );
}
