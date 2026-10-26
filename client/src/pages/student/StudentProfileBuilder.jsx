import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Briefcase,
  Award,
  Link2,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck,
  UploadCloud,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
  Globe,
  Lock,
  QrCode,
} from 'lucide-react';
import studentService from '../../services/studentService';
import { uploadResume } from '../../services/documentService';
import { useTenant } from '../../context/TenantContext';

export default function StudentProfileBuilder() {
  const { branding, formatGrade } = useTenant();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('personal'); // personal, academics, skills, projects, certifications, links, resumes

  // Form State
  const [personal, setPersonal] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Other',
    rollNo: '',
  });

  const [academics, setAcademics] = useState({
    cgpa: 8.0,
    backlogs: 0,
    branch: 'Computer Science',
    graduationYear: 2026,
    educationGapYears: 0,
    tenthBoard: 'CBSE',
    tenthScore: 85,
    twelfthBoard: 'CBSE',
    twelfthScore: 85,
  });

  const [semesters, setSemesters] = useState([
    { semesterNumber: 1, sgpa: 8.0, credits: 20, backlogs: 0 },
    { semesterNumber: 2, sgpa: 8.2, credits: 22, backlogs: 0 },
    { semesterNumber: 3, sgpa: 8.5, credits: 24, backlogs: 0 },
  ]);

  const [skills, setSkills] = useState(['React', 'Node.js', 'TypeScript', 'SQL']);
  const [newSkill, setNewSkill] = useState('');

  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [socialLinks, setSocialLinks] = useState({
    github: '',
    linkedin: '',
    portfolio: '',
    leetcode: '',
    codeforces: '',
  });

  const [resumeVersions, setResumeVersions] = useState([]);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [completeness, setCompleteness] = useState({ percentage: 0, missing: [], nextBestAction: '' });
  const [readinessScore, setReadinessScore] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const [publicPortfolioSettings, setPublicPortfolioSettings] = useState({
    isPublic: true,
    showCgpa: true,
    showProjects: true,
    showCertifications: true,
    showExperience: true,
    showContact: false,
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await studentService.getProfile();
      const p = res.profile || {};
      const u = res.user || {};

      setPersonal({
        name: p.personalInfo?.name || u.name || '',
        email: p.personalInfo?.email || u.email || '',
        phone: p.personalInfo?.phone || '',
        gender: p.personalInfo?.gender || 'Other',
        rollNo: p.rollNo || '',
      });

      setAcademics({
        cgpa: p.cgpa !== undefined ? p.cgpa : 8.0,
        backlogs: p.backlogs !== undefined ? p.backlogs : 0,
        branch: p.branch || 'Computer Science',
        graduationYear: p.graduationYear || 2026,
        educationGapYears: p.educationGapYears || 0,
        tenthBoard: p.academics?.tenth?.board || 'CBSE',
        tenthScore: p.academics?.tenth?.score || 85,
        twelfthBoard: p.academics?.twelfth?.board || 'CBSE',
        twelfthScore: p.academics?.twelfth?.score || 85,
      });

      if (p.semesters && p.semesters.length > 0) {
        setSemesters(p.semesters);
      }

      if (p.skills && p.skills.length > 0) {
        setSkills(p.skills);
      }

      if (p.projects && p.projects.length > 0) {
        setProjects(p.projects);
      }

      if (p.certifications && p.certifications.length > 0) {
        setCertifications(p.certifications);
      }

      if (p.socialLinks) {
        setSocialLinks({
          github: p.socialLinks.github || '',
          linkedin: p.socialLinks.linkedin || '',
          portfolio: p.socialLinks.portfolio || '',
          leetcode: p.socialLinks.leetcode || '',
          codeforces: p.socialLinks.codeforces || '',
        });
      }

      if (p.resumeVersions && p.resumeVersions.length > 0) {
        setResumeVersions(p.resumeVersions);
      }

      if (p.publicPortfolioSettings) {
        setPublicPortfolioSettings({
          isPublic: p.publicPortfolioSettings.isPublic !== false,
          showCgpa: p.publicPortfolioSettings.showCgpa !== false,
          showProjects: p.publicPortfolioSettings.showProjects !== false,
          showCertifications: p.publicPortfolioSettings.showCertifications !== false,
          showExperience: p.publicPortfolioSettings.showExperience !== false,
          showContact: Boolean(p.publicPortfolioSettings.showContact || p.publicPortfolioSettings.showContactInfo),
        });
      }

      setIsVerified(Boolean(p.isVerifiedByTPO));
      if (res.completeness) setCompleteness(res.completeness);
      if (res.readinessScore) setReadinessScore(res.readinessScore);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setErrorMsg(err?.response?.data?.error?.message || 'Failed to fetch student profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg('');
      setErrorMsg('');

      const payload = {
        rollNo: personal.rollNo,
        cgpa: Number(academics.cgpa),
        backlogs: Number(academics.backlogs),
        branch: academics.branch,
        graduationYear: Number(academics.graduationYear),
        educationGapYears: Number(academics.educationGapYears),
        personalInfo: {
          name: personal.name,
          email: personal.email,
          phone: personal.phone,
          gender: personal.gender,
        },
        academics: {
          tenth: { board: academics.tenthBoard, score: Number(academics.tenthScore) },
          twelfth: { board: academics.twelfthBoard, score: Number(academics.twelfthScore) },
        },
        semesters,
        skills,
        projects,
        certifications,
        socialLinks,
        resumeVersions,
        publicPortfolioSettings,
      };

      const res = await studentService.updateProfile(payload);
      setSuccessMsg('Profile saved successfully! Your eligibility will update automatically.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchProfile();
    } catch (err) {
      setErrorMsg(err?.response?.data?.error?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // Skill Chip handlers
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (!skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Project handlers
  const handleAddProject = () => {
    setProjects([
      ...projects,
      {
        title: '',
        description: '',
        technologies: [],
        link: '',
        githubUrl: '',
      },
    ]);
  };

  const handleRemoveProject = (idx) => {
    setProjects(projects.filter((_, i) => i !== idx));
  };

  const handleProjectChange = (idx, field, value) => {
    const updated = [...projects];
    updated[idx][field] = value;
    setProjects(updated);
  };

  // Certification handlers
  const handleAddCert = () => {
    setCertifications([
      ...certifications,
      {
        name: '',
        issuer: '',
        issueDate: '',
        credentialUrl: '',
      },
    ]);
  };

  const handleRemoveCert = (idx) => {
    setCertifications(certifications.filter((_, i) => i !== idx));
  };

  const handleCertChange = (idx, field, value) => {
    const updated = [...certifications];
    updated[idx][field] = value;
    setCertifications(updated);
  };

  // Semester SGPA handlers
  const handleAddSemester = () => {
    const nextSem = semesters.length + 1;
    setSemesters([...semesters, { semesterNumber: nextSem, sgpa: 8.0, credits: 20, backlogs: 0 }]);
  };

  const handleRemoveSemester = (idx) => {
    setSemesters(semesters.filter((_, i) => i !== idx));
  };

  const handleSemesterChange = (idx, field, value) => {
    const updated = [...semesters];
    updated[idx][field] = Number(value);
    setSemesters(updated);
  };

  // Resume Upload Handler
  const handleResumeFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingResume(true);
      setErrorMsg('');
      const uploadedDoc = await uploadResume(file);
      const newVersion = {
        version: resumeVersions.length + 1,
        title: file.name,
        fileUrl: uploadedDoc.signedUrl || uploadedDoc.fileUrl || '',
        storageKey: uploadedDoc.storageKey || '',
        uploadedAt: new Date(),
        isActive: true,
      };

      // Set previously active versions to inactive
      const updatedVersions = resumeVersions.map((v) => ({ ...v, isActive: false }));
      updatedVersions.unshift(newVersion);
      setResumeVersions(updatedVersions);

      // Save directly
      await studentService.updateProfile({
        resumeVersions: updatedVersions,
        resumeUrl: newVersion.fileUrl,
      });

      setSuccessMsg(`Resume version ${newVersion.version} uploaded successfully!`);
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchProfile();
    } catch (err) {
      setErrorMsg(err?.response?.data?.error?.message || 'Failed to upload resume file.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSetActiveResume = async (idx) => {
    const updated = resumeVersions.map((v, i) => ({
      ...v,
      isActive: i === idx,
    }));
    setResumeVersions(updated);
    await studentService.updateProfile({
      resumeVersions: updated,
      resumeUrl: updated[idx]?.fileUrl,
    });
    setSuccessMsg(`Active resume set to Version ${updated[idx]?.version}`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCopyPortfolioLink = () => {
    const url = `${window.location.origin}/portfolio/${encodeURIComponent(personal.rollNo || '')}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleTogglePrivacySetting = (key) => {
    setPublicPortfolioSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading student profile builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
      {/* Header & Completeness Meter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-white">Student Profile Builder</h1>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> TPO Sealed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Unverified
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Institutional records, verified academics, ATS resume versions, and portfolio showcase.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Records...' : 'Save All Changes'}</span>
          </button>
        </div>

        {/* Profile Completeness Alert Bar */}
        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Profile Readiness: {completeness.percentage}%
            </span>
            <span className="text-slate-400">Readiness Score: {readinessScore}/100</span>
          </div>
          <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${completeness.percentage}%` }}
            />
          </div>
          <p className="text-[11px] text-emerald-400 font-medium">{completeness.nextBestAction}</p>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-950/60 border border-rose-700/60 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800 text-xs font-semibold">
        {[
          { id: 'personal', label: 'Personal & Contact', icon: User },
          { id: 'academics', label: 'Academic & SGPAs', icon: GraduationCap },
          { id: 'skills', label: 'Skills & Stack', icon: Sparkles },
          { id: 'projects', label: 'Portfolio Projects', icon: Briefcase },
          { id: 'certifications', label: 'Certifications', icon: Award },
          { id: 'links', label: 'Social & Coding Links', icon: Link2 },
          { id: 'resumes', label: 'Resume Versions', icon: FileText },
          { id: 'privacy', label: 'Portfolio & Privacy', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 border-t border-x border-slate-700 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {/* 1. Personal & Contact Info */}
        {activeTab === 'personal' && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Personal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={personal.name}
                  onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Alex Johnson"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Institutional Email</label>
                <input
                  type="email"
                  value={personal.email}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/50 border border-slate-800 text-slate-400 text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">College Roll Number</label>
                <input
                  type="text"
                  value={personal.rollNo}
                  onChange={(e) => setPersonal({ ...personal, rollNo: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. CS2026-08"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Mobile Phone (WhatsApp ready)</label>
                <input
                  type="tel"
                  value={personal.phone}
                  onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Gender</label>
                <select
                  value={personal.gender}
                  onChange={(e) => setPersonal({ ...personal, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 2. Academics & Semester SGPAs */}
        {activeTab === 'academics' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Graduation & Schooling</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Engineering Branch</label>
                  <input
                    type="text"
                    value={academics.branch}
                    onChange={(e) => setAcademics({ ...academics, branch: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    placeholder="Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Cumulative CGPA (10-scale)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={academics.cgpa}
                    onChange={(e) => setAcademics({ ...academics, cgpa: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Active Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    value={academics.backlogs}
                    onChange={(e) => setAcademics({ ...academics, backlogs: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Graduation Passing Year</label>
                  <input
                    type="number"
                    value={academics.graduationYear}
                    onChange={(e) => setAcademics({ ...academics, graduationYear: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Education Gap Years</label>
                  <input
                    type="number"
                    min="0"
                    value={academics.educationGapYears}
                    onChange={(e) => setAcademics({ ...academics, educationGapYears: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Secondary & Higher Secondary Scores
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">10th Board</label>
                  <input
                    type="text"
                    value={academics.tenthBoard}
                    onChange={(e) => setAcademics({ ...academics, tenthBoard: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">10th Percentage / Score</label>
                  <input
                    type="number"
                    step="0.1"
                    value={academics.tenthScore}
                    onChange={(e) => setAcademics({ ...academics, tenthScore: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">12th / Diploma Board</label>
                  <input
                    type="text"
                    value={academics.twelfthBoard}
                    onChange={(e) => setAcademics({ ...academics, twelfthBoard: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">12th Percentage / Score</label>
                  <input
                    type="number"
                    step="0.1"
                    value={academics.twelfthScore}
                    onChange={(e) => setAcademics({ ...academics, twelfthScore: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Semester-wise SGPA Breakdown */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Semester-wise SGPA History
                </h3>
                <button
                  type="button"
                  onClick={handleAddSemester}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Semester
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Semester</th>
                      <th className="p-3">SGPA (0 - 10)</th>
                      <th className="p-3">Credits</th>
                      <th className="p-3">Backlogs</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {semesters.map((sem, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="p-3 font-semibold text-white">Semester {sem.semesterNumber || idx + 1}</td>
                        <td className="p-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            value={sem.sgpa}
                            onChange={(e) => handleSemesterChange(idx, 'sgpa', e.target.value)}
                            className="w-24 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={sem.credits || 20}
                            onChange={(e) => handleSemesterChange(idx, 'credits', e.target.value)}
                            className="w-20 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            value={sem.backlogs || 0}
                            onChange={(e) => handleSemesterChange(idx, 'backlogs', e.target.value)}
                            className="w-20 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveSemester(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. Technical Skills */}
        {activeTab === 'skills' && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Technical Skills & Tools</h2>
            <p className="text-xs text-slate-400">
              Add at least 3 skills to trigger ATS matches and recruiter keyword filters.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="e.g. Docker, Golang, Spring Boot, PyTorch"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition"
              >
                Add Skill
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 4. Portfolio Projects */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Engineering Projects</h2>
                <p className="text-xs text-slate-400">Highlight fullstack applications, systems, or research.</p>
              </div>
              <button
                type="button"
                onClick={handleAddProject}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            </div>

            {projects.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                No projects added yet. Click "+ Add Project" to showcase your work.
              </p>
            ) : (
              <div className="space-y-4">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => handleProjectChange(idx, 'title', e.target.value)}
                        placeholder="Project Title (e.g. Distributed Key-Value Store)"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold w-full max-w-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <textarea
                      value={proj.description}
                      onChange={(e) => handleProjectChange(idx, 'description', e.target.value)}
                      placeholder="Brief description of architecture, problem solved, and technical impact..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Demo / Live URL</label>
                        <input
                          type="url"
                          value={proj.link}
                          onChange={(e) => handleProjectChange(idx, 'link', e.target.value)}
                          placeholder="https://myproject.dev"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">GitHub Repository</label>
                        <input
                          type="url"
                          value={proj.githubUrl}
                          onChange={(e) => handleProjectChange(idx, 'githubUrl', e.target.value)}
                          placeholder="https://github.com/username/project"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. Certifications */}
        {activeTab === 'certifications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Licenses & Certifications</h2>
                <p className="text-xs text-slate-400">AWS, Azure, GCP, HackerRank, or Coursera credentials.</p>
              </div>
              <button
                type="button"
                onClick={handleAddCert}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20"
              >
                <Plus className="w-3.5 h-3.5" /> Add Certification
              </button>
            </div>

            {certifications.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No certifications added yet.</p>
            ) : (
              <div className="space-y-3">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => handleCertChange(idx, 'name', e.target.value)}
                        placeholder="Certification Name (e.g. AWS Certified Developer)"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold w-full max-w-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCert(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Issuing Organization</label>
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => handleCertChange(idx, 'issuer', e.target.value)}
                          placeholder="e.g. Amazon Web Services"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Issue Date</label>
                        <input
                          type="date"
                          value={cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleCertChange(idx, 'issueDate', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Verification URL</label>
                        <input
                          type="url"
                          value={cert.credentialUrl}
                          onChange={(e) => handleCertChange(idx, 'credentialUrl', e.target.value)}
                          placeholder="https://credly.com/..."
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. Social & Coding Links */}
        {activeTab === 'links' && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Profiles & Coding Handles</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">GitHub Profile</label>
                <input
                  type="url"
                  value={socialLinks.github}
                  onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                  placeholder="https://github.com/username"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">LinkedIn Profile</label>
                <input
                  type="url"
                  value={socialLinks.linkedin}
                  onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Personal Portfolio / Blog</label>
                <input
                  type="url"
                  value={socialLinks.portfolio}
                  onChange={(e) => setSocialLinks({ ...socialLinks, portfolio: e.target.value })}
                  placeholder="https://mywebsite.io"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">LeetCode Profile</label>
                  <input
                    type="url"
                    value={socialLinks.leetcode}
                    onChange={(e) => setSocialLinks({ ...socialLinks, leetcode: e.target.value })}
                    placeholder="https://leetcode.com/username"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Codeforces Profile</label>
                  <input
                    type="url"
                    value={socialLinks.codeforces}
                    onChange={(e) => setSocialLinks({ ...socialLinks, codeforces: e.target.value })}
                    placeholder="https://codeforces.com/profile/username"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. Resume Versions & Cloud Vault */}
        {activeTab === 'resumes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Resume Versions</h2>
                <p className="text-xs text-slate-400">
                  Upload multiple tailored resumes. Choose which active version recruiters see by default.
                </p>
              </div>

              <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20">
                <UploadCloud className="w-4 h-4" />
                <span>{uploadingResume ? 'Uploading File...' : 'Upload New Version'}</span>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleResumeFile}
                  disabled={uploadingResume}
                  className="hidden"
                />
              </label>
            </div>

            {resumeVersions.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-800/40 border border-dashed border-slate-700 space-y-2">
                <FileText className="w-10 h-10 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-300 font-semibold">No resume versions uploaded yet.</p>
                <p className="text-[11px] text-slate-500">
                  Upload PDF or DOCX format (Max 5 MB) with verified magic byte scanning.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {resumeVersions.map((ver, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition ${
                      ver.isActive
                        ? 'bg-emerald-500/10 border-emerald-500/40'
                        : 'bg-slate-800/50 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          ver.isActive
                            ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        v{ver.version || idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white">{ver.title || `Resume v${ver.version}`}</p>
                          {ver.isActive && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Active Primary
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Uploaded on {ver.uploadedAt ? new Date(ver.uploadedAt).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {ver.fileUrl && (
                        <a
                          href={ver.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1"
                        >
                          <span>Preview</span> <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {!ver.isActive && (
                        <button
                          type="button"
                          onClick={() => handleSetActiveResume(idx)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition"
                        >
                          Make Active
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 8. Portfolio & Privacy Settings */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Public Portfolio & Privacy Controls</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure your public portfolio visibility and select which academic and credential sections external viewers can inspect.
              </p>
            </div>

            {/* Public Portfolio URL Card */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-400" /> Shareable Portfolio Link
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  publicPortfolioSettings.isPublic
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}>
                  {publicPortfolioSettings.isPublic ? 'Publicly Accessible' : 'Restricted (Private)'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono truncate select-all">
                  {`${window.location.origin}/portfolio/${encodeURIComponent(personal.rollNo || '')}`}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyPortfolioLink}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>

                  <a
                    href={`/portfolio/${encodeURIComponent(personal.rollNo || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-md shadow-emerald-500/20"
                  >
                    <span>View Live</span> <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Privacy Section Toggles */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Section-Level Display Toggles
              </h3>

              {[
                {
                  key: 'isPublic',
                  title: 'Public Portfolio Access',
                  desc: 'Allow employers, recruiters, and verifiers to access your portfolio via your unique link and QR code.',
                  icon: Globe,
                },
                {
                  key: 'showCgpa',
                  title: 'Display Verified CGPA',
                  desc: 'Show your official institutional cumulative CGPA and academic performance badge.',
                  icon: GraduationCap,
                },
                {
                  key: 'showProjects',
                  title: 'Display Featured Projects',
                  desc: 'Show your software engineering projects, GitHub repositories, and live demo links.',
                  icon: Briefcase,
                },
                {
                  key: 'showCertifications',
                  title: 'Display Certifications & Credentials',
                  desc: 'Showcase verified certifications, issuing bodies, and external credential links.',
                  icon: Award,
                },
                {
                  key: 'showContact',
                  title: 'Display Social & Coding Profiles',
                  desc: 'Show links to your GitHub, LinkedIn, LeetCode, and personal websites on your public profile.',
                  icon: Link2,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isChecked = Boolean(publicPortfolioSettings[item.key]);
                return (
                  <div
                    key={item.key}
                    onClick={() => handleTogglePrivacySetting(item.key)}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70 hover:border-slate-600 transition flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg mt-0.5 ${isChecked ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{item.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>

                    <div className="relative inline-flex items-center shrink-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePrivacySetting(item.key)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Verification & Cryptographic QR Seal Status */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-emerald-500/20 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1 text-center sm:text-left space-y-1">
                <p className="text-xs font-bold text-white">Cryptographic Ed25519 Tamper Protection</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Your academic marks are verified by your college Placement & Training Cell. Any change to your CGPA or backlogs will automatically invalidate your seal and require TPO re-verification.
                </p>
              </div>
              <a
                href={`/verify/${encodeURIComponent(personal.rollNo || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5"
              >
                <span>Inspect Seal</span> <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
