import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useFarms } from '../../context/FarmContext';
import { useRobots } from '../../context/RobotContext';
import { useUsers } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../utils/activityLogger';
import UserProfileModal from '../components/UserProfileModal';
import { MapPin, Globe, Sprout, Bot, Home, User, Ruler, Maximize, Wifi, Activity, Layers, Trash2 } from 'lucide-react';

function useCardGlow() {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const onMouseEnter = useCallback(() => setIsHovered(true), []);
  const onMouseLeave = useCallback(() => { setIsHovered(false); setPos({ x: 50, y: 50 }); }, []);

  return { ref, onMouseMove, onMouseEnter, onMouseLeave, pos, isHovered };
}

function GlowCard({ className, style: outerStyle, onClick, children }) {
  const { ref, onMouseMove, onMouseEnter, onMouseLeave, pos, isHovered } = useCardGlow();

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={className}
      style={{
        ...outerStyle,
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : undefined,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isHovered ? '0 10px 20px rgba(0,0,0,0.1)' : outerStyle?.boxShadow,
      }}
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        background: `radial-gradient(circle 200px at ${pos.x}% ${pos.y}%, rgba(16,185,129,0.15), transparent)`,
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.2s ease',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      {children}
    </div>
  );
}

const inputClass = "text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/60 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder text-primary";

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
    case 'Total Farms': return { Icon: MapPin, bg: 'rgba(46,158,107,0.12)', color: '#2e9e6b' };
    case 'Regions': return { Icon: Globe, bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' };
    case 'Crop Types': return { Icon: Sprout, bg: 'rgba(46,158,107,0.12)', color: '#2e9e6b' };
    case 'Active Robots': return { Icon: Bot, bg: 'rgba(46,158,107,0.12)', color: '#2e9e6b' };
    default: return { Icon: MapPin, bg: 'rgba(107,114,128,0.12)', color: '#6B7280' };
  }
}

const statusOpts = ['Active', 'Idle', 'Offline'];
const userStatusOpts = ['Active', 'Inactive'];

function Select({ options, value, onChange, placeholder, style, onMouseEnter, onMouseLeave, onFocus, onBlur, className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={{ background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '8px', color: '#111827', fontSize: '14px', height: '40px', padding: '0 36px 0 12px', width: '100%', outline: 'none', boxSizing: 'border-box', cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left', position: 'relative' }} className={className}>
        <span style={{ color: value ? '#111827' : '#9CA3AF' }}>{value || placeholder}</span>
        <i className="ph ph-caret-down" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', fontSize: '12px' }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', zIndex: 100, top: '100%', left: 0, right: 0, marginTop: '4px', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.5)', maxHeight: '160px', overflowY: 'auto', background: 'rgba(255,255,255,0.98)' }}>
          {options.map((opt) => {
            const selected = opt === value;
            return (
              <div key={opt} onClick={() => { onChange(opt); setOpen(false); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', fontSize: '13px', cursor: 'pointer', background: selected ? 'rgba(16,185,129,0.08)' : 'transparent', color: selected ? '#059669' : '#111827' }}>
                <span>{opt}</span>
                {selected && <i className="ph ph-check" style={{ fontSize: '12px', color: '#059669' }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Farms() {
  const navigate = useNavigate();
  const { farms, addFarm, updateFarm, removeFarm } = useFarms();
  const { robots } = useRobots();
  const { users, updateUser } = useUsers();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [form, setForm] = useState({ name: '', location: '', owner: '', cropTypes: '', acreage: '', devices: '0', status: 'Active' });
  const [errors, setErrors] = useState({});
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', status: 'Active' });
  const [editErrors, setEditErrors] = useState({});
  const [editFarm, setEditFarm] = useState(null);
  const [editFarmForm, setEditFarmForm] = useState({ name: '', location: '', owner: '', cropTypes: '', soil: '', acreage: '', devices: '0', robot: '', status: 'Active' });
  const [editFarmErrors, setEditFarmErrors] = useState({});
  const [deleteFarm, setDeleteFarm] = useState(null);
  const soilTypeOpts = ['Clay', 'Loam', 'Sandy', 'Silty', 'Peaty', 'Chalky'];

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') { setShowAddModal(false); setEditUser(null); } };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const userNames = users.length ? users.map((u) => u.name) : [];
  const robotIds = robots.length ? robots.map((r) => r.id) : [];

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Farm name is required';
    if (!form.location.trim()) errs.location = 'Location is required';
    if (!form.owner.trim()) errs.owner = 'Owner is required';
    if (!form.status) errs.status = 'Status is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!validate()) return;
    addFarm({
      name: form.name.trim(),
      location: form.location.trim(),
      owner: form.owner.trim(),
      crop: form.cropTypes.trim() || '—',
      soil: form.soil || '—',
      robot: form.robot || '—',
      status: form.status,
      cls: form.status === 'Active' ? 'bg-brand-light text-brand-dark' : form.status === 'Idle' ? 'bg-warning-bg text-warning-text' : 'bg-danger-bg text-danger-text',
      size: form.acreage ? `${form.acreage} acres` : '—',
      cropTypes: form.cropTypes.trim() || '—',
      devices: form.devices || '0',
    });
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Added Farm', target: form.name.trim(), details: `Location: ${form.location.trim()}, Owner: ${form.owner.trim()}, Soil: ${form.soil || '—'}, Robot: ${form.robot || '—'}, Status: ${form.status}` });
    setShowAddModal(false);
    // TODO: Replace with real backend API call once backend is added.
  };

  const openAdd = () => { setForm({ name: '', location: '', owner: '', cropTypes: '', soil: '', acreage: '', devices: '0', robot: '', status: 'Active' }); setErrors({}); setShowAddModal(true); };
  const openEdit = (user) => { setEditForm({ name: user.name, email: user.email, phone: user.phone, status: user.status }); setEditErrors({}); setEditUser(user); };
  const validateEdit = () => {
    const errs = {};
    if (!editForm.name.trim()) errs.name = 'Full name is required';
    if (!editForm.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) errs.email = 'Invalid email format';
    if (!editForm.phone.trim()) errs.phone = 'Phone number is required';
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const handleEdit = (e) => {
    e.preventDefault();
    if (!validateEdit()) return;
    const status = editForm.status;
    const cls = status === 'Active' ? 'bg-brand-light text-brand-dark' : 'bg-danger-bg text-danger-text';
    updateUser(editUser, { name: editForm.name.trim(), email: editForm.email.trim(), phone: editForm.phone.trim(), status, cls });
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Edited User', target: editForm.name.trim(), details: `Name: ${editUser.name} → ${editForm.name.trim()}, Status: ${status}` });
    setEditUser(null);
  };

  const validateEditFarm = () => {
    const errs = {};
    if (!editFarmForm.name.trim()) errs.name = 'Farm name is required';
    if (!editFarmForm.location.trim()) errs.location = 'Location is required';
    if (!editFarmForm.owner.trim()) errs.owner = 'Owner is required';
    if (!editFarmForm.status) errs.status = 'Status is required';
    setEditFarmErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openEditFarm = (farm) => {
    setEditFarmForm({
      name: farm.name,
      location: farm.location,
      owner: farm.owner,
      cropTypes: farm.cropTypes || '',
      soil: farm.soil || '',
      acreage: farm.size ? farm.size.replace(' acres', '') : '',
      devices: farm.devices || '0',
      robot: farm.robot || '',
      status: farm.status,
    });
    setEditFarmErrors({});
    setEditFarm(farm);
  };

  const handleUpdateFarm = (e) => {
    e.preventDefault();
    if (!validateEditFarm()) return;
    const status = editFarmForm.status;
    const cls = status === 'Active' ? 'bg-brand-light text-brand-dark' : status === 'Idle' ? 'bg-warning-bg text-warning-text' : 'bg-danger-bg text-danger-text';
    updateFarm(editFarm, {
      name: editFarmForm.name.trim(),
      location: editFarmForm.location.trim(),
      owner: editFarmForm.owner.trim(),
      crop: editFarmForm.cropTypes.trim() || '—',
      cropTypes: editFarmForm.cropTypes.trim() || '—',
      soil: editFarmForm.soil || '—',
      robot: editFarmForm.robot || '—',
      size: editFarmForm.acreage ? `${editFarmForm.acreage} acres` : '—',
      devices: editFarmForm.devices || '0',
      status,
      cls,
    });
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Edited Farm', target: editFarmForm.name.trim(), details: `Location: ${editFarmForm.location.trim()}, Owner: ${editFarmForm.owner.trim()}, Soil: ${editFarmForm.soil || '—'}, Robot: ${editFarmForm.robot || '—'}, Status: ${status}` });
    setEditFarm(null);
  };

  const handleDeleteFarm = () => {
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Deleted Farm', target: deleteFarm.name, details: `Location: ${deleteFarm.location}` });
    removeFarm(deleteFarm);
    setDeleteFarm(null);
  };

  const inputBase = {
    background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '8px',
    color: '#111827', fontSize: '14px', height: '40px', padding: '0 12px',
    width: '100%', outline: 'none', boxSizing: 'border-box',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'text',
  };
  const inputFocus = (e) => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)'; };
  const inputBlur = (e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none'; };
  const inputHoverEnter = (e) => e.currentTarget.style.borderColor = '#9CA3AF';
  const inputHoverLeave = (e) => e.currentTarget.style.borderColor = '#D1D5DB';

  const labelStyle = { color: '#374151', fontWeight: 600, fontSize: '13px' };
  const btnPrimary = "bg-brand text-white border-none rounded-xl px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_8px_25px_rgba(5,150,105,0.3)]";

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
            (f) => f.name.toLowerCase().includes(q) || f.location.toLowerCase().includes(q) || f.owner.toLowerCase().includes(q) || (f.cropTypes && f.cropTypes.toLowerCase().includes(q)) || (f.soil && f.soil.toLowerCase().includes(q)) || (f.robot && f.robot.toLowerCase().includes(q))
          );
        })();
    return visible.map((farm) => {
      const connectedRobots = robots.filter((r) => r.farm === farm.name);
      return { farm, connectedCount: connectedRobots.length, status: getStatusLabel(connectedRobots) };
    });
  }, [farms, robots, searchTerm]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-bold text-primary">Farm Management</div>
          <div className="text-sm text-text-secondary mt-1">View and manage agricultural properties</div>
        </div>
        <button onClick={openAdd} className={btnPrimary}><i className="ph ph-plus" /> Add Farm</button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => {
          const { Icon, bg, color } = getIconConfig(card.label);
          return (
            <GlowCard
              key={card.label}
              onClick={card.route ? () => navigate(card.route) : undefined}
              className="glass-card rounded-2xl p-5"
              style={{ contentVisibility: 'auto' }}
            >
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: getGlowColor(card.label), filter: 'blur(30px)', opacity: 0.35 }} />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-secondary mb-2">{card.label}</div>
                  <div className="text-3xl font-extrabold text-primary">{card.val}</div>
                </div>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                  <Icon size={18} color={color} />
                </div>
              </div>
            </GlowCard>
          );
        })}
      </div>

      <div className="rounded-[20px] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', contentVisibility: 'auto', willChange: 'transform' }}>
        <div className="flex flex-col items-stretch mb-5">
          <div className="text-sm font-semibold text-primary mb-3">All Farms ({farms.length})</div>
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search farms by name, location, or owner..." aria-label="Search farms" className={inputClass} />
        </div>
        {farmRows.length === 0 ? (
          <div className="py-12 text-center text-text-secondary text-sm">No farms found matching your criteria.</div>
        ) : (
          <table className="w-full border-collapse text-sm" style={{ userSelect: 'none' }}>
            <thead>
              <tr>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Farm Name</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Location</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Owner</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Crop Type</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Soil Type</th>
                <th className="px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)', textAlign: 'center' }}>Connected Devices</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Assigned Robot</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Status</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {farmRows.map(({ farm, connectedCount, status }, i) => (
                <tr key={i}>
                  <td className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}><strong className="text-primary font-medium">{farm.name}</strong></td>
                  <td className="px-5 py-5 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>{farm.location}</td>
                  <td className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                    <span onClick={() => { const u = users.find((x) => x.name === farm.owner); if (u) setProfileUser(u); }}
                      style={{ cursor: 'pointer', fontWeight: 600, color: '#111827', textDecoration: 'none', transition: 'color 0.15s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#10B981'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#111827'; }}
                    >{farm.owner}</span>
                  </td>
                  <td className="px-5 py-5 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>{farm.cropTypes || '—'}</td>
                  <td className="px-5 py-5 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>{farm.soil || '—'}</td>
                  <td className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#111827', fontWeight: 600, textAlign: 'center' }}>{connectedCount}</td>
                  <td className="px-5 py-5 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>{farm.robot || '—'}</td>
                  <td className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: status.label === 'Active' ? '#10B981' : status.label === 'Idle' ? '#F59E0B' : '#EF4444', display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: status.label === 'Active' ? '#059669' : status.label === 'Idle' ? '#D97706' : '#DC2626' }}>{status.label}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                    <div className="flex gap-3 items-center">
                      <button title="Edit" onClick={() => openEditFarm(farm)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-lg transition-all duration-200 hover:scale-110">
                        <i className="ph ph-pencil" />
                      </button>
                      <button title="Delete" onClick={() => setDeleteFarm(farm)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-danger-text text-lg transition-all duration-200 hover:scale-110">
                        <i className="ph ph-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={() => setShowAddModal(false)}>
          <div className="w-[560px] max-w-[calc(100vw-32px)] rounded-[24px] p-7 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60" onClick={(e) => e.stopPropagation()}
            style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="ph ph-robot text-white text-lg" />
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>Add New Farm</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>Enter details to register a new farm.</div>
                </div>
              </div>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#98989D', padding: '4px', display: 'flex', transition: 'color 0.15s ease, transform 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
              ><i className="ph ph-x text-lg" /></button>
            </div>

            <form onSubmit={handleAdd}>
              <div style={{ background: 'rgba(255,255,255,0.75)', borderRadius: '16px', padding: '20px 24px', border: '1px solid rgba(255,255,255,0.5)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                  <Sprout size={15} style={{ color: '#10B981' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Farm Information</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 32px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Home size={12} style={{ color: '#9CA3AF' }} /> Farm Name
                    </div>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Green Valley Farm"
                      style={inputBase} onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                    />
                    {errors.name && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <MapPin size={12} style={{ color: '#9CA3AF' }} /> Location
                    </div>
                    <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g., California, USA"
                      style={inputBase} onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                    />
                    {errors.location && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.location}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <User size={12} style={{ color: '#9CA3AF' }} /> Owner
                    </div>
                    <Select options={userNames} value={form.owner} onChange={(v) => setForm({ ...form, owner: v })} placeholder="Select an owner" />
                    {errors.owner && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.owner}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Sprout size={12} style={{ color: '#9CA3AF' }} /> Crop Types
                    </div>
                    <input value={form.cropTypes} onChange={(e) => setForm({ ...form, cropTypes: e.target.value })} placeholder="e.g., Wheat, Barley"
                      style={inputBase} onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Ruler size={12} style={{ color: '#9CA3AF' }} /> Total Acreage
                    </div>
                    <input type="number" min="0" value={form.acreage} onChange={(e) => setForm({ ...form, acreage: e.target.value })} placeholder="e.g., 120"
                      style={inputBase} onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Wifi size={12} style={{ color: '#9CA3AF' }} /> Connected Devices
                    </div>
                    <input type="number" min="0" value={form.devices} onChange={(e) => setForm({ ...form, devices: e.target.value })} placeholder="0"
                      style={inputBase} onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Layers size={12} style={{ color: '#9CA3AF' }} /> Soil Type
                    </div>
                    <Select options={soilTypeOpts} value={form.soil} onChange={(v) => setForm({ ...form, soil: v })} placeholder="Select soil type" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Bot size={12} style={{ color: '#9CA3AF' }} /> Assigned Robot
                    </div>
                    <Select options={robotIds} value={form.robot} onChange={(v) => setForm({ ...form, robot: v })} placeholder="Select robot" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Activity size={12} style={{ color: '#9CA3AF' }} /> Status
                    </div>
                    <div className="flex gap-2">
                      {statusOpts.map((opt) => (
                        <button key={opt} type="button"
                          onClick={() => setForm({ ...form, status: opt })}
                          style={{ flex: 1, padding: '8px 0', fontSize: '13px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer',
                            border: form.status === opt ? '2px solid #10B981' : '1px solid #D1D5DB',
                            background: form.status === opt ? 'rgba(16,185,129,0.1)' : '#FFFFFF',
                            color: form.status === opt ? '#059669' : '#4B5563',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => { if (form.status !== opt) { e.currentTarget.style.borderColor = '#9CA3AF'; e.currentTarget.style.background = '#F9FAFB'; } }}
                          onMouseLeave={(e) => { if (form.status !== opt) { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.background = '#FFFFFF'; } }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {errors.status && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.status}</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)}
                  style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.15)', color: '#4B5563', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s ease', padding: '9px 18px', fontSize: '13px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Cancel
                </button>
                <button type="submit"
                  style={{ background: '#10B981', color: '#FFFFFF', fontWeight: 600, borderRadius: '12px', padding: '9px 20px', cursor: 'pointer', transition: 'all 0.2s ease', border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '1'; }}
                >
                  <i className="ph ph-check" /> Add Farm
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      {editFarm && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={() => setEditFarm(null)}>
          <div className="w-[560px] max-w-[calc(100vw-32px)] rounded-[24px] p-7 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60" onClick={(e) => e.stopPropagation()}
            style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="ph ph-pen text-white text-lg" />
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>Edit Farm</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>Update details for {editFarm.name}.</div>
                </div>
              </div>
              <button type="button" onClick={() => setEditFarm(null)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#98989D', padding: '4px', display: 'flex', transition: 'color 0.15s ease, transform 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
              ><i className="ph ph-x text-lg" /></button>
            </div>
            <form onSubmit={handleUpdateFarm}>
              <div style={{ background: 'rgba(255,255,255,0.75)', borderRadius: '16px', padding: '20px 24px', border: '1px solid rgba(255,255,255,0.5)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                  <Sprout size={15} style={{ color: '#10B981' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Farm Information</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 32px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Home size={12} style={{ color: '#9CA3AF' }} /> Farm Name
                    </div>
                    <input value={editFarmForm.name} onChange={(e) => setEditFarmForm({ ...editFarmForm, name: e.target.value })} placeholder="e.g., Green Valley Farm"
                      style={inputBase} onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                    />
                    {editFarmErrors.name && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{editFarmErrors.name}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <MapPin size={12} style={{ color: '#9CA3AF' }} /> Location
                    </div>
                    <input value={editFarmForm.location} onChange={(e) => setEditFarmForm({ ...editFarmForm, location: e.target.value })} placeholder="e.g., California, USA"
                      style={inputBase} onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                    />
                    {editFarmErrors.location && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{editFarmErrors.location}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <User size={12} style={{ color: '#9CA3AF' }} /> Owner
                    </div>
                    <Select options={userNames} value={editFarmForm.owner} onChange={(v) => setEditFarmForm({ ...editFarmForm, owner: v })} placeholder="Select an owner" />
                    {editFarmErrors.owner && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{editFarmErrors.owner}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Sprout size={12} style={{ color: '#9CA3AF' }} /> Crop Types
                    </div>
                    <input value={editFarmForm.cropTypes} onChange={(e) => setEditFarmForm({ ...editFarmForm, cropTypes: e.target.value })} placeholder="e.g., Wheat, Barley"
                      style={inputBase} onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Layers size={12} style={{ color: '#9CA3AF' }} /> Soil Type
                    </div>
                    <Select options={soilTypeOpts} value={editFarmForm.soil} onChange={(v) => setEditFarmForm({ ...editFarmForm, soil: v })} placeholder="Select soil type" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Ruler size={12} style={{ color: '#9CA3AF' }} /> Total Acreage
                    </div>
                    <input type="number" min="0" value={editFarmForm.acreage} onChange={(e) => setEditFarmForm({ ...editFarmForm, acreage: e.target.value })} placeholder="e.g., 120"
                      style={inputBase} onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Wifi size={12} style={{ color: '#9CA3AF' }} /> Connected Devices
                    </div>
                    <input type="number" min="0" value={editFarmForm.devices} onChange={(e) => setEditFarmForm({ ...editFarmForm, devices: e.target.value })} placeholder="0"
                      style={inputBase} onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Bot size={12} style={{ color: '#9CA3AF' }} /> Assigned Robot
                    </div>
                    <Select options={robotIds} value={editFarmForm.robot} onChange={(v) => setEditFarmForm({ ...editFarmForm, robot: v })} placeholder="Select robot" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Activity size={12} style={{ color: '#9CA3AF' }} /> Status
                    </div>
                    <div className="flex gap-2">
                      {statusOpts.map((opt) => (
                        <button key={opt} type="button"
                          onClick={() => setEditFarmForm({ ...editFarmForm, status: opt })}
                          style={{ flex: 1, padding: '8px 0', fontSize: '13px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer',
                            border: editFarmForm.status === opt ? '2px solid #10B981' : '1px solid #D1D5DB',
                            background: editFarmForm.status === opt ? 'rgba(16,185,129,0.1)' : '#FFFFFF',
                            color: editFarmForm.status === opt ? '#059669' : '#4B5563',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => { if (editFarmForm.status !== opt) { e.currentTarget.style.borderColor = '#9CA3AF'; e.currentTarget.style.background = '#F9FAFB'; } }}
                          onMouseLeave={(e) => { if (editFarmForm.status !== opt) { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.background = '#FFFFFF'; } }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {editFarmErrors.status && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{editFarmErrors.status}</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setEditFarm(null)}
                  style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.15)', color: '#4B5563', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s ease', padding: '9px 18px', fontSize: '13px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Cancel
                </button>
                <button type="submit"
                  style={{ background: '#10B981', color: '#FFFFFF', fontWeight: 600, borderRadius: '12px', padding: '9px 20px', cursor: 'pointer', transition: 'all 0.2s ease', border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '1'; }}
                >
                  <i className="ph ph-check" /> Update Farm
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      {deleteFarm && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setDeleteFarm(null)}>
          <div className="rounded-[20px] p-6 w-[400px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-white/50" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-modal)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}>
            <div className="text-lg font-bold text-primary mb-2">Delete Farm?</div>
            <div className="text-sm text-text-secondary mb-6">
              Are you sure you want to delete <strong className="text-primary font-medium">{deleteFarm.name}</strong>? This action cannot be undone.
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteFarm(null)}
                className="text-xs px-3.5 py-1.5 border border-[rgba(0,0,0,0.05)] rounded-xl bg-white text-text-secondary font-medium hover:bg-[#E5E5EA] hover:border-[rgba(0,0,0,0.15)] cursor-pointer transition-all duration-150 active:scale-[0.97] hover:scale-[1.04] focus-visible:scale-[1.04] focus:outline-none cancel-btn"
              >Cancel</button>
              <button onClick={handleDeleteFarm} className="bg-danger-bg text-danger-text border-none rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2 cursor-pointer transition-all duration-150 active:scale-[0.97] hover:scale-[1.04] focus-visible:scale-[1.04] focus:outline-none delete-btn">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {editUser && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={() => setEditUser(null)}>
          <div className="w-[560px] max-w-[calc(100vw-32px)] rounded-[24px] p-7 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60" onClick={(e) => e.stopPropagation()}
            style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="ph ph-pen text-white text-lg" />
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>Edit User Details</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>Update information for {editUser.name}.</div>
                </div>
              </div>
              <button type="button" onClick={() => setEditUser(null)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#98989D', padding: '4px', display: 'flex', transition: 'color 0.15s ease, transform 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
              ><i className="ph ph-x text-lg" /></button>
            </div>

            <form onSubmit={handleEdit}>
              <div style={{ background: 'rgba(255,255,255,0.75)', borderRadius: '16px', padding: '20px 24px', border: '1px solid rgba(255,255,255,0.5)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                  <i className="ph ph-user text-[15px]" style={{ color: '#10B981' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>User Information</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 32px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <i className="ph ph-user text-xs" style={{ color: '#9CA3AF' }} /> Name
                    </div>
                    <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Enter full name"
                      style={inputBase}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                      onMouseEnter={inputHoverEnter}
                      onMouseLeave={inputHoverLeave}
                    />
                    {editErrors.name && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{editErrors.name}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <i className="ph ph-envelope text-xs" style={{ color: '#9CA3AF' }} /> Email
                    </div>
                    <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="Enter email address"
                      style={inputBase}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                      onMouseEnter={inputHoverEnter}
                      onMouseLeave={inputHoverLeave}
                    />
                    {editErrors.email && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{editErrors.email}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <i className="ph ph-phone text-xs" style={{ color: '#9CA3AF' }} /> Phone
                    </div>
                    <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} placeholder="+1-555-xxxx"
                      style={inputBase}
                      onFocus={inputFocus}
                      onBlur={inputBlur}
                      onMouseEnter={inputHoverEnter}
                      onMouseLeave={inputHoverLeave}
                    />
                    {editErrors.phone && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{editErrors.phone}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <i className="ph ph-circle text-xs" style={{ color: '#9CA3AF' }} /> Status
                    </div>
                    <Select value={editForm.status} onChange={(v) => setEditForm({ ...editForm, status: v })} options={userStatusOpts} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setEditUser(null)}
                  style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.15)', color: '#4B5563', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s ease', padding: '9px 18px', fontSize: '13px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Cancel
                </button>
                <button type="submit"
                  style={{ background: '#10B981', color: '#FFFFFF', fontWeight: 600, borderRadius: '12px', padding: '9px 20px', cursor: 'pointer', transition: 'all 0.2s ease', border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '1'; }}
                >
                  <i className="ph ph-check" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      {profileUser && <UserProfileModal user={profileUser} onClose={() => setProfileUser(null)} onEdit={(user) => { setProfileUser(null); openEdit(user); }} />}
    </>
  );
}
