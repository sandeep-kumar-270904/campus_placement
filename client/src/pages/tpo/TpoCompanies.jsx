import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Plus,
  Filter,
  Phone,
  Mail,
  ExternalLink,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Edit,
  ChevronRight,
  TrendingUp,
  UserPlus,
  Copy,
  Check,
  Send,
} from 'lucide-react';
import tpoService from '../../services/tpoService';

export default function TpoCompanies() {
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    confirmedCount: 0,
    visitedCount: 0,
    superDreamCount: 0,
    dreamCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Invite Recruiter State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    firstName: 'Campus',
    lastName: 'Recruiter',
    companyName: '',
    companyId: '',
  });
  const [inviteSaving, setInviteSaving] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedTier, setSelectedTier] = useState('');

  // Modals & Drawer
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    industry: 'Software & Technology',
    tier: 'Dream',
    status: 'prospect',
    website: '',
    contactName: '',
    contactDesignation: 'Campus Recruiter',
    contactEmail: '',
    contactPhone: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  // Reminder form
  const [reminderData, setReminderData] = useState({
    title: '',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  });
  const [savingReminder, setSavingReminder] = useState(false);

  // New note in drawer
  const [newNoteText, setNewNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await tpoService.getCompanies({
        page,
        limit: 12,
        search: search.trim() || undefined,
        status: selectedStatus || undefined,
        tier: selectedTier || undefined,
      });

      setCompanies(res.companies || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load company CRM directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [page, selectedStatus, selectedTier]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCompanies();
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const contactPersons = formData.contactName
        ? [
            {
              name: formData.contactName,
              designation: formData.contactDesignation,
              email: formData.contactEmail,
              phone: formData.contactPhone,
              isPrimary: true,
            },
          ]
        : [];

      await tpoService.createCompany({
        name: formData.name,
        industry: formData.industry,
        tier: formData.tier,
        status: formData.status,
        website: formData.website,
        contactPersons,
        notes: formData.notes,
      });

      setShowAddModal(false);
      setFormData({
        name: '',
        industry: 'Software & Technology',
        tier: 'Dream',
        status: 'prospect',
        website: '',
        contactName: '',
        contactDesignation: 'Campus Recruiter',
        contactEmail: '',
        contactPhone: '',
        notes: '',
      });
      fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to create company.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!selectedCompany) return;
    try {
      setSavingReminder(true);
      await tpoService.setCompanyReminder(selectedCompany._id, reminderData);
      setShowReminderModal(false);
      setReminderData({
        title: '',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      });
      // Refresh current company in drawer & listing
      fetchCompanies();
      if (showDetailDrawer) {
        const updated = await tpoService.getCompanies({ search: selectedCompany.name });
        if (updated.companies?.[0]) setSelectedCompany(updated.companies[0]);
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to set reminder.');
    } finally {
      setSavingReminder(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!selectedCompany || !newNoteText.trim()) return;
    try {
      setAddingNote(true);
      const res = await tpoService.updateCompany(selectedCompany._id, {
        newNote: newNoteText.trim(),
      });
      setSelectedCompany(res.company);
      setNewNoteText('');
      fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to add note.');
    } finally {
      setAddingNote(false);
    }
  };

  const handleStatusChange = async (companyId, newStatus) => {
    try {
      await tpoService.updateCompany(companyId, { status: newStatus });
      fetchCompanies();
      if (selectedCompany && selectedCompany._id === companyId) {
        setSelectedCompany({ ...selectedCompany, status: newStatus });
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update company status.');
    }
  };

  const handleOpenInvite = (company = null) => {
    setInviteResult(null);
    setCopiedLink(false);
    if (company) {
      const primaryContact =
        company.contactPersons?.find((c) => c.isPrimary) || company.contactPersons?.[0];
      setInviteForm({
        email: primaryContact?.email || '',
        firstName: primaryContact?.name ? primaryContact.name.split(' ')[0] : 'Campus',
        lastName: primaryContact?.name ? primaryContact.name.split(' ').slice(1).join(' ') : 'Recruiter',
        companyName: company.name,
        companyId: company._id,
      });
    } else {
      setInviteForm({
        email: '',
        firstName: 'Campus',
        lastName: 'Recruiter',
        companyName: '',
        companyId: '',
      });
    }
    setShowInviteModal(true);
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    try {
      setInviteSaving(true);
      const res = await tpoService.inviteRecruiter({
        email: inviteForm.email,
        firstName: inviteForm.firstName,
        lastName: inviteForm.lastName,
        companyId: inviteForm.companyId || undefined,
        companyName: inviteForm.companyName || undefined,
      });
      setInviteResult(res);
      fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to send recruiter invite.');
    } finally {
      setInviteSaving(false);
    }
  };

  const handleCopyInviteLink = () => {
    if (!inviteResult?.inviteUrl && !inviteResult?.inviteToken) return;
    const url =
      inviteResult.inviteUrl ||
      `${window.location.origin}/recruiter/accept-invite?token=${inviteResult.inviteToken}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'Super Dream':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/30';
      case 'Dream':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'Core':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border border-slate-600';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'visited':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'invited':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Corporate Relations CRM
            </span>
            <span className="text-xs text-slate-400">Recruiter Pipeline & CTC Tracker</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Company Directory & Recruiter CRM
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage corporate partnerships, university recruiter contacts, visit confirmations, historical CTCs, and follow-up reminders.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => handleOpenInvite(null)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            Invite Recruiter
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add Partner Company
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Recruiters</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{stats.totalCompanies}</div>
          <span className="text-[11px] text-slate-500">In institutional registry</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Confirmed Visits</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{stats.confirmedCount}</div>
          <span className="text-[11px] text-cyan-400/80">Committed placement drives</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Visited & Completed</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{stats.visitedCount}</div>
          <span className="text-[11px] text-slate-500">Drives completed</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Super Dream / Dream</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {stats.superDreamCount + stats.dreamCount}
          </div>
          <span className="text-[11px] text-purple-400/80">High package partners</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search company name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All CRM Statuses</option>
            <option value="prospect">Prospect</option>
            <option value="invited">Invited</option>
            <option value="confirmed">Confirmed</option>
            <option value="visited">Visited</option>
          </select>

          {/* Tier Filter */}
          <select
            value={selectedTier}
            onChange={(e) => {
              setSelectedTier(e.target.value);
              setPage(1);
            }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Tiers</option>
            <option value="Super Dream">Super Dream</option>
            <option value="Dream">Dream</option>
            <option value="Core">Core</option>
            <option value="Standard">Standard</option>
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading recruiter CRM...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center text-rose-300">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <p className="font-semibold text-sm mb-3">{error}</p>
          <button
            onClick={fetchCompanies}
            className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Companies Found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            No recruiter records found matching your filters. Add a partner company to initiate recruitment outreach.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add First Company
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((company) => {
            const primaryContact =
              company.contactPersons?.find((c) => c.isPrimary) || company.contactPersons?.[0];
            const pendingReminders =
              company.followUpReminders?.filter((r) => !r.completed) || [];

            return (
              <div
                key={company._id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-sm hover:shadow-md"
              >
                <div>
                  {/* Top: Name, Tier, Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {company.name}
                        </h3>
                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-slate-300"
                            title="Visit Website"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {company.industry}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getTierBadge(
                        company.tier
                      )}`}
                    >
                      {company.tier}
                    </span>
                  </div>

                  {/* CRM Status Bar */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-slate-500">Pipeline:</span>
                    <select
                      value={company.status}
                      onChange={(e) => handleStatusChange(company._id, e.target.value)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border bg-slate-950 focus:outline-none capitalize ${getStatusBadge(
                        company.status
                      )}`}
                    >
                      <option value="prospect">Prospect</option>
                      <option value="invited">Invited</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="visited">Visited</option>
                    </select>
                  </div>

                  {/* Primary Contact Person */}
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Primary Recruiter
                      </span>
                      {primaryContact && (
                        <span className="text-[10px] text-emerald-400 font-medium">
                          {primaryContact.designation || 'Contact'}
                        </span>
                      )}
                    </div>
                    {primaryContact ? (
                      <div>
                        <p className="text-sm font-bold text-white">{primaryContact.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          {primaryContact.email && (
                            <span className="flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 text-slate-500" />
                              {primaryContact.email}
                            </span>
                          )}
                          {primaryContact.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-500" />
                              {primaryContact.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No contact added yet</p>
                    )}
                  </div>

                  {/* Past Visits / CTC stats */}
                  {company.pastVisits?.length > 0 && (
                    <div className="flex items-center justify-between text-xs text-slate-400 px-1 py-1">
                      <span>
                        Past Hires: <strong>{company.pastVisits[0].hiredCount || 0}</strong>
                      </span>
                      <span>
                        Max CTC: <strong>{company.pastVisits[0].highestCtc || 0} LPA</strong>
                      </span>
                    </div>
                  )}

                  {/* Pending Reminders */}
                  {pendingReminders.length > 0 && (
                    <div className="mt-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs text-amber-300">
                      <span className="flex items-center gap-1.5 truncate">
                        <Clock className="w-3 h-3 shrink-0" />
                        {pendingReminders[0].title}
                      </span>
                      <span className="text-[10px] opacity-75 shrink-0">
                        {new Date(pendingReminders[0].dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => {
                        setSelectedCompany(company);
                        setShowReminderModal(true);
                      }}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                      title="Set reminder"
                    >
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      Reminder
                    </button>
                    <button
                      onClick={() => handleOpenInvite(company)}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold transition-colors"
                      title="Invite recruiter to access dedicated corporate portal"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Invite Portal
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCompany(company);
                      setShowDetailDrawer(true);
                    }}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                  >
                    View CRM Profile <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Add Partner Company</h3>
                <p className="text-xs text-slate-400">
                  Register new corporate recruiter in institutional CRM
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Microsoft, Google, Goldman Sachs"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Placement Tier
                  </label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Super Dream">Super Dream (&gt; 15 LPA)</option>
                    <option value="Dream">Dream (8 - 15 LPA)</option>
                    <option value="Core">Core (5 - 8 LPA)</option>
                    <option value="Standard">Standard (&lt; 5 LPA)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="prospect">Prospect</option>
                    <option value="invited">Invited</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="visited">Visited</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-3">
                <span className="text-xs font-bold text-white block">
                  Primary Recruiter Contact
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Designation"
                    value={formData.contactDesignation}
                    onChange={(e) =>
                      setFormData({ ...formData, contactDesignation: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Initial Internal Note
                </label>
                <textarea
                  rows="2"
                  placeholder="Notes from initial conversations, target hiring numbers..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
                >
                  {saving ? 'Saving...' : 'Register Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set Reminder Modal */}
      {showReminderModal && selectedCompany && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Add Follow-Up Reminder</h3>
                <p className="text-xs text-slate-400">{selectedCompany.name}</p>
              </div>
              <button
                onClick={() => setShowReminderModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReminder} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reminder Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Follow up on Jd confirmation / Slot booking"
                  value={reminderData.title}
                  onChange={(e) => setReminderData({ ...reminderData, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={reminderData.dueDate}
                  onChange={(e) => setReminderData({ ...reminderData, dueDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => setShowReminderModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingReminder}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  {savingReminder ? 'Setting...' : 'Set Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide-Over Company CRM Profile Drawer */}
      {showDetailDrawer && selectedCompany && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
            <div>
              {/* Drawer Top */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{selectedCompany.name}</h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getTierBadge(
                        selectedCompany.tier
                      )}`}
                    >
                      {selectedCompany.tier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{selectedCompany.industry}</p>
                </div>
                <button
                  onClick={() => setShowDetailDrawer(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              {/* Contacts section */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Recruiter Contact Directory
                  </h4>
                  <button
                    onClick={() => handleOpenInvite(selectedCompany)}
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Invite Recruiter
                  </button>
                </div>
                {selectedCompany.contactPersons?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCompany.contactPersons.map((contact, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{contact.name}</span>
                            {contact.isPrimary && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                                Primary
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">
                            {contact.designation || 'Recruiter'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white"
                              title={contact.email}
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}
                          {contact.phone && (
                            <a
                              href={`tel:${contact.phone}`}
                              className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white"
                              title={contact.phone}
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No contact persons registered.</p>
                )}
              </div>

              {/* Reminders section */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Follow-Up Reminders
                  </h4>
                  <button
                    onClick={() => setShowReminderModal(true)}
                    className="text-xs text-emerald-400 font-semibold hover:underline"
                  >
                    + Add Reminder
                  </button>
                </div>
                {selectedCompany.followUpReminders?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCompany.followUpReminders.map((rem, idx) => (
                      <div
                        key={idx}
                        className={`border rounded-xl p-3 flex items-center justify-between text-xs ${
                          rem.completed
                            ? 'bg-slate-950/40 border-slate-800 text-slate-500'
                            : 'bg-amber-500/5 border-amber-500/20 text-amber-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span className={rem.completed ? 'line-through' : 'font-semibold'}>
                            {rem.title}
                          </span>
                        </div>
                        <span className="text-[11px] opacity-75">
                          {new Date(rem.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No pending reminders.</p>
                )}
              </div>

              {/* Internal Notes thread */}
              <div className="mt-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Private TPO Notes Thread
                </h4>
                <form onSubmit={handleAddNote} className="mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add an internal note or update..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={addingNote || !newNoteText.trim()}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-40"
                    >
                      Add Note
                    </button>
                  </div>
                </form>

                {selectedCompany.notes?.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedCompany.notes.map((n, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs"
                      >
                        <p className="text-slate-200">{n.note}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No notes recorded yet.</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 mt-6">
              <button
                onClick={() => setShowDetailDrawer(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Recruiter Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-purple-400" />
                  Invite Corporate Recruiter
                </h3>
                <p className="text-xs text-slate-400">
                  Send email invitation to access the dedicated Recruiter Portal
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {inviteResult ? (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-white">Invitation Issued Successfully!</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    An activation invitation was prepared for{' '}
                    <strong className="text-white">{inviteForm.email}</strong>
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Direct Activation URL:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={
                        inviteResult.inviteUrl ||
                        `${window.location.origin}/recruiter/accept-invite?token=${inviteResult.inviteToken}`
                      }
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono truncate"
                    />
                    <button
                      onClick={handleCopyInviteLink}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedLink ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1.5 block">
                    Share this one-time link with the recruiter to set their password.
                  </span>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Recruiter Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="recruiter@company.com"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={inviteForm.firstName}
                      onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={inviteForm.lastName}
                      onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Google India, Microsoft"
                    value={inviteForm.companyName}
                    onChange={(e) => setInviteForm({ ...inviteForm, companyName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-xs text-purple-300">
                  <p>
                    Recruiter will only have access to their company's drives, candidates, shortlisted resumes, slot scheduling, and feedback scorecards.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteSaving}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/20 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {inviteSaving ? 'Generating...' : 'Issue Invite'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
