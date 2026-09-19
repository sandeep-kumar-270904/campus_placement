import api from './api';

const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  getProfile,
};

export default authService;
