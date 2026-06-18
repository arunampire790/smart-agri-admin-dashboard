import { NavLink, Outlet, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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
        <header className="bg-white border-b border-[#EAEAEA] px-5 h-[70px] flex items-center gap-4 sticky top-0 z-10">
          <div className="flex-1 flex items-center gap-2.5 bg-white border border-[#EAEAEA] rounded-lg px-3 py-2 max-w-[400px]">
            <i className="ti ti-search text-text-placeholder" />
            <input placeholder="Search..." aria-label="Search" className="border-none bg-transparent text-sm text-[#111] w-full outline-none placeholder:text-text-placeholder" />
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center px-3 py-1.5 rounded-full border border-[#EAEAEA] text-xs text-text-secondary font-medium">EN / 日本語</div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#EAEAEA] text-xs text-text-secondary font-medium">
              <span className="w-2 h-2 rounded-full bg-[#137333] inline-block" />
              System Online
            </div>
            <button aria-label="Notifications" className="relative cursor-pointer bg-none border-none text-lg text-text-secondary mx-2">
              <i className="ti ti-bell" />
              <span className="absolute -top-1 -right-1 bg-danger-text text-white text-[10px] leading-none px-1 py-0.5 rounded-full font-bold">3</span>
            </button>
            <button aria-label="Profile" className="bg-none border-none cursor-pointer text-lg text-text-placeholder hover:text-text-secondary ml-1">
              <i className="ti ti-user" />
            </button>
            <button onClick={() => navigate('/admin/login')} aria-label="Logout" className="bg-none border-none cursor-pointer text-lg text-text-placeholder hover:text-text-secondary ml-1">
              <i className="ti ti-logout" />
            </button>
          </div>
        </header>

        <main className="p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
