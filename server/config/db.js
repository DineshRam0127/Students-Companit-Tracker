const mongoose = require('mongoose');

const INITIAL_SAMPLE_COMPLAINTS = [
  {
    complaintId: 'CMP-2026-1001',
    studentName: 'Alex Johnson',
    department: 'Computer Science & Engineering',
    title: 'Wi-Fi connectivity dropouts in Hostel Block B',
    description: 'The Wi-Fi access point on the 3rd floor of Hostel Block B repeatedly disconnects between 8 PM and 11 PM. Students are having trouble accessing digital course materials and lab portals.',
    category: 'Hostel',
    status: 'Pending'
  },
  {
    complaintId: 'CMP-2026-1002',
    studentName: 'Priya Sharma',
    department: 'Electronics & Communication',
    title: 'Stale bread and unhygienic juice counter at North Cafeteria',
    description: 'The food service at North Cafeteria served expired sandwich loaves and the juice dispensing counter has stagnant water accumulating around it. Needs urgent hygiene inspection.',
    category: 'Food',
    status: 'In Progress'
  },
  {
    complaintId: 'CMP-2026-1003',
    studentName: 'Marcus Chen',
    department: 'Mechanical Engineering',
    title: 'Route 14 campus shuttle bus delayed by 40 minutes daily',
    description: 'The morning 8:15 AM shuttle for Route 14 (South Campus to Main Engineering Block) has arrived over 35 to 45 minutes late three times this week, causing students to miss early lectures.',
    category: 'Transport',
    status: 'Resolved'
  },
  {
    complaintId: 'CMP-2026-1004',
    studentName: 'Ananya Roy',
    department: 'Information Technology',
    title: 'Air conditioning malfunction in Computer Lab 3',
    description: 'Two central air conditioners in Lab 3 have been leaking water and producing high fan noise, creating hazardous wet spots near server racks and desktop power cords.',
    category: 'Infrastructure',
    status: 'In Progress'
  },
  {
    complaintId: 'CMP-2026-1005',
    studentName: 'Devon Miller',
    department: 'Civil & Environmental Eng.',
    title: 'Flickering streetlights along North Campus walking trail',
    description: 'The LED poles from Library Quad to North Gate are constantly flickering and two bulbs are completely burned out, creating pitch-black areas after 7 PM.',
    category: 'Infrastructure',
    status: 'Pending'
  },
  {
    complaintId: 'CMP-2026-1006',
    studentName: 'Sofia Martinez',
    department: 'Biotechnology',
    title: 'Microbiology lab reference volumes missing from Central Library',
    description: 'The designated reserve shelf for semester 5 Advanced Genetics and Cell Biology has 4 missing reference copies that were not logged out properly through the circulation desk.',
    category: 'Other',
    status: 'Resolved'
  }
];

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri || uri.includes('YOUR_NEW_MONGODB_ATLAS_CONNECTION_STRING')) {
    console.error('\x1b[31m%s\x1b[0m', '================================================================');
    console.error('\x1b[31m%s\x1b[0m', 'DATABASE CONFIGURATION ERROR:');
    console.error('\x1b[31m%s\x1b[0m', 'MONGO_URI is not configured in server/.env.');
    console.error('\x1b[31m%s\x1b[0m', 'Please specify a valid MongoDB Atlas connection string or local MongoDB URI:');
    console.error('\x1b[33m%s\x1b[0m', 'MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/smart_campus_complaints');
    console.error('\x1b[31m%s\x1b[0m', '================================================================');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri);

    console.log('\x1b[32m%s\x1b[0m', `✓ MongoDB Connected Successfully: ${conn.connection.host}`);
    console.log('\x1b[36m%s\x1b[0m', `  Database Name: ${conn.connection.name}`);

    // Auto-seed initial 5-6 sample complaints only if collection is empty
    const Complaint = require('../models/Complaint');
    const count = await Complaint.countDocuments();
    if (count === 0) {
      console.log('\x1b[33m%s\x1b[0m', '  Complaints collection is empty. Seeding initial 6 sample complaints...');
      await Complaint.insertMany(INITIAL_SAMPLE_COMPLAINTS);
      console.log('\x1b[32m%s\x1b[0m', '  ✓ Seeded 6 sample complaints into MongoDB.');
    } else {
      console.log('\x1b[36m%s\x1b[0m', `  Found ${count} existing complaints in database.`);
    }

    return true;
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '================================================================');
    console.error('\x1b[31m%s\x1b[0m', `MONGODB CONNECTION FAILED: ${error.message}`);
    console.error('\x1b[31m%s\x1b[0m', 'Please verify your network connection and MongoDB Atlas IP whitelist / credentials.');
    console.error('\x1b[31m%s\x1b[0m', '================================================================');
    return false;
  }
};

module.exports = { connectDB, INITIAL_SAMPLE_COMPLAINTS };
