import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import '../styles/admin.css';

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/admin/login');
  };

  return (
    <div className="admin-app-container">
      <div className="app">
        <div className="sidebar">
          <div className="logo">
            <div className="logo-icon"><i className="ti ti-plant-2" aria-hidden="true"></i></div>
            <div>
              <div className="logo-text">Smart Agriculture</div>
              <div className="logo-sub">Admin Panel</div>
            </div>
          </div>
          <nav>
            <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <i className="ti ti-layout-dashboard" aria-hidden="true"></i> Dashboard
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <i className="ti ti-users" aria-hidden="true"></i> Users
            </NavLink>
            <NavLink to="/admin/farms" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <i className="ti ti-building-cottage" aria-hidden="true"></i> Farms
            </NavLink>
            <NavLink to="/admin/robots" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <i className="ti ti-robot" aria-hidden="true"></i> Robots
            </NavLink>
            <NavLink to="/admin/tasks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <i className="ti ti-checklist" aria-hidden="true"></i> Tasks
            </NavLink>
            <NavLink to="/admin/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <i className="ti ti-chart-bar" aria-hidden="true"></i> Analytics
            </NavLink>
            <NavLink to="/admin/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <i className="ti ti-settings" aria-hidden="true"></i> Settings
            </NavLink>
          </nav>
          <div className="sidebar-footer">
            <div className="admin-info">
              <div className="avatar">AD</div>
              <div>
                <div className="admin-name">Admin User</div>
                <div className="admin-email">admin@smartagri.com</div>
              </div>
            </div>
          </div>
        </div>

        <div className="main-content-layout">
          <div className="topbar">
            <div className="search">
              <i className="ti ti-search" style={{ color: 'var(--color-text-placeholder)' }} aria-hidden="true"></i>
              <input placeholder="Search..." aria-label="Search" />
            </div>
            <div className="topbar-right">
              <div className="capsule">
                EN / 日本語
              </div>
              <div className="capsule" style={{ gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#137333', display: 'inline-block' }}></span>
                System Online
              </div>
              <button className="notif" aria-label="Notifications" style={{ margin: '0 8px' }}>
                <i className="ti ti-bell" aria-hidden="true"></i>
                <span className="notif-badge">3</span>
              </button>
              <button className="icon-btn" aria-label="Profile" style={{ marginLeft: '4px' }}>
                <i className="ti ti-user" aria-hidden="true"></i>
              </button>
              <button className="icon-btn" onClick={handleLogout} aria-label="Logout" style={{ marginLeft: '4px' }}>
                <i className="ti ti-logout" aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <div className="content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
