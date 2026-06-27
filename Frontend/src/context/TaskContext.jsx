import { createContext, useContext, useState } from 'react';

const initialTasks = [
  { id: 't1', title: 'Water wheat fields', assignedTo: 'John Smith', farm: 'Green Valley Farm', type: 'Irrigation', priority: 'High', dueDate: '2026-04-09', status: 'Pending' },
  { id: 't2', title: 'Apply nitrogen fertilizer', assignedTo: 'Michael Brown', farm: 'Golden Harvest', type: 'Fertilizer', priority: 'Medium', dueDate: '2026-04-10', status: 'Pending' },
  { id: 't3', title: 'Monitor soil moisture', assignedTo: 'Emily Davis', farm: 'Maple Ridge Farm', type: 'Inspection', priority: 'Medium', dueDate: '2026-04-11', status: 'Pending' },
  { id: 't4', title: 'Prune grapevines', assignedTo: 'David Wilson', farm: 'River Bend Agriculture', type: 'Maintenance', priority: 'Low', dueDate: '2026-04-12', status: 'Pending' },
  { id: 't5', title: 'Inspect irrigation lines', assignedTo: 'Sarah Johnson', farm: 'Sunrise Orchards', type: 'Inspection', priority: 'High', dueDate: '2026-04-08', status: 'Pending' },
  { id: 't6', title: 'Inspect apple trees', assignedTo: 'Sarah Johnson', farm: 'Sunrise Orchards', type: 'Inspection', priority: 'Low', dueDate: '2026-04-07', status: 'In Progress' },
  { id: 't7', title: 'Harvest tomatoes', assignedTo: 'John Smith', farm: 'Green Valley Farm', type: 'Harvest', priority: 'High', dueDate: '2026-04-13', status: 'In Progress' },
  { id: 't8', title: 'Plant cover crops', assignedTo: 'Michael Brown', farm: 'Golden Harvest', type: 'Planting', priority: 'Medium', dueDate: '2026-04-04', status: 'Completed' },
  { id: 't9', title: 'Install drip irrigation', assignedTo: 'Emily Davis', farm: 'Maple Ridge Farm', type: 'Irrigation', priority: 'High', dueDate: '2026-04-02', status: 'Completed' },
  { id: 't10', title: 'Apply herbicide', assignedTo: 'David Wilson', farm: 'Highland Crops', type: 'Fertilizer', priority: 'Low', dueDate: '2026-03-30', status: 'Completed' },
];

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(initialTasks);

  const addTask = (task) => setTasks((prev) => [...prev, { ...task, id: 't' + Date.now() }]);
  const updateTaskStatus = (id, status) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  const updateTask = (id, newData) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...newData } : t)));
  const removeTask = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTaskStatus, updateTask, removeTask }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
}
