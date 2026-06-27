import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../../context/TaskContext';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'inprog', label: 'In Progress' },
  { key: 'done', label: 'Completed' },
];

const priorityClass = (p) =>
  p === 'High' ? 'bg-danger-bg text-danger-text' : p === 'Medium' ? 'bg-warning-bg text-warning-text' : 'bg-brand-light text-brand-dark';

export default function Tasks() {
  const navigate = useNavigate();
  const { tasks, addTask, updateTaskStatus, removeTask } = useTasks();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = tasks;
    if (activeTab === 'pending') list = list.filter((t) => t.status === 'Pending');
    else if (activeTab === 'inprog') list = list.filter((t) => t.status === 'In Progress');
    else if (activeTab === 'done') list = list.filter((t) => t.status === 'Completed');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q) || t.assignedTo.toLowerCase().includes(q));
    }
    return list;
  }, [tasks, activeTab, search]);

  const counts = useMemo(() => ({
    all: tasks.length,
    pending: tasks.filter((t) => t.status === 'Pending').length,
    inprog: tasks.filter((t) => t.status === 'In Progress').length,
    done: tasks.filter((t) => t.status === 'Completed').length,
  }), [tasks]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-bold text-[#000000]">Task Management</div>
          <div className="text-sm text-text-secondary mt-1">Assign and track agricultural tasks</div>
        </div>
        <button
          onClick={() => addTask({
            title: 'New task', assignedTo: 'Unassigned', farm: '—', type: 'Other', priority: 'Medium', dueDate: new Date().toISOString().slice(0, 10), status: 'Pending',
          })}
          className="bg-brand text-white border-none rounded-xl px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 hover:opacity-90"
        >
          <i className="ph ph-plus" /> Assign Task
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { key: 'all', label: 'Total Tasks', icon: 'ph-list', iconBg: '#e0f2fe', iconColor: '#0284c7', glow: 'rgba(59,130,246,0.7)' },
          { key: 'pending', label: 'Pending', icon: 'ph-clock', iconBg: '#fff3e0', iconColor: '#d97706', glow: 'rgba(251,146,60,0.7)' },
          { key: 'inprog', label: 'In Progress', icon: 'ph-play', iconBg: '#e3f2fd', iconColor: '#1565c0', glow: 'rgba(59,130,246,0.7)' },
          { key: 'done', label: 'Completed', icon: 'ph-check-circle', iconBg: '#e8f5e9', iconColor: '#059669', glow: 'rgba(5,150,105,0.7)' },
        ].map((c) => (
          <div key={c.key} onClick={() => { setActiveTab(c.key); }} className="dashboard-card-link glass-card rounded-2xl p-5 overflow-hidden cursor-pointer" style={{ contentVisibility: 'auto' }}>
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: `radial-gradient(circle, ${c.glow} 0%, transparent 70%)`, filter: 'blur(30px)', opacity: 0.35 }} />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[#6B7280] mb-2">{c.label}</div>
                <div className="text-3xl font-extrabold text-[#000000]">{counts[c.key]}</div>
              </div>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: c.iconBg }}>
                <i className={`ph ${c.icon}`} style={{ color: c.iconColor }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[20px] p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', contentVisibility: 'auto', willChange: 'transform' }}>
        <div className="flex gap-6 mb-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
          {tabs.map((tab) => (
            <div
              key={tab.key}
              className={`pb-2 text-sm cursor-pointer border-b-2 -mb-px transition-colors ${
                activeTab === tab.key ? 'text-brand border-brand font-medium' : 'text-text-secondary border-transparent'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label} ({counts[tab.key]})
            </div>
          ))}
        </div>

        <div className="mb-4">
          <input
            placeholder="Search tasks by title or assignee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search tasks"
            className="text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/60 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder text-[#1C1C1E]"
          />
        </div>

        <table className="w-full border-collapse text-sm" style={{ userSelect: 'none' }}>
          <thead>
            <tr>
              <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Task</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Assigned to</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Farm</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Type</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Priority</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Due date</th>
              <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-6 text-text-secondary">No tasks found.</td></tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}><strong className="text-[#1C1C1E] font-medium">{row.title}</strong></td>
                  <td className="px-4 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{row.assignedTo}</td>
                  <td className="px-4 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{row.farm}</td>
                  <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}><span className="pill inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/40 text-text-secondary">{row.type}</span></td>
                  <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}><span className={`pill inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${priorityClass(row.priority)}`}>{row.priority}</span></td>
                  <td className="px-4 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{row.dueDate}</td>
                  <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    {row.status === 'Pending' && (
                      <button onClick={() => updateTaskStatus(row.id, 'In Progress')} className="text-xs px-3.5 py-1.5 border border-white/60 rounded-xl cursor-pointer bg-white/50 font-medium text-text-secondary transition-all duration-200 hover:scale-[1.02] hover:bg-white/80">Start</button>
                    )}
                    {row.status === 'In Progress' && (
                      <button onClick={() => updateTaskStatus(row.id, 'Completed')} className="text-xs px-3.5 py-1.5 border border-white/60 rounded-xl cursor-pointer bg-white/50 font-medium text-text-secondary transition-all duration-200 hover:scale-[1.02] hover:bg-white/80">Complete</button>
                    )}
                    {row.status === 'Completed' && (
                      <button onClick={() => removeTask(row.id)} className="text-xs px-3.5 py-1.5 border border-white/60 rounded-xl cursor-pointer bg-white/50 font-medium text-danger-text transition-all duration-200 hover:scale-[1.02] hover:bg-white/80">Delete</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
