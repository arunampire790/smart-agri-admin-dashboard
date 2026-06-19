import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-[#EAEAEA] px-5 h-[70px] flex justify-between items-center w-full sticky top-0 z-10">
      <div className="flex-1 flex justify-start items-center">
        <div className="flex items-center gap-2.5 bg-white border border-[#EAEAEA] rounded-lg px-3 py-2 max-w-[400px] w-full">
          <i className="ti ti-search text-text-placeholder" />
          <input placeholder="Search..." aria-label="Search" className="border-none bg-transparent text-sm text-[#111] w-full outline-none placeholder:text-text-placeholder" />
        </div>
      </div>

      <div className="flex items-center gap-4 justify-end shrink-0">
        <div className="flex items-center px-3 py-1.5 rounded-full border border-[#EAEAEA] text-xs text-text-secondary font-medium whitespace-nowrap">EN / 日本語</div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#EAEAEA] text-xs text-text-secondary font-medium whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-[#137333] inline-block" />
          System Online
        </div>
        <button aria-label="Notifications" className="relative cursor-pointer bg-none border-none text-lg text-text-secondary mx-2 shrink-0">
          <i className="ti ti-bell" />
          <span className="absolute -top-1 -right-1 bg-danger-text text-white text-[10px] leading-none px-1 py-0.5 rounded-full font-bold">3</span>
        </button>
        <button aria-label="Profile" className="bg-none border-none cursor-pointer text-lg text-text-placeholder hover:text-text-secondary shrink-0">
          <i className="ti ti-user" />
        </button>
        <button onClick={() => navigate('/admin/login')} aria-label="Logout" className="bg-none border-none cursor-pointer text-lg text-text-placeholder hover:text-text-secondary shrink-0">
          <i className="ti ti-logout" />
        </button>
      </div>
    </header>
  );
}
