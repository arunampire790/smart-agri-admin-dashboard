import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlobalHeader from './GlobalHeader';

const navItems = [
  { to: '/admin/dashboard', icon: 'ph-layout', label: 'Dashboard' },
  { to: '/admin/analytics', icon: 'ph-chart-bar', label: 'Analytics' },
  { to: '/admin/robots', icon: null, label: 'Robots', isDropdown: true },
  { to: '/admin/users', icon: 'ph-users', label: 'Users' },
  { to: '/admin/farms', icon: 'ph-warehouse', label: 'Farms' },
  { to: '/admin/tasks', icon: 'ph-clipboard-text', label: 'Tasks' },
  { to: '/admin/employees', icon: 'ph-user-list', label: 'Employees' },
  { to: '/admin/settings', icon: 'ph-gear', label: 'Settings' },
  { to: '/admin/activity-log', icon: 'ph-clock-counter-clockwise', label: 'Audit Log' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isMasterAdmin = currentUser?.role === 'masterAdmin';
  const [robotsOpen, setRobotsOpen] = useState(false);
  const inRobotsSection = location.pathname === '/admin/robots' || location.pathname === '/admin/sensors';

  return (
    <div className="relative bg-surface text-primary h-screen overflow-hidden flex">
      {/* Glass orbs */}
      <div className="fixed pointer-events-none z-0" style={{ width: 400, height: 400, background: '#10B981', filter: 'blur(120px)', opacity: 0.35, top: '-10%', left: '-10%' }} />
      <div className="fixed pointer-events-none z-0" style={{ width: 500, height: 500, background: '#6366F1', filter: 'blur(150px)', opacity: 0.25, top: '30%', right: '-5%' }} />
      <div className="fixed pointer-events-none z-0" style={{ width: 350, height: 350, background: '#EC4899', filter: 'blur(100px)', opacity: 0.2, bottom: '-5%', left: '15%' }} />

      <aside style={{
        width: 220,
        minWidth: 220,
        minHeight: '100%',
        background: 'linear-gradient(160deg, #c8e8d8 0%, #e8d8f0 100%)',
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
      }}>
        <div style={{ padding: '18px 18px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: '#1e6e43', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="ph ph-plant" style={{ color: '#fff', fontSize: 18 }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>Smart Agriculture</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>Admin Panel</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {navItems
            .filter((item) => isMasterAdmin || item.label !== 'Employees')
            .map((item) => {
              const isActive = item.isDropdown
                ? inRobotsSection
                : location.pathname === item.to;

              const itemStyle = {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: 14,
                color: isActive ? '#111' : '#6b7280',
                fontWeight: isActive ? 500 : 400,
                background: isActive ? 'rgba(255,255,255,0.75)' : 'none',
                cursor: 'pointer',
                userSelect: 'none',
                width: '100%',
                boxSizing: 'border-box',
                border: 'none',
                textAlign: 'left',
                transition: 'background 0.15s',
              };

              const handleClick = () => {
                if (item.isDropdown) {
                  navigate('/admin/robots');
                  setRobotsOpen((o) => !o);
                } else {
                  navigate(item.to);
                }
              };

              const row = (
                <div
                  key={item.to}
                  onClick={handleClick}
                  style={itemStyle}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.4)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'none'; }}
                >
                  <span>{item.label}</span>
                  {item.isDropdown && (
                    <i
                      onClick={(e) => { e.stopPropagation(); setRobotsOpen((o) => !o); }}
                      className="ph ph-caret-down"
                      style={{
                        fontSize: 13,
                        color: '#9ca3af',
                        transition: 'transform 0.2s',
                        transform: robotsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        cursor: 'pointer',
                      }}
                    />
                  )}
                </div>
              );

              if (item.isDropdown) {
                return (
                  <div key={item.to}>
                    {row}
                    <div style={{
                      display: robotsOpen ? 'block' : 'none',
                      padding: '6px 12px 6px 24px',
                      fontSize: 13,
                      color: '#9ca3af',
                      cursor: 'pointer',
                      borderRadius: 8,
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = '#6b7280'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9ca3af'; }}
                      onClick={() => navigate('/admin/sensors')}
                    >
                      Robot Sensor Details
                    </div>
                  </div>
                );
              }

              return row;
            })}
        </nav>

        <div style={{ padding: '14px 18px', borderTop: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1e6e43', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: '#fff', flexShrink: 0 }}>AD</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>Admin User</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>admin@smartagri.com</div>
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