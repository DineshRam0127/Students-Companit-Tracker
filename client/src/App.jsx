import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';
import ViewModal from './components/ViewModal';
import EditModal from './components/EditModal';
import StatusModal from './components/StatusModal';
import DeleteModal from './components/DeleteModal';

import AdminDashboard from './pages/AdminDashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import MyComplaints from './pages/MyComplaints';

import {
  updateComplaint,
  updateComplaintStatus,
  deleteComplaint,
  resetSampleComplaints
} from './services/api';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modals state
  const [viewComplaint, setViewComplaint] = useState(null);
  const [editComplaint, setEditComplaint] = useState(null);
  const [statusComplaint, setStatusComplaint] = useState(null);
  const [deleteComplaintItem, setDeleteComplaintItem] = useState(null);

  // Toasts state
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const triggerRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  // Modal actions
  const handleSaveEdit = async (id, updatedData) => {
    try {
      const res = await updateComplaint(id, updatedData);
      addToast(res.message || 'Complaint updated successfully!', 'success');
      triggerRefresh();
    } catch (err) {
      addToast(err.message || 'Failed to update complaint', 'danger');
      throw err;
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await updateComplaintStatus(id, newStatus);
      addToast(res.message || `Status updated to '${newStatus}'`, 'success');
      triggerRefresh();
    } catch (err) {
      addToast(err.message || 'Failed to update complaint status', 'danger');
      throw err;
    }
  };

  const handleConfirmDelete = async (id) => {
    try {
      const res = await deleteComplaint(id);
      addToast(res.message || 'Complaint permanently deleted.', 'danger');
      triggerRefresh();
    } catch (err) {
      addToast(err.message || 'Failed to delete complaint', 'danger');
      throw err;
    }
  };

  const handleResetSampleData = async () => {
    if (window.confirm('Reset complaints in MongoDB to original 6 sample records? Any newly added tickets will be replaced.')) {
      try {
        const res = await resetSampleComplaints();
        addToast(res.message || 'Sample complaints restored to MongoDB!', 'success');
        triggerRefresh();
      } catch (err) {
        addToast(err.message || 'Failed to reset sample data', 'danger');
      }
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onResetSamples={handleResetSampleData}
      />

      {/* Main Content Area */}
      <main className="main-wrapper">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="content-body">
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route
              path="/admin"
              element={
                <AdminDashboard
                  onOpenView={(item) => setViewComplaint(item)}
                  onOpenEdit={(item) => setEditComplaint(item)}
                  onOpenStatus={(item) => setStatusComplaint(item)}
                  onOpenDelete={(item) => setDeleteComplaintItem(item)}
                  refreshTrigger={refreshKey}
                />
              }
            />
            <Route
              path="/submit"
              element={
                <SubmitComplaint
                  onComplaintCreated={triggerRefresh}
                  onNotify={addToast}
                />
              }
            />
            <Route
              path="/my-complaints"
              element={
                <MyComplaints
                  onOpenView={(item) => setViewComplaint(item)}
                  onOpenEdit={(item) => setEditComplaint(item)}
                  onOpenDelete={(item) => setDeleteComplaintItem(item)}
                  refreshTrigger={refreshKey}
                  onNotify={addToast}
                />
              }
            />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>

        <footer className="app-footer">
          <p>
            Smart Campus Complaint Management System &copy; 2026. Built with MERN Stack (MongoDB, Express, React, Node.js).
          </p>
        </footer>
      </main>

      {/* Modals */}
      <ViewModal
        complaint={viewComplaint}
        onClose={() => setViewComplaint(null)}
      />

      <EditModal
        complaint={editComplaint}
        onClose={() => setEditComplaint(null)}
        onSave={handleSaveEdit}
      />

      <StatusModal
        complaint={statusComplaint}
        onClose={() => setStatusComplaint(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      <DeleteModal
        complaint={deleteComplaintItem}
        onClose={() => setDeleteComplaintItem(null)}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* Toasts */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
