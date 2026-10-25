import api from './api';

const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data && response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  if (response.data && response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const googleLogin = async (payload) => {
  const response = await api.post('/auth/google', payload);
  if (response.data && response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    console.warn('Backend logout notification failed:', err.message);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

const forgotPassword = async (email, collegeCode) => {
  const response = await api.post('/auth/forgot-password', { email, collegeCode });
  return response.data;
};

const resetPassword = async (token, password) => {
  const response = await api.post('/auth/reset-password', { token, password });
  return response.data;
};

const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

const getSessions = async () => {
  const response = await api.get('/auth/sessions');
  return response.data.sessions || [];
};

const revokeSession = async (id) => {
  const response = await api.delete(`/auth/sessions/${id}`);
  return response.data;
};

const revokeOtherSessions = async () => {
  const response = await api.delete('/auth/sessions/other');
  return response.data;
};

const authService = {
  register,
  login,
  googleLogin,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
  getSessions,
  revokeSession,
  revokeOtherSessions,
};

export default authService;
