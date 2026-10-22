import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import collegeService from '../services/collegeService';
import TenantBrandingHeader from '../components/TenantBrandingHeader';

const BRANDING_PRESETS = [
  { name: 'Emerald Oasis', primary: '#00ED64', accent: '#00684A', darkBg: '#001E2B' },
  { name: 'Sapphire Academic', primary: '#38BDF8', accent: '#0369A1', darkBg: '#0B1528' },
  { name: 'Electric Violet', primary: '#A855F7', accent: '#6B21A8', darkBg: '#150A26' },
  { name: 'Crimson Tech', primary: '#F43F5E', accent: '#9F1239', darkBg: '#1F060D' },
  { name: 'Amber Forge', primary: '#F59E0B', accent: '#B45309', darkBg: '#1C1304' },
];

export default function CollegeSettings() {
  const { user } = useContext(AuthContext);
  const { tenant, refreshTenant, formatGrade } = useTenant();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    logoUrl: '',
    domains: '',
    timezone: 'Asia/Kolkata',
    currentYear: '2025-2026',
    seasonStart: '',
    seasonEnd: '',
    scale: '10-point',
    minPassCgpa: 4.0,
    maxActiveBacklogsAllowed: 0,
    allowMultipleOffers: true,
    dreamTierThreshold: 15.0,
    primaryColor: '#00ED64',
    accentColor: '#00684A',
    darkBg: '#001E2B',
    branches: [],
    rules: [],
  });

  const [newBranchInput, setNewBranchInput] = useState('');
  const [newRuleInput, setNewRuleInput] = useState('');

  // Target college ID (from user's college or active tenant context)
  const collegeId = tenant?._id || user?.collegeId || user?.college?._id;

  useEffect(() => {
    const loadCollege = async () => {
      if (!collegeId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await collegeService.getCollegeById(collegeId);
        setFormData({
          name: data.name || '',
          code: data.code || '',
          logoUrl: data.logo || data.branding?.logoUrl || '',
          domains: (data.domains || []).join(', '),
          timezone: data.timezone || 'Asia/Kolkata',
          currentYear: data.academicYearConfig?.currentYear || '2025-2026',
          seasonStart: data.academicYearConfig?.placementSeason?.startDate
            ? new Date(data.academicYearConfig.placementSeason.startDate).toISOString().split('T')[0]
            : '2025-07-01',
          seasonEnd: data.academicYearConfig?.placementSeason?.endDate
            ? new Date(data.academicYearConfig.placementSeason.endDate).toISOString().split('T')[0]
            : '2026-06-30',
          scale: data.gradingSystem?.scale || '10-point',
          minPassCgpa: data.gradingSystem?.minPassCgpa ?? 4.0,
          maxActiveBacklogsAllowed: data.policies?.maxActiveBacklogsAllowed ?? 0,
          allowMultipleOffers: data.policies?.allowMultipleOffers ?? true,
          dreamTierThreshold: data.policies?.dreamTierThreshold ?? 15.0,
          primaryColor: data.branding?.primaryColor || '#00ED64',
          accentColor: data.branding?.accentColor || '#00684A',
          darkBg: data.branding?.darkBg || '#001E2B',
          branches: data.branches || [
            'Computer Science',
            'Information Technology',
            'Electronics & Comm',
            'Electrical & Electronics',
            'Mechanical Engineering',
            'Civil Engineering',
          ],
          rules: data.policies?.rules || [
            'Students with > 0 active backlogs are restricted from Dream Tier placement drives.',
            'Minimum 75% attendance in mock training drives is mandatory for drive eligibility.',
          ],
        });
      } catch (err) {
        console.error('Failed to load college config:', err);
        setSaveError('Failed to load college settings. Please verify permissions.');
      } finally {
        setLoading(false);
      }
    };

    loadCollege();
  }, [collegeId]);

  // Apply a branding color preset
  const applyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      primaryColor: preset.primary,
      accentColor: preset.accent,
      darkBg: preset.darkBg,
    }));
  };

  // Branch management
  const handleAddBranch = (e) => {
    e.preventDefault();
    if (!newBranchInput.trim()) return;
    if (formData.branches.includes(newBranchInput.trim())) return;
    setFormData((prev) => ({
      ...prev,
      branches: [...prev.branches, newBranchInput.trim()],
    }));
    setNewBranchInput('');
  };

  const handleRemoveBranch = (branchToRemove) => {
    setFormData((prev) => ({
      ...prev,
      branches: prev.branches.filter((b) => b !== branchToRemove),
    }));
  };

  // Rule management
  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newRuleInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      rules: [...prev.rules, newRuleInput.trim()],
    }));
    setNewRuleInput('');
  };

  const handleRemoveRule = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Submit updates
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    if (!collegeId) return;

    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const payload = {
        name: formData.name.trim(),
        domains: formData.domains
          ? formData.domains.split(',').map((d) => d.trim().toLowerCase()).filter(Boolean)
          : [],
        timezone: formData.timezone,
        academicYearConfig: {
          currentYear: formData.currentYear,
          startMonth: 7,
          endMonth: 6,
          placementSeason: {
            startDate: formData.seasonStart ? new Date(formData.seasonStart) : undefined,
            endDate: formData.seasonEnd ? new Date(formData.seasonEnd) : undefined,
          },
        },
        gradingSystem: {
          scale: formData.scale,
          minPassCgpa: Number(formData.minPassCgpa),
        },
        policies: {
          maxActiveBacklogsAllowed: Number(formData.maxActiveBacklogsAllowed),
          allowMultipleOffers: Boolean(formData.allowMultipleOffers),
          dreamTierThreshold: Number(formData.dreamTierThreshold),
          rules: formData.rules,
        },
        branches: formData.branches,
        branding: {
          primaryColor: formData.primaryColor,
          accentColor: formData.accentColor,
          darkBg: formData.darkBg,
          logoUrl: formData.logoUrl.trim(),
        },
      };

      await collegeService.updateCollegeConfig(collegeId, payload);
      await refreshTenant(collegeId);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to save college settings:', err);
      setSaveError(err.response?.data?.error?.message || err.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-xs">
        Loading institutional settings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <TenantBrandingHeader />

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Institutional Configuration & Branding</h1>
            {formData.code && (
              <span
                className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: `${formData.primaryColor}22`,
                  color: formData.primaryColor,
                  border: `1px solid ${formData.primaryColor}44`,
                }}
              >
                {formData.code}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Configure branches, grading thresholds, placement policies, and custom tenant styling
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/tpo/dashboard"
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            ← Back to TPO Portal
          </Link>

          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="px-5 py-2 rounded-lg font-bold text-xs transition shadow-lg cursor-pointer disabled:opacity-50"
            style={{
              backgroundColor: formData.primaryColor,
              color: '#061621',
              boxShadow: `0 4px 14px ${formData.primaryColor}40`,
            }}
          >
            {saving ? 'Saving Changes...' : 'Save Configuration'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-600/50 text-emerald-300 text-xs flex items-center gap-2 shadow-lg animate-fadeIn">
            <span className="text-emerald-400 text-base font-bold">✓</span>
            <span>Configuration updated successfully! Branding and policies have been refreshed across the platform.</span>
          </div>
        )}

        {saveError && (
          <div className="p-4 rounded-xl bg-red-950/70 border border-red-800/50 text-red-300 text-xs flex items-center justify-between shadow-lg">
            <span>{saveError}</span>
            <button onClick={() => setSaveError(null)} className="text-red-400 hover:text-white cursor-pointer">
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Institution Details & Branding */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md space-y-4">
              <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                1. Institutional Profile & Branding
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">College Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Institutional Logo URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/logo.png"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium text-xs mb-1">
                  Institutional Email Domains (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. anits.edu.in, student.anits.edu.in"
                  value={formData.domains}
                  onChange={(e) => setFormData({ ...formData, domains: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Color Presets */}
              <div className="pt-2">
                <label className="block text-slate-400 font-medium text-xs mb-2">Color Theme Presets</label>
                <div className="flex flex-wrap gap-2">
                  {BRANDING_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span className="w-3 h-3 rounded-full border border-black/30" style={{ backgroundColor: p.primary }}></span>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Accent Shade</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Dark Surface Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.darkBg}
                      onChange={(e) => setFormData({ ...formData, darkBg: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.darkBg}
                      onChange={(e) => setFormData({ ...formData, darkBg: e.target.value })}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Academic & Season Configuration */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md space-y-4">
              <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                2. Academic Year & Season Schedule
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Current Academic Batch</label>
                  <input
                    type="text"
                    value={formData.currentYear}
                    onChange={(e) => setFormData({ ...formData, currentYear: e.target.value })}
                    placeholder="e.g. 2025-2026"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Placement Season Start</label>
                  <input
                    type="date"
                    value={formData.seasonStart}
                    onChange={(e) => setFormData({ ...formData, seasonStart: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Placement Season End</label>
                  <input
                    type="date"
                    value={formData.seasonEnd}
                    onChange={(e) => setFormData({ ...formData, seasonEnd: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Grading System & Policy Controls */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md space-y-4">
              <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                3. Grading Scale & Placement Policies
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Grading Scale</label>
                  <select
                    value={formData.scale}
                    onChange={(e) => {
                      const newScale = e.target.value;
                      setFormData({
                        ...formData,
                        scale: newScale,
                        minPassCgpa: newScale === 'percentage' ? 40 : 4.0,
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="10-point">10-Point CGPA Scale</option>
                    <option value="percentage">Percentage (100% Scale)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Minimum Passing Score ({formData.scale === 'percentage' ? '%' : 'CGPA'})
                  </label>
                  <input
                    type="number"
                    step={formData.scale === 'percentage' ? '1' : '0.1'}
                    min={0}
                    max={formData.scale === 'percentage' ? 100 : 10}
                    value={formData.minPassCgpa}
                    onChange={(e) => setFormData({ ...formData, minPassCgpa: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Max Active Backlogs for Drive Eligibility
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.maxActiveBacklogsAllowed}
                    onChange={(e) =>
                      setFormData({ ...formData, maxActiveBacklogsAllowed: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Set to 0 for strict Zero Backlogs policy.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Dream Tier CTC Threshold (LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    min={0}
                    value={formData.dreamTierThreshold}
                    onChange={(e) => setFormData({ ...formData, dreamTierThreshold: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Offers above this CTC count as Dream Tier.
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowMultipleOffers}
                    onChange={(e) =>
                      setFormData({ ...formData, allowMultipleOffers: e.target.checked })
                    }
                    className="rounded bg-slate-950 border-slate-800 text-purple-600 focus:ring-0"
                  />
                  <span className="text-xs text-slate-300 font-medium">
                    Allow Multiple Offers (Permit students holding an offer to apply for Dream Tier drives)
                  </span>
                </label>
              </div>
            </div>

            {/* Section 4: Allowed Branches */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md space-y-4">
              <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                4. Recognized Academic Branches ({formData.branches.length})
              </h2>

              <div className="flex flex-wrap gap-2">
                {formData.branches.map((b) => (
                  <span
                    key={b}
                    className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2 shadow-sm"
                  >
                    {b}
                    <button
                      type="button"
                      onClick={() => handleRemoveBranch(b)}
                      className="text-slate-500 hover:text-red-400 font-bold cursor-pointer text-xs"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddBranch} className="flex gap-2 text-xs pt-2">
                <input
                  type="text"
                  placeholder="Add new branch (e.g. Artificial Intelligence & Data Science)"
                  value={newBranchInput}
                  onChange={(e) => setNewBranchInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer"
                >
                  + Add Branch
                </button>
              </form>
            </div>

            {/* Section 5: Institutional Rules */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md space-y-4">
              <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                5. Institutional Placement Policy Rules
              </h2>

              <div className="space-y-2 text-xs">
                {formData.rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono text-[10px]">{idx + 1}.</span>
                      <span>{rule}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(idx)}
                      className="text-slate-500 hover:text-red-400 font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddRule} className="flex gap-2 text-xs pt-2">
                <input
                  type="text"
                  placeholder="Add policy rule guideline (e.g. 75% attendance required in mock tests)"
                  value={newRuleInput}
                  onChange={(e) => setNewRuleInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer"
                >
                  + Add Rule
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Live Branding & Policy Preview Card */}
          <div className="space-y-6">
            <div className="sticky top-6 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Live Branding Preview
              </div>

              {/* Mock Student Dashboard Header Card */}
              <div
                className="p-5 rounded-2xl border shadow-inner transition-colors duration-300 space-y-4"
                style={{
                  backgroundColor: formData.darkBg || '#001E2B',
                  borderColor: `${formData.primaryColor}44`,
                }}
              >
                <div className="flex items-center gap-3">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Logo"
                      className="w-10 h-10 rounded-lg object-contain bg-white/10 p-1 border border-white/20"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-slate-950 text-sm shadow"
                      style={{ backgroundColor: formData.primaryColor }}
                    >
                      {formData.code ? formData.code.slice(0, 3) : 'COL'}
                    </div>
                  )}

                  <div>
                    <div className="text-white font-bold text-sm tracking-tight leading-tight">
                      {formData.name || 'Sample College of Engineering'}
                    </div>
                    <div className="text-[11px] text-slate-300/80 font-mono mt-0.5">
                      Batch {formData.currentYear} • {formData.scale === 'percentage' ? 'Percentage Scale' : '10-Point Scale'}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs space-y-2">
                  <div className="text-slate-300 font-semibold text-[11px]">Drive Eligibility Engine</div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Min Score Required:</span>
                    <span className="text-white font-mono font-bold">
                      {formData.scale === 'percentage' ? `${formData.minPassCgpa}%` : `${formData.minPassCgpa} CGPA`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Max Allowed Backlogs:</span>
                    <span className="text-white font-mono font-bold">{formData.maxActiveBacklogsAllowed}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Dream Tier CTC:</span>
                    <span className="text-emerald-400 font-mono font-bold">≥ {formData.dreamTierThreshold} LPA</span>
                  </div>
                </div>

                {/* Primary Button Sample */}
                <button
                  type="button"
                  className="w-full py-2 rounded-lg font-bold text-xs shadow-md transition cursor-pointer"
                  style={{
                    backgroundColor: formData.primaryColor,
                    color: '#061621',
                  }}
                >
                  Apply to Campus Drive
                </button>
              </div>

              <div className="text-[11px] text-slate-400 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: formData.primaryColor }}></span>
                  <span>Primary Color: <code className="font-mono text-white">{formData.primaryColor}</code></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: formData.accentColor }}></span>
                  <span>Accent Color: <code className="font-mono text-white">{formData.accentColor}</code></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: formData.darkBg }}></span>
                  <span>Surface Background: <code className="font-mono text-white">{formData.darkBg}</code></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
