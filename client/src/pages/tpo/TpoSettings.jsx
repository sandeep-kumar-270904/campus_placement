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
} from 'lucide-react';
import tpoService from '../../services/tpoService';

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

  // Notification templates
  const [templates, setTemplates] = useState({
    shortlistAlert:
      'Dear {student_name}, Congratulations! You have been shortlisted for {round_name} by {company_name}. Please check your calendar.',
    slotReleased:
      'Dear {student_name}, your interview slot for {company_name} is scheduled on {date} at {time}. Link/Room: {link}.',
    offerExtended:
      'Dear {student_name}, Congratulations! {company_name} has extended you an offer with CTC {ctc} LPA. Review in your dashboard.',
  });
  const [savingTemplates, setSavingTemplates] = useState(false);

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
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load placement settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const notifySuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
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
        /* Tab 4: Templates */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Default Notification Templates</h3>
              <p className="text-xs text-slate-400">
                Tokens: {'{student_name}'}, {'{company_name}'}, {'{round_name}'}, {'{date}'}, {'{time}'}, {'{ctc}'}
              </p>
            </div>
            <button
              onClick={handleSaveTemplates}
              disabled={savingTemplates}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
            >
              <Save className="w-3.5 h-3.5 stroke-[2.5]" />
              {savingTemplates ? 'Saving...' : 'Save Templates'}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Shortlist & Round Progression Alert
              </label>
              <textarea
                rows="2"
                value={templates.shortlistAlert}
                onChange={(e) => setTemplates({ ...templates, shortlistAlert: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Interview Slot Scheduled Notice
              </label>
              <textarea
                rows="2"
                value={templates.slotReleased}
                onChange={(e) => setTemplates({ ...templates, slotReleased: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Formal Offer Extended Notification
              </label>
              <textarea
                rows="2"
                value={templates.offerExtended}
                onChange={(e) => setTemplates({ ...templates, offerExtended: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
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
