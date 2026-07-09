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
import { AlertTriangle, AlertCircle, Thermometer, Droplets, Radar, MapPin, ArrowRight } from 'lucide-react';

function GlowCard({ className, style: outerStyle, onClick, children }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={className}
      style={{
        ...outerStyle,
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

const cropEmojis = { wheat: '🌾', barley: '🌾', corn: '🌽', soybeans: '🫘', apples: '🍎', pears: '🍐', rice: '🍚', strawberries: '🍓', tomatoes: '🍅', alfalfa: '🌿', hay: '🌾' };


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
  const taskColors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
  const taskTypeData = taskTypes.map((t, i) => ({
    name: t, count: tasks.filter((x) => x.type === t).length, color: taskColors[i],
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

  const employeeActivity = useMemo(() => {
    const counts = {};
    entries.forEach((e) => {
      const name = e.userName || 'Unknown';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).map(([name, actions]) => ({ name, actions })).sort((a, b) => b.actions - a.actions);
  }, [entries]);
  const maxActivity = employeeActivity.length > 0 ? employeeActivity[0].actions : 1;
  const recentEntries = useMemo(() => entries.slice(0, 5), [entries]);

  return (
    <>
      <div className="mb-6">
        <div className="text-2xl font-bold text-primary">Analytics</div>
        <div className="text-sm text-text-secondary mt-1">Command center — deeper insights not shown on the Dashboard</div>
      </div>

      <GlowCard className="glass-card rounded-2xl mb-6" style={{ contentVisibility: 'auto' }}>
        <div className="p-5">
          <div className="flex items-center gap-1 mb-3">
            <AlertTriangle size={16} color={hasAlerts ? '#EF4444' : '#10B981'} />
            <span className="text-sm font-semibold text-primary">System Alerts</span>
            {hasAlerts && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>Needs attention</span>}
          </div>
          {!hasAlerts ? (
            <div className="px-4 py-3 rounded-xl text-[12px] font-medium" style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981' }}>
              ✓ All Systems Normal — No alerts at this time
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-3 mb-4">
                {offlineRobots.length > 0 && (
                  <div onClick={() => navigate('/admin/robots')} className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all hover:translate-y-[-1px]" style={{ background: 'rgba(239,68,68,0.1)' }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: '#EF4444' }} />
                    <span className="text-lg font-extrabold" style={{ color: '#EF4444' }}>{offlineRobots.length}</span>
                    <span className="text-[11px] font-semibold" style={{ color: '#EF4444' }}>Robots Offline</span>
                  </div>
                )}
                {lowBattRobots.length > 0 && (
                  <div onClick={() => navigate('/admin/robots')} className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all hover:translate-y-[-1px]" style={{ background: 'rgba(245,158,11,0.1)' }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }} />
                    <span className="text-lg font-extrabold" style={{ color: '#F59E0B' }}>{lowBattRobots.length}</span>
                    <span className="text-[11px] font-semibold" style={{ color: '#F59E0B' }}>Low Battery</span>
                  </div>
                )}
                {overdueTasks.length > 0 && (
                  <div onClick={() => navigate('/admin/tasks')} className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all hover:translate-y-[-1px]" style={{ background: 'rgba(239,68,68,0.08)' }}>
                    <AlertCircle size={16} color="#EF4444" />
                    <span className="text-lg font-extrabold" style={{ color: '#EF4444' }}>{overdueTasks.length}</span>
                    <span className="text-[11px] font-semibold" style={{ color: '#EF4444' }}>Overdue Tasks</span>
                  </div>
                )}
              </div>
              {offlineRobots.length > 0 && (
                <div className="mb-2">
                  <div className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1">Offline Robots</div>
                  {offlineRobots.map((r) => (
                    <Clickable key={r.id} onClick={() => navigate('/admin/robots')} showArrow>
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#EF4444' }} />
                      <span className="text-[12px] font-semibold text-primary">{r.name}</span>
                      <span className="text-[10px] text-text-secondary">· Offline · Assigned: {r.farm}</span>
                      <span className="text-[10px] font-medium shrink-0 ml-auto" style={{ color: '#EF4444' }}>View Robot</span>
                    </Clickable>
                  ))}
                </div>
              )}
              {lowBattRobots.length > 0 && (
                <div className="mb-2">
                  <div className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1">Low Battery Robots</div>
                  {lowBattRobots.map((r) => (
                    <Clickable key={r.id} onClick={() => navigate('/admin/robots')} showArrow>
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#F59E0B' }} />
                      <span className="text-[12px] font-semibold text-primary">{r.name}</span>
                      <span className="text-[10px] text-text-secondary">· {r.battery}% battery · Assigned: {r.farm}</span>
                      <span className="text-[10px] font-semibold shrink-0 ml-auto" style={{ color: '#F59E0B' }}>View Robot</span>
                    </Clickable>
                  ))}
                </div>
              )}
              {overdueTasks.length > 0 && (
                <div className="mb-1">
                  <div className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1">Overdue Tasks</div>
                  {overdueTasks.slice(0, 5).map((t) => {
                    const days = Math.floor((now - new Date(t.dueDate).getTime()) / 86400000);
                    return (
                      <Clickable key={t.id} onClick={() => navigate('/admin/tasks')} showArrow>
                        <AlertCircle size={12} color="#EF4444" className="shrink-0" />
                        <span className="text-[12px] font-semibold text-primary">{t.title}</span>
                        <span className="text-[10px] text-text-secondary">· {t.assignedTo} · {t.farm}</span>
                        <span className="text-[10px] font-medium shrink-0 ml-auto" style={{ color: '#EF4444' }}>{days}d overdue</span>
                      </Clickable>
                    );
                  })}
                  {overdueTasks.length > 5 && (
                    <div className="text-[10px] font-semibold mt-1 px-2" style={{ color: '#D97706' }}>+{overdueTasks.length - 5} more overdue tasks</div>
                  )}
                </div>
              )}
              <div className="text-[9px] text-text-secondary italic mt-3">Click any alert to navigate directly to the issue</div>
            </>
          )}
        </div>
      </GlowCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-primary">Robot Battery Health</span>
            <span className="text-[10px] text-text-secondary">Click any robot to view details →</span>
          </div>
          <div className="text-[10px] text-text-secondary mb-3">Full fleet — sorted by battery (lowest first)</div>
          <div className="space-y-2">
            {sortedBattery.map((r) => {
              const barColor = r.battery < 20 ? '#EF4444' : r.battery < 50 ? '#F59E0B' : '#10B981';
              const statusLabel = r.battery < 20 ? '⚠ CRITICAL' : r.battery < 50 ? 'Low' : r.battery < 80 ? 'Good' : 'Excellent';
              return (
                <Clickable key={r.id} onClick={() => navigate('/admin/robots')} showArrow>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: barColor }} />
                  <span className="text-[12px] font-semibold text-primary min-w-[90px]">{r.name}</span>
                  <div className="flex-1 max-w-[120px] h-2 rounded-full" style={{ background: 'rgba(0,0,0,0.04)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${r.battery}%`, background: barColor }} />
                  </div>
                  <span className="text-[11px] font-bold min-w-[32px] text-right" style={{ color: barColor }}>{r.battery}%</span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0" style={{
                    background: r.battery < 20 ? 'rgba(239,68,68,0.1)' : r.battery < 50 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                    color: barColor,
                  }}>{statusLabel}</span>
                </Clickable>
              );
            })}
          </div>
          <div onClick={() => navigate('/admin/robots')} className="mt-3 pt-3 border-t text-[11px] font-medium cursor-pointer transition-all hover:translate-y-[-1px]" style={{ borderColor: 'rgba(0,0,0,0.05)', color: '#F59E0B' }}>
            {robots.filter((r) => r.battery < 50).length} robots need charging soon →
          </div>
        </GlowCard>

        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-primary">Task Analysis</span>
            <span className="text-[10px] text-text-secondary">Click any item to view tasks →</span>
          </div>
          <div className="text-[10px] text-text-secondary mb-3">Breakdown by type and priority</div>
          <div className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">By Type</div>
          <div className="space-y-1.5 mb-3">
            {taskTypeData.map((t) => (
              <Clickable key={t.name} onClick={() => navigate('/admin/tasks')} showArrow>
                <span className="text-[11px] font-semibold text-primary min-w-[80px]">{t.name}</span>
                <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(0,0,0,0.04)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${(t.count / maxTaskTypeCount) * 100}%`, background: t.color }} />
                </div>
                <span className="text-[11px] font-bold text-primary min-w-[18px] text-right">{t.count}</span>
                <span className="text-[10px] text-text-secondary shrink-0">tasks</span>
              </Clickable>
            ))}
          </div>
          <div className="pt-2 border-t" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
            <div className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">By Priority</div>
            <div className="space-y-1.5">
              {[
                { name: 'High', count: highCount, color: '#EF4444', emoji: '🔴' },
                { name: 'Medium', count: medCount, color: '#F59E0B', emoji: '🟡' },
                { name: 'Low', count: lowCount, color: '#10B981', emoji: '🟢' },
              ].map((p) => (
                <Clickable key={p.name} onClick={() => navigate('/admin/tasks')} showArrow>
                  <span className="text-[11px]">{p.emoji}</span>
                  <span className="text-[11px] font-semibold text-primary min-w-[50px]">{p.name}</span>
                  <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(0,0,0,0.04)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${(p.count / maxPriority) * 100}%`, background: p.color }} />
                  </div>
                  <span className="text-[11px] font-bold text-primary min-w-[36px] text-right">{p.count} tasks</span>
                </Clickable>
              ))}
            </div>
          </div>
          <div onClick={() => navigate('/admin/tasks')} className="mt-3 pt-3 border-t text-[11px] font-medium cursor-pointer transition-all hover:translate-y-[-1px]" style={{ borderColor: 'rgba(0,0,0,0.05)', color: '#2e7d2e' }}>
            {totalTasks} total tasks · {completionPct}% completion rate →
          </div>
        </GlowCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-primary">Farm Portfolio</span>
            <div className="flex gap-1">
              {['size', 'status', 'owner'].map((s) => (
                <button key={s} onClick={() => setSortBy(s)}
                  style={{ padding: '2px 8px', fontSize: '9px', fontWeight: 600, border: 'none', borderRadius: '4px', cursor: 'pointer', background: sortBy === s ? '#142E1C' : 'rgba(0,0,0,0.04)', color: sortBy === s ? '#FFFFFF' : '#5A7A5A', textTransform: 'uppercase', letterSpacing: '0.03em', transition: 'all 0.15s ease' }}>
                  {s} ↕
                </button>
              ))}
            </div>
          </div>
          <div className="text-[10px] text-text-secondary mb-3">Click any farm to view details →</div>
          <div className="grid grid-cols-3 gap-2 mb-4 p-3 rounded-lg text-center" style={{ background: 'rgba(76,175,80,0.03)' }}>
            <div>
              <div className="text-[15px]">🌍</div>
              <div className="text-sm font-extrabold text-primary">{totalArea.toFixed(1)}</div>
              <div className="text-[8px] text-text-secondary">Est. acres</div>
            </div>
            <div className="border-x" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
              <div className="text-[15px]">🟢</div>
              <div className="text-sm font-extrabold text-primary">{activeArea.toFixed(1)}</div>
              <div className="text-[8px] text-text-secondary">Active</div>
            </div>
            <div>
              <div className="text-[15px]">💤</div>
              <div className="text-sm font-extrabold text-primary">{idleArea.toFixed(1)}</div>
              <div className="text-[8px] text-text-secondary">Idle</div>
            </div>
          </div>
          <div className="text-[8px] text-text-secondary mb-3 text-center" title="Based on 3-point boundary approximation">Est. Acres based on 3-point boundary approximation</div>
          <div className="space-y-1.5 max-h-[280px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {sortedFarms.map((f) => {
              const barW = (f.acres / maxFarmArea) * 100;
              const robotCount = robots.filter((r) => r.farm === f.name).length;
              return (
                <Clickable key={f.name} onClick={() => navigate('/admin/farms')} showArrow>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: f.status === 'Active' ? '#10B981' : f.status === 'Idle' ? '#F59E0B' : '#EF4444' }} />
                      <span className="text-[12px] font-semibold text-primary truncate">{f.name}</span>
                      <span className="text-[10px] text-text-secondary truncate">{f.owner}</span>
                    </div>
                    <div className="h-1.5 rounded-full mb-0.5" style={{ background: 'rgba(0,0,0,0.04)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${barW}%`, background: '#4caf50' }} />
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-text-secondary">
                      <span>{f.location || f.soil}</span>
                      <span>· {f.acres.toFixed(1)} Est. acres</span>
                      <span>· {robotCount} robot{robotCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </Clickable>
              );
            })}
          </div>
        </GlowCard>

        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="text-sm font-semibold text-primary mb-1">Crops Across All Farms</div>
          <div className="text-[10px] text-text-secondary mb-3">What our farmers are growing</div>
          {cropFrequency.length > 0 ? (
            <>
              <div className="space-y-2">
                {cropFrequency.slice(0, 5).map((crop, i) => {
                  const barW = (crop.count / maxCropCount) * 100;
                  return (
                    <Clickable key={crop.name} onClick={() => navigate('/admin/farms')} showArrow>
                      <span className="text-[11px] font-bold text-text-secondary min-w-[18px]">#{i + 1}</span>
                      <span className="text-[13px]">{crop.emoji}</span>
                      <span className="text-[12px] font-semibold text-primary min-w-[80px]">{crop.name}</span>
                      <div className="flex-1 h-2.5 rounded-full" style={{ background: 'rgba(0,0,0,0.04)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${barW}%`, background: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'][i % 5] }} />
                      </div>
                      <span className="text-[11px] font-bold text-primary min-w-[40px] text-right">{crop.count} farm{crop.count !== 1 ? 's' : ''}</span>
                    </Clickable>
                  );
                })}
              </div>
              {cropFrequency.length > 5 && (
                <div className="text-[10px] text-text-secondary mt-1 px-2">and {cropFrequency.length - 5} more crops...</div>
              )}
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                <span onClick={() => navigate('/admin/farms')} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer transition-all hover:translate-y-[-1px]" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                  🏆 Most Grown: {mostGrown ? `${mostGrown.emoji} ${mostGrown.name} (${mostGrown.count} farms)` : '—'}
                </span>
                <span onClick={() => navigate('/admin/farms')} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer transition-all hover:translate-y-[-1px]" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
                  🌱 {mostDiverseFarm ? `${mostDiverseFarm.name} (${mostDiverseFarm.count} crop types)` : '—'}
                </span>
                <span onClick={() => navigate('/admin/farms')} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer transition-all hover:translate-y-[-1px]" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>
                  🔍 {cropFrequency.length} unique crop types
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-sm text-text-secondary">No crop data available</div>
          )}
        </GlowCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isMasterAdmin ? (
          <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-primary">Team Activity</span>
              <span className="text-[10px] text-text-secondary">Click any employee to view →</span>
            </div>
            {employeeActivity.length > 0 ? (
              <>
                <div className="space-y-1.5 mb-3">
                  {employeeActivity.map((emp, i) => {
                    const pct = (emp.actions / maxActivity) * 100;
                    return (
                      <Clickable key={emp.name} onClick={() => navigate('/admin/employees')} showArrow>
                        <span className="text-[10px] font-bold text-text-secondary min-w-[16px]">#{i + 1}</span>
                        <span className="text-[11px] font-semibold text-primary min-w-[100px] truncate">{emp.name}</span>
                        <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(0,0,0,0.04)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: i === 0 ? '#10B981' : '#4caf50' }} />
                        </div>
                        <span className="text-[11px] font-bold text-primary min-w-[20px] text-right">{emp.actions}</span>
                      </Clickable>
                    );
                  })}
                </div>
                <div className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Latest</div>
                <div className="space-y-0.5">
                  {recentEntries.map((e) => (
                    <Clickable key={e.id} onClick={() => navigate('/admin/employees')} showArrow>
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: actionDot(e.action) }} />
                      <span className="text-[10px] font-semibold text-primary min-w-[60px] truncate">{e.userName.split(' ')[0]}</span>
                      <span className="text-[10px] text-text-secondary flex-1 truncate">
                        {e.action} <span className="font-medium text-primary">{e.target}</span>
                      </span>
                      <span className="text-[8px] text-text-secondary shrink-0 whitespace-nowrap">{relativeTime(e.timestamp)}</span>
                    </Clickable>
                  ))}
                </div>
                <div onClick={() => navigate('/admin/employees')} className="mt-3 pt-3 border-t text-[11px] font-medium cursor-pointer transition-all hover:translate-y-[-1px]" style={{ borderColor: 'rgba(0,0,0,0.05)', color: '#2e7d2e' }}>
                  View full audit log →
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-sm text-text-secondary">No activity recorded yet</div>
            )}
          </GlowCard>
        ) : (
          <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
            <div className="text-sm font-semibold text-primary mb-1">Sensor Network</div>
            <div className="text-[10px] text-text-secondary mb-3">Sensors are assigned per robot — data available once hardware is connected</div>
            <div className="space-y-2">
              {[
{ icon: Thermometer, name: 'DHT11 — Temperature & Humidity', measure: 'Air temp (°C) and relative humidity (%)' },
              { icon: Droplets, name: 'Soil Moisture Sensor', measure: 'Soil wetness (0% dry — 100% saturated)' },
              { icon: Radar, name: 'Ultrasonic Distance Sensor', measure: 'Obstacle detection and distance (cm)' },
              { icon: MapPin, name: 'WiFi Location Tracker', measure: 'Robot position within farm boundaries' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.name} className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ border: '1.5px dashed rgba(0,0,0,0.1)' }}>
                  <Icon size={16} color="#9CA3AF" className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-primary truncate">{s.name}</div>
                    <div className="text-[9px] text-text-secondary truncate">{s.measure}</div>
                  </div>
                  <span className="text-[8px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(156,163,175,0.1)', color: '#9CA3AF' }}>
                    ⏳ Awaiting Connection
                  </span>
                </div>
              );
            })}
          </div>
          <div className="text-[9px] text-text-secondary italic mt-3">Sensor readings will appear here automatically once robots are connected to the hardware API</div>
        </GlowCard>
      )}

        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="text-sm font-semibold text-primary mb-1">Sensor Network</div>
          <div className="text-[10px] text-text-secondary mb-3">Sensors are assigned per robot — data available once hardware is connected</div>
          <div className="space-y-2">
            {[
              { icon: Thermometer, name: 'DHT11 — Temperature & Humidity', measure: 'Air temp (°C) and relative humidity (%)' },
              { icon: Droplets, name: 'Soil Moisture Sensor', measure: 'Soil wetness (0% dry — 100% saturated)' },
              { icon: Radar, name: 'Ultrasonic Distance Sensor', measure: 'Obstacle detection and distance (cm)' },
              { icon: MapPin, name: 'WiFi Location Tracker', measure: 'Robot position within farm boundaries' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.name} className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ border: '1.5px dashed rgba(0,0,0,0.1)' }}>
                  <Icon size={16} color="#9CA3AF" className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-primary truncate">{s.name}</div>
                    <div className="text-[9px] text-text-secondary truncate">{s.measure}</div>
                  </div>
                  <span className="text-[8px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(156,163,175,0.1)', color: '#9CA3AF' }}>
                    ⏳ Awaiting Connection
                  </span>
                </div>
              );
            })}
          </div>
          <div className="text-[9px] text-text-secondary italic mt-3">// TODO: Replace placeholder rows with real sensor data from hardware API/WebSocket once connected</div>
        </GlowCard>
      </div>
    </>
  );
}