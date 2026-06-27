import { Users, Map } from 'lucide-react';
import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../context/UserContext';
import { useFarms } from '../../context/FarmContext';
import { useRobots } from '../../context/RobotContext';
import { useTasks } from '../../context/TaskContext';
import UserProfileModal from '../../admin/components/UserProfileModal';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const userGrowth = [
  { label: 'Jan', pct: 50, val: 40 },
  { label: 'Feb', pct: 56, val: 45 },
  { label: 'Mar', pct: 63, val: 52 },
  { label: 'Apr', pct: 72, val: 58 },
  { label: 'May', pct: 84, val: 67 },
  { label: 'Jun', pct: 100, val: 80 },
];

const farmRegs = [
  { label: 'Jan', pct: 28, val: 10 },
  { label: 'Feb', pct: 33, val: 12 },
  { label: 'Mar', pct: 44, val: 16 },
  { label: 'Apr', pct: 61, val: 22 },
  { label: 'May', pct: 75, val: 27 },
  { label: 'Jun', pct: 100, val: 36 },
];

const TaskDonut = memo(({ activeCount, pendingCount, completedCount, totalTasks }) => (
  <div className="relative flex items-center justify-center">
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie data={[{ name: 'Active', value: activeCount }, { name: 'Pending', value: pendingCount }, { name: 'Completed', value: completedCount }]} cx="50%" cy="50%" innerRadius={55} outerRadius={78} dataKey="value" strokeWidth={0}>
          {[{ name: 'Active', color: '#10B981' }, { name: 'Pending', color: '#D97706' }, { name: 'Completed', color: '#0D9488' }].map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center">
        <div className="text-2xl font-extrabold text-[#000000] leading-none mb-0.5">{totalTasks}</div>
        <div className="text-[10px] text-text-secondary">Total</div>
      </div>
    </div>
  </div>
));

const RobotDonut = memo(({ onlineCount, idleCount, offlineCount, totalRobots }) => (
  <div className="relative flex items-center justify-center">
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie data={[{ name: 'Online', value: onlineCount }, { name: 'Idle', value: idleCount }, { name: 'Offline', value: offlineCount }]} cx="50%" cy="50%" innerRadius={55} outerRadius={78} dataKey="value" strokeWidth={0}>
          {[{ name: 'Online', color: '#22C55E' }, { name: 'Idle', color: '#F59E0B' }, { name: 'Offline', color: '#EF4444' }].map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center">
        <div className="text-2xl font-extrabold text-[#000000] leading-none mb-0.5">{totalRobots}</div>
        <div className="text-[10px] text-text-secondary">Total</div>
      </div>
    </div>
  </div>
));

export default function Dashboard() {
  const navigate = useNavigate();
  const { users } = useUsers();
  const { farms } = useFarms();
  const { robots } = useRobots();

  const activeRobots = robots.filter((r) => r.status === 'Active').length;
  const idleRobots = robots.filter((r) => r.status === 'Idle').length;
  const offlineRobots = robots.filter((r) => r.status === 'Offline').length;
  const { tasks } = useTasks();
  const [selectedUser, setSelectedUser] = useState(null);
  const activeCount = tasks.filter((t) => t.status === 'In Progress').length;
  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const totalTasks = tasks.length;

  return (
    <>
      <div className="mb-6">
        <div className="text-2xl font-bold text-[#000000]">Dashboard</div>
        <div className="text-sm text-text-secondary mt-1">Welcome back — here's what's happening today</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-4">
        <div
          onClick={() => navigate('/admin/users')}
          className="dashboard-card-link glass-card rounded-2xl p-5 overflow-hidden"
          style={{ contentVisibility: 'auto' }}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.7) 0%, transparent 70%)', filter: 'blur(30px)', opacity: 0.35 }} />
          <div className="relative z-10">
            <div className="text-xs font-semibold text-[#6B7280] mb-2">Total Users</div>
            <div className="text-3xl font-extrabold text-[#000000] mb-1">{users.length}</div>
            <div className="text-xs leading-relaxed text-[#22C55E]">↑ +12% from last month</div>
          </div>
          <div className="absolute flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '12px', top: '24px', right: '24px', zIndex: 10, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}>
            <Users size={18} color="#6366F1" />
          </div>
        </div>
        <div
          onClick={() => navigate('/admin/farms')}
          className="dashboard-card-link glass-card rounded-2xl p-5 overflow-hidden"
          style={{ contentVisibility: 'auto' }}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.7) 0%, transparent 70%)', filter: 'blur(30px)', opacity: 0.35 }} />
          <div className="relative z-10">
            <div className="text-xs font-semibold text-[#6B7280] mb-2">Total Farms</div>
            <div className="text-3xl font-extrabold text-[#000000] mb-1">{farms.length}</div>
            <div className="text-xs leading-relaxed text-[#22C55E]">↑ +8% from last month</div>
          </div>
          <div className="absolute flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '12px', top: '24px', right: '24px', zIndex: 10, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}>
            <Map size={18} color="#10B981" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div onClick={() => navigate('/admin/tasks')} className="dashboard-card-link glass-card rounded-2xl p-5">
          <div className="text-sm font-semibold text-[#1C1C1E] mb-3">Task Lifecycle</div>
          <TaskDonut activeCount={activeCount} pendingCount={pendingCount} completedCount={completedCount} totalTasks={totalTasks} />
          <div className="flex justify-center gap-5 text-xs mt-1">
            {[{ name: 'Active', value: activeCount, color: '#10B981' }, { name: 'Pending', value: pendingCount, color: '#D97706' }, { name: 'Completed', value: completedCount, color: '#0D9488' }].map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: item.color }} />
                <span className="text-text-secondary">{item.name}</span>
                <span className="font-semibold text-[#1C1C1E]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div onClick={() => navigate('/admin/robots')} className="dashboard-card-link glass-card rounded-2xl p-5">
          <div className="text-sm font-semibold text-[#1C1C1E] mb-3">Robot Status</div>
          <RobotDonut onlineCount={activeRobots} idleCount={idleRobots} offlineCount={offlineRobots} totalRobots={robots.length} />
          <div className="flex justify-center gap-4 text-xs mt-1">
            {[{ name: 'Online', value: activeRobots, color: '#22C55E' }, { name: 'Idle', value: idleRobots, color: '#F59E0B' }, { name: 'Offline', value: offlineRobots, color: '#EF4444' }].map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: item.color }} />
                <span className="text-text-secondary">{item.name}</span>
                <span className="font-semibold text-[#1C1C1E]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass-card rounded-2xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)]">
          <div className="text-sm font-semibold text-[#1C1C1E] mb-4">User Growth Over Time</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={userGrowth} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
              <defs>
                <linearGradient id="userGrowthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(16,185,129,0.2)" />
                  <stop offset="100%" stopColor="rgba(16,185,129,0)" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 'auto']} tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', fontSize: 12 }} labelStyle={{ fontWeight: 600, color: '#1C1C1E' }} />
              <Area type="monotone" dataKey="val" stroke="#10B981" strokeWidth={2.5} fill="url(#userGrowthFill)" dot={false} activeDot={{ r: 4, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card rounded-2xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)]">
          <div className="text-sm font-semibold text-[#1C1C1E] mb-4">Farm Registrations</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={farmRegs} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
              <defs>
                <linearGradient id="farmRegsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(4,120,87,0.2)" />
                  <stop offset="100%" stopColor="rgba(4,120,87,0)" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 'auto']} tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', fontSize: 12 }} labelStyle={{ fontWeight: 600, color: '#1C1C1E' }} />
              <Area type="monotone" dataKey="val" stroke="#047857" strokeWidth={2.5} fill="url(#farmRegsFill)" dot={false} activeDot={{ r: 4, fill: '#047857', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5 mb-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-[#1C1C1E]">Recent Tasks</div>
          <button onClick={() => navigate('/admin/tasks')} className="text-xs px-3.5 py-1.5 border border-[rgba(0,0,0,0.05)] rounded-xl cursor-pointer bg-white flex items-center gap-1.5 font-medium text-text-secondary hover:bg-[#E5E5EA]">
            <i className="ph ph-arrow-right" /> View all
          </button>
        </div>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-table-sep">Task</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-table-sep">User</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-table-sep">Farm</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-table-sep">Priority</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-table-sep">Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.slice(0, 5).map((row) => {
              const priClass = row.priority === 'High' ? 'bg-danger-bg text-danger-text' : row.priority === 'Medium' ? 'bg-warning-bg text-warning-text' : 'bg-brand-light text-brand-dark';
              const stClass = row.status === 'Completed' ? 'bg-brand-light text-brand-dark' : 'bg-warning-bg text-warning-text';
              return (
                <tr key={row.id}>
                  <td className="px-4 py-4 border-b border-table-sep"><strong className="text-[#1C1C1E] font-medium">{row.title}</strong></td>
                  <td className="px-4 py-4 border-b border-table-sep">
                    <span style={{ cursor: 'pointer', fontWeight: 600, color: '#111827', textDecoration: 'none', transition: 'color 0.15s ease, text-decoration 0.15s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#10B981'; e.currentTarget.style.textDecoration = 'underline'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.textDecoration = ''; }}
                      onClick={() => { const u = users.find((x) => x.name === row.assignedTo); if (u) setSelectedUser(u); }}
                    >{row.assignedTo}</span>
                  </td>
                  <td className="px-4 py-4 border-b border-table-sep text-text-secondary">{row.farm}</td>
                  <td className="px-4 py-4 border-b border-table-sep"><span className={`pill inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${priClass}`}>{row.priority}</span></td>
                  <td className="px-4 py-4 border-b border-table-sep"><span className={`pill inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${stClass}`}>{row.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {selectedUser && <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </>
  );
}
