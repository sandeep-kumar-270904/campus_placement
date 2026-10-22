import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Filter,
  AlertCircle,
  Mail,
  Smartphone,
  Eye,
  Plus,
  Radio,
  Building,
} from 'lucide-react';
import tpoService from '../../services/tpoService';

const AVAILABLE_BRANCHES = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Data Science & AI',
];

const GRAD_YEARS = [2025, 2026, 2027, 2028];

export default function TpoAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

  // Modals
  const [showComposerModal, setShowComposerModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // Composer Form
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('General');
  const [channels, setChannels] = useState({
    inApp: true,
    email: true,
    smsOrWhatsapp: false,
  });

  // Audience Segments
  const [targetAll, setTargetAll] = useState(false);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedYears, setSelectedYears] = useState([2026]);
  const [placedStatus, setPlacedStatus] = useState('all');
  const [selectedDriveId, setSelectedDriveId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  // Live Recipient Calculation
  const [recipientCount, setRecipientCount] = useState(0);
  const [sampleRecipients, setSampleRecipients] = useState([]);
  const [calculatingRecipients, setCalculatingRecipients] = useState(false);
  const [sending, setSending] = useState(false);

  // Fetch announcements list
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const [annRes, drivesRes] = await Promise.all([
        tpoService.getAnnouncements({
          page,
          limit: 15,
          category: selectedCategoryFilter || undefined,
        }),
        tpoService.getDrives({ limit: 100 }),
      ]);

      setAnnouncements(annRes.announcements || []);
      setTotal(annRes.total || 0);
      setTotalPages(annRes.totalPages || 1);
      setDrives(drivesRes.drives || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [page, selectedCategoryFilter]);

  // Recipient preview computation
  const previewAudience = async () => {
    try {
      setCalculatingRecipients(true);
      const res = await tpoService.previewAnnouncementRecipients({
        targetAll,
        branches: selectedBranches,
        graduationYears: selectedYears,
        placedStatus,
        driveId: selectedDriveId || undefined,
      });

      setRecipientCount(res.matchingCount || 0);
      setSampleRecipients(res.sampleRecipients || []);
    } catch (err) {
      console.error('Failed to preview recipients', err);
    } finally {
      setCalculatingRecipients(false);
    }
  };

  // Trigger preview when segmentation changes
  useEffect(() => {
    if (showComposerModal) {
      previewAudience();
    }
  }, [targetAll, selectedBranches, selectedYears, placedStatus, selectedDriveId, showComposerModal]);

  const handleBranchToggle = (branch) => {
    setSelectedBranches((prev) =>
      prev.includes(branch) ? prev.filter((b) => b !== branch) : [...prev, branch]
    );
  };

  const handleYearToggle = (year) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      alert('Please provide an announcement title and message body.');
      return;
    }

    try {
      setSending(true);
      await tpoService.sendAnnouncement({
        title,
        body,
        category,
        channels,
        segments: {
          targetAll,
          branches: selectedBranches,
          graduationYears: selectedYears,
          placedStatus,
          driveId: selectedDriveId || undefined,
        },
        scheduledAt: scheduledAt || undefined,
      });

      setShowComposerModal(false);
      // Reset form
      setTitle('');
      setBody('');
      setCategory('General');
      setScheduledAt('');
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to dispatch broadcast.');
    } finally {
      setSending(false);
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'Urgent':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
      case 'Placement Drive':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30';
      case 'Interview Alert':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case 'Policy Update':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Broadcast Engine
            </span>
            <span className="text-xs text-slate-400">Multi-Channel & Segment Targeted</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Campus Announcements & Student Broadcasts
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Target broadcasts with pinpoint accuracy by department, batch, drive, and placement status across In-App, Email, and SMS feeds.
          </p>
        </div>

        <button
          onClick={() => setShowComposerModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all self-start md:self-auto"
        >
          <Send className="w-4 h-4 stroke-[2.5]" />
          Compose Broadcast
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Filter by Category:
          </span>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => {
              setSelectedCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Categories</option>
            <option value="Placement Drive">Placement Drive</option>
            <option value="Interview Alert">Interview Alert</option>
            <option value="Policy Update">Policy Update</option>
            <option value="Urgent">Urgent</option>
            <option value="General">General</option>
          </select>
        </div>

        <span className="text-xs text-slate-400">
          Showing <strong>{announcements.length}</strong> of <strong>{total}</strong> broadcasts
        </span>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading broadcasts & delivery logs...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center text-rose-300">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <p className="font-semibold text-sm mb-3">{error}</p>
          <button
            onClick={fetchAnnouncements}
            className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
          <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Broadcasts Dispatched Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Dispatch drive alerts, exam schedules, or urgent policy notices to targeted student segments.
          </p>
          <button
            onClick={() => setShowComposerModal(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Create First Broadcast
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="divide-y divide-slate-800">
            {announcements.map((item) => (
              <div
                key={item._id}
                onClick={() => setSelectedAnnouncement(item)}
                className="p-5 hover:bg-slate-800/40 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getCategoryBadge(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-white hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 max-w-3xl">{item.body}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(item.sentAt || item.createdAt).toLocaleString()}
                    </span>
                    {item.sentBy && (
                      <span>
                        By: {item.sentBy.firstName} {item.sentBy.lastName}
                      </span>
                    )}
                    {item.segments?.driveId && (
                      <span className="text-cyan-400 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5" />
                        {item.segments.driveId.companyName || 'Drive Alert'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delivery Stats & Channels */}
                <div className="flex md:flex-col items-end justify-between md:justify-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    {item.channels?.inApp && (
                      <span
                        className="p-1 rounded bg-slate-800 text-emerald-400"
                        title="In-App Notification"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {item.channels?.email && (
                      <span className="p-1 rounded bg-slate-800 text-cyan-400" title="Email Dispatched">
                        <Mail className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {item.channels?.smsOrWhatsapp && (
                      <span
                        className="p-1 rounded bg-slate-800 text-amber-400"
                        title="SMS / WhatsApp"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-white">
                      {item.recipientCount || 0}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1">recipients</span>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.status === 'Sent'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : item.status === 'Scheduled'
                          ? 'bg-cyan-500/10 text-cyan-400'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Broadcast Composer Modal */}
      {showComposerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Segmented Student Broadcast</h3>
                <p className="text-xs text-slate-400">
                  Compose targeted message with live audience estimation
                </p>
              </div>
              <button
                onClick={() => setShowComposerModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendAnnouncement} className="space-y-5 mt-4">
              {/* Message Details */}
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Broadcast Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amazon Round 2 Technical Shortlist & Slot Allocation"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="General">General</option>
                      <option value="Placement Drive">Placement Drive</option>
                      <option value="Interview Alert">Interview Alert</option>
                      <option value="Policy Update">Policy Update</option>
                      <option value="Urgent">Urgent Alert</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Announcement Body *
                  </label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Enter announcement instructions, links, schedules..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Delivery Channels */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <span className="text-xs font-bold text-white block mb-2">
                  Delivery Channels
                </span>
                <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.inApp}
                      onChange={(e) => setChannels({ ...channels, inApp: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500"
                    />
                    In-App Notification Feed
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.email}
                      onChange={(e) => setChannels({ ...channels, email: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500"
                    />
                    Direct Email Broadcast
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.smsOrWhatsapp}
                      onChange={(e) =>
                        setChannels({ ...channels, smsOrWhatsapp: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-emerald-500"
                    />
                    SMS / WhatsApp Alerts
                  </label>
                </div>
              </div>

              {/* Target Audience Segmentation */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Target Audience Segmentation</span>
                  <label className="flex items-center gap-2 text-xs font-semibold text-emerald-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={targetAll}
                      onChange={(e) => setTargetAll(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500"
                    />
                    Target All Registered Students
                  </label>
                </div>

                {!targetAll && (
                  <div className="space-y-3 pt-2">
                    {/* Placement Status filter */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Placement Status
                        </label>
                        <select
                          value={placedStatus}
                          onChange={(e) => setPlacedStatus(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                        >
                          <option value="all">All Students (Placed & Unplaced)</option>
                          <option value="unplaced_only">Unplaced Students Only</option>
                          <option value="placed_only">Already Placed Students Only</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Linked Placement Drive (Optional)
                        </label>
                        <select
                          value={selectedDriveId}
                          onChange={(e) => setSelectedDriveId(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                        >
                          <option value="">No Drive Restriction (Campus-wide)</option>
                          {drives.map((d) => (
                            <option key={d._id} value={d._id}>
                              {d.companyName} - {d.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Graduating Year Chips */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Graduating Batches
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {GRAD_YEARS.map((yr) => {
                          const active = selectedYears.includes(yr);
                          return (
                            <button
                              type="button"
                              key={yr}
                              onClick={() => handleYearToggle(yr)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                active
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                              }`}
                            >
                              Class of {yr}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Department / Branch Multi-Select */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Eligible Branches ({selectedBranches.length} selected, empty = all branches)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {AVAILABLE_BRANCHES.map((b) => {
                          const active = selectedBranches.includes(b);
                          return (
                            <button
                              type="button"
                              key={b}
                              onClick={() => handleBranchToggle(b)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                                active
                                  ? 'bg-emerald-500 text-slate-950 font-bold'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
                              }`}
                            >
                              {b}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Recipient Counter & Sample Avatar Preview */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">
                          {calculatingRecipients ? '...' : recipientCount}
                        </span>
                        <span className="text-xs text-slate-400">students will receive this</span>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-medium">
                        Live dynamic audience estimate
                      </span>
                    </div>
                  </div>

                  {sampleRecipients.length > 0 && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block mb-1">
                        Sample recipients:
                      </span>
                      <div className="flex items-center justify-end gap-1.5">
                        {sampleRecipients.slice(0, 3).map((r, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                          >
                            {r.rollNo || r.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule For Later */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Schedule Broadcast for Later (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Leave blank to dispatch broadcast immediately across all selected channels.
                </span>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowComposerModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                  {sending
                    ? 'Dispatching...'
                    : scheduledAt
                    ? 'Schedule Broadcast'
                    : 'Dispatch Broadcast Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getCategoryBadge(
                    selectedAnnouncement.category
                  )}`}
                >
                  {selectedAnnouncement.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedAnnouncement.title}
                </h3>
                <span className="text-xs text-slate-400">
                  Dispatched on {new Date(selectedAnnouncement.sentAt || selectedAnnouncement.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
              {selectedAnnouncement.body}
            </div>

            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[11px] text-slate-400 block">Total Recipients</span>
                <span className="text-lg font-bold text-white">
                  {selectedAnnouncement.recipientCount || 0}
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[11px] text-slate-400 block">Delivered</span>
                <span className="text-lg font-bold text-emerald-400">
                  {selectedAnnouncement.deliveryStats?.delivered || selectedAnnouncement.recipientCount || 0}
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[11px] text-slate-400 block">Status</span>
                <span className="text-sm font-bold text-white capitalize">
                  {selectedAnnouncement.status}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
