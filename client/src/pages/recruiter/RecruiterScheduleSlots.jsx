import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import recruiterService from '../../services/recruiterService';
import {
  Calendar,
  Clock,
  Users,
  Video,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function RecruiterScheduleSlots() {
  const { driveId } = useParams();

  const [drive, setDrive] = useState(null);
  const [scheduleData, setScheduleData] = useState({ slots: [], panels: [], totalSlots: 0 });
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Availability Window Form State
  const [windowForm, setWindowForm] = useState({
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    startTime: '09:00',
    endTime: '13:00',
    duration: 45,
    buffer: 15,
    panelCount: 2,
    roundName: 'Technical Round 1',
    meetingLinkPrefix: 'https://meet.google.com/call-',
  });

  useEffect(() => {
    loadSchedule();
  }, [driveId]);

  const loadSchedule = async () => {
    setLoading(true);
    setError('');
    try {
      const [driveRes, schedRes] = await Promise.all([
        recruiterService.getDriveDetails(driveId),
        recruiterService.getDriveSchedule(driveId),
      ]);
      setDrive(driveRes.drive || driveRes);
      setScheduleData(schedRes || { slots: [], panels: [], totalSlots: 0 });
    } catch (err) {
      console.error('Failed to load schedule:', err);
      setError(err.response?.data?.error?.message || 'Failed to load recruitment schedule.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAllocate = async (e) => {
    e.preventDefault();
    setAllocating(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await recruiterService.autoAllocateSlots(driveId, {
        date: windowForm.date,
        startTime: windowForm.startTime,
        endTime: windowForm.endTime,
        duration: Number(windowForm.duration),
        buffer: Number(windowForm.buffer),
        panelCount: Number(windowForm.panelCount),
        roundName: windowForm.roundName,
        meetingLinkPrefix: windowForm.meetingLinkPrefix,
      });

      setSuccessMsg(
        `Successfully allocated ${res.allocatedCount || 0} candidate(s) across ${
          windowForm.panelCount
        } interview panel(s)!`
      );
      await loadSchedule();
    } catch (err) {
      console.error('Auto allocate failed:', err);
      setError(
        err.response?.data?.error?.message ||
          'Slot auto-allocation failed. Make sure there are shortlisted candidates in need of scheduling.'
      );
    } finally {
      setAllocating(false);
    }
  };

  // Group slots by panel for intuitive multi-panel column view
  const slotsByPanel = {};
  (scheduleData.slots || []).forEach((slot) => {
    const panelName = slot.panel || 'General Panel';
    if (!slotsByPanel[panelName]) {
      slotsByPanel[panelName] = [];
    }
    slotsByPanel[panelName].push(slot);
  });

  const panelsList = Object.keys(slotsByPanel).length
    ? Object.keys(slotsByPanel)
    : Array.from({ length: windowForm.panelCount }, (_, i) => `Panel ${i + 1}`);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium mb-1">
            <span>{drive?.companyName || 'Corporate Drive'}</span>
            <span>•</span>
            <span>Automated Panel & Interview Scheduling</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-indigo-400" />
            Interview Slot Booking & Panel Allocation
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure your recruiter team's availability window and let the system auto-distribute shortlisted candidates across concurrent panels without clashes.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recruiter Availability Window Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Availability Window
            </h3>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Auto-Scheduler
            </span>
          </div>

          <form onSubmit={handleAutoAllocate} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Interview Date</label>
              <input
                type="date"
                value={windowForm.date}
                onChange={(e) => setWindowForm({ ...windowForm, date: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Start Time</label>
                <input
                  type="time"
                  value={windowForm.startTime}
                  onChange={(e) => setWindowForm({ ...windowForm, startTime: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">End Time</label>
                <input
                  type="time"
                  value={windowForm.endTime}
                  onChange={(e) => setWindowForm({ ...windowForm, endTime: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Slot Duration (min)</label>
                <select
                  value={windowForm.duration}
                  onChange={(e) =>
                    setWindowForm({ ...windowForm, duration: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                  <option value={90}>90 Minutes</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Break Buffer (min)</label>
                <select
                  value={windowForm.buffer}
                  onChange={(e) =>
                    setWindowForm({ ...windowForm, buffer: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value={0}>0 min (Back-to-back)</option>
                  <option value={10}>10 min break</option>
                  <option value={15}>15 min break</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                Concurrent Panels / Interviewers
              </label>
              <select
                value={windowForm.panelCount}
                onChange={(e) =>
                  setWindowForm({ ...windowForm, panelCount: Number(e.target.value) })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value={1}>1 Panel (Single Interviewer)</option>
                <option value={2}>2 Panels (Parallel Streams)</option>
                <option value={3}>3 Panels (High Throughput)</option>
                <option value={4}>4 Panels (Mega Drive)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Interview Round Name</label>
              <input
                type="text"
                value={windowForm.roundName}
                onChange={(e) => setWindowForm({ ...windowForm, roundName: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Video Meeting Link Base</label>
              <input
                type="text"
                value={windowForm.meetingLinkPrefix}
                onChange={(e) =>
                  setWindowForm({ ...windowForm, meetingLinkPrefix: e.target.value })
                }
                placeholder="https://meet.google.com/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={allocating}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg shadow-indigo-600/20 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>{allocating ? 'Allocating Slots...' : 'Auto-Allocate Shortlisted Candidates'}</span>
            </button>
          </form>
        </div>

        {/* Right Columns: Active Schedule Grid by Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Scheduled Interview Slots ({scheduleData.slots?.length || 0})
            </h3>
            <span className="text-xs text-slate-400">
              {panelsList.length} Active Panel{panelsList.length > 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="h-64 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse" />
          ) : scheduleData.slots?.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
              <Calendar className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">No Slots Generated Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Use the availability window on the left to automatically generate clash-free interview slots and assign your shortlisted candidate pool.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {panelsList.map((panel) => {
                const slots = slotsByPanel[panel] || [];
                return (
                  <div
                    key={panel}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                        <span className="text-sm font-bold text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-indigo-400" />
                          {panel}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {slots.length} Candidate{slots.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {slots.map((slot) => {
                          const startTime = slot.startTime
                            ? new Date(slot.startTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'TBD';
                          const endTime = slot.endTime
                            ? new Date(slot.endTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'TBD';

                          return (
                            <div
                              key={slot._id || slot.id}
                              className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1.5 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-200">
                                  {slot.candidateName || 'Candidate'}
                                </span>
                                <span className="font-mono text-[11px] text-indigo-400 font-semibold">
                                  {startTime} - {endTime}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span>{slot.candidateRollNo || slot.roundName}</span>
                                {slot.meetingLink && (
                                  <a
                                    href={slot.meetingLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
                                  >
                                    <Video className="w-3 h-3" />
                                    <span>Join Meet</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
