import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTaskStore } from '../../stores/taskStore';
import { useUsers } from '../../context/UserContext';
import { useFarms } from '../../context/FarmContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../utils/activityLogger';
import DatePicker from '../components/DatePicker';
import UserProfileModal from '../components/UserProfileModal';
import { ClipboardList, FileText, User, MapPin, Tag, AlertCircle, Calendar, Check, ChevronDown, Droplets, Sprout, Search, Wrench, Wheat, Trash2 } from 'lucide-react';

const priorityStyles = {
  High: { cls: 'bg-danger-bg text-danger-text' },
  Medium: { cls: 'bg-warning-bg text-warning-text' },
  Low: { cls: 'bg-brand-light text-brand-dark' },
};

const typeIconMap = {
  Irrigation: Droplets,
  Fertilizer: Sprout,
  Inspection: Search,
  Maintenance: Wrench,
  Harvest: Wheat,
};

const typeStyles = {
  Irrigation: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
  Fertilizer: { bg: 'rgba(161,98,7,0.1)', color: '#a16207' },
  Inspection: { bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6' },
  Maintenance: { bg: 'rgba(249,115,22,0.1)', color: '#f97316' },
  Harvest: { bg: 'rgba(46,125,50,0.1)', color: '#2e9e6b' },
};

const typeOptions = ['Irrigation', 'Fertilizer', 'Inspection', 'Harvesting'];
const priorityOptions = ['High', 'Medium', 'Low'];

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

function SelectDropdown({ options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const base = {
    background: 'rgba(255,255,255,0.5)', border: '1px solid #D1D5DB', borderRadius: '12px',
    color: '#111827', fontSize: '14px', height: '40px', padding: '0 36px 0 12px',
    width: '100%', outline: 'none', boxSizing: 'border-box', cursor: 'pointer',
    transition: 'all 0.2s ease', textAlign: 'left', position: 'relative',
  };

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)}
        style={{ ...base, boxShadow: open ? '0 0 0 2px rgba(52,199,89,0.3)' : 'none' }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.borderColor = '#9CA3AF'; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.borderColor = '#D1D5DB'; }}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#4caf50'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(52,199,89,0.3)'; }}
        onBlur={(e) => { if (!open) { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none'; } }}
      >
        <span style={{ color: value ? '#111827' : '#9CA3AF' }}>{value || placeholder}</span>
        <i className={`ph ph-caret-down`} style={{ position: 'absolute', right: '12px', top: '50%', transform: `translateY(-50%) rotate(${open ? '180deg' : '0deg'})`, color: '#6B7280', fontSize: '12px', transition: 'transform 0.2s ease' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', zIndex: 100, top: '100%', left: 0, right: 0, marginTop: '4px',
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)',
          border: '1px solid rgba(255,255,255,0.6)', borderRadius: '14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden',
        }}>
          {options.map((opt) => {
            const selected = opt === value;
            return (
              <div key={opt} onClick={() => { onChange(opt); setOpen(false); }}
                style={{
                  padding: '12px 16px', fontSize: '14px',
                  color: selected ? '#4caf50' : '#1d1d1f',
                  background: selected ? 'rgba(76,175,80,0.12)' : 'transparent',
                  cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
                onMouseEnter={(e) => {
                  if (!selected) { e.currentTarget.style.background = 'rgba(76,175,80,0.12)'; e.currentTarget.style.color = '#4caf50'; }
                }}
                onMouseLeave={(e) => {
                  if (!selected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1d1d1f'; }
                }}
              >
                <span>{opt}</span>
                {selected && <span style={{ color: '#4caf50', fontSize: '14px', fontWeight: 600 }}>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterSelect({ label, options, value, onChange, width }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const isActive = value !== options[0];
  return (
    <div>
      {label && (
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>{label}</div>
      )}
      <div className="relative" ref={ref} style={{ width: width || '160px' }}>
        <button type="button" onClick={() => setOpen((o) => !o)}
          style={{
            background: '#ffffff', border: '1px solid rgba(76,175,80,0.2)', borderRadius: '8px',
            color: '#374151', fontSize: '13px', padding: '8px 12px',
            width: '100%', outline: 'none', boxSizing: 'border-box', cursor: 'pointer',
            transition: 'all 0.2s ease', textAlign: 'left', position: 'relative',
            display: 'flex', alignItems: 'center',
            borderLeft: isActive ? '2px solid #2e7d32' : '1px solid rgba(76,175,80,0.2)',
          }}
          onMouseEnter={(e) => { if (!open) { e.currentTarget.style.borderColor = 'rgba(76,175,80,0.4)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(46,125,50,0.1)'; } }}
          onMouseLeave={(e) => { if (!open) { e.currentTarget.style.borderColor = isActive ? 'rgba(76,175,80,0.4)' : 'rgba(76,175,80,0.2)'; e.currentTarget.style.boxShadow = 'none'; } }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, color: value === options[0] ? '#9CA3AF' : '#374151' }}>
            {value}
          </span>
          <ChevronDown size={14} style={{ flexShrink: 0, color: '#6B7280', transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </button>
        {open && (
          <div style={{
            position: 'absolute', zIndex: 100, top: '100%', left: 0, right: 0, marginTop: '4px',
            maxHeight: '240px', overflowY: 'auto',
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(25px)',
            border: '1px solid rgba(255,255,255,0.6)', borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}>
            {options.map((opt) => {
              const sel = opt === value;
              return (
                <div key={opt} onClick={() => { onChange(opt); setOpen(false); }}
                  style={{
                    padding: '10px 14px', fontSize: '13px', cursor: 'pointer',
                    background: sel ? 'rgba(76,175,80,0.12)' : 'transparent',
                    color: sel ? '#4caf50' : '#1d1d1f',
                    transition: 'background 0.15s, color 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                  onMouseEnter={(e) => { if (!sel) { e.currentTarget.style.background = 'rgba(76,175,80,0.12)'; e.currentTarget.style.color = '#4caf50'; } }}
                  onMouseLeave={(e) => { if (!sel) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1d1d1f'; } }}
                >
                  <span>{opt}</span>
                  {sel && <Check size={12} color="#4caf50" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Tasks() {
  const [activeTab, setActiveTab] = useState('all');
  const tasks = useTaskStore((s) => s.tasks);
  const updateTaskStatus = useTaskStore((s) => s.updateTaskStatus);
  const addTask = useTaskStore((s) => s.addTask);
  const removeTask = useTaskStore((s) => s.removeTask);
  const { users } = useUsers();
  const { farms } = useFarms();
  const { currentUser } = useAuth();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [form, setForm] = useState({ title: '', assignedTo: '', farm: '', type: 'Irrigation', priority: 'Medium', dueDate: '' });
  const [formErrors, setFormErrors] = useState({});
  const [profileUser, setProfileUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [farmerFilter, setFarmerFilter] = useState('All Farmers');
  const [fertilizerLevel, setFertilizerLevel] = useState("");
  const [waterQuantity, setWaterQuantity] = useState("");

  const handleTypeChange = (v) => {
    setForm({ ...form, type: v });
    if (v !== 'Fertilizer') setFertilizerLevel("");
    if (v !== 'Irrigation') setWaterQuantity("");
  };

  const inputBase = {
    background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '8px',
    color: '#111827', fontSize: '14px', height: '40px', padding: '0 12px',
    width: '100%', outline: 'none', boxSizing: 'border-box',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'text',
  };
  const inputFocus = (e) => { e.currentTarget.style.borderColor = '#4caf50'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(52,199,89,0.3)'; };
  const inputBlur = (e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none'; };
  const inputHoverEnter = (e) => e.currentTarget.style.borderColor = '#9CA3AF';
  const inputHoverLeave = (e) => e.currentTarget.style.borderColor = '#D1D5DB';

  const openAssign = () => {
    setForm({ title: '', assignedTo: '', farm: '', type: 'Irrigation', priority: 'Medium', dueDate: '' });
    setFormErrors({});
    setFertilizerLevel("");
    setWaterQuantity("");
    setShowAssignModal(true);
  };

  const handleAssignTaskSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Task title is required';
    if (!form.assignedTo) errs.assignedTo = 'Select an assignee';
    if (!form.farm) errs.farm = 'Select a farm';
    if (!form.dueDate) errs.dueDate = 'Select a due date';
    if (form.type === 'Fertilizer') {
      const val = parseFloat(fertilizerLevel);
      if (fertilizerLevel === "" || isNaN(val) || val === 0) {
        errs.fertilizerLevel = 'Please enter a valid fertilizer amount in liters';
      } else if (val < 0) {
        errs.fertilizerLevel = 'Fertilizer amount cannot be negative';
      }
    }
    if (form.type === 'Irrigation') {
      const val = parseFloat(waterQuantity);
      if (waterQuantity === "" || isNaN(val) || val === 0) {
        errs.waterQuantity = 'Please enter a valid water quantity in liters';
      } else if (val < 0) {
        errs.waterQuantity = 'Water quantity cannot be negative';
      }
    }
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
      fertilizerLevel: form.type === 'Fertilizer' ? parseFloat(fertilizerLevel) : null, // TODO: Connect to hardware API for fertilizer dispensing control
      waterQuantity: form.type === 'Irrigation' ? parseFloat(waterQuantity) : null, // TODO: Connect to hardware API for irrigation water flow control
    });
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Assigned Task', target: form.title.trim(), details: `Assigned to: ${form.assignedTo}, Farm: ${form.farm}, Priority: ${form.priority}` });
    setShowAssignModal(false);
  };

  const handleStartTask = (task) => {
    updateTaskStatus(task.id, 'In Progress');
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Started Task', target: task.title, details: `Assigned to: ${task.assignedTo}, Farm: ${task.farm}` });
  };

  const handleCompleteTask = (task) => {
    updateTaskStatus(task.id, 'Completed');
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Completed Task', target: task.title, details: `Assigned to: ${task.assignedTo}, Farm: ${task.farm}` });
  };

  const handleDeleteTask = (task) => {
    removeTask(task.id);
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Deleted Task', target: task.title, details: `Assigned to: ${task.assignedTo}, Farm: ${task.farm}` });
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
    let result = tasks;
    if (activeTab === 'pending') result = result.filter((t) => t.status === 'Pending');
    else if (activeTab === 'inprog') result = result.filter((t) => t.status === 'In Progress');
    else if (activeTab === 'done') result = result.filter((t) => t.status === 'Completed');
    if (priorityFilter !== 'All Priorities') result = result.filter(t => t.priority === priorityFilter);
    if (typeFilter !== 'All Types') result = result.filter(t => t.type === typeFilter);
    if (farmerFilter !== 'All Farmers') result = result.filter(t => t.assignedTo === farmerFilter);
    const q = searchTerm.toLowerCase().trim();
    if (q) {
      result = result.filter(t => 
        (t.title || '').toLowerCase().includes(q) || 
        (t.assignedTo || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [tasks, activeTab, priorityFilter, typeFilter, farmerFilter, searchTerm]);

  const priorityFilterOptions = useMemo(() => ['All Priorities', ...new Set(tasks.map(t => t.priority).filter(Boolean))], [tasks]);
  const typeFilterOptions = useMemo(() => ['All Types', ...new Set(tasks.map(t => t.type).filter(Boolean))], [tasks]);
  const farmerFilterOptions = useMemo(() => ['All Farmers', ...new Set(tasks.map(t => t.assignedTo).filter(Boolean))], [tasks]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-bold text-primary">Task Management</div>
          <div className="text-sm text-text-secondary mt-1">Assign and track agricultural tasks</div>
        </div>
        <button onClick={openAssign} className="bg-brand text-white border-none rounded-xl px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(46,125,50,0.35)]">
          <i className="ph ph-plus" /> Assign Task
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <GlowCard onClick={() => setActiveTab('all')} className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-secondary mb-2">Total Tasks</div>
              <div className="text-3xl font-extrabold text-primary">{totalTasks}</div>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: '#e0f2fe' }}>
              <i className="ph ph-list" style={{ color: '#0284c7' }} />
            </div>
          </div>
        </GlowCard>
        <GlowCard onClick={() => setActiveTab('pending')} className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-secondary mb-2">Pending</div>
              <div className="text-3xl font-extrabold text-primary">{pendingCount}</div>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: '#fff3e0' }}>
              <i className="ph ph-clock" style={{ color: '#d97706' }} />
            </div>
          </div>
        </GlowCard>
        <GlowCard onClick={() => setActiveTab('inprog')} className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-secondary mb-2">In Progress</div>
              <div className="text-3xl font-extrabold text-primary">{inProgressCount}</div>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: '#e3f2fd' }}>
              <i className="ph ph-play" style={{ color: '#1565c0' }} />
            </div>
          </div>
        </GlowCard>
        <GlowCard onClick={() => setActiveTab('done')} className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-secondary mb-2">Completed</div>
              <div className="text-3xl font-extrabold text-primary">{completedCount}</div>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: '#e8f5e9' }}>
              <i className="ph ph-check-circle" style={{ color: '#2e7d2e' }} />
            </div>
          </div>
        </GlowCard>
      </div>

      <div className="rounded-[20px] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', contentVisibility: 'auto', willChange: 'transform' }}>
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
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search tasks by title or assignee..." aria-label="Search tasks" className="text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/60 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder text-primary" />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', padding: '12px 0', borderBottom: '1px solid rgba(76,175,80,0.08)', marginBottom: '12px' }}>
          <FilterSelect label="PRIORITY" options={priorityFilterOptions} value={priorityFilter} onChange={setPriorityFilter} width="160px" />
          <FilterSelect label="TYPE" options={typeFilterOptions} value={typeFilter} onChange={setTypeFilter} width="160px" />
          <FilterSelect label="ASSIGNED TO" options={farmerFilterOptions} value={farmerFilter} onChange={setFarmerFilter} width="180px" />
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span>Showing {filteredTasks.length} of {tasks.length} tasks</span>
          {(searchTerm || priorityFilter !== 'All Priorities' || typeFilter !== 'All Types' || farmerFilter !== 'All Farmers') && (
            <span onClick={() => { setSearchTerm(''); setPriorityFilter('All Priorities'); setTypeFilter('All Types'); setFarmerFilter('All Farmers'); }}
              style={{ color: '#2e7d32', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1a5c1a'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#2e7d32'}
            >Clear Filters</span>
          )}
        </div>

        <table className="w-full border-collapse text-sm" style={{ userSelect: 'none' }}>
          <thead>
            <tr><th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Task</th><th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Assigned to</th><th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Farm</th><th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Type</th><th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Priority</th><th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Due date</th><th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Action</th></tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr><td colSpan="7"><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.3 }}><i className="ph ph-funnel" /></div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>No tasks match your current filters</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>Try adjusting or clearing your filters</div>
                <span onClick={() => { setSearchTerm(''); setPriorityFilter('All Priorities'); setTypeFilter('All Types'); setFarmerFilter('All Farmers'); }}
                  style={{ color: '#2e7d32', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(76,175,80,0.3)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(76,175,80,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >Clear Filters</span>
              </div></td></tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task.id}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f8f1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  style={{ transition: 'background 0.15s ease' }}
                >
                  <td className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}><strong className="text-primary font-medium">{task.title}</strong></td>
                  <td className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                    <span onClick={() => { const u = users.find((x) => x.name === task.assignedTo); if (u) setProfileUser(u); }}
                      style={{ cursor: 'pointer', fontWeight: 600, color: '#111827', textDecoration: 'none', transition: 'color 0.15s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#4caf50'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#111827'; }}
                    >{task.assignedTo}</span>
                  </td>
                  <td className="px-5 py-5 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>{task.farm}</td>
                  <td className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="pill inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ gap: '5px', background: (typeStyles[task.type] || { bg: 'rgba(255,255,255,0.25)' }).bg, color: (typeStyles[task.type] || { color: '#6B7280' }).color }}>{(() => { const Icon = typeIconMap[task.type]; const ts = typeStyles[task.type]; return Icon ? <Icon size={14} color={ts?.color || '#6B7280'} /> : null; })()}{task.type}</span>
                      {task.fertilizerLevel != null && <span style={{ fontSize: '11px', color: '#6b7280' }}>{parseFloat(task.fertilizerLevel).toFixed(1)} L</span>}
                      {task.waterQuantity != null && <span style={{ fontSize: '11px', color: '#6b7280' }}>{parseFloat(task.waterQuantity).toFixed(1)} L</span>}
                    </div>
                  </td>
                  <td className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}><span className={`pill inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${priorityStyles[task.priority]?.cls || 'bg-white/30 text-text-secondary'}`}>{task.priority}</span></td>
                  <td className="px-5 py-5 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>{task.dueDate}</td>
                  <td className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                    {task.status === 'Pending' && (
                      <button onClick={() => handleStartTask(task)} style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.25)' }} className="text-xs px-3.5 py-1.5 rounded-xl cursor-pointer font-medium transition-all duration-200 hover:scale-[1.02] hover:bg-[rgba(59,130,246,0.18)]">Start</button>
                    )}
                    {task.status === 'In Progress' && (
                      <button onClick={() => handleCompleteTask(task)} style={{ background: 'rgba(46,125,50,0.1)', color: '#2e9e6b', border: '1px solid rgba(46,125,50,0.25)' }} className="text-xs px-3.5 py-1.5 rounded-xl cursor-pointer font-medium transition-all duration-200 hover:scale-[1.02] hover:bg-[rgba(46,125,50,0.18)]">Complete</button>
                    )}
                    {task.status === 'Completed' && (
                      <button onClick={() => handleDeleteTask(task)} style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }} className="inline-flex items-center justify-center gap-1.5 text-xs px-3.5 py-1.5 rounded-xl cursor-pointer font-medium transition-all duration-200 hover:scale-[1.02] hover:bg-[rgba(239,68,68,0.16)]" title="Delete task"><Trash2 size={13} /><span>Delete</span></button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showAssignModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={() => setShowAssignModal(false)}>
          <div className="w-[560px] max-w-[calc(100vw-32px)] rounded-[24px] p-7 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60" onClick={(e) => e.stopPropagation()}
            style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #4caf50, #2e7d2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ClipboardList size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>Assign Task</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>Schedule a new farming operation.</div>
                </div>
              </div>
              <button type="button" onClick={() => setShowAssignModal(false)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#98989D', padding: '4px', display: 'flex', transition: 'color 0.15s ease, transform 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
              ><i className="ph ph-x text-lg" /></button>
            </div>

            <form onSubmit={handleAssignTaskSubmit}>
              <div style={{ background: 'rgba(255,255,255,0.75)', borderRadius: '16px', padding: '20px 24px', border: '1px solid rgba(255,255,255,0.5)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                  <ClipboardList size={15} color="#4caf50" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Task Details</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 32px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <FileText size={12} color="#9CA3AF" /> Task Title
                    </div>
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Irrigate plot 4"
                      style={inputBase}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                      onMouseEnter={inputHoverEnter}
                      onMouseLeave={inputHoverLeave}
                    />
                    {formErrors.title && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{formErrors.title}</span>}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <User size={12} color="#9CA3AF" /> Assigned To
                    </div>
                    <SelectDropdown
                      options={users.map((u) => u.name)}
                      value={form.assignedTo}
                      onChange={(v) => setForm({ ...form, assignedTo: v })}
                      placeholder="Select a user"
                    />
                    {formErrors.assignedTo && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{formErrors.assignedTo}</span>}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <MapPin size={12} color="#9CA3AF" /> Farm Sector
                    </div>
                    <SelectDropdown
                      options={farms.map((f) => f.name)}
                      value={form.farm}
                      onChange={(v) => setForm({ ...form, farm: v })}
                      placeholder="Select a farm"
                    />
                    {formErrors.farm && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{formErrors.farm}</span>}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Tag size={12} color="#9CA3AF" /> Type
                    </div>
                    <SelectDropdown
                      options={typeOptions}
                      value={form.type}
                      onChange={handleTypeChange}
                      placeholder="Select type"
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Calendar size={12} color="#9CA3AF" /> Due Date
                    </div>
                    <div style={{ position: 'relative' }}>
                      <DatePicker value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} />
                    </div>
                    {formErrors.dueDate && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{formErrors.dueDate}</span>}
                  </div>

                  {/* Fertilizer Level — conditional */}
                  <div style={{ gridColumn: '1 / -1', position: 'relative' }}>
                    <div style={{ transition: 'opacity 0.2s ease, transform 0.2s ease', opacity: form.type === 'Fertilizer' ? 1 : 0, transform: form.type === 'Fertilizer' ? 'translateY(0)' : 'translateY(-4px)', pointerEvents: form.type === 'Fertilizer' ? 'auto' : 'none', position: form.type === 'Fertilizer' ? 'relative' : 'absolute', top: 0, left: 0, right: 0, visibility: form.type === 'Fertilizer' ? 'visible' : 'hidden', zIndex: form.type === 'Fertilizer' ? 2 : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                        <Sprout size={12} color="#9CA3AF" /> Fertilizer Level
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input type="number" min="0" step="0.1" placeholder="Enter amount in liters (e.g. 25.5)" value={fertilizerLevel} onChange={(e) => setFertilizerLevel(e.target.value)} style={inputBase} onFocus={inputFocus} onBlur={inputBlur} onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} />
                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '13px' }}>L</span>
                      </div>
                      {formErrors.fertilizerLevel && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{formErrors.fertilizerLevel}</div>}
                    </div>
                    {/* Water Quantity — conditional */}
                    <div style={{ transition: 'opacity 0.2s ease, transform 0.2s ease', opacity: form.type === 'Irrigation' ? 1 : 0, transform: form.type === 'Irrigation' ? 'translateY(0)' : 'translateY(-4px)', pointerEvents: form.type === 'Irrigation' ? 'auto' : 'none', position: form.type === 'Irrigation' ? 'relative' : 'absolute', top: 0, left: 0, right: 0, visibility: form.type === 'Irrigation' ? 'visible' : 'hidden', zIndex: form.type === 'Irrigation' ? 2 : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                        <Droplets size={12} color="#9CA3AF" /> Water Quantity
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input type="number" min="0" step="0.1" placeholder="Enter amount in liters (e.g. 100.0)" value={waterQuantity} onChange={(e) => setWaterQuantity(e.target.value)} style={inputBase} onFocus={inputFocus} onBlur={inputBlur} onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} />
                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '13px' }}>L</span>
                      </div>
                      {formErrors.waterQuantity && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{formErrors.waterQuantity}</div>}
                    </div>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                      <AlertCircle size={12} color="#9CA3AF" /> Priority Tier
                    </div>
                    <div className="flex gap-2" style={{ userSelect: 'none' }}>
                      {priorityOptions.map((p) => {
                        const active = form.priority === p;
                        const colorMap = { High: '#DC2626', Medium: '#D97706', Low: '#4caf50' };
                        return (
                          <button key={p} type="button" onClick={() => setForm({ ...form, priority: p })}
                            style={{
                              flex: 1, padding: '8px 0', fontSize: '13px', fontWeight: 600, cursor: 'pointer', userSelect: 'none',
                              borderRadius: '8px', border: active ? `2px solid ${colorMap[p]}` : '1px solid #D1D5DB',
                              background: active ? `${colorMap[p]}15` : '#FFFFFF',
                              color: active ? colorMap[p] : '#4B5563',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = '#E5E7EB'; e.currentTarget.style.color = '#111827'; } }}
                            onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = '#4B5563'; } }}
                            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAssignModal(false)}
                  style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.15)', color: '#4B5563', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s ease', padding: '9px 18px', fontSize: '13px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Cancel
                </button>
                <button type="submit"
                  style={{ background: '#4caf50', color: '#FFFFFF', fontWeight: 600, borderRadius: '12px', padding: '9px 20px', cursor: 'pointer', transition: 'all 0.2s ease', border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(46,125,50,0.35)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '1'; }}
                >
                  <Check size={14} /> Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      {profileUser && <UserProfileModal user={profileUser} onClose={() => setProfileUser(null)} />}
    </>
  );
}
