import api from './api';

const tpoService = {
  // 1. Dashboard (Command Center Home)
  getDashboardSummary: async () => {
    const res = await api.get('/tpo/dashboard-summary');
    return res.data;
  },

  // 2. Students Directory
  getStudents: async (params = {}) => {
    const res = await api.get('/tpo/students', { params });
    return res.data;
  },
  getStudentDetails: async (id) => {
    const res = await api.get(`/tpo/students/${id}`);
    return res.data;
  },
  bulkVerifyStudents: async (data) => {
    const res = await api.post('/tpo/students/bulk-verify', data);
    return res.data;
  },
  previewBulkImport: async (formData) => {
    const res = await api.post('/tpo/students/bulk-import/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  commitBulkImport: async (data) => {
    const res = await api.post('/tpo/students/bulk-import/commit', data);
    return res.data;
  },
  addStudentManual: async (data) => {
    const res = await api.post('/tpo/students/manual', data);
    return res.data;
  },
  updateStudentManual: async (studentId, data) => {
    const res = await api.put(`/tpo/students/${studentId}`, data);
    return res.data;
  },
  bulkAddToDrive: async (data) => {
    const res = await api.post('/tpo/students/bulk-add-to-drive', data);
    return res.data;
  },
  updateStudentNotes: async (studentId, note) => {
    const res = await api.put(`/tpo/students/${studentId}/notes`, { note });
    return res.data;
  },

  // 3. Verification Queue
  getVerificationQueue: async (params = {}) => {
    const res = await api.get('/tpo/verification-queue', { params });
    return res.data;
  },
  actionVerification: async (studentId, actionData) => {
    const res = await api.post(`/tpo/verification/${studentId}/action`, actionData);
    return res.data;
  },

  // 4. Drives
  getDrives: async (params = {}) => {
    const res = await api.get('/tpo/drives', { params });
    return res.data;
  },
  createDrive: async (data) => {
    const res = await api.post('/tpo/drives', data);
    return res.data;
  },
  updateDrive: async (id, data) => {
    const res = await api.put(`/tpo/drives/${id}`, data);
    return res.data;
  },
  previewEligibility: async (rules) => {
    const res = await api.post('/tpo/drives/preview-eligibility', rules);
    return res.data;
  },
  updateDriveStatus: async (id, status) => {
    const res = await api.patch(`/tpo/drives/${id}/status`, { status });
    return res.data;
  },
  duplicateDrive: async (id) => {
    const res = await api.post(`/tpo/drives/${id}/duplicate`);
    return res.data;
  },

  // 5. Drive Workspace
  getDriveWorkspace: async (id) => {
    const res = await api.get(`/tpo/drives/${id}/workspace`);
    return res.data;
  },
  getDriveApplicants: async (id, params = {}) => {
    const res = await api.get(`/tpo/drives/${id}/applicants`, { params });
    return res.data;
  },
  advanceApplicants: async (id, data) => {
    const res = await api.patch(`/tpo/drives/${id}/applicants/advance`, data);
    return res.data;
  },
  uploadShortlist: async (id, formData) => {
    const res = await api.post(`/tpo/drives/${id}/shortlist-upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  submitRoundFeedback: async (id, appId, feedback) => {
    const res = await api.post(`/tpo/drives/${id}/applicants/${appId}/feedback`, feedback);
    return res.data;
  },
  extendOffer: async (id, appId, offerData) => {
    const res = await api.post(`/tpo/drives/${id}/applicants/${appId}/offer`, offerData);
    return res.data;
  },

  // 6. Schedule
  getScheduleSlots: async (params = {}) => {
    const res = await api.get('/tpo/schedule/slots', { params });
    return res.data;
  },
  bulkGenerateSlots: async (data) => {
    const res = await api.post('/tpo/schedule/bulk-generate', data);
    return res.data;
  },
  checkScheduleClashes: async (data) => {
    const res = await api.post('/tpo/schedule/check-clash', data);
    return res.data;
  },
  updateScheduleSlot: async (id, data) => {
    const res = await api.put(`/tpo/schedule/slots/${id}`, data);
    return res.data;
  },
  getScheduleIcsUrl: (driveId) => {
    const token = localStorage.getItem('token');
    return `/api/tpo/schedule/export-ics?token=${token}${driveId ? `&driveId=${driveId}` : ''}`;
  },

  // 7. Company CRM
  getCompanies: async (params = {}) => {
    const res = await api.get('/tpo/companies', { params });
    return res.data;
  },
  createCompany: async (data) => {
    const res = await api.post('/tpo/companies', data);
    return res.data;
  },
  updateCompany: async (id, data) => {
    const res = await api.put(`/tpo/companies/${id}`, data);
    return res.data;
  },
  setCompanyReminder: async (id, reminder) => {
    const res = await api.post(`/tpo/companies/${id}/reminder`, reminder);
    return res.data;
  },

  // 8. Announcements
  getAnnouncements: async (params = {}) => {
    const res = await api.get('/tpo/announcements', { params });
    return res.data;
  },
  previewAnnouncementRecipients: async (segments) => {
    const res = await api.post('/tpo/announcements/preview-recipients', segments);
    return res.data;
  },
  sendAnnouncement: async (data) => {
    const res = await api.post('/tpo/announcements/send', data);
    return res.data;
  },

  // 9. Analytics
  getAnalyticsOverview: async (params = {}) => {
    const res = await api.get('/tpo/analytics/overview', { params });
    return res.data;
  },
  getAnalyticsUnplaced: async (params = {}) => {
    const res = await api.get('/tpo/analytics/unplaced', { params });
    return res.data;
  },
  getAnalyticsMultipleOffers: async (params = {}) => {
    const res = await api.get('/tpo/analytics/multiple-offers', { params });
    return res.data;
  },

  // 10. Reports
  getReportTemplates: async () => {
    const res = await api.get('/tpo/reports/templates');
    return res.data;
  },
  generateReport: async (data) => {
    const res = await api.post('/tpo/reports/generate', data);
    return res.data;
  },
  getReportHistory: async () => {
    const res = await api.get('/tpo/reports/history');
    return res.data;
  },

  // 11. Settings
  getSettings: async () => {
    const res = await api.get('/tpo/settings');
    return res.data;
  },
  updatePolicies: async (policies) => {
    const res = await api.put('/tpo/settings/policies', policies);
    return res.data;
  },
  updateBranches: async (branches) => {
    const res = await api.put('/tpo/settings/branches', { branches });
    return res.data;
  },
  updateTemplates: async (templates) => {
    const res = await api.put('/tpo/settings/templates', templates);
    return res.data;
  },
  addTeamMember: async (member) => {
    const res = await api.post('/tpo/settings/team', member);
    return res.data;
  },
};

export default tpoService;
