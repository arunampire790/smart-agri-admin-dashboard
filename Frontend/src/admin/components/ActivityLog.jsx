import { useState, useMemo, useEffect, useRef } from 'react';
import { useActivityLog } from '../../context/ActivityLogContext';
import { useT } from '../../i18n';

const entityColors = {
  User: 'bg-blue-100 text-blue-800',
  Farm: 'bg-emerald-100 text-emerald-800',
  Robot: 'bg-violet-100 text-violet-800',
  Task: 'bg-amber-100 text-amber-800',
};

const actionIcons = {
  'Added': 'ph-plus-circle',
  'Edited': 'ph-pencil',
  'Deleted': 'ph-trash',
  'Assigned': 'ph-user-plus',
  'Started': 'ph-play',
  'Completed': 'ph-check-circle',
};

function extractEntity(action) {
  if (action.includes('User')) return 'User';
  if (action.includes('Farm')) return 'Farm';
  if (action.includes('Robot')) return 'Robot';
  if (action.includes('Task')) return 'Task';
  return '';
}

function extractAction(action) {
  const parts = action.split(' ');
  return parts[0];
}

export default function ActivityLog() {
  const t = useT('activityLog');
  const { entries, refresh } = useActivityLog();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [activeEntries, setActiveEntries] = useState(0);
  const [timeRange, setTimeRange] = useState('Today');
  const [refreshing, setRefreshing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const btnRef = useRef(null);
  const timeOptions = ['Today', 'Last 7 Days', 'Last Month', 'Last Year'];
  // Keep the option values above stable for the filter logic; translate only the display.
  const timeLabelKeys = { 'Today': 'timeToday', 'Last 7 Days': 'time7Days', 'Last Month': 'timeMonth', 'Last Year': 'timeYear' };
  const timeLabel = (opt) => t(timeLabelKeys[opt] || opt);

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    refresh();
    setTimeout(() => setRefreshing(false), 500);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setActiveEntries(entries.filter((e) => now - new Date(e.timestamp).getTime() < 60000).length);
    }, 5000);
    return () => clearInterval(interval);
  }, [entries]);

  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => {
    let result = entries;
    if (filter !== 'all') result = result.filter((e) => extractEntity(e.action) === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((e) =>
        e.action.toLowerCase().includes(q) ||
        e.target.toLowerCase().includes(q) ||
        e.userName.toLowerCase().includes(q) ||
        e.details.toLowerCase().includes(q)
      );
    }
    const now = Date.now();
    if (timeRange === 'Today') {
      const today = new Date().toISOString().slice(0, 10);
      result = result.filter((e) => e.timestamp.slice(0, 10) === today);
    } else if (timeRange === 'Last 7 Days') {
      result = result.filter((e) => now - new Date(e.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === 'Last Month') {
      result = result.filter((e) => now - new Date(e.timestamp).getTime() < 30 * 24 * 60 * 60 * 1000);
    } else if (timeRange === 'Last Year') {
      result = result.filter((e) => now - new Date(e.timestamp).getTime() < 365 * 24 * 60 * 60 * 1000);
    }
    return result;
  }, [entries, filter, search, timeRange]);

  const formatTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return t('justNow');
    if (diff < 3600000) return `${Math.floor(diff / 60000)}${t('minutesAgo')}`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}${t('hoursAgo')}`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filters = ['all', 'User', 'Farm', 'Robot', 'Task'];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">{t('title')}</h1>
          <p className="text-sm text-text-secondary mt-1">{t('subtitle')}</p>
        </div>
        <button
          ref={btnRef}
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            background: 'linear-gradient(135deg, #2e7d2e, #4caf50)',
            border: 'none', borderRadius: '12px', color: '#fff',
            fontSize: '14px', fontWeight: 500, padding: '10px 20px',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
          onMouseEnter={(e) => { if (!refreshing) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(46,125,50,0.35)'; e.currentTarget.style.filter = 'brightness(1.08)'; } }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.filter = 'brightness(1)'; }}
        >
          <i className="ph ph-arrows-clockwise text-base" style={{ animation: refreshing ? 'spin 0.6s linear infinite' : 'none' }} />
          <span>{refreshing ? t('refreshing') : t('refresh')}</span>
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              filter === f
                ? 'bg-brand text-white shadow-md'
                : 'bg-white/50 text-text-secondary hover:bg-white/80 border border-white/40'
            }`}
          >
            {f === 'all' ? t('filterAll') : t('filter' + f)}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/50 border border-white/40 rounded-lg px-3 py-1.5">
            <i className="ph ph-magnifying-glass text-text-placeholder text-sm" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-primary w-40 placeholder:text-text-placeholder"
            />
          </div>
          <div className="relative" ref={dropdownRef} style={{ minWidth: '156px' }}>
            <button type="button" onClick={() => setDropdownOpen((o) => !o)}
              style={{
                background: 'rgba(255,255,255,0.5)', border: `1px solid ${dropdownOpen ? '#10B981' : '#D1D5DB'}`,
                borderRadius: '12px', color: '#111827', fontSize: '14px',
                height: '38px', padding: '0 36px 0 12px', width: '100%',
                outline: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
                textAlign: 'left', position: 'relative',
                boxShadow: dropdownOpen ? '0 0 0 2px rgba(52,199,89,0.3)' : 'none',
              }}
              onMouseEnter={(e) => { if (!dropdownOpen) e.currentTarget.style.borderColor = '#9CA3AF'; }}
              onMouseLeave={(e) => { if (!dropdownOpen) e.currentTarget.style.borderColor = '#D1D5DB'; }}
            >
              <span>{timeLabel(timeRange)}</span>
              <i className="ph ph-caret-down" style={{
                position: 'absolute', right: '12px', top: '50%',
                transform: `translateY(-50%) rotate(${dropdownOpen ? '180deg' : '0deg'})`,
                color: '#6B7280', fontSize: '12px', transition: 'transform 0.2s ease',
              }} />
            </button>
            {dropdownOpen && (
              <div style={{
                position: 'absolute', zIndex: 100, top: '100%', left: 0, right: 0, marginTop: '4px',
                background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)',
                border: '1px solid rgba(255,255,255,0.6)', borderRadius: '14px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden',
              }}>
                {timeOptions.map((opt) => {
                  const selected = opt === timeRange;
                  return (
                    <div key={opt} onClick={() => { setTimeRange(opt); setDropdownOpen(false); }}
                      style={{
                        padding: '12px 16px', fontSize: '14px',
                        color: selected ? '#10B981' : '#1d1d1f',
                        background: selected ? 'rgba(16,185,129,0.12)' : 'transparent',
                        cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}
                      onMouseEnter={(e) => {
                        if (!selected) { e.currentTarget.style.background = 'rgba(16,185,129,0.12)'; e.currentTarget.style.color = '#10B981'; }
                      }}
                      onMouseLeave={(e) => {
                        if (!selected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1d1d1f'; }
                      }}
                    >
                      <span>{timeLabel(opt)}</span>
                      {selected && <span style={{ color: '#10B981', fontSize: '14px', fontWeight: 600 }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/40 overflow-hidden">
        {activeEntries > 0 && (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-brand/10 border-b border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-700">{t('activeInLastMinute').replace('{n}', activeEntries)}</span>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-placeholder">
            <i className="ph ph-clock-counter-clockwise text-5xl mb-3 opacity-50" />
            <p className="text-sm font-medium">{t('noEntriesTitle')}</p>
            <p className="text-xs mt-1">{t('noEntriesSub')}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/20">
            {filtered.map((entry) => {
              const entity = extractEntity(entry.action);
              const actionType = extractAction(entry.action);
              const entityColor = entityColors[entity] || 'bg-gray-100 text-gray-800';
              const icon = actionIcons[actionType] || 'ph-dot';

              return (
                <div key={entry.id} className="flex items-start gap-3.5 px-5 py-3.5 hover:bg-white/20 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${entityColor}`}>
                    <i className={`ph ${icon} text-sm`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-primary">{entry.userName}</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/40 text-text-secondary">{entity ? t('filter' + entity) : t('system')}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${entityColor}`}>{entry.action}</span>
                    </div>
                    <p className="text-sm text-text-secondary mt-0.5">
                      <span className="font-medium text-primary">{entry.target}</span>
                      {entry.details && <span className="text-text-placeholder"> — {entry.details}</span>}
                    </p>
                  </div>
                  <div className="text-xs text-text-placeholder whitespace-nowrap shrink-0 pt-1.5">
                    {formatTime(entry.timestamp)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
