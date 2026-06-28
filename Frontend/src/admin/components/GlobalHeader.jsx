import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GlobalHeader() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { setMenuOpen(false); btnRef.current?.focus(); }
    if (e.key === 'ArrowDown') { const first = menuRef.current?.querySelector('button'); if (first) first.focus(); }
  };

  const handleMenuKeyDown = (e, index) => {
    const items = menuRef.current?.querySelectorAll('button');
    if (!items) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(index + 1) % items.length]?.focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); items[(index - 1 + items.length) % items.length]?.focus(); }
    if (e.key === 'Escape') { setMenuOpen(false); btnRef.current?.focus(); }
  };

  const doLogout = () => { localStorage.clear(); navigate('/login'); };

  return (
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

        <div className="relative">
          <button ref={btnRef} aria-label="Profile" aria-haspopup="true" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)} onKeyDown={handleKeyDown} className="bg-none border-none cursor-pointer text-lg text-[#4B5563] hover:text-[#1C1C1E] shrink-0">
            <i className="ph ph-user" />
          </button>
          {menuOpen && (
            <div ref={menuRef} role="menu" className="absolute right-0 z-50 min-w-[180px] overflow-hidden rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/60"
              style={{ top: 'calc(100% + 6px)', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
              onKeyDown={(e) => { if (e.key === 'Escape') { setMenuOpen(false); btnRef.current?.focus(); } }}
            >
              <button role="menuitem" onClick={() => { setMenuOpen(false); navigate('/admin/settings'); }} onKeyDown={(e) => handleMenuKeyDown(e, 0)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[#1C1C1E] bg-none border-none cursor-pointer transition-colors duration-100 hover:bg-white/60 text-left">
                <i className="ph ph-user text-sm text-[#6B7280]" /> Profile
              </button>
              <button role="menuitem" onClick={() => { setMenuOpen(false); navigate('/admin/settings'); }} onKeyDown={(e) => handleMenuKeyDown(e, 1)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[#1C1C1E] bg-none border-none cursor-pointer transition-colors duration-100 hover:bg-white/60 text-left">
                <i className="ph ph-gear text-sm text-[#6B7280]" /> Settings
              </button>
              <div className="mx-3 border-t border-white/40" />
              <button role="menuitem" onClick={() => { setMenuOpen(false); doLogout(); }} onKeyDown={(e) => handleMenuKeyDown(e, 2)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[#DC2626] bg-none border-none cursor-pointer transition-colors duration-100 hover:bg-white/60 text-left">
                <i className="ph ph-sign-out text-sm text-[#DC2626]" /> Logout
              </button>
            </div>
          )}
        </div>

        <button onClick={doLogout} aria-label="Logout" className="bg-none border-none cursor-pointer text-lg text-[#4B5563] hover:text-[#1C1C1E] shrink-0">
          <i className="ph ph-sign-out" />
        </button>
      </div>
    </header>
  );
}
