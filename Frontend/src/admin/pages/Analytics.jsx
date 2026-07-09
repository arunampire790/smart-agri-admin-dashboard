import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUsers } from '../../context/UserContext';
import { useFarms } from '../../context/FarmContext';
import { useRobots } from '../../context/RobotContext';
import { useTasks } from '../../context/TaskContext';
import { useEmployees } from '../../context/EmployeeContext';
import { useActivityLog } from '../../context/ActivityLogContext';
import { computeTriangleAreaAcres } from '../../utils/farmArea';
import {
  Bot, Users, CheckCircle, Bell,
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
  const { currentUser } = useAuth();
  const { users } = useUsers();
  const { farms } = useFarms();
  const { robots } = useRobots();
  const { tasks } = useTasks();
  const { employees } = useEmployees();
  const { entries } = useActivityLog();

  const isMasterAdmin = currentUser?.role === 'masterAdmin';

  const activeRobots = robots.filter((r) => r.status === 'Active').length;
  const idleRobots = robots.filter((r) => r.status === 'Idle').length;
  const offlineRobots = robots.filter((r) => r.status === 'Offline').length;

  const activeUsers = users.filter((u) => u.status === 'Active').length;
  const inactiveUsers = users.filter((u) => u.status === 'Inactive').length;
  const activePct = users.length > 0 ? (activeUsers / users.length) * 100 : 0;

  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const totalTasks = tasks.length;
  const completionPct = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const now = new Date();
  const overdueTasks = tasks.filter((t) => t.status !== 'Completed' && new Date(t.dueDate) < now);
  const lowBattRobots = robots.filter((r) => r.battery < 20).length;
  const systemAlerts = offlineRobots + overdueTasks.length + lowBattRobots;

  const sortedRobots = useMemo(() => {
    const priority = (r) => {
      if (r.status === 'Offline') return 0;
      if (r.battery < 20) return 1;
      if (r.status === 'Idle') return 2;
      if (r.battery < 50) return 3;
      return 4;
    };
    return [...robots].sort((a, b) => priority(a) - priority(b));
  }, [robots]);

  const robotDotColor = (r) => {
    if (r.status === 'Offline') return '#EF4444';
    if (r.battery < 20) return '#EF4444';
    if (r.status === 'Idle' || r.battery < 50) return '#F59E0B';
    return '#10B981';
  };

  const activeFarms = farms.filter((f) => f.status === 'Active').length;
  const idleFarmsCount = farms.filter((f) => f.status === 'Idle').length;
  const inactiveFarms = farms.filter((f) => f.status === 'Inactive').length;

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

  const mostActiveFarm = useMemo(() => {
    let best = null, max = 0;
    farms.forEach((f) => {
      const cnt = robots.filter((r) => r.farm === f.name).length;
      if (cnt > max) { max = cnt; best = f; }
    });
    return best;
  }, [farms, robots]);

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
      emoji: cropEmojis[name] || '🌱',
    })).sort((a, b) => b.count - a.count);
  }, [farms]);

  const mostGrown = cropFrequency.length > 0 ? cropFrequency[0] : null;
  const maxCropCount = cropFrequency.length > 0 ? cropFrequency[0].count : 1;

  const recentEntries = useMemo(() => entries.slice(0, 8), [entries]);

  const layer2Subtitle = (pct, hi, mid) => {
    if (pct >= hi) return { color: '#10B981' };
    if (pct >= mid) return { color: '#F59E0B' };
    return { color: '#EF4444' };
  };

  return (
    <>
      <div className="mb-6">
        <div className="text-2xl font-bold text-primary">Analytics</div>
        <div className="text-sm text-text-secondary mt-1">Operations dashboard — live metrics from platform data</div>
      </div>

      <div className="mb-6">
        <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">At a Glance</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <GlowCard className="glass-card rounded-2xl" style={{ contentVisibility: 'auto' }}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Robots Active</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ml-2" style={{ background: 'rgba(76,175,80,0.12)' }}><Bot size={16} color="#2e7d2e" /></div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold" style={{ color: offlineRobots > 0 ? '#EF4444' : idleRobots > 0 ? '#F59E0B' : '#10B981' }}>{activeRobots}</span>
                <span className="text-sm font-medium text-text-secondary">of {robots.length} total</span>
              </div>
              <div className="text-[11px] text-text-secondary mt-1">{idleRobots} idle · {offlineRobots} offline</div>
            </div>
          </GlowCard>
          <GlowCard className="glass-card rounded-2xl" style={{ contentVisibility: 'auto' }}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Total Farmers</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ml-2" style={{ background: 'rgba(76,175,80,0.12)' }}><Users size={16} color="#2e7d2e" /></div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold" style={{ color: layer2Subtitle(activePct, 80, 50).color }}>{users.length}</span>
              </div>
              <div className="text-[11px] mt-1" style={{ color: layer2Subtitle(activePct, 80, 50).color }}>{activeUsers} active · {inactiveUsers} inactive</div>
            </div>
          </GlowCard>
          <GlowCard className="glass-card rounded-2xl" style={{ contentVisibility: 'auto' }}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Tasks Completed</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ml-2" style={{ background: 'rgba(76,175,80,0.12)' }}><CheckCircle size={16} color="#2e7d2e" /></div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold" style={{ color: layer2Subtitle(completionPct, 70, 40).color }}>{completedTasks}</span>
                <span className="text-sm font-medium text-text-secondary">of {totalTasks} total</span>
              </div>
              <div className="text-[11px] text-text-secondary mt-1">{pendingTasks} pending · {inProgressTasks} in progress</div>
            </div>
          </GlowCard>
          <GlowCard className="glass-card rounded-2xl" style={{ contentVisibility: 'auto' }}>
            <div className="p-5" style={systemAlerts > 0 ? { background: 'rgba(239,68,68,0.04)', borderRadius: 'inherit' } : {}}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">System Alerts</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ml-2" style={{ background: systemAlerts > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)' }}>
                  <Bell size={16} color={systemAlerts > 0 ? '#EF4444' : '#10B981'} />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold" style={{ color: systemAlerts > 0 ? '#EF4444' : '#10B981' }}>{systemAlerts}</span>
              </div>
              {systemAlerts > 0 ? (
                <div className="text-[11px] mt-1" style={{ color: '#EF4444' }}>{offlineRobots} offline · {overdueTasks.length} overdue · {lowBattRobots} low battery</div>
              ) : (
                <div className="text-[11px] mt-1" style={{ color: '#10B981' }}>All systems normal ✓</div>
              )}
            </div>
          </GlowCard>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">What Needs Attention?</div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
            <div className="text-sm font-semibold text-primary mb-3">Robot Fleet Health</div>
            <div className="space-y-2">
              {sortedRobots.map((r) => {
                const dot = robotDotColor(r);
                return (
                  <div key={r.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(76,175,80,0.03)' }}>
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: dot }} />
                    <span className="text-[12px] font-semibold text-primary flex-1 truncate">{r.name}</span>
                    {r.status === 'Offline' ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(156,163,175,0.12)', color: '#9CA3AF' }}>Offline</span>
                    ) : (
                      <>
                        <span className="text-[11px] font-bold" style={{ color: r.battery >= 50 ? '#10B981' : r.battery >= 20 ? '#F59E0B' : '#EF4444' }}>{r.battery}%</span>
                        {r.battery < 20 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>⚠ LOW BATTERY</span>}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </GlowCard>

          <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
            <div className="text-sm font-semibold text-primary mb-3">Task Progress Overview</div>
            {totalTasks > 0 && (
              <div className="h-4 rounded-full mb-3 flex overflow-hidden" style={{ background: 'rgba(0,0,0,0.04)' }}>
                {pendingTasks > 0 && <div style={{ flex: pendingTasks, background: '#F59E0B', minWidth: pendingTasks > 0 ? 4 : 0 }} />}
                {inProgressTasks > 0 && <div style={{ flex: inProgressTasks, background: '#3B82F6', minWidth: inProgressTasks > 0 ? 4 : 0 }} />}
                {completedTasks > 0 && <div style={{ flex: completedTasks, background: '#10B981', minWidth: completedTasks > 0 ? 4 : 0 }} />}
              </div>
            )}
            <div className="flex justify-between mb-4">
              <div className="text-center flex-1">
                <div className="text-lg font-extrabold text-primary">{pendingTasks}</div>
                <div className="text-[10px] font-medium" style={{ color: '#F59E0B' }}>Pending</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-lg font-extrabold text-primary">{inProgressTasks}</div>
                <div className="text-[10px] font-medium" style={{ color: '#3B82F6' }}>In Progress</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-lg font-extrabold text-primary">{completedTasks}</div>
                <div className="text-[10px] font-medium" style={{ color: '#10B981' }}>Completed</div>
              </div>
            </div>
            {overdueTasks.length > 0 ? (
              <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.06)' }}>
                <div className="text-[11px] font-semibold mb-1" style={{ color: '#EF4444' }}>⚠ {overdueTasks.length} task{overdueTasks.length !== 1 ? 's' : ''} overdue</div>
                {overdueTasks.slice(0, 3).map((t) => {
                  const days = Math.floor((now - new Date(t.dueDate).getTime()) / 86400000);
                  return (
                    <div key={t.id} className="text-[10px] text-text-secondary truncate">
                      {t.title} · {t.assignedTo} · {days}d overdue
                    </div>
                  );
                })}
                {overdueTasks.length > 3 && <div className="text-[10px] font-semibold mt-0.5" style={{ color: '#EF4444' }}>+{overdueTasks.length - 3} more</div>}
              </div>
            ) : (
              <div className="text-[11px] font-medium px-3 py-2 rounded-lg" style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981' }}>✓ No overdue tasks</div>
            )}
          </GlowCard>

          <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
            <div className="text-sm font-semibold text-primary mb-3">Farm Status Overview</div>
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full" style={{ background: '#10B981' }} />
                <span className="text-2xl font-extrabold text-primary">{activeFarms}</span>
                <span className="text-xs font-medium text-text-secondary">Active</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
                <span className="text-2xl font-extrabold text-primary">{idleFarmsCount}</span>
                <span className="text-xs font-medium text-text-secondary">Idle</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
                <span className="text-2xl font-extrabold text-primary">{inactiveFarms}</span>
                <span className="text-xs font-medium text-text-secondary">Offline</span>
              </div>
            </div>
            <div className="pt-3 border-t text-[11px] text-text-secondary" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
              <div>Managing Est. {totalArea.toFixed(1)} acres across {farms.length} farms</div>
              {mostActiveFarm && (
                <div className="mt-1 font-medium text-primary">
                  Most Active: {mostActiveFarm.name} — {mostActiveFarm.owner}
                </div>
              )}
            </div>
          </GlowCard>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Deeper Insights</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
            <div className="text-sm font-semibold text-primary mb-3">Crops Across All Farms</div>
            {cropFrequency.length > 0 ? (
              <>
                <div className="space-y-2">
                  {cropFrequency.slice(0, 5).map((crop, i) => {
                    const barW = (crop.count / maxCropCount) * 100;
                    return (
                      <div key={crop.name} className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-text-secondary min-w-[18px]">#{i + 1}</span>
                        <span className="text-[13px]">{crop.emoji}</span>
                        <span className="text-[12px] font-semibold text-primary min-w-[80px]">{crop.name}</span>
                        <span className="text-[11px] font-bold text-text-secondary min-w-[20px]">{crop.count}</span>
                        <div className="flex-1 h-2.5 rounded-full" style={{ background: 'rgba(0,0,0,0.04)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${barW}%`, background: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'][i % 5] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {cropFrequency.length > 5 && (
                  <div className="text-[10px] text-text-secondary mt-2">and {cropFrequency.length - 5} more...</div>
                )}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                    🏆 Most Grown: {mostGrown ? `${mostGrown.emoji} ${mostGrown.name}` : '—'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
                    🌱 {cropFrequency.length} unique crop types total
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-sm text-text-secondary">No crop data available</div>
            )}
          </GlowCard>

          {isMasterAdmin ? (
            <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
              <div className="text-sm font-semibold text-primary mb-3">Recent System Activity</div>
              {recentEntries.length > 0 ? (
                <div className="space-y-1 max-h-[340px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                  {recentEntries.map((e) => {
                    const dot = actionDot(e.action);
                    return (
                      <div key={e.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(76,175,80,0.03)' }}>
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dot }} />
                        <span className="text-[11px] font-semibold text-primary min-w-[80px] truncate">{e.userName}</span>
                        <span className="text-[10px] text-text-secondary flex-1 truncate">
                          {e.action} <span className="font-medium text-primary">{e.target}</span>
                        </span>
                        <span className="text-[9px] text-text-secondary shrink-0 whitespace-nowrap">{relativeTime(e.timestamp)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-sm text-text-secondary">No recent activity recorded</div>
              )}
            </GlowCard>
          ) : (
            <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
              <div className="text-sm font-semibold text-primary mb-4">Sensor Network</div>
              <div className="space-y-3">
                {[
                  { name: 'DHT11 — Temperature & Humidity', icon: '🌡️' },
                  { name: 'Soil Moisture Sensor', icon: '💧' },
                  { name: 'Ultrasonic Distance Sensor', icon: '📡' },
                  { name: 'WiFi Location Tracker', icon: '📍' },
                ].map((s) => (
                  <div key={s.name} className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ border: '1.5px dashed rgba(0,0,0,0.1)' }}>
                    <span className="text-base">{s.icon}</span>
                    <span className="text-[11px] font-semibold text-primary flex-1">{s.name}</span>
                    <span className="text-[9px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(156,163,175,0.1)', color: '#9CA3AF' }}>⏳ Awaiting Connection</span>
                  </div>
                ))}
              </div>
              <div className="text-[9px] text-text-secondary italic mt-3">// TODO: Replace with real sensor data once hardware is connected</div>
            </GlowCard>
          )}
        </div>
      </div>
    </>
  );
}
