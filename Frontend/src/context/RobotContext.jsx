import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { robotsApi, robotHistoryApi } from '../api/robots';

const RobotContext = createContext(null);

export function RobotProvider({ children }) {
  const [robots, setRobots] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load robots + assignment history from the backend once, on mount.
  useEffect(() => {
    let active = true;
    Promise.all([robotsApi.list(), robotHistoryApi.list()])
      .then(([robotsData, historyData]) => {
        if (!active) return;
        setRobots(robotsData);
        setHistory(historyData);
      })
      .catch((err) => {
        if (active) setError(err.message);
        console.error('Failed to load robots:', err);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
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
    setHistory((prev) => [created, ...prev]);
    return created;
  }, []);

  return (
    <RobotContext.Provider value={{ robots, history, loading, error, addRobot, bulkAddRobots, updateRobot, removeRobot, addHistoryEntry }}>
      {children}
    </RobotContext.Provider>
  );
}

export function useRobots() {
  const ctx = useContext(RobotContext);
  if (!ctx) throw new Error('useRobots must be used within RobotProvider');
  return ctx;
}
