import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { employeesApi } from '../api/employees';
import { useAuth } from './AuthContext';

const EmployeeContext = createContext(null);

export function EmployeeProvider({ children }) {
  const { currentUser } = useAuth();
  // The endpoint is master-admin only. Asking as anyone else would get a 403,
  // which the API client treats as "wrong session" and signs them out - so
  // other staff simply see no employees (they can't open the page anyway).
  const canManage = currentUser?.role === 'masterAdmin';
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(canManage);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!canManage) return undefined;
    let active = true;
    employeesApi
      .list()
      .then((data) => { if (active) setEmployees(data); })
      .catch((err) => {
        if (active) setError(err.message);
        console.error('Failed to load employees:', err);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [canManage]);

  const addEmployee = useCallback(async (emp) => {
    const created = await employeesApi.create(emp);
    setEmployees((prev) => [...prev, created]);
    return created;
  }, []);

  const updateEmployee = useCallback(async (oldEmp, newData) => {
    const updated = await employeesApi.update(oldEmp.id, newData);
    setEmployees((prev) => prev.map((e) => (e.id === oldEmp.id ? updated : e)));
    return updated;
  }, []);

  const removeEmployee = useCallback(async (emp) => {
    await employeesApi.remove(emp.id);
    setEmployees((prev) => prev.filter((e) => e.id !== emp.id));
  }, []);

  return (
    <EmployeeContext.Provider value={{ employees, loading, error, addEmployee, updateEmployee, removeEmployee }}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployees() {
  const ctx = useContext(EmployeeContext);
  if (!ctx) throw new Error('useEmployees must be used within EmployeeProvider');
  return ctx;
}
