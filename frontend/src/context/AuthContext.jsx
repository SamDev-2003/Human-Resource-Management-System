import React, { createContext, useContext, useState } from 'react';
import API from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('hrms_user');
    return u ? JSON.parse(u) : null;
  });

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('hrms_token', data.token);
    localStorage.setItem('hrms_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('hrms_token');
    localStorage.removeItem('hrms_user');
    setUser(null);
  };

  const isAdmin   = () => user?.role === 'admin';
  const isHR      = () => ['admin', 'hr_manager'].includes(user?.role);
  const isEmployee= () => user?.role === 'employee';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isHR, isEmployee }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
