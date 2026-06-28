import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useUsers } from '../../context/UserContext';
import { useFarms } from '../../context/FarmContext';
import { useRobots } from '../../context/RobotContext';
import { useTasks } from '../../context/TaskContext';
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
  const { isDark, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const bellRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const dropdownListRef = useRef(null);

  const doLogout = () => { logout(); localStorage.clear(); navigate('/login'); };

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  const unreadCount = notifications.filter((n) => n.unread).length;

  const { users } = useUsers();
  const { farms } = useFarms();
  const { robots } = useRobots();
  const { tasks } = useTasks();

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const matchedUsers = users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    const matchedFarms = farms.filter((f) => f.name.toLowerCase().includes(q) || f.location.toLowerCase().includes(q) || f.owner.toLowerCase().includes(q));
    const matchedRobots = robots.filter((r) => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.model.toLowerCase().includes(q));
    const matchedTasks = tasks.filter((t) => t.title.toLowerCase().includes(q));
    const groups = [];
    if (matchedUsers.length) groups.push({ category: 'Users', icon: 'ph-users', route: '/admin/users', items: matchedUsers });
    if (matchedFarms.length) groups.push({ category: 'Farms', icon: 'ph-warehouse', route: '/admin/farms', items: matchedFarms });
    if (matchedRobots.length) groups.push({ category: 'Robots', icon: 'ph-robot', route: '/admin/robots', items: matchedRobots });
    if (matchedTasks.length) groups.push({ category: 'Tasks', icon: 'ph-clipboard-text', route: '/admin/tasks', items: matchedTasks });
    return { groups, hasResults: groups.length > 0 };
  }, [searchQuery, users, farms, robots, tasks]);

  const flatItems = useMemo(() => {
    if (!searchResults?.hasResults) return [];
    const items = [];
    searchResults.groups.forEach((g) => g.items.forEach((item) => items.push({ group: g, item })));
    return items;
  }, [searchResults]);

  const handleSearchKeyDown = useCallback((e) => {
    if (!searchOpen || !searchResults?.hasResults) return;
    const last = flatItems.length - 1;
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIndex((p) => p < last ? p + 1 : p); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedIndex((p) => p > 0 ? p - 1 : 0); }
    else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      const entry = flatItems[focusedIndex];
      if (entry) { navigate(entry.group.route); setSearchOpen(false); setSearchQuery(''); setFocusedIndex(-1); }
    } else if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); setFocusedIndex(-1); }
  }, [searchOpen, searchResults, flatItems, focusedIndex, navigate]);

  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchQuery]);

  useEffect(() => {
    if (focusedIndex < 0 || !dropdownListRef.current) return;
    const el = dropdownListRef.current.querySelector(`[data-index="${focusedIndex}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [focusedIndex]);

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

  const handleSearchClickOutside = useCallback((e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    document.addEventListener('mousedown', handleSearchClickOutside);
    return () => document.removeEventListener('mousedown', handleSearchClickOutside);
  }, [searchOpen, handleSearchClickOutside]);

  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e) => { if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); } };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [searchOpen]);

  return (
    <>
    <header className="flex justify-between items-center w-full h-[72px] px-6 shrink-0" style={{ position: 'sticky', top: 0, zIndex: 40, background: 'var(--clr-card)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-glass-light)' }}>
      <div ref={searchRef} className="relative">
        <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 w-[320px]" style={{ background: 'var(--clr-card)', border: '1px solid var(--border-glass-med)' }}>
          <i className="ph ph-magnifying-glass text-[#6B7280] text-sm" />
          <input
            placeholder="Search..."
            aria-label="Search"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); setFocusedIndex(-1); }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={handleSearchKeyDown}
            className="border-none bg-transparent text-sm text-[#1C1C1E] w-full outline-none placeholder:text-[#9CA3AF]"
          />
        </div>
        {searchOpen && searchResults && (
          <div className="absolute left-0 z-50 min-w-[320px] overflow-hidden rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/60"
            style={{ top: 'calc(100% + 6px)', background: 'var(--bg-glass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
          >
            {searchResults.hasResults ? (
              <div ref={dropdownListRef} className="max-h-80 overflow-y-auto">
                {(() => { let idx = -1; return searchResults.groups.map((group) => (
                  <div key={group.category}>
                    <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-placeholder">{group.category}</div>
                    {group.items.map((item, i) => { idx++; const fi = idx; return (
                      <div key={`${group.category}-${i}`}
                        data-index={fi}
                        onClick={() => { navigate(group.route); setSearchOpen(false); setSearchQuery(''); setFocusedIndex(-1); }}
                        onMouseEnter={() => setFocusedIndex(fi)}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors duration-100 ${fi === focusedIndex ? 'bg-brand-light' : 'hover:bg-white/50'}`}
                      >
                        <i className={`${group.icon} text-sm text-text-placeholder`} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-[#1C1C1E] font-medium truncate">{item.name || item.title}</div>
                          <div className="text-[11px] text-text-placeholder truncate">{item.email || item.location || item.id || item.assignedTo || ''}</div>
                        </div>
                      </div>
                    ); })}
                  </div>
                )); })()}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-text-placeholder">No results found</div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center px-3 py-1.5 rounded-full text-xs text-[#4B5563] font-medium whitespace-nowrap" style={{ background: 'var(--clr-card)', border: '1px solid var(--border-glass-med)' }}>EN / 日本語</div>
        <button onClick={toggleTheme} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} className="bg-none border-none cursor-pointer text-lg text-[#4B5563] hover:text-[#1C1C1E] shrink-0 flex">
          <i className={`ph ${isDark ? 'ph-sun' : 'ph-moon'}`} />
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-[#4B5563] font-medium whitespace-nowrap" style={{ background: 'var(--clr-card)', border: '1px solid var(--border-glass-med)' }}>
          <span className="w-2 h-2 rounded-full bg-brand inline-block pulse-dot" />
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
              style={{ top: 'calc(100% + 6px)', background: 'var(--bg-glass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
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
