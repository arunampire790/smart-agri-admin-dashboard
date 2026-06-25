import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../context/UserContext';
import { useFarms } from '../../context/FarmContext';
import { useRobots } from '../../context/RobotContext';

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

const getGlowColor = (label) => {
  switch (label) {
    case 'Total Users': return 'radial-gradient(circle, rgba(59,130,246,0.7) 0%, transparent 70%)';
    case 'Total Farms':
    case 'Active Robots':
    case 'Completed Tasks': return 'radial-gradient(circle, rgba(5,150,105,0.7) 0%, transparent 70%)';
    case 'Total Robots': return 'radial-gradient(circle, rgba(147,51,234,0.7) 0%, transparent 70%)';
    case 'Active Tasks': return 'radial-gradient(circle, rgba(251,146,60,0.7) 0%, transparent 70%)';
    default: return 'radial-gradient(circle, rgba(59,130,246,0.7) 0%, transparent 70%)';
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { users } = useUsers();
  const { farms } = useFarms();
  const { robots } = useRobots();

  const statCards = [
    { label: 'Total Users', value: String(users.length), note: '↑ +12% from last month', noteCls: 'text-[#22C55E]', route: '/admin/users' },
    { label: 'Total Farms', value: String(farms.length), note: '↑ +8% from last month', noteCls: 'text-[#22C55E]', route: '/admin/farms' },
    { label: 'Total Robots', value: String(robots.length), note: `${robots.filter((r) => r.status === 'Offline').length} offline`, noteCls: 'text-[#EF4444]', route: '/admin/robots' },
    { label: 'Active Robots', value: String(robots.filter((r) => r.status === 'Active').length), note: 'Currently operating', noteCls: 'text-[#22C55E]', route: '/admin/robots' },
    { label: 'Active Tasks', value: '7', note: '5 high priority', noteCls: 'text-[#F97316]', route: '/admin/tasks' },
    { label: 'Completed Tasks', value: '3', note: 'This week', noteCls: 'text-[#22C55E]', route: '/admin/tasks' },
  ];

  return (
    <>
      <div className="mb-6">
        <div className="text-2xl font-bold text-[#000000]">Dashboard</div>
        <div className="text-sm text-text-secondary mt-1">Welcome back — here's what's happening today</div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            onClick={() => navigate(card.route)}
            className="relative glass-card rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:scale-[1.01] border border-[rgba(255,255,255,0.6)] overflow-hidden"
            style={{ boxShadow: '0px 8px 32px rgba(0,0,0,0.08)' }}
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: getGlowColor(card.label), filter: 'blur(30px)', opacity: 0.35 }} />
            <div className="relative z-10">
              <div className="text-xs font-semibold text-[#6B7280] mb-2">{card.label}</div>
              <div className="text-3xl font-extrabold text-[#000000] mb-1">{card.value}</div>
              <div className={`text-xs leading-relaxed ${card.noteCls}`}>{card.note}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {[{ title: 'User Growth Over Time', data: userGrowth }, { title: 'Farm Registrations', data: farmRegs }].map((chart) => (
          <div key={chart.title} className="bg-white rounded-2xl p-5 shadow-[0px_4px_24px_rgba(0,0,0,0.04),0px_1px_2px_rgba(0,0,0,0.02)]">
            <div className="text-sm font-semibold text-[#1C1C1E] mb-4">{chart.title}</div>
            {chart.data.map((row) => (
              <div key={row.label} className="flex items-center gap-3 mb-3">
                <div className="text-xs text-text-secondary w-10 text-right">{row.label}</div>
                <div className="flex-1 h-2 bg-[#7676801F] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${row.pct}%` }} />
                </div>
                <div className="text-xs font-medium text-[#1C1C1E] w-8">{row.val}</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5 mb-6 shadow-[0px_4px_24px_rgba(0,0,0,0.04),0px_1px_2px_rgba(0,0,0,0.02)]">
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
            {[
              { task: 'Water wheat fields', user: 'John Smith', farm: 'Green Valley Farm', priority: 'High', priClass: 'bg-danger-bg text-danger-text', status: 'Pending', stClass: 'bg-warning-bg text-warning-text' },
              { task: 'Apply nitrogen fertilizer', user: 'Michael Brown', farm: 'Golden Harvest', priority: 'Medium', priClass: 'bg-warning-bg text-warning-text', status: 'Pending', stClass: 'bg-warning-bg text-warning-text' },
              { task: 'Inspect apple trees', user: 'Sarah Johnson', farm: 'Sunrise Orchards', priority: 'Low', priClass: 'bg-brand-light text-brand-dark', status: 'In progress', stClass: 'bg-warning-bg text-warning-text' },
            ].map((row, i) => (
              <tr key={i}>
                <td className="px-4 py-4 border-b border-table-sep"><strong className="text-[#1C1C1E] font-medium">{row.task}</strong></td>
                <td className="px-4 py-4 border-b border-table-sep text-text-secondary">{row.user}</td>
                <td className="px-4 py-4 border-b border-table-sep text-text-secondary">{row.farm}</td>
                <td className="px-4 py-4 border-b border-table-sep"><span className={`pill inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${row.priClass}`}>{row.priority}</span></td>
                <td className="px-4 py-4 border-b border-table-sep"><span className={`pill inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${row.stClass}`}>{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
