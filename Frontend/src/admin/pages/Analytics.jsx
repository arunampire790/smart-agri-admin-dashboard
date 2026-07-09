import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUsers } from '../../context/UserContext';
import { useFarms } from '../../context/FarmContext';
import { useRobots } from '../../context/RobotContext';
import { useTasks } from '../../context/TaskContext';
import { useEmployees } from '../../context/EmployeeContext';
import { useActivityLog } from '../../context/ActivityLogContext';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, MapPin, CheckCircle, Bot, ClipboardList, Activity,
} from 'lucide-react';

const sectorData = [
  { name: 'Sector A', nutrients: { nitrogen: { value: 72, status: 'Good' }, phosphorus: { value: 85, status: 'Good' }, potassium: { value: 64, status: 'Good' } } },
  { name: 'Sector B', nutrients: { nitrogen: { value: 28, status: 'Low' }, phosphorus: { value: 55, status: 'Good' }, potassium: { value: 90, status: 'Too High' } } },
  { name: 'Sector C', nutrients: { nitrogen: { value: 65, status: 'Good' }, phosphorus: { value: 30, status: 'Low' }, potassium: { value: 70, status: 'Good' } } },
  { name: 'Sector D', nutrients: { nitrogen: { value: 80, status: 'Good' }, phosphorus: { value: 78, status: 'Good' }, potassium: { value: 55, status: 'Good' } } },
];

const nutrientStatusColor = (status) => {
  switch (status) {
    case 'Good': return { bg: 'rgba(76,175,80,0.12)', text: '#4caf50', dot: '#4caf50' };
    case 'Low': return { bg: 'rgba(239,68,68,0.12)', text: '#EF4444', dot: '#EF4444' };
    case 'Too High': return { bg: 'rgba(217,119,6,0.12)', text: '#D97706', dot: '#D97706' };
    default: return { bg: 'rgba(76,175,80,0.12)', text: '#4caf50', dot: '#4caf50' };
  }
};

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

function StatCard({ label, value, subtitle, icon: Icon, onClick }) {
  return (
    <GlowCard onClick={onClick} className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
      <div className="relative z-10 flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-secondary mb-2">{label}</div>
          <div className="text-3xl font-extrabold mb-1" style={{ color: 'var(--color-text-primary)' }}>{value}</div>
          <div className="text-[11px] leading-relaxed text-text-secondary truncate">{subtitle}</div>
        </div>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ml-3" style={{ background: 'rgba(76,175,80,0.12)' }}>
          <Icon size={18} color="#2e7d2e" />
        </div>
      </div>
    </GlowCard>
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

export default function Analytics() {
  const { currentUser } = useAuth();
  const { users } = useUsers();
  const { farms } = useFarms();
  const { robots } = useRobots();
  const { tasks } = useTasks();
  const { employees } = useEmployees();
  const { entries } = useActivityLog();

  const isMasterAdmin = currentUser?.role === 'masterAdmin';

  const activeUsers = users.filter((u) => u.status === 'Active').length;
  const inactiveUsers = users.filter((u) => u.status === 'Inactive').length;

  const activeFarms = farms.filter((f) => f.status === 'Active').length;
  const inactiveFarms = farms.filter((f) => f.status !== 'Active').length;

  const activeRobots = robots.filter((r) => r.status === 'Active').length;
  const idleRobots = robots.filter((r) => r.status === 'Idle').length;
  const offlineRobots = robots.filter((r) => r.status === 'Offline').length;
  const totalRobots = robots.length;

  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const taskStatusData = [
    { name: 'Pending', value: pendingTasks, color: '#D97706' },
    { name: 'In Progress', value: inProgressTasks, color: '#4caf50' },
    { name: 'Completed', value: completedTasks, color: '#0D9488' },
  ];

  const highPriority = tasks.filter((t) => t.priority === 'High').length;
  const medPriority = tasks.filter((t) => t.priority === 'Medium').length;
  const lowPriority = tasks.filter((t) => t.priority === 'Low').length;
  const priorityData = [
    { name: 'High', count: highPriority, color: '#EF4444' },
    { name: 'Medium', count: medPriority, color: '#F59E0B' },
    { name: 'Low', count: lowPriority, color: '#10B981' },
  ];

  const robotStatusData = [
    { name: 'Active', value: activeRobots, color: '#22C55E' },
    { name: 'Idle', value: idleRobots, color: '#F59E0B' },
    { name: 'Offline', value: offlineRobots, color: '#EF4444' },
  ];

  const farmStatusData = [
    { name: 'Active', value: activeFarms, color: '#22C55E' },
    { name: 'Inactive', value: inactiveFarms, color: '#EF4444' },
  ];

  const cropFrequency = useMemo(() => {
    const counts = {};
    farms.forEach((f) => {
      const types = (f.cropTypes || '').split(',').map((s) => s.trim()).filter(Boolean);
      types.forEach((t) => { counts[t] = (counts[t] || 0) + 1; });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [farms]);

  const employeeActivity = useMemo(() => {
    const counts = {};
    entries.forEach((e) => {
      const name = e.userName || 'Unknown';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, actions]) => ({ name, actions }))
      .sort((a, b) => b.actions - a.actions);
  }, [entries]);

  return (
    <>
      <div className="mb-6">
        <div className="text-2xl font-bold text-primary">Analytics</div>
        <div className="text-sm text-text-secondary mt-1">Real-time metrics derived from platform data</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Users"
          value={users.length}
          subtitle={`${activeUsers} Active · ${inactiveUsers} Inactive`}
          icon={Users}
        />
        <StatCard
          label="Total Farms"
          value={farms.length}
          subtitle={`${activeFarms} Active · ${inactiveFarms} Inactive`}
          icon={MapPin}
        />
        <StatCard
          label="Task Completion Rate"
          value={`${completionRate}%`}
          subtitle={`${completedTasks} of ${totalTasks} tasks completed`}
          icon={CheckCircle}
        />
        <StatCard
          label="Total Robots"
          value={totalRobots}
          subtitle={`${activeRobots} currently active`}
          icon={Bot}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="text-sm font-semibold text-primary mb-3">Task Status Breakdown</div>
          <div className="relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {taskStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={30}
                  formatter={(val) => <span style={{ color: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 500 }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-extrabold leading-none mb-0.5" style={{ color: 'var(--color-text-primary)' }}>{totalTasks}</div>
                <div className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Total</div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 text-xs mt-2">
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
          <div className="text-sm font-semibold text-primary mb-3">Task Priority Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priorityData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-xs mt-1">
            {priorityData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: item.color }} />
                <span className="text-text-secondary">{item.name}</span>
                <span className="font-semibold text-primary">{item.count}</span>
              </div>
            ))}
          </div>
        </GlowCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="text-sm font-semibold text-primary mb-3">Robot Status Overview</div>
          <div className="relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={robotStatusData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {robotStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={30}
                  formatter={(val) => <span style={{ color: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 500 }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-extrabold leading-none mb-0.5" style={{ color: 'var(--color-text-primary)' }}>{totalRobots}</div>
                <div className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Total</div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 text-xs mt-2">
            {robotStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: item.color }} />
                <span className="text-text-secondary">{item.name}</span>
                <span className="font-semibold text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </GlowCard>

        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="text-sm font-semibold text-primary mb-3">Farm Status Distribution</div>
          <div className="relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={farmStatusData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {farmStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={30}
                  formatter={(val) => <span style={{ color: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 500 }}>{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-extrabold leading-none mb-0.5" style={{ color: 'var(--color-text-primary)' }}>{farms.length}</div>
                <div className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Total</div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 text-xs mt-2">
            {farmStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: item.color }} />
                <span className="text-text-secondary">{item.name}</span>
                <span className="font-semibold text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </GlowCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="text-sm font-semibold text-primary mb-3">Crop Type Frequency</div>
          {cropFrequency.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(200, cropFrequency.length * 32)}>
              <BarChart
                data={cropFrequency}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-primary)', fontWeight: 500 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#4caf50" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-sm text-text-secondary">No crop data available</div>
          )}
        </GlowCard>

        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="text-sm font-semibold text-primary mb-3">Sensor Health Summary</div>
          <div className="space-y-4">
            {sectorData.map((sector) => {
              const nutrients = ['nitrogen', 'phosphorus', 'potassium'];
              const labels = { nitrogen: 'N', phosphorus: 'P', potassium: 'K' };
              const statusCounts = { Good: 0, Low: 0, 'Too High': 0 };
              nutrients.forEach((key) => {
                const st = sector.nutrients[key].status;
                if (statusCounts[st] !== undefined) statusCounts[st]++;
              });
              return (
                <div key={sector.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-primary">{sector.name}</span>
                    <div className="flex gap-2">
                      {Object.entries(statusCounts).filter(([_, c]) => c > 0).map(([st, count]) => {
                        const colors = nutrientStatusColor(st);
                        return (
                          <span key={st} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold"
                            style={{ background: colors.bg, color: colors.text }}>
                            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: colors.dot }} />
                            {st} {count}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {nutrients.map((key) => {
                      const n = sector.nutrients[key];
                      const colors = nutrientStatusColor(n.status);
                      return (
                        <div key={key} className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px]"
                          style={{ background: colors.bg }}>
                          <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ background: colors.dot }} />
                          <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{labels[key]}</span>
                          <span style={{ color: colors.text, fontWeight: 500 }}>{n.status}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </GlowCard>
      </div>

      {isMasterAdmin && (
        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} color="#2e7d2e" />
            <span className="text-sm font-semibold text-primary">Employee Activity</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(76,175,80,0.12)', color: '#4caf50' }}>
              {entries.length} total actions
            </span>
          </div>
          {employeeActivity.length > 0 ? (
            <div className="space-y-2">
              {employeeActivity.map((emp, i) => {
                const maxActions = employeeActivity[0]?.actions || 1;
                const pct = Math.round((emp.actions / maxActions) * 100);
                return (
                  <div key={emp.name} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: i % 2 === 0 ? 'rgba(76,175,80,0.04)' : 'transparent' }}>
                    <span className="text-[11px] font-bold text-text-secondary min-w-[16px]">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-primary truncate">{emp.name}</div>
                      <div className="w-full h-1.5 rounded-full mt-1" style={{ background: 'rgba(76,175,80,0.1)' }}>
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: '#4caf50' }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary shrink-0">{emp.actions}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[120px] text-sm text-text-secondary">No activity recorded yet</div>
          )}
        </GlowCard>
      )}
    </>
  );
}
