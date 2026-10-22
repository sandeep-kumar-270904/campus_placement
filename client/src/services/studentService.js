import api from './api';

export const studentService = {
  // 1. Dashboard Today
  getDashboardToday: async () => {
    const res = await api.get('/student/dashboard/today');
    return res.data;
  },

  // 2. Profile Builder
  getProfile: async () => {
    const res = await api.get('/student/profile');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.put('/student/profile', data);
    return res.data;
  },

  // 3. Opportunities & Explanatory Eligibility
  getOpportunities: async (params = {}) => {
    const res = await api.get('/student/opportunities', { params });
    return res.data;
  },

  getOpportunityEligibility: async (id) => {
    const res = await api.get(`/student/opportunities/${id}/eligibility`);
    return res.data;
  },

  applyOpportunity: async (id) => {
    const res = await api.post(`/student/opportunities/${id}/apply`);
    return res.data;
  },

  withdrawApplication: async (id) => {
    const res = await api.delete(`/student/opportunities/${id}/withdraw`);
    return res.data;
  },

  // 4. Applications & Offer Decisions
  getMyApplications: async () => {
    const res = await api.get('/student/applications');
    return res.data;
  },

  decideOffer: async (applicationId, decision, remarks = '') => {
    const res = await api.patch(`/student/applications/${applicationId}/offer-decision`, {
      decision,
      remarks,
    });
    return res.data;
  },

  // 5. Interviews & Calendar
  getInterviews: async () => {
    const res = await api.get('/student/interviews');
    return res.data;
  },

  getIcsExportUrl: () => {
    const token = localStorage.getItem('token');
    return `/api/student/interviews/export-ics${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },

  // 6. Documents Vault & NOC Request
  getDocuments: async () => {
    const res = await api.get('/student/documents');
    return res.data;
  },

  requestNoc: async (nocData) => {
    const res = await api.post('/student/documents/noc-request', nocData);
    return res.data;
  },

  // 7. Data Privacy, GDPR/DPDP, and Consent
  exportMyData: async () => {
    const res = await api.get('/student/privacy/export-data', {
      responseType: 'blob',
    });
    return res.data;
  },

  requestDeletion: async (reason) => {
    const res = await api.post('/student/privacy/deletion-request', { reason });
    return res.data;
  },

  recordConsent: async (consentType = 'recruiter_data_sharing', version = '1.0') => {
    const res = await api.post('/student/privacy/consent', { consentType, version });
    return res.data;
  },
};

export default studentService;
