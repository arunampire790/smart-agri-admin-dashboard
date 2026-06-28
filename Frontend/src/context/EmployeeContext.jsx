import { createContext, useContext, useState } from 'react';

const initialEmployees = [
  { name: 'Alice Walker', email: 'alice.walker@smartagri.com', phone: '+1-555-0201', role: 'admin', status: 'Active', joined: '2025-09-01' },
  { name: 'Bob Chen', email: 'bob.chen@smartagri.com', phone: '+1-555-0202', role: 'admin', status: 'Active', joined: '2025-10-15' },
  { name: 'Carol Martinez', email: 'carol.m@smartagri.com', phone: '+1-555-0203', role: 'admin', status: 'Inactive', joined: '2026-01-20' },
];

const EmployeeContext = createContext(null);

export function EmployeeProvider({ children }) {
  const [employees, setEmployees] = useState(initialEmployees);

  const addEmployee = (emp) => setEmployees((prev) => [...prev, { ...emp, role: 'admin' }]);
  const updateEmployee = (oldEmp, newData) =>
    setEmployees((prev) => prev.map((e) => (e === oldEmp ? { ...e, ...newData } : e)));
  const removeEmployee = (emp) => setEmployees((prev) => prev.filter((e) => e !== emp));

  return (
    <EmployeeContext.Provider value={{ employees, addEmployee, updateEmployee, removeEmployee }}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployees() {
  const ctx = useContext(EmployeeContext);
  if (!ctx) throw new Error('useEmployees must be used within EmployeeProvider');
  return ctx;
}
