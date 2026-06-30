import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlobalHeader from './GlobalHeader';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isMasterAdmin = currentUser?.role === 'masterAdmin';
  const [robotsOpen, setRobotsOpen] = useState(false);
  const [employeesOpen, setEmployeesOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const isRobotsActive = location.pathname === '/admin/robots' || location.pathname === '/admin/sensors';
  const isEmployeesActive = location.pathname === '/admin/employees' || location.pathname === '/admin/activity-log';

  const navItemBase = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '11px 12px',
    borderRadius: 12,
    fontSize: 14,
    cursor: 'pointer',
    userSelect: 'none',
    width: '100%',
    boxSizing: 'border-box',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    position: 'relative',
  };

  const navItemInactive = {
    ...navItemBase,
    color: '#6B7280',
    fontWeight: 500,
  };

  const navItemActive = {
    ...navItemBase,
    color: '#1C1C1E',
    fontWeight: 600,
    background: 'rgba(5, 150, 105, 0.08)',
  };

  const childItemInactive = {
    padding: '9px 12px 9px 24px',
    borderRadius: 10,
    fontSize: 13,
    color: '#6B7280',
    fontWeight: 500,
    cursor: 'pointer',
    userSelect: 'none',
    background: 'none',
    border: 'none',
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'left',
  };

  return (
    <div className="relative bg-surface text-primary h-screen overflow-hidden flex">
      <div className="fixed pointer-events-none z-0" style={{ width: 400, height: 400, background: '#10B981', filter: 'blur(120px)', opacity: 0.35, top: '-10%', left: '-10%' }} />
      <div className="fixed pointer-events-none z-0" style={{ width: 500, height: 500, background: '#6366F1', filter: 'blur(150px)', opacity: 0.25, top: '30%', right: '-5%' }} />
      <div className="fixed pointer-events-none z-0" style={{ width: 350, height: 350, background: '#EC4899', filter: 'blur(100px)', opacity: 0.2, bottom: '-5%', left: '15%' }} />

      <aside style={{
        width: 220,
        minWidth: 220,
        minHeight: '100%',
        background: 'rgba(255, 255, 255, 0.35)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: 20,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
      }}>
        <div style={{ padding: '18px 18px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: '#059669', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="ph ph-leaf" style={{ color: '#fff', fontSize: 17 }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1E' }}>Smart Agriculture</div>
            <div style={{ fontSize: 11, color: '#8E8E93' }}>Admin Panel</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div
            onClick={() => navigate('/admin/dashboard')}
            className={isActive('/admin/dashboard') ? 'nav-active-indicator' : undefined}
            style={isActive('/admin/dashboard') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/dashboard')) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
            onMouseLeave={(e) => { if (!isActive('/admin/dashboard')) e.currentTarget.style.background = 'none'; }}
          >
            <span>Dashboard</span>
          </div>

          <div
            onClick={() => navigate('/admin/analytics')}
            className={isActive('/admin/analytics') ? 'nav-active-indicator' : undefined}
            style={isActive('/admin/analytics') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/analytics')) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
            onMouseLeave={(e) => { if (!isActive('/admin/analytics')) e.currentTarget.style.background = 'none'; }}
          >
            <span>Analytics</span>
          </div>

          <div>
            <div
              onClick={() => { navigate('/admin/robots'); setRobotsOpen((o) => !o); }}
              className={isRobotsActive ? 'nav-active-indicator' : undefined}
              style={isRobotsActive ? navItemActive : navItemInactive}
              onMouseEnter={(e) => { if (!isRobotsActive) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
              onMouseLeave={(e) => { if (!isRobotsActive) e.currentTarget.style.background = isRobotsActive ? 'rgba(5,150,105,0.08)' : 'none'; }}
            >
              <span>Robots</span>
              <i
                className="ph ph-caret-down"
                style={{
                  fontSize: 12,
                  color: '#8E8E93',
                  transition: 'transform 0.2s',
                  transform: robotsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </div>
            {robotsOpen && (
              <div
                onClick={() => navigate('/admin/sensors')}
                className={isActive('/admin/sensors') ? 'nav-active-indicator' : undefined}
                style={isActive('/admin/sensors') ? { ...childItemInactive, color: '#1C1C1E', fontWeight: 600, background: 'rgba(5,150,105,0.08)' } : childItemInactive}
                onMouseEnter={(e) => { if (!isActive('/admin/sensors')) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                onMouseLeave={(e) => { if (!isActive('/admin/sensors')) e.currentTarget.style.background = 'none'; }}
              >
                Robot Sensor Details
              </div>
            )}
          </div>

          <div
            onClick={() => navigate('/admin/users')}
            className={isActive('/admin/users') ? 'nav-active-indicator' : undefined}
            style={isActive('/admin/users') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/users')) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
            onMouseLeave={(e) => { if (!isActive('/admin/users')) e.currentTarget.style.background = 'none'; }}
          >
            <span>Users</span>
          </div>

          <div
            onClick={() => navigate('/admin/farms')}
            className={isActive('/admin/farms') ? 'nav-active-indicator' : undefined}
            style={isActive('/admin/farms') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/farms')) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
            onMouseLeave={(e) => { if (!isActive('/admin/farms')) e.currentTarget.style.background = 'none'; }}
          >
            <span>Farms</span>
          </div>

          <div
            onClick={() => navigate('/admin/tasks')}
            className={isActive('/admin/tasks') ? 'nav-active-indicator' : undefined}
            style={isActive('/admin/tasks') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/tasks')) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
            onMouseLeave={(e) => { if (!isActive('/admin/tasks')) e.currentTarget.style.background = 'none'; }}
          >
            <span>Tasks</span>
          </div>

          {isMasterAdmin && (
            <div>
              <div
                onClick={() => { navigate('/admin/employees'); setEmployeesOpen((o) => !o); }}
                className={isEmployeesActive ? 'nav-active-indicator' : undefined}
                style={isEmployeesActive ? navItemActive : navItemInactive}
                onMouseEnter={(e) => { if (!isEmployeesActive) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                onMouseLeave={(e) => { if (!isEmployeesActive) e.currentTarget.style.background = isEmployeesActive ? 'rgba(5,150,105,0.08)' : 'none'; }}
              >
                <span>Employees</span>
                <i
                  className="ph ph-caret-down"
                  style={{
                    fontSize: 12,
                    color: '#8E8E93',
                    transition: 'transform 0.2s',
                    transform: employeesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </div>
              {employeesOpen && (
                <div
                  onClick={() => navigate('/admin/activity-log')}
                  className={isActive('/admin/activity-log') ? 'nav-active-indicator' : undefined}
                  style={isActive('/admin/activity-log') ? { ...childItemInactive, color: '#1C1C1E', fontWeight: 600, background: 'rgba(5,150,105,0.08)' } : childItemInactive}
                  onMouseEnter={(e) => { if (!isActive('/admin/activity-log')) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                  onMouseLeave={(e) => { if (!isActive('/admin/activity-log')) e.currentTarget.style.background = 'none'; }}
                >
                  Audit Log
                </div>
              )}
            </div>
          )}

          <div
            onClick={() => navigate('/admin/settings')}
            className={isActive('/admin/settings') ? 'nav-active-indicator' : undefined}
            style={isActive('/admin/settings') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/settings')) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
            onMouseLeave={(e) => { if (!isActive('/admin/settings')) e.currentTarget.style.background = 'none'; }}
          >
            <span>Settings</span>
          </div>
        </nav>

        <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0 }}>AD</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1E' }}>Admin User</div>
            <div style={{ fontSize: 11, color: '#8E8E93' }}>admin@smartagri.com</div>
          </div>
        </div>
      </aside>

      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        <GlobalHeader />
        <main className="p-6 flex-1 overflow-y-auto content-visibility-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}