import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tasksApi } from '../api/tasks';
import { useAuth } from './AuthContext';

// The single source of tasks for the whole admin side. Everything here comes
// from the API - including the tasks the advisory engine raises - so the board
// and the engine can never disagree about what needs doing.
//
// Server order is significant: rows arrive ranked by the engine's priority
// score, most urgent first. Filtering is fine; re-sorting throws that away.
const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  // Nothing to wait for while signed out - the fetch below never starts.
  const [loading, setLoading] = useState(isAuthenticated);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let active = true;
    tasksApi
      .list()
      .then((data) => { if (active) setTasks(data); })
      .catch((err) => {
        if (active) setError(err.message);
        console.error('Failed to load tasks:', err);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isAuthenticated]);

  // Running the advisory raises tasks behind the board's back, so a page that
  // can trigger it needs a way to pull the new ones in.
  const refreshTasks = useCallback(async () => {
    const data = await tasksApi.list();
    setTasks(data);
    return data;
  }, []);

  const addTask = useCallback(async (task) => {
    const created = await tasksApi.create(task);
    // Straight to the front: a hand-written task scores 0, so by server order
    // it would appear somewhere down the list with no sign it was created.
    setTasks((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateTask = useCallback(async (id, newData) => {
    const updated = await tasksApi.update(id, newData);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  const updateTaskStatus = useCallback(
    (id, status) => updateTask(id, { status }),
    [updateTask],
  );

  const removeTask = useCallback(async (id) => {
    await tasksApi.remove(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <TaskContext.Provider
      value={{ tasks, loading, error, addTask, updateTask, updateTaskStatus, removeTask, refreshTasks }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
}
