import api from './api';

const getPublicCollege = async (identifier) => {
  const response = await api.get(`/colleges/public/${identifier}`);
  return response.data;
};

const getColleges = async (params = {}) => {
  const response = await api.get('/colleges', { params });
  return response.data;
};

const createCollege = async (collegeData) => {
  const response = await api.post('/colleges', collegeData);
  return response.data;
};

const getCollegeById = async (id) => {
  const response = await api.get(`/colleges/${id}`);
  return response.data;
};

const updateCollegeConfig = async (id, configData) => {
  const response = await api.put(`/colleges/${id}/config`, configData);
  return response.data;
};

const updateFeatureFlags = async (id, featureFlags) => {
  const response = await api.put(`/colleges/${id}/features`, featureFlags);
  return response.data;
};

const inviteTpo = async (id, tpoData) => {
  const response = await api.post(`/colleges/${id}/tpo-invite`, tpoData);
  return response.data;
};

const getCollegeStats = async (id) => {
  const response = await api.get(`/colleges/${id}/stats`);
  return response.data;
};

const collegeService = {
  getPublicCollege,
  getColleges,
  createCollege,
  getCollegeById,
  updateCollegeConfig,
  updateFeatureFlags,
  inviteTpo,
  getCollegeStats,
};

export default collegeService;
