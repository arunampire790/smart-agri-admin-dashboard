import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi } from '../api/auth';
import { getAccessToken, setSessionExpiredHandler } from '../api/client';

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

  // When the API gives up on the stored session (refresh token gone or
  // rejected), forget the user so ProtectedRoute sends them to the login page.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      localStorage.removeItem(USER_KEY);
      setCurrentUser(null);
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  const storeUser = useCallback((user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setCurrentUser(user);
    return user;
  }, []);

  // Refresh the stored profile from the backend on page load, so a name or
  // email changed in another tab (or by another admin) shows up here too.
  useEffect(() => {
    if (!getAccessToken()) return;
    authApi.getAccount().then(storeUser).catch(() => {
      // Offline or session gone - keep what we have; the client's own 401
      // handling signs the user out if the session is really over.
    });
  }, [storeUser]);

  // Verify credentials against the backend (SimpleJWT). Throws on failure.
  const login = useCallback(async (email, password) => {
    await authApi.login(email, password);
    let user;
    try {
      user = await authApi.getAccount();
    } catch {
      // Signed in, but the profile didn't load. Fall back to what we know
      // rather than failing a login whose password was correct.
      user = { name: email, email, role: 'admin' };
    }
    return storeUser(user);
  }, [storeUser]);

  // Save profile fields to the backend and show the saved result.
  // Throws on failure (e.g. email already taken) so forms can show it.
  const updateAccount = useCallback(async (fields) => {
    const user = await authApi.updateAccount(fields);
    return storeUser(user);
  }, [storeUser]);

  const logout = useCallback(() => {
    authApi.logout();
    localStorage.removeItem(USER_KEY);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated: !!currentUser, login, logout, updateAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
