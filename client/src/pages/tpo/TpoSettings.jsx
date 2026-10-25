import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Layers,
  Users,
  Bell,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Calendar,
  Lock,
  Mail,
  UserCheck,
  Send,
  Eye,
  Radio,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import tpoService from '../../services/tpoService';
import notificationService from '../../services/notificationService';

const TEMPLATE_EVENTS = [
  { key: 'drive.published', label: 'New Placement Drive' },
  { key: 'drive.deadline_24h', label: 'Drive Deadline (24 Hours)' },
  { key: 'drive.deadline_3h', label: 'Drive Deadline (3 Hours)' },
  { key: 'application.status_changed', label: 'Application Stage Changed' },
  { key: 'interview.scheduled', label: 'Interview Scheduled' },
  { key: 'interview.reminder_1h', label: 'Interview Reminder (1 Hour)' },
  { key: 'offer.extended', label: 'Formal Offer Extended' },
  { key: 'verification.approved', label: 'Verification Approved' },
  { key: 'verification.rejected', label: 'Verification Correction Required' },
  { key: 'announcement.sent', label: 'TPO Notice / Broadcast' },
];

const SAMPLE_VARS = {
  studentName: 'Aarav Sharma',
  company: 'Google Cloud',
  role: 'Software Development Engineer',
  ctc: '28.5',
  deadline: 'Nov 30, 2026',
  date: 'Nov 12, 2026',
  time: '10:30 AM',
  roundName: 'Technical Interview',
  status: 'Technical Round 1',
  linkOrRoom: 'Lab 402 / Meet: meet.google.com/xyz',
  link: 'https://placeearly.edu/student/dashboard',
  verificationCode: 'SEAL-2026-X9B2',
  reason: '10th Marksheet upload is blurry.',
  title: 'Annual Placement Mock Test',
  body: 'The mock test portal is now open for registered students.',
  bodySnippet: 'The mock test portal is now open for registered students.',
};

const TOKEN_PILLS = [
  '{{studentName}}',
  '{{company}}',
  '{{role}}',
  '{{ctc}}',
  '{{deadline}}',
  '{{date}}',
  '{{time}}',
  '{{roundName}}',
  '{{status}}',
  '{{linkOrRoom}}',
  '{{link}}',
  '{{verificationCode}}',
  '{{reason}}',
];

export default function TpoSettings() {
  const [activeTab, setActiveTab] = useState('policies'); // 'policies' | 'branches' | 'team' | 'templates'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // College & Settings State
  const [college, setCollege] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  // Policies form state
  const [policies, setPolicies] = useState({
    maxActiveBacklogsAllowed: 0,
    allowMultipleOffers: true,
    dreamTierThreshold: 15.0,
    minPassCgpa: 4.0,
    currentYear: '2025-2026',
    startDate: '2025-07-01',
    endDate: '2026-06-30',
    rules: [],
  });
  const [newRuleText, setNewRuleText] = useState('');
  const [savingPolicies, setSavingPolicies] = useState(false);

  // Branches form state
  const [branches, setBranches] = useState([]);
  const [newBranchInput, setNewBranchInput] = useState('');
  const [savingBranches, setSavingBranches] = useState(false);

  // Team Member Modal & Form
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamForm, setTeamForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'coordinator',
    password: '',
  });
  const [savingMember, setSavingMember] = useState(false);

  // Notification Template Studio State
  const [allTemplates, setAllTemplates] = useState({});
  const [selectedEvent, setSelectedEvent] = useState('drive.published');
  const [selectedChannel, setSelectedChannel] = useState('email');
  const [templateForm, setTemplateForm] = useState({
    title: '',
    subject: '',
    body: '',
    bodyHtml: '',
    bodyText: '',
    deepLink: '',
  });
  const [savingTemplates, setSavingTemplates] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testSendMsg, setTestSendMsg] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await tpoService.getSettings();
      if (res.college) {
        setCollege(res.college);
        setPolicies({
          maxActiveBacklogsAllowed: res.college.policies?.maxActiveBacklogsAllowed || 0,
          allowMultipleOffers: res.college.policies?.allowMultipleOffers ?? true,
          dreamTierThreshold: res.college.policies?.dreamTierThreshold || 15.0,
          minPassCgpa: res.college.gradingSystem?.minPassCgpa || 4.0,
          currentYear: res.college.academicYearConfig?.currentYear || '2025-2026',
          startDate: res.college.academicYearConfig?.placementSeason?.startDate
            ? new Date(res.college.academicYearConfig.placementSeason.startDate)
                .toISOString()
                .split('T')[0]
            : '2025-07-01',
          endDate: res.college.academicYearConfig?.placementSeason?.endDate
            ? new Date(res.college.academicYearConfig.placementSeason.endDate)
                .toISOString()
                .split('T')[0]
            : '2026-06-30',
          rules: res.college.policies?.rules || [
            'Students with > 0 active backlogs are not eligible for campus drives.',
            'A candidate placed in a regular tier company can only apply for dream tier drives (> 15 LPA).',
            'Candidate no-show in scheduled interview results in 1-drive debarment.',
          ],
        });
        setBranches(res.college.branches || []);
      }
      setTeamMembers(res.teamMembers || []);

      try {
        const tplRes = await notificationService.getTemplates();
        if (tplRes?.templates) {
          setAllTemplates(tplRes.templates);
        }
      } catch (tErr) {
        console.error('Failed to load notification templates:', tErr);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load placement settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const eventTpl = allTemplates[selectedEvent] || {};
    const channelTpl = eventTpl[selectedChannel] || {};
    setTemplateForm({
      title: channelTpl.title || channelTpl.subject || '',
      subject: channelTpl.subject || channelTpl.title || '',
      body: channelTpl.body || channelTpl.bodyText || '',
      bodyHtml: channelTpl.bodyHtml || channelTpl.body || '',
      bodyText: channelTpl.bodyText || channelTpl.body || '',
      deepLink: channelTpl.deepLink || '',
    });
    setTestSendMsg('');
  }, [selectedEvent, selectedChannel, allTemplates]);

  const notifySuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleInsertToken = (token) => {
    if (selectedChannel === 'email') {
      setTemplateForm((prev) => ({
        ...prev,
        bodyHtml: (prev.bodyHtml || '') + token,
      }));
    } else {
      setTemplateForm((prev) => ({
        ...prev,
        body: (prev.body || '') + token,
      }));
    }
  };

  const handleSaveCurrentTemplate = async () => {
    setSavingTemplates(true);
    try {
      const channelPayload = {};
      if (selectedChannel === 'email') {
        channelPayload.email = {
          subject: templateForm.subject || templateForm.title,
          bodyHtml: templateForm.bodyHtml,
          bodyText: templateForm.bodyText || templateForm.body,
        };
      } else if (selectedChannel === 'in_app') {
        channelPayload.in_app = {
          title: templateForm.title || templateForm.subject,
          body: templateForm.body,
          deepLink: templateForm.deepLink,
        };
      } else if (selectedChannel === 'push') {
        channelPayload.push = {
          title: templateForm.title || templateForm.subject,
          body: templateForm.body,
          deepLink: templateForm.deepLink,
        };
      } else if (selectedChannel === 'whatsapp') {
        channelPayload.whatsapp = {
          templateName: selectedEvent.replace(/\./g, '_'),
          body: templateForm.body,
        };
      }

      await notificationService.updateTemplate(selectedEvent, channelPayload);
      setAllTemplates((prev) => ({
        ...prev,
        [selectedEvent]: {
          ...(prev[selectedEvent] || {}),
          ...channelPayload,
        },
      }));
      notifySuccess(`Template saved for ${selectedEvent} (${selectedChannel})!`);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to save template.');
    } finally {
      setSavingTemplates(false);
    }
  };

  const handleTestSend = async () => {
    setTestSending(true);
    setTestSendMsg('');
    try {
      const res = await notificationService.testSendNotification(selectedChannel, selectedEvent);
      setTestSendMsg(`✅ ${res?.message || 'Test notification delivered to your registered contact!'}`);
    } catch (err) {
      setTestSendMsg(`❌ ${err.response?.data?.error?.message || 'Test send failed.'}`);
    } finally {
      setTestSending(false);
    }
  };

  const renderInterpolatedPreview = (text) => {
    if (!text) return '';
    return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
      return SAMPLE_VARS[key] !== undefined ? SAMPLE_VARS[key] : `[${key}]`;
    });
  };

  const handleSavePolicies = async (e) => {
    e.preventDefault();
    try {
      setSavingPolicies(true);
      await tpoService.updatePolicies({
        maxActiveBacklogsAllowed: policies.maxActiveBacklogsAllowed,
        allowMultipleOffers: policies.allowMultipleOffers,
        dreamTierThreshold: policies.dreamTierThreshold,
        minPassCgpa: policies.minPassCgpa,
        rules: policies.rules,
        academicYearConfig: {
          currentYear: policies.currentYear,
          placementSeason: {
            startDate: new Date(policies.startDate),
            endDate: new Date(policies.endDate),
          },
        },
      });
      notifySuccess('Placement policies and operating rules updated successfully.');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update policies.');
    } finally {
      setSavingPolicies(false);
    }
  };

  const handleAddRule = () => {
    if (!newRuleText.trim()) return;
    setPolicies({
      ...policies,
      rules: [...policies.rules, newRuleText.trim()],
    });
    setNewRuleText('');
  };

  const handleRemoveRule = (index) => {
    setPolicies({
      ...policies,
      rules: policies.rules.filter((_, i) => i !== index),
    });
  };

  const handleSaveBranches = async () => {
    try {
      setSavingBranches(true);
      await tpoService.updateBranches(branches);
      notifySuccess('Department branches directory saved.');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update branches.');
    } finally {
      setSavingBranches(false);
    }
  };

  const handleAddBranch = () => {
    if (!newBranchInput.trim()) return;
    if (branches.includes(newBranchInput.trim())) {
      alert('Branch already exists.');
      return;
    }
    setBranches([...branches, newBranchInput.trim()]);
    setNewBranchInput('');
  };

  const handleRemoveBranch = (branchToRemove) => {
    setBranches(branches.filter((b) => b !== branchToRemove));
  };

  const handleAddTeamMember = async (e) => {
    e.preventDefault();
    try {
      setSavingMember(true);
      const res = await tpoService.addTeamMember(teamForm);
      setShowTeamModal(false);
      setTeamForm({
        firstName: '',
        lastName: '',
        email: '',
        role: 'coordinator',
        password: '',
      });
      notifySuccess(`Staff member ${res.member?.firstName} added to placement team.`);
      fetchSettings();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to add team member.');
    } finally {
      setSavingMember(false);
    }
  };

  const handleSaveTemplates = async () => {
    try {
      setSavingTemplates(true);
      await tpoService.updateTemplates(templates);
      notifySuccess('Notification templates updated successfully.');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update templates.');
    } finally {
      setSavingTemplates(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Institutional Administration
            </span>
            <span className="text-xs text-slate-400">{college?.name || 'College OS'}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Placement Policies & Operations
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure placement thresholds, backlog allowances, dream tier limits, department registries, and staff permissions.
          </p>
        </div>

        {college?.code && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 self-start md:self-auto">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
              College Code
            </span>
            <span className="text-sm font-mono font-bold text-emerald-400">{college.code}</span>
          </div>
        )}
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3 text-emerald-300 text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('policies')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'policies'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          Placement Policies & Season
        </button>

        <a
          href="/tpo/settings/policies"
          className="pb-3 text-sm font-bold border-b-2 border-transparent text-slate-400 hover:text-emerald-400 transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Policy Engine & Governance</span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-mono">
            New
          </span>
        </a>

        <button
          onClick={() => setActiveTab('branches')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'branches'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Engineering Branches ({branches.length})
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'team'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Placement Staff & Coordinators ({teamMembers.length})
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'templates'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          Notification Templates
        </button>
      </div>

      {/* Main Tab Panels */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading placement configurations...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center text-rose-300">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <p className="font-semibold text-sm mb-3">{error}</p>
          <button
            onClick={fetchSettings}
            className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : activeTab === 'policies' ? (
        /* Tab 1: Policies Form */
        <form onSubmit={handleSavePolicies} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Eligibility Thresholds & Dream Policies
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Max Active Backlogs Allowed
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={policies.maxActiveBacklogsAllowed}
                  onChange={(e) =>
                    setPolicies({
                      ...policies,
                      maxActiveBacklogsAllowed: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  0 = Strict zero backlog policy across campus drives.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Dream Tier Threshold (LPA)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={policies.dreamTierThreshold}
                  onChange={(e) =>
                    setPolicies({
                      ...policies,
                      dreamTierThreshold: parseFloat(e.target.value),
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Offers above this CTC are classified as Dream tier.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Minimum Passing CGPA
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={policies.minPassCgpa}
                  onChange={(e) =>
                    setPolicies({
                      ...policies,
                      minPassCgpa: parseFloat(e.target.value),
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Baseline institutional grade cutoff.
                </span>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policies.allowMultipleOffers}
                  onChange={(e) =>
                    setPolicies({ ...policies, allowMultipleOffers: e.target.checked })
                  }
                  className="w-5 h-5 rounded text-emerald-500 bg-slate-800 border-slate-700"
                />
                <div>
                  <span className="text-sm font-bold text-white block">
                    Allow Multiple Offers (Dream / Upgraded Package)
                  </span>
                  <span className="text-xs text-slate-400">
                    If enabled, placed students may apply for drives offering CTC higher than their current offer or above the Dream Tier threshold.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Placement Season Config */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Placement Season & Academic Year
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Active Placement Year
                </label>
                <input
                  type="text"
                  value={policies.currentYear}
                  onChange={(e) => setPolicies({ ...policies, currentYear: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Season Start Date
                </label>
                <input
                  type="date"
                  value={policies.startDate}
                  onChange={(e) => setPolicies({ ...policies, startDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Season End Date
                </label>
                <input
                  type="date"
                  value={policies.endDate}
                  onChange={(e) => setPolicies({ ...policies, endDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Code of Conduct / Placement Rules List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Student Placement Code of Conduct
            </h3>

            <div className="space-y-2">
              {policies.rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs text-slate-200 gap-3"
                >
                  <span className="flex-1">
                    <strong className="text-emerald-400 mr-2">Rule {idx + 1}:</strong>
                    {rule}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Remove Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Enter new placement policy rule or debarment clause..."
                value={newRuleText}
                onChange={(e) => setNewRuleText(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddRule}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
              >
                + Add Rule
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingPolicies}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              {savingPolicies ? 'Saving Policies...' : 'Save Placement Policies'}
            </button>
          </div>
        </form>
      ) : activeTab === 'branches' ? (
        /* Tab 2: Branches */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Engineering Disciplines Registry</h3>
              <p className="text-xs text-slate-400">
                Branches enabled for student profiles, drive eligibility rules, and department analytics
              </p>
            </div>
            <button
              onClick={handleSaveBranches}
              disabled={savingBranches}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
            >
              <Save className="w-3.5 h-3.5 stroke-[2.5]" />
              {savingBranches ? 'Saving...' : 'Save Branches'}
            </button>
          </div>

          {/* Add branch row */}
          <div className="flex items-center gap-2 max-w-lg">
            <input
              type="text"
              placeholder="e.g. Artificial Intelligence & Machine Learning"
              value={newBranchInput}
              onChange={(e) => setNewBranchInput(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleAddBranch}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
            >
              + Add Branch
            </button>
          </div>

          {/* Current branches chip roster */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {branches.map((b, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs text-white"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-semibold">{b}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveBranch(b)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                  title="Remove Branch"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'team' ? (
        /* Tab 3: Team Staff */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Placement Officers & Coordinators</h3>
              <p className="text-xs text-slate-400">
                Staff accounts authorized to verify records, schedule rounds, and extend offers
              </p>
            </div>
            <button
              onClick={() => setShowTeamModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add Staff Member
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Staff Member</th>
                  <th className="px-5 py-3">Email Address</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Member Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {teamMembers.map((member) => (
                  <tr key={member._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-white flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[11px]">
                        {member.firstName?.[0] || 'T'}
                      </div>
                      {member.firstName} {member.lastName}
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">{member.email}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Tab 4: Templates Studio */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Notification Template Studio
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                  Multi-Channel
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize messaging templates across email, in-app feed, web push, and WhatsApp.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestSend}
                disabled={testSending}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-blue-400" />
                {testSending ? 'Sending...' : 'Test Send to Self'}
              </button>

              <button
                type="button"
                onClick={handleSaveCurrentTemplate}
                disabled={savingTemplates}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/10 transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 stroke-[2.5]" />
                {savingTemplates ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>

          {/* Test Send Feedback Banner */}
          {testSendMsg && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-2 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              {testSendMsg}
            </div>
          )}

          {/* Event Selector & Channel Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Select Domain Event
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
              >
                {TEMPLATE_EVENTS.map((evt) => (
                  <option key={evt.key} value={evt.key}>
                    {evt.label} ({evt.key})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Select Channel
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: 'email', label: 'Email', icon: Mail },
                  { key: 'in_app', label: 'In-App', icon: Bell },
                  { key: 'push', label: 'Push', icon: Radio },
                  { key: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                ].map((ch) => {
                  const Icon = ch.icon;
                  const isSelected = selectedChannel === ch.key;
                  return (
                    <button
                      key={ch.key}
                      type="button"
                      onClick={() => setSelectedChannel(ch.key)}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-[11px]">{ch.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Clickable Token Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Insert Variable Tokens (Click to add)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TOKEN_PILLS.map((token) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => handleInsertToken(token)}
                  className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-400 font-mono text-[11px] transition cursor-pointer"
                >
                  {token}
                </button>
              ))}
            </div>
          </div>

          {/* Two-Column Editor & Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Editor Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-emerald-400" />
                Template Source Editor
              </h4>

              {selectedChannel === 'email' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Subject Line
                    </label>
                    <input
                      type="text"
                      value={templateForm.subject}
                      onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                      placeholder="e.g. New Drive Announcement: {{company}}"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Body (HTML Supported)
                    </label>
                    <textarea
                      rows="7"
                      value={templateForm.bodyHtml}
                      onChange={(e) => setTemplateForm({ ...templateForm, bodyHtml: e.target.value })}
                      placeholder="<p>Dear {{studentName}},</p><p>{{company}} is recruiting for {{role}}...</p>"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Alert Title
                    </label>
                    <input
                      type="text"
                      value={templateForm.title}
                      onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                      placeholder="e.g. Interview Scheduled: {{company}}"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Message Content
                    </label>
                    <textarea
                      rows="6"
                      value={templateForm.body}
                      onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                      placeholder="Your interview is scheduled on {{date}} at {{time}}."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed"
                    />
                  </div>
                  {selectedChannel !== 'whatsapp' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Deep Link URL
                      </label>
                      <input
                        type="text"
                        value={templateForm.deepLink}
                        onChange={(e) => setTemplateForm({ ...templateForm, deepLink: e.target.value })}
                        placeholder="/student/dashboard"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Live Preview Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                Live Student Preview (Simulated Data)
              </h4>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 min-h-[220px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3 text-[11px] text-slate-400">
                    <span className="font-bold text-slate-300 uppercase">
                      Channel: {selectedChannel.toUpperCase()}
                    </span>
                    <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      To: Aarav Sharma (student@college.edu)
                    </span>
                  </div>

                  {selectedChannel === 'email' ? (
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-white">
                        Subject: {renderInterpolatedPreview(templateForm.subject) || '(No Subject)'}
                      </div>
                      <div
                        className="text-xs text-slate-300 leading-relaxed space-y-2 border-t border-slate-800/60 pt-3"
                        dangerouslySetInnerHTML={{
                          __html: renderInterpolatedPreview(templateForm.bodyHtml) || '<p class="text-slate-600 italic">No email body specified.</p>',
                        }}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-white">
                        {renderInterpolatedPreview(templateForm.title) || '(No Title)'}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {renderInterpolatedPreview(templateForm.body) || 'No message content specified.'}
                      </p>
                      {templateForm.deepLink && (
                        <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-emerald-400">
                          Target: {templateForm.deepLink}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800/60 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Simulated recipient: Aarav Sharma (CSE 2026)</span>
                  <span className="text-emerald-500 font-semibold">Live Preview</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Member Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Add Staff Member</h3>
                <p className="text-xs text-slate-400">Invite placement coordinator or TPO officer</p>
              </div>
              <button
                onClick={() => setShowTeamModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTeamMember} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={teamForm.firstName}
                    onChange={(e) => setTeamForm({ ...teamForm, firstName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={teamForm.lastName}
                    onChange={(e) => setTeamForm({ ...teamForm, lastName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="officer@college.edu"
                  value={teamForm.email}
                  onChange={(e) => setTeamForm({ ...teamForm, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Role
                </label>
                <select
                  value={teamForm.role}
                  onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                >
                  <option value="coordinator">Department Coordinator</option>
                  <option value="tpo">TPO Officer</option>
                  <option value="admin">College Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Temporary Password (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Defaults to PlaceEarly@2026"
                  value={teamForm.password}
                  onChange={(e) => setTeamForm({ ...teamForm, password: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMember}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  {savingMember ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
