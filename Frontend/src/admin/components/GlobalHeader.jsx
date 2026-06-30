import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useUsers } from '../../context/UserContext';
import { useFarms } from '../../context/FarmContext';
import { useRobots } from '../../context/RobotContext';
import { useTasks } from '../../context/TaskContext';
import { useEmployees } from '../../context/EmployeeContext';

// TODO: Replace placeholder notifications with real backend/notification service integration once available
const initialNotifications = [
  { id: 1, text: 'Robot AgriBot Gamma battery low (45%)', time: '2 min ago', read: false },
  { id: 2, text: 'New task assigned: Irrigate Plot 4', time: '15 min ago', read: false },
  { id: 3, text: 'Farm Golden Harvest status changed to Idle', time: '1 hr ago', read: false },
];

export default function GlobalHeader() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { users } = useUsers();
  const { farms } = useFarms();
  const { robots } = useRobots();
  const { tasks } = useTasks();
  const { employees } = useEmployees();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const overlayInputRef = useRef(null);
  const resultsRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (searchOpen && overlayInputRef.current) {
      overlayInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [searchOpen]);

  const filteredResults = useMemo(() => {
    if (!debouncedQuery.trim()) return null;
    const q = debouncedQuery.toLowerCase();
    const LIMIT = 3;

    const build = (all, mapper, path) => {
      const sliced = all.slice(0, LIMIT).map(mapper);
      return { items: sliced, hasMore: all.length > LIMIT, path };
    };

    const usersAll = users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    const farmsAll = farms.filter((f) => f.name.toLowerCase().includes(q) || f.location.toLowerCase().includes(q) || f.owner.toLowerCase().includes(q));
    const robotsAll = robots.filter((r) => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || (r.owner && r.owner.toLowerCase().includes(q)) || r.model.toLowerCase().includes(q));
    const tasksAll = tasks.filter((t) => t.title.toLowerCase().includes(q) || (t.assignedTo && t.assignedTo.toLowerCase().includes(q)) || (t.farm && t.farm.toLowerCase().includes(q)));
    const employeesAll = employees.filter((e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || (e.role && e.role.toLowerCase().includes(q)));

    return {
      users: build(usersAll, (u) => ({ category: 'Users', label: u.name, sub: u.email, icon: 'ph-users', to: '/admin/users', key: `user-${u.name}` }), '/admin/users'),
      farms: build(farmsAll, (f) => ({ category: 'Farms', label: f.name, sub: f.location, icon: 'ph-warehouse', to: '/admin/farms', key: `farm-${f.name}` }), '/admin/farms'),
      robots: build(robotsAll, (r) => ({ category: 'Robots', label: r.name, sub: r.id, icon: 'ph-robot', to: '/admin/robots', key: `robot-${r.id}` }), '/admin/robots'),
      tasks: build(tasksAll, (t) => ({ category: 'Tasks', label: t.title, sub: t.farm, icon: 'ph-clipboard-text', to: '/admin/tasks', key: `task-${t.id}` }), '/admin/tasks'),
      employees: build(employeesAll, (e) => ({ category: 'Employees', label: e.name, sub: e.email, icon: 'ph-user', to: '/admin/employees', key: `emp-${e.name}` }), '/admin/employees'),
    };
  }, [debouncedQuery, users, farms, robots, tasks, employees]);

  const flatItems = useMemo(() => {
    if (!filteredResults) return [];
    const all = [];
    Object.values(filteredResults).forEach((s) => all.push(...s.items));
    return all;
  }, [filteredResults]);

  const hasAnyResults = filteredResults && Object.values(filteredResults).some((s) => s.items.length > 0);
  const totalCount = filteredResults ? Object.values(filteredResults).reduce((sum, s) => sum + s.items.length, 0) : 0;

  useEffect(() => { setFocusedIndex(-1); }, [searchQuery]);

  useEffect(() => {
    if (focusedIndex < 0) return;
    const el = resultsRef.current?.querySelector(`[data-search-index="${focusedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [focusedIndex]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target) && !searchOpen) setSearchOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [searchOpen]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === 'Enter') {
      if (focusedIndex >= 0 && focusedIndex < flatItems.length) {
        e.preventDefault();
        navigateTo(flatItems[focusedIndex].to);
      } else if (flatItems.length > 0) {
        e.preventDefault();
        const firstSection = Object.values(filteredResults).find((s) => s.items.length > 0);
        if (firstSection) {
          sessionStorage.setItem('globalSearchPrefill', searchQuery);
          setSearchOpen(false);
          setSearchQuery('');
          navigate(firstSection.path);
        }
      }
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchQuery('');
      searchInputRef.current?.blur();
    }
  };

  const handleDropdownMouseMove = () => { if (focusedIndex !== -1) setFocusedIndex(-1); };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { setProfileOpen(false); setNotifOpen(false); setSearchOpen(false); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };
  const initials = 'Admin User'.split(' ').map((n) => n[0]).join('').toUpperCase();

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOneRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const navigateTo = (path) => { setSearchOpen(false); setSearchQuery(''); navigate(path); };
  const seeAllNavigate = (path) => { sessionStorage.setItem('globalSearchPrefill', searchQuery); setSearchOpen(false); setSearchQuery(''); navigate(path); };

  const searchShortcut = (e) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); searchInputRef.current?.focus(); setSearchOpen(true); }
  };

  return (
    <>
    <style>{`@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    <header className="flex justify-between items-center w-full h-[72px] px-6 border-b border-white/30 glass shrink-0" onKeyDown={searchShortcut}>
      <div className="flex items-center relative" ref={searchRef}>
        <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 w-[320px]" style={{ background: 'var(--bg-glass-light)', border: '1px solid var(--border-glass-light)' }}>
          <i className="ph ph-magnifying-glass text-text-placeholder text-sm" />
          <input ref={searchInputRef} value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} onKeyDown={handleSearchKeyDown} placeholder="Search..." aria-label="Search" className="border-none bg-transparent text-sm text-primary w-full outline-none placeholder:text-text-placeholder" />
        </div>

        {searchOpen && createPortal(
          <div className="fixed inset-0 z-[100]" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
            <div onClick={(e) => e.stopPropagation()} style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 560, maxWidth: 'calc(100vw - 32px)',
              background: 'rgba(255,255,255,0.65)',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(25px)',
              border: '1px solid rgba(255,255,255,0.6)',
              borderRadius: 24,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              maxHeight: 'calc(100vh - 80px)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}>
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(0,0,0,0.06)]">
                <i className="ph ph-magnifying-glass text-lg text-text-placeholder shrink-0" />
                <input ref={overlayInputRef} value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); }} onKeyDown={handleSearchKeyDown} placeholder="Search users, farms, robots, tasks, employees..." aria-label="Search" className="border-none bg-transparent text-sm text-primary w-full outline-none placeholder:text-text-placeholder" />
                <div className="text-[10px] text-text-placeholder font-medium px-2 py-1 rounded-md shrink-0" style={{ background: 'rgba(0,0,0,0.04)' }}>⌘K</div>
              </div>
              <div className="overflow-y-auto" ref={resultsRef} style={{ maxHeight: 400 }} onMouseMove={handleDropdownMouseMove}>
                {!searchQuery.trim() ? (
                  <div className="px-4 py-12 text-center text-sm text-text-secondary">
                    Start typing to search across users, farms, robots, tasks, and employees
                  </div>
                ) : searchQuery !== debouncedQuery ? (
                  <div className="px-4 py-12 text-center text-sm text-text-secondary">Searching...</div>
                ) : hasAnyResults ? (
                  <div>
                    {(() => {
                      let idx = 0;
                      const labelMap = { users: 'Users', farms: 'Farms', robots: 'Robots', tasks: 'Tasks', employees: 'Employees' };
                      return Object.entries(filteredResults).map(([key, section]) =>
                        section.items.length > 0 && (
                          <div key={key}>
                            <div className="px-5 py-2 text-[10px] font-semibold text-text-secondary uppercase tracking-wider bg-[rgba(0,0,0,0.02)]">{labelMap[key] || key}</div>
                            {section.items.map((item) => {
                              const ii = idx++;
                              return (
                                <button key={item.key} data-search-index={ii} onClick={() => navigateTo(item.to)}
                                  className={`flex items-center gap-3 w-full px-5 py-2.5 text-left bg-none border-none cursor-pointer transition-colors duration-150 ${focusedIndex === ii ? 'bg-[rgba(0,0,0,0.06)]' : ''} hover:bg-[rgba(0,0,0,0.06)]`}
                                >
                                  <i className={`${item.icon} text-base text-text-placeholder shrink-0`} />
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm text-primary font-medium truncate">{item.label}</div>
                                    <div className="text-[10px] text-text-placeholder truncate">{item.sub}</div>
                                  </div>
                                </button>
                              );
                            })}
                            {section.hasMore && (
                              <button onClick={() => seeAllNavigate(section.path)}
                                className="flex items-center gap-2 w-full px-5 py-2 text-left bg-none border-none cursor-pointer transition-colors duration-150 hover:bg-[rgba(16,185,129,0.06)] text-xs text-brand font-medium"
                              >
                                See all results in {labelMap[key] || key}
                                <i className="ph ph-arrow-right text-xs" />
                              </button>
                            )}
                          </div>
                        )
                      );
                    })()}
                    <div className="px-5 py-2 text-[10px] text-text-placeholder text-center border-t border-[rgba(0,0,0,0.04)]">{totalCount} result{totalCount !== 1 ? 's' : ''}</div>
                  </div>
                ) : (
                  <div className="px-4 py-12 text-center text-sm text-text-secondary">No results found for '<span className="font-medium text-primary">{(searchQuery || '').length > 30 ? searchQuery.slice(0, 30) + '...' : searchQuery}</span>'</div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>

      <div className="flex items-center gap-5 shrink-0">
        <div className="flex items-center px-3 py-2 rounded-full text-xs text-text-secondary font-medium whitespace-nowrap" style={{ background: 'var(--bg-glass-light)', border: '1px solid var(--border-glass-light)' }}>EN / 日本語</div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs text-text-secondary font-medium whitespace-nowrap" style={{ background: 'var(--bg-glass-light)', border: '1px solid var(--border-glass-light)' }}>
          <span className="w-2 h-2 rounded-full bg-brand inline-block" style={{ animation: 'pulse-dot 1.8s ease-in-out infinite' }} />
          System Online
        </div>
        <button onClick={toggleTheme} aria-label="Toggle theme" className="bg-none border-none cursor-pointer text-xl text-text-placeholder hover:text-text-secondary shrink-0 leading-none">
          <i className={`ph ${theme === 'dark' ? 'ph-sun' : 'ph-moon'}`} />
        </button>

        {/* Notification Bell */}
        <div className="relative shrink-0" ref={notifRef} onKeyDown={handleKeyDown}>
          <button onClick={() => setNotifOpen((o) => !o)} aria-label="Notifications" aria-expanded={notifOpen} aria-haspopup="true"
            className="relative cursor-pointer bg-none border-none text-xl text-text-secondary hover:text-text-placeholder transition-colors duration-150 leading-none">
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
            <div className="w-8 h-8 rounded-full bg-brand-dark text-white flex items-center justify-center text-xs font-semibold transition-transform duration-150 hover:scale-110 hover:shadow-[0_0_0_3px_rgba(5,150,105,0.3)]">
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
        <button onClick={handleLogout} aria-label="Logout" className="bg-none border-none cursor-pointer text-xl text-text-placeholder hover:text-text-secondary shrink-0 leading-none">
          <i className="ph ph-sign-out" />
        </button>
      </div>
    </header>
    </>
  );
}
