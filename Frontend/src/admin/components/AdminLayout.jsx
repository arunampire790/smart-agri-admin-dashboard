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

  const isActive = (path) => location.pathname === path;
  const isRobotsActive = location.pathname === '/admin/robots' || location.pathname === '/admin/sensors';

  const navItemBase = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '11px 10px',
    borderRadius: 10,
    fontSize: 15,
    cursor: 'pointer',
    userSelect: 'none',
    width: '100%',
    boxSizing: 'border-box',
    border: 'none',
    background: 'none',
    textAlign: 'left',
  };

  const navItemInactive = {
    ...navItemBase,
    color: '#5a6a60',
    fontWeight: 400,
    background: 'none',
  };

  const navItemActive = {
    ...navItemBase,
    color: '#1a2e20',
    fontWeight: 700,
    background: 'rgba(255,255,255,0.45)',
  };

  const childItemInactive = {
    padding: '11px 10px 11px 24px',
    borderRadius: 10,
    fontSize: 14,
    color: '#5a6a60',
    fontWeight: 400,
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
        background: 'linear-gradient(170deg, #b8dece 0%, #ccd4e8 55%, #ddc8e4 100%)',
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
      }}>
        <div style={{ padding: '18px 18px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: '#1e6e43', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="ph ph-leaf" style={{ color: '#fff', fontSize: 18 }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1a2e20' }}>Smart Agriculture</div>
            <div style={{ fontSize: 11, color: '#5a6a60' }}>Admin Panel</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div
            onClick={() => navigate('/admin/dashboard')}
            style={isActive('/admin/dashboard') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/dashboard')) e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={(e) => { if (!isActive('/admin/dashboard')) e.currentTarget.style.background = 'none'; }}
          >
            <span>Dashboard</span>
          </div>

          <div
            onClick={() => navigate('/admin/analytics')}
            style={isActive('/admin/analytics') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/analytics')) e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={(e) => { if (!isActive('/admin/analytics')) e.currentTarget.style.background = 'none'; }}
          >
            <span>Analytics</span>
          </div>

          <div>
            <div
              onClick={() => { navigate('/admin/robots'); setRobotsOpen((o) => !o); }}
              style={isRobotsActive ? navItemActive : navItemInactive}
              onMouseEnter={(e) => { if (!isRobotsActive) e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={(e) => { if (!isRobotsActive) e.currentTarget.style.background = isRobotsActive ? 'rgba(255,255,255,0.45)' : 'none'; }}
            >
              <span>Robots</span>
              <i
                className="ph ph-caret-down"
                style={{
                  fontSize: 13,
                  color: '#5a6a60',
                  transition: 'transform 0.2s',
                  transform: robotsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </div>
            {robotsOpen && (
              <div
                onClick={() => navigate('/admin/sensors')}
                style={isActive('/admin/sensors') ? { ...childItemInactive, color: '#1a2e20', fontWeight: 700, background: 'rgba(255,255,255,0.45)' } : childItemInactive}
                onMouseEnter={(e) => { if (!isActive('/admin/sensors')) e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
                onMouseLeave={(e) => { if (!isActive('/admin/sensors')) e.currentTarget.style.background = 'none'; }}
              >
                Robot Sensor Details
              </div>
            )}
          </div>

          <div
            onClick={() => navigate('/admin/users')}
            style={isActive('/admin/users') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/users')) e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={(e) => { if (!isActive('/admin/users')) e.currentTarget.style.background = 'none'; }}
          >
            <span>Users</span>
          </div>

          <div
            onClick={() => navigate('/admin/farms')}
            style={isActive('/admin/farms') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/farms')) e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={(e) => { if (!isActive('/admin/farms')) e.currentTarget.style.background = 'none'; }}
          >
            <span>Farms</span>
          </div>

          <div
            onClick={() => navigate('/admin/tasks')}
            style={isActive('/admin/tasks') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/tasks')) e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={(e) => { if (!isActive('/admin/tasks')) e.currentTarget.style.background = 'none'; }}
          >
            <span>Tasks</span>
          </div>

          {isMasterAdmin && (
            <div
              onClick={() => navigate('/admin/employees')}
              style={isActive('/admin/employees') ? navItemActive : navItemInactive}
              onMouseEnter={(e) => { if (!isActive('/admin/employees')) e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={(e) => { if (!isActive('/admin/employees')) e.currentTarget.style.background = 'none'; }}
            >
              <span>Employees</span>
            </div>
          )}

          <div
            onClick={() => navigate('/admin/settings')}
            style={isActive('/admin/settings') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/settings')) e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={(e) => { if (!isActive('/admin/settings')) e.currentTarget.style.background = 'none'; }}
          >
            <span>Settings</span>
          </div>

          <div
            onClick={() => navigate('/admin/activity-log')}
            style={isActive('/admin/activity-log') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/activity-log')) e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={(e) => { if (!isActive('/admin/activity-log')) e.currentTarget.style.background = 'none'; }}
          >
            <span>Audit Log</span>
          </div>
        </nav>

        <div style={{ padding: '14px 18px', borderTop: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1e6e43', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: '#fff', flexShrink: 0 }}>AD</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1a2e20' }}>Admin User</div>
            <div style={{ fontSize: 11, color: '#5a6a60' }}>admin@smartagri.com</div>
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