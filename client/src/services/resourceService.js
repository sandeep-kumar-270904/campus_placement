import api from './api';

const resourceService = {
  // Get consolidated resources with search, tab, and targetRole filters
  getResources: async (params = {}) => {
    const res = await api.get('/resources', { params });
    return res.data;
  },

  // Get student's bookmarked resource IDs
  getBookmarks: async () => {
    const res = await api.get('/resources/bookmarks');
    return res.data.bookmarks || [];
  },

  // Toggle bookmark for a platform
  toggleBookmark: async (resourceId) => {
    const res = await api.post(`/resources/bookmarks/${resourceId}`);
    return res.data;
  },
};

export default resourceService;
