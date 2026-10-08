/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { farmsApi } from '../api/farms';
import { useAuth } from './AuthContext';

// Status → Tailwind badge classes. Kept on the client since it's purely a
// display concern the backend doesn't need to store.
const clsForStatus = (status) =>
  status === 'Active'
    ? 'bg-brand-light text-brand-dark'
    : status === 'Idle'
    ? 'bg-warning-bg text-warning-text'
    : 'bg-danger-bg text-danger-text';

// Attach UI-only derived fields the components expect but the API doesn't return.
const normalize = (farm) => ({ ...farm, cls: clsForStatus(farm.status) });

const FarmContext = createContext(null);

export function FarmProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [farms, setFarms] = useState([]);
  // Nothing to wait for while signed out - the fetch below never starts.
  const [loading, setLoading] = useState(isAuthenticated);
  const [error, setError] = useState(null);

  // Load farms once the admin is signed in; the API is staff-only, so
  // fetching before login would just 401. App.jsx remounts this provider when
  // the session changes, so a logout leaves nothing behind.
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let active = true;
    farmsApi
      .list()
      .then((data) => { if (active) setFarms(data.map(normalize)); })
      .catch((err) => {
        if (active) setError(err.message);
        console.error('Failed to load farms:', err);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isAuthenticated]);

  const addFarm = useCallback(async (farm) => {
    const created = await farmsApi.create(farm);
    setFarms((prev) => [normalize(created), ...prev]);
    return created;
  }, []);

  // Signature kept as (oldFarm, newData) so existing pages don't change;
  // we route the update through the farm's backend id.
  const updateFarm = useCallback(async (oldFarm, newData) => {
    const updated = await farmsApi.update(oldFarm.id, newData);
    setFarms((prev) => prev.map((f) => (f.id === oldFarm.id ? normalize(updated) : f)));
    return updated;
  }, []);

  const removeFarm = useCallback(async (farm) => {
    await farmsApi.remove(farm.id);
    setFarms((prev) => prev.filter((f) => f.id !== farm.id));
  }, []);

  return (
    <FarmContext.Provider value={{ farms, loading, error, addFarm, updateFarm, removeFarm }}>
      {children}
    </FarmContext.Provider>
  );
}

export function useFarms() {
  const ctx = useContext(FarmContext);
  if (!ctx) throw new Error('useFarms must be used within FarmProvider');
  return ctx;
}
