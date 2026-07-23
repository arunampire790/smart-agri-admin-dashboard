import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../context/UserContext';
import { useFarms } from '../../context/FarmContext';
import { useRobots } from '../../context/RobotContext';
import { useTasks } from '../../context/TaskContext';
import { useEmployees } from '../../context/EmployeeContext';
import { useT, useLang } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import AdminProfileModal from './AdminProfileModal';

// TODO: Replace placeholder notifications with real backend/notification service integration once available
const initialNotifications = [
  { id: 1, text: 'Robot AgriBot Gamma battery low (45%)', time: '2 min ago', read: false },
  { id: 2, text: 'New task assigned: Irrigate Plot 4', time: '15 min ago', read: false },
  { id: 3, text: 'Farm Golden Harvest status changed to Idle', time: '1 hr ago', read: false },
];

export default function GlobalHeader() {
  const navigate = useNavigate();
  const { users } = useUsers();
  const { farms } = useFarms();
  const { robots } = useRobots();
  const { tasks } = useTasks();
  const { employees } = useEmployees();
  const t = useT('header');
  const { lang, toggleLang } = useLang();
  const { logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [notifPos, setNotifPos] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [adminName, setAdminName] = useState('Admin User');
  const [adminEmail, setAdminEmail] = useState('admin@smartagri.com');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const overlayInputRef = useRef(null);
  const resultsRef = useRef(null);
  const notifButtonRef = useRef(null);

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
    const farmsAll = farms.filter((f) => f.name.toLowerCase().includes(q) || f.owner.toLowerCase().includes(q));
    const robotsAll = robots.filter((r) => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || (r.owner && r.owner.toLowerCase().includes(q)) || r.model.toLowerCase().includes(q));
    const tasksAll = tasks.filter((t) => t.title.toLowerCase().includes(q) || (t.assignedTo && t.assignedTo.toLowerCase().includes(q)) || (t.farm && t.farm.toLowerCase().includes(q)));
    const employeesAll = employees.filter((e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || (e.role && e.role.toLowerCase().includes(q)));

    return {
      users: build(usersAll, (u) => ({ category: 'Users', label: u.name, sub: u.email, icon: 'ph-users', to: '/admin/users', key: `user-${u.name}` }), '/admin/users'),
      farms: build(farmsAll, (f) => ({ category: 'Farms', label: f.name, sub: (f.coordinates || []).length > 0 ? `${f.coordinates[0].lat.toFixed(2)}, ${f.coordinates[0].lng.toFixed(2)}` : '-', icon: 'ph-warehouse', to: '/admin/farms', key: `farm-${f.name}` }), '/admin/farms'),
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
      if (notifRef.current && !notifRef.current.contains(e.target) && !notifOpen) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [searchOpen, notifOpen]);

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
    if (e.key === 'Escape') { setProfileModalOpen(false); setNotifOpen(false); setSearchOpen(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = adminName.split(' ').map((n) => n[0]).join('').toUpperCase();

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOneRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const navigateTo = (path) => { setSearchOpen(false); setSearchQuery(''); navigate(path); };
  const seeAllNavigate = (path) => { sessionStorage.setItem('globalSearchPrefill', searchQuery); setSearchOpen(false); setSearchQuery(''); navigate(path); };

  const handleNotifToggle = () => {
    if (!notifOpen) {
      setSearchOpen(false);
      setProfileModalOpen(false);
      if (notifButtonRef.current) {
        const rect = notifButtonRef.current.getBoundingClientRect();
        setNotifPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
      }
    }
    setNotifOpen((o) => !o);
  };

  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') { setNotifOpen(false); setNotifPos(null); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [notifOpen]);

  const searchShortcut = (e) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setNotifOpen(false); setProfileModalOpen(false); searchInputRef.current?.focus(); setSearchOpen(true); }
  };

  return (
    <>
    <style>{`@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    <header className="flex justify-between items-center w-full h-[72px] px-6 shrink-0"
      style={{ background: '#ffffff', borderBottom: '1px solid rgba(20,46,28,0.08)' }}
      onKeyDown={searchShortcut}>
      <div className="flex items-center relative" ref={searchRef}>
        <div className="flex items-center gap-2.5 rounded-3xl px-4 py-2.5 w-[320px]" style={{ background: '#FFFFFF', border: '1px solid rgba(20,46,28,0.12)' }}>
          <i className="ph ph-magnifying-glass" style={{ color: '#9CA3AF', fontSize: '14px' }} />
          <input ref={searchInputRef} value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setNotifOpen(false); setProfileModalOpen(false); setSearchOpen(true); }} onFocus={() => { setNotifOpen(false); setProfileModalOpen(false); setSearchOpen(true); }} onKeyDown={handleSearchKeyDown} placeholder={t('searchPlaceholder')} aria-label="Search" className="border-none bg-transparent text-sm w-full outline-none"
            style={{ color: '#111827' }}
          />
          <style>{`header input::placeholder { color: #6B7280 !important; }`}</style>
        </div>

        {searchOpen && createPortal(
          <div className="fixed inset-0 z-[100]" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
            <div onClick={(e) => e.stopPropagation()} style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 560, maxWidth: 'calc(100vw - 32px)',
              background: '#ffffff',
              border: '1px solid rgba(76,175,80,0.15)',
              borderRadius: 16,
              boxShadow: '0 8px 32px rgba(26,46,26,0.15)',
              maxHeight: 'calc(100vh - 80px)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}>
              <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(76,175,80,0.1)' }}>
                <i className="ph ph-magnifying-glass text-lg" style={{ color: 'rgba(26,46,26,0.4)' }} />
                <input ref={overlayInputRef} value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); }} onKeyDown={handleSearchKeyDown} placeholder="Search users, farms, robots, tasks, employees..." aria-label="Search" className="border-none bg-transparent text-sm w-full outline-none"
                  style={{ color: '#1a2e1a', placeholder: { color: 'rgba(26,46,26,0.4)' } }}
                />
                <div className="text-[10px] font-medium px-2 py-1 rounded-md shrink-0" style={{ color: 'rgba(26,46,26,0.4)', background: 'rgba(76,175,80,0.08)' }}>⌘K</div>
              </div>
              <div className="overflow-y-auto" ref={resultsRef} style={{ maxHeight: 400 }} onMouseMove={handleDropdownMouseMove}>
                {!searchQuery.trim() ? (
                  <div className="px-4 py-12 text-center text-sm" style={{ color: '#5a7a5a' }}>
                    Start typing to search across users, farms, robots, tasks, and employees
                  </div>
                ) : searchQuery !== debouncedQuery ? (
                  <div className="px-4 py-12 text-center text-sm" style={{ color: '#5a7a5a' }}>Searching...</div>
                ) : hasAnyResults ? (
                  <div>
                    {(() => {
                      let idx = 0;
                      const labelMap = { users: 'Users', farms: 'Farms', robots: 'Robots', tasks: 'Tasks', employees: 'Employees' };
                      return Object.entries(filteredResults).map(([key, section]) =>
                        section.items.length > 0 && (
                          <div key={key}>
                            <div className="px-5 py-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(26,46,26,0.4)', background: 'rgba(76,175,80,0.04)' }}>{labelMap[key] || key}</div>
                            {section.items.map((item) => {
                              const ii = idx++;
                              return (
                                <button key={item.key} data-search-index={ii} onClick={() => navigateTo(item.to)}
                                  className={`flex items-center gap-3 w-full px-5 py-2.5 text-left bg-none border-none cursor-pointer transition-colors duration-150 ${focusedIndex === ii ? 'bg-[rgba(76,175,80,0.08)]' : ''}`}
                                  style={{ hover: { background: 'rgba(76,175,80,0.06)' } }}
                                >
                                  <i className={`${item.icon} text-base shrink-0`} style={{ color: 'rgba(26,46,26,0.4)' }} />
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium truncate" style={{ color: '#1a2e1a' }}>{item.label}</div>
                                    <div className="text-[10px] truncate" style={{ color: 'rgba(26,46,26,0.4)' }}>{item.sub}</div>
                                  </div>
                                </button>
                              );
                            })}
                            {section.hasMore && (
                              <button onClick={() => seeAllNavigate(section.path)}
                                className="flex items-center gap-2 w-full px-5 py-2 text-left bg-none border-none cursor-pointer transition-colors duration-150 text-xs font-medium"
                                style={{ color: '#2e7d2e' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(76,175,80,0.06)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                              >
                                See all results in {labelMap[key] || key}
                                <i className="ph ph-arrow-right text-xs" />
                              </button>
                            )}
                          </div>
                        )
                      );
                    })()}
                    <div className="px-5 py-2 text-[10px] text-center border-t" style={{ color: 'rgba(26,46,26,0.4)', borderColor: 'rgba(76,175,80,0.08)' }}>{totalCount} result{totalCount !== 1 ? 's' : ''}</div>
                  </div>
                ) : (
                  <div className="px-4 py-12 text-center text-sm" style={{ color: '#5a7a5a' }}>No results found for '<span className="font-medium" style={{ color: '#1a2e1a' }}>{(searchQuery || '').length > 30 ? searchQuery.slice(0, 30) + '...' : searchQuery}</span>'</div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>

      <div className="flex items-center gap-5 shrink-0">
        <button
          type="button"
          onClick={toggleLang}
          title={lang === 'en' ? 'Switch to Japanese / 日本語に切り替え' : 'Switch to English / 英語に切り替え'}
          aria-label="Toggle language"
          className="flex items-center gap-1 px-1 py-1 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer"
          style={{ background: 'rgba(20,46,28,0.05)', border: 'none' }}
        >
          <span className="px-2.5 py-1 rounded-full transition-colors" style={{ background: lang === 'en' ? '#142E1C' : 'transparent', color: lang === 'en' ? '#ffffff' : '#6b7280' }}>EN</span>
          <span className="px-2.5 py-1 rounded-full transition-colors" style={{ background: lang === 'ja' ? '#142E1C' : 'transparent', color: lang === 'ja' ? '#ffffff' : '#6b7280' }}>日本語</span>
        </button>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap" style={{ color: '#111827', background: 'rgba(20,46,28,0.05)', border: 'none' }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#4caf50', animation: 'pulse-dot 1.8s ease-in-out infinite' }} />
          {t('systemOnline')}
        </div>
        {/* Notification Bell */}
        <div className="relative shrink-0" ref={notifRef} onKeyDown={handleKeyDown}>
          <button ref={notifButtonRef} onClick={handleNotifToggle} aria-label="Notifications" aria-expanded={notifOpen} aria-haspopup="true"
            className="relative cursor-pointer bg-none border-none text-xl leading-none"
            style={{ color: '#1F2937', transition: 'color 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#1F2937'}>
            <i className="ph ph-bell" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-danger-text text-white text-[10px] leading-none px-1 py-0.5 rounded-full font-bold">{unreadCount}</span>
            )}
          </button>
          {notifOpen && notifPos && createPortal(
            <div className="fixed inset-0 z-[100]" onClick={() => { setNotifOpen(false); setNotifPos(null); }}>
              <div onClick={(e) => e.stopPropagation()} style={{
                position: 'fixed',
                top: notifPos.top,
                right: notifPos.right,
                width: 320,
                background: '#ffffff',
                border: '1px solid rgba(76,175,80,0.15)',
                borderRadius: 14,
                boxShadow: '0 8px 32px rgba(26,46,26,0.15)',
                overflow: 'hidden',
              }}>
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(76,175,80,0.08)' }}>
                  <span className="text-sm font-semibold" style={{ color: '#1a2e1a' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead}
                      className="bg-none border-none text-xs cursor-pointer hover:underline font-medium"
                      style={{ color: '#2e7d2e' }}
                    >Mark all as read</button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <button key={n.id} onClick={() => markOneRead(n.id)}
                      className={`flex items-start gap-3 w-full px-4 py-3 text-left bg-none border-none cursor-pointer transition-colors duration-150 ${n.read ? '' : ''}`}
                      style={{ hover: { background: '#f1f8f1' } }}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-transparent' : ''}`} style={{ background: n.read ? 'transparent' : '#4caf50' }} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm ${n.read ? '' : 'font-medium'}`} style={{ color: n.read ? '#5a7a5a' : '#1a2e1a' }}>{n.text}</div>
                        <div className="text-[10px] mt-0.5" style={{ color: '#5a7a5a' }}>{n.time}</div>
                      </div>
                    </button>
                  ))}
                </div>
                {notifications.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm" style={{ color: '#5a7a5a' }}>No notifications</div>
                )}
              </div>
            </div>,
            document.body
          )}
        </div>

        {/* User Avatar - opens Admin Profile modal directly */}
        <button onClick={() => setProfileModalOpen(true)} aria-label="Admin profile"
          className="bg-none border-none cursor-pointer shrink-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-transform duration-150 hover:scale-110"
            style={{ color: '#FFFFFF', background: '#2e7d2e', fontWeight: 600, fontSize: '14px', letterSpacing: '0.02em', boxShadow: 'none', transition: 'box-shadow 0.2s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(76,175,80,0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            {initials}
          </div>
        </button>
        <button onClick={handleLogout} aria-label="Logout"
          className="bg-none border-none cursor-pointer text-xl leading-none"
          style={{ color: '#1F2937', transition: 'color 0.2s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#111827'; e.currentTarget.style.background = 'rgba(20,46,28,0.05)'; e.currentTarget.style.borderRadius = '8px'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#1F2937'; e.currentTarget.style.background = 'none'; }}>
          <i className="ph ph-sign-out" />
        </button>
      </div>
    </header>
      {profileModalOpen && (
        <AdminProfileModal
          currentName={adminName}
          currentEmail={adminEmail}
          onClose={() => setProfileModalOpen(false)}
          onSave={(newName, newEmail) => { setAdminName(newName); setAdminEmail(newEmail); }}
        />
      )}
    </>
  );
}
