import api from './api';

const policyService = {
  // Placement Policy Config
  getPolicy: async () => {
    const res = await api.get('/policies');
    return res.data;
  },

  updatePolicy: async (data) => {
    const res = await api.put('/policies', data);
    return res.data;
  },

  // Live Drive Simulation Preview
  previewSimulation: async (opportunityId, proposedPolicy = null) => {
    const res = await api.post('/policies/preview', { opportunityId, proposedPolicy });
    return res.data;
  },

  // Policy Overrides
  getOverrides: async (params = {}) => {
    const res = await api.get('/policies/overrides', { params });
    return res.data;
  },

  grantOverride: async (data) => {
    const res = await api.post('/policies/overrides', data);
    return res.data;
  },

  revokeOverride: async (id, reason = '') => {
    const res = await api.delete(`/policies/overrides/${id}`, { data: { reason } });
    return res.data;
  },

  // Student Exception Appeals
  getExceptions: async (params = {}) => {
    const res = await api.get('/policies/exceptions', { params });
    return res.data;
  },

  submitException: async (data) => {
    const res = await api.post('/policies/exceptions', data);
    return res.data;
  },

  reviewException: async (id, data) => {
    const res = await api.patch(`/policies/exceptions/${id}`, data);
    return res.data;
  },

  // Check Policy Status for Drive
  checkOpportunityPolicyStatus: async (opportunityId) => {
    const res = await api.get(`/policies/check/${opportunityId}`);
    return res.data;
  },

  // Fairness & Diversity Report
  getFairnessReport: async () => {
    const res = await api.get('/policies/fairness-report');
    return res.data;
  },

  downloadFairnessReportCsv: async () => {
    const res = await api.get('/policies/fairness-report/export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `Fairness_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },
};

export default policyService;
