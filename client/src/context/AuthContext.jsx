import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user:', err);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, collegeCode) => {
    const data = await authService.login({ email, password, collegeCode });
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data);
    return data;
  };

  const googleLogin = async (payload) => {
    const data = await authService.googleLogin(payload);
    setUser(data);
    return data;
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('active_college');
    localStorage.removeItem('selectedCollegeId');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, googleLogin, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
