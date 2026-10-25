import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Play,
  Users,
  Award,
  Calendar,
  Lock,
  Unlock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Download,
  Filter,
  FileText,
  Search,
  ExternalLink,
  Sparkles,
  RefreshCw,
  HelpCircle,
  X,
  ChevronRight,
} from 'lucide-react';
import policyService from '../../services/policyService';
import tpoService from '../../services/tpoService';

export default function TpoPlacementPolicies() {
  const [activeTab, setActiveTab] = useState('builder'); // 'builder' | 'preview' | 'overrides' | 'exceptions' | 'fairness'
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Policy Form State
  const [policy, setPolicy] = useState({
    oneStudentOneOffer: { enabled: false, allowHold: false, effectiveFrom: '', effectiveTo: '' },
    dreamCap: { enabled: false, maxDreamOffers: 1, dreamThresholdCtc: 15.0, allowUnlimitedCore: true },
    tierEligibility: {
      enabled: false,
      upgradeOnly: true,
      tiers: [
        { name: 'Standard', minCtc: 0, maxCtc: 6, order: 1 },
        { name: 'Core', minCtc: 6, maxCtc: 10, order: 2 },
        { name: 'Dream', minCtc: 10, maxCtc: 20, order: 3 },
        { name: 'Super Dream', minCtc: 20, maxCtc: null, order: 4 },
      ],
    },
    priorityUnplaced: { enabled: false, blockPlacedStudents: true },
    maxConcurrentApplications: { enabled: false, maxActive: 5 },
    blackoutDates: [],
  });
  const [savingPolicy, setSavingPolicy] = useState(false);

  // Blackout Modal
  const [showBlackoutModal, setShowBlackoutModal] = useState(false);
  const [newBlackout, setNewBlackout] = useState({
    title: '',
    startDate: '',
    endDate: '',
    reason: '',
    appliesToAllDrives: true,
  });

  // Drives List (for simulation & override selection)
  const [drives, setDrives] = useState([]);
  const [selectedSimDriveId, setSelectedSimDriveId] = useState('');
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  // Overrides State
  const [overrides, setOverrides] = useState([]);
  const [loadingOverrides, setLoadingOverrides] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    studentId: '',
    opportunityId: '',
    policyType: 'all',
    mandatoryReason: '',
    expiresAt: '',
  });
  const [savingOverride, setSavingOverride] = useState(false);

  // Exception Appeals State
  const [exceptions, setExceptions] = useState([]);
  const [loadingExceptions, setLoadingExceptions] = useState(false);
  const [selectedException, setSelectedException] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewDecision, setReviewDecision] = useState('Approved');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [reviewingException, setReviewingException] = useState(false);

  // Fairness Report State
  const [fairnessReport, setFairnessReport] = useState(null);
  const [loadingFairness, setLoadingFairness] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load Initial Policy and Drives
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [polRes, drivesRes] = await Promise.all([
        policyService.getPolicy(),
        tpoService.getDrives({ limit: 100, status: 'all' }),
      ]);

      if (polRes.policy) {
        setPolicy({
          ...polRes.policy,
          oneStudentOneOffer: polRes.policy.oneStudentOneOffer || { enabled: false },
          dreamCap: polRes.policy.dreamCap || { enabled: false, maxDreamOffers: 1, dreamThresholdCtc: 15.0, allowUnlimitedCore: true },
          tierEligibility: polRes.policy.tierEligibility || { enabled: false, upgradeOnly: true, tiers: [] },
          priorityUnplaced: polRes.policy.priorityUnplaced || { enabled: false, blockPlacedStudents: true },
          maxConcurrentApplications: polRes.policy.maxConcurrentApplications || { enabled: false, maxActive: 5 },
          blackoutDates: polRes.policy.blackoutDates || [],
        });
      }

      const activeDrives = drivesRes.drives || [];
      setDrives(activeDrives);
      if (activeDrives.length > 0 && !selectedSimDriveId) {
        setSelectedSimDriveId(activeDrives[0]._id || activeDrives[0].id);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load placement policy configuration', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedSimDriveId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load Overrides
  const loadOverrides = async () => {
    try {
      setLoadingOverrides(true);
      const res = await policyService.getOverrides();
      setOverrides(res.overrides || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load policy overrides', 'error');
    } finally {
      setLoadingOverrides(false);
    }
  };

  // Load Exceptions
  const loadExceptions = async () => {
    try {
      setLoadingExceptions(true);
      const res = await policyService.getExceptions();
      setExceptions(res.exceptions || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load exception appeals', 'error');
    } finally {
      setLoadingExceptions(false);
    }
  };

  // Load Fairness Report
  const loadFairnessReport = async () => {
    try {
      setLoadingFairness(true);
      const res = await policyService.getFairnessReport();
      setFairnessReport(res.report || null);
    } catch (err) {
      console.error(err);
      showToast('Failed to load fairness & diversity report', 'error');
    } finally {
      setLoadingFairness(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overrides') loadOverrides();
    if (activeTab === 'exceptions') loadExceptions();
    if (activeTab === 'fairness') loadFairnessReport();
  }, [activeTab]);

  // Save Policy Handler
  const handleSavePolicy = async () => {
    try {
      setSavingPolicy(true);
      await policyService.updatePolicy(policy);
      showToast('Placement policies updated and applied successfully');
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.error?.message || 'Failed to update policy', 'error');
    } finally {
      setSavingPolicy(false);
    }
  };

  // Add Blackout Date
  const handleAddBlackout = () => {
    if (!newBlackout.title || !newBlackout.startDate || !newBlackout.endDate) {
      showToast('Please fill in blackout title, start date, and end date', 'error');
      return;
    }
    setPolicy((prev) => ({
      ...prev,
      blackoutDates: [...(prev.blackoutDates || []), { ...newBlackout, _id: String(Date.now()) }],
    }));
    setShowBlackoutModal(false);
    setNewBlackout({ title: '', startDate: '', endDate: '', reason: '', appliesToAllDrives: true });
    showToast('Blackout period added to draft. Click Save Policies to persist.');
  };

  const handleRemoveBlackout = (index) => {
    setPolicy((prev) => ({
      ...prev,
      blackoutDates: prev.blackoutDates.filter((_, i) => i !== index),
    }));
  };

  // Run Simulation Preview
  const handleRunSimulation = async () => {
    if (!selectedSimDriveId) {
      showToast('Please select a placement drive to simulate', 'error');
      return;
    }
    try {
      setSimulating(true);
      const res = await policyService.previewSimulation(selectedSimDriveId, policy);
      setSimulationResult(res.simulation);
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.error?.message || 'Simulation failed', 'error');
    } finally {
      setSimulating(false);
    }
  };

  // Grant Override Handler
  const handleGrantOverride = async (e) => {
    e.preventDefault();
    if (!overrideForm.studentId || !overrideForm.mandatoryReason) {
      showToast('Student ID and mandatory justification are required', 'error');
      return;
    }
    try {
      setSavingOverride(true);
      await policyService.grantOverride({
        studentId: overrideForm.studentId,
        opportunityId: overrideForm.opportunityId || null,
        policyType: overrideForm.policyType,
        mandatoryReason: overrideForm.mandatoryReason,
        expiresAt: overrideForm.expiresAt || null,
      });
      showToast('Policy override granted and audit-logged successfully');
      setShowOverrideModal(false);
      setOverrideForm({ studentId: '', opportunityId: '', policyType: 'all', mandatoryReason: '', expiresAt: '' });
      loadOverrides();
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.error?.message || 'Failed to grant override', 'error');
    } finally {
      setSavingOverride(false);
    }
  };

  // Revoke Override Handler
  const handleRevokeOverride = async (overrideId) => {
    const reason = window.prompt('Enter reason for revoking this override:');
    if (reason === null) return;
    try {
      await policyService.revokeOverride(overrideId, reason || 'Revoked by TPO administrator.');
      showToast('Override revoked successfully');
      loadOverrides();
    } catch (err) {
      showToast('Failed to revoke override', 'error');
    }
  };

  // Review Exception Handler
  const handleReviewExceptionSubmit = async () => {
    if (!selectedException) return;
    try {
      setReviewingException(true);
      await policyService.reviewException(selectedException._id, {
        status: reviewDecision,
        reviewRemarks: reviewRemarks || `${reviewDecision} by TPO`,
        mandatoryOverrideReason: reviewRemarks || `Approved exception appeal for ${selectedException.policyType}`,
      });
      showToast(`Appeal ${reviewDecision.toLowerCase()} successfully`);
      setReviewModalOpen(false);
      setSelectedException(null);
      setReviewRemarks('');
      loadExceptions();
    } catch (err) {
      showToast('Failed to update appeal status', 'error');
    } finally {
      setReviewingException(false);
    }
  };

  // Synthesize Plain-Language Narrative of Active Rules
  const renderPlainLanguageNarrative = () => {
    const activeRules = [];
    if (policy.oneStudentOneOffer?.enabled) {
      activeRules.push('One-student-one-offer is strictly enforced (placed candidates cannot apply to subsequent drives).');
    } else {
      activeRules.push('Multiple placement offers are permitted across recruiting companies.');
    }

    if (policy.dreamCap?.enabled) {
      activeRules.push(
        `Dream tier offers (≥ ${policy.dreamCap.dreamThresholdCtc || 15} LPA) are capped at ${policy.dreamCap.maxDreamOffers || 1} per candidate${
          policy.dreamCap.allowUnlimitedCore ? ', with unlimited Core applications allowed' : ''
        }.`
      );
    }

    if (policy.tierEligibility?.enabled) {
      activeRules.push('Tier-based progression is enforced (candidates may only apply to opportunities with CTC higher than their current placed tier).');
    }

    if (policy.priorityUnplaced?.enabled) {
      activeRules.push('Priority for unplaced students is active (drives strictly prioritize unplaced candidates).');
    }

    if (policy.maxConcurrentApplications?.enabled) {
      activeRules.push(`Candidates are capped at a maximum of ${policy.maxConcurrentApplications.maxActive || 5} active in-progress applications.`);
    }

    if (policy.blackoutDates && policy.blackoutDates.length > 0) {
      activeRules.push(`${policy.blackoutDates.length} institutional blackout window(s) are configured to pause application submissions.`);
    }

    return activeRules.join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-8 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mr-2" />
        <span>Loading institutional placement policy engine...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full p-4 sm:p-6 animate-fadeIn">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 ${
            toast.type === 'error'
              ? 'bg-red-950 border-red-700 text-red-200'
              : 'bg-emerald-950 border-emerald-700 text-emerald-200'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-400" />
              <span>Placement Policy Engine & Governance</span>
            </h1>
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              Enforced
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Per-college rule builder, dream caps, tier progression, live drive impact simulation, audited TPO overrides, and fairness metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'builder' && (
            <button
              onClick={handleSavePolicy}
              disabled={savingPolicy}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>{savingPolicy ? 'Saving...' : 'Save Policies'}</span>
            </button>
          )}

          {activeTab === 'overrides' && (
            <button
              onClick={() => setShowOverrideModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Grant Policy Override</span>
            </button>
          )}

          {activeTab === 'fairness' && (
            <button
              onClick={() => policyService.downloadFairnessReportCsv()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Fairness CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'builder', label: 'Rule Builder', icon: Sliders },
          { id: 'preview', label: 'Drive Impact Preview', icon: Play },
          { id: 'overrides', label: 'Audited Overrides', icon: ShieldCheck, badge: overrides.length },
          { id: 'exceptions', label: 'Student Appeals Queue', icon: FileText, badge: exceptions.filter((e) => e.status === 'Pending').length },
          { id: 'fairness', label: 'Fairness & Diversity Report', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-850 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: RULE BUILDER */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          {/* Plain-Language Narrative Summary */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900 to-indigo-950/30 border border-emerald-500/25 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Institutional Policy in Plain English</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
              {renderPlainLanguageNarrative()}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. One-Student-One-Offer Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>One-Student-One-Offer Policy</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Once a student accepts a placement offer, they are barred from applying to subsequent campus drives.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.oneStudentOneOffer?.enabled}
                    onChange={(e) =>
                      setPolicy((p) => ({
                        ...p,
                        oneStudentOneOffer: { ...p.oneStudentOneOffer, enabled: e.target.checked },
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {policy.oneStudentOneOffer?.enabled && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policy.oneStudentOneOffer?.allowHold}
                      onChange={(e) =>
                        setPolicy((p) => ({
                          ...p,
                          oneStudentOneOffer: { ...p.oneStudentOneOffer, allowHold: e.target.checked },
                        }))
                      }
                      className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                    />
                    <span>Allow students on 'Hold' stage to apply until formal acceptance</span>
                  </label>
                </div>
              )}
            </div>

            {/* 2. Dream Cap Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Dream Tier Cap & Threshold</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Limit high-compensation offers while keeping Core/Standard drives accessible to placed students.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.dreamCap?.enabled}
                    onChange={(e) =>
                      setPolicy((p) => ({
                        ...p,
                        dreamCap: { ...p.dreamCap, enabled: e.target.checked },
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {policy.dreamCap?.enabled && (
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Max Dream Offers</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={policy.dreamCap?.maxDreamOffers || 1}
                        onChange={(e) =>
                          setPolicy((p) => ({
                            ...p,
                            dreamCap: { ...p.dreamCap, maxDreamOffers: parseInt(e.target.value, 10) || 1 },
                          }))
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Dream Threshold (LPA)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={policy.dreamCap?.dreamThresholdCtc || 15.0}
                        onChange={(e) =>
                          setPolicy((p) => ({
                            ...p,
                            dreamCap: { ...p.dreamCap, dreamThresholdCtc: parseFloat(e.target.value) || 15.0 },
                          }))
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={policy.dreamCap?.allowUnlimitedCore}
                      onChange={(e) =>
                        setPolicy((p) => ({
                          ...p,
                          dreamCap: { ...p.dreamCap, allowUnlimitedCore: e.target.checked },
                        }))
                      }
                      className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                    />
                    <span>Allow unlimited Core applications even after Dream cap is met</span>
                  </label>
                </div>
              )}
            </div>

            {/* 3. Tier-Based Eligibility Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <span>Tier-Based Eligibility Progression</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Standard \(\to\) Core \(\to\) Dream \(\to\) Super Dream. Placed students can only upgrade to higher tiers.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.tierEligibility?.enabled}
                    onChange={(e) =>
                      setPolicy((p) => ({
                        ...p,
                        tierEligibility: { ...p.tierEligibility, enabled: e.target.checked },
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {policy.tierEligibility?.enabled && (
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policy.tierEligibility?.upgradeOnly}
                      onChange={(e) =>
                        setPolicy((p) => ({
                          ...p,
                          tierEligibility: { ...p.tierEligibility, upgradeOnly: e.target.checked },
                        }))
                      }
                      className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                    />
                    <span>Strict Upgrade Only (cannot apply to equal or lower tier drives)</span>
                  </label>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Tier Thresholds:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <strong className="text-slate-200">Standard:</strong> 0 - 6 LPA
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <strong className="text-emerald-300">Core:</strong> 6 - 10 LPA
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <strong className="text-indigo-300">Dream:</strong> 10 - 20 LPA
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <strong className="text-purple-300">Super Dream:</strong> &gt; 20 LPA
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Priority for Unplaced & Max Concurrent Apps */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
              {/* Unplaced Priority */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-400" />
                    <span>Priority for Unplaced Candidates</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Strictly block placed candidates to give unplaced students first priority.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.priorityUnplaced?.enabled}
                    onChange={(e) =>
                      setPolicy((p) => ({
                        ...p,
                        priorityUnplaced: { ...p.priorityUnplaced, enabled: e.target.checked },
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Max Concurrent Applications */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-violet-400" />
                    <span>Max Concurrent Applications Cap</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Prevents candidate application flooding by capping simultaneous in-progress applications.
                  </p>
                  {policy.maxConcurrentApplications?.enabled && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-slate-300">Max Active:</span>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={policy.maxConcurrentApplications?.maxActive || 5}
                        onChange={(e) =>
                          setPolicy((p) => ({
                            ...p,
                            maxConcurrentApplications: {
                              ...p.maxConcurrentApplications,
                              maxActive: parseInt(e.target.value, 10) || 5,
                            },
                          }))
                        }
                        className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                  )}
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.maxConcurrentApplications?.enabled}
                    onChange={(e) =>
                      setPolicy((p) => ({
                        ...p,
                        maxConcurrentApplications: {
                          ...p.maxConcurrentApplications,
                          enabled: e.target.checked,
                        },
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 5. Institutional Blackout Dates Manager */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-rose-400" />
                  <span>Institutional Blackout Windows</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dates during exams, preparation leave, or holidays when drive applications are paused college-wide.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBlackoutModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Blackout Window</span>
              </button>
            </div>

            {policy.blackoutDates && policy.blackoutDates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {policy.blackoutDates.map((b, i) => (
                  <div
                    key={b._id || i}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-2"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{b.title}</h4>
                      <p className="text-[11px] text-rose-300 font-mono mt-0.5">
                        {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                      </p>
                      {b.reason && <p className="text-[11px] text-slate-400 mt-1">{b.reason}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveBlackout(i)}
                      className="p-1 text-slate-500 hover:text-red-400 transition"
                      title="Remove Blackout"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-950 rounded-xl border border-slate-850">
                No active blackout windows. Campus drive applications proceed without scheduled pauses.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DRIVE IMPACT PREVIEW SIMULATOR */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span>Live Drive Impact Simulation</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Simulate your placement policy configuration against any corporate drive to preview candidate blockage.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedSimDriveId}
                  onChange={(e) => setSelectedSimDriveId(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {drives.map((d) => (
                    <option key={d._id || d.id} value={d._id || d.id}>
                      {d.companyName} - {d.title} ({d.ctc?.fixed ? `${d.ctc.fixed} LPA` : d.salary || 'Drive'})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleRunSimulation}
                  disabled={simulating || !selectedSimDriveId}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
                  <span>{simulating ? 'Simulating...' : 'Run Simulation'}</span>
                </button>
              </div>
            </div>

            {simulationResult && (
              <div className="pt-4 border-t border-slate-800 space-y-5 animate-fadeIn">
                {/* Result Callout Banner */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-950 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                      Simulation Verdict
                    </span>
                    <h4 className="text-base font-extrabold text-white mt-0.5">
                      This policy would block{' '}
                      <span className="text-amber-400 underline font-black">
                        {simulationResult.totalBlockedByPolicy} candidates
                      </span>{' '}
                      from {simulationResult.drive.companyName} ({simulationResult.drive.tier} Tier)
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Out of {simulationResult.totalEligibleWithoutPolicy} academically eligible candidates,{' '}
                      <strong className="text-emerald-400">{simulationResult.totalEligibleWithPolicy}</strong> remain eligible to apply.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase block">Eligible Pool</span>
                      <span className="text-xl font-black text-emerald-400">
                        {simulationResult.totalEligibleWithPolicy}
                      </span>
                    </div>
                    <div className="text-right border-l border-slate-800 pl-3">
                      <span className="text-[10px] text-slate-500 uppercase block">Blocked Pool</span>
                      <span className="text-xl font-black text-amber-400">
                        {simulationResult.totalBlockedByPolicy}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Breakdown Chips */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Blocked Reasons Breakdown:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">One-Student-One-Offer</span>
                      <strong className="text-white text-sm">
                        {simulationResult.breakdown.oneStudentOneOffer}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Dream Tier Cap</span>
                      <strong className="text-white text-sm">{simulationResult.breakdown.dreamCap}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Tier Progression</span>
                      <strong className="text-white text-sm">
                        {simulationResult.breakdown.tierEligibility}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Priority for Unplaced</span>
                      <strong className="text-white text-sm">
                        {simulationResult.breakdown.priorityUnplaced}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Max Concurrent Apps</span>
                      <strong className="text-white text-sm">
                        {simulationResult.breakdown.maxConcurrentApplications}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Blackout Windows</span>
                      <strong className="text-white text-sm">
                        {simulationResult.breakdown.blackoutDates}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Sample Blocked Candidates Table */}
                {simulationResult.sampleBlocked?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Sample Blocked Students (Showing up to 15):
                    </span>
                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 text-[11px]">
                          <tr>
                            <th className="py-2.5 px-3">Roll No</th>
                            <th className="py-2.5 px-3">Name</th>
                            <th className="py-2.5 px-3">Branch</th>
                            <th className="py-2.5 px-2">CGPA</th>
                            <th className="py-2.5 px-3">Primary Policy Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                          {simulationResult.sampleBlocked.map((st, i) => (
                            <tr key={i} className="hover:bg-slate-850/50">
                              <td className="py-2 px-3 font-mono text-emerald-400 font-semibold">{st.rollNo}</td>
                              <td className="py-2 px-3 font-medium text-white">{st.name}</td>
                              <td className="py-2 px-3">{st.branch}</td>
                              <td className="py-2 px-2 font-mono">{st.cgpa}</td>
                              <td className="py-2 px-3 text-amber-300 text-[11px]">{st.primaryBlockingReason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AUDITED OVERRIDES */}
      {activeTab === 'overrides' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Active & historical exemptions granted by TPO staff with mandatory justification audit trail.
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              {overrides.length} total overrides recorded
            </span>
          </div>

          {loadingOverrides ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
              <span>Loading audit log of policy overrides...</span>
            </div>
          ) : overrides.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-3">Drive Scope</th>
                    <th className="py-3 px-3">Policy Bypassed</th>
                    <th className="py-3 px-4">Mandatory Justification</th>
                    <th className="py-3 px-3">Authorized By</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {overrides.map((ov) => (
                    <tr key={ov._id} className="hover:bg-slate-850/50">
                      <td className="py-3 px-4">
                        <strong className="text-white block">
                          {ov.studentId?.firstName} {ov.studentId?.lastName}
                        </strong>
                        <span className="text-[11px] font-mono text-slate-400">
                          {ov.studentRollNo || ov.studentId?.email}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium">
                        {ov.opportunityId ? (
                          <span className="text-indigo-300">
                            {ov.opportunityId.companyName} - {ov.opportunityId.title}
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-semibold">Global (All Drives)</span>
                        )}
                      </td>
                      <td className="py-3 px-3 capitalize font-mono text-[11px] text-slate-300">
                        {ov.policyType.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate text-[11px]" title={ov.mandatoryReason}>
                        "{ov.mandatoryReason}"
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {ov.approvedBy ? `${ov.approvedBy.firstName} ${ov.approvedBy.lastName}` : 'TPO'}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ov.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          {ov.isActive ? 'Active' : 'Revoked'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {ov.isActive && (
                          <button
                            type="button"
                            onClick={() => handleRevokeOverride(ov._id)}
                            className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 text-[11px] font-semibold transition cursor-pointer"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
              No policy overrides have been granted yet. All drives strictly follow institutional rules.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: STUDENT EXCEPTION APPEALS QUEUE */}
      {activeTab === 'exceptions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Student-submitted appeals for policy exceptions, complete with written justifications and supporting documents.
            </span>
          </div>

          {loadingExceptions ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
              <span>Loading student exception appeals...</span>
            </div>
          ) : exceptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exceptions.map((ex) => (
                <div
                  key={ex._id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {ex.studentId?.firstName} {ex.studentId?.lastName}
                        </h4>
                        <p className="text-[11px] font-mono text-slate-400">
                          {ex.studentRollNo || ex.studentId?.email} • {ex.studentBranch || 'Engineering'}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ex.status === 'Pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : ex.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {ex.status}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 block">
                        Drive & Policy Type:
                      </span>
                      <p className="font-semibold text-slate-200">
                        {ex.opportunityId?.companyName} - {ex.opportunityId?.title}
                      </p>
                      <span className="text-[10px] font-mono text-slate-400 block capitalize">
                        Target Policy: {ex.policyType.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                        Student Justification:
                      </span>
                      <p className="italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 text-slate-300">
                        "{ex.justification}"
                      </p>
                    </div>

                    {ex.documents && ex.documents.length > 0 && (
                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Attached Proof / Documents:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {ex.documents.map((doc, idx) => (
                            <a
                              key={idx}
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-indigo-300 border border-slate-700 text-[11px] font-medium transition"
                            >
                              <FileText className="w-3 h-3" />
                              <span className="truncate max-w-[140px]">{doc.name}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {ex.status === 'Pending' ? (
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedException(ex);
                          setReviewDecision('Rejected');
                          setReviewModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-400 border border-slate-700 text-xs font-semibold transition cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedException(ex);
                          setReviewDecision('Approved');
                          setReviewModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer"
                      >
                        Approve with Override
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>
                        Reviewed by {ex.reviewedBy ? `${ex.reviewedBy.firstName} ${ex.reviewedBy.lastName}` : 'TPO'}
                      </span>
                      {ex.reviewRemarks && <span className="italic truncate max-w-xs">"{ex.reviewRemarks}"</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
              No student exception appeals in the queue.
            </div>
          )}
        </div>
      )}

      {/* TAB 5: FAIRNESS & DIVERSITY REPORT */}
      {activeTab === 'fairness' && (
        <div className="space-y-6">
          {/* Privacy Notification Banner */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 text-indigo-400 mt-0.5" />
            <div className="text-xs text-indigo-200 space-y-1">
              <strong className="text-white block font-bold">
                Small-Cell Suppression & Differential Privacy Enforced (\(k\)-Anonymity)
              </strong>
              <p>
                To protect student identities and ensure demographic confidentiality, any cohort subgroup with fewer than
                5 registered students is masked as <code className="bg-indigo-900/60 px-1.5 py-0.5 rounded text-white">&lt;5</code>.
                Metrics for groups under 5 cannot be disaggregated.
              </p>
            </div>
          </div>

          {loadingFairness ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
              <span>Synthesizing demographic and equity placement statistics...</span>
            </div>
          ) : fairnessReport ? (
            <div className="space-y-6">
              {/* Top Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Total Registered Pool</span>
                  <div className="text-2xl font-black text-white mt-1">{fairnessReport.summary.totalRegistered}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Placed Candidates</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">{fairnessReport.summary.totalPlaced}</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Overall Placement Rate</span>
                  <div className="text-2xl font-black text-indigo-400 mt-1">
                    {fairnessReport.summary.overallPlacementRate}
                  </div>
                </div>
              </div>

              {/* 1. By Gender */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Outcomes by Gender</span>
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4">Gender Cohort</th>
                        <th className="py-2.5 px-3">Total Pool</th>
                        <th className="py-2.5 px-3">Placed Count</th>
                        <th className="py-2.5 px-3">Total Offers</th>
                        <th className="py-2.5 px-3">Placement Rate</th>
                        <th className="py-2.5 px-3">Average CTC</th>
                        <th className="py-2.5 px-3">Highest CTC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {fairnessReport.genderReport.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-850/40">
                          <td className="py-2.5 px-4 font-semibold text-white">{r.label}</td>
                          <td className="py-2.5 px-3">{r.totalStudents}</td>
                          <td className="py-2.5 px-3">{r.placedCount}</td>
                          <td className="py-2.5 px-3">{r.totalOffers}</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-400">{r.placementRate}</td>
                          <td className="py-2.5 px-3">{r.averageCtc}</td>
                          <td className="py-2.5 px-3">{r.highestCtc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. By Branch */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Outcomes by Academic Branch</span>
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4">Department / Branch</th>
                        <th className="py-2.5 px-3">Total Pool</th>
                        <th className="py-2.5 px-3">Placed Count</th>
                        <th className="py-2.5 px-3">Total Offers</th>
                        <th className="py-2.5 px-3">Placement Rate</th>
                        <th className="py-2.5 px-3">Average CTC</th>
                        <th className="py-2.5 px-3">Highest CTC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {fairnessReport.branchReport.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-850/40">
                          <td className="py-2.5 px-4 font-semibold text-white">{r.label}</td>
                          <td className="py-2.5 px-3">{r.totalStudents}</td>
                          <td className="py-2.5 px-3">{r.placedCount}</td>
                          <td className="py-2.5 px-3">{r.totalOffers}</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-400">{r.placementRate}</td>
                          <td className="py-2.5 px-3">{r.averageCtc}</td>
                          <td className="py-2.5 px-3">{r.highestCtc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. By Category */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Outcomes by Category / Reservation Quota</span>
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4">Category</th>
                        <th className="py-2.5 px-3">Total Pool</th>
                        <th className="py-2.5 px-3">Placed Count</th>
                        <th className="py-2.5 px-3">Total Offers</th>
                        <th className="py-2.5 px-3">Placement Rate</th>
                        <th className="py-2.5 px-3">Average CTC</th>
                        <th className="py-2.5 px-3">Highest CTC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {fairnessReport.categoryReport.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-850/40">
                          <td className="py-2.5 px-4 font-semibold text-white">{r.label}</td>
                          <td className="py-2.5 px-3">{r.totalStudents}</td>
                          <td className="py-2.5 px-3">{r.placedCount}</td>
                          <td className="py-2.5 px-3">{r.totalOffers}</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-400">{r.placementRate}</td>
                          <td className="py-2.5 px-3">{r.averageCtc}</td>
                          <td className="py-2.5 px-3">{r.highestCtc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
              No placement outcomes data available yet to generate fairness aggregates.
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD BLACKOUT DATE */}
      {showBlackoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-400" />
                <span>Add Institutional Blackout Window</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowBlackoutModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Window Title *</label>
                <input
                  type="text"
                  placeholder="e.g. End-Semester Theory Examinations"
                  value={newBlackout.title}
                  onChange={(e) => setNewBlackout({ ...newBlackout, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={newBlackout.startDate}
                    onChange={(e) => setNewBlackout({ ...newBlackout, startDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">End Date *</label>
                  <input
                    type="date"
                    value={newBlackout.endDate}
                    onChange={(e) => setNewBlackout({ ...newBlackout, endDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Reason / Student Note</label>
                <textarea
                  placeholder="e.g. Students on study leave. Drive applications paused until exam completion."
                  value={newBlackout.reason}
                  onChange={(e) => setNewBlackout({ ...newBlackout, reason: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newBlackout.appliesToAllDrives}
                  onChange={(e) => setNewBlackout({ ...newBlackout, appliesToAllDrives: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700 text-emerald-500"
                />
                <span>Applies to all campus placement drives</span>
              </label>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBlackoutModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddBlackout}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
              >
                Add Blackout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: GRANT POLICY OVERRIDE */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleGrantOverride}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span>Grant Audited Policy Override</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowOverrideModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Student User ID or Roll No *</label>
                <input
                  type="text"
                  placeholder="Paste student User ID (MongoDB ObjectId)"
                  value={overrideForm.studentId}
                  onChange={(e) => setOverrideForm({ ...overrideForm, studentId: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Policy to Bypass *</label>
                  <select
                    value={overrideForm.policyType}
                    onChange={(e) => setOverrideForm({ ...overrideForm, policyType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="all">All Policies (Blanket Override)</option>
                    <option value="one_student_one_offer">One Student One Offer</option>
                    <option value="dream_cap">Dream Tier Cap</option>
                    <option value="tier_eligibility">Tier Progression</option>
                    <option value="priority_unplaced">Priority for Unplaced</option>
                    <option value="max_concurrent_apps">Max Concurrent Applications</option>
                    <option value="blackout_dates">Blackout Windows</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Drive Scope</label>
                  <select
                    value={overrideForm.opportunityId}
                    onChange={(e) => setOverrideForm({ ...overrideForm, opportunityId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="">Global (All Drives)</option>
                    {drives.map((d) => (
                      <option key={d._id || d.id} value={d._id || d.id}>
                        {d.companyName} - {d.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Mandatory Justification / Reason * (Audit Logged)
                </label>
                <textarea
                  placeholder="State the institutional reason for granting this exception (e.g. Formal committee approval, Dean endorsement, research exception)..."
                  value={overrideForm.mandatoryReason}
                  onChange={(e) => setOverrideForm({ ...overrideForm, mandatoryReason: e.target.value })}
                  required
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowOverrideModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingOverride}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
              >
                {savingOverride ? 'Recording...' : 'Confirm & Grant Override'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: REVIEW STUDENT EXCEPTION APPEAL */}
      {reviewModalOpen && selectedException && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                {reviewDecision === 'Approved' ? 'Approve Appeal & Create Override' : 'Reject Appeal'}
              </h3>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                You are {reviewDecision.toLowerCase()}ing the appeal submitted by{' '}
                <strong className="text-white">
                  {selectedException.studentId?.firstName} {selectedException.studentId?.lastName}
                </strong>{' '}
                for <strong className="text-indigo-400">{selectedException.opportunityId?.companyName}</strong>.
              </p>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  {reviewDecision === 'Approved' ? 'Mandatory Approval Justification *' : 'Rejection Reason *'}
                </label>
                <textarea
                  placeholder={
                    reviewDecision === 'Approved'
                      ? 'Explain why this exception is granted (will be recorded in audit log)...'
                      : 'Provide explanation to the student on why the appeal was rejected...'
                  }
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReviewExceptionSubmit}
                disabled={reviewingException}
                className={`px-4 py-2 rounded-xl font-bold text-xs shadow-md ${
                  reviewDecision === 'Approved'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                    : 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20'
                }`}
              >
                {reviewingException ? 'Processing...' : `Confirm ${reviewDecision}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
