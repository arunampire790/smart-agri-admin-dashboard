import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminProfileModal from './AdminProfileModal';

export default function GlobalHeader() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const doLogout = () => { logout(); localStorage.clear(); navigate('/login'); };

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  return (
    <>
    <header className="flex justify-between items-center w-full h-[72px] px-6 shrink-0" style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
      <div className="flex items-center">
        <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 w-[320px]" style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.5)' }}>
          <i className="ph ph-magnifying-glass text-[#6B7280] text-sm" />
          <input placeholder="Search..." aria-label="Search" className="border-none bg-transparent text-sm text-[#1C1C1E] w-full outline-none placeholder:text-[#9CA3AF]" />
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center px-3 py-1.5 rounded-full text-xs text-[#4B5563] font-medium whitespace-nowrap" style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.5)' }}>EN / 日本語</div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-[#4B5563] font-medium whitespace-nowrap" style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.5)' }}>
          <span className="w-2 h-2 rounded-full bg-brand inline-block" />
          System Online
        </div>
        <button aria-label="Notifications" className="relative cursor-pointer bg-none border-none text-lg text-[#4B5563] shrink-0 hover:text-[#1C1C1E]">
          <i className="ph ph-bell" />
          <span className="absolute -top-1 -right-1 bg-danger-text text-white text-[10px] leading-none px-1 py-0.5 rounded-full font-bold">3</span>
        </button>

        <button onClick={() => setProfileOpen(true)} aria-label="Profile" className="w-8 h-8 rounded-full bg-brand-dark text-white flex items-center justify-center text-xs font-semibold cursor-pointer shrink-0 hover:ring-2 hover:ring-white/60 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-white/60">
          {initials}
        </button>

        <button onClick={doLogout} aria-label="Logout" className="bg-none border-none cursor-pointer text-lg text-[#4B5563] hover:text-[#1C1C1E] shrink-0">
          <i className="ph ph-sign-out" />
        </button>
      </div>
    </header>
    {profileOpen && <AdminProfileModal onClose={() => setProfileOpen(false)} />}
    </>
  );
}
