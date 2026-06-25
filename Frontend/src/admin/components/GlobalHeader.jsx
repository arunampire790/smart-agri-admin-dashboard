import { useNavigate } from 'react-router-dom';

export default function GlobalHeader() {
  const navigate = useNavigate();

  return (
    <header className="flex items-center gap-3 px-5 py-2.5 bg-white border-b border-[#e0e0e0] sticky top-0 z-10">
      <div className="flex items-center gap-2 flex-1 max-w-xs bg-[#f5f5f5] border border-[#e0e0e0] rounded-md px-2.5 py-1.5">
        <i className="ph ph-magnifying-glass text-[#757575] text-sm" />
        <input placeholder="Search users, farms, robots…" aria-label="Search" className="border-none bg-transparent text-sm text-[#1C1C1E] w-full outline-none placeholder:text-[#9e9e9e]" />
      </div>
      <div className="flex items-center gap-2.5 ml-auto">
        <div className="flex items-center gap-1 px-2 py-1 bg-[#e8f5e9] text-[#2e7d32] text-xs rounded-full font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32] inline-block" />
          System online
        </div>
        <button aria-label="Notifications" className="relative cursor-pointer bg-none border-none text-lg text-[#757575] hover:text-[#1C1C1E]">
          <i className="ph ph-bell" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#ef5350] rounded-full border-2 border-white" />
        </button>
        <button aria-label="Profile" className="bg-none border-none cursor-pointer text-lg text-[#9e9e9e] hover:text-[#757575]">
          <i className="ph ph-user" />
        </button>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} aria-label="Logout" className="bg-none border-none cursor-pointer text-lg text-[#9e9e9e] hover:text-[#757575]">
          <i className="ph ph-sign-out" />
        </button>
      </div>
    </header>
  );
}
