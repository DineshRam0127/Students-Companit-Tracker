# Smart Campus Complaint Management System (MERN Stack)

A complete, production-grade **MERN Stack** (MongoDB Atlas, Express.js, React.js, Node.js) implementation of the Smart Campus Complaint Management System.

> **Design Notice**: The frontend interface retains **100% of the original SaaS UI design, typography, colors, animations, responsive breakpoints, and layout** from the original HTML/CSS version, now powered by React.js components, React Router DOM, Axios, and a modular Node.js/Express REST backend backed by MongoDB.

---

## 1. Technology Stack

- **Frontend**:
  - **React.js** (v18.3) with **Vite** (v6)
  - **React Router DOM** (v6) for client-side routing (`/admin`, `/submit`, `/my-complaints`)
  - **Axios** (v1.7) with unified error handling and request interceptors
  - **Pure CSS3** directly migrated from `style.css` (zero external UI frameworks)
- **Backend**:
  - **Node.js** (v22) runtime
  - **Express.js** (v4.21) for modular REST APIs
  - **CORS** middleware for cross-origin access
  - **dotenv** for secure environment configuration
- **Database**:
  - **MongoDB Atlas** / Local MongoDB
  - **Mongoose** (v8.9) with schema validation, indexes, and sequential ID generation
- **Development Tools**:
  - Antigravity IDE, VS Code, MongoDB Compass, Nodemon

---

## 2. Project Directory Structure

```
smart-campus-complaint-system/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx        # Top bar with view title, role switcher, quick new button
│   │   │   ├── Sidebar.jsx       # Brand logo, navigation links, status pill, sample reset
│   │   │   ├── Toast.jsx         # Non-blocking animated toast feedback alerts
│   │   │   ├── ViewModal.jsx     # Full complaint view modal
│   │   │   ├── EditModal.jsx     # Modal for updating title, description, category
│   │   │   ├── StatusModal.jsx   # Admin modal for changing status (Pending/In Progress/Resolved)
│   │   │   └── DeleteModal.jsx   # Confirmation modal for record removal
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx  # Summary cards, live filters & search, management table
│   │   │   ├── SubmitComplaint.jsx # Form validation, unique ID generation, MongoDB creation
│   │   │   └── MyComplaints.jsx    # Complaint ID tracker with 3-step stepper, cards grid
│   │   ├── services/
│   │   │   └── api.js            # Axios client with REST endpoint methods
│   │   ├── App.jsx               # Application shell, modal & toast coordinator, routes
│   │   ├── main.jsx              # React DOM entry point with BrowserRouter
│   │   └── index.css             # Exact original CSS styling preserved
│   ├── index.html                # HTML entry point for Vite
│   ├── vite.config.js            # Vite configuration with proxy to port 5000
│   ├── .env.example              # Client environment template
│   ├── .env                      # VITE_API_URL=http://localhost:5000/api
│   └── package.json
│
├── server/
│   ├── config/
│   │   └── db.js                 # Mongoose connection & sample seed logic
│   ├── models/
│   │   └── Complaint.js          # Complaint schema & sequential ID generator
│   ├── controllers/
│   │   └── complaintController.js# Business logic for all 8 REST endpoints
│   ├── routes/
│   │   └── complaintRoutes.js    # Express route mappings (specific routes first)
│   ├── middleware/
│   │   └── errorMiddleware.js    # Centralized 404 & error handlers
│   ├── server.js                 # Express server bootstrap
│   ├── .env.example              # Server environment template
│   ├── .env                      # MONGO_URI and PORT configuration
│   └── package.json
│
├── .gitignore                    # Protects node_modules, .env files, builds
└── README.md
```

---

## 3. REST API Specification

Base URL: `http://localhost:5000/api/complaints`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/complaints` | Create complaint (auto-generates `complaintId`, initial status `Pending`) | Public |
| `GET` | `/api/complaints` | Retrieve all complaints (supports query params `?category=...&status=...&search=...`) | Public |
| `GET` | `/api/complaints/stats/summary` | Retrieve dynamic counts (total, pending, inProgress, resolved) | Public |
| `GET` | `/api/complaints/id/:complaintId`| Lookup single complaint by Complaint ID (e.g. `CMP-2026-1001`) | Public |
| `GET` | `/api/complaints/:id` | Lookup single complaint by MongoDB `_id` | Public |
| `PUT` | `/api/complaints/:id` | Update complaint details (`title`, `description`, `category`) | Public |
| `PATCH`| `/api/complaints/:id/status` | Update resolution status (`Pending`, `In Progress`, `Resolved`) | Admin |
| `DELETE`| `/api/complaints/:id` | Permanently remove complaint record | Public |
| `POST` | `/api/complaints/reset-samples`| Restore initial 6 sample records in MongoDB collection | Public |

---

## 4. Environment Variables Setup

### Server Configuration (`server/.env`):
```env
# MongoDB Atlas Connection String
# Replace with your Atlas connection string or local MongoDB:
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/smart_campus_complaints?retryWrites=true&w=majority
PORT=5000
```
*Note: The server reads `process.env.MONGO_URI`. If the database connection fails or is misconfigured, a clear backend error message is displayed on the console and frontend.*

### Client Configuration (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 5. How to Run the Application

### Step 1: Install Dependencies
Open two terminal windows or run sequentially:

```powershell
# Install backend dependencies
cd "smart-campus-complaint-system/server"
npm install

# Install frontend dependencies
cd "../client"
npm install
```

### Step 2: Start the Backend Server
```powershell
cd "smart-campus-complaint-system/server"
npm run dev
# or: npm start
```
*Backend runs on: `http://localhost:5000`*

### Step 3: Start the React Frontend
```powershell
cd "smart-campus-complaint-system/client"
npm run dev
```
*Frontend runs on: `http://localhost:3000`*

---

## 6. Verification & Automated Features

- **MongoDB Auto-Seeding**: If the `complaints` collection is empty on startup, 6 realistic complaints across diverse campus categories (*Hostel, Food, Transport, Infrastructure, Other*) are automatically inserted.
- **Unique Complaint ID**: Format `CMP-YYYY-XXXX` (e.g. `CMP-2026-1001`), sequentially generated and indexed as unique in MongoDB.
- **Real-Time Synchronized Statistics**: Updating status, adding, editing, or deleting a complaint immediately refreshes the 4 summary cards (`Total`, `Pending`, `In Progress`, `Resolved`) from MongoDB Atlas.
- **Search & Filter Matrix**: Search across Complaint ID, Student Name, and Title combined with Category and Status dropdowns.
- **Track Status Stepper**: Live 3-step visual progress stepper for student lookup.
- **Data Persistence**: All records persist across browser refreshes and server restarts in MongoDB.
- **Reset Sample Data**: A button in the sidebar footer enables quick restoration of the standard sample dataset in MongoDB.
