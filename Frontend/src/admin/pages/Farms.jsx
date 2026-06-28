import { Sprout, Compass, Layers, Bot, Check } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarms } from '../../context/FarmContext';
import { useRobots } from '../../context/RobotContext';
import { useUsers } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../utils/activityLogger';
import UserProfileModal from '../../admin/components/UserProfileModal';

const inputClass = "text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/60 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder text-[#1C1C1E]";
const labelClass = "text-xs font-medium text-[#1C1C1E]";
const cancelBtnClass = "text-xs px-3.5 py-1.5 border border-[rgba(0,0,0,0.05)] rounded-xl cursor-pointer bg-white text-text-secondary font-medium hover:bg-[#E5E5EA]";
const submitBtnClass = "bg-brand text-white border-none rounded-xl px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 hover:opacity-90";
const statusOptions = ['Active', 'Idle', 'Offline'];
const inputFieldClass = "text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/60 w-full placeholder:text-text-placeholder text-[#1C1C1E] transition-all duration-200";

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

function getStatusLabel(connectedRobots) {
  if (connectedRobots.length === 0) return { label: 'Offline', cls: 'bg-danger-bg text-danger-text pill' };
  if (connectedRobots.some((r) => r.status === 'Active')) return { label: 'Active', cls: 'bg-brand-light text-brand-dark pill' };
  return { label: 'Idle', cls: 'bg-warning-bg text-warning-text pill' };
}

function getGlowColor(label) {
  switch (label) {
    case 'Total Farms': return 'radial-gradient(circle, rgba(5,150,105,0.7) 0%, transparent 70%)';
    case 'Regions': return 'radial-gradient(circle, rgba(59,130,246,0.7) 0%, transparent 70%)';
    case 'Crop Types': return 'radial-gradient(circle, rgba(147,51,234,0.7) 0%, transparent 70%)';
    case 'Active Robots': return 'radial-gradient(circle, rgba(5,150,105,0.7) 0%, transparent 70%)';
    default: return 'radial-gradient(circle, rgba(59,130,246,0.7) 0%, transparent 70%)';
  }
}

function getIconConfig(label) {
  switch (label) {
    case 'Total Farms': return { icon: 'ph-warehouse', bg: '#e8f5e9', color: '#059669' };
    case 'Regions': return { icon: 'ph-map-pin', bg: '#e0f2fe', color: '#0284c7' };
    case 'Crop Types': return { icon: 'ph-flower', bg: '#f3e5f5', color: '#7c3aed' };
    case 'Active Robots': return { icon: 'ph-robot', bg: '#e8f5e9', color: '#059669' };
    default: return { icon: 'ph-info', bg: '#f5f5f5', color: '#757575' };
  }
}

export default function Farms() {
  const navigate = useNavigate();
  const { farms } = useFarms();
  const { robots } = useRobots();
  const { users } = useUsers();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', owner: '', cropTypes: '', acreage: '', devices: '0', status: 'Active' });
  const [errors, setErrors] = useState({});

  const userNames = users.length ? users.map((u) => u.name) : [];
  const defaultOwner = userNames.length ? userNames[0] : '';

  const openAdd = () => { setForm({ name: '', location: '', owner: defaultOwner, cropTypes: '', acreage: '', devices: '0', status: 'Active' }); setErrors({}); setShowAddModal(true); };

  const validateFarm = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Farm name is required';
    if (!form.location.trim()) errs.location = 'Location is required';
    if (!form.owner) errs.owner = 'Please select an owner';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // TODO: Replace with real backend API call once backend is added — this is a frontend-only simulation.
  const handleAddFarm = (e) => {
    e.preventDefault();
    if (!validateFarm()) return;
    const crop = form.cropTypes.trim() ? form.cropTypes.split(',')[0].trim() : '—';
    const clsMap = { Active: 'active', Idle: 'idle', Offline: 'offline' };
    addFarm({
      name: form.name.trim(),
      owner: form.owner,
      crop,
      soil: '—',
      location: form.location.trim(),
      robot: '—',
      status: form.status,
      cls: clsMap[form.status] || 'active',
      size: form.acreage ? `${form.acreage} acres` : '—',
      cropTypes: form.cropTypes.trim() || '—',
      devices: form.devices || '0',
    });
    // TODO: Replace with real backend API call once backend is added — this is a frontend-only simulation.
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Added Farm', target: form.name.trim(), details: `Location: ${form.location.trim()}, Owner: ${form.owner}, Acreage: ${form.acreage || '—'}` });
    setShowAddModal(false);
  };

  const regions = useMemo(() => [...new Set(farms.map((f) => f.location.split(', ')[1] + ', ' + f.location.split(', ')[0]))], [farms]);
  const cropTypes = useMemo(() => [...new Set(farms.map((f) => f.crop))], [farms]);
  const activeRobotCount = useMemo(() => robots.filter((r) => r.status === 'Active').length, [robots]);

  const statCards = [
    { val: String(farms.length), label: 'Total Farms', route: '/admin/farms' },
    { val: String(regions.length), label: 'Regions' },
    { val: String(cropTypes.length), label: 'Crop Types' },
    { val: String(activeRobotCount), label: 'Active Robots', route: '/admin/robots' },
  ];

  const farmRows = useMemo(() => {
    const visible = !searchTerm.trim()
      ? farms
      : (() => {
          const q = searchTerm.toLowerCase();
          return farms.filter(
            (f) => f.name.toLowerCase().includes(q) || f.location.toLowerCase().includes(q) || f.owner.toLowerCase().includes(q)
          );
        })();
    return visible.map((farm) => {
      const connectedRobots = robots.filter((r) => r.farm === farm.name);
      return { farm, connectedCount: connectedRobots.length, status: getStatusLabel(connectedRobots) };
    });
  }, [farms, robots, searchTerm]);

  return (
    <>
      <style>{`@keyframes statusPulse { 0% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.5; } }`}</style>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-bold text-[#000000]">Farm Management</div>
          <div className="text-sm text-text-secondary mt-1">View and manage agricultural properties</div>
        </div>
        <button onClick={openAdd} className={submitBtnClass}
          style={{ cursor: 'pointer' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.opacity = ''; }}
        ><i className="ph ph-plus" /> Add Farm</button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => {
          return (
            <div
              key={card.label}
              onClick={card.route ? () => navigate(card.route) : undefined}
              className="dashboard-card-link glass-card rounded-2xl p-5 overflow-hidden relative"
              style={{ contentVisibility: 'auto' }}
            >
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: getGlowColor(card.label), filter: 'blur(30px)', opacity: 0.35 }} />
              <div className="relative z-10">
                <div className="text-xs font-semibold text-[#6B7280] mb-2">{card.label}</div>
                <div className="text-3xl font-extrabold text-[#000000]">{card.val}</div>
              </div>
              <div className="absolute flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '12px', top: '24px', right: '24px', zIndex: 10, background: card.label === 'Total Farms' ? 'rgba(16,185,129,0.12)' : card.label === 'Regions' ? 'rgba(99,102,241,0.12)' : card.label === 'Crop Types' ? 'rgba(236,72,153,0.12)' : 'rgba(245,158,11,0.12)', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}>
                {card.label === 'Total Farms' && <Sprout size={18} color="#10B981" />}
                {card.label === 'Regions' && <Compass size={18} color="#6366F1" />}
                {card.label === 'Crop Types' && <Layers size={18} color="#EC4899" />}
                {card.label === 'Active Robots' && <Bot size={18} color="#F59E0B" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-[20px] p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', contentVisibility: 'auto', willChange: 'transform' }}>
        <div className="flex flex-col items-stretch mb-4">
          <div className="text-sm font-semibold text-[#1C1C1E] mb-3">All Farms ({farms.length})</div>
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search farms by name, location, or owner..." aria-label="Search farms" className={inputClass} />
        </div>
        {farmRows.length === 0 ? (
          <div className="py-12 text-center text-text-secondary text-sm">No farms found matching your criteria.</div>
        ) : (
          <table className="w-full border-collapse text-sm" style={{ userSelect: 'none' }}>
            <thead>
              <tr>
                <th className="text-left px-5 py-4 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)', width: '25%' }}>Farm Name</th>
                <th className="text-left px-5 py-4 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)', width: '25%' }}>Location</th>
                <th className="text-left px-5 py-4 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)', width: '20%' }}>Owner</th>
                <th className="text-center px-5 py-4 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)', width: '15%' }}>Connected Devices</th>
                <th className="text-center px-5 py-4 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)', width: '15%' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {farmRows.map(({ farm, connectedCount, status }, i) => (
                <tr key={i}>
                  <td className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}><strong className="text-[#1C1C1E] font-medium">{farm.name}</strong></td>
                  <td className="px-5 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{farm.location}</td>
                  <td className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    <span style={{ cursor: 'pointer', fontWeight: 600, color: '#111827', textDecoration: 'none', transition: 'color 0.15s ease, text-decoration 0.15s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#10B981'; e.currentTarget.style.textDecoration = 'underline'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.textDecoration = ''; }}
                      onClick={() => { const u = users.find((x) => x.name === farm.owner); if (u) setSelectedUser(u); }}
                    >{farm.owner}</span>
                  </td>
                  <td className="px-5 py-4 border-b text-center" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    <span className="pill inline-flex items-center justify-center min-w-[28px] px-2.5 py-0.5 rounded-full bg-white/40 text-text-secondary text-xs font-semibold">{connectedCount}</span>
                  </td>
                  <td className="px-5 py-4 border-b text-center" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    <span className="inline-flex items-center justify-center" style={{ gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: status.label === 'Active' ? '#10B981' : status.label === 'Idle' ? '#D97706' : '#EF4444', animation: status.label === 'Active' ? 'statusPulse 2s ease-in-out infinite' : 'none' }} />
                      <span style={{ color: status.label === 'Active' ? '#10B981' : status.label === 'Idle' ? '#D97706' : '#EF4444', fontSize: '12px', fontWeight: 500, letterSpacing: '0.01em' }}>{status.label}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {selectedUser && <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="rounded-[20px] p-6 w-[450px] shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] relative" onClick={(e) => e.stopPropagation()} style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}>
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 bg-none border-none text-text-placeholder text-lg transition-all duration-150"
              style={{ cursor: 'pointer', transition: 'color 0.15s ease, transform 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
            ><i className="ph ph-x" /></button>
            <div className="text-lg font-bold text-[#1C1C1E] mb-1">Add New Farm</div>
            <div className="text-xs text-text-secondary mb-5">Register a new agricultural property.</div>
            <form onSubmit={handleAddFarm}>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={labelClass}>Farm Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Green Valley Farm" className={inputFieldClass}
                  style={{ cursor: 'text' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#9CA3AF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.15)'; e.currentTarget.style.outline = 'none'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                />
                {errors.name && <span className="text-[10px] text-danger-text">{errors.name}</span>}
              </div>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={labelClass}>Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g., California, USA" className={inputFieldClass}
                  style={{ cursor: 'text' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#9CA3AF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.15)'; e.currentTarget.style.outline = 'none'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                />
                {errors.location && <span className="text-[10px] text-danger-text">{errors.location}</span>}
              </div>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={labelClass}>Owner</label>
                <Select options={userNames} value={form.owner} onChange={(v) => setForm({ ...form, owner: v })} placeholder="Select owner" />
                {errors.owner && <span className="text-[10px] text-danger-text">{errors.owner}</span>}
              </div>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={labelClass}>Crop Types</label>
                <input value={form.cropTypes} onChange={(e) => setForm({ ...form, cropTypes: e.target.value })} placeholder="e.g., Wheat, Barley, Soybeans" className={inputFieldClass}
                  style={{ cursor: 'text' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#9CA3AF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.15)'; e.currentTarget.style.outline = 'none'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                />
              </div>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={labelClass}>Total Acreage</label>
                <input type="number" min="0" value={form.acreage} onChange={(e) => setForm({ ...form, acreage: e.target.value })} placeholder="e.g., 270" className={inputFieldClass}
                  style={{ cursor: 'text' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#9CA3AF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.15)'; e.currentTarget.style.outline = 'none'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                />
              </div>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={labelClass}>Connected Devices</label>
                <input type="number" min="0" value={form.devices} onChange={(e) => setForm({ ...form, devices: e.target.value })} placeholder="0" className={inputFieldClass}
                  style={{ cursor: 'text' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#9CA3AF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.15)'; e.currentTarget.style.outline = 'none'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                />
              </div>
              <div className="flex flex-col gap-1.5 mb-6">
                <label className={labelClass}>Status</label>
                <div className="flex gap-2">
                  {statusOptions.map((s) => {
                    const isActive = form.status === s;
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setForm({ ...form, status: s })}
                        className={`flex-1 text-xs px-4 py-2 rounded-xl font-semibold border transition-all duration-150 ${
                          isActive ? 'bg-brand text-white border-brand' : 'bg-white/50 text-text-secondary border-white/60'
                        }`}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                        onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = '#E5E7EB'; e.currentTarget.style.color = '#111827'; } }}
                        onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; } }}
                        onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                        onMouseUp={(e) => { e.currentTarget.style.transform = ''; }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
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
                ><Check size={16} color="#FFFFFF" /> Add Farm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
