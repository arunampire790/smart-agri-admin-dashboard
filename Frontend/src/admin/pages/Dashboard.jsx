import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../context/UserContext';
import { useFarms } from '../../context/FarmContext';

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

export default function Dashboard() {
  const navigate = useNavigate();
  const { users } = useUsers();
  const { farms } = useFarms();

  const statCards = [
    { label: 'Total Users', value: String(users.length), note: '↑ +12% from last month', icon: 'ti-users', bg: '#E6F4EA', color: '#137333', route: '/admin/users' },
    { label: 'Total Farms', value: String(farms.length), note: '↑ +8% from last month', icon: 'ti-building-cottage', bg: '#E6F4EA', color: '#137333', route: '/admin/farms' },
    { label: 'Total Robots', value: '8', note: '3 offline', icon: 'ti-robot', bg: '#FCE8E6', color: '#C5221F', route: '/admin/robots' },
    { label: 'Active Robots', value: '4', note: 'Currently operating', icon: 'ti-activity', bg: '#E6F4EA', color: '#137333', route: '/admin/robots' },
    { label: 'Active Tasks', value: '7', note: '5 high priority', icon: 'ti-clock', bg: '#FEF7E0', color: '#B06000', route: '/admin/tasks' },
    { label: 'Completed Tasks', value: '3', note: 'This week', icon: 'ti-circle-check', bg: '#E6F4EA', color: '#137333', route: '/admin/tasks' },
  ];

  return (
    <>
      <div className="mb-6">
        <div className="text-2xl font-semibold">Dashboard</div>
        <div className="text-sm text-text-secondary mt-1">Welcome back — here's what's happening today</div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            onClick={() => navigate(card.route)}
            className="bg-white rounded-xl p-5 flex items-start justify-between shadow-[0_4px_20px_rgba(0,0,0,0.02)] cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-md"
          >
            <div className="flex-1">
              <div className="text-xs font-medium text-text-secondary mb-2">{card.label}</div>
              <div className="text-3xl font-bold">{card.value}</div>
              <div className="text-xs mt-2 text-text-secondary" style={{ color: card.color }}>{card.note}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ background: card.bg, color: card.color }}>
              <i className={`ti ${card.icon}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {[{ title: 'User Growth Over Time', data: userGrowth }, { title: 'Farm Registrations', data: farmRegs }].map((chart) => (
          <div key={chart.title} className="bg-white rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="text-sm font-semibold mb-4">{chart.title}</div>
            {chart.data.map((row) => (
              <div key={row.label} className="flex items-center gap-3 mb-3">
                <div className="text-xs text-text-secondary w-10 text-right">{row.label}</div>
                <div className="flex-1 h-2 bg-[#F1F3F4] rounded overflow-hidden">
                  <div className="h-full rounded bg-brand" style={{ width: `${row.pct}%` }} />
                </div>
                <div className="text-xs font-medium w-8 text-[#111]">{row.val}</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold">Recent Tasks</div>
          <button onClick={() => navigate('/admin/tasks')} className="text-xs px-3.5 py-1.5 border border-[#EAEAEA] rounded-lg cursor-pointer bg-white flex items-center gap-1.5 font-medium hover:bg-[#F1F3F4]">
            <i className="ti ti-arrow-right" /> View all
          </button>
        </div>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Task</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">User</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Farm</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Priority</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { task: 'Water wheat fields', user: 'John Smith', farm: 'Green Valley Farm', priority: 'High', priClass: 'bg-danger-bg text-danger-text', status: 'Pending', stClass: 'bg-warning-bg text-warning-text' },
              { task: 'Apply nitrogen fertilizer', user: 'Michael Brown', farm: 'Golden Harvest', priority: 'Medium', priClass: 'bg-warning-bg text-warning-text', status: 'Pending', stClass: 'bg-warning-bg text-warning-text' },
              { task: 'Inspect apple trees', user: 'Sarah Johnson', farm: 'Sunrise Orchards', priority: 'Low', priClass: 'bg-brand-light text-[#137333]', status: 'In progress', stClass: 'bg-warning-bg text-warning-text' },
            ].map((row, i) => (
              <tr key={i}>
                <td className="px-4 py-4 border-b border-[#F1F3F4]"><strong className="text-[#111] font-medium">{row.task}</strong></td>
                <td className="px-4 py-4 border-b border-[#F1F3F4] text-text-secondary">{row.user}</td>
                <td className="px-4 py-4 border-b border-[#F1F3F4] text-text-secondary">{row.farm}</td>
                <td className="px-4 py-4 border-b border-[#F1F3F4]"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${row.priClass}`}>{row.priority}</span></td>
                <td className="px-4 py-4 border-b border-[#F1F3F4]"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${row.stClass}`}>{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
