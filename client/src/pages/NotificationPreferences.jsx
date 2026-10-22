import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Radio,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Save,
  ShieldCheck,
  Send,
  HelpCircle,
} from 'lucide-react';
import notificationService from '../services/notificationService';

const EVENT_CONFIGS = [
  {
    key: 'offer.extended',
    title: 'Offer Extended',
    description: 'Formal placement offers extended by recruiters.',
    isMandatory: true,
  },
  {
    key: 'interview.scheduled',
    title: 'Interview Scheduled',
    description: 'Direct interview slot allocations and calendar invites.',
    isMandatory: true,
  },
  {
    key: 'interview.reminder_1h',
    title: 'Interview 1-Hour Reminder',
    description: 'Immediate countdown reminder with video link/room details.',
    isMandatory: true,
  },
  {
    key: 'interview.reminder_1d',
    title: 'Interview 1-Day Reminder',
    description: '24-hour advance preparation notice for upcoming interviews.',
    isMandatory: false,
  },
  {
    key: 'drive.published',
    title: 'New Campus Placement Drives',
    description: 'Recruitment opportunities where your branch/CGPA meets criteria.',
    isMandatory: false,
  },
  {
    key: 'drive.deadline_24h',
    title: 'Application Deadline (24h Alert)',
    description: 'Reminder before applications close for eligible drives.',
    isMandatory: false,
  },
  {
    key: 'application.status_changed',
    title: 'Application Status Updates',
    description: 'Advancements to OA, Technical, HR, and shortlist releases.',
    isMandatory: false,
  },
  {
    key: 'verification.approved',
    title: 'Academic Verification Seal',
    description: 'Approval or rejection notifications for your academic credentials.',
    isMandatory: false,
  },
  {
    key: 'announcement.sent',
    title: 'Institutional Announcements',
    description: 'Official broadcasts and urgent notices from the Placement Cell.',
    isMandatory: false,
  },
];

export default function NotificationPreferences() {
  const { user } = useContext(AuthContext);
  const { branding, college } = useTenant();
  const navigate = useNavigate();

  const [channels, setChannels] = useState({
    in_app: true,
    email: true,
    push: true,
    whatsapp: false,
    sms: false,
  });

  const [customPreferences, setCustomPreferences] = useState({});
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [whatsappOptedIn, setWhatsappOptedIn] = useState(false);
  const [pushStatus, setPushStatus] = useState('default'); // 'default' | 'granted' | 'denied'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushStatus(window.Notification.permission);
    }

    const loadPrefs = async () => {
      try {
        const res = await notificationService.getPreferences();
        if (res?.preference) {
          const pref = res.preference;
          setChannels(pref.channels || { in_app: true, email: true, push: true, whatsapp: false, sms: false });
          setCustomPreferences(pref.customPreferences || {});
          if (pref.whatsappOptIn?.optedIn) {
            setWhatsappOptedIn(true);
            setWhatsappPhone(pref.whatsappOptIn.phoneNumber || '');
          }
        }
      } catch (err) {
        console.error('Failed to load preferences:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPrefs();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleGlobalChannelToggle = (channelKey) => {
    setChannels((prev) => ({
      ...prev,
      [channelKey]: !prev[channelKey],
    }));
  };

  const handleEventChannelToggle = (eventKey, channelKey, isMandatory) => {
    // Prevent disabling mandatory events on primary channels (email and in_app)
    if (isMandatory && (channelKey === 'email' || channelKey === 'in_app')) {
      showToast('⚠️ Institutional Policy: Mandatory alerts cannot be disabled.');
      return;
    }

    setCustomPreferences((prev) => {
      const currentEventMap = prev[eventKey] || {};
      const currentValue = currentEventMap[channelKey] !== undefined ? currentEventMap[channelKey] : channels[channelKey];
      return {
        ...prev,
        [eventKey]: {
          ...currentEventMap,
          [channelKey]: !currentValue,
        },
      };
    });
  };

  const handleEnablePush = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }

    try {
      const permission = await window.Notification.requestPermission();
      setPushStatus(permission);
      if (permission === 'granted') {
        // Register push subscription
        await notificationService.subscribePush({
          endpoint: `browser_${navigator.userAgent.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40)}_${Date.now()}`,
          userAgent: navigator.userAgent,
        });
        setChannels((prev) => ({ ...prev, push: true }));
        showToast('Web Push notifications enabled successfully!');
      } else {
        showToast('Browser notifications were blocked. Please enable them in your browser settings.');
      }
    } catch (err) {
      console.error('Push registration error:', err);
      showToast('Could not enable Web Push notifications.');
    }
  };

  const handleWhatsAppOptIn = async (e) => {
    e.preventDefault();
    if (!whatsappPhone.trim() || whatsappPhone.trim().length < 10) {
      alert('Please enter a valid phone number with country code (e.g. +91 9876543210).');
      return;
    }

    try {
      await notificationService.optInWhatsApp(whatsappPhone.trim());
      setWhatsappOptedIn(true);
      setChannels((prev) => ({ ...prev, whatsapp: true }));
      showToast('WhatsApp notifications opted-in successfully!');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to opt into WhatsApp.');
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      await notificationService.updatePreferences({
        channels,
        customPreferences,
      });
      showToast('Notification preferences saved successfully!');
    } catch (err) {
      console.error('Save preferences error:', err);
      showToast('Error saving preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                Notification Preferences
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                  Multi-Channel
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Manage alerts across in-app feed, email, push, and WhatsApp.
              </p>
            </div>
          </div>

          <button
            onClick={handleSavePreferences}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {toastMessage}
          </div>
        )}

        {/* Global Channel Cards */}
        <div>
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
            Delivery Channels
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* In-App */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.in_app}
                      onChange={() => handleGlobalChannelToggle('in_app')}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                <h3 className="font-bold text-sm text-white">In-App Feed</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Real-time alerts inside your student dashboard notification bell.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-emerald-400 font-medium">
                Active & Synced
              </div>
            </div>

            {/* Email */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.email}
                      onChange={() => handleGlobalChannelToggle('email')}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                <h3 className="font-bold text-sm text-white">Email Digest</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Sent to {user?.email || 'your registered institutional email'}.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                Includes 1-click unsubscribe header
              </div>
            </div>

            {/* Web Push */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                    <Radio className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      pushStatus === 'granted'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {pushStatus === 'granted' ? 'Allowed' : 'Disabled'}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white">Web Push</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Desktop & mobile system notifications via browser service worker.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                {pushStatus !== 'granted' ? (
                  <button
                    onClick={handleEnablePush}
                    className="w-full text-center py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-bold transition"
                  >
                    Enable Browser Push
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-400 font-medium">Service Worker Active</span>
                )}
              </div>
            </div>

            {/* WhatsApp */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      whatsappOptedIn
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {whatsappOptedIn ? 'Opted-In' : 'Opt-In Needed'}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white">WhatsApp Alerts</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Instant interview reminders and offer letters on WhatsApp.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 truncate">
                {whatsappPhone || 'No phone verified'}
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Verification Box if not opted-in */}
        {!whatsappOptedIn && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Opt-In for WhatsApp Placement Alerts</h3>
              </div>
              <p className="text-xs text-slate-400 max-w-xl">
                Receive crucial interview slot reminders 1 hour before and formal offer alerts directly on WhatsApp. We strictly follow Meta business compliance with zero spam.
              </p>
            </div>
            <form onSubmit={handleWhatsAppOptIn} className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="tel"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full sm:w-44"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Verify
              </button>
            </form>
          </div>
        )}

        {/* Per-Event Preferences Matrix Table */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Per-Event Channel Settings</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize where you receive individual event alerts. Mandatory notifications are locked.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Mandatory alert</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4 text-center">In-App</th>
                  <th className="py-3 px-4 text-center">Email</th>
                  <th className="py-3 px-4 text-center">Web Push</th>
                  <th className="py-3 px-4 text-center">WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {EVENT_CONFIGS.map((evt) => {
                  const eventOverrides = customPreferences[evt.key] || {};

                  const isInAppChecked =
                    eventOverrides.in_app !== undefined ? eventOverrides.in_app : channels.in_app;
                  const isEmailChecked =
                    eventOverrides.email !== undefined ? eventOverrides.email : channels.email;
                  const isPushChecked =
                    eventOverrides.push !== undefined ? eventOverrides.push : channels.push;
                  const isWhatsappChecked =
                    eventOverrides.whatsapp !== undefined ? eventOverrides.whatsapp : channels.whatsapp;

                  return (
                    <tr key={evt.key} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{evt.title}</span>
                          {evt.isMandatory && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{evt.description}</p>
                      </td>

                      {/* In-App Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={evt.isMandatory ? true : isInAppChecked}
                          disabled={evt.isMandatory}
                          onChange={() => handleEventChannelToggle(evt.key, 'in_app', evt.isMandatory)}
                          className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700 focus:ring-emerald-500 cursor-pointer disabled:opacity-60"
                        />
                      </td>

                      {/* Email Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={evt.isMandatory ? true : isEmailChecked}
                          disabled={evt.isMandatory}
                          onChange={() => handleEventChannelToggle(evt.key, 'email', evt.isMandatory)}
                          className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700 focus:ring-emerald-500 cursor-pointer disabled:opacity-60"
                        />
                      </td>

                      {/* Push Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isPushChecked}
                          onChange={() => handleEventChannelToggle(evt.key, 'push', false)}
                          className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>

                      {/* WhatsApp Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isWhatsappChecked}
                          onChange={() => handleEventChannelToggle(evt.key, 'whatsapp', false)}
                          className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quiet Hours & Compliance Notice */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Institutional Compliance & Quiet Hours Protection
          </div>
          <p className="text-[11px] leading-relaxed">
            Non-urgent notifications (e.g. general announcements, new drive postings) are withheld between <strong>10:00 PM and 7:00 AM</strong> ({college?.timezone || 'Asia/Kolkata'} timezone) to prevent night disruptions. Critical updates (offers, immediate 1-hour interview alerts) bypass quiet hours to protect your placement opportunities.
          </p>
        </div>
      </div>
    </div>
  );
}
