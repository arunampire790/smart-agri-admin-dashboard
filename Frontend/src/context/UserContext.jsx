import { createContext, useContext, useState } from 'react';

const initialUsers = [
  { name: 'John Smith', email: 'john.smith@example.com', phone: '+1-555-0101', farms: 3, status: 'Active', cls: 'bg-brand-light text-[#137333]', joined: '2025-12-15' },
  { name: 'Sarah Johnson', email: 'sarah.j@example.com', phone: '+1-555-0102', farms: 2, status: 'Active', cls: 'bg-brand-light text-[#137333]', joined: '2026-01-10' },
  { name: 'Michael Brown', email: 'michael.b@example.com', phone: '+1-555-0103', farms: 5, status: 'Active', cls: 'bg-brand-light text-[#137333]', joined: '2025-11-20' },
  { name: 'Emily Davis', email: 'emily.davis@example.com', phone: '+1-555-0104', farms: 1, status: 'Inactive', cls: 'bg-danger-bg text-danger-text', joined: '2026-02-05' },
  { name: 'David Wilson', email: 'david.w@example.com', phone: '+1-555-0105', farms: 4, status: 'Active', cls: 'bg-brand-light text-[#137333]', joined: '2025-10-12' },
];

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [users, setUsers] = useState(initialUsers);

  const addUser = (user) => setUsers((prev) => [...prev, user]);
  const updateUser = (oldUser, newData) =>
    setUsers((prev) => prev.map((u) => (u === oldUser ? { ...u, ...newData } : u)));
  const removeUser = (user) => setUsers((prev) => prev.filter((u) => u !== user));

  return (
    <UserContext.Provider value={{ users, addUser, updateUser, removeUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUsers() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUsers must be used within UserProvider');
  return ctx;
}
