import { useState } from 'react';

const tabs = [
  { key: 'all', label: 'All (10)' },
  { key: 'pending', label: 'Pending (5)' },
  { key: 'inprog', label: 'In Progress (2)' },
  { key: 'done', label: 'Completed (3)' },
];

export default function Tasks() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-bold text-[#000000]">Task Management</div>
          <div className="text-sm text-text-secondary mt-1">Assign and track agricultural tasks</div>
        </div>
        <button className="bg-brand text-white border-none rounded-xl px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 hover:opacity-90">
          <i className="ph ph-plus" /> Assign Task
        </button>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        {[
          { val: '10', label: 'Total Tasks', labelCls: 'text-[#4B5563]' },
          { val: '5', label: 'Pending', labelCls: 'text-[#EA580C]' },
          { val: '3', label: 'Completed', labelCls: 'text-[#16A34A]' },
        ].map((item, i) => (
          <div key={i} className="flex-1 min-w-[140px] glass-card rounded-[20px] p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)]">
            <div className="text-2xl font-extrabold text-[#000000] leading-tight mb-1">{item.val}</div>
            <div className={`font-semibold text-sm ${item.labelCls}`}>{item.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-[20px] p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)]">
        <div className="flex gap-6 mb-5 border-b border-[rgba(0,0,0,0.05)]">
          {tabs.map((tab) => (
            <div
              key={tab.key}
              className={`pb-2 text-sm cursor-pointer border-b-2 -mb-px transition-colors ${
                activeTab === tab.key ? 'text-brand border-brand font-medium' : 'text-text-secondary border-transparent'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </div>
          ))}
        </div>

        <div className="mb-4">
          <input placeholder="Search tasks by title or assignee..." aria-label="Search tasks" className="text-sm px-3.5 py-2.5 rounded-xl bg-[#7676801F] outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder" />
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-table-sep">Task</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-table-sep">Assigned to</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-table-sep">Farm</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-table-sep">Type</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-table-sep">Priority</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-table-sep">Due date</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-table-sep">Action</th></tr>
          </thead>
          <tbody>
            {(activeTab === 'all' || activeTab === 'pending') && (
              <>
                <tr>
                  <td className="px-4 py-4 border-b border-table-sep"><strong className="text-[#1C1C1E] font-medium">Water wheat fields</strong></td>
                  <td className="px-4 py-4 border-b border-table-sep text-text-secondary">John Smith</td>
                  <td className="px-4 py-4 border-b border-table-sep text-text-secondary">Green Valley Farm</td>
                  <td className="px-4 py-4 border-b border-table-sep"><span className="pill inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#7676801F] text-text-secondary">Irrigation</span></td>
                  <td className="px-4 py-4 border-b border-table-sep"><span className="pill inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-danger-bg text-danger-text">High</span></td>
                  <td className="px-4 py-4 border-b border-table-sep text-text-secondary">2026-04-09</td>
                  <td className="px-4 py-4 border-b border-table-sep"><button className="text-xs px-3.5 py-1.5 border border-[rgba(0,0,0,0.05)] rounded-xl cursor-pointer bg-white font-medium text-text-secondary hover:bg-[#E5E5EA]">Complete</button></td>
                </tr>
                <tr>
                  <td className="px-4 py-4 border-b border-table-sep"><strong className="text-[#1C1C1E] font-medium">Apply nitrogen fertilizer</strong></td>
                  <td className="px-4 py-4 border-b border-table-sep text-text-secondary">Michael Brown</td>
                  <td className="px-4 py-4 border-b border-table-sep text-text-secondary">Golden Harvest</td>
                  <td className="px-4 py-4 border-b border-table-sep"><span className="pill inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#7676801F] text-text-secondary">Fertilizer</span></td>
                  <td className="px-4 py-4 border-b border-table-sep"><span className="pill inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-warning-bg text-warning-text">Medium</span></td>
                  <td className="px-4 py-4 border-b border-table-sep text-text-secondary">2026-04-10</td>
                  <td className="px-4 py-4 border-b border-table-sep"><button className="text-xs px-3.5 py-1.5 border border-[rgba(0,0,0,0.05)] rounded-xl cursor-pointer bg-white font-medium text-text-secondary hover:bg-[#E5E5EA]">Start</button></td>
                </tr>
              </>
            )}
            {(activeTab === 'all' || activeTab === 'inprog') && (
              <tr>
                <td className="px-4 py-4 border-b border-table-sep"><strong className="text-[#1C1C1E] font-medium">Inspect apple trees</strong></td>
                <td className="px-4 py-4 border-b border-table-sep text-text-secondary">Sarah Johnson</td>
                <td className="px-4 py-4 border-b border-table-sep text-text-secondary">Sunrise Orchards</td>
                <td className="px-4 py-4 border-b border-table-sep"><span className="pill inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#7676801F] text-text-secondary">Inspection</span></td>
                <td className="px-4 py-4 border-b border-table-sep"><span className="pill inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-brand-light text-brand-dark">Low</span></td>
                <td className="px-4 py-4 border-b border-table-sep text-text-secondary">2026-04-07</td>
                <td className="px-4 py-4 border-b border-table-sep"><button className="text-xs px-3.5 py-1.5 border border-[rgba(0,0,0,0.05)] rounded-xl cursor-pointer bg-white font-medium text-text-secondary hover:bg-[#E5E5EA]">Start</button></td>
              </tr>
            )}
            {activeTab === 'done' && (
              <tr><td colSpan="7" className="text-center py-6 text-text-secondary">No newly completed tasks to show.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
