import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  ShieldCheck,
  Smartphone,
  Monitor,
  Laptop,
  Tablet,
  Globe,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Clock,
  LogOut,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import authService from '../../services/authService';

export default function SessionManagement() {
  const { user } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState(null);
  const [revokingOthers, setRevokingOthers] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await authService.getSessions();
      setSessions(data || []);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error?.message || 'Failed to fetch active sessions.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleRevokeSingle = async (sessionId) => {
    try {
      setRevokingId(sessionId);
      await authService.revokeSession(sessionId);
      setFeedback({
        type: 'success',
        message: 'Device session revoked successfully.',
      });
      await loadSessions();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error?.message || 'Failed to revoke session.',
      });
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeOthers = async () => {
    if (!window.confirm('Are you sure you want to log out of all other devices?')) return;
    try {
      setRevokingOthers(true);
      const res = await authService.revokeOtherSessions();
      setFeedback({
        type: 'success',
        message: `Revoked ${res.revokedCount || 'all'} other active device sessions.`,
      });
      await loadSessions();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error?.message || 'Failed to terminate other sessions.',
      });
    } finally {
      setRevokingOthers(false);
    }
  };

  const getDeviceIcon = (deviceType) => {
    const type = (deviceType || '').toLowerCase();
    if (type.includes('mobile') || type.includes('phone')) {
      return <Smartphone className="w-5 h-5 text-emerald-400" />;
    }
    if (type.includes('tablet') || type.includes('ipad')) {
      return <Tablet className="w-5 h-5 text-sky-400" />;
    }
    if (type.includes('laptop')) {
      return <Laptop className="w-5 h-5 text-purple-400" />;
    }
    return <Monitor className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Active Devices & Sessions
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage authenticated devices. Revoking a session immediately deletes its refresh token family.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadSessions}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-semibold flex items-center gap-2 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {sessions.length > 1 && (
              <button
                onClick={handleRevokeOthers}
                disabled={revokingOthers}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2 transition disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                {revokingOthers ? 'Revoking...' : 'Sign Out Other Devices'}
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-white font-mono text-xs"
            >
              &times;
            </button>
          </div>
        )}

        {/* Security Overview Card */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                Account Protection Active
              </p>
              <p className="text-[11px] text-slate-400">
                Logged in as <strong className="text-emerald-400">{user?.email}</strong>. Refresh tokens expire every 7 days with automatic reuse defense.
              </p>
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-500 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            {sessions.length} {sessions.length === 1 ? 'Device' : 'Devices'} Connected
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-16 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
              Verifying active sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-slate-700" />
              No active sessions found.
            </div>
          ) : (
            sessions.map((sess) => (
              <div
                key={sess._id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-750 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                    {getDeviceIcon(sess.deviceInfo?.deviceType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">
                        {sess.deviceInfo?.browser || 'Web Browser'} on{' '}
                        {sess.deviceInfo?.os || 'Unknown OS'}
                      </span>
                      {sess.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Current Device
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-500" />
                        {sess.ipAddress || '127.0.0.1'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        Last active: {new Date(sess.lastActiveAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-1 text-[11px] text-slate-500 font-mono">
                      Expires: {new Date(sess.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="sm:self-center w-full sm:w-auto flex justify-end">
                  <button
                    onClick={() => handleRevokeSingle(sess._id)}
                    disabled={revokingId === sess._id}
                    className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl border border-slate-800 hover:border-rose-500/40 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {revokingId === sess._id ? 'Revoking...' : sess.isCurrent ? 'Log Out' : 'Revoke'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
