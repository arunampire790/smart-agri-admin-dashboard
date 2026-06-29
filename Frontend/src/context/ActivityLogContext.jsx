import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { getActivityLog } from '../utils/activityLogger';

const ActivityLogContext = createContext(null);

export function ActivityLogProvider({ children }) {
  const [entries, setEntries] = useState(() => getActivityLog());
  const intervalRef = useRef(null);

  const refresh = useCallback(() => {
    setEntries(getActivityLog());
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(refresh, 5000);
    return () => clearInterval(intervalRef.current);
  }, [refresh]);

  return (
    <ActivityLogContext.Provider value={{ entries, refresh }}>
      {children}
    </ActivityLogContext.Provider>
  );
}

export function useActivityLog() {
  const ctx = useContext(ActivityLogContext);
  if (!ctx) throw new Error('useActivityLog must be used within ActivityLogProvider');
  return ctx;
}
