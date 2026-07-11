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

function BatteryIcon({ battery, status }) {
  const isOffline = status === 'Offline';
  const fillColor = battery >= 50 ? '#10B981' : battery >= 20 ? '#F59E0B' : '#EF4444';
  const isEmpty = isOffline || battery === 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', margin: '8px 0' }}>
      <div style={{
        width: '80px', height: '36px', borderRadius: '6px',
        border: `2px solid ${isEmpty ? '#D1D5DB' : fillColor}`,
        padding: '2px', position: 'relative', background: isEmpty ? '#F9FAFB' : 'transparent',
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          height: 'calc(100% - 0px)', width: isEmpty ? '0%' : `${Math.min(battery, 100)}%`,
          borderRadius: '3px',
          background: isEmpty ? 'transparent' : fillColor,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <div style={{
        width: '5px', height: '14px', borderRadius: '0 3px 3px 0',
        background: isEmpty ? '#D1D5DB' : fillColor,
        border: `1px solid ${isEmpty ? '#D1D5DB' : fillColor}`,
        borderLeft: 'none',
      }} />
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

  const farmAreaAcres = useMemo(() => {
    return farms.map((f) => {
      const seed = f.name.length + (f.location || '').length;
      const p1 = { lat: 36 + (seed % 8), lng: -(119 + (seed % 5)) };
      const p2 = { lat: 36 + ((seed * 7) % 8), lng: -(119 + ((seed * 3) % 5)) };
      const p3 = { lat: 36 + ((seed * 13) % 8), lng: -(119 + ((seed * 11) % 5)) };
      return { ...f, acres: parseFloat(computeTriangleAreaAcres(p1, p2, p3)) };
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

  const cropBubbleColors = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#EF4444', '#6366F1', '#14B8A6', '#84CC16', '#F97316'];

  return (
    <>
      <div className="mb-6">
        <div className="text-2xl font-bold text-primary">Analytics</div>
        <div className="text-sm text-text-secondary mt-1">Command center — deeper insights not shown on the Dashboard</div>
      </div>

      <div className="mb-6" style={{
        borderRadius: '16px', overflow: 'hidden',
        borderLeft: `4px solid ${!hasAlerts ? '#10B981' : hasCriticalAlerts ? '#EF4444' : '#F59E0B'}`,
        background: '#ffffff',
        boxShadow: '0 2px 12px rgba(46,125,50,0.08)',
        border: '1px solid rgba(76,175,80,0.15)',
        borderLeftWidth: '4px',
      }}>
        {!hasAlerts ? (
          <div style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(16,185,129,0.06)' }}>
            <CheckCircle size={28} color="#10B981" />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#10B981' }}>All Systems Normal</div>
              <div style={{ fontSize: '12px', color: '#5A7A5A' }}>No alerts at this time</div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <AlertTriangle size={18} color={hasCriticalAlerts ? '#EF4444' : '#F59E0B'} />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>System Alerts</span>
              {hasCriticalAlerts && (
                <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: 'rgba(239,68,68,0.1)', color: '#EF4444', marginLeft: 'auto' }}>Needs attention</span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div onClick={() => navigate('/admin/robots')} style={{
                padding: '16px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                background: offlineRobots.length > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${offlineRobots.length > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(0,0,0,0.04)'}`,
                transition: 'all 0.2s ease',
                opacity: offlineRobots.length > 0 ? 1 : 0.4,
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = offlineRobots.length > 0 ? '0 4px 16px rgba(239,68,68,0.2)' : 'none'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: '32px', fontWeight: 900, color: offlineRobots.length > 0 ? '#EF4444' : '#9CA3AF', lineHeight: 1 }}>{offlineRobots.length}</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: offlineRobots.length > 0 ? '#EF4444' : '#9CA3AF', marginTop: '4px' }}>Robots Offline</div>
                <div style={{ fontSize: '9px', color: offlineRobots.length > 0 ? '#EF4444' : '#9CA3AF', marginTop: '6px', opacity: 0.6 }}>
                  {offlineRobots.length > 0 ? 'Tap to fix →' : '✓ Clear'}
                </div>
              </div>
              <div onClick={() => navigate('/admin/robots')} style={{
                padding: '16px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                background: criticalBattRobots.length > 0 ? 'rgba(245,158,11,0.08)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${criticalBattRobots.length > 0 ? 'rgba(245,158,11,0.2)' : 'rgba(0,0,0,0.04)'}`,
                transition: 'all 0.2s ease',
                opacity: criticalBattRobots.length > 0 ? 1 : 0.4,
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = criticalBattRobots.length > 0 ? '0 4px 16px rgba(245,158,11,0.2)' : 'none'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: '32px', fontWeight: 900, color: criticalBattRobots.length > 0 ? '#F59E0B' : '#9CA3AF', lineHeight: 1 }}>{criticalBattRobots.length}</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: criticalBattRobots.length > 0 ? '#F59E0B' : '#9CA3AF', marginTop: '4px' }}>Critical Battery</div>
                <div style={{ fontSize: '9px', color: criticalBattRobots.length > 0 ? '#F59E0B' : '#9CA3AF', marginTop: '6px', opacity: 0.6 }}>
                  {criticalBattRobots.length > 0 ? 'Tap to fix →' : '✓ Clear'}
                </div>
              </div>
              <div onClick={() => navigate('/admin/tasks')} style={{
                padding: '16px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                background: overdueTasks.length > 0 ? 'rgba(239,68,68,0.06)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${overdueTasks.length > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(0,0,0,0.04)'}`,
                transition: 'all 0.2s ease',
                opacity: overdueTasks.length > 0 ? 1 : 0.4,
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = overdueTasks.length > 0 ? '0 4px 16px rgba(239,68,68,0.15)' : 'none'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: '32px', fontWeight: 900, color: overdueTasks.length > 0 ? '#EF4444' : '#9CA3AF', lineHeight: 1 }}>{overdueTasks.length}</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: overdueTasks.length > 0 ? '#EF4444' : '#9CA3AF', marginTop: '4px' }}>Overdue Tasks</div>
                <div style={{ fontSize: '9px', color: overdueTasks.length > 0 ? '#EF4444' : '#9CA3AF', marginTop: '6px', opacity: 0.6 }}>
                  {overdueTasks.length > 0 ? 'Tap to fix →' : '✓ Clear'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <GlowCard className="glass-card rounded-2xl p-5">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Robot Fleet — Battery Status</span>
            <span style={{ fontSize: '10px', color: '#5A7A5A' }}>Click any robot to view details →</span>
          </div>
          <div style={{ fontSize: '10px', color: '#5A7A5A', marginBottom: '16px' }}>Battery health across the fleet</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
          }} className="battery-grid">
            {batterySorted.map((r) => {
              const isOffline = r.status === 'Offline';
              const statusLabel = isOffline ? 'Offline'
                : r.battery >= 80 ? '🟢 Excellent'
                : r.battery >= 50 ? '🟢 Good'
                : r.battery >= 20 ? '🟡 Low'
                : '🔴 Critical ⚠';
              const labelColor = isOffline ? '#9CA3AF'
                : r.battery >= 50 ? '#10B981'
                : r.battery >= 20 ? '#F59E0B'
                : '#EF4444';
              return (
                <div key={r.id} onClick={() => navigate('/admin/robots')} style={{
                  padding: '14px 12px', borderRadius: '12px', cursor: 'pointer',
                  background: '#ffffff',
                  border: '1px solid rgba(76,175,80,0.12)',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(26,46,26,0.12)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                  <BatteryIcon battery={r.battery} status={r.status} />
                  {!isOffline && (
                    <div style={{ fontSize: '20px', fontWeight: 800, color: labelColor }}>{r.battery}%</div>
                  )}
                  <div style={{ fontSize: '10px', fontWeight: 600, color: labelColor, marginTop: '4px' }}>{statusLabel}</div>
                  <div style={{ fontSize: '9px', color: '#5A7A5A', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.farm}</div>
                </div>
              );
            })}
          </div>
          <div onClick={() => navigate('/admin/robots')} style={{
            marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)',
            fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
            color: robotsNeedAttention.length > 0 ? '#F59E0B' : '#10B981',
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
          <div style={{ marginBottom: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Task Operations Pipeline</span>
          </div>
          <div style={{ fontSize: '10px', color: '#5A7A5A', marginBottom: '20px' }}>Live task flow across all farms</div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr',
            gap: '8px', alignItems: 'stretch',
          }} className="pipeline-grid">
            <div style={{
              padding: '16px', borderRadius: '12px', textAlign: 'center',
              background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
            }}>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#D97706', marginBottom: '8px' }}>Pending</div>
              <div style={{ fontSize: '34px', fontWeight: 900, color: '#F59E0B', lineHeight: 1 }}>{pendingTasks.length}</div>
              <div style={{ fontSize: '9px', color: '#5A7A5A', marginBottom: '10px' }}>tasks</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ fontSize: '10px', color: '#EF4444', fontWeight: 600 }}>High: {highCount}</div>
                <div style={{ fontSize: '10px', color: '#F59E0B', fontWeight: 600 }}>Medium: {medCount}</div>
                <div style={{ fontSize: '10px', color: '#10B981', fontWeight: 600 }}>Low: {lowCount}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
              <div style={{ fontSize: '20px', color: 'rgba(0,0,0,0.15)', fontWeight: 300 }}>──►</div>
            </div>

            <div style={{
              padding: '16px', borderRadius: '12px', textAlign: 'center',
              background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
            }}>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2563EB', marginBottom: '8px' }}>In Progress</div>
              <div style={{ fontSize: '34px', fontWeight: 900, color: '#3B82F6', lineHeight: 1 }}>{inProgressTasks.length}</div>
              <div style={{ fontSize: '9px', color: '#5A7A5A', marginBottom: '10px' }}>tasks</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {inProgressTypes.length > 0 ? inProgressTypes.map(([type, count]) => (
                  <div key={type} style={{ fontSize: '10px', color: '#3B82F6', fontWeight: 600 }}>{type}: {count}</div>
                )) : <div style={{ fontSize: '10px', color: '#9CA3AF' }}>No active tasks</div>}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
              <div style={{ fontSize: '20px', color: 'rgba(0,0,0,0.15)', fontWeight: 300 }}>──►</div>
            </div>

            <div style={{
              padding: '16px', borderRadius: '12px', textAlign: 'center',
              background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
            }}>
              <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#059669', marginBottom: '8px' }}>Completed</div>
              <div style={{ fontSize: '34px', fontWeight: 900, color: '#10B981', lineHeight: 1 }}>{completedTasks.length}</div>
              <div style={{ fontSize: '9px', color: '#5A7A5A', marginBottom: '10px' }}>tasks</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ fontSize: '10px', color: '#10B981', fontWeight: 600 }}>This week: {completedThisWeek}</div>
                <div style={{ fontSize: '10px', color: '#10B981', fontWeight: 600 }}>On time: {completedTasks.length}</div>
                <div style={{ fontSize: '10px', color: '#EF4444', fontWeight: 600 }}>Late: 0</div>
              </div>
            </div>
          </div>

          {overdueTasks.length > 0 ? (
            <div style={{
              marginTop: '14px', padding: '12px 14px', borderRadius: '10px',
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.12)',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#EF4444', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={14} color="#EF4444" />
                {overdueTasks.length} {overdueTasks.length === 1 ? 'task is' : 'tasks are'} overdue:
              </div>
              {overdueTaskRows.map((t) => (
                <div key={t.id} onClick={() => navigate('/admin/tasks')} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 8px', borderRadius: '6px', cursor: 'pointer',
                  fontSize: '11px', transition: 'background 0.15s ease',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, color: '#111827', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                  <span style={{ color: '#5A7A5A', fontSize: '10px' }}>{t.assignedTo}</span>
                  <span style={{ color: '#EF4444', fontWeight: 600, fontSize: '10px', whiteSpace: 'nowrap' }}>{t.daysLate}d late</span>
                  <ArrowRight size={12} color="#EF4444" style={{ flexShrink: 0, opacity: 0.5 }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              marginTop: '14px', padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(16,185,129,0.06)', color: '#10B981',
              fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <CheckCircle size={14} color="#10B981" />
              No overdue tasks — all on track
            </div>
          )}

          <div onClick={() => navigate('/admin/tasks')} style={{
            marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.05)',
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="farm-crop-grid mb-6">
        <GlowCard className="glass-card rounded-2xl p-5">
          <div style={{ marginBottom: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Farm Status Overview</span>
          </div>
          <div style={{ fontSize: '10px', color: '#5A7A5A', marginBottom: '14px' }}>Click any farm to view details →</div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0',
            marginBottom: '14px', padding: '10px', borderRadius: '10px',
            background: 'rgba(76,175,80,0.03)',
            border: '1px solid rgba(76,175,80,0.08)',
            textAlign: 'center',
          }}>
            <div>
              <div style={{ fontSize: '13px' }}>🌍</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>{totalArea.toFixed(1)}</div>
              <div style={{ fontSize: '8px', color: '#5A7A5A' }} title="Based on 3-point boundary approximation">Est. acres</div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(0,0,0,0.06)', borderRight: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '13px' }}>🟢</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>{activeArea.toFixed(1)}</div>
              <div style={{ fontSize: '8px', color: '#5A7A5A' }}>Active</div>
            </div>
            <div>
              <div style={{ fontSize: '13px' }}>💤</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>{idleArea.toFixed(1)}</div>
              <div style={{ fontSize: '8px', color: '#5A7A5A' }}>Idle</div>
            </div>
          </div>

          <div style={{ fontSize: '8px', color: '#9CA3AF', marginBottom: '12px', textAlign: 'center' }} title="Based on 3-point boundary approximation">Est. Acres based on 3-point boundary approximation</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {farmAreaAcres.map((f) => {
              const statusColor = f.status === 'Active' ? '#10B981' : f.status === 'Idle' ? '#F59E0B' : '#EF4444';
              const robotCount = robots.filter((r) => r.farm === f.name).length;
              return (
                <div key={f.name} onClick={() => navigate('/admin/farms')} style={{
                  padding: '12px', borderRadius: '10px', cursor: 'pointer',
                  background: '#ffffff',
                  border: '1px solid rgba(76,175,80,0.12)',
                  borderTop: `3px solid ${statusColor}`,
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(26,46,26,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                  <div style={{ fontSize: '10px', color: '#5A7A5A', marginTop: '2px' }}>{f.owner}</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#111827', marginTop: '6px' }}>Est. {f.acres.toFixed(1)} acres</div>
                  <div style={{ fontSize: '12px', marginTop: '4px', letterSpacing: '1px' }}>
                    {Array.from({ length: Math.min(robotCount, 5) }, (_, i) => (
                      <span key={i} style={{ fontSize: robotCount > 5 && i === 4 ? '9px' : '13px', color: '#5A7A5A' }}>
                        {robotCount > 5 && i === 4 ? `+${robotCount - 4} more` : '🤖'}
                      </span>
                    ))}
                    {robotCount === 0 && <span style={{ fontSize: '9px', color: '#9CA3AF' }}>No robots</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </GlowCard>

        <GlowCard className="glass-card rounded-2xl p-5">
          <div style={{ marginBottom: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>What Our Farmers Grow</span>
          </div>
          <div style={{ fontSize: '10px', color: '#5A7A5A', marginBottom: '14px' }}>Bubble size = number of farms growing this crop</div>

          {cropFrequency.length > 0 ? (
            <>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '8px',
                alignItems: 'center', justifyContent: 'center',
                padding: '12px 8px', minHeight: '160px',
              }}>
                {cropFrequency.map((crop, i) => {
                  const ratio = crop.count / Math.max(maxCropCount, 1);
                  const size = 10 + ratio * 12;
                  const pad = 6 + ratio * 12;
                  const color = cropBubbleColors[i % cropBubbleColors.length];
                  return (
                    <div key={crop.name} onClick={() => navigate('/admin/farms')} style={{
                      display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                      padding: `${pad}px ${pad * 1.6}px`,
                      borderRadius: '999px', cursor: 'pointer',
                      background: `${color}10`,
                      border: `1px solid ${color}30`,
                      transition: 'all 0.2s ease',
                      fontSize: `${size}px`,
                      fontWeight: 700,
                      color: color,
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)';
                        e.currentTarget.style.boxShadow = `0 4px 14px ${color}30`;
                        e.currentTarget.style.background = `${color}18`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.background = `${color}10`;
                      }}
                      title={`${crop.count} farm${crop.count !== 1 ? 's' : ''} grow ${crop.name}`}
                    >
                      <span>{crop.name}</span>
                      <span style={{ fontSize: `${Math.max(8, size * 0.6)}px`, opacity: 0.75, marginTop: '1px' }}>
                        {crop.count} farm{crop.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <span onClick={() => navigate('/admin/farms')} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '6px 12px', borderRadius: '999px', cursor: 'pointer',
                  fontSize: '10px', fontWeight: 600,
                  background: 'rgba(16,185,129,0.1)', color: '#10B981',
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  🏆 Most Grown: {mostGrown ? `${mostGrown.name} (${mostGrown.count} farms)` : '—'}
                </span>
                <span onClick={() => navigate('/admin/farms')} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '6px 12px', borderRadius: '999px', cursor: 'pointer',
                  fontSize: '10px', fontWeight: 600,
                  background: 'rgba(59,130,246,0.1)', color: '#3B82F6',
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  🌱 Most Diverse: {mostDiverseFarm ? `${mostDiverseFarm.name} (${mostDiverseFarm.count} crops)` : '—'}
                </span>
                <span onClick={() => navigate('/admin/farms')} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '6px 12px', borderRadius: '999px', cursor: 'pointer',
                  fontSize: '10px', fontWeight: 600,
                  background: 'rgba(139,92,246,0.1)', color: '#8B5CF6',
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  🔍 {cropFrequency.length} unique crop{cropFrequency.length !== 1 ? 's' : ''}
                </span>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '160px', fontSize: '12px', color: '#5A7A5A' }}>No crop data available</div>
          )}
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '160px', fontSize: '12px', color: '#5A7A5A' }}>No activity recorded yet</div>
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
            <div style={{ marginBottom: '4px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Robot Sensor Network</span>
            </div>
            <div style={{ fontSize: '10px', color: '#5A7A5A', marginBottom: '16px' }}>Per-robot sensors — live once hardware connected</div>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
              border: '1.5px dashed rgba(0,0,0,0.1)', borderRadius: '12px', padding: '14px',
            }}>
              {[
                { icon: Thermometer, name: 'DHT11', desc: 'Temp & Humidity' },
                { icon: Droplets, name: 'Soil Moisture', desc: 'Soil wetness sensor' },
                { icon: Radar, name: 'Ultrasonic', desc: 'Distance detection' },
                { icon: MapPin, name: 'WiFi Location', desc: 'Position tracker' },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.name} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '14px 10px', borderRadius: '10px',
                    background: 'rgba(0,0,0,0.02)',
                    border: '1px solid rgba(0,0,0,0.04)',
                    textAlign: 'center',
                  }}>
                    <Icon size={22} color="#9CA3AF" />
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#111827', marginTop: '6px' }}>{s.name}</div>
                    <div style={{ fontSize: '9px', color: '#5A7A5A', marginTop: '2px' }}>{s.desc}</div>
                    <div style={{
                      fontSize: '8px', fontWeight: 600, marginTop: '8px',
                      padding: '3px 8px', borderRadius: '999px',
                      background: 'rgba(156,163,175,0.1)', color: '#9CA3AF',
                    }}>
                      ⏳ Awaiting Connection
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: '9px', color: '#9CA3AF', fontStyle: 'italic', marginTop: '10px', textAlign: 'center' }}>
              Sensor data appears automatically once robots connect to hardware API
            </div>
            {/* // TODO: Replace with real sensor data from hardware API/WebSocket */}
          </GlowCard>
        )}

        <GlowCard className="glass-card rounded-2xl p-5">
          <div style={{ marginBottom: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Robot Sensor Network</span>
          </div>
          <div style={{ fontSize: '10px', color: '#5A7A5A', marginBottom: '16px' }}>Per-robot sensors — live once hardware connected</div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
            border: '1.5px dashed rgba(0,0,0,0.1)', borderRadius: '12px', padding: '14px',
          }}>
            {[
              { icon: Thermometer, name: 'DHT11', desc: 'Temp & Humidity' },
              { icon: Droplets, name: 'Soil Moisture', desc: 'Soil wetness sensor' },
              { icon: Radar, name: 'Ultrasonic', desc: 'Distance detection' },
              { icon: MapPin, name: 'WiFi Location', desc: 'Position tracker' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.name} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '14px 10px', borderRadius: '10px',
                  background: 'rgba(0,0,0,0.02)',
                  border: '1px solid rgba(0,0,0,0.04)',
                  textAlign: 'center',
                }}>
                  <Icon size={22} color="#9CA3AF" />
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#111827', marginTop: '6px' }}>{s.name}</div>
                  <div style={{ fontSize: '9px', color: '#5A7A5A', marginTop: '2px' }}>{s.desc}</div>
                  <div style={{
                    fontSize: '8px', fontWeight: 600, marginTop: '8px',
                    padding: '3px 8px', borderRadius: '999px',
                    background: 'rgba(156,163,175,0.1)', color: '#9CA3AF',
                  }}>
                    ⏳ Awaiting Connection
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: '9px', color: '#9CA3AF', fontStyle: 'italic', marginTop: '10px', textAlign: 'center' }}>
            Sensor data appears automatically once robots connect to hardware API
          </div>
          {/* // TODO: Replace with real sensor data from hardware API/WebSocket */}
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
