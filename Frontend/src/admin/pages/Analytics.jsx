import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUsers } from '../../context/UserContext';
import { useFarms } from '../../context/FarmContext';
import { useRobots } from '../../context/RobotContext';
import { useTasks } from '../../context/TaskContext';
import { useEmployees } from '../../context/EmployeeContext';
import { useActivityLog } from '../../context/ActivityLogContext';
import { computeTriangleAreaAcres } from '../../utils/farmArea';
import { AlertTriangle, Thermometer, Droplets, Radar, MapPin, CheckCircle, ArrowRight, ChevronDown, Check } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { mockSensorReadings } from '../../data/mockSensorData';

function GlowCard({ className, onClick, children }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={className}
      style={{
        cursor: onClick ? 'pointer' : undefined,
        transition: 'all 0.25s ease',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 8px 24px rgba(26,46,26,0.15)' : '0 2px 12px rgba(46,125,50,0.08)',
      }}
    >
      {children}
    </div>
  );
}

function Clickable({ onClick, children, showArrow }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        cursor: 'pointer', transition: 'all 0.15s ease',
        background: hover ? 'rgba(76,175,80,0.06)' : 'transparent',
        borderRadius: '8px', padding: '8px 10px',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}
    >
      {children}
      {showArrow && hover && (
        <ArrowRight size={14} color="#2e7d2e" className="shrink-0 ml-auto" style={{ opacity: 0.6 }} />
      )}
    </div>
  );
}

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function actionDot(action) {
  const a = (action || '').toLowerCase();
  if (a.includes('add') || a.startsWith('create')) return '#10B981';
  if (a.includes('edit') || a.includes('update')) return '#F59E0B';
  if (a.includes('delete') || a.includes('remove')) return '#EF4444';
  return '#9CA3AF';
}

function RobotSelect({ robots, selectedId, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div className="relative" ref={ref} style={{ width: '200px' }}>
      <button type="button" onClick={() => setOpen((o) => !o)}
        style={{
          background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '8px',
          color: '#111827', fontSize: '13px', height: '34px', padding: '0 30px 0 10px',
          width: '100%', outline: 'none', boxSizing: 'border-box', cursor: 'pointer',
          transition: 'all 0.2s ease', textAlign: 'left', position: 'relative',
          display: 'flex', alignItems: 'center',
          boxShadow: open ? '0 0 0 2px rgba(52,199,89,0.3)' : 'none',
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.borderColor = '#9CA3AF'; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.borderColor = '#D1D5DB'; }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, color: selectedId ? '#111827' : '#9CA3AF' }}>
          {(() => { const r = robots.find((x) => x.id === selectedId); return r ? `${r.name} (${r.id})` : 'Select robot'; })()}
        </span>
        <ChevronDown size={14} style={{ position: 'absolute', right: '8px', top: '50%', transform: `translateY(-50%) rotate(${open ? '180deg' : '0deg'})`, color: '#6B7280', transition: 'transform 0.2s ease', flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', zIndex: 100, top: '100%', left: 0, right: 0, marginTop: '4px',
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(25px)',
          border: '1px solid rgba(255,255,255,0.6)', borderRadius: '14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden',
        }}>
          {robots.map((r) => {
            const sel = r.id === selectedId;
            return (
              <div key={r.id} onClick={() => { onChange(r.id); setOpen(false); }}
                style={{
                  padding: '10px 14px', fontSize: '13px', cursor: 'pointer',
                  background: sel ? 'rgba(76,175,80,0.12)' : 'transparent',
                  color: sel ? '#4caf50' : '#1d1d1f',
                  transition: 'background 0.15s, color 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
                onMouseEnter={(e) => { if (!sel) { e.currentTarget.style.background = 'rgba(76,175,80,0.12)'; e.currentTarget.style.color = '#4caf50'; } }}
                onMouseLeave={(e) => { if (!sel) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1d1d1f'; } }}
              >
                <span>{r.name} ({r.id})</span>
                {sel && <Check size={12} color="#4caf50" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Analytics() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { users } = useUsers();
  const { farms } = useFarms();
  const { robots } = useRobots();
  const { tasks } = useTasks();
  const { employees } = useEmployees();
  const { entries } = useActivityLog();

  const isMasterAdmin = currentUser?.role === 'masterAdmin';
  const now = new Date();

  const offlineRobots = robots.filter((r) => r.status === 'Offline');
  const criticalBattRobots = robots.filter((r) => r.battery < 20);
  const overdueTasks = tasks.filter((t) => t.status !== 'Completed' && new Date(t.dueDate) < now);
  const hasAlerts = offlineRobots.length > 0 || criticalBattRobots.length > 0 || overdueTasks.length > 0;
  const hasCriticalAlerts = offlineRobots.length > 0;

  const batterySorted = useMemo(() => {
    const order = { 'Critical': 0, 'Low': 1, 'Good': 2, 'Excellent': 3 };
    return [...robots].sort((a, b) => {
      const aOff = a.status === 'Offline';
      const bOff = b.status === 'Offline';
      if (aOff && !bOff) return -1;
      if (!aOff && bOff) return 1;
      const aLabel = a.battery < 20 ? 'Critical' : a.battery < 50 ? 'Low' : a.battery < 80 ? 'Good' : 'Excellent';
      const bLabel = b.battery < 20 ? 'Critical' : b.battery < 50 ? 'Low' : b.battery < 80 ? 'Good' : 'Excellent';
      return order[aLabel] - order[bLabel];
    });
  }, [robots]);

  const robotsNeedAttention = robots.filter((r) => r.status === 'Offline' || r.battery < 50);

  const pendingTasks = tasks.filter((t) => t.status === 'Pending');
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress');
  const completedTasks = tasks.filter((t) => t.status === 'Completed');

  const statusChartData = useMemo(() => [
    { name: 'Pending', value: tasks.filter((t) => t.status === 'Pending').length, color: '#f97316' },
    { name: 'In Progress', value: tasks.filter((t) => t.status === 'In Progress').length, color: '#3b82f6' },
    { name: 'Completed', value: tasks.filter((t) => t.status === 'Completed').length, color: '#2e7d2e' },
  ], [tasks]);

  const hashStr = (s) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
    return Math.abs(h);
  };

  const farmAreaAcres = useMemo(() => {
    return farms.map((f, idx) => {
      const h = hashStr(f.name + idx);
      const baseLat = 36.5 + (h % 100) / 200;
      const baseLng = -(119.5 + ((h * 7) % 100) / 200);
      const off = (i) => ((h * (13 + i * 7)) % 150) / 20000;
      const p1 = { lat: baseLat + off(1), lng: baseLng + off(2) };
      const p2 = { lat: baseLat + off(3), lng: baseLng + off(4) };
      const p3 = { lat: baseLat + off(5), lng: baseLng + off(6) };
      let area = parseFloat(computeTriangleAreaAcres(p1, p2, p3));
      if (area < 10 || area > 1000) area = 80 + (h % 420);
      return { ...f, acres: area };
    });
  }, [farms]);

  const totalArea = farmAreaAcres.reduce((s, f) => s + f.acres, 0);
  const activeArea = farmAreaAcres.filter((f) => f.status === 'Active').reduce((s, f) => s + f.acres, 0);
  const idleArea = farmAreaAcres.filter((f) => f.status !== 'Active').reduce((s, f) => s + f.acres, 0);

  const cropFrequency = useMemo(() => {
    const counts = {};
    farms.forEach((f) => {
      (f.cropTypes || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean).forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count,
    })).sort((a, b) => b.count - a.count);
  }, [farms]);

  const maxCropCount = cropFrequency.length > 0 ? cropFrequency[0].count : 1;
  const mostGrown = cropFrequency.length > 0 ? cropFrequency[0] : null;

  const mostDiverseFarm = useMemo(() => {
    let best = null, max = 0;
    farms.forEach((f) => {
      const types = (f.cropTypes || '').split(',').map((s) => s.trim()).filter(Boolean);
      if (types.length > max) { max = types.length; best = f; }
    });
    return best ? { name: best.name, count: max } : null;
  }, [farms]);

  const recentEntries = useMemo(() => entries.slice(0, 6), [entries]);

  const activeUsersCount = users.filter((u) => u.status === 'Active').length;
  const inactiveUsersCount = users.filter((u) => u.status === 'Inactive').length;

  const farmersByRobots = useMemo(() => {
    return users.map((u) => ({
      ...u,
      robotCount: robots.filter((r) => r.owner === u.name).length,
    })).sort((a, b) => b.robotCount - a.robotCount);
  }, [users, robots]);

  const latestUser = useMemo(() => [...users].sort((a, b) => new Date(b.joined) - new Date(a.joined))[0], [users]);

  const robotsWithData = useMemo(() => robots.filter((r) => mockSensorReadings[r.id]), [robots]);

  const [selectedRobotId, setSelectedRobotId] = useState(() => {
    const first = robots.find((r) => mockSensorReadings[r.id]);
    return first ? first.id : null;
  });

  const selectedRobot = useMemo(() => robots.find((r) => r.id === selectedRobotId), [robots, selectedRobotId]);
  const robotSensorData = selectedRobot && mockSensorReadings[selectedRobot.id];

  const soilLabel = (s) => { if (s < 20) return 'Too Dry'; if (s <= 60) return 'Optimal'; return 'Too Wet'; };
  const soilColor = (s) => { if (s < 20) return '#EF4444'; if (s <= 60) return '#16a34a'; return '#3B82F6'; };
  const ultrasonicInfo = (u) => { if (u < 30) return { icon: '⚠', color: '#dc2626', label: 'Obstacle Detected' }; if (u <= 200) return { icon: '✓', color: '#16a34a', label: 'Clear Path' }; return { icon: '—', color: '#9CA3AF', label: 'No Reading' }; };
  const statusColor = (s) => { if (s === 'Active') return '#4caf50'; if (s === 'Assigned') return '#3b82f6'; if (s === 'Maintenance') return '#F59E0B'; return '#EF4444'; };

  return (
    <>
      <div className="mb-6">
        <div className="text-2xl font-bold text-primary">Analytics</div>
        <div className="text-sm text-text-secondary mt-1">Command center — deeper insights not shown on the Dashboard</div>
      </div>

      {!hasAlerts ? (
        <GlowCard onClick={() => navigate('/admin/robots')} className="glass-card rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3">
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(76,175,80,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle size={18} color="#2e7d2e" />
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: '#2e7d2e' }}>All Systems Normal</div>
              <div className="text-xs text-text-secondary mt-0.5">No alerts at this time</div>
            </div>
          </div>
        </GlowCard>
      ) : (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { count: offlineRobots.length, label: 'Robots Offline', nav: '/admin/robots', iconBg: offlineRobots.length > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(156,163,175,0.12)', iconColor: offlineRobots.length > 0 ? '#DC2626' : '#9CA3AF', numColor: offlineRobots.length > 0 ? '#DC2626' : '#111827' },
            { count: criticalBattRobots.length, label: 'Critical Battery', nav: '/admin/robots', iconBg: criticalBattRobots.length > 0 ? 'rgba(245,158,11,0.12)' : 'rgba(156,163,175,0.12)', iconColor: criticalBattRobots.length > 0 ? '#D97706' : '#9CA3AF', numColor: criticalBattRobots.length > 0 ? '#D97706' : '#111827' },
            { count: overdueTasks.length, label: 'Overdue Tasks', nav: '/admin/tasks', iconBg: overdueTasks.length > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(156,163,175,0.12)', iconColor: overdueTasks.length > 0 ? '#DC2626' : '#9CA3AF', numColor: overdueTasks.length > 0 ? '#DC2626' : '#111827' },
          ].map((b) => (
            <GlowCard key={b.label} onClick={() => navigate(b.nav)} className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-text-secondary mb-1">{b.label}</div>
                  <div className="text-3xl font-extrabold" style={{ color: b.numColor }}>{b.count}</div>
                </div>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: b.iconBg, flexShrink: 0 }}>
                  <AlertTriangle size={18} color={b.iconColor} />
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      )}

      <div className="mb-6">
        <GlowCard className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-primary">Robot Fleet — Battery Status</span>
            <span className="text-[10px] text-text-secondary">Click any robot to view details →</span>
          </div>
          <div className="text-[10px] text-text-secondary mb-4">Battery health across the fleet</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }} className="battery-grid">
            {batterySorted.map((r) => {
              const isOffline = r.status === 'Offline';
              const barColor = isOffline ? '#D1D5DB' : r.battery >= 60 ? '#22C55E' : r.battery >= 30 ? '#F59E0B' : '#EF4444';
              const dotColor = isOffline ? '#EF4444' : r.status === 'Active' ? '#4caf50' : '#F59E0B';
              const statusTextColor = isOffline ? '#991B1B' : r.status === 'Active' ? '#065F46' : '#92400E';
              return (
                <GlowCard key={r.id} onClick={() => navigate('/admin/robots')} className="glass-card rounded-2xl p-4" style={{ textAlign: 'center' }}>
                  <div className="text-sm font-semibold text-primary truncate">{r.name}</div>
                  <div className="text-[10px] text-text-secondary mt-0.5 truncate">{r.farm}</div>
                  {isOffline ? (
                    <div className="text-[11px] font-semibold mt-3" style={{ color: '#991B1B' }}>Offline</div>
                  ) : (
                    <>
                      <div className="text-2xl font-extrabold mt-2" style={{ color: barColor }}>{r.battery}%</div>
                      <div className="flex items-center justify-center gap-1.5 mt-2">
                        <div style={{ width: '48px', height: '6px', borderRadius: '999px', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                          <div className="h-full rounded-full" style={{ width: `${r.battery}%`, background: barColor }} />
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-center gap-1.5 mt-2" style={{ fontSize: '11px', fontWeight: 600, color: statusTextColor }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                    <span>{r.status}</span>
                  </div>
                </GlowCard>
              );
            })}
          </div>
          <div onClick={() => navigate('/admin/robots')} style={{
            marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.05)',
            fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
            color: robotsNeedAttention.length > 0 ? '#D97706' : '#2e7d2e',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {robotsNeedAttention.length} of {robots.length} robots need attention →
          </div>
        </GlowCard>
      </div>

      <div className="mb-6">
        <GlowCard className="glass-card rounded-2xl p-5">
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a' }}>Task Operations</div>
          <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px', marginBottom: '20px' }}>Status and priority breakdown across all tasks</div>

          <div style={{ display: 'flex', gap: '24px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(76,175,80,0.08)' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a' }}>{tasks.length}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Total Tasks</div>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a' }}>{tasks.length > 0 ? ((completedTasks.length / tasks.length) * 100).toFixed(0) : 0}%</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Completion Rate</div>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: overdueTasks.length > 0 ? '#ef4444' : '#1a1a1a' }}>{overdueTasks.length}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Overdue</div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div style={{ width: '100%', maxWidth: '480px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '12px', textAlign: 'center' }}>By Status</div>
              <div className="relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} dataKey="value" strokeWidth={0}>
                      {statusChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-2xl font-extrabold leading-none mb-0.5" style={{ color: '#1a1a1a' }}>{tasks.length}</div>
                    <div className="text-[10px]" style={{ color: '#6b7280' }}>Total Tasks</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
                {statusChartData.map((entry) => (
                  <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#6b7280' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
                    <span>{entry.name} {entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div onClick={() => navigate('/admin/tasks')} style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)', textAlign: 'right', cursor: 'pointer', color: '#2e7d2e', fontSize: '13px', fontWeight: 500 }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            View all tasks →
          </div>
        </GlowCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'stretch' }} className="mb-6">
        <GlowCard className="glass-card rounded-2xl p-5" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Farmer Overview</span>
          </div>
          <div style={{ fontSize: '10px', color: '#5A7A5A', marginBottom: '14px' }}>Your customer base at a glance</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '16px' }}>
            {[
              { label: 'Total Farmers', value: users.length, color: '#111827' },
              { label: 'Active', value: activeUsersCount, color: '#2e7d2e' },
              { label: 'Inactive', value: inactiveUsersCount, color: '#DC2626' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center', padding: '10px 4px', borderRadius: '8px', background: 'rgba(76,175,80,0.04)', border: '1px solid rgba(76,175,80,0.08)' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '9px', color: '#5A7A5A', marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Top Farmers by Robots Owned</div>
            {farmersByRobots.map((f, i) => (
              <div key={f.name} onClick={() => navigate('/admin/users')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', fontSize: '12px', cursor: 'pointer', transition: 'background 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f8f1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ width: '18px', fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textAlign: 'right', flexShrink: 0 }}>#{i + 1}</span>
                <span style={{ flex: 1, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: f.status === 'Active' ? '#4caf50' : '#EF4444', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: '11px', fontWeight: 500, color: f.status === 'Active' ? '#2e7d2e' : '#DC2626' }}>{f.robotCount}</span>
                </span>
              </div>
            ))}
          </div>

          {latestUser && (
            <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '10px', color: '#5A7A5A', marginBottom: '4px' }}>Recently Joined</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4caf50', display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>{latestUser.name}</span>
                <span style={{ fontSize: '10px', color: '#9CA3AF', marginLeft: 'auto' }}>{latestUser.joined}</span>
              </div>
            </div>
          )}

          <div onClick={() => navigate('/admin/users')} style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.06)', textAlign: 'right', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#2e7d2e', transition: 'opacity 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            View all farmers →
          </div>
        </GlowCard>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="team-sensor-grid">
        {isMasterAdmin ? (
          <GlowCard className="glass-card rounded-2xl p-5">
            <div style={{ marginBottom: '4px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>System Activity</span>
            </div>
            <div style={{ fontSize: '10px', color: '#5A7A5A', marginBottom: '16px' }}>Recent actions across the platform</div>

            {recentEntries.length > 0 ? (
              <div style={{ position: 'relative', paddingLeft: '24px' }}>
                <div style={{
                  position: 'absolute', left: '9px', top: '8px', bottom: '8px',
                  width: '2px', background: 'rgba(0,0,0,0.06)', borderRadius: '1px',
                }} />
                {recentEntries.map((entry) => {
                  const dotColor = actionDot(entry.action);
                  return (
                    <div key={entry.id} onClick={() => navigate('/admin/employees')} style={{
                      position: 'relative', paddingBottom: '16px', cursor: 'pointer',
                      paddingLeft: '0', transition: 'all 0.15s ease',
                      borderRadius: '6px',
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(76,175,80,0.04)'; e.currentTarget.style.paddingLeft = '8px'; e.currentTarget.style.paddingRight = '8px'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.paddingLeft = '0'; e.currentTarget.style.paddingRight = '0'; }}
                    >
                      <div style={{
                        position: 'absolute', left: '-17px', top: '4px',
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: dotColor,
                        border: '2px solid #fff',
                        boxShadow: '0 0 0 2px rgba(0,0,0,0.04)',
                        zIndex: 1,
                      }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>{entry.userName}</span>
                          <div style={{ fontSize: '10px', color: '#5A7A5A', marginTop: '1px' }}>
                            {entry.action} <span style={{ fontWeight: 600, color: '#111827' }}>{entry.target}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '9px', color: '#9CA3AF', flexShrink: 0, marginLeft: '8px' }}>{relativeTime(entry.timestamp)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center py-12 text-text-placeholder">
                <i className="ph ph-clock-counter-clockwise text-4xl mb-3 opacity-50" />
                <p className="text-sm font-medium">No activity entries found</p>
                <p className="text-xs mt-1">Actions will appear here as they occur</p>
              </div>
            )}

            <div onClick={() => navigate('/admin/employees')} style={{
              marginTop: '8px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.05)',
              fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
              color: '#2e7d2e',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              View full activity log →
            </div>
          </GlowCard>
        ) : (
          <GlowCard className="glass-card rounded-2xl p-5">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>Robot Sensor Network</span>
              <RobotSelect robots={robotsWithData} selectedId={selectedRobotId} onChange={setSelectedRobotId} />
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px', marginBottom: '14px' }}>Live readings from connected robot fleet</div>

            {selectedRobot && robotSensorData && (
              <div style={{ background: '#f8fdf8', border: '1px solid rgba(76,175,80,0.1)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor(selectedRobot.status), flexShrink: 0 }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>{selectedRobot.name}</span>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>• {selectedRobot.id}</span>
                {selectedRobot.farm && <span style={{ fontSize: '13px', color: '#6b7280' }}>• {selectedRobot.farm}</span>}
                <div onClick={() => navigate('/admin/sensors')} style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 600, color: '#2e7d2e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View full details →
                </div>
              </div>
            )}

            {selectedRobot && robotSensorData && (
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fdf8', border: '1px solid rgba(76,175,80,0.1)', borderRadius: '10px', padding: '8px 14px', marginBottom: '16px' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>{selectedRobot.battery}%</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, marginTop: '2px' }}>Battery</div>
                </div>
                <div style={{ width: '1px', height: '32px', background: 'rgba(76,175,80,0.1)', flexShrink: 0 }} />
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>{robotSensorData.dht11.temperature}°C</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, marginTop: '2px' }}>Temperature</div>
                </div>
                <div style={{ width: '1px', height: '32px', background: 'rgba(76,175,80,0.1)', flexShrink: 0 }} />
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>{robotSensorData.soilMoisture}%</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, marginTop: '2px' }}>Soil Moisture</div>
                </div>
              </div>
            )}

            {selectedRobot && robotSensorData ? (
              <>
                <div onClick={() => navigate('/admin/sensors')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', cursor: 'pointer', transition: 'background 0.15s ease, border-radius 0.15s ease, padding 0.15s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fdf8'; e.currentTarget.style.borderRadius = '10px'; e.currentTarget.style.padding = '10px 8px'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderRadius = '0'; e.currentTarget.style.padding = '10px 0'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '0'; }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxSizing: 'border-box' }}>
                    <Thermometer size={16} color="#16a34a" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DHT11</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Thermometer size={13} color="#16a34a" />{robotSensorData.dht11.temperature}°C
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Droplets size={13} color="#16a34a" />{robotSensorData.dht11.humidity}%
                      </span>
                    </div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(46,125,50,0.1)', color: '#16a34a', border: '1px solid rgba(46,125,50,0.2)', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 600, flexShrink: 0 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Live
                  </span>
                  <span className="row-arrow" style={{ color: '#6b7280', fontSize: '12px', color: '#9ca3af', opacity: 0, transition: 'opacity 0.15s ease', flexShrink: 0 }}>→</span>
                </div>
                <div style={{ borderBottom: '1px solid rgba(76,175,80,0.06)' }} />

                <div onClick={() => navigate('/admin/sensors')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', cursor: 'pointer', transition: 'background 0.15s ease, border-radius 0.15s ease, padding 0.15s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fdf8'; e.currentTarget.style.borderRadius = '10px'; e.currentTarget.style.padding = '10px 8px'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderRadius = '0'; e.currentTarget.style.padding = '10px 0'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '0'; }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxSizing: 'border-box' }}>
                    <Droplets size={16} color="#16a34a" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SOIL MOISTURE</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: soilColor(robotSensorData.soilMoisture), marginTop: '2px' }}>{robotSensorData.soilMoisture}%</div>
                    <div style={{ width: '140px', height: '6px', borderRadius: '999px', background: 'rgba(26,46,26,0.08)', overflow: 'hidden', marginTop: '4px' }}>
                      <div style={{ width: `${robotSensorData.soilMoisture}%`, height: '100%', borderRadius: '999px', background: '#16a34a', transition: 'width 0.3s ease' }} />
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: soilColor(robotSensorData.soilMoisture), marginTop: '3px' }}>{soilLabel(robotSensorData.soilMoisture)}</div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(46,125,50,0.1)', color: '#16a34a', border: '1px solid rgba(46,125,50,0.2)', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 600, flexShrink: 0 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Live
                  </span>
                  <span className="row-arrow" style={{ color: '#6b7280', fontSize: '12px', color: '#9ca3af', opacity: 0, transition: 'opacity 0.15s ease', flexShrink: 0 }}>→</span>
                </div>
                <div style={{ borderBottom: '1px solid rgba(76,175,80,0.06)' }} />

                <div onClick={() => navigate('/admin/sensors')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', cursor: 'pointer', transition: 'background 0.15s ease, border-radius 0.15s ease, padding 0.15s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fdf8'; e.currentTarget.style.borderRadius = '10px'; e.currentTarget.style.padding = '10px 8px'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderRadius = '0'; e.currentTarget.style.padding = '10px 0'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '0'; }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxSizing: 'border-box' }}>
                    <Radar size={16} color="#16a34a" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ULTRASONIC</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: ultrasonicInfo(robotSensorData.ultrasonic).color, marginTop: '2px' }}>
                      {ultrasonicInfo(robotSensorData.ultrasonic).icon} {robotSensorData.ultrasonic}cm
                    </div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(46,125,50,0.1)', color: '#16a34a', border: '1px solid rgba(46,125,50,0.2)', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 600, flexShrink: 0 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Live
                  </span>
                  <span className="row-arrow" style={{ color: '#6b7280', fontSize: '12px', color: '#9ca3af', opacity: 0, transition: 'opacity 0.15s ease', flexShrink: 0 }}>→</span>
                </div>
                <div style={{ borderBottom: '1px solid rgba(76,175,80,0.06)' }} />

                <div onClick={() => navigate('/admin/sensors')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', cursor: 'pointer', transition: 'background 0.15s ease, border-radius 0.15s ease, padding 0.15s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fdf8'; e.currentTarget.style.borderRadius = '10px'; e.currentTarget.style.padding = '10px 8px'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderRadius = '0'; e.currentTarget.style.padding = '10px 0'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '0'; }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxSizing: 'border-box' }}>
                    <MapPin size={16} color="#16a34a" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LOCATION</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#16a34a' }}>({robotSensorData.wifiLocation.lat.toFixed(2)}, {robotSensorData.wifiLocation.lng.toFixed(2)})</span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a' }}>● Active</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '1px' }}>{robotSensorData.wifiLocation.label}</div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(46,125,50,0.1)', color: '#16a34a', border: '1px solid rgba(46,125,50,0.2)', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 600, flexShrink: 0 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Live
                  </span>
                  <span className="row-arrow" style={{ color: '#6b7280', fontSize: '12px', color: '#9ca3af', opacity: 0, transition: 'opacity 0.15s ease', flexShrink: 0 }}>→</span>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', fontSize: '13px', color: '#6b7280' }}>No sensor data available</div>
            )}

            <div style={{ color: 'rgba(90,122,90,0.6)', fontSize: '12px', fontStyle: 'italic', marginTop: '10px', textAlign: 'center' }}>
              Readings update automatically when hardware pushes data to the API
            </div>
            {/* TODO: Replace mock data with real WebSocket/API data once hardware is connected */}
          </GlowCard>
        )}

        <GlowCard className="glass-card rounded-2xl p-5">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>Robot Sensor Network</span>
              <RobotSelect robots={robotsWithData} selectedId={selectedRobotId} onChange={setSelectedRobotId} />
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px', marginBottom: '14px' }}>Live readings from connected robot fleet</div>

            {selectedRobot && robotSensorData && (
              <div style={{ background: '#f8fdf8', border: '1px solid rgba(76,175,80,0.1)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor(selectedRobot.status), flexShrink: 0 }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>{selectedRobot.name}</span>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>• {selectedRobot.id}</span>
                {selectedRobot.farm && <span style={{ fontSize: '13px', color: '#6b7280' }}>• {selectedRobot.farm}</span>}
                <div onClick={() => navigate('/admin/sensors')} style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 600, color: '#2e7d2e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View full details →
                </div>
              </div>
            )}

            {selectedRobot && robotSensorData && (
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fdf8', border: '1px solid rgba(76,175,80,0.1)', borderRadius: '10px', padding: '8px 14px', marginBottom: '16px' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>{selectedRobot.battery}%</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, marginTop: '2px' }}>Battery</div>
                </div>
                <div style={{ width: '1px', height: '32px', background: 'rgba(76,175,80,0.1)', flexShrink: 0 }} />
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>{robotSensorData.dht11.temperature}°C</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, marginTop: '2px' }}>Temperature</div>
                </div>
                <div style={{ width: '1px', height: '32px', background: 'rgba(76,175,80,0.1)', flexShrink: 0 }} />
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>{robotSensorData.soilMoisture}%</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, marginTop: '2px' }}>Soil Moisture</div>
                </div>
              </div>
            )}

            {selectedRobot && robotSensorData ? (
              <>
                <div onClick={() => navigate('/admin/sensors')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', cursor: 'pointer', transition: 'background 0.15s ease, border-radius 0.15s ease, padding 0.15s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fdf8'; e.currentTarget.style.borderRadius = '10px'; e.currentTarget.style.padding = '10px 8px'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderRadius = '0'; e.currentTarget.style.padding = '10px 0'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '0'; }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxSizing: 'border-box' }}>
                    <Thermometer size={16} color="#16a34a" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DHT11</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Thermometer size={13} color="#16a34a" />{robotSensorData.dht11.temperature}°C
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Droplets size={13} color="#16a34a" />{robotSensorData.dht11.humidity}%
                      </span>
                    </div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(46,125,50,0.1)', color: '#16a34a', border: '1px solid rgba(46,125,50,0.2)', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 600, flexShrink: 0 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Live
                  </span>
                  <span className="row-arrow" style={{ color: '#6b7280', fontSize: '12px', color: '#9ca3af', opacity: 0, transition: 'opacity 0.15s ease', flexShrink: 0 }}>→</span>
                </div>
                <div style={{ borderBottom: '1px solid rgba(76,175,80,0.06)' }} />

                <div onClick={() => navigate('/admin/sensors')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', cursor: 'pointer', transition: 'background 0.15s ease, border-radius 0.15s ease, padding 0.15s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fdf8'; e.currentTarget.style.borderRadius = '10px'; e.currentTarget.style.padding = '10px 8px'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderRadius = '0'; e.currentTarget.style.padding = '10px 0'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '0'; }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxSizing: 'border-box' }}>
                    <Droplets size={16} color="#16a34a" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SOIL MOISTURE</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: soilColor(robotSensorData.soilMoisture), marginTop: '2px' }}>{robotSensorData.soilMoisture}%</div>
                    <div style={{ width: '140px', height: '6px', borderRadius: '999px', background: 'rgba(26,46,26,0.08)', overflow: 'hidden', marginTop: '4px' }}>
                      <div style={{ width: `${robotSensorData.soilMoisture}%`, height: '100%', borderRadius: '999px', background: '#16a34a', transition: 'width 0.3s ease' }} />
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: soilColor(robotSensorData.soilMoisture), marginTop: '3px' }}>{soilLabel(robotSensorData.soilMoisture)}</div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(46,125,50,0.1)', color: '#16a34a', border: '1px solid rgba(46,125,50,0.2)', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 600, flexShrink: 0 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Live
                  </span>
                  <span className="row-arrow" style={{ color: '#6b7280', fontSize: '12px', color: '#9ca3af', opacity: 0, transition: 'opacity 0.15s ease', flexShrink: 0 }}>→</span>
                </div>
                <div style={{ borderBottom: '1px solid rgba(76,175,80,0.06)' }} />

                <div onClick={() => navigate('/admin/sensors')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', cursor: 'pointer', transition: 'background 0.15s ease, border-radius 0.15s ease, padding 0.15s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fdf8'; e.currentTarget.style.borderRadius = '10px'; e.currentTarget.style.padding = '10px 8px'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderRadius = '0'; e.currentTarget.style.padding = '10px 0'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '0'; }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxSizing: 'border-box' }}>
                    <Radar size={16} color="#16a34a" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ULTRASONIC</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: ultrasonicInfo(robotSensorData.ultrasonic).color, marginTop: '2px' }}>
                      {ultrasonicInfo(robotSensorData.ultrasonic).icon} {robotSensorData.ultrasonic}cm
                    </div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(46,125,50,0.1)', color: '#16a34a', border: '1px solid rgba(46,125,50,0.2)', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 600, flexShrink: 0 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Live
                  </span>
                  <span className="row-arrow" style={{ color: '#6b7280', fontSize: '12px', color: '#9ca3af', opacity: 0, transition: 'opacity 0.15s ease', flexShrink: 0 }}>→</span>
                </div>
                <div style={{ borderBottom: '1px solid rgba(76,175,80,0.06)' }} />

                <div onClick={() => navigate('/admin/sensors')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', cursor: 'pointer', transition: 'background 0.15s ease, border-radius 0.15s ease, padding 0.15s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fdf8'; e.currentTarget.style.borderRadius = '10px'; e.currentTarget.style.padding = '10px 8px'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderRadius = '0'; e.currentTarget.style.padding = '10px 0'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '0'; }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxSizing: 'border-box' }}>
                    <MapPin size={16} color="#16a34a" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LOCATION</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#16a34a' }}>({robotSensorData.wifiLocation.lat.toFixed(2)}, {robotSensorData.wifiLocation.lng.toFixed(2)})</span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a' }}>● Active</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '1px' }}>{robotSensorData.wifiLocation.label}</div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(46,125,50,0.1)', color: '#16a34a', border: '1px solid rgba(46,125,50,0.2)', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 600, flexShrink: 0 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Live
                  </span>
                  <span className="row-arrow" style={{ color: '#6b7280', fontSize: '12px', color: '#9ca3af', opacity: 0, transition: 'opacity 0.15s ease', flexShrink: 0 }}>→</span>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', fontSize: '13px', color: '#6b7280' }}>No sensor data available</div>
            )}

            <div style={{ color: 'rgba(90,122,90,0.6)', fontSize: '12px', fontStyle: 'italic', marginTop: '10px', textAlign: 'center' }}>
              Readings update automatically when hardware pushes data to the API
            </div>
            {/* TODO: Replace mock data with real WebSocket/API data once hardware is connected */}
          </GlowCard>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .battery-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .farm-crop-grid { grid-template-columns: 1fr !important; }
          .team-sensor-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .battery-grid { grid-template-columns: 1fr !important; }
        }

      `}</style>
    </>
  );
}
