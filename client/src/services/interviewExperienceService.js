import api from './api';

const interviewExperienceService = {
  getExperiences: async (params) => {
    const res = await api.get('/interview-experiences', { params });
    return res.data;
  },

  submitExperience: async (data) => {
    const res = await api.post('/interview-experiences', data);
    return res.data;
  },

  toggleUpvote: async (id) => {
    const res = await api.post(`/interview-experiences/${id}/upvote`);
    return res.data;
  },

  getModerationQueue: async () => {
    const res = await api.get('/interview-experiences/moderation');
    return res.data;
  },

  moderateExperience: async (id, action, tpoReviewNote) => {
    const res = await api.patch(`/interview-experiences/${id}/moderate`, { action, tpoReviewNote });
    return res.data;
  },
};

export default interviewExperienceService;
