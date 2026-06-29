import { useState, useMemo, useEffect } from 'react';
import { useActivityLog } from '../../context/ActivityLogContext';

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
  const { entries, refresh } = useActivityLog();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [activeEntries, setActiveEntries] = useState(0);
  const [view, setView] = useState('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setActiveEntries(entries.filter((e) => now - new Date(e.timestamp).getTime() < 60000).length);
    }, 5000);
    return () => clearInterval(interval);
  }, [entries]);

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
    if (view === 'today') {
      const today = new Date().toISOString().slice(0, 10);
      result = result.filter((e) => e.timestamp.slice(0, 10) === today);
    }
    return result;
  }, [entries, filter, search, view]);

  const formatTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filters = ['all', 'User', 'Farm', 'Robot', 'Task'];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Activity Log</h1>
          <p className="text-sm text-text-secondary mt-1">Real-time audit trail of all system actions</p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand rounded-xl hover:bg-brand-dark transition-colors cursor-pointer"
        >
          <i className="ph ph-arrows-clockwise text-base" />
          Refresh
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
            {f === 'all' ? 'All' : f}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/50 border border-white/40 rounded-lg px-3 py-1.5">
            <i className="ph ph-magnifying-glass text-text-placeholder text-sm" />
            <input
              type="text"
              placeholder="Search log..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-primary w-40 placeholder:text-text-placeholder"
            />
          </div>
          <div className="flex bg-white/50 border border-white/40 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('realtime')}
              className={`px-3 py-1.5 text-sm font-medium transition-all cursor-pointer ${
                view === 'realtime' ? 'bg-brand text-white' : 'text-text-secondary hover:bg-white/30'
              }`}
            >
              Real-time
            </button>
            <button
              onClick={() => setView('today')}
              className={`px-3 py-1.5 text-sm font-medium transition-all cursor-pointer ${
                view === 'today' ? 'bg-brand text-white' : 'text-text-secondary hover:bg-white/30'
              }`}
            >
              Today
            </button>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/40 overflow-hidden">
        {activeEntries > 0 && (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-brand/10 border-b border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-700">{activeEntries} active in last minute</span>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-placeholder">
            <i className="ph ph-clock-counter-clockwise text-5xl mb-3 opacity-50" />
            <p className="text-sm font-medium">No activity entries found</p>
            <p className="text-xs mt-1">Actions will appear here as they occur</p>
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
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/40 text-text-secondary">{entity || 'System'}</span>
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
    </div>
  );
}
