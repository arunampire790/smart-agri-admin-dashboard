import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useT } from '../../i18n';
import GlobalHeader from './GlobalHeader';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const t = useT('nav');
  const isMasterAdmin = currentUser?.role === 'masterAdmin';
  const [robotsOpen, setRobotsOpen] = useState(false);
  const [employeesOpen, setEmployeesOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const isRobotsActive = location.pathname === '/admin/robots' || location.pathname === '/admin/sensors' || location.pathname === '/admin/robot-assignment';
  const isEmployeesActive = location.pathname === '/admin/employees' || location.pathname === '/admin/activity-log';

  const navItemBase = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px 10px 24px',
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
    transition: 'all 0.2s ease',
  };

  const navItemInactive = {
    ...navItemBase,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: 500,
  };

  const navItemActive = {
    ...navItemBase,
    color: '#ffffff',
    fontWeight: 600,
    background: '#1B4327',
    borderLeft: '3px solid #4caf50',
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
    <div className="relative text-primary h-screen overflow-hidden flex" style={{ background: '#F4F7F5' }}>
      <div className="fixed pointer-events-none z-0" style={{ width: 400, height: 400, background: '#4caf50', filter: 'blur(120px)', opacity: 0.12, top: '-10%', left: '-10%' }} />
      <div className="fixed pointer-events-none z-0" style={{ width: 500, height: 500, background: '#2e7d2e', filter: 'blur(150px)', opacity: 0.08, top: '30%', right: '-5%' }} />
      <div className="fixed pointer-events-none z-0" style={{ width: 350, height: 350, background: '#4caf50', filter: 'blur(100px)', opacity: 0.06, bottom: '-5%', left: '15%' }} />

      <aside style={{
        width: 220,
        minWidth: 220,
        minHeight: '100%',
        background: '#142E1C',
        borderRight: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
      }}>
        <div style={{ padding: '18px 18px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: '#2e7d2e', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="ph ph-sprout" style={{ color: '#fff', fontSize: 17 }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>{t('brand')}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{t('adminPanel')}</div>
          </div>
        </div>
        <div style={{ margin: '0 18px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)' }} />

        <nav style={{ flex: 1, padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div
            onClick={() => navigate('/admin/dashboard')}
            className={isActive('/admin/dashboard') ? 'nav-active-indicator' : undefined}
            style={isActive('/admin/dashboard') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/dashboard')) { e.currentTarget.style.background = 'rgba(76,175,80,0.15)'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.paddingLeft = '32px'; } }}
            onMouseLeave={(e) => { if (!isActive('/admin/dashboard')) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.paddingLeft = '24px'; } }}
          >
            <span>{t('dashboard')}</span>
          </div>

          <div
            onClick={() => navigate('/admin/analytics')}
            className={isActive('/admin/analytics') ? 'nav-active-indicator' : undefined}
            style={isActive('/admin/analytics') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/analytics')) { e.currentTarget.style.background = 'rgba(76,175,80,0.15)'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.paddingLeft = '32px'; } }}
            onMouseLeave={(e) => { if (!isActive('/admin/analytics')) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.paddingLeft = '24px'; } }}
          >
            <span>{t('analytics')}</span>
          </div>

          <div>
            <div
              onClick={() => { navigate('/admin/robots'); setRobotsOpen((o) => !o); }}
              className={isRobotsActive ? 'nav-active-indicator' : undefined}
              style={isRobotsActive ? navItemActive : navItemInactive}
              onMouseEnter={(e) => { if (!isRobotsActive) { e.currentTarget.style.background = 'rgba(76,175,80,0.15)'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.paddingLeft = '32px'; } }}
              onMouseLeave={(e) => { if (!isRobotsActive) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.paddingLeft = '24px'; } }}
            >
              <span>{t('robots')}</span>
              <i
                className="ph ph-caret-down"
                style={{
                  fontSize: 12,
                  color: robotsOpen ? '#4caf50' : 'rgba(255,255,255,0.4)',
                  transition: 'transform 0.2s',
                  transform: robotsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  marginLeft: 'auto',
                }}
              />
            </div>
              {robotsOpen && (
                <>
                  <div
                    onClick={() => navigate('/admin/sensors')}
                    className={isActive('/admin/sensors') ? 'nav-active-indicator' : undefined}
                    style={isActive('/admin/sensors') ? { ...childItemInactive, color: '#4caf50', fontWeight: 500 } : childItemInactive}
                    onMouseEnter={(e) => { if (!isActive('/admin/sensors')) { e.currentTarget.style.background = 'rgba(76,175,80,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; } }}
                    onMouseLeave={(e) => { if (!isActive('/admin/sensors')) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; } }}
                  >
                    {t('robotSensorDetails')}
                  </div>
                  <div
                    onClick={() => navigate('/admin/robot-assignment')}
                    className={isActive('/admin/robot-assignment') ? 'nav-active-indicator' : undefined}
                    style={isActive('/admin/robot-assignment') ? { ...childItemInactive, color: '#4caf50', fontWeight: 500 } : childItemInactive}
                    onMouseEnter={(e) => { if (!isActive('/admin/robot-assignment')) { e.currentTarget.style.background = 'rgba(76,175,80,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; } }}
                    onMouseLeave={(e) => { if (!isActive('/admin/robot-assignment')) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; } }}
                  >
                    {t('robotAssignment')}
                  </div>
                </>
              )}
          </div>

          <div
            onClick={() => navigate('/admin/users')}
            className={isActive('/admin/users') ? 'nav-active-indicator' : undefined}
            style={isActive('/admin/users') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/users')) { e.currentTarget.style.background = 'rgba(76,175,80,0.15)'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.paddingLeft = '32px'; } }}
            onMouseLeave={(e) => { if (!isActive('/admin/users')) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.paddingLeft = '24px'; } }}
          >
            <span>{t('users')}</span>
          </div>

          <div
            onClick={() => navigate('/admin/farms')}
            className={isActive('/admin/farms') ? 'nav-active-indicator' : undefined}
            style={isActive('/admin/farms') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/farms')) { e.currentTarget.style.background = 'rgba(76,175,80,0.15)'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.paddingLeft = '32px'; } }}
            onMouseLeave={(e) => { if (!isActive('/admin/farms')) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.paddingLeft = '24px'; } }}
          >
            <span>{t('farms')}</span>
          </div>

          <div
            onClick={() => navigate('/admin/tasks')}
            className={isActive('/admin/tasks') ? 'nav-active-indicator' : undefined}
            style={isActive('/admin/tasks') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/tasks')) { e.currentTarget.style.background = 'rgba(76,175,80,0.15)'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.paddingLeft = '32px'; } }}
            onMouseLeave={(e) => { if (!isActive('/admin/tasks')) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.paddingLeft = '24px'; } }}
          >
            <span>{t('tasks')}</span>
          </div>

          {isMasterAdmin && (
            <div>
              <div
                onClick={() => { navigate('/admin/employees'); setEmployeesOpen((o) => !o); }}
                className={isEmployeesActive ? 'nav-active-indicator' : undefined}
                style={isEmployeesActive ? navItemActive : navItemInactive}
                onMouseEnter={(e) => { if (!isEmployeesActive) { e.currentTarget.style.background = 'rgba(76,175,80,0.15)'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.paddingLeft = '32px'; } }}
                onMouseLeave={(e) => { if (!isEmployeesActive) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.paddingLeft = '24px'; } }}
              >
                <span>{t('employees')}</span>
                <i
                  className="ph ph-caret-down"
                  style={{
                    fontSize: 12,
                    color: employeesOpen ? '#4caf50' : 'rgba(255,255,255,0.4)',
                    transition: 'transform 0.2s',
                    transform: employeesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    marginLeft: 'auto',
                  }}
                />
              </div>
              {employeesOpen && (
                <div
                  onClick={() => navigate('/admin/activity-log')}
                  className={isActive('/admin/activity-log') ? 'nav-active-indicator' : undefined}
                  style={isActive('/admin/activity-log') ? { ...childItemInactive, color: '#4caf50', fontWeight: 500 } : childItemInactive}
                  onMouseEnter={(e) => { if (!isActive('/admin/activity-log')) { e.currentTarget.style.background = 'rgba(76,175,80,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; } }}
                  onMouseLeave={(e) => { if (!isActive('/admin/activity-log')) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; } }}
                >
                  {t('auditLog')}
                </div>
              )}
            </div>
          )}

          <div
            onClick={() => navigate('/admin/settings')}
            className={isActive('/admin/settings') ? 'nav-active-indicator' : undefined}
            style={isActive('/admin/settings') ? navItemActive : navItemInactive}
            onMouseEnter={(e) => { if (!isActive('/admin/settings')) { e.currentTarget.style.background = 'rgba(76,175,80,0.15)'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.paddingLeft = '32px'; } }}
            onMouseLeave={(e) => { if (!isActive('/admin/settings')) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.paddingLeft = '24px'; } }}
          >
            <span>{t('settings')}</span>
          </div>
        </nav>

        <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2e7d2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0 }}>AD</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#ffffff' }}>Admin User</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>admin@smartagri.com</div>
          </div>
        </div>
      </aside>

      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        <GlobalHeader />
        <main className="p-6 flex-1 overflow-y-auto overflow-x-hidden content-visibility-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}