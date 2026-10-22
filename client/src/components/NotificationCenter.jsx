import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Briefcase,
  Calendar,
  Award,
  ShieldCheck,
  Megaphone,
  AlertCircle,
  ExternalLink,
  Settings,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import notificationService from '../services/notificationService';

function formatRelativeTime(dateInput) {
  if (!dateInput) return '';
  const now = new Date();
  const date = new Date(dateInput);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getEventIcon(eventType) {
  if (!eventType) return Bell;
  if (eventType.includes('offer')) return Award;
  if (eventType.includes('interview')) return Calendar;
  if (eventType.includes('drive')) return Briefcase;
  if (eventType.includes('verification')) return ShieldCheck;
  if (eventType.includes('announcement')) return Megaphone;
  return AlertCircle;
}

export default function NotificationCenter({ isDark = true, preferencesLink = '/student/notifications/preferences' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchUnread = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data?.unreadCount || 0);
    } catch {
      // Resilient fallback
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getInAppNotifications({
        limit: 30,
        unreadOnly: filter === 'unread',
      });
      setNotifications(data?.notifications || []);
      setUnreadCount(data?.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, filter]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (notification) => {
    if (notification.status !== 'read') {
      try {
        await notificationService.markAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, status: 'read' } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }

    if (notification.deepLink) {
      setIsOpen(false);
      navigate(notification.deepLink);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition duration-150 focus:outline-none cursor-pointer ${
          isDark
            ? 'text-slate-300 hover:text-white hover:bg-slate-800'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
        aria-label="Notification Center"
      >
        <Bell className="w-5 h-5 stroke-[2]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-sm shadow-rose-500/50">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Drawer */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Header */}
          <div
            className={`p-3.5 border-b flex items-center justify-between ${
              isDark ? 'border-slate-800/80 bg-slate-900/90' : 'border-slate-100 bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight">Placement Alerts</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                    isDark
                      ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                      : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-200'
                  }`}
                >
                  <CheckCheck className="w-4 h-4" />
                  <span className="hidden sm:inline text-[11px]">Mark read</span>
                </button>
              )}
              {preferencesLink && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate(preferencesLink);
                  }}
                  title="Notification Preferences"
                  className={`p-1.5 rounded-lg transition ${
                    isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div
            className={`px-3 py-1.5 flex gap-2 border-b text-xs ${
              isDark ? 'border-slate-800/60 bg-slate-950/40' : 'border-slate-100 bg-slate-100/50'
            }`}
          >
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                filter === 'all'
                  ? isDark
                    ? 'bg-slate-800 text-white'
                    : 'bg-white shadow text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Alerts
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                filter === 'unread'
                  ? isDark
                    ? 'bg-slate-800 text-white'
                    : 'bg-white shadow text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unread Only
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/40">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
                Fetching latest notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div
                  className={`w-10 h-10 rounded-2xl mx-auto flex items-center justify-center mb-2.5 ${
                    isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Bell className="w-5 h-5 stroke-[1.5]" />
                </div>
                <p className="text-xs font-bold text-slate-300">You're all caught up!</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {filter === 'unread'
                    ? 'No unread notifications at the moment.'
                    : 'New campus drives, interviews and announcements will appear here.'}
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const IconComponent = getEventIcon(item.eventType);
                const isUnread = item.status !== 'read';

                return (
                  <div
                    key={item._id}
                    onClick={() => handleMarkAsRead(item)}
                    className={`p-3.5 flex gap-3 transition cursor-pointer group ${
                      isUnread
                        ? isDark
                          ? 'bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08]'
                          : 'bg-emerald-50/50 hover:bg-emerald-50'
                        : isDark
                        ? 'hover:bg-slate-800/50'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        item.eventType?.includes('offer')
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : item.eventType?.includes('interview')
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : item.eventType?.includes('drive')
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isDark
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 stroke-[2]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p
                          className={`text-xs font-bold leading-tight truncate ${
                            isUnread
                              ? isDark
                                ? 'text-white'
                                : 'text-slate-900'
                              : isDark
                              ? 'text-slate-300'
                              : 'text-slate-700'
                          }`}
                        >
                          {item.title}
                        </p>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1"></span>
                        )}
                      </div>

                      <p
                        className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}
                      >
                        {item.body?.replace(/<[^>]+>/g, '') || ''}
                      </p>

                      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(item.createdAt)}
                        </span>
                        {item.deepLink && (
                          <span className="flex items-center gap-0.5 text-emerald-500 group-hover:underline">
                            Open <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
