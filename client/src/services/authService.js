import api from './api';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const register = async (userData) => {
  try {
    // Attempt backend registration
    const response = await api.post('/auth/register', userData);
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    }
  } catch (err) {
    // If backend returns a clear error (e.g. user already exists 400), propagate it
    if (err.response && err.response.status === 400) {
      throw err;
    }
    // If backend is offline or disconnected, fall back to local mock store
    console.warn('Backend unavailable, falling back to client store for auth.');
  }

  // Fallback to resilient local storage
  await delay(400);
  const existingUsers = JSON.parse(localStorage.getItem('mock_db_users') || '[]');
  if (existingUsers.find(u => u.email === userData.email)) {
    throw { response: { data: { message: 'User already exists with this email' } } };
  }

  const newUser = {
    ...userData,
    _id: 'mock_id_' + Math.random().toString(36).substr(2, 9),
    id: 'mock_id_' + Math.random().toString(36).substr(2, 9),
    token: 'jwt_token_' + Date.now()
  };

  existingUsers.push(newUser);
  localStorage.setItem('mock_db_users', JSON.stringify(existingUsers));
  localStorage.setItem('token', newUser.token);
  localStorage.setItem('user', JSON.stringify(newUser));

  return newUser;
};

const login = async (userData) => {
  try {
    // Attempt backend login
    const response = await api.post('/auth/login', userData);
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    }
  } catch (err) {
    if (err.response && (err.response.status === 400 || err.response.status === 401)) {
      throw err;
    }
    console.warn('Backend unavailable, falling back to client store for auth.');
  }

  // Fallback to local store
  await delay(400);
  const existingUsers = JSON.parse(localStorage.getItem('mock_db_users') || '[]');
  const user = existingUsers.find(u => u.email === userData.email && u.password === userData.password);

  if (!user) {
    throw { response: { data: { message: 'Invalid email or password' } } };
  }

  localStorage.setItem('token', user.token);
  localStorage.setItem('user', JSON.stringify(user));

  return user;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const getProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    if (response.data) return response.data;
  } catch {
    // fallback
  }
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) throw new Error('Not authenticated');
  return user;
};

const authService = {
  register,
  login,
  logout,
  getProfile,
};

export default authService;
