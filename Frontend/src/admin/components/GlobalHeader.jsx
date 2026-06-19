import { useNavigate } from 'react-router-dom';

export default function GlobalHeader() {
  const navigate = useNavigate();

  return (
    <header className="flex justify-between items-center w-full h-[70px] px-6 border-b border-[#EAEAEA] bg-white shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white text-base">
            <i className="ti ti-plant-2" />
          </div>
          <span className="text-base font-bold whitespace-nowrap">Smart Agriculture</span>
        </div>
        <button aria-label="Notifications" className="relative cursor-pointer bg-none border-none text-lg text-text-secondary shrink-0">
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

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 bg-white border border-[#EAEAEA] rounded-lg px-3 py-2 w-[320px]">
          <i className="ti ti-search text-text-placeholder" />
          <input placeholder="Search..." aria-label="Search" className="border-none bg-transparent text-sm text-[#111] w-full outline-none placeholder:text-text-placeholder" />
        </div>
        <div className="flex items-center px-3 py-1.5 rounded-full border border-[#EAEAEA] text-xs text-text-secondary font-medium whitespace-nowrap">EN / 日本語</div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#EAEAEA] text-xs text-text-secondary font-medium whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-[#137333] inline-block" />
          System Online
        </div>
      </div>
    </header>
  );
}
