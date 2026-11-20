const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const complaintRoutes = require('./routes/complaintRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB();

// Core Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Root Status Endpoint
app.get('/', (req, res) => {
  res.json({
    project: 'Smart Campus Complaint Management System',
    stack: 'MERN (MongoDB, Express, React, Node)',
    status: 'API operational',
    endpoints: {
      complaints: '/api/complaints',
      stats: '/api/complaints/stats/summary',
      trackById: '/api/complaints/id/:complaintId'
    }
  });
});

// Mount Routes
app.use('/api/complaints', complaintRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start HTTP Server
app.listen(PORT, () => {
  console.log('\x1b[35m%s\x1b[0m', '================================================================');
  console.log('\x1b[32m%s\x1b[0m', `  Smart Campus Backend running on port ${PORT}`);
  console.log('\x1b[36m%s\x1b[0m', `  REST API: http://localhost:${PORT}/api/complaints`);
  console.log('\x1b[35m%s\x1b[0m', '================================================================');
});
