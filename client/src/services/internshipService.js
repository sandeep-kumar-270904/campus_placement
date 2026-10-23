import api from './api';

const internshipService = {
  getInternships: async (params) => {
    const res = await api.get('/internships', { params });
    return res.data;
  },

  createInternship: async (data) => {
    const res = await api.post('/internships', data);
    return res.data;
  },

  updatePpoStatus: async (id, ppoStatus, ppoDetails, performanceRating, notes) => {
    const res = await api.patch(`/internships/${id}/ppo`, {
      ppoStatus,
      ppoDetails,
      performanceRating,
      notes,
    });
    return res.data;
  },

  getStats: async () => {
    const res = await api.get('/internships/stats');
    return res.data.stats;
  },
};

export default internshipService;
