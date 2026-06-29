import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

// TODO: Replace placeholder notifications with real backend/notification service integration once available
const initialNotifications = [
  { id: 1, text: 'Robot AgriBot Gamma battery low (45%)', time: '2 min ago', read: false },
  { id: 2, text: 'New task assigned: Irrigate Plot 4', time: '15 min ago', read: false },
  { id: 3, text: 'Farm Golden Harvest status changed to Idle', time: '1 hr ago', read: false },
];

export default function GlobalHeader() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { setProfileOpen(false); setNotifOpen(false); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };
  const initials = 'Admin User'.split(' ').map((n) => n[0]).join('').toUpperCase();

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOneRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

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

        {/* Notification Bell */}
        <div className="relative shrink-0" ref={notifRef} onKeyDown={handleKeyDown}>
          <button onClick={() => setNotifOpen((o) => !o)} aria-label="Notifications" aria-expanded={notifOpen} aria-haspopup="true"
            className="relative cursor-pointer bg-none border-none text-lg text-text-secondary hover:text-text-placeholder transition-colors duration-150">
            <i className="ph ph-bell" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-danger-text text-white text-[10px] leading-none px-1 py-0.5 rounded-full font-bold">{unreadCount}</span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/50 overflow-hidden z-50"
              style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(0,0,0,0.06)]">
                <span className="text-sm font-semibold text-primary">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead}
                    className="bg-none border-none text-xs text-brand cursor-pointer hover:underline font-medium"
                  >Mark all as read</button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <button key={n.id} onClick={() => markOneRead(n.id)}
                    className={`flex items-start gap-3 w-full px-4 py-3 text-left bg-none border-none cursor-pointer transition-colors duration-150 hover:bg-[rgba(0,0,0,0.04)] ${n.read ? '' : 'bg-[rgba(16,185,129,0.04)]'}`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-transparent' : 'bg-brand'}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm ${n.read ? 'text-text-secondary' : 'text-primary font-medium'}`}>{n.text}</div>
                      <div className="text-[10px] text-text-placeholder mt-0.5">{n.time}</div>
                    </div>
                  </button>
                ))}
              </div>
              {notifications.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-text-secondary">No notifications</div>
              )}
            </div>
          )}
        </div>

        {/* User Avatar / Profile Dropdown */}
        <div className="relative shrink-0" ref={profileRef} onKeyDown={handleKeyDown}>
          <button onClick={() => setProfileOpen((o) => !o)} aria-label="Profile" aria-expanded={profileOpen} aria-haspopup="true"
            className="bg-none border-none cursor-pointer">
            <div className="w-6 h-6 rounded-full bg-brand-dark text-white flex items-center justify-center text-[10px] font-semibold transition-transform duration-150 hover:scale-110 hover:shadow-[0_0_0_3px_rgba(5,150,105,0.3)]">
              {initials}
            </div>
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
