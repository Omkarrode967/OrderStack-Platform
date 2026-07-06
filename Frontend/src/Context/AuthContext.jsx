import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. Check localStorage FIRST when the app loads
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('orderstack_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const loginUser = (userData) => {
    setUser(userData);
    // 2. Save the user to the browser so it survives page refreshes
    localStorage.setItem('orderstack_user', JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    // 3. Clear it out when they leave
    localStorage.removeItem('orderstack_user');
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};