import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUsers } from '../../context/UserContext';
import { useFarms } from '../../context/FarmContext';
import { useRobots } from '../../context/RobotContext';
import { useTasks } from '../../context/TaskContext';
import { useEmployees } from '../../context/EmployeeContext';
import { useActivityLog } from '../../context/ActivityLogContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  AlertTriangle, AlertCircle, Thermometer, Droplets, Radar, MapPin,
  ArrowRight, Maximize2, CheckCircle as CheckCircleIcon, Clock,
  Bot, RefreshCw, TrendingUp,
} from 'lucide-react';

function GlowCard({ className, style: outerStyle, onClick, children }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={className}
      style={{
        background: '#ffffff',
        border: '1px solid rgba(76,175,80,0.12)',
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(46,125,50,0.06)',
        padding: '24px',
        ...outerStyle,
        cursor: onClick ? 'pointer' : undefined,
        transition: 'all 0.25s ease',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 8px 24px rgba(26,46,26,0.15)' : boxShadow || '0 2px 12px rgba(46,125,50,0.06)',
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
        cursor: 'pointer', transition: 'background 0.15s ease',
        background: hover ? '#fef2f2' : 'transparent',
        borderRadius: '8px', padding: '10px 12px',
        display: 'flex', alignItems: 'center', gap: '10px',
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

const cropEmojis = { wheat: '🌾', barley: '🌾', corn: '🌽', soybeans: '🫘', apples: '🍎', pears: '🍐', rice: '🍚', strawberries: '🍓', tomatoes: '🍅', alfalfa: '🌿', hay: '🌾' };

const taskTypeColors = { Irrigation: '#3b82f6', Fertilizer: '#4caf50', Inspection: '#8b5cf6', Maintenance: '#f97316' };

function batteryLabel(pct) {
  if (pct >= 85) return { label: 'Excellent', color: '#2e7d2e', bg: 'rgba(46,125,50,0.1)' };
  if (pct >= 60) return { label: 'Good', color: '#4caf50', bg: 'rgba(76,175,80,0.1)' };
  return { label: 'Low', color: '#f97316', bg: 'rgba(249,115,22,0.1)' };
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
  const lowBattRobots = robots.filter((r) => r.battery < 20);
  const overdueTasks = tasks.filter((t) => t.status !== 'Completed' && new Date(t.dueDate) < now);
  const hasAlerts = offlineRobots.length > 0 || lowBattRobots.length > 0 || overdueTasks.length > 0;

  const sortedBattery = useMemo(() => [...robots].sort((a, b) => a.battery - b.battery), [robots]);

  const taskTypes = ['Irrigation', 'Fertilizer', 'Inspection', 'Maintenance'];
  const taskTypeData = taskTypes.map((t) => ({
    name: t, count: tasks.filter((x) => x.type === t).length, color: taskTypeColors[t] || '#6B7280',
  }));
  const maxTaskTypeCount = Math.max(...taskTypeData.map((t) => t.count), 1);

  const highCount = tasks.filter((t) => t.priority === 'High').length;
  const medCount = tasks.filter((t) => t.priority === 'Medium').length;
  const lowCount = tasks.filter((t) => t.priority === 'Low').length;
  const maxPriority = Math.max(highCount, medCount, lowCount, 1);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const [sortBy, setSortBy] = useState('size');
  const farmAreaAcres = useMemo(() => {
    return farms.map((f) => {
      const sizeNum = parseFloat(f.size) || 0;
      return { ...f, acres: sizeNum };
    });
  }, [farms]);
  const totalArea = farmAreaAcres.reduce((s, f) => s + f.acres, 0);
  const activeArea = farmAreaAcres.filter((f) => f.status === 'Active').reduce((s, f) => s + f.acres, 0);
  const idleArea = farmAreaAcres.filter((f) => f.status !== 'Active').reduce((s, f) => s + f.acres, 0);
  const maxFarmArea = Math.max(...farmAreaAcres.map((f) => f.acres), 1);

  const sortedFarms = useMemo(() => {
    const f = [...farmAreaAcres];
    if (sortBy === 'size') f.sort((a, b) => b.acres - a.acres);
    else if (sortBy === 'status') f.sort((a, b) => b.status.localeCompare(a.status));
    else f.sort((a, b) => a.owner.localeCompare(b.owner));
    return f;
  }, [farmAreaAcres, sortBy]);

  const cropFrequency = useMemo(() => {
    const counts = {};
    farms.forEach((f) => {
      (f.cropTypes || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean).forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count, emoji: cropEmojis[name] || '🌱',
    })).sort((a, b) => b.count - a.count);
  }, [farms]);
  const mostGrown = cropFrequency.length > 0 ? cropFrequency[0] : null;
  const maxCropCount = cropFrequency.length > 0 ? cropFrequency[0].count : 1;

  const mostDiverseFarm = useMemo(() => {
    let best = null, max = 0;
    farms.forEach((f) => {
      const types = (f.cropTypes || '').split(',').map((s) => s.trim()).filter(Boolean);
      if (types.length > max) { max = types.length; best = f; }
    });
    return best ? { name: best.name, count: max } : null;
  }, [farms]);

  const timelineData = useMemo(() => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const completedTaskDates = tasks.filter((t) => t.status === 'Completed').map((t) => new Date(t.dueDate));
    if (completedTaskDates.length === 0) {
      return weeks.map((w) => ({ week: w, completed: 0 }));
    }
    const minDate = new Date(Math.min(...completedTaskDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...completedTaskDates.map((d) => d.getTime())));
    const range = (maxDate.getTime() - minDate.getTime()) / 3;
    return weeks.map((w, i) => ({
      week: w,
      completed: completedTaskDates.filter((d) => d.getTime() >= minDate.getTime() + (i - 1) * range && d.getTime() < minDate.getTime() + i * range).length,
    }));
  }, [tasks]);

  const activeRobotsPct = robots.length > 0 ? Math.round((robots.filter((r) => r.status === 'Active').length / robots.length) * 100) : 0;
  const activeFarms = farms.filter((f) => f.status === 'Active').length;

  return (
    <>
      <div className="mb-6">
        <div className="text-2xl font-bold" style={{ color: '#1a2e1a' }}>Analytics</div>
        <div className="text-sm mt-1" style={{ color: '#5a7a5a' }}>Command center — deeper insights not shown on the Dashboard</div>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid rgba(76,175,80,0.12)', borderRadius: '16px', boxShadow: '0 2px 12px rgba(46,125,50,0.06)', padding: '24px', marginBottom: '24px', borderLeft: hasAlerts ? '4px solid #ef4444' : '4px solid #10B981' }}>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={20} color={hasAlerts ? '#ef4444' : '#10B981'} style={{ verticalAlign: 'middle' }} />
          <span style={{ color: '#1a2e1a', fontSize: '18px', fontWeight: 700 }}>System Alerts</span>
          {hasAlerts && (
            <span style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: 600, marginLeft: 'auto' }}>
              Needs attention
            </span>
          )}
        </div>
        {!hasAlerts ? (
          <div className="px-4 py-3 rounded-xl text-[13px] font-medium" style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981' }}>
            ✓ All Systems Normal — No alerts at this time
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 mb-4">
              {offlineRobots.length > 0 && (
                <div onClick={() => navigate('/admin/robots')} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
                  <span style={{ fontSize: '20px', fontWeight: 700, color: '#ef4444' }}>{offlineRobots.length}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#ef4444' }}>Robots Offline</span>
                </div>
              )}
              {lowBattRobots.length > 0 && (
                <div onClick={() => navigate('/admin/robots')} style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
                  <span style={{ fontSize: '20px', fontWeight: 700, color: '#F59E0B' }}>{lowBattRobots.length}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#F59E0B' }}>Low Battery</span>
                </div>
              )}
              {overdueTasks.length > 0 && (
                <div onClick={() => navigate('/admin/tasks')} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <AlertCircle size={18} color="#ef4444" />
                  <span style={{ fontSize: '20px', fontWeight: 700, color: '#ef4444' }}>{overdueTasks.length}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#ef4444' }}>Overdue Tasks</span>
                </div>
              )}
            </div>
            {offlineRobots.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ color: '#5a7a5a', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Offline Robots</div>
                {offlineRobots.map((r) => (
                  <Clickable key={r.id} onClick={() => navigate('/admin/robots')} showArrow>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ color: '#1a2e1a', fontWeight: 700, fontSize: '13px' }}>{r.name}</span>
                    <span style={{ color: '#5a7a5a', fontSize: '13px' }}>· Offline · Assigned: {r.farm}</span>
                    <span style={{ color: '#ef4444', fontSize: '13px', fontWeight: 600, marginLeft: 'auto', flexShrink: 0 }}>View Robot</span>
                  </Clickable>
                ))}
              </div>
            )}
            {lowBattRobots.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ color: '#5a7a5a', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Low Battery Robots</div>
                {lowBattRobots.map((r) => (
                  <Clickable key={r.id} onClick={() => navigate('/admin/robots')} showArrow>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ color: '#1a2e1a', fontWeight: 700, fontSize: '13px' }}>{r.name}</span>
                    <span style={{ color: '#5a7a5a', fontSize: '13px' }}>· {r.battery}% battery · Assigned: {r.farm}</span>
                    <span style={{ color: '#F59E0B', fontSize: '13px', fontWeight: 700, marginLeft: 'auto', flexShrink: 0 }}>{r.battery}%</span>
                  </Clickable>
                ))}
              </div>
            )}
            {overdueTasks.length > 0 && (
              <div style={{ marginBottom: '4px' }}>
                <div style={{ color: '#5a7a5a', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Overdue Tasks</div>
                {overdueTasks.slice(0, 5).map((t) => {
                  const days = Math.floor((now - new Date(t.dueDate).getTime()) / 86400000);
                  return (
                    <Clickable key={t.id} onClick={() => navigate('/admin/tasks')} showArrow>
                      <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                      <span style={{ color: '#1a2e1a', fontWeight: 600, fontSize: '13px' }}>{t.title}</span>
                      <span style={{ color: '#5a7a5a', fontSize: '13px' }}>· {t.assignedTo} · {t.farm}</span>
                      <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '13px', marginLeft: 'auto', flexShrink: 0 }}>{days}d overdue</span>
                    </Clickable>
                  );
                })}
                {overdueTasks.length > 5 && (
                  <div style={{ color: '#2e7d2e', fontWeight: 500, fontSize: '13px', marginTop: '4px', cursor: 'pointer', paddingLeft: '10px' }}
                    onClick={() => navigate('/admin/tasks')}>+{overdueTasks.length - 5} more overdue tasks</div>
                )}
              </div>
            )}
            <div style={{ color: 'rgba(90,122,90,0.6)', fontSize: '12px', fontStyle: 'italic', marginTop: '12px' }}>Click any alert to navigate directly to the issue</div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
        <GlowCard>
          <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
            <span style={{ color: '#1a2e1a', fontSize: '18px', fontWeight: 700 }}>Robot Battery Health</span>
            <span style={{ color: '#2e7d2e', fontSize: '13px' }}>Click any robot to view details →</span>
          </div>
          <div style={{ color: '#5a7a5a', fontSize: '13px', marginBottom: '16px' }}>Full fleet — sorted by battery (lowest first)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sortedBattery.map((r) => {
              const bl = batteryLabel(r.battery);
              const barColor = r.battery < 60 ? '#f97316' : r.battery < 85 ? '#4caf50' : '#2e7d2e';
              return (
                <div key={r.id} onClick={() => navigate('/admin/robots')}
                  style={{ cursor: 'pointer', borderRadius: '10px', padding: '10px 12px', transition: 'background 0.15s ease', display: 'flex', flexDirection: 'column', gap: '6px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fdf8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: r.battery < 20 ? '#ef4444' : r.battery < 60 ? '#f97316' : '#4caf50', display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ color: '#1a2e1a', fontWeight: 600, fontSize: '14px' }}>{r.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#1a2e1a', fontWeight: 700, fontSize: '15px' }}>{r.battery}%</span>
                      <span style={{ background: bl.bg, color: bl.color, borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: 600 }}>{bl.label}</span>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(76,175,80,0.12)', borderRadius: '99px', height: '8px', width: '100%' }}>
                    <div style={{ width: `${r.battery}%`, height: '100%', borderRadius: '99px', background: barColor, transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div onClick={() => navigate('/admin/robots')} style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)', color: '#f97316', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} color="#f97316" />
            {robots.filter((r) => r.battery < 50).length} robots need charging soon →
          </div>
        </GlowCard>

        <GlowCard>
          <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
            <span style={{ color: '#1a2e1a', fontSize: '18px', fontWeight: 700 }}>Task Analysis</span>
            <span style={{ color: '#2e7d2e', fontSize: '13px' }}>Click any item to view tasks →</span>
          </div>
          <div style={{ color: '#5a7a5a', fontSize: '13px', marginBottom: '16px' }}>Breakdown by type and priority</div>

          <div style={{ color: '#5a7a5a', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>BY TYPE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {taskTypeData.map((t) => (
              <div key={t.name} onClick={() => navigate('/admin/tasks')}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '6px', padding: '4px 6px', transition: 'background 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fdf8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                <span style={{ color: '#1a2e1a', fontWeight: 500, minWidth: '90px', fontSize: '13px' }}>{t.name}</span>
                <div style={{ flex: 1, background: 'rgba(26,46,26,0.08)', borderRadius: '99px', height: '10px' }}>
                  <div style={{ width: `${(t.count / maxTaskTypeCount) * 100}%`, height: '100%', borderRadius: '99px', background: t.color, transition: 'width 0.3s ease' }} />
                </div>
                <span style={{ color: '#5a7a5a', minWidth: '60px', textAlign: 'right', fontSize: '13px' }}>{t.count} tasks</span>
              </div>
            ))}
          </div>

          <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#5a7a5a', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>BY PRIORITY</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { name: 'High', count: highCount, color: '#ef4444', emoji: '🔴' },
                { name: 'Medium', count: medCount, color: '#f97316', emoji: '🟡' },
                { name: 'Low', count: lowCount, color: '#4caf50', emoji: '🟢' },
              ].map((p) => (
                <div key={p.name} onClick={() => navigate('/admin/tasks')}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '6px', padding: '4px 6px', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fdf8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                  <span style={{ fontSize: '13px', minWidth: '20px' }}>{p.emoji}</span>
                  <span style={{ color: '#1a2e1a', fontWeight: 500, minWidth: '60px', fontSize: '13px' }}>{p.name}</span>
                  <div style={{ flex: 1, background: 'rgba(26,46,26,0.08)', borderRadius: '99px', height: '10px' }}>
                    <div style={{ width: `${(p.count / maxPriority) * 100}%`, height: '100%', borderRadius: '99px', background: p.color, transition: 'width 0.3s ease' }} />
                  </div>
                  <span style={{ color: '#5a7a5a', minWidth: '60px', textAlign: 'right', fontSize: '13px' }}>{p.count} tasks</span>
                </div>
              ))}
            </div>
          </div>

          <div onClick={() => navigate('/admin/tasks')} style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)', color: '#2e7d2e', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
            {totalTasks} total tasks · {completionPct}% completion rate →
          </div>
        </GlowCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
        <GlowCard>
          <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
            <span style={{ color: '#1a2e1a', fontSize: '18px', fontWeight: 700 }}>Farm Portfolio</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['size', 'status', 'owner'].map((s) => (
                <button key={s} onClick={() => setSortBy(s)}
                  style={{ background: sortBy === s ? '#1a2e1a' : '#f1f8f1', border: sortBy === s ? '1px solid #1a2e1a' : '1px solid rgba(76,175,80,0.2)', color: sortBy === s ? '#ffffff' : '#1a2e1a', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.03em', transition: 'all 0.15s ease' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div style={{ color: '#2e7d2e', fontSize: '13px', marginBottom: '16px' }}>Click any farm to view details →</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px', background: '#f8fdf8', border: '1px solid rgba(76,175,80,0.12)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
            <div>
              <Maximize2 size={18} color="#2e7d2e" style={{ margin: '0 auto 4px' }} />
              <div style={{ color: '#1a2e1a', fontSize: '22px', fontWeight: 700 }}>{totalArea.toFixed(1)}</div>
              <div style={{ color: '#5a7a5a', fontSize: '12px' }}>Est. acres</div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(76,175,80,0.12)', borderRight: '1px solid rgba(76,175,80,0.12)' }}>
              <CheckCircleIcon size={18} color="#2e7d2e" style={{ margin: '0 auto 4px' }} />
              <div style={{ color: '#1a2e1a', fontSize: '22px', fontWeight: 700 }}>{activeArea.toFixed(1)}</div>
              <div style={{ color: '#5a7a5a', fontSize: '12px' }}>Active</div>
            </div>
            <div>
              <Clock size={18} color="#2e7d2e" style={{ margin: '0 auto 4px' }} />
              <div style={{ color: '#1a2e1a', fontSize: '22px', fontWeight: 700 }}>{idleArea.toFixed(1)}</div>
              <div style={{ color: '#5a7a5a', fontSize: '12px' }}>Idle</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '300px', overflow: 'auto', scrollbarWidth: 'thin' }}>
            {sortedFarms.map((f) => {
              const barW = (f.acres / maxFarmArea) * 100;
              const robotCount = robots.filter((r) => r.farm === f.name).length;
              return (
                <div key={f.name} onClick={() => navigate('/admin/farms')}
                  style={{ cursor: 'pointer', borderRadius: '10px', padding: '10px 12px', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fdf8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: f.status === 'Active' ? '#4caf50' : f.status === 'Idle' ? '#F59E0B' : '#EF4444', display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ color: '#1a2e1a', fontWeight: 600, fontSize: '14px' }}>{f.name}</span>
                    <span style={{ color: '#5a7a5a', fontSize: '12px' }}>{f.owner}</span>
                    <span style={{ color: '#5a7a5a', fontSize: '12px', marginLeft: 'auto' }}>{f.location || f.soil}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, background: 'rgba(76,175,80,0.12)', borderRadius: '99px', height: '6px' }}>
                      <div style={{ width: `${barW}%`, height: '100%', borderRadius: '99px', background: '#4caf50', transition: 'width 0.3s ease' }} />
                    </div>
                    <span style={{ color: '#2e7d2e', fontWeight: 600, fontSize: '13px', flexShrink: 0 }}>{f.acres} Est. acres</span>
                    <span style={{ color: '#5a7a5a', fontSize: '12px', flexShrink: 0 }}>· {robotCount} robot{robotCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlowCard>

        <GlowCard>
          <div style={{ color: '#1a2e1a', fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Crops Across All Farms</div>
          <div style={{ color: '#5a7a5a', fontSize: '13px', marginBottom: '16px' }}>What our farmers are growing</div>
          {cropFrequency.length > 0 ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cropFrequency.slice(0, 5).map((crop, i) => {
                  const barW = (crop.count / maxCropCount) * 100;
                  const barColors = ['#2e7d2e', '#4caf50', '#f97316', '#8b5cf6', '#ec4899'];
                  return (
                    <div key={crop.name} onClick={() => navigate('/admin/farms')}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '6px', padding: '4px 6px', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fdf8'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                      <span style={{ color: '#5a7a5a', fontWeight: 700, fontSize: '13px', minWidth: '24px' }}>#{i + 1}</span>
                      <span style={{ fontSize: '15px' }}>{crop.emoji}</span>
                      <span style={{ color: '#1a2e1a', fontWeight: 500, minWidth: '80px', fontSize: '13px' }}>{crop.name}</span>
                      <div style={{ flex: 1, background: 'rgba(26,46,26,0.08)', borderRadius: '99px', height: '10px' }}>
                        <div style={{ width: `${barW}%`, height: '100%', borderRadius: '99px', background: barColors[i], transition: 'width 0.3s ease' }} />
                      </div>
                      <span style={{ color: '#5a7a5a', fontSize: '13px', minWidth: '60px', textAlign: 'right' }}>{crop.count} farm{crop.count !== 1 ? 's' : ''}</span>
                    </div>
                  );
                })}
              </div>
              {cropFrequency.length > 5 && (
                <div style={{ color: '#5a7a5a', fontSize: '13px', marginTop: '8px', paddingLeft: '8px' }}>and {cropFrequency.length - 5} more crops...</div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <span style={{ background: '#f1f8f1', border: '1px solid rgba(76,175,80,0.2)', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: '#2e7d2e', cursor: 'pointer' }}
                  onClick={() => navigate('/admin/farms')}>
                  🏆 Most Grown: {mostGrown ? `${mostGrown.emoji} ${mostGrown.name} (${mostGrown.count} farms)` : '—'}
                </span>
                <span style={{ background: '#f1f8f1', border: '1px solid rgba(76,175,80,0.2)', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: '#2e7d2e', cursor: 'pointer' }}
                  onClick={() => navigate('/admin/farms')}>
                  🌱 {mostDiverseFarm ? `${mostDiverseFarm.name} (${mostDiverseFarm.count} crop types)` : '—'}
                </span>
                <span style={{ background: '#f1f8f1', border: '1px solid rgba(76,175,80,0.2)', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: '#2e7d2e' }}>
                  🔍 {cropFrequency.length} unique crop types
                </span>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#5a7a5a', fontSize: '13px' }}>No crop data available</div>
          )}
        </GlowCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
        <GlowCard>
          <div style={{ color: '#1a2e1a', fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Task Completion Timeline</div>
          <div style={{ color: '#5a7a5a', fontSize: '13px', marginBottom: '16px' }}>Tasks completed per week</div>
          {timelineData.length > 0 && timelineData.some((d) => d.completed > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timelineData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,46,26,0.06)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#5a7a5a', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#5a7a5a', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid rgba(76,175,80,0.12)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Bar dataKey="completed" radius={[4, 4, 0, 0]} maxBarSize={50}>
                  {timelineData.map((entry, i) => (
                    <rect key={i} fill={entry.completed > 0 ? '#4caf50' : 'rgba(76,175,80,0.2)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#5a7a5a', fontSize: '13px', flexDirection: 'column', gap: '8px' }}>
              <TrendingUp size={32} color="rgba(90,122,90,0.3)" />
              No completed tasks to show timeline
            </div>
          )}
          <div style={{ display: 'flex', gap: '24px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <div><span style={{ color: '#5a7a5a', fontSize: '12px' }}>Total completed: </span><span style={{ color: '#2e7d2e', fontWeight: 600, fontSize: '14px' }}>{completedTasks}</span></div>
            <div><span style={{ color: '#5a7a5a', fontSize: '12px' }}>Avg per week: </span><span style={{ color: '#2e7d2e', fontWeight: 600, fontSize: '14px' }}>{(completedTasks / 4).toFixed(1)}</span></div>
          </div>
        </GlowCard>

        <GlowCard>
          <div style={{ color: '#1a2e1a', fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>System Health Overview</div>
          <div style={{ color: '#5a7a5a', fontSize: '13px', marginBottom: '16px' }}>Key operational metrics at a glance</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#f8fdf8', border: '1px solid rgba(76,175,80,0.12)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <Bot size={20} color="#2e7d2e" />
              <div style={{ color: '#1a2e1a', fontSize: '24px', fontWeight: 700 }}>{activeRobotsPct}%</div>
              <div style={{ color: '#5a7a5a', fontSize: '12px' }}>Robot Fleet Active</div>
            </div>
            <div style={{ background: '#f8fdf8', border: '1px solid rgba(76,175,80,0.12)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={20} color="#2e7d2e" />
              <div style={{ color: '#1a2e1a', fontSize: '24px', fontWeight: 700 }}>{completionPct}%</div>
              <div style={{ color: '#5a7a5a', fontSize: '12px' }}>Task Completion Rate</div>
            </div>
            <div style={{ background: '#f8fdf8', border: '1px solid rgba(76,175,80,0.12)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <MapPin size={20} color="#2e7d2e" />
              <div style={{ color: '#1a2e1a', fontSize: '24px', fontWeight: 700 }}>{activeFarms} of {farms.length}</div>
              <div style={{ color: '#5a7a5a', fontSize: '12px' }}>Farms Active</div>
            </div>
            <div style={{ background: '#f8fdf8', border: '1px solid rgba(76,175,80,0.12)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <RefreshCw size={20} color="#2e7d2e" />
              <div style={{ color: '#1a2e1a', fontSize: '24px', fontWeight: 700 }}>Active</div>
              <div style={{ color: '#5a7a5a', fontSize: '12px' }}>Data Freshness</div>
            </div>
          </div>
        </GlowCard>
      </div>
    </>
  );
}