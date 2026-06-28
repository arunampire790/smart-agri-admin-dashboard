import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskStore } from '../stores/taskStore';
import { useUsers } from '../../context/UserContext';
import { useFarms } from '../../context/FarmContext';

const priorityStyles = {
  High: { cls: 'bg-danger-bg text-danger-text' },
  Medium: { cls: 'bg-warning-bg text-warning-text' },
  Low: { cls: 'bg-brand-light text-brand-dark' },
};

const typeOptions = ['Irrigation', 'Fertilizer', 'Inspection', 'Harvesting'];
const priorityOptions = ['High', 'Medium', 'Low'];

export default function Tasks() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const tasks = useTaskStore((s) => s.tasks);
  const updateTaskStatus = useTaskStore((s) => s.updateTaskStatus);
  const addTask = useTaskStore((s) => s.addTask);
  const { users } = useUsers();
  const { farms } = useFarms();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [form, setForm] = useState({ title: '', assignedTo: '', farm: '', type: 'Irrigation', priority: 'Medium', dueDate: '' });
  const [formErrors, setFormErrors] = useState({});

  const openAssign = () => {
    setForm({ title: '', assignedTo: '', farm: '', type: 'Irrigation', priority: 'Medium', dueDate: '' });
    setFormErrors({});
    setShowAssignModal(true);
  };

  const handleAssignTaskSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Task title is required';
    if (!form.assignedTo) errs.assignedTo = 'Select an assignee';
    if (!form.farm) errs.farm = 'Select a farm';
    if (!form.dueDate) errs.dueDate = 'Select a due date';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    addTask({
      id: `TSK-${Date.now().toString().slice(-4)}`,
      title: form.title.trim(),
      assignedTo: form.assignedTo,
      farm: form.farm,
      type: form.type,
      priority: form.priority,
      dueDate: form.dueDate,
      status: 'Pending',
    });
    setShowAssignModal(false);
  };

  const totalTasks = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  const tabs = useMemo(() => [
    { key: 'all', label: `All (${totalTasks})` },
    { key: 'pending', label: `Pending (${pendingCount})` },
    { key: 'inprog', label: `In Progress (${inProgressCount})` },
    { key: 'done', label: `Completed (${completedCount})` },
  ], [totalTasks, pendingCount, inProgressCount, completedCount]);

  const filteredTasks = useMemo(() => {
    if (activeTab === 'all') return tasks;
    if (activeTab === 'pending') return tasks.filter((t) => t.status === 'Pending');
    if (activeTab === 'inprog') return tasks.filter((t) => t.status === 'In Progress');
    if (activeTab === 'done') return tasks.filter((t) => t.status === 'Completed');
    return tasks;
  }, [tasks, activeTab]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-bold text-primary">Task Management</div>
          <div className="text-sm text-text-secondary mt-1">Assign and track agricultural tasks</div>
        </div>
        <button onClick={openAssign} className="bg-brand text-white border-none rounded-xl px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 hover:opacity-90">
          <i className="ph ph-plus" /> Assign Task
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="glass-card rounded-2xl p-5 overflow-hidden" style={{ contentVisibility: 'auto' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.7) 0%, transparent 70%)', filter: 'blur(30px)', opacity: 0.35 }} />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-secondary mb-2">Total Tasks</div>
              <div className="text-3xl font-extrabold text-primary">{totalTasks}</div>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: '#e0f2fe' }}>
              <i className="ph ph-list" style={{ color: '#0284c7' }} />
            </div>
          </div>
        </div>
        <div onClick={() => navigate('/admin/tasks')} className="dashboard-card-link glass-card rounded-2xl p-5 overflow-hidden" style={{ contentVisibility: 'auto' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.7) 0%, transparent 70%)', filter: 'blur(30px)', opacity: 0.35 }} />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-secondary mb-2">Pending</div>
              <div className="text-3xl font-extrabold text-primary">{pendingCount}</div>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: '#fff3e0' }}>
              <i className="ph ph-clock" style={{ color: '#d97706' }} />
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5 overflow-hidden" style={{ contentVisibility: 'auto' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.7) 0%, transparent 70%)', filter: 'blur(30px)', opacity: 0.35 }} />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-secondary mb-2">In Progress</div>
              <div className="text-3xl font-extrabold text-primary">{inProgressCount}</div>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: '#e3f2fd' }}>
              <i className="ph ph-play" style={{ color: '#1565c0' }} />
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5 overflow-hidden" style={{ contentVisibility: 'auto' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.7) 0%, transparent 70%)', filter: 'blur(30px)', opacity: 0.35 }} />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-secondary mb-2">Completed</div>
              <div className="text-3xl font-extrabold text-primary">{completedCount}</div>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: '#e8f5e9' }}>
              <i className="ph ph-check-circle" style={{ color: '#059669' }} />
            </div>
          </div>
        </div>
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
              {tab.label}
            </div>
          ))}
        </div>

        <div className="mb-4">
          <input placeholder="Search tasks by title or assignee..." aria-label="Search tasks" className="text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/60 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder text-primary" />
        </div>

        <table className="w-full border-collapse text-sm" style={{ userSelect: 'none' }}>
          <thead>
            <tr><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Task</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Assigned to</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Farm</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Type</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Priority</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Due date</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Action</th></tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-6 text-text-secondary">No tasks in this category.</td></tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}><strong className="text-primary font-medium">{task.title}</strong></td>
                  <td className="px-4 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{task.assignedTo}</td>
                  <td className="px-4 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{task.farm}</td>
                  <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}><span className="pill inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/40 text-text-secondary">{task.type}</span></td>
                  <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}><span className={`pill inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${priorityStyles[task.priority]?.cls || 'bg-white/30 text-text-secondary'}`}>{task.priority}</span></td>
                  <td className="px-4 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{task.dueDate}</td>
                  <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    {task.status === 'Pending' && (
                      <button onClick={() => updateTaskStatus(task.id, 'In Progress')} className="text-xs px-3.5 py-1.5 border border-white/60 rounded-xl cursor-pointer bg-white/50 font-medium text-text-secondary transition-all duration-200 hover:scale-[1.02] hover:bg-white/80">Start</button>
                    )}
                    {task.status === 'In Progress' && (
                      <button onClick={() => updateTaskStatus(task.id, 'Completed')} className="text-xs px-3.5 py-1.5 border border-white/60 rounded-xl cursor-pointer bg-white/50 font-medium text-text-secondary transition-all duration-200 hover:scale-[1.02] hover:bg-white/80">Complete</button>
                    )}
                    {task.status === 'Completed' && (
                      <span className="text-xs font-medium text-text-secondary">Done</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowAssignModal(false)}>
          <div className="glass-card rounded-[16px] p-6 w-[480px] max-w-[calc(100vw-32px)] shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] relative"
            style={{ background: 'var(--bg-modal)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => setShowAssignModal(false)} className="absolute top-4 right-4 bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-lg"><i className="ph ph-x" /></button>
            <div className="text-lg font-bold text-primary mb-1">Assign Task</div>
            <div className="text-xs text-text-secondary mb-5">Schedule a new farming operation.</div>

            <form onSubmit={handleAssignTaskSubmit}>
              <div className="space-y-4 mb-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-primary">Task Title</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Irrigate plot 4"
                    style={{
                      background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '8px',
                      color: '#111827', fontSize: '14px', height: '40px', padding: '0 12px',
                      width: '100%', outline: 'none', boxSizing: 'border-box',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'text',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#9CA3AF'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
                    onFocus={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)'; }}
                    onBlur={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                  {formErrors.title && <span className="text-[10px]" style={{ color: '#DC2626' }}>{formErrors.title}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-primary">Assigned To</label>
                  <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                    style={{
                      background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '8px',
                      color: form.assignedTo ? '#111827' : '#9CA3AF', fontSize: '14px', height: '40px', padding: '0 36px 0 12px',
                      width: '100%', outline: 'none', boxSizing: 'border-box', cursor: 'pointer',
                      transition: 'all 0.2s ease', appearance: 'none',
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 fill=%27%236B7280%27 viewBox=%270 0 256 256%27%3E%3Cpath d=%27M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80a8,8,0,0,1,11.32-11.32L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z%27%3E%3C/path%3E%3C/svg%3E")',
                      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '14px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#9CA3AF'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <option value="" disabled>Select a user</option>
                    {users.map((u) => <option key={u.email} value={u.name}>{u.name}</option>)}
                  </select>
                  {formErrors.assignedTo && <span className="text-[10px]" style={{ color: '#DC2626' }}>{formErrors.assignedTo}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-primary">Farm Sector</label>
                  <select value={form.farm} onChange={(e) => setForm({ ...form, farm: e.target.value })}
                    style={{
                      background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '8px',
                      color: form.farm ? '#111827' : '#9CA3AF', fontSize: '14px', height: '40px', padding: '0 36px 0 12px',
                      width: '100%', outline: 'none', boxSizing: 'border-box', cursor: 'pointer',
                      transition: 'all 0.2s ease', appearance: 'none',
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 fill=%27%236B7280%27 viewBox=%270 0 256 256%27%3E%3Cpath d=%27M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80a8,8,0,0,1,11.32-11.32L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z%27%3E%3C/path%3E%3C/svg%3E")',
                      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '14px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#9CA3AF'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <option value="" disabled>Select a farm</option>
                    {farms.map((f) => <option key={f.name} value={f.name}>{f.name}</option>)}
                  </select>
                  {formErrors.farm && <span className="text-[10px]" style={{ color: '#DC2626' }}>{formErrors.farm}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-primary">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    style={{
                      background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '8px',
                      color: '#111827', fontSize: '14px', height: '40px', padding: '0 36px 0 12px',
                      width: '100%', outline: 'none', boxSizing: 'border-box', cursor: 'pointer',
                      transition: 'all 0.2s ease', appearance: 'none',
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 fill=%27%236B7280%27 viewBox=%270 0 256 256%27%3E%3Cpath d=%27M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80a8,8,0,0,1,11.32-11.32L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z%27%3E%3C/path%3E%3C/svg%3E")',
                      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '14px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#9CA3AF'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-primary">Priority</label>
                  <div className="flex gap-2">
                    {priorityOptions.map((p) => {
                      const active = form.priority === p;
                      const colorMap = { High: '#DC2626', Medium: '#D97706', Low: '#10B981' };
                      return (
                        <button key={p} type="button" onClick={() => setForm({ ...form, priority: p })}
                          style={{
                            flex: 1, padding: '8px 0', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                            borderRadius: '8px', border: active ? `2px solid ${colorMap[p]}` : '1px solid #D1D5DB',
                            background: active ? `${colorMap[p]}15` : '#FFFFFF',
                            color: active ? colorMap[p] : '#4B5563',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = colorMap[p]; e.currentTarget.style.background = `${colorMap[p]}10`; } }}
                          onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.background = '#FFFFFF'; } }}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-primary">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    style={{
                      background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '8px',
                      color: '#111827', fontSize: '14px', height: '40px', padding: '0 12px',
                      width: '100%', outline: 'none', boxSizing: 'border-box',
                      transition: 'all 0.2s ease', cursor: 'text',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#9CA3AF'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                  {formErrors.dueDate && <span className="text-[10px]" style={{ color: '#DC2626' }}>{formErrors.dueDate}</span>}
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 mt-5 w-full">
                <button type="button" onClick={() => setShowAssignModal(false)}
                  className="text-xs px-3.5 py-1.5 border border-[rgba(0,0,0,0.05)] rounded-xl cursor-pointer bg-white text-text-secondary font-medium hover:bg-[#E5E5EA] active:scale-[0.97] transition-all duration-150"
                >
                  Cancel
                </button>
                <button type="submit"
                  className="bg-brand text-white border-none rounded-xl px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 hover:opacity-90 active:scale-[0.97] transition-all duration-150"
                >
                  <i className="ph ph-check" /> Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
