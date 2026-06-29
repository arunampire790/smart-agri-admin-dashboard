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

  const navClass = (isActive) =>
    `flex items-center gap-2.5 px-4 py-3 mx-2 rounded-xl text-sm text-text-secondary no-underline cursor-pointer transition-all duration-150 ${
      isActive
        ? 'glass-active text-primary nav-active-indicator'
        : 'hover:bg-white/30 hover-text-primary'
    }`;

  return (
    <div className="relative bg-surface text-primary h-screen overflow-hidden flex">
      {/* Glass orbs */}
      <div className="fixed pointer-events-none z-0" style={{ width: 400, height: 400, background: '#10B981', filter: 'blur(120px)', opacity: 0.35, top: '-10%', left: '-10%' }} />
      <div className="fixed pointer-events-none z-0" style={{ width: 500, height: 500, background: '#6366F1', filter: 'blur(150px)', opacity: 0.25, top: '30%', right: '-5%' }} />
      <div className="fixed pointer-events-none z-0" style={{ width: 350, height: 350, background: '#EC4899', filter: 'blur(100px)', opacity: 0.2, bottom: '-5%', left: '15%' }} />

      <aside className="relative z-10 w-60 min-w-[240px] glass border-r border-white/40 flex flex-col py-4">
        <div className="flex items-center gap-2.5 px-4 pb-4 border-b border-white/30 mb-4">
          <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center text-white text-base">
            <i className="ph ph-plant" />
          </div>
          <div>
            <div className="text-base font-bold text-primary">Smart Agriculture</div>
            <div className="text-xs text-text-secondary">Admin Panel</div>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5">
          {navItems
            .filter((item) => isMasterAdmin || item.label !== 'Employees')
            .map((item) => {
              const isActive = item.isDropdown
                ? inRobotsSection
                : location.pathname === item.to;

              const row = (
                <div
                  key={item.to}
                  onClick={() => {
                    if (item.isDropdown) { navigate('/admin/robots'); setRobotsOpen((o) => !o); }
                    else { navigate(item.to); }
                  }}
                  className={navClass(isActive)}
                  style={item.isDropdown ? { width: '100%', boxSizing: 'border-box' } : {}}
                >
                  {item.icon ? <i className={`${item.icon} text-lg`} /> : <span className="inline-block w-[1.125rem] shrink-0" />}
                  <span style={{ marginLeft: 0, paddingLeft: 0, fontSize: '14px', fontWeight: 500 }}>{item.label}</span>
                  {item.isDropdown && (
                    <i onClick={(e) => { e.stopPropagation(); setRobotsOpen((o) => !o); }}
                       className={`ph ph-caret-down text-xs cursor-pointer transition-transform duration-200 ${robotsOpen ? 'rotate-180' : ''}`}
                       style={{ marginLeft: 'auto', paddingLeft: '8px' }} />
                  )}
                </div>
              );

              if (item.isDropdown) {
                return (
                  <div key={item.to}>
                    {row}
                    <div className={`overflow-hidden transition-all duration-200 ease-in-out ${robotsOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div
                        onClick={() => navigate('/admin/sensors')}
                        className={`flex items-center gap-2.5 pl-12 pr-4 py-3 mx-2 rounded-xl text-sm text-text-secondary no-underline cursor-pointer transition-all duration-150 ${
                          location.pathname === '/admin/sensors'
                            ? 'glass-active text-primary nav-active-indicator'
                            : 'hover:bg-white/30 hover-text-primary'
                        }`}
                      >
                        <i className="ph ph-radar text-sm" />
                        Robot Sensor Details
                      </div>
                    </div>
                  </div>
                );
              }

              return row;
            })}
        </nav>

        <div className="mt-auto px-4 py-4 border-t border-white/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-dark text-white flex items-center justify-center text-xs font-semibold">AD</div>
            <div>
              <div className="text-sm font-medium text-primary">Admin User</div>
              <div className="text-xs text-text-placeholder">admin@smartagri.com</div>
            </div>
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
