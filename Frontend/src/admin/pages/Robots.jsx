import UserProfileModal from '../../admin/components/UserProfileModal';
import { useState, useRef, useEffect } from 'react';
import { useRobots } from '../../context/RobotContext';
import { useUsers } from '../../context/UserContext';
import { useFarms } from '../../context/FarmContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../utils/activityLogger';
import { useNavigate } from 'react-router-dom';

const models = ['AB-X1000', 'AB-X2000', 'AB-X3000'];
const farmNames = ['Green Valley Farm', 'Sunrise Orchards', 'Golden Harvest', 'Maple Ridge Farm', 'River Bend Agriculture', 'Highland Crops', 'Coastal Farms', 'Valley View Ranch'];
const statuses = ['Active', 'Idle', 'Offline'];

const statusOpts = {
  Active: { stCls: 'bg-brand-light text-brand-dark pill' },
  Idle: { stCls: 'bg-warning-bg text-warning-text pill' },
  Offline: { stCls: 'bg-danger-bg text-danger-text pill' },
};

const inputClass = "text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/60 w-full placeholder:text-text-placeholder text-[#1C1C1E] transition-all duration-200";
const labelClass = "text-xs font-medium text-[#1C1C1E]";
const cancelBtnClass = "text-xs px-3.5 py-1.5 border border-[rgba(0,0,0,0.05)] rounded-xl cursor-pointer bg-white text-text-secondary font-medium hover:bg-[#E5E5EA]";
const submitBtnClass = "bg-brand text-white border-none rounded-xl px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 hover:opacity-90";
const modalOverlay = "fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm";
const modalBox = "glass-card rounded-[20px] p-6 w-[450px] shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] relative";

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

function FormFields({ form, setForm, errors, userNames }) {
  return (
    <>
      <div className="flex flex-col gap-1.5 mb-4">
        <label className={labelClass}>Robot Name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., AgriBot Alpha" className={inputClass}
          style={{ cursor: 'text' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#9CA3AF'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.15)'; e.currentTarget.style.outline = 'none'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
        />
        {errors.name && <span className="text-[10px] text-danger-text">{errors.name}</span>}
      </div>
      <div className="flex flex-col gap-1.5 mb-4">
        <label className={labelClass}>Robot ID</label>
        <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="e.g., AgriBot-001" className={inputClass}
          style={{ cursor: 'text' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#9CA3AF'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.15)'; e.currentTarget.style.outline = 'none'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
        />
        {errors.id && <span className="text-[10px] text-danger-text">{errors.id}</span>}
      </div>
      <div className="flex flex-col gap-1.5 mb-4">
        <label className={labelClass}>Model</label>
        <Select options={models} value={form.model} onChange={(v) => setForm({ ...form, model: v })} />
      </div>
      <div className="flex flex-col gap-1.5 mb-4">
        <label className={labelClass}>Owner</label>
        <Select options={userNames} value={form.owner} onChange={(v) => setForm({ ...form, owner: v })} placeholder="No users available" />
      </div>
      <div className="flex flex-col gap-1.5 mb-4">
        <label className={labelClass}>Assigned Farm</label>
        <Select options={farmNames} value={form.farm} onChange={(v) => setForm({ ...form, farm: v })} />
      </div>
      <div className="flex flex-col gap-1.5 mb-6">
        <label className={labelClass}>Status</label>
        <Select options={statuses} value={form.status} onChange={(v) => setForm({ ...form, status: v })} />
      </div>
    </>
  );
}

export default function Robots() {
  const navigate = useNavigate();
  const { robots, addRobot, updateRobot, removeRobot } = useRobots();
  const { users } = useUsers();
  const { farms, addFarm, updateFarm } = useFarms();
  const { currentUser } = useAuth();
  const userNames = users.length ? users.map((u) => u.name) : [];
  const defaultOwner = userNames.length ? userNames[0] : '';
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRobot, setEditRobot] = useState(null);
  const [deleteRobot, setDeleteRobot] = useState(null);
  const [form, setForm] = useState({ name: '', id: '', model: 'AB-X1000', owner: defaultOwner, farm: 'Green Valley Farm', status: 'Idle' });
  const [errors, setErrors] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);

  const openAdd = () => { setForm({ name: '', id: '', model: 'AB-X1000', owner: defaultOwner, farm: 'Green Valley Farm', status: 'Idle' }); setErrors({}); setShowAddModal(true); };
  const openEdit = (robot) => { setForm({ name: robot.name, id: robot.id, model: robot.model, owner: robot.owner || '', farm: robot.farm, status: robot.status }); setErrors({}); setEditRobot(robot); };
  const openDelete = (robot) => setDeleteRobot(robot);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Robot name is required';
    if (!form.id.trim()) errs.id = 'Robot ID is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // TODO: Replace with real backend API call once backend is added — this is a frontend-only simulation.
  const handleAdd = (e) => {
    e.preventDefault();
    if (!validate()) return;
    addRobot({ name: form.name.trim(), id: form.id.trim(), farm: form.farm, model: form.model, owner: form.owner, battery: 100, status: form.status, stCls: statusOpts[form.status].stCls });
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Added Robot', target: form.name.trim(), details: `ID: ${form.id.trim()}, Model: ${form.model}, Farm: ${form.farm}` });
    const targetFarm = farms.find((f) => f.name === form.farm);
    if (targetFarm) { updateFarm(targetFarm, { owner: form.owner }); }
    else { addFarm({ name: form.farm, owner: form.owner, crop: '—', soil: '—', location: '—', robot: '—', status: 'Inactive', cls: 'bg-[#7676801F] text-text-placeholder', size: '—', cropTypes: '—', devices: '0' }); }
    setShowAddModal(false);
  };

  // TODO: Replace with real backend API call once backend is added — this is a frontend-only simulation.
  const handleEdit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    updateRobot(editRobot, { name: form.name.trim(), id: form.id.trim(), farm: form.farm, model: form.model, owner: form.owner, status: form.status, stCls: statusOpts[form.status].stCls });
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Edited Robot', target: editRobot.name, details: `ID: ${editRobot.id} → Status: ${form.status}` });
    const targetFarm = farms.find((f) => f.name === form.farm);
    if (targetFarm) { updateFarm(targetFarm, { owner: form.owner }); }
    else { addFarm({ name: form.farm, owner: form.owner, crop: '—', soil: '—', location: '—', robot: '—', status: 'Inactive', cls: 'bg-[#7676801F] text-text-placeholder', size: '—', cropTypes: '—', devices: '0' }); }
    setEditRobot(null);
  };

  // TODO: Replace with real backend API call once backend is added — this is a frontend-only simulation.
  const handleDelete = () => {
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Deleted Robot', target: deleteRobot.name, details: `ID: ${deleteRobot.id}, Model: ${deleteRobot.model}` });
    removeRobot(deleteRobot); setDeleteRobot(null);
  };

  const active = robots.filter((r) => r.status === 'Active').length;
  const idle = robots.filter((r) => r.status === 'Idle').length;
  const offline = robots.filter((r) => r.status === 'Offline').length;

  return (
    <>
      <style>{`@keyframes statusPulse { 0% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.5; } }`}</style>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-bold text-[#000000]">Robot Management</div>
          <div className="text-sm text-text-secondary mt-1">Monitor and control agricultural robots</div>
        </div>
        <button onClick={openAdd} className={submitBtnClass}
          style={{ cursor: 'pointer' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.opacity = ''; }}
        ><i className="ph ph-plus" /> Add Robot</button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div onClick={() => navigate('/admin/robots')} className="dashboard-card-link glass-card rounded-2xl p-5 overflow-hidden" style={{ contentVisibility: 'auto' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.7) 0%, transparent 70%)', filter: 'blur(30px)', opacity: 0.35 }} />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#6B7280] mb-2">Online</div>
              <div className="text-3xl font-extrabold text-[#000000]">{active}</div>
              <div className="text-[10px] text-[#22C55E] mt-1">85–100% battery</div>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: '#e8f5e9' }}>
              <i className="ph ph-activity" style={{ color: '#059669' }} />
            </div>
          </div>
        </div>
        <div className="dashboard-card-link glass-card rounded-2xl p-5 overflow-hidden" style={{ contentVisibility: 'auto' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.7) 0%, transparent 70%)', filter: 'blur(30px)', opacity: 0.35 }} />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#6B7280] mb-2">Idle</div>
              <div className="text-3xl font-extrabold text-[#000000]">{idle}</div>
              <div className="text-[10px] text-[#D97706] mt-1">45–62% battery</div>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: '#fff3e0' }}>
              <i className="ph ph-clock" style={{ color: '#d97706' }} />
            </div>
          </div>
        </div>
        <div className="dashboard-card-link glass-card rounded-2xl p-5 overflow-hidden" style={{ contentVisibility: 'auto' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.7) 0%, transparent 70%)', filter: 'blur(30px)', opacity: 0.35 }} />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#6B7280] mb-2">Maintenance</div>
              <div className="text-3xl font-extrabold text-[#000000]">0</div>
              <div className="text-[10px] text-text-secondary mt-1">N/A</div>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: '#e0f2fe' }}>
              <i className="ph ph-toolbox" style={{ color: '#0284c7' }} />
            </div>
          </div>
        </div>
        <div className="dashboard-card-link glass-card rounded-2xl p-5 overflow-hidden" style={{ contentVisibility: 'auto' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.7) 0%, transparent 70%)', filter: 'blur(30px)', opacity: 0.35 }} />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#6B7280] mb-2">Offline</div>
              <div className="text-3xl font-extrabold text-[#000000]">{offline}</div>
              <div className="text-[10px] text-[#EF4444] mt-1">12% battery last seen</div>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: '#ffebee' }}>
              <i className="ph ph-wifi-slash" style={{ color: '#dc2626' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[20px] p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', contentVisibility: 'auto', willChange: 'transform' }}>
        <div className="flex flex-col items-stretch mb-4">
          <div className="text-sm font-semibold text-[#1C1C1E] mb-3">All Robots ({robots.length})</div>
          <input placeholder="Search robots by ID or model..." aria-label="Search robots" className={inputClass}
            style={{ cursor: 'text' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#9CA3AF'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.15)'; e.currentTarget.style.outline = 'none'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
          />
        </div>
        <table className="w-full border-collapse text-sm" style={{ userSelect: 'none', tableLayout: 'fixed' }}>
          <thead>
            <tr><th className="text-left px-3 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)', width: '16%' }}>Name</th><th className="text-left px-3 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)', width: '15%' }}>ID</th><th className="text-left px-3 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)', width: '13%' }}>Owner</th><th className="text-left px-3 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)', width: '18%' }}>Farm</th><th className="text-left px-3 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)', width: '12%' }}>Model</th><th className="text-left px-3 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)', width: '11%' }}>Battery</th><th className="text-left px-3 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)', width: '8%' }}>Status</th><th className="text-left px-3 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)', width: '7%' }}>Actions</th></tr>
          </thead>
          <tbody>
            {robots.map((r, i) => (
              <tr key={i}>
                <td className="px-3 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}><strong className="text-[#1C1C1E] font-medium">{r.name}</strong></td>
                <td className="px-3 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}><code className="text-xs bg-white/30 px-1.5 py-0.5 rounded-xl text-[#1C1C1E]">{r.id}</code></td>
                <td className="px-3 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                  <span style={{ cursor: 'pointer', fontWeight: 600, color: '#111827', textDecoration: 'none', transition: 'color 0.15s ease, text-decoration 0.15s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#10B981'; e.currentTarget.style.textDecoration = 'underline'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.textDecoration = ''; }}
                    onClick={() => { const u = users.find((x) => x.name === r.owner); if (u) setSelectedUser(u); }}
                  >{r.owner}</span>
                </td>
                <td className="px-3 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{r.farm}</td>
                <td className="px-3 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{r.model}</td>
                <td className="px-3 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-10 h-1.5 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'rgba(255,255,255,0.3)' }}>
                      <div className="h-full rounded-full" style={{ width: `${r.battery}%`, background: r.battery >= 60 ? '#22C55E' : r.battery >= 30 ? '#F59E0B' : '#EF4444' }} />
                    </div>
                    <span className="text-xs font-medium text-[#1C1C1E] flex-shrink-0">{r.battery}%</span>
                  </div>
                </td>
                <td className="px-3 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                  <span className="inline-flex items-center" style={{ gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: r.status === 'Active' ? '#10B981' : r.status === 'Idle' ? '#D97706' : '#EF4444', animation: r.status === 'Active' ? 'statusPulse 2s ease-in-out infinite' : 'none' }} />
                    <span style={{ color: r.status === 'Active' ? '#10B981' : r.status === 'Idle' ? '#D97706' : '#EF4444', fontSize: '12px', fontWeight: 500, letterSpacing: '0.01em' }}>{r.status}</span>
                  </span>
                </td>
                <td className="px-3 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                  <div className="flex gap-2 items-center">
                    <button title="Edit" onClick={() => openEdit(r)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-lg transition-all duration-200 hover:scale-110"><i className="ph ph-pencil" /></button>
                    <button title="Delete" onClick={() => openDelete(r)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-danger-text text-lg transition-all duration-200 hover:scale-110"><i className="ph ph-trash" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className={modalOverlay}>
          <div className={modalBox} style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}>
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 bg-none border-none text-text-placeholder text-lg transition-all duration-150"
              style={{ cursor: 'pointer', transition: 'color 0.15s ease, transform 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
            ><i className="ph ph-x" /></button>
            <div className="text-lg font-bold text-[#1C1C1E] mb-1">Add New Robot</div>
            <div className="text-xs text-text-secondary mb-5">Register a new agricultural robot.</div>
            <form onSubmit={handleAdd}>
              <FormFields form={form} setForm={setForm} errors={errors} userNames={userNames} />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className={cancelBtnClass}
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
                >Add Robot</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editRobot && (
        <div className={modalOverlay}>
          <div className={modalBox} style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}>
            <button onClick={() => setEditRobot(null)} className="absolute top-4 right-4 bg-none border-none text-text-placeholder text-lg transition-all duration-150"
              style={{ cursor: 'pointer', transition: 'color 0.15s ease, transform 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
            ><i className="ph ph-x" /></button>
            <div className="text-lg font-bold text-[#1C1C1E] mb-1">Edit Robot</div>
            <div className="text-xs text-text-secondary mb-5">Update details for {editRobot.name}.</div>
            <form onSubmit={handleEdit}>
              <FormFields form={form} setForm={setForm} errors={errors} userNames={userNames} />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditRobot(null)} className={cancelBtnClass}
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
                >Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteRobot && (
        <div className={modalOverlay} onClick={() => setDeleteRobot(null)}>
          <div className="rounded-[20px] p-6 w-[400px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-white/50" onClick={(e) => e.stopPropagation()} style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}>
            <div className="text-lg font-bold text-[#1C1C1E] mb-2">Delete Robot?</div>
            <div className="text-sm text-text-secondary mb-6">
              Are you sure you want to remove <strong className="text-[#1C1C1E] font-medium">{deleteRobot.name}</strong> ({deleteRobot.id}) from the fleet registry? This action cannot be reverted.
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteRobot(null)} className={cancelBtnClass}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.borderColor = '#9CA3AF'; e.currentTarget.style.color = '#111827'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = ''; }}
              >Cancel</button>
              <button onClick={handleDelete} className="bg-danger-bg text-danger-text border-none rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2 transition-all duration-200"
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(220,38,38,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.opacity = ''; }}
              ><i className="ph ph-trash" /> Delete</button>
            </div>
          </div>
        </div>
      )}
      {selectedUser && <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </>
  );
}
