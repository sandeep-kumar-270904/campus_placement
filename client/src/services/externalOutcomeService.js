import api from './api';

const externalOutcomeService = {
  submitOutcome: async (data) => {
    const res = await api.post('/external-outcomes', data);
    return res.data;
  },

  getMyOutcomes: async () => {
    const res = await api.get('/external-outcomes/my-outcomes');
    return res.data.outcomes || [];
  },

  getVerificationQueue: async (params) => {
    const res = await api.get('/external-outcomes/tpo/queue', { params });
    return res.data;
  },

  verifyOutcome: async (id, action, rejectionReason) => {
    const res = await api.patch(`/external-outcomes/tpo/verify/${id}`, { action, rejectionReason });
    return res.data;
  },

  getStats: async () => {
    const res = await api.get('/external-outcomes/stats');
    return res.data.stats;
  },
};

export default externalOutcomeService;
