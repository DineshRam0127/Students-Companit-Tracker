/**
 * ============================================================================
 * Smart Campus Complaint Management System
 * Vanilla JavaScript Application Architect
 * ============================================================================
 */

// Storage Key
const STORAGE_KEY = 'smart_campus_complaints_data';

// 5 Realistic Sample Complaints
const INITIAL_SAMPLE_COMPLAINTS = [
  {
    id: 'CMP-2026-1001',
    studentName: 'Alex Johnson',
    department: 'Computer Science & Engineering',
    title: 'Wi-Fi connectivity dropouts in Hostel Block B',
    description: 'The Wi-Fi access point on the 3rd floor of Hostel Block B repeatedly disconnects between 8 PM and 11 PM. Students are having trouble accessing digital course materials and lab portals.',
    category: 'Hostel',
    date: '2026-11-18',
    status: 'Pending'
  },
  {
    id: 'CMP-2026-1002',
    studentName: 'Priya Sharma',
    department: 'Electronics & Communication',
    title: 'Stale bread and unhygienic juice counter at North Cafeteria',
    description: 'The food service at North Cafeteria served expired sandwich loaves and the juice dispensing counter has stagnant water accumulating around it. Needs urgent hygiene inspection.',
    category: 'Food',
    date: '2026-11-17',
    status: 'In Progress'
  },
  {
    id: 'CMP-2026-1003',
    studentName: 'Marcus Chen',
    department: 'Mechanical Engineering',
    title: 'Route 14 campus shuttle bus delayed by 40 minutes daily',
    description: 'The morning 8:15 AM shuttle for Route 14 (South Campus to Main Engineering Block) has arrived over 35 to 45 minutes late three times this week, causing students to miss early lectures.',
    category: 'Transport',
    date: '2026-11-15',
    status: 'Resolved'
  },
  {
    id: 'CMP-2026-1004',
    studentName: 'Ananya Roy',
    department: 'Information Technology',
    title: 'Air conditioning malfunction in Computer Lab 3',
    description: 'Two central air conditioners in Lab 3 have been leaking water and producing high fan noise, creating hazardous wet spots near server racks and desktop power cords.',
    category: 'Infrastructure',
    date: '2026-11-19',
    status: 'In Progress'
  },
  {
    id: 'CMP-2026-1005',
    studentName: 'Devon Miller',
    department: 'Civil & Environmental Eng.',
    title: 'Flickering streetlights along North Campus walking trail',
    description: 'The LED poles from Library Quad to North Gate are constantly flickering and two bulbs are completely burned out, creating pitch-black areas after 7 PM.',
    category: 'Infrastructure',
    date: '2026-11-14',
    status: 'Pending'
  },
  {
    id: 'CMP-2026-1006',
    studentName: 'Sofia Martinez',
    department: 'Biotechnology',
    title: 'Microbiology lab reference volumes missing from Central Library',
    description: 'The designated reserve shelf for semester 5 Advanced Genetics and Cell Biology has 4 missing reference copies that were not logged out properly through the circulation desk.',
    category: 'Other',
    date: '2026-11-12',
    status: 'Resolved'
  }
];

// App State
let complaints = [];
let activeView = 'admin-dashboard';
let complaintToDeleteId = null;

// ============================================================================
// Core Required CRUD & Data Functions
// ============================================================================

/**
 * 1. getComplaints()
 * Loads complaints from localStorage safely, or initializes with sample data.
 */
function getComplaints() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      complaints = [...INITIAL_SAMPLE_COMPLAINTS];
      saveComplaintsToStorage();
    } else {
      complaints = JSON.parse(stored);
      if (!Array.isArray(complaints)) {
        complaints = [...INITIAL_SAMPLE_COMPLAINTS];
        saveComplaintsToStorage();
      }
    }
  } catch (err) {
    console.error('Failed to read localStorage. Restoring samples.', err);
    complaints = [...INITIAL_SAMPLE_COMPLAINTS];
    saveComplaintsToStorage();
  }
  return complaints;
}

/**
 * Helper to persist current complaints state to localStorage.
 */
function saveComplaintsToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
    showToast('Failed to save data to browser storage', 'danger');
  }
}

/**
 * 10. generateComplaintId()
 * Automatically generates a unique, non-colliding Complaint ID.
 */
function generateComplaintId() {
  const year = new Date().getFullYear();
  let maxSeq = 1000;
  
  complaints.forEach(item => {
    if (item.id && item.id.startsWith(`CMP-${year}-`)) {
      const parts = item.id.split('-');
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  });

  const nextSeq = maxSeq + 1;
  return `CMP-${year}-${nextSeq}`;
}

/**
 * 1. addComplaint()
 * Validates, constructs, and saves a new complaint record with initial status 'Pending'.
 */
function addComplaint(newComplaintData) {
  const newComplaint = {
    id: generateComplaintId(),
    studentName: newComplaintData.studentName.trim(),
    department: newComplaintData.department.trim(),
    title: newComplaintData.title.trim(),
    description: newComplaintData.description.trim(),
    category: newComplaintData.category,
    date: new Date().toISOString().split('T')[0],
    status: 'Pending'
  };

  complaints.unshift(newComplaint);
  saveComplaintsToStorage();

  // Update UI everywhere
  renderComplaints();
  updateDashboardStats();

  return newComplaint;
}

/**
 * 3. updateComplaint()
 * Allows student/admin to edit title, description, and category.
 */
function updateComplaint(id, updatedData) {
  const index = complaints.findIndex(c => c.id === id);
  if (index === -1) return false;

  complaints[index].title = updatedData.title.trim();
  complaints[index].description = updatedData.description.trim();
  complaints[index].category = updatedData.category;

  saveComplaintsToStorage();
  renderComplaints();
  updateDashboardStats();

  return true;
}

/**
 * 4. deleteComplaint()
 * Deletes a complaint record by ID from memory and localStorage.
 */
function deleteComplaint(id) {
  const prevLen = complaints.length;
  complaints = complaints.filter(c => c.id !== id);
  
  if (complaints.length !== prevLen) {
    saveComplaintsToStorage();
    renderComplaints();
    updateDashboardStats();
    return true;
  }
  return false;
}

/**
 * 5. updateComplaintStatus()
 * Changes resolution status between 'Pending', 'In Progress', and 'Resolved'.
 */
function updateComplaintStatus(id, newStatus) {
  const validStatuses = ['Pending', 'In Progress', 'Resolved'];
  if (!validStatuses.includes(newStatus)) return false;

  const item = complaints.find(c => c.id === id);
  if (!item) return false;

  item.status = newStatus;
  saveComplaintsToStorage();
  renderComplaints();
  updateDashboardStats();

  return true;
}

/**
 * 6. searchComplaint()
 * Searches complaints by ID or student name.
 */
function searchComplaint(query, sourceList = complaints) {
  if (!query || !query.trim()) return sourceList;
  const q = query.trim().toLowerCase();
  return sourceList.filter(item => 
    item.id.toLowerCase().includes(q) ||
    item.studentName.toLowerCase().includes(q) ||
    item.title.toLowerCase().includes(q)
  );
}

/**
 * 7. filterComplaints()
 * Filters complaints by category and status.
 */
function filterComplaints(category = 'ALL', status = 'ALL', sourceList = complaints) {
  return sourceList.filter(item => {
    const matchCategory = (category === 'ALL' || item.category === category);
    const matchStatus = (status === 'ALL' || item.status === status);
    return matchCategory && matchStatus;
  });
}

/**
 * 9. updateDashboardStats()
 * Dynamically counts and displays dashboard summary cards.
 */
function updateDashboardStats() {
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;

  const totalEl = document.getElementById('statTotalCount');
  const pendingEl = document.getElementById('statPendingCount');
  const progressEl = document.getElementById('statProgressCount');
  const resolvedEl = document.getElementById('statResolvedCount');

  if (totalEl) totalEl.textContent = total;
  if (pendingEl) pendingEl.textContent = pending;
  if (progressEl) progressEl.textContent = inProgress;
  if (resolvedEl) resolvedEl.textContent = resolved;
}

/**
 * 8. renderComplaints()
 * Re-renders both the Admin Management Table and the Student Complaints Cards based on active filters.
 */
function renderComplaints() {
  renderAdminTable();
  renderStudentCards();
}

// ============================================================================
// Render Sub-functions
// ============================================================================

/**
 * Renders the Admin complaints table with real-time filters and search.
 */
function renderAdminTable() {
  const tbody = document.getElementById('adminComplaintsTbody');
  const emptyState = document.getElementById('adminEmptyState');
  const table = document.getElementById('adminComplaintsTable');
  const counter = document.getElementById('recordsCounter');
  if (!tbody) return;

  const searchInput = document.getElementById('adminSearchInput');
  const categoryFilter = document.getElementById('filterCategory');
  const statusFilter = document.getElementById('filterStatus');

  const searchTerm = searchInput ? searchInput.value : '';
  const selectedCat = categoryFilter ? categoryFilter.value : 'ALL';
  const selectedStatus = statusFilter ? statusFilter.value : 'ALL';

  // Apply filters then search
  let filtered = filterComplaints(selectedCat, selectedStatus, complaints);
  filtered = searchComplaint(searchTerm, filtered);

  if (counter) {
    counter.textContent = `${filtered.length} of ${complaints.length} complaints`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (table) table.style.display = 'none';
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }

  if (table) table.style.display = 'table';
  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = filtered.map(item => {
    return `
      <tr>
        <td>
          <a href="javascript:void(0)" class="complaint-id-link" onclick="openViewDetailsModal('${item.id}')" title="Click to view details">
            ${escapeHtml(item.id)}
          </a>
        </td>
        <td>
          <span class="table-student-name">${escapeHtml(item.studentName)}</span>
          <span class="table-dept-name">${escapeHtml(item.department)}</span>
        </td>
        <td>
          <span class="table-dept-name" style="font-weight: 500; color: var(--slate-700);">${escapeHtml(item.department)}</span>
        </td>
        <td>
          <div class="table-title-cell" title="${escapeHtml(item.title)}">
            ${escapeHtml(item.title)}
          </div>
        </td>
        <td>
          <span class="category-badge ${getCategoryBadgeClass(item.category)}">${escapeHtml(item.category)}</span>
        </td>
        <td>${escapeHtml(item.date)}</td>
        <td>
          <span class="status-badge ${getStatusBadgeClass(item.status)}">
            <span class="status-dot"></span> ${escapeHtml(item.status)}
          </span>
        </td>
        <td class="text-right">
          <div class="table-actions">
            <button class="btn btn-xs btn-outline" onclick="openViewDetailsModal('${item.id}')" title="View Complaint Details">
              View
            </button>
            <button class="btn btn-xs btn-primary" onclick="openStatusModal('${item.id}')" title="Update Resolution Status">
              Status
            </button>
            <button class="btn btn-xs btn-secondary" onclick="openEditModal('${item.id}')" title="Edit Complaint">
              Edit
            </button>
            <button class="btn-icon-only btn-icon-danger" onclick="confirmDeleteComplaint('${item.id}')" title="Delete Complaint" aria-label="Delete">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Renders the Student Portal cards.
 */
function renderStudentCards() {
  const grid = document.getElementById('studentComplaintsGrid');
  const emptyState = document.getElementById('studentEmptyState');
  if (!grid) return;

  const catSelect = document.getElementById('studentCategoryFilter');
  const statusSelect = document.getElementById('studentStatusFilter');

  const selectedCat = catSelect ? catSelect.value : 'ALL';
  const selectedStatus = statusSelect ? statusSelect.value : 'ALL';

  const filtered = filterComplaints(selectedCat, selectedStatus, complaints);

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  grid.innerHTML = filtered.map(item => {
    return `
      <div class="complaint-card">
        <div>
          <div class="card-top-row">
            <span class="complaint-id-link" onclick="openViewDetailsModal('${item.id}')">${escapeHtml(item.id)}</span>
            <span class="status-badge ${getStatusBadgeClass(item.status)}">
              <span class="status-dot"></span> ${escapeHtml(item.status)}
            </span>
          </div>

          <h4 class="card-complaint-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h4>
          <p class="card-complaint-desc">${escapeHtml(item.description)}</p>
        </div>

        <div>
          <div class="card-metadata">
            <span class="category-badge ${getCategoryBadgeClass(item.category)}">${escapeHtml(item.category)}</span>
            <span>📅 ${escapeHtml(item.date)}</span>
          </div>

          <div class="card-bottom-actions">
            <button class="btn btn-xs btn-outline" onclick="openViewDetailsModal('${item.id}')">
              View Details
            </button>
            <div style="display: flex; gap: 0.35rem;">
              <button class="btn btn-xs btn-secondary" onclick="openEditModal('${item.id}')">
                Edit
              </button>
              <button class="btn btn-xs btn-danger" onclick="confirmDeleteComplaint('${item.id}')">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================================
// Navigation Controller
// ============================================================================

function navigateTo(viewId) {
  activeView = viewId;

  // View sections toggle
  const views = {
    'admin-dashboard': document.getElementById('viewAdminDashboard'),
    'submit-complaint': document.getElementById('viewSubmitComplaint'),
    'my-complaints': document.getElementById('viewMyComplaints')
  };

  Object.keys(views).forEach(k => {
    if (views[k]) {
      if (k === viewId) {
        views[k].classList.add('active');
      } else {
        views[k].classList.remove('active');
      }
    }
  });

  // Sidebar item active state
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
    if (btn.dataset.view === viewId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Top header role switcher update
  const adminBtn = document.getElementById('btnSwitchAdmin');
  const studentBtn = document.getElementById('btnSwitchStudent');
  if (viewId === 'admin-dashboard') {
    if (adminBtn) adminBtn.classList.add('active');
    if (studentBtn) studentBtn.classList.remove('active');
    updateHeaderTitle('Admin Dashboard', 'Manage, filter, and track resolution of student campus grievances.');
  } else if (viewId === 'submit-complaint') {
    if (adminBtn) adminBtn.classList.remove('active');
    if (studentBtn) studentBtn.classList.add('active');
    updateHeaderTitle('Submit Complaint', 'Lodge a new grievance with your campus administration.');
  } else {
    if (adminBtn) adminBtn.classList.remove('active');
    if (studentBtn) studentBtn.classList.add('active');
    updateHeaderTitle('Student Portal', 'Track your complaints, review status, and update ticket details.');
  }

  // Close mobile sidebar if open
  closeMobileSidebar();

  // Scroll to top of content
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateHeaderTitle(title, subtitle) {
  const titleEl = document.getElementById('pageTitle');
  const subEl = document.getElementById('pageSubtitle');
  if (titleEl) titleEl.textContent = title;
  if (subEl) subEl.textContent = subtitle;
}

// ============================================================================
// Form Validation & Handling (Submit Complaint)
// ============================================================================

function setupComplaintForm() {
  const form = document.getElementById('complaintForm');
  const descEl = document.getElementById('complaintDesc');
  const charCountEl = document.getElementById('descCharCount');

  if (descEl && charCountEl) {
    descEl.addEventListener('input', () => {
      charCountEl.textContent = `${descEl.value.length} characters`;
    });
  }

  const resetBtn = document.getElementById('btnResetForm');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetSubmissionForm();
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('studentName');
      const deptInput = document.getElementById('studentDept');
      const catInput = document.getElementById('complaintCategory');
      const titleInput = document.getElementById('complaintTitle');
      const descInput = document.getElementById('complaintDesc');

      let isValid = true;

      // Validate Student Name
      if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
        showFieldError('studentName', 'Please enter a valid student name (at least 2 characters).');
        isValid = false;
      } else {
        clearFieldError('studentName');
      }

      // Validate Department
      if (!deptInput.value.trim() || deptInput.value.trim().length < 2) {
        showFieldError('studentDept', 'Please enter your department/branch name.');
        isValid = false;
      } else {
        clearFieldError('studentDept');
      }

      // Validate Category
      if (!catInput.value) {
        showFieldError('complaintCategory', 'Please select an issue category.');
        isValid = false;
      } else {
        clearFieldError('complaintCategory');
      }

      // Validate Title
      if (!titleInput.value.trim() || titleInput.value.trim().length < 5) {
        showFieldError('complaintTitle', 'Complaint title must be at least 5 characters long.');
        isValid = false;
      } else {
        clearFieldError('complaintTitle');
      }

      // Validate Description
      if (!descInput.value.trim() || descInput.value.trim().length < 15) {
        showFieldError('complaintDesc', 'Please provide a detailed description (at least 15 characters).');
        isValid = false;
      } else {
        clearFieldError('complaintDesc');
      }

      if (!isValid) {
        showToast('Please fix the highlighted errors before submitting.', 'danger');
        return;
      }

      // Add Complaint
      const newRecord = addComplaint({
        studentName: nameInput.value,
        department: deptInput.value,
        category: catInput.value,
        title: titleInput.value,
        description: descInput.value
      });

      // Clear Form
      resetSubmissionForm();

      // Show Success Alert
      const alertBox = document.getElementById('submitSuccessAlert');
      const alertMsg = document.getElementById('submitSuccessMessage');
      if (alertBox && alertMsg) {
        alertMsg.innerHTML = `Your Complaint ID is <span class="id-tag">${escapeHtml(newRecord.id)}</span>. Status is automatically set to <strong class="text-amber">Pending</strong>.`;
        alertBox.style.display = 'flex';
        alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      showToast(`Complaint ${newRecord.id} lodged successfully!`, 'success');
    });
  }
}

function resetSubmissionForm() {
  const form = document.getElementById('complaintForm');
  if (form) form.reset();
  clearFieldError('studentName');
  clearFieldError('studentDept');
  clearFieldError('complaintCategory');
  clearFieldError('complaintTitle');
  clearFieldError('complaintDesc');

  const charCountEl = document.getElementById('descCharCount');
  if (charCountEl) charCountEl.textContent = '0 characters';
}

function showFieldError(fieldId, errorMsg) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}Error`);
  if (input) input.classList.add('is-invalid');
  if (errorEl) {
    errorEl.textContent = errorMsg;
    errorEl.classList.add('visible');
  }
}

function clearFieldError(fieldId) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}Error`);
  if (input) input.classList.remove('is-invalid');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
  }
}

// ============================================================================
// Single Ticket Status Tracker (Student Portal)
// ============================================================================

function setupStatusTracker() {
  const trackBtn = document.getElementById('btnTrackComplaint');
  const trackInput = document.getElementById('trackComplaintInput');
  const showAllBtn = document.getElementById('btnShowAllStudentComplaints');

  if (trackBtn && trackInput) {
    trackBtn.addEventListener('click', () => {
      executeTrackLookup(trackInput.value);
    });

    trackInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeTrackLookup(trackInput.value);
      }
    });
  }

  if (showAllBtn) {
    showAllBtn.addEventListener('click', () => {
      const box = document.getElementById('trackResultBox');
      const notFound = document.getElementById('trackNotFound');
      if (box) box.style.display = 'none';
      if (notFound) notFound.style.display = 'none';
      if (trackInput) trackInput.value = '';
      
      const catSelect = document.getElementById('studentCategoryFilter');
      const statusSelect = document.getElementById('studentStatusFilter');
      if (catSelect) catSelect.value = 'ALL';
      if (statusSelect) statusSelect.value = 'ALL';
      renderStudentCards();
    });
  }
}

function executeTrackLookup(rawId) {
  const box = document.getElementById('trackResultBox');
  const notFound = document.getElementById('trackNotFound');
  const searchedIdDisplay = document.getElementById('searchedIdDisplay');

  if (!rawId || !rawId.trim()) {
    showToast('Please enter a Complaint ID to track', 'info');
    return;
  }

  const query = rawId.trim().toUpperCase();
  const found = complaints.find(c => c.id.toUpperCase() === query);

  if (!found) {
    if (box) box.style.display = 'none';
    if (notFound) {
      if (searchedIdDisplay) searchedIdDisplay.textContent = rawId.trim();
      notFound.style.display = 'flex';
    }
    return;
  }

  if (notFound) notFound.style.display = 'none';
  if (box) box.style.display = 'block';

  // Populate data
  document.getElementById('trackResultId').textContent = found.id;
  document.getElementById('trackResultDate').textContent = `Filed: ${found.date}`;
  document.getElementById('trackResultTitle').textContent = found.title;
  document.getElementById('trackResultDesc').textContent = found.description;
  document.getElementById('trackResultCategory').textContent = `Category: ${found.category}`;
  document.getElementById('trackResultStudent').textContent = `${found.studentName} (${found.department})`;

  // Status badge
  const badgeWrap = document.getElementById('trackResultStatusBadge');
  if (badgeWrap) {
    badgeWrap.innerHTML = `
      <span class="status-badge ${getStatusBadgeClass(found.status)}">
        <span class="status-dot"></span> ${found.status}
      </span>
    `;
  }

  // Update Stepper
  const stepPending = document.getElementById('stepPending');
  const line1 = document.getElementById('line1');
  const stepProgress = document.getElementById('stepProgress');
  const line2 = document.getElementById('line2');
  const stepResolved = document.getElementById('stepResolved');

  // Reset stepper classes
  [stepPending, stepProgress, stepResolved].forEach(s => {
    if (s) s.className = 'stepper-step';
  });
  if (line1) line1.className = 'step-line';
  if (line2) line2.className = 'step-line';

  if (found.status === 'Pending') {
    stepPending.classList.add('current');
  } else if (found.status === 'In Progress') {
    stepPending.classList.add('completed');
    line1.classList.add('completed');
    stepProgress.classList.add('current');
  } else if (found.status === 'Resolved') {
    stepPending.classList.add('completed');
    line1.classList.add('completed');
    stepProgress.classList.add('completed');
    line2.classList.add('completed');
    stepResolved.classList.add('completed');
  }

  // Button to open view details
  const viewFullBtn = document.getElementById('btnTrackViewFullModal');
  if (viewFullBtn) {
    viewFullBtn.onclick = () => openViewDetailsModal(found.id);
  }

  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ============================================================================
// Modal Handlers (View, Edit, Status, Delete)
// ============================================================================

/**
 * Open Complaint Details Modal
 */
function openViewDetailsModal(id) {
  const item = complaints.find(c => c.id === id);
  if (!item) return;

  document.getElementById('viewModalTitle').textContent = item.title;
  document.getElementById('viewModalId').textContent = item.id;
  document.getElementById('viewModalStudent').textContent = item.studentName;
  document.getElementById('viewModalDept').textContent = item.department;
  document.getElementById('viewModalDate').textContent = item.date;
  document.getElementById('viewModalCategoryText').textContent = item.category;
  document.getElementById('viewModalDesc').textContent = item.description;

  const catBadge = document.getElementById('viewModalCategory');
  if (catBadge) {
    catBadge.textContent = item.category;
    catBadge.className = `category-badge ${getCategoryBadgeClass(item.category)}`;
  }

  const statusWrap = document.getElementById('viewModalStatusBadge');
  if (statusWrap) {
    statusWrap.innerHTML = `
      <span class="status-badge ${getStatusBadgeClass(item.status)}">
        <span class="status-dot"></span> ${escapeHtml(item.status)}
      </span>
    `;
  }

  openModal('viewModal');
}

/**
 * Open Edit Complaint Modal (Title, Description, Category)
 */
function openEditModal(id) {
  const item = complaints.find(c => c.id === id);
  if (!item) return;

  document.getElementById('editComplaintId').value = item.id;
  document.getElementById('editModalIdLabel').textContent = item.id;
  document.getElementById('editCategory').value = item.category;
  document.getElementById('editTitle').value = item.title;
  document.getElementById('editDesc').value = item.description;

  clearFieldError('editTitle');
  clearFieldError('editDesc');

  openModal('editModal');
}

/**
 * Setup Edit Complaint Form Submit
 */
function setupEditModalForm() {
  const form = document.getElementById('editComplaintForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('editComplaintId').value;
    const cat = document.getElementById('editCategory').value;
    const title = document.getElementById('editTitle').value;
    const desc = document.getElementById('editDesc').value;

    let isValid = true;
    if (!title.trim() || title.trim().length < 5) {
      showFieldError('editTitle', 'Complaint title must be at least 5 characters long.');
      isValid = false;
    } else {
      clearFieldError('editTitle');
    }

    if (!desc.trim() || desc.trim().length < 15) {
      showFieldError('editDesc', 'Please provide a detailed description (at least 15 characters).');
      isValid = false;
    } else {
      clearFieldError('editDesc');
    }

    if (!isValid) return;

    const success = updateComplaint(id, {
      category: cat,
      title: title,
      description: desc
    });

    if (success) {
      closeModal('editModal');
      showToast(`Complaint ${id} updated successfully!`, 'success');

      // If active tracker result is open, refresh it
      const trackInput = document.getElementById('trackComplaintInput');
      if (trackInput && trackInput.value.trim().toUpperCase() === id.toUpperCase()) {
        executeTrackLookup(id);
      }
    }
  });
}

/**
 * Open Status Update Modal (Admin)
 */
function openStatusModal(id) {
  const item = complaints.find(c => c.id === id);
  if (!item) return;

  document.getElementById('statusComplaintId').value = item.id;
  document.getElementById('statusTargetId').textContent = item.id;
  document.getElementById('statusTargetTitle').textContent = item.title;

  // Set current radio checked
  const radios = document.getElementsByName('complaintStatusRadio');
  radios.forEach(r => {
    r.checked = (r.value === item.status);
  });

  openModal('statusModal');
}

/**
 * Setup Status Update Modal Form Submit
 */
function setupStatusModalForm() {
  const form = document.getElementById('statusUpdateForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('statusComplaintId').value;
    const selectedRadio = document.querySelector('input[name="complaintStatusRadio"]:checked');

    if (!selectedRadio) {
      showToast('Please select a status', 'info');
      return;
    }

    const newStatus = selectedRadio.value;
    const ok = updateComplaintStatus(id, newStatus);
    if (ok) {
      closeModal('statusModal');
      showToast(`Complaint ${id} status updated to '${newStatus}'`, 'success');

      // Refresh tracking view if displayed
      const trackResultBox = document.getElementById('trackResultBox');
      const trackId = document.getElementById('trackResultId');
      if (trackResultBox && trackResultBox.style.display !== 'none' && trackId && trackId.textContent === id) {
        executeTrackLookup(id);
      }
    }
  });
}

/**
 * Open Delete Confirmation Modal
 */
function confirmDeleteComplaint(id) {
  const item = complaints.find(c => c.id === id);
  if (!item) return;

  complaintToDeleteId = id;
  document.getElementById('deleteTargetId').textContent = id;
  openModal('deleteModal');
}

/**
 * Setup Delete Confirmation Execution
 */
function setupDeleteModal() {
  const confirmBtn = document.getElementById('btnConfirmDelete');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (complaintToDeleteId) {
        const id = complaintToDeleteId;
        const deleted = deleteComplaint(id);
        if (deleted) {
          closeModal('deleteModal');
          showToast(`Complaint ${id} has been permanently deleted.`, 'danger');

          // If tracking box shows this ID, hide it
          const trackId = document.getElementById('trackResultId');
          if (trackId && trackId.textContent === id) {
            document.getElementById('trackResultBox').style.display = 'none';
          }
        }
        complaintToDeleteId = null;
      }
    });
  }
}

// ============================================================================
// Modal Utilities
// ============================================================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function setupModalCloseListeners() {
  // Close buttons with data-modal attribute
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(btn.dataset.modal);
    });
  });

  // Click outside dialog to close
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop.id);
      }
    });
  });

  // ESC key closes any open modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(m => {
        closeModal(m.id);
      });
    }
  });
}

// ============================================================================
// Filter and Search Event Bindings
// ============================================================================

function setupFilterAndSearchListeners() {
  // Admin search input
  const adminSearch = document.getElementById('adminSearchInput');
  const clearAdminBtn = document.getElementById('btnClearAdminSearch');
  if (adminSearch) {
    adminSearch.addEventListener('input', () => {
      if (clearAdminBtn) {
        clearAdminBtn.style.display = adminSearch.value ? 'block' : 'none';
      }
      renderAdminTable();
    });
  }

  if (clearAdminBtn) {
    clearAdminBtn.addEventListener('click', () => {
      adminSearch.value = '';
      clearAdminBtn.style.display = 'none';
      renderAdminTable();
    });
  }

  // Admin Category & Status Filters
  const adminCat = document.getElementById('filterCategory');
  const adminStatus = document.getElementById('filterStatus');
  if (adminCat) adminCat.addEventListener('change', renderAdminTable);
  if (adminStatus) adminStatus.addEventListener('change', renderAdminTable);

  const resetFiltersBtn = document.getElementById('btnResetFilters');
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', resetFilters);
  }

  // Student Category & Status Filters
  const studentCat = document.getElementById('studentCategoryFilter');
  const studentStatus = document.getElementById('studentStatusFilter');
  if (studentCat) studentCat.addEventListener('change', renderStudentCards);
  if (studentStatus) studentStatus.addEventListener('change', renderStudentCards);
}

function resetFilters() {
  const adminSearch = document.getElementById('adminSearchInput');
  const clearAdminBtn = document.getElementById('btnClearAdminSearch');
  const adminCat = document.getElementById('filterCategory');
  const adminStatus = document.getElementById('filterStatus');

  if (adminSearch) adminSearch.value = '';
  if (clearAdminBtn) clearAdminBtn.style.display = 'none';
  if (adminCat) adminCat.value = 'ALL';
  if (adminStatus) adminStatus.value = 'ALL';

  renderAdminTable();
  showToast('Filters reset to default view', 'info');
}

// ============================================================================
// Toast Notification Engine
// ============================================================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  } else if (type === 'danger') {
    iconSvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
  } else {
    iconSvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#4f46e5" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
  }

  toast.innerHTML = `
    ${iconSvg}
    <span style="flex: 1;">${escapeHtml(message)}</span>
    <button style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:1rem;" onclick="this.parentElement.remove()">&times;</button>
  `;

  container.appendChild(toast);

  // Auto remove after 3.8s
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 250);
  }, 3800);
}

// ============================================================================
// Reset Demo Data
// ============================================================================

function setupResetDemoButton() {
  const btn = document.getElementById('btnResetDemo');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (confirm('Reset complaint data to original 6 sample records? Any custom additions will be replaced.')) {
      complaints = JSON.parse(JSON.stringify(INITIAL_SAMPLE_COMPLAINTS));
      saveComplaintsToStorage();
      renderComplaints();
      updateDashboardStats();
      showToast('Sample dataset restored successfully!', 'success');
    }
  });
}

// ============================================================================
// Mobile Navigation Drawer
// ============================================================================

function setupMobileNav() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const closeBtn = document.getElementById('mobileCloseBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (menuBtn && sidebar && overlay) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.add('open');
      overlay.classList.add('open');
    });
  }

  if (closeBtn && sidebar && overlay) {
    closeBtn.addEventListener('click', closeMobileSidebar);
  }

  if (overlay) {
    overlay.addEventListener('click', closeMobileSidebar);
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

// ============================================================================
// Helpers & CSS Badge Mappings
// ============================================================================

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Pending': return 'status-pending';
    case 'In Progress': return 'status-progress';
    case 'Resolved': return 'status-resolved';
    default: return 'status-pending';
  }
}

function getCategoryBadgeClass(category) {
  switch (category) {
    case 'Hostel': return 'cat-hostel';
    case 'Food': return 'cat-food';
    case 'Transport': return 'cat-transport';
    case 'Infrastructure': return 'cat-infrastructure';
    case 'Other': return 'cat-other';
    default: return 'cat-other';
  }
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================================
// Application Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize data from localStorage
  getComplaints();

  // 2. Setup navigation links
  document.querySelectorAll('[data-view]').forEach(elem => {
    elem.addEventListener('click', () => {
      const targetView = elem.dataset.view;
      if (targetView) navigateTo(targetView);
    });
  });

  // 3. Setup form submissions & modals
  setupComplaintForm();
  setupStatusTracker();
  setupEditModalForm();
  setupStatusModalForm();
  setupDeleteModal();
  setupModalCloseListeners();
  setupFilterAndSearchListeners();
  setupResetDemoButton();
  setupMobileNav();

  // 4. Initial rendering
  updateDashboardStats();
  renderComplaints();
});
