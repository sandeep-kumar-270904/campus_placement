import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  Users,
  AlertTriangle,
  Plus,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Edit,
  Search,
} from 'lucide-react';
import tpoService from '../../services/tpoService';

export default function TpoSchedule() {
  const [slots, setSlots] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedDriveId, setSelectedDriveId] = useState('');
  const [selectedPanel, setSelectedPanel] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState('agenda'); // 'agenda' | 'day' | 'week'
  const [activeDate, setActiveDate] = useState(new Date().toISOString().split('T')[0]);

  // Modals & Drawers
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Generator form state
  const [genData, setGenData] = useState({
    opportunityId: '',
    roundName: 'Technical Interview',
    roundNumber: 1,
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    slotDurationMinutes: 30,
    breakDurationMinutes: 10,
    panelsText: 'Panel 1, Panel 2',
    mode: 'Online',
    roomOrLink: '',
    autoAssignCandidates: false,
  });
  const [generating, setGenerating] = useState(false);
  const [genSuccessMsg, setGenSuccessMsg] = useState('');
  const [genErrorMsg, setGenErrorMsg] = useState('');

  // Edit slot form state
  const [editData, setEditData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    panelName: '',
    mode: 'Online',
    roomOrLink: '',
    status: 'Scheduled',
    cancellationReason: '',
    feedbackSummary: '',
  });
  const [updating, setUpdating] = useState(false);

  // Load drives & slots
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [slotsRes, drivesRes] = await Promise.all([
        tpoService.getScheduleSlots({
          opportunityId: selectedDriveId || undefined,
          panelName: selectedPanel || undefined,
          status: selectedStatus || undefined,
        }),
        tpoService.getDrives({ limit: 100 }),
      ]);

      setSlots(slotsRes.slots || []);
      setDrives(drivesRes.drives || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load recruitment schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDriveId, selectedPanel, selectedStatus]);

  // Unique panels in dataset
  const uniquePanels = useMemo(() => {
    const set = new Set();
    slots.forEach((s) => {
      if (s.panelName) set.add(s.panelName);
    });
    return Array.from(set).sort();
  }, [slots]);

  // Group slots by date for Agenda view
  const slotsByDate = useMemo(() => {
    const map = {};
    slots.forEach((slot) => {
      const d = slot.date ? new Date(slot.date).toISOString().split('T')[0] : 'No Date';
      if (!map[d]) map[d] = [];
      map[d].push(slot);
    });
    // Sort keys chronologically
    const sortedKeys = Object.keys(map).sort();
    const sortedMap = {};
    sortedKeys.forEach((k) => {
      sortedMap[k] = map[k].sort((a, b) => (a.startTime > b.startTime ? 1 : -1));
    });
    return sortedMap;
  }, [slots]);

  // Clash detector for current slots
  const clashesMap = useMemo(() => {
    const clashes = new Set();
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const a = slots[i];
        const b = slots[j];
        if (a.status === 'Cancelled' || b.status === 'Cancelled') continue;
        const aStart = new Date(a.startDateTime);
        const aEnd = new Date(a.endDateTime);
        const bStart = new Date(b.startDateTime);
        const bEnd = new Date(b.endDateTime);

        if (aStart < bEnd && aEnd > bStart) {
          // Check panel clash
          if (a.panelName && b.panelName && a.panelName.trim().toLowerCase() === b.panelName.trim().toLowerCase()) {
            clashes.add(a._id);
            clashes.add(b._id);
          }
          // Check student clash
          if (a.studentId?._id && b.studentId?._id && a.studentId._id.toString() === b.studentId._id.toString()) {
            clashes.add(a._id);
            clashes.add(b._id);
          }
        }
      }
    }
    return clashes;
  }, [slots]);

  const handleOpenEdit = (slot) => {
    setSelectedSlot(slot);
    const dStr = slot.date ? new Date(slot.date).toISOString().split('T')[0] : '';
    setEditData({
      date: dStr,
      startTime: slot.startTime || '',
      endTime: slot.endTime || '',
      panelName: slot.panelName || 'Panel 1',
      mode: slot.mode || 'Online',
      roomOrLink: slot.roomOrLink || '',
      status: slot.status || 'Scheduled',
      cancellationReason: slot.cancellationReason || '',
      feedbackSummary: slot.feedbackSummary || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;
    try {
      setUpdating(true);
      const startDateTime = new Date(`${editData.date}T${editData.startTime}:00`);
      const endDateTime = new Date(`${editData.date}T${editData.endTime}:00`);

      await tpoService.updateScheduleSlot(selectedSlot._id, {
        ...editData,
        startDateTime,
        endDateTime,
      });

      setShowEditModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update interview slot.');
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    setGenErrorMsg('');
    setGenSuccessMsg('');

    if (!genData.opportunityId) {
      setGenErrorMsg('Please select a placement drive.');
      return;
    }

    try {
      setGenerating(true);
      const panelNames = genData.panelsText
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      // Optionally fetch shortlisted students if autoAssign is true
      let studentIds = [];
      if (genData.autoAssignCandidates) {
        try {
          const ws = await tpoService.getDriveWorkspace(genData.opportunityId);
          // find candidates in current round or shortlisted
          if (ws?.applicants) {
            studentIds = ws.applicants
              .filter((a) => a.status !== 'Rejected' && a.status !== 'Withdrawn')
              .map((a) => a.studentId?._id || a.studentId)
              .filter(Boolean);
          }
        } catch (ignore) {
          // fallback without auto-assign
        }
      }

      const res = await tpoService.bulkGenerateSlots({
        opportunityId: genData.opportunityId,
        roundName: genData.roundName,
        roundNumber: genData.roundNumber,
        date: genData.date,
        startTime: genData.startTime,
        endTime: genData.endTime,
        slotDurationMinutes: parseInt(genData.slotDurationMinutes, 10),
        breakDurationMinutes: parseInt(genData.breakDurationMinutes, 10),
        panelNames: panelNames.length > 0 ? panelNames : ['Panel 1'],
        mode: genData.mode,
        roomOrLink: genData.roomOrLink,
        studentIds,
      });

      setGenSuccessMsg(
        `Generated ${res.count} slots successfully! ${res.clashesFound > 0 ? `(${res.clashesFound} clash warnings detected)` : ''}`
      );
      setTimeout(() => {
        setShowGeneratorModal(false);
        setGenSuccessMsg('');
        fetchData();
      }, 1200);
    } catch (err) {
      setGenErrorMsg(err.response?.data?.error?.message || 'Failed to generate interview slots.');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportIcs = () => {
    const url = tpoService.getScheduleIcsUrl(selectedDriveId);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Scheduler
            </span>
            <span className="text-xs text-slate-400">RFC 5545 iCal & Clash Detector</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Recruitment Calendar & Interview Slots
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate interview schedules in bulk, manage panel assignments, prevent double-bookings, and export synced calendar feeds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportIcs}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export ICS
          </button>
          <button
            onClick={() => setShowGeneratorModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Bulk Auto-Generate
          </button>
        </div>
      </div>

      {/* Clash Warning Alert (if any detected) */}
      {clashesMap.size > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between gap-3 text-amber-300 text-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              <strong>Schedule Clash Detected:</strong> {clashesMap.size} interview slots have overlapping time windows on the same panel or student. Review highlighted slots below.
            </span>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            Filters:
          </div>

          {/* Drive Select */}
          <select
            value={selectedDriveId}
            onChange={(e) => setSelectedDriveId(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Placement Drives</option>
            {drives.map((d) => (
              <option key={d._id} value={d._id}>
                {d.companyName} - {d.title}
              </option>
            ))}
          </select>

          {/* Panel Select */}
          <select
            value={selectedPanel}
            onChange={(e) => setSelectedPanel(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Panels</option>
            {uniquePanels.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Status Select */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('agenda')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              viewMode === 'agenda' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Agenda View
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              viewMode === 'grid' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cards Grid
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading interview slots & calendar feeds...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center text-rose-300">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <p className="font-semibold text-sm mb-3">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold"
          >
            Try Again
          </button>
        </div>
      ) : slots.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
          <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Interview Slots Scheduled</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            There are no interview slots matching the selected filters. Use the Bulk Auto-Generate tool to schedule rounds in minutes.
          </p>
          <button
            onClick={() => setShowGeneratorModal(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Generate Slots Now
          </button>
        </div>
      ) : viewMode === 'agenda' ? (
        /* Agenda By Date View */
        <div className="space-y-6">
          {Object.entries(slotsByDate).map(([dateStr, daySlots]) => {
            const dateObj = new Date(dateStr);
            const dateHeading = dateObj.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <div key={dateStr} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="bg-slate-800/60 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-sm text-white">{dateHeading}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-700 text-slate-300">
                      {daySlots.length} slots
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-800/60">
                  {daySlots.map((slot) => {
                    const hasClash = clashesMap.has(slot._id);
                    return (
                      <div
                        key={slot._id}
                        className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-slate-800/30 ${
                          hasClash ? 'bg-amber-500/5 border-l-4 border-amber-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Time block */}
                          <div className="w-28 shrink-0">
                            <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                              <Clock className="w-3.5 h-3.5 text-emerald-400" />
                              {slot.startTime} - {slot.endTime}
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {slot.roundName}
                            </span>
                          </div>

                          {/* Candidate & Details */}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">
                                {slot.studentName}
                              </span>
                              {slot.rollNo && (
                                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                                  {slot.rollNo}
                                </span>
                              )}
                              {slot.branch && (
                                <span className="text-xs text-slate-400 font-medium">
                                  ({slot.branch})
                                </span>
                              )}
                              {hasClash && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Clash
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
                              <span className="text-emerald-400 font-medium">
                                {slot.companyName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-slate-500" />
                                {slot.panelName}
                              </span>
                              <span className="flex items-center gap-1">
                                {slot.mode === 'Online' ? (
                                  <Video className="w-3 h-3 text-cyan-400" />
                                ) : (
                                  <MapPin className="w-3 h-3 text-indigo-400" />
                                )}
                                {slot.mode}
                              </span>
                              {slot.roomOrLink && (
                                <a
                                  href={slot.roomOrLink.startsWith('http') ? slot.roomOrLink : '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-cyan-400 hover:underline flex items-center gap-1 max-w-xs truncate"
                                >
                                  {slot.roomOrLink}
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              slot.status === 'Completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : slot.status === 'Cancelled'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : slot.status === 'In Progress'
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            }`}
                          >
                            {slot.status}
                          </span>

                          <button
                            onClick={() => handleOpenEdit(slot)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Edit / Reschedule Slot"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slots.map((slot) => {
            const hasClash = clashesMap.has(slot._id);
            return (
              <div
                key={slot._id}
                className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                  hasClash
                    ? 'border-amber-500/50 bg-amber-500/5'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        {slot.companyName}
                      </span>
                      <h4 className="text-base font-bold text-white mt-0.5">
                        {slot.roundName}
                      </h4>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        slot.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : slot.status === 'Cancelled'
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-indigo-500/10 text-indigo-400'
                      }`}
                    >
                      {slot.status}
                    </span>
                  </div>

                  {/* Candidate */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 my-3">
                    <p className="text-xs text-slate-400 mb-0.5">Candidate</p>
                    <p className="text-sm font-bold text-white">{slot.studentName}</p>
                    {slot.rollNo && (
                      <p className="text-xs text-slate-400 font-mono">
                        {slot.rollNo} • {slot.branch}
                      </p>
                    )}
                  </div>

                  {/* Date, Time, Panel */}
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>{slot.date ? new Date(slot.date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-semibold text-white">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{slot.panelName}</span>
                    </div>
                    {slot.roomOrLink && (
                      <div className="flex items-center gap-2">
                        {slot.mode === 'Online' ? (
                          <Video className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                        <span className="truncate max-w-[200px] text-cyan-400">
                          {slot.roomOrLink}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  {hasClash ? (
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Clash Detected
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">No conflicts</span>
                  )}
                  <button
                    onClick={() => handleOpenEdit(slot)}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Edit Slot →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bulk Slot Generator Modal */}
      {showGeneratorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Bulk Auto-Generate Interview Slots</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Distribute rounds across panels with automated time-window slicing
                </p>
              </div>
              <button
                onClick={() => setShowGeneratorModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {genErrorMsg && (
              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
                {genErrorMsg}
              </div>
            )}
            {genSuccessMsg && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs">
                {genSuccessMsg}
              </div>
            )}

            <form onSubmit={handleBulkGenerate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Placement Drive *
                </label>
                <select
                  required
                  value={genData.opportunityId}
                  onChange={(e) => setGenData({ ...genData, opportunityId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select a Drive...</option>
                  {drives.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.companyName} - {d.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Round Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={genData.roundName}
                    onChange={(e) => setGenData({ ...genData, roundName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={genData.date}
                    onChange={(e) => setGenData({ ...genData, date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={genData.startTime}
                    onChange={(e) => setGenData({ ...genData, startTime: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={genData.endTime}
                    onChange={(e) => setGenData({ ...genData, endTime: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Slot Duration (mins)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    value={genData.slotDurationMinutes}
                    onChange={(e) =>
                      setGenData({ ...genData, slotDurationMinutes: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Break Duration (mins)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={genData.breakDurationMinutes}
                    onChange={(e) =>
                      setGenData({ ...genData, breakDurationMinutes: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Panel Names (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Panel 1, Panel 2, Panel 3"
                  value={genData.panelsText}
                  onChange={(e) => setGenData({ ...genData, panelsText: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mode
                  </label>
                  <select
                    value={genData.mode}
                    onChange={(e) => setGenData({ ...genData, mode: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Meeting Link or Room No.
                  </label>
                  <input
                    type="text"
                    placeholder="https://meet.google.com/... or Lab 301"
                    value={genData.roomOrLink}
                    onChange={(e) => setGenData({ ...genData, roomOrLink: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="autoAssign"
                  checked={genData.autoAssignCandidates}
                  onChange={(e) =>
                    setGenData({ ...genData, autoAssignCandidates: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-emerald-500 border-slate-700 focus:ring-emerald-500 focus:ring-offset-slate-900"
                />
                <label htmlFor="autoAssign" className="text-xs text-slate-300">
                  Automatically assign qualified drive applicants across slots
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGeneratorModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
                >
                  {generating ? 'Generating Slots...' : 'Generate Schedule Slots'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Reschedule Slot Modal */}
      {showEditModal && selectedSlot && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Reschedule / Edit Slot</h3>
                <p className="text-xs text-slate-400">
                  {selectedSlot.studentName} • {selectedSlot.companyName}
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editData.date}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={editData.startTime}
                    onChange={(e) => setEditData({ ...editData, startTime: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={editData.endTime}
                    onChange={(e) => setEditData({ ...editData, endTime: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Panel Name
                  </label>
                  <input
                    type="text"
                    value={editData.panelName}
                    onChange={(e) => setEditData({ ...editData, panelName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Status
                  </label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Meeting Link or Room Location
                </label>
                <input
                  type="text"
                  value={editData.roomOrLink}
                  onChange={(e) => setEditData({ ...editData, roomOrLink: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                />
              </div>

              {editData.status === 'Cancelled' && (
                <div>
                  <label className="block text-[11px] font-semibold text-rose-400 mb-1">
                    Cancellation Reason
                  </label>
                  <input
                    type="text"
                    placeholder="Candidate no-show, company rescheduled, etc."
                    value={editData.cancellationReason}
                    onChange={(e) =>
                      setEditData({ ...editData, cancellationReason: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-rose-500/40 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  {updating ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
