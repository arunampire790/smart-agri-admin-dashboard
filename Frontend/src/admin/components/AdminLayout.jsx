import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlobalHeader from './GlobalHeader';

const navItems = [
  { to: '/admin/dashboard', icon: 'ph-layout', label: 'Dashboard' },
  { to: '/admin/analytics', icon: 'ph-chart-bar', label: 'Analytics' },
  { to: '/admin/users', icon: 'ph-users', label: 'Users' },
  { to: '/admin/farms', icon: 'ph-warehouse', label: 'Farms' },
  { to: '/admin/tasks', icon: 'ph-clipboard-text', label: 'Tasks' },
  { to: '/admin/employees', icon: 'ph-user-list', label: 'Employees' },
  { to: '/admin/settings', icon: 'ph-gear', label: 'Settings' },
];

const beforeIdx = 2; // insert Robots dropdown after Analytics (index 1 → before index 2)

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
          {navItems.slice(0, beforeIdx).map(({ to, icon, label }) => (
            <div key={to} onClick={() => navigate(to)} className={navClass(location.pathname === to)}>
              <i className={`${icon} text-lg`} />
              {label}
            </div>
          ))}

          {/* Robots dropdown */}
          <div>
            <div
              onClick={() => { navigate('/admin/robots'); setRobotsOpen((o) => !o); }}
              className={`flex items-center gap-2.5 px-4 py-3 mx-2 rounded-xl text-sm text-text-secondary no-underline cursor-pointer transition-all duration-150 ${
                inRobotsSection
                  ? 'glass-active text-primary nav-active-indicator'
                  : 'hover:bg-white/30 hover-text-primary'
              }`}
            >
              <i className="ph ph-robot text-lg" />
              <span className="flex-1">Robots</span>
              <i onClick={(e) => { e.stopPropagation(); setRobotsOpen((o) => !o); }}
                className={`ph ph-caret-down text-xs cursor-pointer transition-transform duration-200 ${robotsOpen ? 'rotate-180' : ''}`}
              />
            </div>
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

          {navItems
            .slice(beforeIdx)
            .filter((item) => isMasterAdmin || item.label !== 'Employees')
            .map(({ to, icon, label }) => (
            <div key={to} onClick={() => navigate(to)} className={navClass(location.pathname === to)}>
              <i className={`${icon} text-lg`} />
              {label}
            </div>
          ))}
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
