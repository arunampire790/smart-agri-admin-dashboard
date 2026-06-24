import { NavLink, Outlet } from 'react-router-dom';
import GlobalHeader from './GlobalHeader';

const navItems = [
  { to: '/admin/dashboard', icon: 'ph-layout', label: 'Dashboard' },
  { to: '/admin/users', icon: 'ph-users', label: 'Users' },
  { to: '/admin/farms', icon: 'ph-warehouse', label: 'Farms' },
  { to: '/admin/robots', icon: 'ph-robot', label: 'Robots' },
  { to: '/admin/tasks', icon: 'ph-clipboard-text', label: 'Tasks' },
  { to: '/admin/analytics', icon: 'ph-chart-bar', label: 'Analytics' },
  { to: '/admin/settings', icon: 'ph-gear', label: 'Settings' },
];

export default function AdminLayout() {

  return (
    <div className="bg-surface text-[#1C1C1E] h-screen overflow-hidden flex">
      <aside className="w-60 min-w-[240px] glass border-r border-[rgba(0,0,0,0.05)] flex flex-col py-4">
        <div className="flex items-center gap-2.5 px-4 pb-4 border-b border-[rgba(0,0,0,0.05)] mb-4">
          <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center text-white text-base">
            <i className="ph ph-plant" />
          </div>
          <div>
            <div className="text-base font-bold text-[#1C1C1E]">Smart Agriculture</div>
            <div className="text-xs text-text-secondary">Admin Panel</div>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-4 py-3 mx-2 rounded-xl text-sm text-text-secondary no-underline transition-all duration-150 ${
                  isActive ? 'bg-[rgba(52,199,89,0.1)] text-[#34C759] nav-active-indicator' : 'hover:bg-[#E5E5EA] hover:text-[#1C1C1E]'
                }`
              }
            >
              <i className={`${icon} text-lg`} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-4 py-4 border-t border-[rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-dark text-white flex items-center justify-center text-xs font-semibold">AD</div>
            <div>
              <div className="text-sm font-medium text-[#1C1C1E]">Admin User</div>
              <div className="text-xs text-text-placeholder">admin@smartagri.com</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <GlobalHeader />

        <main className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
