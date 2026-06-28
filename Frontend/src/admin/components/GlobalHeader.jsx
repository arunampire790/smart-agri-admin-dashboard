import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminProfileModal from './AdminProfileModal';

// TODO: Replace placeholder notifications with real backend/notification service integration once available.
const initialNotifications = [
  { id: 1, text: 'Robot AgriBot Gamma battery low (45%)', time: '5m ago', unread: true },
  { id: 2, text: 'New task assigned: Irrigate Plot 4', time: '1h ago', unread: true },
  { id: 3, text: 'Farm Golden Harvest status changed to Idle', time: '2h ago', unread: true },
];

export default function GlobalHeader() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const bellRef = useRef(null);
  const dropdownRef = useRef(null);

  const doLogout = () => { logout(); localStorage.clear(); navigate('/login'); };

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleBellClick = () => setBellOpen((o) => !o);

  const handleClickOutside = useCallback((e) => {
    if (
      bellRef.current && !bellRef.current.contains(e.target) &&
      dropdownRef.current && !dropdownRef.current.contains(e.target)
    ) {
      setBellOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!bellOpen) return;
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [bellOpen, handleClickOutside]);

  useEffect(() => {
    if (!bellOpen) return;
    const handler = (e) => { if (e.key === 'Escape') setBellOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [bellOpen]);

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

        <div className="relative">
          <button ref={bellRef} onClick={handleBellClick} aria-label="Notifications" className="relative cursor-pointer bg-none border-none text-lg text-[#4B5563] shrink-0 hover:text-[#1C1C1E] transition-colors duration-150">
            <i className="ph ph-bell" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-danger-text text-white text-[10px] leading-none px-1 py-0.5 rounded-full font-bold">{unreadCount}</span>
            )}
          </button>
          {bellOpen && (
            <div ref={dropdownRef} className="absolute right-0 z-50 min-w-[280px] overflow-hidden rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/60"
              style={{ top: 'calc(100% + 6px)', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/40">
                <span className="text-sm font-semibold text-[#1C1C1E]">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] font-medium text-brand bg-none border-none cursor-pointer hover:underline">Mark all as read</button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-white/30 transition-colors duration-100 ${n.unread ? 'bg-white/30' : ''}`}
                    onClick={() => { setNotifications((prev) => prev.map((p) => p.id === n.id ? { ...p, unread: false } : p)); }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.unread ? 'bg-brand' : 'bg-text-placeholder'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-[#1C1C1E] leading-relaxed">{n.text}</div>
                      <div className="text-[10px] text-text-placeholder mt-0.5">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              {notifications.length === 0 && (
                <div className="py-8 text-center text-xs text-text-placeholder">No notifications</div>
              )}
            </div>
          )}
        </div>

        <button onClick={() => setProfileOpen(true)} aria-label="Profile" className="w-[18px] h-[18px] rounded-full bg-brand-dark text-white flex items-center justify-center text-[8px] font-bold cursor-pointer shrink-0 hover:ring-2 hover:ring-white/60 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-white/60 hover:scale-110">
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
