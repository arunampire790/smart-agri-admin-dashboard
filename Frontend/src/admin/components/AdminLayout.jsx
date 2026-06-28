import { useState, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlobalHeader from './GlobalHeader';

const baseNavItems = [
  { to: '/admin/dashboard', icon: 'ph-layout', label: 'Dashboard' },
  { to: '/admin/analytics', icon: 'ph-chart-bar', label: 'Analytics' },
  { to: '/admin/robots', icon: 'ph-robot', label: 'Robots', isDropdown: true },
  { to: '/admin/users', icon: 'ph-users', label: 'Users' },
  { to: '/admin/farms', icon: 'ph-warehouse', label: 'Farms' },
  { to: '/admin/tasks', icon: 'ph-clipboard-text', label: 'Tasks' },
  { to: '/admin/employees', icon: 'ph-user-circle', label: 'Employees' },
  { to: '/admin/settings', icon: 'ph-gear', label: 'Settings' },
];

const robotSubItems = [
  { to: '/admin/sensors', label: 'Robot Sensor Details' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [robotsOpen, setRobotsOpen] = useState(false);

  // TODO: Enforce this role check server-side once backend is added — this is a frontend-only gate for now and can be bypassed via dev tools.
  const navItems = useMemo(() => {
    if (currentUser?.role === 'masterAdmin') {
      return baseNavItems;
    }
    return baseNavItems.filter((item) => item.label !== 'Employees');
  }, [currentUser]);

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  const robotsActive = location.pathname === '/admin/robots' || location.pathname === '/admin/sensors';

  return (
    <div className="relative bg-surface text-[#1C1C1E] h-screen overflow-hidden flex">
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
            <div className="text-base font-bold text-[#1C1C1E]">Smart Agriculture</div>
            <div className="text-xs text-text-secondary">Admin Panel</div>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            if (item.isDropdown) {
              return (
                <div key={item.to} className="mx-2">
                  <div
                    onClick={() => { setRobotsOpen((o) => !o); navigate('/admin/robots'); }}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-text-secondary no-underline cursor-pointer transition-all duration-150 ${
                      robotsActive
                        ? 'glass-active text-[#1C1C1E] nav-active-indicator'
                        : 'hover:bg-white/30 hover:text-[#1C1C1E]'
                    }`}
                  >
                    <i className={`${item.icon} text-lg`} />
                    <span className="flex-1">{item.label}</span>
                    <i className={`ph ph-caret-down text-xs transition-transform duration-200 ${robotsOpen ? 'rotate-180' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setRobotsOpen((o) => !o); }}
                    />
                  </div>
                  <div className={`overflow-hidden transition-all duration-200 ${robotsOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {robotSubItems.map(({ to, label }) => {
                      const isSubActive = location.pathname === to;
                      return (
                        <div
                          key={to}
                          onClick={() => navigate(to)}
                          className={`flex items-center gap-2.5 px-4 py-3 ml-4 rounded-xl text-sm no-underline cursor-pointer transition-all duration-150 ${
                            isSubActive
                              ? 'glass-active text-[#1C1C1E] nav-active-indicator'
                              : 'text-text-secondary hover:bg-white/30 hover:text-[#1C1C1E]'
                          }`}
                        >
                          {label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
            const isActive = location.pathname === item.to;
            return (
              <div
                key={item.to}
                onClick={() => navigate(item.to)}
                className={`flex items-center gap-2.5 px-4 py-3 mx-2 rounded-xl text-sm text-text-secondary no-underline cursor-pointer transition-all duration-150 ${
                  isActive
                    ? 'glass-active text-[#1C1C1E] nav-active-indicator'
                    : 'hover:bg-white/30 hover:text-[#1C1C1E]'
                }`}
              >
                <i className={`${item.icon} text-lg`} />
                {item.label}
              </div>
            );
          })}
        </nav>

        <div className="mt-auto px-4 py-4 border-t border-white/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-dark text-white flex items-center justify-center text-xs font-semibold">{initials}</div>
            <div>
              <div className="text-sm font-medium text-[#1C1C1E]">{currentUser?.name || 'Admin User'}</div>
              <div className="text-xs text-text-placeholder">{currentUser?.email || 'admin@smartagri.com'}</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-y-auto">
        <GlobalHeader />
        <main className="p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
