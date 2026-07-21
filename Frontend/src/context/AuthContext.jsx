import { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../api/auth';
import { getAccessToken } from '../api/client';

const AuthContext = createContext(null);

const USER_KEY = 'authUser';

function loadStoredUser() {
  // Only consider the user logged in if a token is present.
  if (!getAccessToken()) return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(loadStoredUser);

  // Verify credentials against the backend (SimpleJWT). Throws on failure.
  const login = useCallback(async (email, password) => {
    await authApi.login(email, password);
    const user = { name: 'Admin User', email, role: 'masterAdmin' };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setCurrentUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    localStorage.removeItem(USER_KEY);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated: !!currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
