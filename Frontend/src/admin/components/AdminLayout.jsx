import { NavLink, Outlet } from 'react-router-dom';
import GlobalHeader from './GlobalHeader';

const navItems = [
  { to: '/admin/dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard' },
  { to: '/admin/users', icon: 'ti-users', label: 'Users' },
  { to: '/admin/farms', icon: 'ti-building-cottage', label: 'Farms' },
  { to: '/admin/robots', icon: 'ti-robot', label: 'Robots' },
  { to: '/admin/tasks', icon: 'ti-checklist', label: 'Tasks' },
  { to: '/admin/analytics', icon: 'ti-chart-bar', label: 'Analytics' },
  { to: '/admin/settings', icon: 'ti-settings', label: 'Settings' },
];

export default function AdminLayout() {

  return (
    <div className="font-sans bg-[#F8F9FA] text-[#111] h-screen overflow-hidden flex">
      <aside className="w-60 min-w-[240px] bg-white border-r border-[#EAEAEA] flex flex-col py-6">
        <div className="flex items-center gap-3 px-5 pb-5 border-b border-[#EAEAEA] mb-5">
          <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center text-white text-base relative overflow-hidden">
            <i className="ti ti-plant-2 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight text-[#111]">Smart Agriculture</div>
            <div className="text-[11px] text-text-secondary tracking-wide">Admin Panel</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-light text-[#137333]'
                    : 'text-text-secondary hover:bg-[#F5F5F5] hover:text-[#333]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand rounded-full" />}
                  <i className={`ti ${icon} text-lg ${isActive ? 'text-[#137333]' : ''}`} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-5 pt-4 border-t border-[#EAEAEA]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#137333] text-white flex items-center justify-center text-xs font-semibold shadow-sm border border-white/20">AD</div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-[#111] truncate">Admin User</div>
              <div className="text-[11px] text-text-placeholder truncate">admin@smartagri.com</div>
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
