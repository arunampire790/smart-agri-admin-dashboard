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
    color: 'rgba(255,255,255,0.6)',
    fontWeight: 400,
  };

  const navItemActive = {
    ...navItemBase,
    color: '#ffffff',
    fontWeight: 600,
    background: 'rgba(46,158,107,0.2)',
    borderLeft: '3px solid #2e9e6b',
    borderRadius: '0 10px 10px 0',
  };

  const childItemInactive = {
    padding: '9px 12px 9px 24px',
    borderRadius: 10,
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
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
    <div className="relative text-primary h-screen overflow-hidden flex" style={{ background: '#0a0a0f' }}>
      <div className="fixed pointer-events-none z-0" style={{ width: 400, height: 400, background: '#10B981', filter: 'blur(120px)', opacity: 0.15, top: '-10%', left: '-10%' }} />
      <div className="fixed pointer-events-none z-0" style={{ width: 500, height: 500, background: '#6366F1', filter: 'blur(150px)', opacity: 0.1, top: '30%', right: '-5%' }} />
      <div className="fixed pointer-events-none z-0" style={{ width: 350, height: 350, background: '#EC4899', filter: 'blur(100px)', opacity: 0.08, bottom: '-5%', left: '15%' }} />

      <aside style={{
        width: 220,
        minWidth: 220,
        minHeight: '100%',
        background: '#0a0a0f',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-sans)',
      }}>
        <div style={{ position: 'absolute', top: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,158,107,0.5) 0%, transparent 70%)', filter: 'blur(70px)', opacity: 0.6, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)', filter: 'blur(80px)', opacity: 0.45, pointerEvents: 'none' }} />
        <div style={{ padding: '18px 18px 14px', display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 34, height: 34, background: '#2e9e6b', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="ph ph-sprout" style={{ color: '#fff', fontSize: 17 }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>Smart Agriculture</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Admin Panel</div>
          </div>
        </div>
        <div style={{ margin: '0 18px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 1 }} />

        <nav style={{ flex: 1, padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', zIndex: 1 }}>
          <div
            onClick={() => navigate('/admin/dashboard')}
            className={isActive('/admin/dashboard') ? 'nav-active-indicator' : undefined}
            style={isActive('/admin/dashboard') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/dashboard')) { e.currentTarget.style.background = 'rgba(46,158,107,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; } }}
            onMouseLeave={(e) => { if (!isActive('/admin/dashboard')) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; } }}
          >
            <span>Dashboard</span>
          </div>

          <div
            onClick={() => navigate('/admin/analytics')}
            className={isActive('/admin/analytics') ? 'nav-active-indicator' : undefined}
            style={isActive('/admin/analytics') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/analytics')) { e.currentTarget.style.background = 'rgba(46,158,107,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; } }}
            onMouseLeave={(e) => { if (!isActive('/admin/analytics')) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; } }}
          >
            <span>Analytics</span>
          </div>

          <div>
            <div
              onClick={() => { navigate('/admin/robots'); setRobotsOpen((o) => !o); }}
              className={isRobotsActive ? 'nav-active-indicator' : undefined}
              style={isRobotsActive ? navItemActive : navItemInactive}
              onMouseEnter={(e) => { if (!isRobotsActive) { e.currentTarget.style.background = 'rgba(46,158,107,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; } }}
              onMouseLeave={(e) => { if (!isRobotsActive) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; } }}
            >
              <span>Robots</span>
              <i
                className="ph ph-caret-down"
                style={{
                  fontSize: 12,
                  color: robotsOpen ? '#2e9e6b' : 'rgba(255,255,255,0.4)',
                  transition: 'transform 0.2s',
                  transform: robotsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </div>
            {robotsOpen && (
              <div
                onClick={() => navigate('/admin/sensors')}
                className={isActive('/admin/sensors') ? 'nav-active-indicator' : undefined}
                style={isActive('/admin/sensors') ? { ...childItemInactive, color: '#2e9e6b', fontWeight: 500 } : childItemInactive}
                onMouseEnter={(e) => { if (!isActive('/admin/sensors')) { e.currentTarget.style.background = 'rgba(46,158,107,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; } }}
                onMouseLeave={(e) => { if (!isActive('/admin/sensors')) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; } }}
              >
                Robot Sensor Details
              </div>
            )}
          </div>

          <div
            onClick={() => navigate('/admin/users')}
            className={isActive('/admin/users') ? 'nav-active-indicator' : undefined}
            style={isActive('/admin/users') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/users')) { e.currentTarget.style.background = 'rgba(46,158,107,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; } }}
            onMouseLeave={(e) => { if (!isActive('/admin/users')) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; } }}
          >
            <span>Users</span>
          </div>

          <div
            onClick={() => navigate('/admin/farms')}
            className={isActive('/admin/farms') ? 'nav-active-indicator' : undefined}
            style={isActive('/admin/farms') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/farms')) { e.currentTarget.style.background = 'rgba(46,158,107,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; } }}
            onMouseLeave={(e) => { if (!isActive('/admin/farms')) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; } }}
          >
            <span>Farms</span>
          </div>

          <div
            onClick={() => navigate('/admin/tasks')}
            className={isActive('/admin/tasks') ? 'nav-active-indicator' : undefined}
            style={isActive('/admin/tasks') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/tasks')) { e.currentTarget.style.background = 'rgba(46,158,107,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; } }}
            onMouseLeave={(e) => { if (!isActive('/admin/tasks')) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; } }}
          >
            <span>Tasks</span>
          </div>

          {isMasterAdmin && (
            <div>
              <div
                onClick={() => { navigate('/admin/employees'); setEmployeesOpen((o) => !o); }}
                className={isEmployeesActive ? 'nav-active-indicator' : undefined}
                style={isEmployeesActive ? navItemActive : navItemInactive}
                onMouseEnter={(e) => { if (!isEmployeesActive) { e.currentTarget.style.background = 'rgba(46,158,107,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; } }}
                onMouseLeave={(e) => { if (!isEmployeesActive) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; } }}
              >
                <span>Employees</span>
                <i
                  className="ph ph-caret-down"
                  style={{
                    fontSize: 12,
                    color: employeesOpen ? '#2e9e6b' : 'rgba(255,255,255,0.4)',
                    transition: 'transform 0.2s',
                    transform: employeesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </div>
              {employeesOpen && (
                <div
                  onClick={() => navigate('/admin/activity-log')}
                  className={isActive('/admin/activity-log') ? 'nav-active-indicator' : undefined}
                  style={isActive('/admin/activity-log') ? { ...childItemInactive, color: '#2e9e6b', fontWeight: 500 } : childItemInactive}
                  onMouseEnter={(e) => { if (!isActive('/admin/activity-log')) { e.currentTarget.style.background = 'rgba(46,158,107,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; } }}
                  onMouseLeave={(e) => { if (!isActive('/admin/activity-log')) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; } }}
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
            onMouseEnter={(e) => { if (!isActive('/admin/settings')) { e.currentTarget.style.background = 'rgba(46,158,107,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; } }}
            onMouseLeave={(e) => { if (!isActive('/admin/settings')) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; } }}
          >
            <span>Settings</span>
          </div>
        </nav>

        <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', margin: '0 0px', borderRadius: '0', position: 'relative', zIndex: 1 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2e9e6b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0 }}>AD</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#ffffff' }}>Admin User</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>admin@smartagri.com</div>
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