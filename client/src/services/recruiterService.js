import api from './api';

const recruiterService = {
  // Drives
  getMyCompanyDrives: async () => {
    const res = await api.get('/recruiter/drives');
    return res.data;
  },

  getDriveDetails: async (driveId) => {
    const res = await api.get(`/recruiter/drives/${driveId}`);
    return res.data;
  },

  proposeJd: async (driveId, data) => {
    const res = await api.post(`/recruiter/drives/${driveId}/propose-jd`, data);
    return res.data;
  },

  // Candidates & Shortlist
  getCandidates: async (driveId, params = {}) => {
    const res = await api.get(`/recruiter/drives/${driveId}/candidates`, { params });
    return res.data;
  },

  updateCandidateStatus: async (driveId, appId, data) => {
    const res = await api.patch(`/recruiter/drives/${driveId}/candidates/${appId}/status`, data);
    return res.data;
  },

  exportShortlistCsv: async (driveId) => {
    const res = await api.get(`/recruiter/drives/${driveId}/export-shortlist`, {
      responseType: 'blob',
    });
    return res.data;
  },

  getCandidateResume: async (driveId, appId) => {
    const res = await api.get(`/recruiter/drives/${driveId}/candidates/${appId}/resume`);
    return res.data;
  },

  // Slot Booking & Scheduling
  autoAllocateSlots: async (driveId, data) => {
    const res = await api.post(`/recruiter/drives/${driveId}/schedule/auto-allocate`, data);
    return res.data;
  },

  getDriveSchedule: async (driveId) => {
    const res = await api.get(`/recruiter/drives/${driveId}/schedule`);
    return res.data;
  },

  // Scorecards & Feedback
  submitRoundFeedback: async (driveId, appId, data) => {
    const res = await api.post(`/recruiter/drives/${driveId}/candidates/${appId}/feedback`, data);
    return res.data;
  },

  // Offer Proposals
  proposeOffer: async (driveId, appId, data) => {
    const res = await api.post(`/recruiter/drives/${driveId}/candidates/${appId}/offer`, data);
    return res.data;
  },

  // Funnel Analytics
  getDriveFunnel: async (driveId) => {
    const res = await api.get(`/recruiter/drives/${driveId}/funnel`);
    return res.data;
  },

  // Invite Flow
  validateInviteToken: async (token) => {
    const res = await api.get(`/auth/invite/${token}`);
    return res.data;
  },

  setPassword: async (data) => {
    const res = await api.post('/auth/set-password', data);
    return res.data;
  },
};

export default recruiterService;
