import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Search,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Database,
  UserCheck,
  Activity,
} from 'lucide-react';
import auditLogService from '../../services/auditLogService';

const ACTION_OPTIONS = [
  'ALL',
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'GOOGLE_LOGIN_SUCCESS',
  'TOKEN_REUSE_DETECTED',
  'PASSWORD_RESET_REQUESTED',
  'PASSWORD_RESET_COMPLETED',
  'VERIFY_STUDENT',
  'REJECT_STUDENT',
  'CREATE_DRIVE',
  'EDIT_DRIVE',
  'CLOSE_DRIVE',
  'STATUS_CHANGE',
  'OFFER_EXTENDED',
  'ROLE_CHANGE',
  'CSV_EXPORT',
  'BULK_IMPORT',
  'FILE_DOWNLOAD',
];

const ENTITY_OPTIONS = [
  'ALL',
  'User',
  'Student',
  'Drive',
  'Application',
  'Session',
  'College',
  'Report',
];

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [actor, setActor] = useState('');
  const [action, setAction] = useState('ALL');
  const [entity, setEntity] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Inspection Modal
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        limit,
        ...(actor.trim() ? { actor: actor.trim() } : {}),
        ...(action !== 'ALL' ? { action } : {}),
        ...(entity !== 'ALL' ? { entity } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      };

      const res = await auditLogService.getAuditLogs(params);
      setLogs(res.logs || []);
      setPagination(res.pagination || { total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, actor, action, entity, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleResetFilters = () => {
    setActor('');
    setAction('ALL');
    setEntity('ALL');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const params = {
        ...(actor.trim() ? { actor: actor.trim() } : {}),
        ...(action !== 'ALL' ? { action } : {}),
        ...(entity !== 'ALL' ? { entity } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      };
      await auditLogService.exportAuditLogsCsv(params);
    } catch (err) {
      alert('CSV Export failed: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setExporting(false);
    }
  };

  const getActionBadgeColor = (actionName) => {
    if (actionName.includes('SUCCESS') || actionName.includes('VERIFY') || actionName.includes('EXTENDED')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (actionName.includes('FAILED') || actionName.includes('REJECT') || actionName.includes('REUSE') || actionName.includes('CLOSE')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
    if (actionName.includes('CREATE') || actionName.includes('EXPORT') || actionName.includes('IMPORT')) {
      return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    }
    return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Institutional Audit Log
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-widest font-mono font-bold">
                    Immutable
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tamper-evident regulatory trail of authentication, placement decisions, and data access.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-semibold flex items-center gap-2 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExportCsv}
              disabled={exporting}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
            >
              <Download className="w-3.5 h-3.5" />
              {exporting ? 'Exporting...' : 'Export Audit CSV'}
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <form onSubmit={handleSearchSubmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Actor / User Email
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={actor}
                  onChange={(e) => setActor(e.target.value)}
                  placeholder="e.g. tpo@college.edu"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Security Action
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
              >
                {ACTION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Entity Type
              </label>
              <select
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
              >
                {ENTITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <div className="text-xs text-slate-400">
              Found <strong className="text-emerald-400">{pagination.total}</strong> events matching criteria.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-xs text-slate-400 hover:text-white transition"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Filter className="w-3 h-3" />
                Apply Filters
              </button>
            </div>
          </div>
        </form>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Main Logs Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">IP / User Agent</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                      Loading audit stream...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <Database className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                      No audit events recorded matching current filter parameters.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white truncate max-w-[180px]">
                          {log.actor || 'System'}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase font-mono">
                          {log.role || 'Unauthenticated'}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-semibold ${getActionBadgeColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-300 font-medium">{log.entity || 'N/A'}</span>
                        {log.entityId && (
                          <span className="block font-mono text-[10px] text-slate-500 truncate max-w-[140px]">
                            {log.entityId}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px] text-slate-400">
                          {log.ip || '127.0.0.1'}
                        </div>
                        <div className="text-[10px] text-slate-600 truncate max-w-[180px]" title={log.userAgent}>
                          {log.userAgent || 'Unknown Agent'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold inline-flex items-center gap-1.5 transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          Diff
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="text-xs text-slate-400">
                Page <strong className="text-white">{page}</strong> of{' '}
                <strong className="text-white">{pagination.totalPages}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40 text-xs text-slate-300 transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40 text-xs text-slate-300 transition flex items-center gap-1"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Diff Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-bold ${getActionBadgeColor(
                      selectedLog.action
                    )}`}
                  >
                    {selectedLog.action}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {selectedLog._id}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1">
                  Event Diff & Metadata Inspection
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs font-sans">
              {/* Event Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div>
                  <span className="block text-[10px] text-slate-500 font-mono uppercase">Actor</span>
                  <span className="font-semibold text-slate-200">{selectedLog.actor || 'System'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 font-mono uppercase">Role</span>
                  <span className="font-semibold text-slate-200">{selectedLog.role || 'Unspecified'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 font-mono uppercase">Entity</span>
                  <span className="font-semibold text-slate-200">
                    {selectedLog.entity} ({selectedLog.entityId || 'N/A'})
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 font-mono uppercase">IP Address</span>
                  <span className="font-semibold text-slate-200 font-mono">{selectedLog.ip || '127.0.0.1'}</span>
                </div>
              </div>

              {/* State Diff: Before vs After */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    State Before Action
                  </h4>
                  <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-[11px] text-rose-300/90 overflow-x-auto min-h-[140px] max-h-[300px]">
                    {selectedLog.before && Object.keys(selectedLog.before).length > 0
                      ? JSON.stringify(selectedLog.before, null, 2)
                      : '// No preceding state recorded'}
                  </pre>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    State After Action
                  </h4>
                  <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-[11px] text-emerald-300/90 overflow-x-auto min-h-[140px] max-h-[300px]">
                    {selectedLog.after && Object.keys(selectedLog.after).length > 0
                      ? JSON.stringify(selectedLog.after, null, 2)
                      : '// No mutated state recorded'}
                  </pre>
                </div>
              </div>

              {/* User Agent */}
              <div>
                <span className="block text-[10px] text-slate-500 font-mono uppercase mb-1">
                  Client User Agent Header
                </span>
                <p className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400 break-all">
                  {selectedLog.userAgent || 'No user agent provided'}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
