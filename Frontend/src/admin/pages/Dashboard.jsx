import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../context/UserContext';
import { useFarms } from '../../context/FarmContext';
import { useRobots } from '../../context/RobotContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { users } = useUsers();
  const { farms } = useFarms();
  const { robots } = useRobots();

  const activeRobots = robots.filter((r) => r.status === 'Active').length;
  const offlineRobots = robots.filter((r) => r.status === 'Offline').length;
  const activeTasks = 7;
  const completedTasks = 3;

  const statCards = [
    { label: 'Total users', value: String(users.length), note: '↑ +12% from last month', noteCls: 'text-[#2e7d32]', icon: 'ph-users', iconBg: '#e8f5e9', iconCls: 'text-[#2e7d32]' },
    { label: 'Total farms', value: String(farms.length), note: '↑ +8% from last month', noteCls: 'text-[#2e7d32]', icon: 'ph-warehouse', iconBg: '#e8f5e9', iconCls: 'text-[#2e7d32]' },
    { label: 'Total robots', value: String(robots.length), note: `${offlineRobots} currently offline`, noteCls: 'text-[#e65100]', icon: 'ph-robot', iconBg: '#fff3e0', iconCls: 'text-[#e65100]' },
    { label: 'Active robots', value: String(activeRobots), note: 'Currently operating', noteCls: 'text-[#757575]', icon: 'ph-activity', iconBg: '#e8f5e9', iconCls: 'text-[#2e7d32]' },
    { label: 'Active tasks', value: String(activeTasks), note: '5 high priority', noteCls: 'text-[#e65100]', icon: 'ph-clock', iconBg: '#fff3e0', iconCls: 'text-[#e65100]' },
    { label: 'Completed tasks', value: String(completedTasks), note: 'This week', noteCls: 'text-[#757575]', icon: 'ph-check-circle', iconBg: '#e8f5e9', iconCls: 'text-[#2e7d32]' },
  ];

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

  const recentTasks = [
    { task: 'Water wheat fields', user: 'John Smith', farm: 'Green Valley Farm', priority: 'High', priCls: 'high', status: 'Pending', stCls: 'pending' },
    { task: 'Apply nitrogen fertilizer', user: 'Michael Brown', farm: 'Golden Harvest', priority: 'Medium', priCls: 'medium', status: 'Pending', stCls: 'pending' },
    { task: 'Inspect apple trees', user: 'Sarah Johnson', farm: 'Sunrise Orchards', priority: 'Low', priCls: 'low', status: 'In progress', stCls: 'in-progress' },
  ];

  return (
    <>
      <div className="mb-4">
        <div className="text-xl font-medium text-[#1C1C1E]">Dashboard</div>
        <div className="text-sm text-[#757575] mt-0.5">Welcome back — here's what's happening today</div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white border border-[#e0e0e0] rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs text-[#757575] mb-1">{card.label}</div>
              <div className="text-xl font-medium">{card.value}</div>
              <div className={`text-[10px] mt-0.5 ${card.noteCls}`}>{card.note}</div>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: card.iconBg }}>
              <i className={`${card.icon} ${card.iconCls}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white border border-[#e0e0e0] rounded-xl p-3.5">
          <div className="text-sm font-medium mb-3">User growth (last 6 months)</div>
          {userGrowth.map((d) => (
            <div key={d.label} className="flex items-center gap-2 mb-2">
              <div className="text-xs text-[#757575] w-6 text-right">{d.label}</div>
              <div className="flex-1 h-1.5 bg-[#f5f5f5] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[#2e7d32]" style={{ width: `${d.pct}%` }} />
              </div>
              <div className="text-xs font-medium w-5">{d.val}</div>
            </div>
          ))}
        </div>
        <div className="bg-white border border-[#e0e0e0] rounded-xl p-3.5">
          <div className="text-sm font-medium mb-3">Farm registrations (last 6 months)</div>
          {farmRegs.map((d) => (
            <div key={d.label} className="flex items-center gap-2 mb-2">
              <div className="text-xs text-[#757575] w-6 text-right">{d.label}</div>
              <div className="flex-1 h-1.5 bg-[#f5f5f5] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[#2e7d32]" style={{ width: `${d.pct}%` }} />
              </div>
              <div className="text-xs font-medium w-5">{d.val}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#e0e0e0] rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium">Recent tasks</div>
          <button onClick={() => navigate('/admin/tasks')} className="text-xs px-3 py-1 border border-[#e0e0e0] rounded-md cursor-pointer bg-transparent text-[#1C1C1E] flex items-center gap-1 hover:bg-[#f5f5f5]">
            <i className="ph ph-arrow-right" /> View all
          </button>
        </div>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Task</th>
              <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">User</th>
              <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Farm</th>
              <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Priority</th>
              <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentTasks.map((row, i) => (
              <tr key={i}>
                <td className="px-2 py-2 border-b border-[#e0e0e0]"><strong className="font-medium">{row.task}</strong></td>
                <td className="px-2 py-2 border-b border-[#e0e0e0] text-[#757575]">{row.user}</td>
                <td className="px-2 py-2 border-b border-[#e0e0e0] text-[#757575]">{row.farm}</td>
                <td className="px-2 py-2 border-b border-[#e0e0e0]"><span className={`pill ${row.priCls}`}>{row.priority}</span></td>
                <td className="px-2 py-2 border-b border-[#e0e0e0]"><span className={`pill ${row.stCls}`}>{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
