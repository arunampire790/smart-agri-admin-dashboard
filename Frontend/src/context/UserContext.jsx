/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usersApi } from '../api/users';
import { useAuth } from './AuthContext';

// Status → Tailwind badge classes. Kept on the client since it's purely a
// display concern the backend doesn't need to store.
const clsForStatus = (status) =>
  status === 'Active'
    ? 'bg-brand-light text-brand-dark'
    : 'bg-danger-bg text-danger-text';

// Attach UI-only derived fields the components expect but the API doesn't return.
const normalize = (user) => ({ ...user, cls: clsForStatus(user.status) });

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  // Nothing to wait for while signed out - the fetch below never starts.
  const [loading, setLoading] = useState(isAuthenticated);
  const [error, setError] = useState(null);

  // Load customers once the admin is signed in; the API is staff-only, so
  // fetching before login would just 401. App.jsx remounts this provider when
  // the session changes, so a logout leaves nothing behind.
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let active = true;
    usersApi
      .list()
      .then((data) => { if (active) setUsers(data.map(normalize)); })
      .catch((err) => {
        if (active) setError(err.message);
        console.error('Failed to load users:', err);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isAuthenticated]);

  // `user` carries the login password alongside the profile fields - the
  // admin issues the credentials, the customer never creates their own.
  const addUser = useCallback(async (user) => {
    const created = await usersApi.create(user);
    setUsers((prev) => [normalize(created), ...prev]);
    return created;
  }, []);

  // Signature kept as (oldUser, newData) so existing pages don't change;
  // we route the update through the user's backend id.
  const updateUser = useCallback(async (oldUser, newData) => {
    const updated = await usersApi.update(oldUser.id, newData);
    setUsers((prev) => prev.map((u) => (u.id === oldUser.id ? normalize(updated) : u)));
    return updated;
  }, []);

  const removeUser = useCallback(async (user) => {
    await usersApi.remove(user.id);
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
  }, []);

  return (
    <UserContext.Provider value={{ users, loading, error, addUser, updateUser, removeUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUsers() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUsers must be used within UserProvider');
  return ctx;
}
