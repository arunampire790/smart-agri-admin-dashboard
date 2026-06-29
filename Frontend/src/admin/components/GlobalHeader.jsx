import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export default function GlobalHeader() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setProfileOpen(false);
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };
  const initials = 'Admin User'.split(' ').map((n) => n[0]).join('').toUpperCase();

  return (
    <header className="flex justify-between items-center w-full h-[72px] px-6 border-b border-white/30 glass shrink-0">
      <div className="flex items-center">
        <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 w-[320px]" style={{ background: 'var(--bg-glass-light)', border: '1px solid var(--border-glass-light)' }}>
          <i className="ph ph-magnifying-glass text-text-placeholder text-sm" />
          <input placeholder="Search..." aria-label="Search" className="border-none bg-transparent text-sm text-primary w-full outline-none placeholder:text-text-placeholder" />
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center px-3 py-1.5 rounded-full text-xs text-text-secondary font-medium whitespace-nowrap" style={{ background: 'var(--bg-glass-light)', border: '1px solid var(--border-glass-light)' }}>EN / 日本語</div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-text-secondary font-medium whitespace-nowrap" style={{ background: 'var(--bg-glass-light)', border: '1px solid var(--border-glass-light)' }}>
          <span className="w-2 h-2 rounded-full bg-brand inline-block" />
          System Online
        </div>
        <button onClick={toggleTheme} aria-label="Toggle theme" className="bg-none border-none cursor-pointer text-lg text-text-placeholder hover:text-text-secondary shrink-0">
          <i className={`ph ${theme === 'dark' ? 'ph-sun' : 'ph-moon'}`} />
        </button>
        <button aria-label="Notifications" className="relative cursor-pointer bg-none border-none text-lg text-text-secondary shrink-0">
          <i className="ph ph-bell" />
          <span className="absolute -top-1 -right-1 bg-danger-text text-white text-[10px] leading-none px-1 py-0.5 rounded-full font-bold">3</span>
        </button>
        <div className="relative shrink-0" ref={dropdownRef} onKeyDown={handleKeyDown}>
          <button onClick={() => setProfileOpen((o) => !o)} aria-label="Profile" aria-expanded={profileOpen} aria-haspopup="true"
            className="bg-none border-none cursor-pointer text-lg hover:opacity-80">
            <div className="w-8 h-8 rounded-full bg-brand-dark text-white flex items-center justify-center text-xs font-semibold">{initials}</div>
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/50 overflow-hidden z-50"
              style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}>
              <button onClick={() => { setProfileOpen(false); navigate('/admin/users'); }} onKeyDown={(e) => { if (e.key === 'Enter') { setProfileOpen(false); navigate('/admin/users'); } }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-primary font-medium bg-none border-none cursor-pointer hover:bg-[rgba(0,0,0,0.04)] transition-colors text-left"
              ><i className="ph ph-user-circle text-base" /> Profile</button>
              <button onClick={() => { setProfileOpen(false); navigate('/admin/settings'); }} onKeyDown={(e) => { if (e.key === 'Enter') { setProfileOpen(false); navigate('/admin/settings'); } }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-primary font-medium bg-none border-none cursor-pointer hover:bg-[rgba(0,0,0,0.04)] transition-colors text-left"
              ><i className="ph ph-gear-six text-base" /> Settings</button>
              <div className="h-px bg-[rgba(0,0,0,0.06)] mx-3" />
              <button onClick={() => { setProfileOpen(false); handleLogout(); }} onKeyDown={(e) => { if (e.key === 'Enter') { setProfileOpen(false); handleLogout(); } }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger-text font-medium bg-none border-none cursor-pointer hover:bg-[rgba(0,0,0,0.04)] transition-colors text-left"
              ><i className="ph ph-sign-out text-base" /> Logout</button>
            </div>
          )}
        </div>
        <button onClick={handleLogout} aria-label="Logout" className="bg-none border-none cursor-pointer text-lg text-text-placeholder hover:text-text-secondary shrink-0">
          <i className="ph ph-sign-out" />
        </button>
      </div>
    </header>
  );
}
