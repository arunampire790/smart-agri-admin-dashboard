import { createContext, useContext, useState } from 'react';

const initialRobots = [
  { name: 'AgriBot Alpha', id: 'AgriBot-001', farm: 'Green Valley Farm', model: 'AB-X1000', battery: 85, status: 'Active' },
  { name: 'AgriBot Beta', id: 'AgriBot-002', farm: 'Sunrise Orchards', model: 'AB-X1000', battery: 62, status: 'Active' },
  { name: 'AgriBot Gamma', id: 'AgriBot-003', farm: 'Golden Harvest', model: 'AB-X2000', battery: 45, status: 'Idle' },
  { name: 'AgriBot Delta', id: 'AgriBot-004', farm: 'Maple Ridge Farm', model: 'AB-X1000', battery: 92, status: 'Active' },
];

const RobotContext = createContext(null);

export function RobotProvider({ children }) {
  const [robots, setRobots] = useState(initialRobots);

  const addRobot = (robot) => setRobots((prev) => [...prev, robot]);
  const updateRobot = (oldRobot, newData) =>
    setRobots((prev) => prev.map((r) => (r === oldRobot ? { ...r, ...newData } : r)));
  const removeRobot = (robot) => setRobots((prev) => prev.filter((r) => r !== robot));

  return (
    <RobotContext.Provider value={{ robots, addRobot, updateRobot, removeRobot }}>
      {children}
    </RobotContext.Provider>
  );
}

export function useRobots() {
  const ctx = useContext(RobotContext);
  if (!ctx) throw new Error('useRobots must be used within RobotProvider');
  return ctx;
}
