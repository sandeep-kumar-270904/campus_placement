// Mock Auth Service (Local Storage Based) for Frontend Testing
// We will swap this out for actual API calls later!

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const register = async (userData) => {
  await delay(800); // Simulate network request

  // Get existing mock users from localStorage
  const existingUsers = JSON.parse(localStorage.getItem('mock_db_users') || '[]');
  
  // Check if user already exists
  if (existingUsers.find(u => u.email === userData.email)) {
    throw { response: { data: { message: 'User already exists with this email' } } };
  }

  // Create new user object
  const newUser = {
    ...userData,
    id: 'mock_id_' + Math.random().toString(36).substr(2, 9),
    token: 'mock_jwt_token_12345'
  };

  // Save to our "mock database"
  existingUsers.push(newUser);
  localStorage.setItem('mock_db_users', JSON.stringify(existingUsers));

  // Save active session
  localStorage.setItem('token', newUser.token);
  localStorage.setItem('user', JSON.stringify(newUser));

  return newUser;
};

const login = async (userData) => {
  await delay(800); // Simulate network request

  const existingUsers = JSON.parse(localStorage.getItem('mock_db_users') || '[]');
  const user = existingUsers.find(u => u.email === userData.email && u.password === userData.password);

  if (!user) {
    throw { response: { data: { message: 'Invalid email or password' } } };
  }

  // Save active session
  localStorage.setItem('token', user.token);
  localStorage.setItem('user', JSON.stringify(user));

  return user;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const getProfile = async () => {
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
