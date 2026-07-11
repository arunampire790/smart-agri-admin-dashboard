import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUsers } from '../../context/UserContext';
import { useFarms } from '../../context/FarmContext';
import { useRobots } from '../../context/RobotContext';
import { useTasks } from '../../context/TaskContext';
import { useEmployees } from '../../context/EmployeeContext';
import { useActivityLog } from '../../context/ActivityLogContext';
import { computeTriangleAreaAcres } from '../../utils/farmArea';
import { AlertTriangle, Thermometer, Droplets, Radar, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
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

  const highCount = tasks.filter((t) => t.priority === 'High').length;
  const medCount = tasks.filter((t) => t.priority === 'Medium').length;
  const lowCount = tasks.filter((t) => t.priority === 'Low').length;

  const inProgressTypes = useMemo(() => {
    const counts = {};
    inProgressTasks.forEach((t) => { counts[t.type] = (counts[t.type] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [inProgressTasks]);

  const completedThisWeek = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(d.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return completedTasks.filter((t) => {
      const due = new Date(t.dueDate);
      const completed = new Date(due.getTime() + 86400000 * 2);
      return completed >= weekStart;
    }).length;
  }, [completedTasks]);

  const overdueTaskRows = useMemo(() => {
    return overdueTasks.map((t) => {
      const daysLate = Math.floor((now - new Date(t.dueDate).getTime()) / 86400000);
      return { ...t, daysLate };
    }).sort((a, b) => b.daysLate - a.daysLate).slice(0, 5);
  }, [overdueTasks, now]);

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

  const taskTypeData = ['Irrigation', 'Fertilizer', 'Inspection', 'Maintenance'].map((type) => ({
    type,
    count: tasks.filter((t) => t.type === type).length,
  }));
  const maxTaskTypeCount = Math.max(...taskTypeData.map((t) => t.count), 1);

  const taskPriorityData = [
    { priority: 'High', count: tasks.filter((t) => t.priority === 'High').length },
    { priority: 'Medium', count: tasks.filter((t) => t.priority === 'Medium').length },
    { priority: 'Low', count: tasks.filter((t) => t.priority === 'Low').length },
  ];
  const maxTaskPriorityCount = Math.max(...taskPriorityData.map((p) => p.count), 1);

  const overdueHighPriority = useMemo(() => {
    return tasks.filter((t) => t.priority === 'High' && t.status !== 'Completed' && new Date(t.dueDate) < now);
  }, [tasks, now]);

  const sensorData = useMemo(() => {
    const first = robots.find((r) => r.status !== 'Offline' && mockSensorReadings[r.id]);
    return first ? mockSensorReadings[first.id] : null;
  }, [robots]);

  const fleetSensorStats = useMemo(() => {
    const withData = robots.filter((r) => mockSensorReadings[r.id]);
    const online = withData.filter((r) => r.status !== 'Offline');
    const temps = online.map((r) => mockSensorReadings[r.id].dht11.temperature).filter(Boolean);
    const avgTemp = temps.length > 0 ? (temps.reduce((s, v) => s + v, 0) / temps.length) : 0;
    const moistures = online.map((r) => mockSensorReadings[r.id].soilMoisture).filter((v) => v !== undefined);
    const avgMoisture = moistures.length > 0 ? (moistures.reduce((s, v) => s + v, 0) / moistures.length) : 0;
    return { online: `${online.length}/${withData.length}`, avgTemp: avgTemp.toFixed(1), avgMoisture: avgMoisture.toFixed(1) };
  }, [robots]);

  const soilLabel = (s) => { if (s < 20) return 'Too Dry'; if (s <= 60) return 'Optimal'; return 'Too Wet'; };
  const soilColor = (s) => { if (s < 20) return '#EF4444'; if (s <= 60) return '#16a34a'; return '#3B82F6'; };
  const ultrasonicInfo = (u) => { if (u < 30) return { icon: '⚠', color: '#dc2626', label: 'Obstacle Detected' }; if (u <= 200) return { icon: '✓', color: '#16a34a', label: 'Clear Path' }; return { icon: '—', color: '#9CA3AF', label: 'No Reading' }; };

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
          <div className="text-sm font-semibold text-primary mb-1">Task Operations Pipeline</div>
          <div className="text-[10px] text-text-secondary mb-5">Live task flow across all farms</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: '10px', alignItems: 'stretch' }} className="pipeline-grid">
            {[
              { key: 'Pending', count: pendingTasks.length, labelColor: '#D97706', tabColor: '#D97706', bg: 'rgba(255,255,255,1)', border: '1px solid rgba(245,158,11,0.15)',
                details: (
                  <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                    <span className="pill inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-danger-bg text-danger-text">High {highCount}</span>
                    <span className="pill inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-warning-bg text-warning-text">Medium {medCount}</span>
                    <span className="pill inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-brand-light text-brand-dark">Low {lowCount}</span>
                  </div>
                ) },
              { key: 'In Progress', count: inProgressTasks.length, labelColor: '#16A34A', tabColor: '#2e7d2e', bg: 'rgba(255,255,255,1)', border: '1px solid rgba(76,175,80,0.15)',
                details: (
                  <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                    {inProgressTypes.length > 0 ? inProgressTypes.map(([type, ct]) => (
                      <span key={type} className="pill inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold" style={{ background: 'rgba(76,175,80,0.1)', color: '#2e7d2e' }}>{type} {ct}</span>
                    )) : <span className="text-[10px] text-text-secondary">No active tasks</span>}
                  </div>
                ) },
              { key: 'Completed', count: completedTasks.length, labelColor: '#2e7d2e', tabColor: '#2e7d2e', bg: 'rgba(255,255,255,1)', border: '1px solid rgba(76,175,80,0.15)',
                details: (
                  <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                    <span className="pill inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-brand-light text-brand-dark">This week {completedThisWeek}</span>
                    <span className="pill inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-brand-light text-brand-dark">On time {completedTasks.length}</span>
                    <span className="pill inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-danger-bg text-danger-text">Late 0</span>
                  </div>
                ) },
            ].map((col, i) => (
              <>
                {i > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2px' }}>
                    <div style={{ fontSize: '16px', color: '#D1D5DB', fontWeight: 300 }}>→</div>
                  </div>
                )}
                <div key={col.key} style={{ padding: '16px', borderRadius: '12px', textAlign: 'center', background: col.bg, border: col.border }}>
                  <div className="text-sm font-medium pb-1.5 mb-2" style={{ color: col.tabColor, borderBottom: '2px solid', borderColor: col.tabColor, display: 'inline-block' }}>{col.key}</div>
                  <div className="text-3xl font-extrabold text-primary mt-1">{col.count}</div>
                  <div className="text-[9px] text-text-secondary mb-1">tasks</div>
                  {col.details}
                </div>
              </>
            ))}
          </div>

          {overdueTasks.length > 0 ? (
            <div className="mt-3" style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.15)' }}>
              <div className="text-[11px] font-semibold mb-2 flex items-center gap-1.5" style={{ color: '#b91c1c' }}>
                <AlertTriangle size={14} color="#b91c1c" />
                {overdueTasks.length} {overdueTasks.length === 1 ? 'task is' : 'tasks are'} overdue
              </div>
              {overdueTaskRows.map((t) => (
                <div key={t.id} onClick={() => navigate('/admin/tasks')} className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors" style={{ fontSize: '11px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,59,48,0.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#b91c1c', flexShrink: 0 }} />
                  <span className="font-semibold text-primary flex-1 truncate">{t.title}</span>
                  <span className="text-text-secondary text-[10px]">{t.assignedTo}</span>
                  <span className="text-xs font-semibold shrink-0" style={{ color: '#b91c1c' }}>{t.daysLate}d late</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold" style={{ color: '#2e7d2e', padding: '10px 14px', borderRadius: '8px', background: 'rgba(76,175,80,0.08)' }}>
              <CheckCircle size={14} color="#2e7d2e" />
              No overdue tasks — all on track
            </div>
          )}

          <div onClick={() => navigate('/admin/tasks')} style={{
            marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.05)',
            fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
            color: '#2e7d2e', textAlign: 'center',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
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

        <GlowCard className="glass-card rounded-2xl p-5" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Task Intelligence</span>
          </div>
          <div style={{ fontSize: '10px', color: '#5A7A5A', marginBottom: '14px' }}>What robots are being used for</div>

          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>By Type</div>
            {taskTypeData.map((t) => {
              const typeColorMap = { Irrigation: '#3b82f6', Fertilizer: '#a16207', Inspection: '#8b5cf6', Maintenance: '#f97316' };
              const typeBgMap = { Irrigation: 'rgba(59,130,246,0.1)', Fertilizer: 'rgba(161,98,7,0.1)', Inspection: 'rgba(139,92,246,0.1)', Maintenance: 'rgba(249,115,22,0.1)' };
              const pct = maxTaskTypeCount > 0 ? (t.count / maxTaskTypeCount) * 100 : 0;
              return (
                <div key={t.type} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', fontSize: '12px', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f8f1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ padding: '2px 7px', borderRadius: '999px', background: typeBgMap[t.type], color: typeColorMap[t.type], fontSize: '9px', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>{t.type}</span>
                  <div style={{ flex: 1, height: '5px', borderRadius: '999px', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: '999px', background: typeColorMap[t.type], transition: 'width 0.3s ease' }} />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#111827', flexShrink: 0, width: '20px', textAlign: 'right' }}>{t.count}</span>
                </div>
              );
            })}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>By Priority</div>
            {taskPriorityData.map((p) => {
              const pct = maxTaskPriorityCount > 0 ? (p.count / maxTaskPriorityCount) * 100 : 0;
              const pBg = p.priority === 'High' ? '#FEE2E2' : p.priority === 'Medium' ? '#FEF3C7' : '#E8F5E9';
              const pColor = p.priority === 'High' ? '#DC2626' : p.priority === 'Medium' ? '#D97706' : '#2e7d2e';
              const barColor = p.priority === 'High' ? '#EF4444' : p.priority === 'Medium' ? '#F59E0B' : '#4caf50';
              return (
                <div key={p.priority} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', fontSize: '12px', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f8f1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ padding: '2px 7px', borderRadius: '999px', background: pBg, color: pColor, fontSize: '9px', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>{p.priority}</span>
                  <div style={{ flex: 1, height: '5px', borderRadius: '999px', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: '999px', background: barColor, transition: 'width 0.3s ease' }} />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#111827', flexShrink: 0, width: '20px', textAlign: 'right' }}>{p.count}</span>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '10px', color: '#5A7A5A', marginBottom: '4px' }}>Needs Attention</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#EF4444', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>{overdueHighPriority.length} high-priority overdue</span>
            </div>
          </div>

          <div onClick={() => navigate('/admin/tasks')} style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.06)', textAlign: 'right', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#2e7d2e', transition: 'opacity 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            View all tasks →
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
            <div style={{ marginBottom: '6px' }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a' }}>Robot Sensor Network</span>
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '18px' }}>Live readings from connected robot fleet</div>

            {sensorData && (
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fdf8', border: '1px solid rgba(76,175,80,0.1)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>{fleetSensorStats.online}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, marginTop: '2px' }}>Sensors Online</div>
                </div>
                <div style={{ width: '1px', height: '32px', background: 'rgba(76,175,80,0.1)', flexShrink: 0 }} />
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>{fleetSensorStats.avgTemp}°C</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, marginTop: '2px' }}>Avg Temperature</div>
                </div>
                <div style={{ width: '1px', height: '32px', background: 'rgba(76,175,80,0.1)', flexShrink: 0 }} />
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>{fleetSensorStats.avgMoisture}%</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, marginTop: '2px' }}>Avg Soil Moisture</div>
                </div>
              </div>
            )}

            {sensorData ? (
              <>
                <div onClick={() => navigate('/admin/sensors')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', cursor: 'pointer', transition: 'background 0.15s ease, border-radius 0.15s ease, padding 0.15s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fdf8'; e.currentTarget.style.borderRadius = '10px'; e.currentTarget.style.padding = '14px 8px'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderRadius = '0'; e.currentTarget.style.padding = '14px 0'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '0'; }}
                >
                  <div style={{ background: 'rgba(46,125,50,0.08)', borderRadius: '8px', padding: '8px', display: 'flex', flexShrink: 0 }}>
                    <Thermometer size={16} color="#16a34a" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DHT11</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Thermometer size={13} color="#16a34a" />{sensorData.dht11.temperature}°C
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Droplets size={13} color="#16a34a" />{sensorData.dht11.humidity}%
                      </span>
                    </div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(46,125,50,0.1)', color: '#16a34a', border: '1px solid rgba(46,125,50,0.2)', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Live
                  </span>
                  <span className="row-arrow" style={{ color: '#6b7280', fontSize: '13px', opacity: 0, transition: 'opacity 0.15s ease', flexShrink: 0 }}>→</span>
                </div>
                <div style={{ borderBottom: '1px solid rgba(76,175,80,0.06)' }} />

                <div onClick={() => navigate('/admin/sensors')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', cursor: 'pointer', transition: 'background 0.15s ease, border-radius 0.15s ease, padding 0.15s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fdf8'; e.currentTarget.style.borderRadius = '10px'; e.currentTarget.style.padding = '14px 8px'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderRadius = '0'; e.currentTarget.style.padding = '14px 0'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '0'; }}
                >
                  <div style={{ background: 'rgba(46,125,50,0.08)', borderRadius: '8px', padding: '8px', display: 'flex', flexShrink: 0 }}>
                    <Droplets size={16} color="#16a34a" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SOIL MOISTURE</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: soilColor(sensorData.soilMoisture), marginTop: '2px' }}>{sensorData.soilMoisture}%</div>
                    <div style={{ width: '140px', height: '6px', borderRadius: '999px', background: 'rgba(26,46,26,0.08)', overflow: 'hidden', marginTop: '4px' }}>
                      <div style={{ width: `${sensorData.soilMoisture}%`, height: '100%', borderRadius: '999px', background: '#16a34a', transition: 'width 0.3s ease' }} />
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: soilColor(sensorData.soilMoisture), marginTop: '3px' }}>{soilLabel(sensorData.soilMoisture)}</div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(46,125,50,0.1)', color: '#16a34a', border: '1px solid rgba(46,125,50,0.2)', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Live
                  </span>
                  <span className="row-arrow" style={{ color: '#6b7280', fontSize: '13px', opacity: 0, transition: 'opacity 0.15s ease', flexShrink: 0 }}>→</span>
                </div>
                <div style={{ borderBottom: '1px solid rgba(76,175,80,0.06)' }} />

                <div onClick={() => navigate('/admin/sensors')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', cursor: 'pointer', transition: 'background 0.15s ease, border-radius 0.15s ease, padding 0.15s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fdf8'; e.currentTarget.style.borderRadius = '10px'; e.currentTarget.style.padding = '14px 8px'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderRadius = '0'; e.currentTarget.style.padding = '14px 0'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '0'; }}
                >
                  <div style={{ background: 'rgba(46,125,50,0.08)', borderRadius: '8px', padding: '8px', display: 'flex', flexShrink: 0 }}>
                    <Radar size={16} color="#16a34a" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ULTRASONIC</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: ultrasonicInfo(sensorData.ultrasonic).color, marginTop: '2px' }}>
                      {ultrasonicInfo(sensorData.ultrasonic).icon} {sensorData.ultrasonic}cm
                    </div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(46,125,50,0.1)', color: '#16a34a', border: '1px solid rgba(46,125,50,0.2)', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Live
                  </span>
                  <span className="row-arrow" style={{ color: '#6b7280', fontSize: '13px', opacity: 0, transition: 'opacity 0.15s ease', flexShrink: 0 }}>→</span>
                </div>
                <div style={{ borderBottom: '1px solid rgba(76,175,80,0.06)' }} />

                <div onClick={() => navigate('/admin/sensors')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', cursor: 'pointer', transition: 'background 0.15s ease, border-radius 0.15s ease, padding 0.15s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fdf8'; e.currentTarget.style.borderRadius = '10px'; e.currentTarget.style.padding = '14px 8px'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderRadius = '0'; e.currentTarget.style.padding = '14px 0'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '0'; }}
                >
                  <div style={{ background: 'rgba(46,125,50,0.08)', borderRadius: '8px', padding: '8px', display: 'flex', flexShrink: 0 }}>
                    <MapPin size={16} color="#16a34a" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LOCATION</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#16a34a' }}>({sensorData.wifiLocation.lat.toFixed(2)}, {sensorData.wifiLocation.lng.toFixed(2)})</span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a' }}>● Active</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '1px' }}>{sensorData.wifiLocation.label}</div>
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(46,125,50,0.1)', color: '#16a34a', border: '1px solid rgba(46,125,50,0.2)', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Live
                  </span>
                  <span className="row-arrow" style={{ color: '#6b7280', fontSize: '13px', opacity: 0, transition: 'opacity 0.15s ease', flexShrink: 0 }}>→</span>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', fontSize: '13px', color: '#6b7280' }}>No sensor data available</div>
            )}

            <div style={{ color: 'rgba(90,122,90,0.6)', fontSize: '12px', fontStyle: 'italic', marginTop: '16px', textAlign: 'center' }}>
              Readings update automatically when hardware pushes data to the API
            </div>
            {/* TODO: Replace mock data with real WebSocket/API data once hardware is connected */}
          </GlowCard>
        )}

        <GlowCard className="glass-card rounded-2xl p-5">
          <div style={{ marginBottom: '6px' }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a' }}>Robot Sensor Network</span>
          </div>
          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '18px' }}>Live readings from connected robot fleet</div>

          {sensorData && (
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8fdf8', border: '1px solid rgba(76,175,80,0.1)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>{fleetSensorStats.online}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, marginTop: '2px' }}>Sensors Online</div>
              </div>
              <div style={{ width: '1px', height: '32px', background: 'rgba(76,175,80,0.1)', flexShrink: 0 }} />
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>{fleetSensorStats.avgTemp}°C</div>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, marginTop: '2px' }}>Avg Temperature</div>
              </div>
              <div style={{ width: '1px', height: '32px', background: 'rgba(76,175,80,0.1)', flexShrink: 0 }} />
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>{fleetSensorStats.avgMoisture}%</div>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, marginTop: '2px' }}>Avg Soil Moisture</div>
              </div>
            </div>
          )}

          {sensorData ? (
            <>
              <div onClick={() => navigate('/admin/sensors')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', cursor: 'pointer', transition: 'background 0.15s ease, border-radius 0.15s ease, padding 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fdf8'; e.currentTarget.style.borderRadius = '10px'; e.currentTarget.style.padding = '14px 8px'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderRadius = '0'; e.currentTarget.style.padding = '14px 0'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '0'; }}
              >
                <div style={{ background: 'rgba(46,125,50,0.08)', borderRadius: '8px', padding: '8px', display: 'flex', flexShrink: 0 }}>
                  <Thermometer size={16} color="#16a34a" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DHT11</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Thermometer size={13} color="#16a34a" />{sensorData.dht11.temperature}°C
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Droplets size={13} color="#16a34a" />{sensorData.dht11.humidity}%
                    </span>
                  </div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(46,125,50,0.1)', color: '#16a34a', border: '1px solid rgba(46,125,50,0.2)', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Live
                </span>
                <span className="row-arrow" style={{ color: '#6b7280', fontSize: '13px', opacity: 0, transition: 'opacity 0.15s ease', flexShrink: 0 }}>→</span>
              </div>
              <div style={{ borderBottom: '1px solid rgba(76,175,80,0.06)' }} />

              <div onClick={() => navigate('/admin/sensors')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', cursor: 'pointer', transition: 'background 0.15s ease, border-radius 0.15s ease, padding 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fdf8'; e.currentTarget.style.borderRadius = '10px'; e.currentTarget.style.padding = '14px 8px'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderRadius = '0'; e.currentTarget.style.padding = '14px 0'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '0'; }}
              >
                <div style={{ background: 'rgba(46,125,50,0.08)', borderRadius: '8px', padding: '8px', display: 'flex', flexShrink: 0 }}>
                  <Droplets size={16} color="#16a34a" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SOIL MOISTURE</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: soilColor(sensorData.soilMoisture), marginTop: '2px' }}>{sensorData.soilMoisture}%</div>
                  <div style={{ width: '140px', height: '6px', borderRadius: '999px', background: 'rgba(26,46,26,0.08)', overflow: 'hidden', marginTop: '4px' }}>
                    <div style={{ width: `${sensorData.soilMoisture}%`, height: '100%', borderRadius: '999px', background: '#16a34a', transition: 'width 0.3s ease' }} />
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: soilColor(sensorData.soilMoisture), marginTop: '3px' }}>{soilLabel(sensorData.soilMoisture)}</div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(46,125,50,0.1)', color: '#16a34a', border: '1px solid rgba(46,125,50,0.2)', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Live
                </span>
                <span className="row-arrow" style={{ color: '#6b7280', fontSize: '13px', opacity: 0, transition: 'opacity 0.15s ease', flexShrink: 0 }}>→</span>
              </div>
              <div style={{ borderBottom: '1px solid rgba(76,175,80,0.06)' }} />

              <div onClick={() => navigate('/admin/sensors')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', cursor: 'pointer', transition: 'background 0.15s ease, border-radius 0.15s ease, padding 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fdf8'; e.currentTarget.style.borderRadius = '10px'; e.currentTarget.style.padding = '14px 8px'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderRadius = '0'; e.currentTarget.style.padding = '14px 0'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '0'; }}
              >
                <div style={{ background: 'rgba(46,125,50,0.08)', borderRadius: '8px', padding: '8px', display: 'flex', flexShrink: 0 }}>
                  <Radar size={16} color="#16a34a" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ULTRASONIC</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: ultrasonicInfo(sensorData.ultrasonic).color, marginTop: '2px' }}>
                    {ultrasonicInfo(sensorData.ultrasonic).icon} {sensorData.ultrasonic}cm
                  </div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(46,125,50,0.1)', color: '#16a34a', border: '1px solid rgba(46,125,50,0.2)', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Live
                </span>
                <span className="row-arrow" style={{ color: '#6b7280', fontSize: '13px', opacity: 0, transition: 'opacity 0.15s ease', flexShrink: 0 }}>→</span>
              </div>
              <div style={{ borderBottom: '1px solid rgba(76,175,80,0.06)' }} />

              <div onClick={() => navigate('/admin/sensors')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', cursor: 'pointer', transition: 'background 0.15s ease, border-radius 0.15s ease, padding 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fdf8'; e.currentTarget.style.borderRadius = '10px'; e.currentTarget.style.padding = '14px 8px'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderRadius = '0'; e.currentTarget.style.padding = '14px 0'; const a = e.currentTarget.querySelector('.row-arrow'); if (a) a.style.opacity = '0'; }}
              >
                <div style={{ background: 'rgba(46,125,50,0.08)', borderRadius: '8px', padding: '8px', display: 'flex', flexShrink: 0 }}>
                  <MapPin size={16} color="#16a34a" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LOCATION</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#16a34a' }}>({sensorData.wifiLocation.lat.toFixed(2)}, {sensorData.wifiLocation.lng.toFixed(2)})</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a' }}>● Active</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '1px' }}>{sensorData.wifiLocation.label}</div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(46,125,50,0.1)', color: '#16a34a', border: '1px solid rgba(46,125,50,0.2)', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Live
                </span>
                <span className="row-arrow" style={{ color: '#6b7280', fontSize: '13px', opacity: 0, transition: 'opacity 0.15s ease', flexShrink: 0 }}>→</span>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', fontSize: '13px', color: '#6b7280' }}>No sensor data available</div>
          )}

          <div style={{ color: 'rgba(90,122,90,0.6)', fontSize: '12px', fontStyle: 'italic', marginTop: '16px', textAlign: 'center' }}>
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
          .pipeline-grid { grid-template-columns: 1fr !important; }
          .pipeline-grid > .pipeline-arrow { display: none !important; }
        }
      `}</style>
    </>
  );
}
