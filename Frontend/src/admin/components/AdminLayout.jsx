import { Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen min-h-[600px] overflow-hidden bg-[#f5f5f5]">
      <aside className="w-[200px] min-w-[200px] bg-white border-r border-[#e0e0e0] flex flex-col py-4">
        <div className="flex items-center gap-2.5 px-4 pb-4 border-b border-[#e0e0e0] mb-2">
          <div className="w-8 h-8 bg-[#2e7d32] rounded-lg flex items-center justify-center text-white text-base">
            <i className="ph ph-plant" />
          </div>
          <div>
            <div className="text-sm font-medium text-[#1C1C1E]">Smart Agriculture</div>
            <div className="text-xs text-[#757575]">Admin Panel</div>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5">
          {navItems.map(({ to, icon, label }) => {
            const isActive = location.pathname === to;
            return (
              <div
                key={to}
                onClick={() => navigate(to)}
                className={`flex items-center gap-2.5 px-4 py-2 mx-2 rounded-md text-sm cursor-pointer transition-colors ${
                  isActive ? 'nav-active-indicator' : 'text-[#757575] hover:bg-[#f5f5f5] hover:text-[#1C1C1E]'
                }`}
              >
                <i className={`${icon} text-base`} />
                {label}
              </div>
            );
          })}
        </nav>

        <div className="mt-auto px-4 py-3 border-t border-[#e0e0e0]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#2e7d32] text-white flex items-center justify-center text-xs font-medium">AD</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-[#1C1C1E]">Admin User</div>
              <div className="text-[10px] text-[#757575] truncate">admin@smartagri.com</div>
            </div>
            <button onClick={() => { localStorage.clear(); navigate('/login'); }} title="Sign out" className="bg-none border-none cursor-pointer text-[#757575] hover:text-[#1C1C1E] text-base p-0">
              <i className="ph ph-sign-out" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <GlobalHeader />
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
