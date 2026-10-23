import api from './api';

const alumniService = {
  getAlumniDirectory: async (params) => {
    const res = await api.get('/alumni/directory', { params });
    return res.data;
  },

  saveProfile: async (data) => {
    const res = await api.post('/alumni/profile', data);
    return res.data;
  },

  requestReferral: async (data) => {
    const res = await api.post('/alumni/referrals/request', data);
    return res.data;
  },

  getMyRequests: async () => {
    const res = await api.get('/alumni/referrals/my-requests');
    return res.data;
  },

  respondToRequest: async (id, status, alumniNote) => {
    const res = await api.patch(`/alumni/referrals/${id}`, { status, alumniNote });
    return res.data;
  },

  matchMentors: async (params) => {
    const res = await api.get('/alumni/mentors/match', { params });
    return res.data;
  },

  getUnverifiedAlumni: async () => {
    const res = await api.get('/alumni/tpo/unverified');
    return res.data;
  },

  verifyAlumni: async (id) => {
    const res = await api.patch(`/alumni/tpo/verify/${id}`);
    return res.data;
  },
};

export default alumniService;
