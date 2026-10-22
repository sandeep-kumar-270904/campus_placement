import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Filter,
  Users,
  ShieldCheck,
  ShieldAlert,
  Download,
  Upload,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Trash2,
  Send,
  Sparkles,
  Layers,
  ArrowUpDown,
  FileCheck
} from 'lucide-react';
import tpoService from '../../services/tpoService';
import TpoNaturalLanguageSearch from '../../components/tpo/TpoNaturalLanguageSearch';

const SAVED_PRESETS = [
  { id: 'all', label: 'All Students', filter: {} },
  { id: 'pending_verify', label: 'Pending Verification', filter: { verificationStatus: 'unverified' } },
  { id: 'dream_eligible', label: 'Dream Tier Eligible (CGPA ≥ 8.5)', filter: { minCgpa: 8.5, maxBacklogs: 0 } },
  { id: 'unplaced_final', label: 'Unplaced Candidates', filter: { placedStatus: 'unplaced' } },
  { id: 'zero_backlogs', label: 'Zero Backlogs', filter: { maxBacklogs: 0 } },
];

export default function TpoStudents() {
  const location = useLocation();

  // Directory state
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [activePreset, setActivePreset] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [placedFilter, setPlacedFilter] = useState('all');
  const [minCgpaFilter, setMinCgpaFilter] = useState('');
  const [maxBacklogsFilter, setMaxBacklogsFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Column visibility
  const [visibleCols, setVisibleCols] = useState({
    rollNo: true,
    name: true,
    branch: true,
    cgpa: true,
    backlogs: true,
    verification: true,
    placement: true,
    apps: true,
  });
  const [showColChooser, setShowColChooser] = useState(false);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Profile Drawer
  const [drawerStudentId, setDrawerStudentId] = useState(null);
  const [drawerData, setDrawerData] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Bulk Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [previewResult, setPreviewResult] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [committingImport, setCommittingImport] = useState(false);

  // Manual Add Student Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    rollNo: '',
    branch: 'Computer Science',
    cgpa: 8.0,
    backlogs: 0,
    graduationYear: 2026,
    phone: '',
  });

  // Rejection Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Marksheet does not match entered CGPA');

  // Action toast message
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Directory
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        q: search,
        branch: branchFilter,
        verificationStatus: verificationFilter,
        placedStatus: placedFilter,
        minCgpa: minCgpaFilter,
        maxBacklogs: maxBacklogsFilter,
        sortBy,
        sortOrder,
      };
      const res = await tpoService.getStudents(queryParams);
      setStudents(res.students || []);
      setPagination(res.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Failed to load students:', err);
      showToast('Error loading student directory', 'error');
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    search,
    branchFilter,
    verificationFilter,
    placedFilter,
    minCgpaFilter,
    maxBacklogsFilter,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Open modal if action=import in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'import') {
      setIsImportModalOpen(true);
    }
    if (params.get('q')) {
      setSearch(params.get('q'));
    }
  }, [location.search]);

  // Open Drawer and load full record
  const handleOpenDrawer = async (studentId) => {
    try {
      setDrawerStudentId(studentId);
      setDrawerLoading(true);
      const res = await tpoService.getStudents({ limit: 1 }); // warm up
      const details = await apiGetStudentDetails(studentId);
      setDrawerData(details);
    } catch (err) {
      console.error('Failed to load student details:', err);
      showToast('Could not load student profile', 'error');
    } finally {
      setDrawerLoading(false);
    }
  };

  const apiGetStudentDetails = async (id) => {
    const res = await fetch(`/api/tpo/students/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return await res.json();
  };

  // Preset Handler
  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    setVerificationFilter(preset.filter.verificationStatus || 'all');
    setPlacedFilter(preset.filter.placedStatus || 'all');
    setMinCgpaFilter(preset.filter.minCgpa !== undefined ? String(preset.filter.minCgpa) : '');
    setMaxBacklogsFilter(preset.filter.maxBacklogs !== undefined ? String(preset.filter.maxBacklogs) : '');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(students.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Verify
  const handleBulkVerifyAction = async (action, reason = '') => {
    if (selectedIds.length === 0) return;
    try {
      const res = await tpoService.bulkVerifyStudents({
        studentIds: selectedIds,
        action,
        rejectionReason: reason,
      });
      showToast(res.message || `Processed ${selectedIds.length} students`);
      setSelectedIds([]);
      setRejectModalOpen(false);
      fetchStudents();
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.error?.message || 'Verification action failed', 'error');
    }
  };

  // Add Note Handler
  const handleAddNote = async () => {
    if (!newNote.trim() || !drawerStudentId) return;
    try {
      await tpoService.updateStudentNotes(drawerStudentId, newNote.trim());
      showToast('Private note added');
      setNewNote('');
      // Reload drawer
      const updated = await apiGetStudentDetails(drawerStudentId);
      setDrawerData(updated);
    } catch (err) {
      showToast('Failed to add note', 'error');
    }
  };

  // Bulk Import: Step 1 Upload & Preview
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportFile(file);
    try {
      setPreviewLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await tpoService.previewBulkImport(formData);
      setPreviewResult(res);
    } catch (err) {
      showToast(err?.response?.data?.error?.message || 'Failed to parse file', 'error');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Bulk Import: Step 2 Commit
  const handleCommitImport = async () => {
    if (!previewResult || !previewResult.preview) return;
    try {
      setCommittingImport(true);
      const validRows = previewResult.preview.filter((r) => r.isValid);
      const res = await tpoService.commitBulkImport({ rows: validRows });
      showToast(res.message || `Imported ${res.createdCount} students`);
      setIsImportModalOpen(false);
      setImportFile(null);
      setPreviewResult(null);
      fetchStudents();
    } catch (err) {
      showToast(err?.response?.data?.error?.message || 'Import commit failed', 'error');
    } finally {
      setCommittingImport(false);
    }
  };

  // Manual Add Student
  const handleManualAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await tpoService.addStudentManual(manualForm);
      showToast('Student profile created successfully');
      setIsManualModalOpen(false);
      setManualForm({
        firstName: '',
        lastName: '',
        email: '',
        rollNo: '',
        branch: 'Computer Science',
        cgpa: 8.0,
        backlogs: 0,
        graduationYear: 2026,
        phone: '',
      });
      fetchStudents();
    } catch (err) {
      showToast(err?.response?.data?.error?.message || 'Failed to create student', 'error');
    }
  };

  // Export Selected as CSV
  const handleExportSelectedCSV = () => {
    const exportData = students.filter((s) => selectedIds.includes(s.id));
    if (exportData.length === 0) return;

    const headers = ['Roll No', 'Name', 'Email', 'Branch', 'CGPA', 'Backlogs', 'Graduation Year', 'Verified', 'Placed', 'Company'];
    const rows = exportData.map((s) => [
      `"${s.rollNo}"`,
      `"${s.fullName}"`,
      `"${s.email}"`,
      `"${s.branch}"`,
      s.cgpa,
      s.backlogs,
      s.graduationYear,
      s.isVerifiedByTPO ? 'Yes' : 'No',
      s.isPlaced ? 'Yes' : 'No',
      `"${s.placedCompany || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-4 ${
            toast.type === 'error'
              ? 'bg-red-950 border-red-700 text-red-200'
              : 'bg-emerald-950 border-emerald-700 text-emerald-200'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Student Directory</h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {pagination.total} registered
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Multi-filter roster, cryptographic academic verification, private TPO notes, and bulk operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Student
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
            Bulk Import (CSV/Excel)
          </button>
        </div>
      </div>

      {/* Natural Language AI Assistant Search */}
      <TpoNaturalLanguageSearch />

      {/* Saved Presets Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap mr-1">
          Views:
        </span>
        {SAVED_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => applyPreset(p)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activePreset === p.id
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Search, Multi-Filter Toolbar, and Column Chooser */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, roll number, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={branchFilter}
              onChange={(e) => {
                setBranchFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="all">All Branches</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">ECE</option>
              <option value="Mechanical Engineering">Mechanical</option>
              <option value="Electrical & Electronics">EEE</option>
              <option value="Civil Engineering">Civil</option>
            </select>
          </div>

          {/* Verification Status Filter */}
          <div>
            <select
              value={verificationFilter}
              onChange={(e) => {
                setVerificationFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="all">Verification (All)</option>
              <option value="verified">Verified Records</option>
              <option value="unverified">Pending / Unverified</option>
            </select>
          </div>

          {/* Placement Status Filter */}
          <div>
            <select
              value={placedFilter}
              onChange={(e) => {
                setPlacedFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="all">Placement (All)</option>
              <option value="placed">Placed Candidates</option>
              <option value="unplaced">Unplaced</option>
            </select>
          </div>

          {/* Min CGPA */}
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              placeholder="Min CGPA"
              value={minCgpaFilter}
              onChange={(e) => {
                setMinCgpaFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
            {/* Column Chooser Dropdown Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowColChooser(!showColChooser)}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white"
                title="Choose visible table columns"
              >
                <Layers className="w-4 h-4" />
              </button>

              {showColChooser && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-30 text-xs space-y-2">
                  <div className="font-bold text-white pb-1 border-b border-slate-800">Visible Columns</div>
                  {Object.keys(visibleCols).map((col) => (
                    <label key={col} className="flex items-center gap-2 text-slate-300 cursor-pointer capitalize">
                      <input
                        type="checkbox"
                        checked={visibleCols[col]}
                        onChange={(e) => setVisibleCols((prev) => ({ ...prev, [col]: e.target.checked }))}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                      />
                      {col}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar (when rows selected) */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-600/40 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
              {selectedIds.length}
            </span>
            <span>Student(s) selected</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBulkVerifyAction('approve')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              Approve & Seal
            </button>
            <button
              onClick={() => setRejectModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-800 text-red-300 font-semibold text-xs transition"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Reject with Reason
            </button>
            <button
              onClick={handleExportSelectedCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="p-1.5 text-slate-400 hover:text-white"
              title="Deselect all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={students.length > 0 && selectedIds.length === students.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                </th>
                {visibleCols.rollNo && (
                  <th
                    className="py-4 px-3 cursor-pointer hover:text-white"
                    onClick={() => {
                      setSortBy('rollNo');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Roll Number
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    </div>
                  </th>
                )}
                {visibleCols.name && <th className="py-4 px-3">Student Name</th>}
                {visibleCols.branch && <th className="py-4 px-3">Branch</th>}
                {visibleCols.cgpa && (
                  <th
                    className="py-4 px-3 cursor-pointer hover:text-white"
                    onClick={() => {
                      setSortBy('cgpa');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    <div className="flex items-center gap-1">
                      CGPA
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    </div>
                  </th>
                )}
                {visibleCols.backlogs && <th className="py-4 px-3">Backlogs</th>}
                {visibleCols.verification && <th className="py-4 px-3">Academic Seal</th>}
                {visibleCols.placement && <th className="py-4 px-3">Placement</th>}
                {visibleCols.apps && <th className="py-4 px-3 text-center">Drives</th>}
                <th className="py-4 px-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                      Loading student records...
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No student records match the active search or filters.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const isSelected = selectedIds.includes(student.id);
                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-850/60 transition ${
                        isSelected ? 'bg-emerald-950/20' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(student.id)}
                          className="rounded border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {visibleCols.rollNo && (
                        <td
                          onClick={() => handleOpenDrawer(student.id)}
                          className="py-3 px-3 font-mono font-bold text-white cursor-pointer hover:text-emerald-400"
                        >
                          {student.rollNo}
                        </td>
                      )}

                      {visibleCols.name && (
                        <td
                          onClick={() => handleOpenDrawer(student.id)}
                          className="py-3 px-3 cursor-pointer"
                        >
                          <p className="font-bold text-white hover:text-emerald-400 transition">{student.fullName}</p>
                          <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{student.email}</p>
                        </td>
                      )}

                      {visibleCols.branch && (
                        <td className="py-3 px-3 text-slate-300">
                          {student.branch}
                        </td>
                      )}

                      {visibleCols.cgpa && (
                        <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                          {student.cgpa.toFixed(2)}
                        </td>
                      )}

                      {visibleCols.backlogs && (
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              student.backlogs === 0
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {student.backlogs} {student.backlogs === 1 ? 'backlog' : 'backlogs'}
                          </span>
                        </td>
                      )}

                      {visibleCols.verification && (
                        <td className="py-3 px-3">
                          {student.isVerifiedByTPO ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                              <ShieldCheck className="w-3 h-3" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                              <ShieldAlert className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                        </td>
                      )}

                      {visibleCols.placement && (
                        <td className="py-3 px-3">
                          {student.isPlaced ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              {student.placedCompany || 'Placed'}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500">Unplaced</span>
                          )}
                        </td>
                      )}

                      {visibleCols.apps && (
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] font-semibold">
                            {student.applicationsCount}
                          </span>
                        </td>
                      )}

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenDrawer(student.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-[11px] transition"
                        >
                          View Drawer &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <span className="font-bold text-white">{students.length}</span> of{' '}
            <span className="font-bold text-white">{pagination.total}</span> candidates
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
              disabled={pagination.page <= 1 || loading}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-300">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Row Slide-Over Drawer */}
      {drawerStudentId && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end"
          onClick={() => setDrawerStudentId(null)}
        >
          <div
            className="w-full max-w-xl bg-slate-900 h-full border-l border-slate-800 p-6 overflow-y-auto space-y-6 shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Student Profile</span>
                <h3 className="text-lg font-black text-white">{drawerData?.profile?.user?.firstName} {drawerData?.profile?.user?.lastName}</h3>
                <p className="text-xs font-mono text-slate-400">{drawerData?.profile?.rollNo} • {drawerData?.profile?.branch}</p>
              </div>
              <button
                onClick={() => setDrawerStudentId(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {drawerLoading ? (
              <div className="py-12 text-center text-slate-500">Loading student details...</div>
            ) : (
              <div className="space-y-6 text-xs">
                {/* Academic Metrics & Ed25519 Seal */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Academic Standing</span>
                    {drawerData?.profile?.isVerifiedByTPO ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Ed25519 Sealed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                        Unverified
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Current CGPA</div>
                      <div className="text-base font-black text-emerald-400">{drawerData?.profile?.cgpa}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Active Backlogs</div>
                      <div className="text-base font-black text-white">{drawerData?.profile?.backlogs}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Batch Year</div>
                      <div className="text-base font-black text-white">{drawerData?.profile?.graduationYear}</div>
                    </div>
                  </div>

                  {drawerData?.profile?.verificationRecord?.verificationCode && (
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Code: <span className="text-emerald-400">{drawerData.profile.verificationRecord.verificationCode}</span></span>
                      <a
                        href={`/verify/${drawerData.profile.verificationRecord.verificationCode}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        Public Cert <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Uploaded Documents */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-bold text-white text-xs block">Documents & Marksheets</span>
                  {drawerData?.documents?.length > 0 ? (
                    <div className="space-y-2">
                      {drawerData.documents.map((doc) => (
                        <div key={doc.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-400" />
                            <div>
                              <p className="font-bold text-white">{doc.originalName}</p>
                              <p className="text-[10px] text-slate-500 uppercase">{doc.purpose}</p>
                            </div>
                          </div>
                          <a
                            href={doc.signedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1"
                          >
                            View (5m) <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[11px]">No documents uploaded by student yet.</p>
                  )}
                </div>

                {/* Applications History */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-bold text-white text-xs block">Drive Application History</span>
                  {drawerData?.applications?.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {drawerData.applications.map((app) => (
                        <div key={app._id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white">{app.opportunityId?.companyName || 'Drive'}</p>
                            <p className="text-[10px] text-slate-400">{app.opportunityId?.title} • {app.currentRound}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px]">
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[11px]">No applications filed yet.</p>
                  )}
                </div>

                {/* TPO Private Notes */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <span className="font-bold text-white text-xs block">TPO Private Notes (Confidential)</span>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {drawerData?.profile?.tpoNotes?.length > 0 ? (
                      drawerData.profile.tpoNotes.map((n, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px]">
                          <p className="text-slate-200">{n.note}</p>
                          <span className="text-[9px] text-slate-500 mt-1 block">
                            By {n.createdBy?.firstName || 'TPO'} • {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-[11px]">No confidential notes recorded.</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add confidential observation..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
                    />
                    <button
                      onClick={handleAddNote}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Import CSV/Excel Modal */}
      {isImportModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsImportModalOpen(false)}
        >
          <div
            className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Bulk Import Student Profiles (CSV/Excel)</h3>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Upload File */}
            <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-6 text-center transition cursor-pointer">
              <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-white mb-1">Upload .xlsx, .xls, or .csv sheet</p>
              <p className="text-[11px] text-slate-400 mb-3">Columns will be automatically mapped: Roll No, Name, Email, Branch, CGPA, Backlogs</p>
              <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
                className="text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-400 cursor-pointer"
              />
            </div>

            {/* Dry-Run Validation Results */}
            {previewLoading && (
              <div className="py-6 text-center text-xs text-slate-400">
                Running dry-run row validation and duplicate roll number checks...
              </div>
            )}

            {previewResult && !previewLoading && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-300">Total: {previewResult.totalRows}</span>
                    <span className="text-emerald-400">✓ Valid: {previewResult.validCount}</span>
                    {previewResult.invalidCount > 0 && (
                      <span className="text-red-400">✕ Invalid: {previewResult.invalidCount}</span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">Auto-detected {Object.keys(previewResult.suggestedMapping || {}).length} columns</span>
                </div>

                {/* Preview Table */}
                <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-800 text-[11px]">
                  <table className="w-full text-left">
                    <thead className="bg-slate-950 text-slate-400 font-bold sticky top-0">
                      <tr>
                        <th className="p-2">Row</th>
                        <th className="p-2">Roll No</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">CGPA</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {previewResult.preview.map((row) => (
                        <tr key={row.rowNumber} className={row.isValid ? '' : 'bg-red-950/20'}>
                          <td className="p-2 font-mono text-slate-500">{row.rowNumber}</td>
                          <td className="p-2 font-mono font-bold text-white">{row.rollNo || '—'}</td>
                          <td className="p-2 text-slate-300">{row.name}</td>
                          <td className="p-2 text-slate-400">{row.email}</td>
                          <td className="p-2 text-emerald-400">{row.cgpa}</td>
                          <td className="p-2">
                            {row.isValid ? (
                              <span className="text-emerald-400 font-bold">Valid</span>
                            ) : (
                              <span className="text-red-400" title={row.errors.join('; ')}>
                                {row.errors[0]}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      setImportFile(null);
                      setPreviewResult(null);
                    }}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleCommitImport}
                    disabled={committingImport || previewResult.validCount === 0}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50"
                  >
                    {committingImport ? 'Importing Profiles...' : `Confirm Import of ${previewResult.validCount} Students`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Add Student Modal */}
      {isManualModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsManualModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Single Student</h3>
              <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={manualForm.firstName}
                    onChange={(e) => setManualForm({ ...manualForm, firstName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={manualForm.lastName}
                    onChange={(e) => setManualForm({ ...manualForm, lastName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Roll Number</label>
                  <input
                    type="text"
                    required
                    placeholder="2026-CS-001"
                    value={manualForm.rollNo}
                    onChange={(e) => setManualForm({ ...manualForm, rollNo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="student@college.edu"
                    value={manualForm.email}
                    onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Branch</label>
                  <select
                    value={manualForm.branch}
                    onChange={(e) => setManualForm({ ...manualForm, branch: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Computer Science">CSE</option>
                    <option value="Information Technology">IT</option>
                    <option value="Electronics & Communication">ECE</option>
                    <option value="Mechanical Engineering">Mech</option>
                    <option value="Electrical & Electronics">EEE</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={manualForm.cgpa}
                    onChange={(e) => setManualForm({ ...manualForm, cgpa: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    value={manualForm.backlogs}
                    onChange={(e) => setManualForm({ ...manualForm, backlogs: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Create Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Reason Dialog */}
      {rejectModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setRejectModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-red-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Reject Verification for {selectedIds.length} Student(s)</h3>
            </div>
            <p className="text-xs text-slate-400">
              Please specify the required correction reason. This will be transmitted to the students and recorded in the audit trail.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
              placeholder="e.g. Marksheet does not match entered CGPA..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-slate-400 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBulkVerifyAction('reject', rejectReason)}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
