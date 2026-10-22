import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  ExternalLink,
  Download,
  Building2,
  Video,
  MapPin,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import studentService from '../../services/studentService';
import { useTenant } from '../../context/TenantContext';

/**
 * Format Date for Google Calendar Web URL: YYYYMMDDTHHmmssZ
 */
function formatGCalDate(dateStr) {
  const d = new Date(dateStr);
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export default function StudentInterviewCalendar() {
  const { branding } = useTenant();

  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [hasAnyClash, setHasAnyClash] = useState(false);
  const [error, setError] = useState('');

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await studentService.getInterviews();
      setSlots(res.slots || []);
      setHasAnyClash(Boolean(res.hasAnyClash));
    } catch (err) {
      console.error('Failed to load interview slots:', err);
      setError(err?.response?.data?.error?.message || 'Failed to fetch interview calendar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const getGoogleCalendarUrl = (slot) => {
    const company = slot.opportunityId?.companyName || 'Campus Recruiter';
    const role = slot.opportunityId?.title || 'Placement Interview';
    const title = `${company} Interview: ${slot.roundName || 'Round'} (${role})`;
    const details = `Placement interview with ${company} for ${role}. Panel: ${slot.panelName || 'General Panel'}. Mode: ${slot.mode || 'Online'}. ${slot.roomOrLink ? `Join Link: ${slot.roomOrLink}` : ''}`;
    const location = slot.roomOrLink || slot.mode || 'Campus Interview Hall';

    const start = formatGCalDate(slot.startDateTime);
    const end = formatGCalDate(slot.endDateTime);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
  };

  const icsDownloadUrl = studentService.getIcsExportUrl();

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-white">Interview Schedule & Calendar</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {slots.length} Rounds Scheduled
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time interview slot booking, automated schedule clash detection, Google Calendar sync & ICS export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={icsDownloadUrl}
            download="my-interviews.ics"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Download .ICS Calendar</span>
          </a>
        </div>
      </div>

      {/* Schedule Clash Warning Alert */}
      {hasAnyClash && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 flex items-start gap-3 text-rose-300">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider">
              ⚠️ Schedule Clash Detected
            </h4>
            <p className="leading-relaxed">
              You have overlapping interview slots with different corporate panels. Overlapping rounds are marked in red below. Please notify the TPO immediately to request slot rescheduling.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading your interview schedule...</p>
        </div>
      ) : slots.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <CalendarIcon className="w-10 h-10 text-slate-600 mx-auto" />
          <h2 className="text-sm font-bold text-white">No Interviews Scheduled</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            When recruiters shortlist you and schedule interview slots or panels, your agenda will appear here automatically with calendar sync links.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {slots.map((slot) => {
            const isClash = slot.hasClash;
            const startDate = new Date(slot.startDateTime);
            const endDate = new Date(slot.endDateTime);
            const isPast = endDate < new Date();

            return (
              <div
                key={slot.id || slot._id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isClash
                    ? 'bg-rose-950/20 border-rose-500/60 shadow-lg shadow-rose-950/30'
                    : isPast
                    ? 'bg-slate-900/60 border-slate-800 opacity-70'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md'
                }`}
              >
                {/* Left Side: Time Badge & Company Details */}
                <div className="flex items-start gap-4">
                  {/* Date Block */}
                  <div
                    className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold flex-shrink-0 ${
                      isClash
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-semibold">
                      {startDate.toLocaleDateString([], { month: 'short' })}
                    </span>
                    <span className="text-xl font-black leading-tight">{startDate.getDate()}</span>
                    <span className="text-[9px] text-slate-400">
                      {startDate.toLocaleDateString([], { weekday: 'short' })}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white">
                        {slot.opportunityId?.companyName || 'Corporate Recruiter'}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {slot.roundName || 'Technical Interview'}
                      </span>
                      {isClash && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                          ⚠️ Clash
                        </span>
                      )}
                      {isPast && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-500">
                          Completed
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-emerald-400">{slot.opportunityId?.title}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-300 pt-1 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {slot.panelName && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <span>Panel: {slot.panelName}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Video className="w-3.5 h-3.5" />
                        <span>{slot.mode || 'Online Video'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Join Room & Google Calendar Sync */}
                <div className="flex items-center gap-2.5 self-end md:self-center flex-wrap">
                  {slot.roomOrLink && (
                    <a
                      href={slot.roomOrLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-emerald-500/20"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Meeting</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <a
                    href={getGoogleCalendarUrl(slot)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Add to GCal</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
