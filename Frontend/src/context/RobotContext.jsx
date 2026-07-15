import { createContext, useContext, useState } from 'react';

const initialRobots = [
  { id: "ROB-0001", name: "AgriBot Alpha",  model: "AB-X1000", status: "Active",     farmer: "John Smith",    farm: "Green Valley Farm",  battery: 85, registered: "2025-12-15", notes: "" },
  { id: "ROB-0002", name: "AgriBot Beta",   model: "AB-X1000", status: "Assigned",   farmer: "Sarah Johnson", farm: "Sunrise Orchards",   battery: 62, registered: "2026-01-10", notes: "" },
  { id: "ROB-0003", name: "AgriBot Gamma",  model: "AB-X2000", status: "Maintenance",farmer: "Michael Brown", farm: "Golden Harvest",     battery: 45, registered: "2025-11-20", notes: "" },
  { id: "ROB-0004", name: "AgriBot Delta",  model: "AB-X1000", status: "Active",     farmer: "John Smith",    farm: "Maple Ridge Farm",   battery: 92, registered: "2025-10-12", notes: "" },
  { id: "ROB-0005", name: "AgriBot Epsilon",model: "AB-X1000", status: "Available",  farmer: null,            farm: "",                   battery: 0,  registered: "2026-03-01", notes: "" },
  { id: "ROB-0006", name: "AgriBot Zeta",   model: "AB-X2000", status: "Available",  farmer: null,            farm: "",                   battery: 0,  registered: "2026-03-15", notes: "" },
  { id: "ROB-0007", name: "AgriBot Eta",    model: "AB-X1000", status: "Inactive",   farmer: "Emily Davis",   farm: "",                   battery: 0,  registered: "2026-02-05", notes: "" },
  { id: "ROB-0008", name: "AgriBot Theta",  model: "AB-X2000", status: "Lost",       farmer: null,            farm: "",                   battery: 0,  registered: "2025-09-30", notes: "" },
];

const initialHistory = [
  { robotId: "ROB-0001", action: "Assigned",   farmer: "John Smith",    by: "Admin User", date: "2025-12-15" },
  { robotId: "ROB-0002", action: "Assigned",   farmer: "Sarah Johnson", by: "Admin User", date: "2026-01-10" },
  { robotId: "ROB-0003", action: "Assigned",   farmer: "Michael Brown", by: "Admin User", date: "2025-11-20" },
  { robotId: "ROB-0003", action: "Maintenance",farmer: "Michael Brown", by: "Admin User", date: "2026-03-01" },
  { robotId: "ROB-0007", action: "Assigned",   farmer: "Emily Davis",   by: "Admin User", date: "2026-02-05" },
  { robotId: "ROB-0007", action: "Deactivated",farmer: "Emily Davis",   by: "Admin User", date: "2026-04-01" },
];

const RobotContext = createContext(null);

export function RobotProvider({ children }) {
  const [robots, setRobots] = useState(initialRobots);
  const [history, setHistory] = useState(initialHistory);

  const addRobot = (robot) => setRobots((prev) => [...prev, robot]);
  const updateRobot = (oldRobot, newData) =>
    setRobots((prev) => prev.map((r) => (r === oldRobot ? { ...r, ...newData } : r)));
  const removeRobot = (robot) => setRobots((prev) => prev.filter((r) => r !== robot));
  const addHistoryEntry = (entry) => setHistory((prev) => [entry, ...prev]);

  return (
    <RobotContext.Provider value={{ robots, history, addRobot, updateRobot, removeRobot, addHistoryEntry }}>
      {children}
    </RobotContext.Provider>
  );
}

export function useRobots() {
  const ctx = useContext(RobotContext);
  if (!ctx) throw new Error('useRobots must be used within RobotProvider');
  return ctx;
}
