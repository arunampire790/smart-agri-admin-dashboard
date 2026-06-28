import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Default to masterAdmin since this is a frontend-only demo — the only login account is Admin User / masterAdmin.
  // TODO: Initialize as null and require login once backend is added.
  const [currentUser, setCurrentUser] = useState({ name: 'Admin User', email: 'admin@smartagri.com', role: 'masterAdmin' });

  const login = useCallback((user) => setCurrentUser(user), []);
  const logout = useCallback(() => setCurrentUser(null), []);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
