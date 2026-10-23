import api from './api';

const reportService = {
  // Start async report generation job
  initiateJob: async (templateId, format = 'xlsx', filters = {}) => {
    const res = await api.post('/tpo/reports/jobs', { templateId, format, filters });
    return res.data;
  },

  // Poll background job progress
  getJobProgress: async (jobId) => {
    const res = await api.get(`/tpo/reports/jobs/${jobId}`);
    return res.data.job;
  },

  // Get report jobs audit history
  getReportHistory: async () => {
    const res = await api.get('/tpo/reports/jobs-history');
    return res.data.history || [];
  },

  // Get multi-year YoY comparison analytics
  getYoyAnalytics: async () => {
    const res = await api.get('/tpo/reports/yoy');
    return res.data.yoyData || [];
  },

  // Update institutional report template settings (signatories, header)
  updateReportSettings: async (settings) => {
    const res = await api.patch('/tpo/reports/settings', settings);
    return res.data;
  },

  // Preview / Send weekly TPO digest briefing
  getWeeklyDigest: async () => {
    const res = await api.post('/tpo/reports/digest');
    return res.data;
  },
};

export default reportService;
