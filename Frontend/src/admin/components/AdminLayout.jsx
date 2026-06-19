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
      <aside className="w-60 min-w-[240px] bg-white border-r border-[#EAEAEA] flex flex-col py-4">
        <div className="flex items-center gap-2.5 px-4 pb-4 border-b border-[#EAEAEA] mb-4">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white text-base">
            <i className="ti ti-plant-2" />
          </div>
          <div>
            <div className="text-base font-bold">Smart Agriculture</div>
            <div className="text-xs text-text-secondary">Admin Panel</div>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-4 py-3 mx-2 rounded-lg text-sm text-text-secondary no-underline transition-all duration-150 ${
                  isActive ? 'bg-brand text-white' : 'hover:bg-[#F1F3F4] hover:text-[#111]'
                }`
              }
            >
              <i className={`ti ${icon} text-lg`} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-4 py-4 border-t border-[#EAEAEA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#137333] text-white flex items-center justify-center text-xs font-semibold">AD</div>
            <div>
              <div className="text-sm font-medium">Admin User</div>
              <div className="text-xs text-text-secondary">admin@smartagri.com</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto flex flex-col">
        <GlobalHeader />

        <main className="p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
