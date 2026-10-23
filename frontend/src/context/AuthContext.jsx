import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('codetrack_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('codetrack_token');
      const storedUser = localStorage.getItem('codetrack_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify with backend
          const res = await authApi.getMe();
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('codetrack_user', JSON.stringify(res.data));
          }
        } catch (error) {
          console.error('Session expired or invalid:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authApi.login({ email, password });
    if (response.success && response.data) {
      const { token: jwtToken, user: userData } = response.data;
      localStorage.setItem('codetrack_token', jwtToken);
      localStorage.setItem('codetrack_user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return response.data;
    }
    throw new Error(response.message || 'Login failed');
  };

  const register = async (fullName, email, password) => {
    const response = await authApi.register({ fullName, email, password });
    if (response.success && response.data) {
      const { token: jwtToken, user: userData } = response.data;
      localStorage.setItem('codetrack_token', jwtToken);
      localStorage.setItem('codetrack_user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return response.data;
    }
    throw new Error(response.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('codetrack_token');
    localStorage.removeItem('codetrack_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('codetrack_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
