import React, { useState, useEffect } from 'react';
import {
  Bell,
  RefreshCw,
  RotateCcw,
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  Mail,
  MessageSquare,
  Radio,
  Filter,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import notificationService from '../../services/notificationService';

export default function TpoDeliveryReport() {
  const [report, setReport] = useState({
    summary: { total: 0, queued: 0, sent: 0, delivered: 0, failed: 0, read: 0, deliveryRate: 100 },
    notifications: [],
    total: 0,
    page: 1,
    totalPages: 1,
  });

  const [channelFilter, setChannelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 5000);
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getDeliveryTracking({
        page,
        limit: 25,
        channel: channelFilter,
        status: statusFilter,
      });
      if (data) {
        setReport({
          summary: data.summary || { total: 0, queued: 0, sent: 0, delivered: 0, failed: 0, read: 0, deliveryRate: 100 },
          notifications: data.notifications || [],
          total: data.total || 0,
          page: data.page || 1,
          totalPages: data.totalPages || 1,
        });
      }
    } catch (err) {
      console.error('Failed to fetch delivery report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [page, channelFilter, statusFilter]);

  const handleDrainQueue = async () => {
    setActionLoading(true);
    try {
      const res = await notificationService.drainQueue();
      showFeedback(`Processed ${res?.processed || 0} queued notifications (${res?.delivered || 0} delivered, ${res?.failed || 0} failed).`);
      fetchReport();
    } catch (err) {
      showFeedback(err.response?.data?.error?.message || 'Failed to process queue.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetryFailed = async () => {
    setActionLoading(true);
    try {
      const res = await notificationService.retryFailedJobs();
      showFeedback(res?.message || 'Queued all failed jobs for retry.');
      fetchReport();
    } catch (err) {
      showFeedback(err.response?.data?.error?.message || 'Failed to retry jobs.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerReminders = async () => {
    setActionLoading(true);
    try {
      const res = await notificationService.triggerReminders();
      showFeedback(`Triggered scheduled deadline & interview reminders.`);
      fetchReport();
    } catch (err) {
      showFeedback(err.response?.data?.error?.message || 'Failed to trigger reminders.');
    } finally {
      setActionLoading(false);
    }
  };

  const getChannelBadge = (ch) => {
    switch (ch) {
      case 'email':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Mail className="w-3 h-3" /> Email
          </span>
        );
      case 'whatsapp':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <MessageSquare className="w-3 h-3" /> WhatsApp
          </span>
        );
      case 'push':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Radio className="w-3 h-3" /> Push
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            <Bell className="w-3 h-3" /> In-App
          </span>
        );
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'delivered':
      case 'read':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Delivered
          </span>
        );
      case 'queued':
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Queued
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
            {st}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Multi-Channel Delivery Tracking
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
              Live Queue
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time audit log and dispatch analytics across In-App, Email, Push, and WhatsApp.
          </p>
        </div>

        {/* Global Queue Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchReport}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Refresh Log"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleDrainQueue}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            Process Queue
          </button>
          <button
            onClick={handleTriggerReminders}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Check Reminders
          </button>
          <button
            onClick={handleRetryFailed}
            disabled={actionLoading || report.summary.failed === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 disabled:opacity-40 text-xs font-bold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry Failed ({report.summary.failed})
          </button>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {feedback}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Dispatched</p>
          <p className="text-2xl font-black text-white mt-1">{report.summary.total.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500">Across all channels</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Delivered</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{report.summary.delivered.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-500 font-semibold">{report.summary.deliveryRate}% Success Rate</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Queued / Due</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{report.summary.queued.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500">Awaiting dispatch/quiet hours</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Failed / Dead Letter</p>
          <p className="text-2xl font-black text-rose-400 mt-1">{report.summary.failed.toLocaleString()}</p>
          <span className="text-[10px] text-rose-500">Exhausted max 3 retries</span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            Filters:
          </div>

          <select
            value={channelFilter}
            onChange={(e) => {
              setChannelFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Channels</option>
            <option value="in_app">In-App</option>
            <option value="email">Email</option>
            <option value="push">Push</option>
            <option value="whatsapp">WhatsApp</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="delivered">Delivered</option>
            <option value="queued">Queued</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Showing <strong>{report.notifications.length}</strong> of <strong>{report.total}</strong> events
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Event & Title</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Retries</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Details / Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 animate-pulse">
                    Loading delivery audit log...
                  </td>
                </tr>
              ) : report.notifications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No notifications matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                report.notifications.map((n) => {
                  const studentName = n.userId
                    ? `${n.userId.firstName || ''} ${n.userId.lastName || ''}`.trim()
                    : n.metadata?.recipientName || 'Student';
                  const studentEmail = n.userId?.email || n.metadata?.recipientAddress || '';

                  return (
                    <tr key={n._id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-200">{studentName}</p>
                        <p className="text-[11px] text-slate-500 font-mono truncate max-w-[150px]">
                          {studentEmail}
                        </p>
                      </td>

                      <td className="py-3 px-4">{getChannelBadge(n.channel)}</td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-950 px-1 py-0.5 rounded">
                            {n.eventType}
                          </span>
                        </div>
                        <p className="font-bold text-slate-200 truncate mt-0.5">{n.title}</p>
                      </td>

                      <td className="py-3 px-4">{getStatusBadge(n.status)}</td>

                      <td className="py-3 px-4">
                        <span
                          className={`font-mono text-[11px] ${
                            n.retryCount > 0 ? 'text-amber-400 font-bold' : 'text-slate-500'
                          }`}
                        >
                          {n.retryCount || 0} / {n.maxRetries || 3}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[11px] text-slate-400 whitespace-nowrap">
                        {n.deliveredAt ? (
                          <span>{new Date(n.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        ) : (
                          <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                        <span className="block text-[10px] text-slate-500">
                          {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        {n.failureReason ? (
                          <div className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg">
                            {n.failureReason}
                          </div>
                        ) : n.nextRetryAt ? (
                          <div className="text-[11px] text-amber-400">
                            Deferred to {new Date(n.nextRetryAt).toLocaleTimeString()}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500">Normal delivery</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {report.totalPages > 1 && (
          <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {report.page} of {report.totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={report.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={report.page >= report.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
