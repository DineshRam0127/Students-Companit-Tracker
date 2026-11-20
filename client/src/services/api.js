import axios from 'axios';

// Base URL configured from environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Response interceptor for consistent error messaging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected network error occurred';
    if (error.response && error.response.data && error.response.data.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

/**
 * Fetch complaints with optional filter parameters { category, status, search }
 */
export const fetchComplaints = async (params = {}) => {
  const response = await api.get('/complaints', { params });
  return response.data.data;
};

/**
 * Fetch summary statistics for the 4 metric cards
 */
export const fetchComplaintStats = async () => {
  const response = await api.get('/complaints/stats/summary');
  return response.data.data;
};

/**
 * Fetch single complaint by Complaint ID (e.g. CMP-2026-1001) for student tracker
 */
export const fetchComplaintByComplaintId = async (complaintId) => {
  const response = await api.get(`/complaints/id/${encodeURIComponent(complaintId.trim())}`);
  return response.data.data;
};

/**
 * Fetch single complaint by MongoDB _id
 */
export const fetchComplaintById = async (id) => {
  const response = await api.get(`/complaints/${id}`);
  return response.data.data;
};

/**
 * Create a new complaint in MongoDB
 */
export const createComplaint = async (complaintData) => {
  const response = await api.post('/complaints', complaintData);
  return response.data;
};

/**
 * Update complaint details (title, description, category) in MongoDB
 */
export const updateComplaint = async (id, updatedData) => {
  const response = await api.put(`/complaints/${id}`, updatedData);
  return response.data;
};

/**
 * Update resolution status (Pending, In Progress, Resolved) in MongoDB
 */
export const updateComplaintStatus = async (id, status) => {
  const response = await api.patch(`/complaints/${id}/status`, { status });
  return response.data;
};

/**
 * Delete a complaint record by MongoDB _id
 */
export const deleteComplaint = async (id) => {
  const response = await api.delete(`/complaints/${id}`);
  return response.data;
};

/**
 * Reset MongoDB collection to initial 6 sample complaints
 */
export const resetSampleComplaints = async () => {
  const response = await api.post('/complaints/reset-samples');
  return response.data;
};

export default api;
