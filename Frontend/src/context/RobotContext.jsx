import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { robotsApi, robotHistoryApi } from '../api/robots';
import { sanitizeFarmerField } from '../utils/sanitizeFarmer';
import { useAuth } from './AuthContext';

const RobotContext = createContext(null);

export function RobotProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [robots, setRobots] = useState([]);
  const [history, setHistory] = useState([]);
  // Nothing to wait for while signed out - the fetch below never starts.
  const [loading, setLoading] = useState(isAuthenticated);
  const [error, setError] = useState(null);

  // Load robots + assignment history once the admin is signed in; the API is
  // staff-only, so fetching before login would just 401. App.jsx remounts this
  // provider when the session changes, so a logout leaves nothing behind.
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let active = true;
    Promise.all([robotsApi.list(), robotHistoryApi.list()])
      .then(([robotsData, historyData]) => {
        if (!active) return;
        setRobots(robotsData);
        setHistory(historyData.map((h) => ({ ...h, farmer: sanitizeFarmerField(h.farmer) })));
      })
      .catch((err) => {
        if (active) setError(err.message);
        console.error('Failed to load robots:', err);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isAuthenticated]);

  // Re-read the list when something outside these helpers changed a robot.
  // Telemetry does exactly that: a reading carries the robot's charge, so
  // the battery on screen is stale the moment one arrives.
  const refreshRobots = useCallback(async () => {
    const data = await robotsApi.list();
    setRobots(data);
    return data;
  }, []);

  const addRobot = useCallback(async (robot) => {
    const created = await robotsApi.create(robot);
    setRobots((prev) => [...prev, created]);
    return created;
  }, []);

  const bulkAddRobots = useCallback(async (newRobots) => {
    const created = await robotsApi.bulkCreate(newRobots);
    setRobots((prev) => [...prev, ...created]);
    return created;
  }, []);

  // Signature kept as (oldRobot, newData); routed through the robot's id.
  const updateRobot = useCallback(async (oldRobot, newData) => {
    const updated = await robotsApi.update(oldRobot.id, newData);
    setRobots((prev) => prev.map((r) => (r.id === oldRobot.id ? updated : r)));
    return updated;
  }, []);

  const removeRobot = useCallback(async (robot) => {
    await robotsApi.remove(robot.id);
    setRobots((prev) => prev.filter((r) => r.id !== robot.id));
  }, []);

  const addHistoryEntry = useCallback(async (entry) => {
    const created = await robotHistoryApi.create(entry);
    setHistory((prev) => [{ ...created, farmer: sanitizeFarmerField(created.farmer) }, ...prev]);
    return created;
  }, []);

  return (
    <RobotContext.Provider value={{ robots, history, loading, error, addRobot, bulkAddRobots, updateRobot, removeRobot, addHistoryEntry, refreshRobots }}>
      {children}
    </RobotContext.Provider>
  );
}

export function useRobots() {
  const ctx = useContext(RobotContext);
  if (!ctx) throw new Error('useRobots must be used within RobotProvider');
  return ctx;
}
