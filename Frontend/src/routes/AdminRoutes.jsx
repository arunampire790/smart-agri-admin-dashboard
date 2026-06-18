import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from '../admin/pages/AdminLogin';
import AdminLayout from '../admin/components/AdminLayout';
import Dashboard from '../admin/pages/Dashboard';
import Users from '../admin/pages/Users';
import Farms from '../admin/pages/Farms';
import Robots from '../admin/pages/Robots';
import Tasks from '../admin/pages/Tasks';
import Analytics from '../admin/pages/Analytics';
import Settings from '../admin/pages/Settings';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="farms" element={<Farms />} />
        <Route path="robots" element={<Robots />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
