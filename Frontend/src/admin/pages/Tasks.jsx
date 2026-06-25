import { useState } from 'react';

const tabs = [
  { key: 'all', label: 'All (10)' },
  { key: 'pending', label: 'Pending (5)' },
  { key: 'inprog', label: 'In progress (2)' },
  { key: 'done', label: 'Completed (3)' },
];

const tasks = [
  { task: 'Water wheat fields', user: 'John Smith', farm: 'Green Valley Farm', type: 'Irrigation', typeCls: 'irr', priority: 'High', priCls: 'high', due: '2026-04-09', status: 'pending' },
  { task: 'Apply nitrogen fertilizer', user: 'Michael Brown', farm: 'Golden Harvest', type: 'Fertilizer', typeCls: 'fert', priority: 'Medium', priCls: 'medium', due: '2026-04-10', status: 'pending' },
  { task: 'Inspect apple trees', user: 'Sarah Johnson', farm: 'Sunrise Orchards', type: 'Inspection', typeCls: 'insp', priority: 'Low', priCls: 'low', due: '2026-04-07', status: 'inprog' },
];

export default function Tasks() {
  const [activeTab, setActiveTab] = useState('all');

  const filtered = activeTab === 'all' ? tasks : tasks.filter((t) => t.status === activeTab);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xl font-medium text-[#1C1C1E]">Task management</div>
          <div className="text-sm text-[#757575] mt-0.5">Assign and track agricultural tasks</div>
        </div>
        <button className="bg-[#2e7d32] text-white border-none rounded-md px-3.5 py-1.5 text-sm cursor-pointer flex items-center gap-1.5 hover:bg-[#1b5e20]">
          <i className="ph ph-plus" /> Assign task
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2.5 mb-3.5">
        <div className="bg-white border border-[#e0e0e0] rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="text-lg" style={{ color: '#1565c0' }}><i className="ph ph-list" /></div>
          <div>
            <div className="text-lg font-medium">10</div>
            <div className="text-xs text-[#757575]">Total</div>
          </div>
        </div>
        <div className="bg-white border border-[#e0e0e0] rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="text-lg" style={{ color: '#f57f17' }}><i className="ph ph-clock" /></div>
          <div>
            <div className="text-lg font-medium">5</div>
            <div className="text-xs text-[#757575]">Pending</div>
          </div>
        </div>
        <div className="bg-white border border-[#e0e0e0] rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="text-lg" style={{ color: '#e65100' }}><i className="ph ph-play" /></div>
          <div>
            <div className="text-lg font-medium">2</div>
            <div className="text-xs text-[#757575]">In progress</div>
          </div>
        </div>
        <div className="bg-white border border-[#e0e0e0] rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="text-lg" style={{ color: '#2e7d32' }}><i className="ph ph-check-circle" /></div>
          <div>
            <div className="text-lg font-medium">3</div>
            <div className="text-xs text-[#757575]">Completed</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#e0e0e0] rounded-xl p-3.5">
        <div className="flex gap-0 border-b border-[#e0e0e0] mb-3">
          {tabs.map((tab) => (
            <div
              key={tab.key}
              className={`px-3 py-1.5 text-xs cursor-pointer border-b-2 -mb-px ${
                activeTab === tab.key ? 'text-[#2e7d32] border-[#2e7d32] font-medium' : 'text-[#757575] border-transparent'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </div>
          ))}
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Task</th>
              <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Assigned to</th>
              <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Farm</th>
              <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Type</th>
              <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Priority</th>
              <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Due date</th>
              <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={i}>
                <td className="px-2 py-2 border-b border-[#e0e0e0]"><strong className="font-medium">{t.task}</strong></td>
                <td className="px-2 py-2 border-b border-[#e0e0e0] text-[#757575]">{t.user}</td>
                <td className="px-2 py-2 border-b border-[#e0e0e0] text-[#757575]">{t.farm}</td>
                <td className="px-2 py-2 border-b border-[#e0e0e0]"><span className={`pill ${t.typeCls}`}>{t.type}</span></td>
                <td className="px-2 py-2 border-b border-[#e0e0e0]"><span className={`pill ${t.priCls}`}>{t.priority}</span></td>
                <td className="px-2 py-2 border-b border-[#e0e0e0] text-[#757575]">{t.due}</td>
                <td className="px-2 py-2 border-b border-[#e0e0e0]">
                  <button className={`text-xs px-2.5 py-1 border border-[#e0e0e0] rounded-md cursor-pointer bg-transparent ${
                    t.status === 'pending' ? 'text-[#2e7d32] border-[#a5d6a7] bg-[#e8f5e9]' : 'text-[#1C1C1E] hover:bg-[#f5f5f5]'
                  }`}>
                    {t.status === 'pending' ? 'Complete' : 'Start'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
