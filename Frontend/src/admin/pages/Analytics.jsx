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
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, Bot, MapPin, CheckCircle, UserCheck, Bell,
  Thermometer, Droplets, Radar, Wifi, Activity, Clock,
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

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(76,175,80,0.12)', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}>
      <div style={{ fontWeight: 600, color: '#111827', marginBottom: 2 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, fontWeight: 500 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
}

const percentColor = (pct, hi, mid, lo) => {
  if (pct >= hi) return '#10B981';
  if (pct >= mid) return '#F59E0B';
  return '#EF4444';
};

const badgeStyle = (label, bg, color) => {
  const colors = { green: { bg: 'rgba(16,185,129,0.1)', text: '#10B981' }, amber: { bg: 'rgba(245,158,11,0.1)', text: '#D97706' }, red: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444' }, gray: { bg: 'rgba(156,163,175,0.1)', text: '#6B7280' } };
  const c = colors[label] || colors.gray;
  return { background: c.bg, color: c.text };
};

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function ActionDot(action) {
  const a = (action || '').toLowerCase();
  if (a.includes('add') || a.startsWith('create')) return 'rgba(16,185,129,0.12)';
  if (a.includes('edit') || a.includes('update')) return 'rgba(245,158,11,0.12)';
  if (a.includes('delete') || a.includes('remove')) return 'rgba(239,68,68,0.12)';
  return 'rgba(156,163,175,0.12)';
}

export default function Analytics() {
  const { currentUser } = useAuth();
  const { users } = useUsers();
  const { farms } = useFarms();
  const { robots } = useRobots();
  const { tasks } = useTasks();
  const { employees } = useEmployees();
  const { entries } = useActivityLog();
  const [sortBy, setSortBy] = useState('size');

  const isMasterAdmin = currentUser?.role === 'masterAdmin';

  const activeUsers = users.filter((u) => u.status === 'Active').length;
  const inactiveUsers = users.filter((u) => u.status === 'Inactive').length;
  const activePct = users.length > 0 ? (activeUsers / users.length) * 100 : 0;

  const activeRobots = robots.filter((r) => r.status === 'Active').length;
  const idleRobots = robots.filter((r) => r.status === 'Idle').length;
  const offlineRobots = robots.filter((r) => r.status === 'Offline').length;

  const activeFarms = farms.filter((f) => f.status === 'Active').length;
  const idleFarms = farms.filter((f) => f.status === 'Idle').length;
  const inactiveFarms = farms.filter((f) => f.status === 'Inactive').length;

  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const activeEmployees = employees.filter((e) => e.status === 'Active').length;
  const inactiveEmployees = employees.filter((e) => e.status === 'Inactive').length;

  const lowBatt = robots.filter((r) => r.battery < 20).length;
  const overdueTasks = useMemo(() => {
    const now = new Date();
    return tasks.filter((t) => {
      if (t.status === 'Completed') return false;
      return new Date(t.dueDate) < now;
    });
  }, [tasks]);
  const systemAlerts = offlineRobots + overdueTasks.length + lowBatt;

  const farmerRanks = useMemo(() => {
    return users.map((u) => ({
      name: u.name,
      robotCount: robots.filter((r) => r.owner === u.name).length,
      status: u.status,
      joined: u.joined,
    })).filter((f) => f.robotCount > 0 || true).sort((a, b) => b.robotCount - a.robotCount);
  }, [users, robots]);

  const newestFarmer = users.slice().sort((a, b) => new Date(b.joined) - new Date(a.joined))[0];
  const mostFarmsFarmer = users.slice().sort((a, b) => (b.farms || 0) - (a.farms || 0))[0];

  const farmerGrowth = useMemo(() => {
    const sorted = users.slice().sort((a, b) => new Date(a.joined) - new Date(b.joined));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = {};
    sorted.forEach((u) => {
      const d = new Date(u.joined);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    const keys = Object.keys(counts).sort((a, b) => {
      const ma = a.split(' '), mb = b.split(' ');
      return new Date(`${ma[0]} 1, ${ma[1]}`) - new Date(`${mb[0]} 1, ${mb[1]}`);
    });
    let cum = 0;
    return keys.map((k) => { cum += counts[k]; return { label: k, farmers: cum }; });
  }, [users]);

  const robotStatusData = [
    { name: 'Active', value: activeRobots, color: '#22C55E' },
    { name: 'Idle', value: idleRobots, color: '#F59E0B' },
    { name: 'Offline', value: offlineRobots, color: '#EF4444' },
  ];

  const sortedBattery = useMemo(() => {
    return robots.slice().sort((a, b) => a.battery - b.battery);
  }, [robots]);

  const taskStatusData = [
    { name: 'Pending', value: pendingTasks, color: '#F59E0B' },
    { name: 'In Progress', value: inProgressTasks, color: '#3B82F6' },
    { name: 'Completed', value: completedTasks, color: '#10B981' },
  ];

  const taskTypeData = useMemo(() => {
    const types = ['Irrigation', 'Fertilizer', 'Inspection', 'Maintenance'];
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
    return types.map((t, i) => ({
      name: t, count: tasks.filter((x) => x.type === t).length, color: colors[i],
    }));
  }, [tasks]);

  const priorityData = [
    { name: 'High', count: tasks.filter((t) => t.priority === 'High').length, color: '#EF4444' },
    { name: 'Medium', count: tasks.filter((t) => t.priority === 'Medium').length, color: '#F59E0B' },
    { name: 'Low', count: tasks.filter((t) => t.priority === 'Low').length, color: '#10B981' },
  ];
  const maxPriority = Math.max(...priorityData.map((p) => p.count), 1);

  const farmAreaAcres = useMemo(() => {
    return farms.map((f) => {
      const seed = f.name.length + (f.location || '').length;
      const p1 = { lat: 36 + (seed % 8), lng: -(119 + (seed % 5)) };
      const p2 = { lat: 36 + ((seed * 7) % 8), lng: -(119 + ((seed * 3) % 5)) };
      const p3 = { lat: 36 + ((seed * 13) % 8), lng: -(119 + ((seed * 11) % 5)) };
      const acres = parseFloat(computeTriangleAreaAcres(p1, p2, p3));
      return { ...f, acres: Math.round(acres * 10) / 10 };
    });
  }, [farms]);

  const totalArea = farmAreaAcres.reduce((s, f) => s + f.acres, 0);
  const activeArea = farmAreaAcres.filter((f) => f.status === 'Active').reduce((s, f) => s + f.acres, 0);
  const inactiveAreaTotal = farmAreaAcres.filter((f) => f.status !== 'Active').reduce((s, f) => s + f.acres, 0);
  const activeAreaPct = totalArea > 0 ? Math.round((activeArea / totalArea) * 100) : 0;
  const inactiveAreaPct = totalArea > 0 ? Math.round((inactiveAreaTotal / totalArea) * 100) : 0;
  const maxFarmArea = Math.max(...farmAreaAcres.map((f) => f.acres), 1);

  const sortedFarms = useMemo(() => {
    const f = [...farmAreaAcres];
    if (sortBy === 'size') f.sort((a, b) => b.acres - a.acres);
    else if (sortBy === 'status') f.sort((a, b) => a.status.localeCompare(b.status));
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
    const cropEmojis = { wheat: '🌾', barley: '🌾', corn: '🌽', soybeans: '🫘', apples: '🍎', pears: '🍐', rice: '🍚', strawberries: '🍓', tomatoes: '🍅', alfalfa: '🌿', hay: '🌾' };
    return Object.entries(counts).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count,
      emoji: cropEmojis[name] || '🌱',
    })).sort((a, b) => b.count - a.count);
  }, [farms]);

  const mostGrown = cropFrequency.length > 0 ? cropFrequency[0] : null;
  const totalUniqueCrops = cropFrequency.length;

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

  const recentEntries = useMemo(() => entries.slice(0, 10), [entries]);

  return (
    <>
      <div className="mb-6">
        <div className="text-2xl font-bold text-primary">Analytics</div>
        <div className="text-sm text-text-secondary mt-1">Operations intelligence dashboard — real-time metrics from platform data</div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <GlowCard className="glass-card rounded-2xl p-4" style={{ contentVisibility: 'auto' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Total Farmers</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ml-1" style={{ background: 'rgba(76,175,80,0.12)' }}><Users size={14} color="#2e7d2e" /></div>
          </div>
          <div className="text-2xl font-extrabold text-primary">{users.length}</div>
          <div className="text-[10px] mt-0.5" style={{ color: percentColor(activePct, 80, 50, 0) }}>{activeUsers} Active · {inactiveUsers} Inactive</div>
        </GlowCard>
        <GlowCard className="glass-card rounded-2xl p-4" style={{ contentVisibility: 'auto' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Robots Deployed</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ml-1" style={{ background: 'rgba(76,175,80,0.12)' }}><Bot size={14} color="#2e7d2e" /></div>
          </div>
          <div className="text-2xl font-extrabold text-primary">{robots.length}</div>
          <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{activeRobots} Active · {idleRobots} Idle · {offlineRobots} Offline</div>
          {offlineRobots > 0 && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold mt-1" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>⚠ {offlineRobots} offline</span>}
        </GlowCard>
        <GlowCard className="glass-card rounded-2xl p-4" style={{ contentVisibility: 'auto' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Farms Managed</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ml-1" style={{ background: 'rgba(76,175,80,0.12)' }}><MapPin size={14} color="#2e7d2e" /></div>
          </div>
          <div className="text-2xl font-extrabold text-primary">{farms.length}</div>
          <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{activeFarms} Active · {idleFarms} Idle · {inactiveFarms} Inactive</div>
        </GlowCard>
        <GlowCard className="glass-card rounded-2xl p-4" style={{ contentVisibility: 'auto' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Task Completion</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ml-1" style={{ background: 'rgba(76,175,80,0.12)' }}><CheckCircle size={14} color="#2e7d2e" /></div>
          </div>
          <div className="flex items-center gap-2">
            <svg width="30" height="30" viewBox="0 0 30 30">
              <circle cx="15" cy="15" r="12" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="3" />
              <circle cx="15" cy="15" r="12" fill="none" stroke={percentColor(completionRate, 70, 40, 0)} strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${(completionRate / 100) * 75.4} 75.4`} transform="rotate(-90 15 15)" style={{ transition: 'stroke-dashoffset 0.4s ease' }} />
            </svg>
            <div className="text-2xl font-extrabold text-primary">{completionRate}%</div>
          </div>
          <div className="text-[10px] mt-0.5 text-text-secondary">{completedTasks} of {totalTasks} tasks completed</div>
        </GlowCard>
        <GlowCard className="glass-card rounded-2xl p-4" style={{ contentVisibility: 'auto' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Total Employees</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ml-1" style={{ background: 'rgba(76,175,80,0.12)' }}><UserCheck size={14} color="#2e7d2e" /></div>
          </div>
          <div className="text-2xl font-extrabold text-primary">{employees.length}</div>
          <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{activeEmployees} Active · {inactiveEmployees} Inactive</div>
        </GlowCard>
        <GlowCard className="glass-card rounded-2xl p-4" style={{ contentVisibility: 'auto' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">System Alerts</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ml-1" style={{ background: systemAlerts > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)' }}><Bell size={14} color={systemAlerts > 0 ? '#EF4444' : '#10B981'} /></div>
          </div>
          <div className="text-2xl font-extrabold text-primary" style={{ color: systemAlerts > 0 ? '#EF4444' : '#10B981' }}>{systemAlerts > 0 ? systemAlerts : 0}</div>
          {systemAlerts > 0 ? (
            <div className="text-[10px] mt-0.5" style={{ color: '#EF4444' }}>{offlineRobots} offline · {overdueTasks.length} overdue · {lowBatt} low battery</div>
          ) : (
            <div className="text-[10px] mt-0.5" style={{ color: '#10B981' }}>✓ All Systems Normal</div>
          )}
        </GlowCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="text-sm font-semibold text-primary mb-3">Fleet Status Overview</div>
          <div className="relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={robotStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" strokeWidth={0}>
                  {robotStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={30} formatter={(val) => <span style={{ color: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 500 }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-extrabold leading-none mb-0.5 text-primary">{robots.length}</div>
                <div className="text-[10px] text-text-secondary">Total</div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 text-xs mt-1">
            {robotStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: item.color }} />
                <span className="text-text-secondary">{item.name}</span>
                <span className="font-semibold text-primary">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 px-3 py-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5" style={{ background: offlineRobots > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', color: offlineRobots > 0 ? '#EF4444' : '#10B981' }}>
            {offlineRobots > 0 ? `⚠ ${offlineRobots} robot(s) need attention` : '✓ Full fleet operational'}
          </div>
        </GlowCard>

        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="text-sm font-semibold text-primary mb-3">Battery Health — All Robots</div>
          <div className="space-y-2.5">
            {sortedBattery.map((r) => {
              const barColor = r.battery >= 50 ? '#10B981' : r.battery >= 20 ? '#F59E0B' : '#EF4444';
              return (
                <div key={r.id}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[11px] font-semibold text-primary truncate">{r.name}</span>
                      {r.battery < 20 && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>⚠ LOW</span>}
                    </div>
                    <span className="text-[11px] font-bold shrink-0 ml-2" style={{ color: barColor }}>{r.battery}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'rgba(0,0,0,0.05)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${r.battery}%`, background: barColor }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-[10px] text-text-secondary">{robots.filter((r) => r.battery < 30).length} robots need charging soon</div>
        </GlowCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="text-sm font-semibold text-primary mb-3">Farmers Onboarded Over Time</div>
          {farmerGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={farmerGrowth} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--color-text-secondary)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--color-text-secondary)', fontWeight: 600 }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="farmers" stroke="#4caf50" strokeWidth={2.5} dot={{ r: 3, fill: '#4caf50', stroke: '#fff', strokeWidth: 1.5 }} activeDot={{ r: 5, fill: '#4caf50', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-[180px] text-sm text-text-secondary">No farmer growth data</div>}
          <div className="flex justify-between mt-3 pt-3 border-t text-[10px]" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
            <div><span className="text-text-secondary">Newest Farmer:</span> <span className="font-semibold text-primary">{newestFarmer?.name || '—'}</span> — joined {newestFarmer?.joined || '—'}</div>
            <div><span className="text-text-secondary">Most Farms:</span> <span className="font-semibold text-primary">{mostFarmsFarmer?.name || '—'}</span> — {mostFarmsFarmer?.farms || 0} farms</div>
          </div>
        </GlowCard>

        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="text-sm font-semibold text-primary mb-3">Top Farmers by Robot Count</div>
          <div className="relative flex items-center justify-center mb-2">
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={[{ name: 'Active', value: activeUsers }, { name: 'Inactive', value: inactiveUsers }]} cx="50%" cy="50%" innerRadius={32} outerRadius={48} dataKey="value" strokeWidth={0}>
                  <Cell fill="#22C55E" /><Cell fill="#EF4444" />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-base font-extrabold leading-none mb-0.5 text-primary">{users.length}</div>
                <div className="text-[8px] text-text-secondary">Farmers</div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 text-[10px] mb-3">
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }} /> Active <span className="font-semibold text-primary">{activeUsers}</span></div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: '#EF4444' }} /> Inactive <span className="font-semibold text-primary">{inactiveUsers}</span></div>
          </div>
          <div className="space-y-1.5">
            {farmerRanks.slice(0, 5).map((f, i) => (
              <div key={f.name} className="flex items-center gap-2 px-2 py-1.5 rounded-md" style={{ background: i % 2 === 0 ? 'rgba(76,175,80,0.04)' : 'transparent' }}>
                <span className="text-[10px] font-bold text-text-secondary min-w-[14px]">#{i + 1}</span>
                <span className="text-[11px] font-semibold text-primary flex-1 truncate">{f.name}</span>
                <span className="text-[11px] font-bold text-text-secondary">{f.robotCount} robot{f.robotCount !== 1 ? 's' : ''}</span>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: f.status === 'Active' ? '#10B981' : '#EF4444' }} />
              </div>
            ))}
          </div>
        </GlowCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="text-sm font-semibold text-primary mb-3">Task Status Breakdown</div>
          <div className="relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" strokeWidth={0}>
                  {taskStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={30} formatter={(val) => <span style={{ color: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 500 }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-extrabold leading-none mb-0.5 text-primary">{totalTasks}</div>
                <div className="text-[10px] text-text-secondary">Total</div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 text-xs mt-1">
            {taskStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: item.color }} />
                <span className="text-text-secondary">{item.name}</span>
                <span className="font-semibold text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </GlowCard>

        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="text-sm font-semibold text-primary mb-3">Task Type & Priority</div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={taskTypeData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-text-secondary)', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--color-text-secondary)', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {taskTypeData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 pt-3 border-t space-y-1.5" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
            {priorityData.map((p) => (
              <div key={p.name} className="flex items-center gap-2">
                <span className="text-[11px] min-w-[10px]">{p.name === 'High' ? '🔴' : p.name === 'Medium' ? '🟡' : '🟢'}</span>
                <span className="text-[10px] font-semibold text-text-secondary min-w-[44px]">{p.name}</span>
                <div className="flex-1 h-3 rounded-full" style={{ background: 'rgba(0,0,0,0.05)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${(p.count / maxPriority) * 100}%`, background: p.color }} />
                </div>
                <span className="text-[10px] font-bold text-primary min-w-[20px] text-right">{p.count}</span>
              </div>
            ))}
          </div>
        </GlowCard>
      </div>

      <div className="mb-6 px-4 py-3 rounded-xl flex items-center gap-2 text-[12px] font-medium" style={{ background: overdueTasks.length > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.08)', color: overdueTasks.length > 0 ? '#D97706' : '#10B981' }}>
        {overdueTasks.length > 0 ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 w-full">
            <span>⚠ {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''}:</span>
            {overdueTasks.slice(0, 5).map((t) => {
              const daysOver = Math.floor((Date.now() - new Date(t.dueDate).getTime()) / 86400000);
              return (
                <span key={t.id} className="text-[11px]">
                  <span className="font-semibold text-primary">{t.title}</span>
                  <span className="text-text-secondary"> → {t.assignedTo} → {t.farm} </span>
                  <span style={{ color: '#EF4444' }}>({daysOver}d overdue)</span>
                </span>
              );
            })}
            {overdueTasks.length > 5 && <span className="font-semibold" style={{ color: '#D97706' }}>+{overdueTasks.length - 5} more</span>}
          </div>
        ) : (
          <span>✓ All tasks are on track — no overdue tasks</span>
        )}
      </div>

      <GlowCard className="glass-card rounded-2xl p-5 mb-4" style={{ contentVisibility: 'auto' }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-1">🌍</div>
            <div className="text-xl font-extrabold text-primary">{totalArea.toFixed(1)} <span className="text-xs font-medium text-text-secondary">Est. Acres</span></div>
            <div className="text-[10px] text-text-secondary mt-0.5">Total Land Managed</div>
            <div className="text-[8px] text-text-secondary mt-0.5" title="Based on 3-point boundary approximation">Based on 3-point boundary approximation</div>
          </div>
          <div className="text-center sm:border-x" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <div className="text-2xl mb-1">🟢</div>
            <div className="text-xl font-extrabold text-primary">{activeArea.toFixed(1)} <span className="text-xs font-medium text-text-secondary">Est. Acres</span></div>
            <div className="text-[10px] text-text-secondary mt-0.5">Active Land · {activeAreaPct}% of total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">💤</div>
            <div className="text-xl font-extrabold text-primary">{inactiveAreaTotal.toFixed(1)} <span className="text-xs font-medium text-text-secondary">Est. Acres</span></div>
            <div className="text-[10px] text-text-secondary mt-0.5">Idle/Offline Land · {inactiveAreaPct}% of total</div>
          </div>
        </div>
      </GlowCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-primary">Farm Portfolio</span>
            <div className="flex gap-1">
              {['size', 'status', 'owner'].map((s) => (
                <button key={s} onClick={() => setSortBy(s)}
                  style={{ padding: '3px 10px', fontSize: '9px', fontWeight: 600, border: 'none', borderRadius: '4px', cursor: 'pointer', background: sortBy === s ? '#142E1C' : 'rgba(0,0,0,0.04)', color: sortBy === s ? '#FFFFFF' : '#5A7A5A', transition: 'all 0.15s ease', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 max-h-[360px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {sortedFarms.map((f) => {
              const barW = (f.acres / maxFarmArea) * 100;
              const robotCount = robots.filter((r) => r.farm === f.name).length;
              return (
                <div key={f.name} className="p-2.5 rounded-lg transition-all hover:bg-[rgba(76,175,80,0.04)]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: f.status === 'Active' ? '#10B981' : f.status === 'Idle' ? '#F59E0B' : '#EF4444' }} />
                    <span className="text-[12px] font-semibold text-primary">{f.name}</span>
                    <span className="text-[10px] text-text-secondary">{f.owner}</span>
                  </div>
                  <div className="h-1.5 rounded-full mb-1" style={{ background: 'rgba(0,0,0,0.04)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${barW}%`, background: '#4caf50' }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-text-secondary">{f.location || f.soil}</span>
                    <span className="font-medium text-primary">{robotCount} robot{robotCount !== 1 ? 's' : ''} · {f.acres} Est. Acres</span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlowCard>

        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="text-sm font-semibold text-primary mb-3">Crop Intelligence</div>
          {cropFrequency.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(160, cropFrequency.length * 28)}>
              <BarChart data={cropFrequency} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--color-text-secondary)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-text-primary)', fontWeight: 500 }} axisLine={false} tickLine={false} width={80} tickFormatter={(v) => {
                  const crop = cropFrequency.find((c) => c.name === v);
                  return crop ? `${crop.emoji} ${v}` : v;
                }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
                  {cropFrequency.map((e, i) => (
                    <Cell key={i} fill={['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16', '#06B6D4'][i % 11]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-[160px] text-sm text-text-secondary">No crop data</div>}
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
              🏆 Most Grown: {mostGrown ? `${mostGrown.emoji} ${mostGrown.name} (${mostGrown.count} farms)` : '—'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
              🌱 Most Diverse: {mostDiverseFarm ? `${mostDiverseFarm.name} (${mostDiverseFarm.count} types)` : '—'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>
              🔍 {totalUniqueCrops} different crops
            </span>
          </div>
        </GlowCard>
      </div>

      <GlowCard className="glass-card rounded-2xl p-5 mb-6" style={{ contentVisibility: 'auto' }}>
        <div className="flex items-center gap-2 mb-1">
          <Activity size={16} color="#2e7d2e" />
          <span className="text-sm font-semibold text-primary">Robot Sensor Network</span>
        </div>
        <div className="text-[11px] text-text-secondary mb-4">Live sensor data will appear here once robots are connected to the hardware API</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Thermometer, name: 'DHT11 — Temperature & Humidity', measure: 'Monitors air temperature (°C) and relative humidity (%)' },
            { icon: Droplets, name: 'Soil Moisture Sensor', measure: 'Monitors soil wetness level (0% dry → 100% saturated)' },
            { icon: Radar, name: 'Ultrasonic Distance Sensor', measure: 'Detects obstacles and measures distance (cm)' },
            { icon: Wifi, name: 'WiFi Location Tracker', measure: 'Tracks robot position within assigned farm boundaries' },
          ].map((s) => (
            <div key={s.name} className="rounded-xl p-4 flex flex-col items-center text-center" style={{ border: '1.5px dashed rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.02)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ background: 'rgba(156,163,175,0.1)' }}>
                <s.icon size={18} color="#9CA3AF" />
              </div>
              <div className="text-[11px] font-semibold text-primary mb-1">{s.name}</div>
              <div className="text-[9px] text-text-secondary mb-2">{s.measure}</div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold" style={{ background: 'rgba(156,163,175,0.1)', color: '#9CA3AF' }}>⏳ Awaiting Hardware Connection</span>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-text-secondary italic mt-3 text-center">// TODO: Replace placeholder cards with real sensor readings once hardware API/WebSocket is connected to each robot</div>
      </GlowCard>

      {isMasterAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
            <div className="flex items-center gap-2 mb-4">
              <UserCheck size={16} color="#2e7d2e" />
              <span className="text-sm font-semibold text-primary">Most Active Employees</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(76,175,80,0.12)', color: '#4caf50' }}>{entries.length} actions</span>
            </div>
            {employeeActivity.length > 0 ? (
              <div className="space-y-2">
                {employeeActivity.map((emp, i) => {
                  const pct = Math.round((emp.actions / maxActivity) * 100);
                  return (
                    <div key={emp.name} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg" style={{ background: i % 2 === 0 ? 'rgba(76,175,80,0.04)' : 'transparent' }}>
                      <span className="text-[10px] font-bold text-text-secondary min-w-[16px]">#{i + 1}</span>
                      <span className="text-[11px] font-semibold text-primary flex-1 truncate">{emp.name}</span>
                      <div className="flex-1 max-w-[100px]">
                        <div className="h-2 rounded-full" style={{ background: 'rgba(0,0,0,0.05)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: i === 0 ? '#10B981' : '#4caf50' }} />
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-primary shrink-0">{emp.actions}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[120px] text-sm text-text-secondary">No activity recorded yet</div>
            )}
          </GlowCard>

          <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} color="#2e7d2e" />
              <span className="text-sm font-semibold text-primary">Latest Actions</span>
            </div>
            {recentEntries.length > 0 ? (
              <div className="space-y-1.5 max-h-[360px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                {recentEntries.map((e) => {
                  const dotColor = ActionDot(e.action);
                  const timeStr = relativeTime(e.timestamp);
                  return (
                    <div key={e.id} className="flex items-start gap-2.5 p-2 rounded-lg" style={{ background: 'rgba(76,175,80,0.03)' }}>
                      <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: dotColor }} />
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-semibold text-primary">{e.userName}</span>
                        <span className="text-[10px] text-text-secondary"> {e.action} </span>
                        <span className="text-[10px] font-medium text-primary">{e.target}</span>
                        {e.details && <span className="text-[9px] text-text-secondary"> ({e.details})</span>}
                      </div>
                      <span className="text-[9px] text-text-secondary shrink-0 whitespace-nowrap">{timeStr}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[120px] text-sm text-text-secondary">No recent activity</div>
            )}
          </GlowCard>
        </div>
      )}
    </>
  );
}
