import api from './api';

const aiService = {
  // 1. Resume vs Drive Match
  checkResumeMatch: async (driveId) => {
    const res = await api.post('/ai/resume-match', { driveId });
    return res.data;
  },

  // 2. Mock Interviewer
  startMockInterview: async (data) => {
    const res = await api.post('/ai/mock-interview/start', data);
    return res.data;
  },

  respondMockInterview: async (sessionId, answer) => {
    const res = await api.post(`/ai/mock-interview/${sessionId}/respond`, { answer });
    return res.data;
  },

  getMockInterviewHistory: async () => {
    const res = await api.get('/ai/mock-interview/history');
    return res.data;
  },

  getMockInterviewSession: async (sessionId) => {
    const res = await api.get(`/ai/mock-interview/${sessionId}`);
    return res.data;
  },

  // 3. Company Prep Pack
  getCompanyPrepPack: async (companyName) => {
    const res = await api.get(`/ai/prep-pack/${encodeURIComponent(companyName)}`);
    return res.data;
  },

  // 4. Placement Risk Predictor (TPO)
  getPlacementRisk: async (params = {}) => {
    const res = await api.get('/ai/placement-risk', { params });
    return res.data;
  },

  // 5. Natural Language TPO Query
  naturalLanguageTpoQuery: async (query) => {
    const res = await api.post('/ai/nl-assistant/query', { query });
    return res.data;
  },

  // 6. Drive Description Parser
  parseDriveDescription: async (rawJdText) => {
    const res = await api.post('/ai/parse-jd', { rawJdText });
    return res.data;
  },

  // 7. Interview Feedback Summarizer & Approval
  summarizeFeedback: async (data) => {
    const res = await api.post('/ai/summarize-feedback', data);
    return res.data;
  },

  approveFeedback: async (appId, data) => {
    const res = await api.patch(`/ai/feedback/${appId}/approve`, data);
    return res.data;
  },
};

export default aiService;
