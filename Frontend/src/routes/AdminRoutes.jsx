import { Routes, Route, Navigate } from 'react-router-dom';
import { EmployeeProvider } from '../context/EmployeeContext';
import AdminLayout from '../admin/components/AdminLayout';
import Dashboard from '../admin/pages/Dashboard';
import Users from '../admin/pages/Users';
import Farms from '../admin/pages/Farms';
import Robots from '../admin/pages/Robots';
import Tasks from '../admin/pages/Tasks';
import Analytics from '../admin/pages/Analytics';
import Settings from '../admin/pages/Settings';
import Employees from '../admin/pages/Employees';
import SensorsDetails from '../admin/pages/SensorsDetails';
import RobotAssignment from '../admin/pages/RobotAssignment';
import Advisory from '../admin/pages/Advisory';
import RobotData from '../admin/pages/RobotData';
import ActivityLog from '../admin/components/ActivityLog';

export default function AdminRoutes() {
  return (
    <Routes>
      {/* TaskProvider lives in App.jsx - a second one here would mean two
          fetches and two copies of the board that drift apart. */}
      <Route path="/" element={<EmployeeProvider><AdminLayout /></EmployeeProvider>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="farms" element={<Farms />} />
        <Route path="robots" element={<Robots />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        {/* Both temporary: one previews the advice that will live in the
            farmer app, the other stands in for the robot that will feed it. */}
        <Route path="advisory" element={<Advisory />} />
        <Route path="robot-data" element={<RobotData />} />
        <Route path="employees" element={<Employees />} />
        <Route path="sensors" element={<SensorsDetails />} />
        <Route path="robot-assignment" element={<RobotAssignment />} />
        <Route path="activity-log" element={<ActivityLog />} />
      </Route>
    </Routes>
  );
}
