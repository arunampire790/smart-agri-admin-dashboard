import { Check } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../../context/TaskContext';
import { useUsers } from '../../context/UserContext';
import { useFarms } from '../../context/FarmContext';
import DatePicker from '../../admin/components/DatePicker';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'inprog', label: 'In Progress' },
  { key: 'done', label: 'Completed' },
];

const typeOptions = ['Irrigation', 'Fertilizer', 'Inspection', 'Harvesting'];
const priorityOptions = ['High', 'Medium', 'Low'];

const priorityClass = (p) =>
  p === 'High' ? 'bg-danger-bg text-danger-text' : p === 'Medium' ? 'bg-warning-bg text-warning-text' : 'bg-brand-light text-brand-dark';

const inputClass = "text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/60 w-full placeholder:text-text-placeholder text-[#1C1C1E] transition-all duration-200";
const labelClass = "text-xs font-medium text-[#1C1C1E]";
const cancelBtnClass = "text-xs px-3.5 py-1.5 border border-[rgba(0,0,0,0.05)] rounded-xl bg-white text-text-secondary font-medium transition-all duration-150";
const submitBtnClass = "bg-brand text-white border-none rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2 transition-all duration-200";

function Select({ options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} className={`text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/60 w-full flex items-center justify-between cursor-pointer transition-all duration-200 ${open ? 'shadow-[0_0_0_2px_rgba(52,199,89,0.3)]' : ''}`}
        onMouseEnter={(e) => { if (!open) { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#9CA3AF'; } }}
        onMouseLeave={(e) => { if (!open) { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = ''; } }}
      >
        <span className={value ? 'text-[#1C1C1E]' : 'text-text-placeholder'}>{value || placeholder}</span>
        <i className={`ph ph-caret-down text-text-placeholder text-sm transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-[100] top-full left-0 right-0 mt-1 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] max-h-48 overflow-y-auto border border-white/50" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          {options.map((opt) => {
            const selected = opt === value;
            return (
              <div key={opt} onClick={() => { onChange(opt); setOpen(false); }} className={`flex items-center justify-between px-3.5 py-2.5 text-sm cursor-pointer ${selected ? 'bg-brand-light text-brand-dark' : 'text-[#1C1C1E] hover:bg-brand-light hover:text-brand-dark'}`}>
                <span>{opt}</span>
                {selected && <i className="ph ph-check text-sm text-brand-dark" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Tasks() {
  const navigate = useNavigate();
  const { tasks, addTask, updateTaskStatus, removeTask } = useTasks();
  const { users } = useUsers();
  const { farms } = useFarms();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [form, setForm] = useState({ title: '', assignedTo: '', farm: '', type: 'Irrigation', priority: 'Medium', dueDate: '' });
  const [errors, setErrors] = useState({});

  const userNames = users.length ? users.map((u) => u.name) : [];
  const farmNames = farms.length ? farms.map((f) => f.name) : [];

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

  const openAssign = () => {
    setForm({ title: '', assignedTo: '', farm: '', type: 'Irrigation', priority: 'Medium', dueDate: '' });
    setErrors({});
    setShowAssignModal(true);
  };

  const handleAssignTaskSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Task title is required';
    if (!form.assignedTo) errs.assignedTo = 'Please select an assignee';
    if (!form.farm) errs.farm = 'Please select a farm';
    if (!form.dueDate) errs.dueDate = 'Please select a due date';
    if (Object.keys(errs).length) { setErrors(errs); return; }
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

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-bold text-[#000000]">Task Management</div>
          <div className="text-sm text-text-secondary mt-1">Assign and track agricultural tasks</div>
        </div>
        <button onClick={openAssign} className={submitBtnClass}><i className="ph ph-plus" /> Assign Task</button>
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
            className={inputClass}
            style={{ cursor: 'text' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#9CA3AF'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.15)'; e.currentTarget.style.outline = 'none'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
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

      {/* Assign Task Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowAssignModal(false)}>
          <div className="glass-card rounded-[16px] p-6 w-[450px] shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] relative" onClick={(e) => e.stopPropagation()} style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}>
            <button type="button" onClick={() => setShowAssignModal(false)} className="absolute top-4 right-4 bg-none border-none text-text-placeholder text-lg transition-all duration-150"
              style={{ cursor: 'pointer', transition: 'color 0.15s ease, transform 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
            ><i className="ph ph-x" /></button>
            <div className="text-lg font-bold text-[#1C1C1E] mb-1">Assign Task</div>
            <div className="text-xs text-text-secondary mb-5">Create and assign a new task to a team member.</div>
            <form onSubmit={handleAssignTaskSubmit}>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={labelClass}>Task Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Irrigate plot 4" className={inputClass}
                  style={{ cursor: 'text' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#9CA3AF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.15)'; e.currentTarget.style.outline = 'none'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                />
                {errors.title && <span className="text-[10px] text-danger-text">{errors.title}</span>}
              </div>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={labelClass}>Assigned To</label>
                <Select options={userNames} value={form.assignedTo} onChange={(v) => setForm({ ...form, assignedTo: v })} placeholder="Select assignee" />
                {errors.assignedTo && <span className="text-[10px] text-danger-text">{errors.assignedTo}</span>}
              </div>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={labelClass}>Farm Sector</label>
                <Select options={farmNames} value={form.farm} onChange={(v) => setForm({ ...form, farm: v })} placeholder="Select farm" />
                {errors.farm && <span className="text-[10px] text-danger-text">{errors.farm}</span>}
              </div>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={labelClass}>Type Tag</label>
                <Select options={typeOptions} value={form.type} onChange={(v) => setForm({ ...form, type: v })} />
              </div>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={labelClass}>Priority Tier</label>
                <div className="flex gap-2">
                  {priorityOptions.map((p) => {
                    const isActive = form.priority === p;
                    return (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setForm({ ...form, priority: p })}
                        className={`flex-1 text-xs px-4 py-2 rounded-xl font-semibold border transition-all duration-150 ${
                          isActive ? 'bg-brand text-white border-brand' : 'bg-white/50 text-text-secondary border-white/60'
                        }`}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                        onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = '#E5E7EB'; e.currentTarget.style.color = '#111827'; } }}
                        onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; } }}
                        onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                        onMouseUp={(e) => { e.currentTarget.style.transform = ''; }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={labelClass}>Due Date</label>
                <DatePicker value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} />
                {errors.dueDate && <span className="text-[10px] text-danger-text">{errors.dueDate}</span>}
              </div>
              <div className="flex justify-end items-center gap-3 mt-5 w-full">
                <button type="button" onClick={() => setShowAssignModal(false)} className={cancelBtnClass}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.borderColor = '#9CA3AF'; e.currentTarget.style.color = '#111827'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = ''; }}
                >Cancel</button>
                <button type="submit" className={submitBtnClass}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.opacity = ''; }}
                ><Check size={16} color="#FFFFFF" /> Assign Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
