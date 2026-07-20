import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useFarms } from '../../context/FarmContext';
import { useRobots } from '../../context/RobotContext';
import { useUsers } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../utils/activityLogger';
import UserProfileModal from '../components/UserProfileModal';
import FarmProfileModal from '../components/FarmProfileModal';
import { MapPin, Sprout, Bot, Home, User, Ruler, Wifi, Activity, Layers, Trash2, ChevronDown, Check } from 'lucide-react';
import { computeTriangleAreaAcres } from '../../utils/farmArea';
import FarmMapPreview from '../components/FarmMapPreview';

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

const inputClass = "text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/60 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder text-primary";

function getStatusLabel(connectedRobots) {
  if (connectedRobots.length === 0) return { label: 'Offline', cls: 'bg-danger-bg text-danger-text pill' };
  if (connectedRobots.some((r) => r.status === 'Active')) return { label: 'Active', cls: 'bg-brand-light text-brand-dark pill' };
  return { label: 'Idle', cls: 'bg-warning-bg text-warning-text pill' };
}

function getIconConfig(label) {
  switch (label) {
    case 'Total Farms': return { Icon: MapPin, bg: 'rgba(46,125,50,0.12)', color: '#2e9e6b' };
    case 'Soil Types': return { Icon: Layers, bg: 'rgba(120,80,40,0.1)', color: '#78501f' };
    case 'Crop Types': return { Icon: Sprout, bg: 'rgba(46,125,50,0.12)', color: '#2e9e6b' };
    case 'Active Robots': return { Icon: Bot, bg: 'rgba(46,125,50,0.12)', color: '#2e9e6b' };
    default: return { Icon: MapPin, bg: 'rgba(107,114,128,0.12)', color: '#6B7280' };
  }
}

function parseCoordinate(value) {
  if (!value.trim()) return null;
  const parts = value.split(',');
  if (parts.length !== 2) return { error: 'Use format: lat, lng' };
  const lat = parseFloat(parts[0].trim());
  const lng = parseFloat(parts[1].trim());
  if (isNaN(lat) || isNaN(lng)) return { error: 'Use format: lat, lng' };
  if (lat < -90 || lat > 90) return { error: 'Lat must be -90 to 90' };
  if (lng < -180 || lng > 180) return { error: 'Lng must be -180 to 180' };
  return { lat, lng };
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
        <div style={{ position: 'absolute', zIndex: 9999, top: '100%', left: 0, right: 0, marginTop: '4px', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.5)', maxHeight: '160px', overflowY: 'auto', background: 'rgba(255,255,255,0.98)' }}>
          {options.map((opt) => {
            const selected = opt === value;
            return (
              <div key={opt} onClick={() => { onChange(opt); setOpen(false); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', fontSize: '13px', cursor: 'pointer', background: selected ? 'rgba(76,175,80,0.08)' : 'transparent', color: selected ? '#2e7d2e' : '#111827' }}>
                <span>{opt}</span>
                {selected && <i className="ph ph-check" style={{ fontSize: '12px', color: '#2e7d2e' }} />}
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
            position: 'absolute', zIndex: 9999, top: '100%', left: 0, right: 0, marginTop: '4px',
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

export default function Farms() {
  const navigate = useNavigate();
  const { farms, addFarm, updateFarm, removeFarm } = useFarms();
  const { robots, updateRobot } = useRobots();
  const { users, updateUser } = useUsers();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [ownerFilter, setOwnerFilter] = useState('All Owners');
  useEffect(() => { const v = sessionStorage.getItem('globalSearchPrefill'); if (v) { setSearchTerm(v); sessionStorage.removeItem('globalSearchPrefill'); } }, []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [profileFarm, setProfileFarm] = useState(null);
  const [form, setForm] = useState({ name: '', owner: '', cropTypes: '', acreage: '', devices: '0', status: 'Active' });
  const [errors, setErrors] = useState({});
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', status: 'Active' });
  const [editErrors, setEditErrors] = useState({});
  const [editFarm, setEditFarm] = useState(null);
  const [editFarmForm, setEditFarmForm] = useState({ name: '', owner: '', cropTypes: '', soil: '', acreage: '', devices: '0', robot: '', status: 'Active' });
  const [editFarmErrors, setEditFarmErrors] = useState({});
  const [deleteFarm, setDeleteFarm] = useState(null);
  const [formCoordStrings, setFormCoordStrings] = useState(['', '', '']);
  const [editFormCoordStrings, setEditFormCoordStrings] = useState(['', '', '']);
  const [selectedRobots, setSelectedRobots] = useState([]);
  const [editSelectedRobots, setEditSelectedRobots] = useState([]);
  const [robotDropdownOpen, setRobotDropdownOpen] = useState(false);
  const [editRobotDropdownOpen, setEditRobotDropdownOpen] = useState(false);
  const soilTypeOpts = ['Clay', 'Loam', 'Sandy', 'Silty', 'Peaty', 'Chalky'];

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') { setShowAddModal(false); setEditUser(null); } };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (!robotDropdownOpen) return;
    const handler = (e) => { if (!e.target.closest('[data-robot-dropdown-add]')) setRobotDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [robotDropdownOpen]);

  useEffect(() => {
    if (!editRobotDropdownOpen) return;
    const handler = (e) => { if (!e.target.closest('[data-robot-dropdown-edit]')) setEditRobotDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [editRobotDropdownOpen]);

  const userNames = (users || []).length ? (users || []).map((u) => u.name) : [];
  const robotIds = (robots || []).length ? (robots || []).map((r) => r.id) : [];

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Farm name is required';
    if (!form.owner.trim()) errs.owner = 'Owner is required';
    formCoordStrings.forEach((str, i) => {
      if (!str.trim()) { errs[`coord${i}`] = 'Please enter valid coordinates for all 3 boundary points'; return; }
      const parsed = parseCoordinate(str);
      if (!parsed) errs[`coord${i}`] = 'Please enter valid coordinates for all 3 boundary points';
      else if (parsed.error) errs[`coord${i}`] = parsed.error;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const parsedCoords = parsedAddPoints.filter(Boolean);
    selectedRobots.forEach(robotId => {
      const robot = (robots || []).find(r => r.id === robotId);
      if (robot) updateRobot(robot, { farm: form.name.trim(), status: 'Assigned' });
    });
    addFarm({
      name: form.name.trim(),
      coordinates: parsedCoords.length === 3 ? parsedCoords : [{ lat: 0, lng: 0 }, { lat: 0, lng: 0 }, { lat: 0, lng: 0 }],
      owner: form.owner.trim(),
      crop: form.cropTypes.trim() || '—',
      soil: form.soil || '—',
      robot: selectedRobots.join(', ') || '—',
      assignedRobots: selectedRobots,
      status: form.status,
      cls: form.status === 'Active' ? 'bg-brand-light text-brand-dark' : form.status === 'Idle' ? 'bg-warning-bg text-warning-text' : 'bg-danger-bg text-danger-text',
      size: form.acreage ? `${form.acreage} acres` : '—',
      cropTypes: form.cropTypes.trim() || '—',
      devices: form.devices || '0',
    });
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Added Farm', target: form.name.trim(), details: `Owner: ${form.owner.trim()}, Soil: ${form.soil || '—'}, Robots: ${selectedRobots.join(', ') || '—'}, Status: ${form.status}` });
    setShowAddModal(false);
    // TODO: Replace with real backend API call once backend is added.
  };

  const openAdd = () => { setForm({ name: '', owner: '', cropTypes: '', soil: '', acreage: '', devices: '0', robot: '', status: 'Active' }); setErrors({}); setFormCoordStrings(['', '', '']); setSelectedRobots([]); setShowAddModal(true); };
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
    if (!editFarmForm.owner.trim()) errs.owner = 'Owner is required';
    editFormCoordStrings.forEach((str, i) => {
      if (!str.trim()) { errs[`editCoord${i}`] = 'Please enter valid coordinates for all 3 boundary points'; return; }
      const parsed = parseCoordinate(str);
      if (!parsed) errs[`editCoord${i}`] = 'Please enter valid coordinates for all 3 boundary points';
      else if (parsed.error) errs[`editCoord${i}`] = parsed.error;
    });
    setEditFarmErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openEditFarm = (farm) => {
    if (!farm) return;
    setEditFarmForm({
      name: farm.name || '',
      owner: farm.owner || '',
      cropTypes: farm.cropTypes || '',
      soil: farm.soil || '',
      acreage: farm.size ? farm.size.replace(' acres', '') : '',
      devices: farm.devices || '0',
      robot: farm.robot || '',
      status: farm.status || 'Active',
    });
    const coords = farm.coordinates;
    setEditFormCoordStrings(coords && coords.length === 3 ? coords.map(c => `${c.lat}, ${c.lng}`) : ['', '', '']);
    const assignedRobots = (robots || []).filter(r => r.farm === farm.name).map(r => r.id);
    setEditSelectedRobots(assignedRobots);
    setEditFarmErrors({});
    setEditFarm(farm);
  };

  const handleUpdateFarm = (e) => {
    e.preventDefault();
    if (!validateEditFarm()) return;
    const status = editFarmForm.status;
    const cls = status === 'Active' ? 'bg-brand-light text-brand-dark' : status === 'Idle' ? 'bg-warning-bg text-warning-text' : 'bg-danger-bg text-danger-text';
    const parsedEditCoords = parsedEditPoints.filter(Boolean);
    const previouslyAssigned = (robots || []).filter(r => r.farm === editFarm?.name).map(r => r.id);
    previouslyAssigned.filter(id => !editSelectedRobots.includes(id)).forEach(robotId => {
      const robot = (robots || []).find(r => r.id === robotId);
      if (robot) updateRobot(robot, { farm: '', status: 'Available' });
    });
    editSelectedRobots.forEach(robotId => {
      const robot = (robots || []).find(r => r.id === robotId);
      if (robot && robot.farm !== editFarmForm.name.trim()) updateRobot(robot, { farm: editFarmForm.name.trim(), status: 'Assigned' });
    });
    updateFarm(editFarm, {
      name: editFarmForm.name.trim(),
      coordinates: parsedEditCoords.length === 3 ? parsedEditCoords : [{ lat: 0, lng: 0 }, { lat: 0, lng: 0 }, { lat: 0, lng: 0 }],
      owner: editFarmForm.owner.trim(),
      crop: editFarmForm.cropTypes.trim() || '—',
      cropTypes: editFarmForm.cropTypes.trim() || '—',
      soil: editFarmForm.soil || '—',
      robot: editSelectedRobots.join(', ') || '—',
      assignedRobots: editSelectedRobots,
      size: editFarmForm.acreage ? `${editFarmForm.acreage} acres` : '—',
      devices: editFarmForm.devices || '0',
      status,
      cls,
    });
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Edited Farm', target: editFarmForm.name.trim(), details: `Owner: ${editFarmForm.owner.trim()}, Soil: ${editFarmForm.soil || '—'}, Robots: ${editSelectedRobots.join(', ') || '—'}, Status: ${status}` });
    setEditFarm(null);
  };

  const handleDeleteFarm = () => {
    const coordsStr = (deleteFarm.coordinates || []).length ? deleteFarm.coordinates.map(c => `${c.lat.toFixed(2)}, ${c.lng.toFixed(2)}`).join(' | ') : '—';
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Deleted Farm', target: deleteFarm.name, details: `Coordinates: ${coordsStr}` });
    removeFarm(deleteFarm);
    setDeleteFarm(null);
  };

  const inputBase = {
    background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '8px',
    color: '#111827', fontSize: '14px', height: '40px', padding: '0 12px',
    width: '100%', outline: 'none', boxSizing: 'border-box',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'text',
  };
  const inputFocus = (e) => { e.currentTarget.style.borderColor = '#4caf50'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)'; };
  const inputBlur = (e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none'; };
  const inputHoverEnter = (e) => e.currentTarget.style.borderColor = '#9CA3AF';
  const inputHoverLeave = (e) => e.currentTarget.style.borderColor = '#D1D5DB';

  const labelStyle = { color: '#374151', fontWeight: 600, fontSize: '13px' };
  const btnPrimary = "bg-brand text-white border-none rounded-xl px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(46,125,50,0.35)]";

  const cropTypes = useMemo(() => [...new Set(farms.map((f) => f.crop))], [farms]);
  const uniqueSoilTypes = useMemo(() => {
    return [...new Set(farms.map(f => f.soil).filter(Boolean).map(s => s.trim()))].sort();
  }, [farms]);
  const soilSubtext = useMemo(() => {
    if (uniqueSoilTypes.length === 0) return 'No soil data available';
    const names = uniqueSoilTypes.slice(0, 3).join(', ');
    return uniqueSoilTypes.length > 3 ? `${names} & ${uniqueSoilTypes.length - 3} more` : names;
  }, [uniqueSoilTypes]);
  const activeRobotCount = useMemo(() => robots.filter((r) => r.status === 'Active').length, [robots]);
  const statusOptions = useMemo(() => ['All Statuses', 'Active', 'Idle', 'Offline'], []);
  const ownerOptions = useMemo(() => ['All Owners', ...new Set(farms.map(f => f.owner).filter(Boolean))], [farms]);
  const parsedAddPoints = useMemo(() => formCoordStrings.map(s => { const r = parseCoordinate(s); return r && !r.error ? r : null; }), [formCoordStrings]);
  const parsedEditPoints = useMemo(() => editFormCoordStrings.map(s => { const r = parseCoordinate(s); return r && !r.error ? r : null; }), [editFormCoordStrings]);
  const computedAcreage = useMemo(() => {
    if (parsedAddPoints.some(p => !p)) return null;
    return computeTriangleAreaAcres(parsedAddPoints[0], parsedAddPoints[1], parsedAddPoints[2]);
  }, [parsedAddPoints]);
  const editComputedAcreage = useMemo(() => {
    if (parsedEditPoints.some(p => !p)) return null;
    return computeTriangleAreaAcres(parsedEditPoints[0], parsedEditPoints[1], parsedEditPoints[2]);
  }, [parsedEditPoints]);

  useEffect(() => {
    if (computedAcreage !== null) {
      setForm(prev => ({ ...prev, acreage: computedAcreage.toFixed(2) }));
    } else if (formCoordStrings.some(s => s.trim())) {
      setForm(prev => ({ ...prev, acreage: '' }));
    }
  }, [computedAcreage]);

  useEffect(() => {
    if (editComputedAcreage !== null) {
      setEditFarmForm(prev => ({ ...prev, acreage: editComputedAcreage.toFixed(2) }));
    } else if (editFormCoordStrings.some(s => s.trim())) {
      setEditFarmForm(prev => ({ ...prev, acreage: '' }));
    }
  }, [editComputedAcreage]);

  const addNextPointIndex = (() => { const v = parsedAddPoints.filter(Boolean).length; return v >= 3 ? 0 : v; })();
  const editNextPointIndex = (() => { const v = parsedEditPoints.filter(Boolean).length; return v >= 3 ? 0 : v; })();

  const handleAddMapClick = (latlng, index) => {
    const updated = [...formCoordStrings];
    updated[index] = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
    setFormCoordStrings(updated);
  };

  const handleEditMapClick = (latlng, index) => {
    const updated = [...editFormCoordStrings];
    updated[index] = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
    setEditFormCoordStrings(updated);
  };

  const statCards = [
    { val: String(farms.length), label: 'Total Farms', route: '/admin/farms' },
    { val: String(uniqueSoilTypes.length), label: 'Soil Types', sub: soilSubtext },
    { val: String(cropTypes.length), label: 'Crop Types' },
    { val: String(activeRobotCount), label: 'Active Robots', route: '/admin/robots' },
  ];

  const filteredFarms = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    return farms.filter(f => {
      if (statusFilter === 'All Statuses') return true;
      const connectedRobots = robots.filter((r) => r.farm === f.name);
      return getStatusLabel(connectedRobots).label === statusFilter;
    })
    .filter(f => ownerFilter === 'All Owners' || f.owner === ownerFilter)
    .filter(f => !search || (f.name || '').toLowerCase().includes(search) || (f.owner || '').toLowerCase().includes(search));
  }, [farms, searchTerm, statusFilter, ownerFilter, robots]);

  const farmRows = useMemo(() => {
    return filteredFarms.map((farm) => {
      const connectedRobots = robots.filter((r) => r.farm === farm.name);
      const assignedRobotIds = connectedRobots.map(r => r.id);
      return { farm, connectedCount: connectedRobots.length, status: getStatusLabel(connectedRobots), assignedRobotIds };
    });
  }, [filteredFarms, robots]);

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
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-secondary mb-2">{card.label}</div>
                  <div className="text-3xl font-extrabold text-primary">{card.val}</div>
                  {card.sub && <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', fontStyle: uniqueSoilTypes.length === 0 ? 'italic' : 'normal' }}>{card.sub}</div>}
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
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search farms by name or owner..." aria-label="Search farms" className={inputClass} />
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', padding: '12px 0', borderBottom: '1px solid rgba(76,175,80,0.08)', marginBottom: '12px' }}>
          <FilterSelect label="STATUS" options={statusOptions} value={statusFilter} onChange={setStatusFilter} width="160px" />
          <FilterSelect label="OWNER" options={ownerOptions} value={ownerFilter} onChange={setOwnerFilter} width="160px" />
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span>Showing {filteredFarms.length} of {farms.length} farms</span>

        </div>
        {farmRows.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.3 }}><i className="ph ph-funnel" /></div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>No farms match your current filters</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>Try adjusting or clearing your filters</div>
            <span onClick={() => { setSearchTerm(''); setStatusFilter('All Statuses'); setOwnerFilter('All Owners'); }}
              style={{ color: '#2e7d32', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(76,175,80,0.3)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(76,175,80,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >Clear Filters</span>
          </div>
        ) : (
          <table className="w-full border-collapse text-sm" style={{ userSelect: 'none', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '18%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '8%' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Farm Name</th>
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
              {farmRows.map(({ farm, connectedCount, status, assignedRobotIds }, i) => (
                <tr key={i}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f8f1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  style={{ transition: 'background 0.15s ease' }}
                >
                  <td className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                    <span onClick={() => setProfileFarm(farm)}
                      style={{ cursor: 'pointer', fontWeight: 600, color: '#111827', textDecoration: 'none', transition: 'color 0.15s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#4caf50'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#111827'; }}
                    ><strong className="text-primary font-medium">{farm.name}</strong></span>
                  </td>
                  <td className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                    <span onClick={() => { const u = users.find((x) => x.name === farm.owner); if (u) setProfileUser(u); }}
                      style={{ cursor: 'pointer', fontWeight: 600, color: '#111827', textDecoration: 'none', transition: 'color 0.15s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#4caf50'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#111827'; }}
                    >{farm.owner}</span>
                  </td>
                  <td className="px-5 py-5 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>{farm.cropTypes || '—'}</td>
                  <td className="px-5 py-5 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>{farm.soil || '—'}</td>
                  <td className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#111827', fontWeight: 600, textAlign: 'center' }}>{connectedCount}</td>
                  <td className="px-5 py-5 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                    {assignedRobotIds.length > 0 ? assignedRobotIds.join(', ') : <span style={{ color: '#6b7280', fontStyle: 'italic' }}>—</span>}
                  </td>
                  <td className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: status.label === 'Active' ? '#4caf50' : status.label === 'Idle' ? '#F59E0B' : '#EF4444', display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: status.label === 'Active' ? '#2e7d2e' : status.label === 'Idle' ? '#D97706' : '#DC2626' }}>{status.label}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                    <div className="flex gap-3 items-center">
                      <button title="Edit" onClick={() => openEditFarm(farm)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-lg transition-all duration-200 hover:scale-110">
                        <i className="ph ph-pencil" style={{ pointerEvents: 'none' }} />
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
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #4caf50, #2e7d2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
              <div style={{ background: 'rgba(255,255,255,0.75)', borderRadius: '16px', padding: '20px 24px', border: '1px solid rgba(255,255,255,0.5)', marginBottom: '20px', overflow: 'visible' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                  <Sprout size={15} style={{ color: '#4caf50' }} />
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
                      <User size={12} style={{ color: '#9CA3AF' }} /> Owner
                    </div>
                    <Select options={userNames} value={form.owner} onChange={(v) => setForm({ ...form, owner: v })} placeholder="Select an owner" />
                    {errors.owner && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.owner}</span>}
                    {form.owner && (() => { const ownerRobots = (robots || []).filter(r => r.farmer === form.owner); if (ownerRobots.length === 0) return <div style={{ background: 'rgba(46,125,50,0.06)', border: '1px solid rgba(46,125,50,0.15)', borderRadius: '8px', padding: '8px 12px', marginTop: '8px', fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>No robots currently assigned to this farmer</div>; return (<div style={{ background: 'rgba(46,125,50,0.06)', border: '1px solid rgba(46,125,50,0.15)', borderRadius: '8px', padding: '8px 12px', marginTop: '8px' }}><div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, marginBottom: '6px' }}>Robots assigned to {form.owner}:</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>{ownerRobots.map(r => (<span key={r.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ffffff', border: '1px solid rgba(46,125,50,0.15)', borderRadius: '6px', padding: '4px 10px', fontSize: '12px' }}><span style={{ fontWeight: 600, color: '#1a1a1a' }}>{r.id}</span><span style={{ color: '#6b7280' }}>{r.model}</span><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: r.status === 'Active' ? '#4caf50' : r.status === 'Available' ? '#9CA3AF' : '#F59E0B', display: 'inline-block' }} /></span>))}</div></div>); })()}
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
                      {computedAcreage !== null && <span style={{ fontSize: '10px', color: '#2e7d2e', background: 'rgba(46,125,50,0.1)', borderRadius: '10px', padding: '2px 6px', marginLeft: '6px' }}>Auto-calculated</span>}
                    </div>
                    <input type="number" min="0" value={form.acreage} onChange={(e) => setForm({ ...form, acreage: e.target.value })}
                      readOnly={computedAcreage !== null}
                      placeholder="e.g., 120"
                      style={{
                        ...inputBase,
                        background: computedAcreage !== null ? '#f0fdf4' : '#FFFFFF',
                        borderColor: computedAcreage !== null ? 'rgba(46,125,50,0.3)' : '#D1D5DB',
                        color: computedAcreage !== null ? '#2e7d2e' : '#111827',
                        fontWeight: computedAcreage !== null ? 600 : 400,
                        cursor: computedAcreage !== null ? 'default' : 'text',
                      }}
                      onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
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
                  <div style={{ gridColumn: '1 / -1' }} data-robot-dropdown-add>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Bot size={12} style={{ color: '#9CA3AF' }} /> Assign Extra Robots
                    </div>
                    {(() => {
                      const maxRobots = parseInt(form.devices, 10) || 0;
                      const unassignedRobots = (robots || []).filter(r => !r.farm || r.farm === '' || r.status === 'Available').filter(r => r.name).sort((a, b) => a.name.localeCompare(b.name));
                      return (
                        <>
                          <p style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic', marginBottom: '8px' }}>
                            {maxRobots === 0 ? "Enter connected devices count above to enable robot assignment" : `Select up to ${maxRobots} robot${maxRobots > 1 ? 's' : ''} based on connected devices count`}
                          </p>
                          <div style={{ position: 'relative' }}>
                            <button type="button" disabled={maxRobots === 0} onClick={() => setRobotDropdownOpen(prev => !prev)}
                              style={{
                                width: '100%', padding: '10px 14px', textAlign: 'left',
                                background: maxRobots === 0 ? '#f3f4f6' : '#ffffff',
                                border: '1.5px solid #e5e7eb', borderRadius: '10px',
                                fontSize: '13px', color: maxRobots === 0 ? '#9ca3af' : '#374151',
                                cursor: maxRobots === 0 ? 'not-allowed' : 'pointer',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                              }}
                            >
                              <span>{selectedRobots.length === 0 ? 'Select robots...' : `${selectedRobots.length} robot${selectedRobots.length > 1 ? 's' : ''} selected`}</span>
                              <ChevronDown size={16} color="#6b7280" />
                            </button>
                            {robotDropdownOpen && maxRobots > 0 && (
                              <div style={{
                                position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                                background: '#ffffff', border: '1px solid rgba(76,175,80,0.2)',
                                borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                zIndex: 9999, maxHeight: '180px', overflowY: 'auto'
                              }}>
                                {unassignedRobots.length === 0 ? (
                                  <div style={{ padding: '12px 14px', fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>No available robots to assign</div>
                                ) : unassignedRobots.map(robot => {
                                  const isSelected = selectedRobots.includes(robot.id);
                                  const isDisabled = !isSelected && selectedRobots.length >= maxRobots;
                                  return (
                                    <div key={robot.id} onClick={() => { if (isDisabled) return; setSelectedRobots(prev => isSelected ? prev.filter(id => id !== robot.id) : [...prev, robot.id]); }}
                                      style={{
                                        padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px',
                                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                                        background: isSelected ? 'rgba(46,125,50,0.06)' : 'transparent',
                                        opacity: isDisabled ? 0.4 : 1
                                      }}
                                    >
                                      <div style={{
                                        width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                                        border: isSelected ? 'none' : '1.5px solid #d1d5db',
                                        background: isSelected ? '#2e7d2e' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                      }}>
                                        {isSelected && <Check size={10} color="#ffffff" />}
                                      </div>
                                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>{robot.name}</span>
                                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>{robot.id}</span>
                                      <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>{robot.model}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          {selectedRobots.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                              {selectedRobots.map(robotId => {
                                const robot = (robots || []).find(r => r.id === robotId);
                                if (!robot) return null;
                                return (
                                  <span key={robotId} style={{
                                    background: 'rgba(46,125,50,0.1)', border: '1px solid rgba(46,125,50,0.2)',
                                    borderRadius: '20px', padding: '4px 10px', fontSize: '12px', color: '#2e7d2e',
                                    display: 'inline-flex', alignItems: 'center', gap: '6px'
                                  }}>
                                    {robot.name}
                                    <span onClick={() => setSelectedRobots(prev => prev.filter(id => id !== robotId))}
                                      style={{ cursor: 'pointer', fontWeight: 700, fontSize: '14px', lineHeight: 1 }}>×</span>
                                  </span>
                                );
                              })}
                            </div>
                          )}
                          {selectedRobots.length >= maxRobots && maxRobots > 0 && (
                            <p style={{ fontSize: '11px', color: '#f97316', marginTop: '6px' }}>Maximum robots reached (limit: {maxRobots})</p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              <div style={{ marginTop: '16px', padding: '16px 0 8px', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
                {/* TODO: Replace with real interactive map (e.g. Leaflet.js or Google Maps) once available */}
                <FarmMapPreview points={[parseCoordinate(formCoordStrings[0]), parseCoordinate(formCoordStrings[1]), parseCoordinate(formCoordStrings[2])]} onMapClick={handleAddMapClick} nextPointIndex={addNextPointIndex} modalOpen={showAddModal} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Farm Boundary Points</div>
                <div style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic', marginBottom: '12px' }}>Enter GPS coordinates for 3 boundary points of your farm. Format: latitude, longitude</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[
                    { label: 'Point 1', color: '#2e7d32', key: 'coord0' },
                    { label: 'Point 2', color: '#1d6fa8', key: 'coord1' },
                    { label: 'Point 3', color: '#9333ea', key: 'coord2' },
                  ].map((cfg, i) => {
                    const parsed = parseCoordinate(formCoordStrings[i]);
                    const statusValid = parsed && !parsed.error;
                    const statusError = parsed && parsed.error;
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: cfg.color, marginBottom: '6px' }}>
                          <MapPin size={13} color={cfg.color} /> {cfg.label}
                        </div>
                        <input type="text" value={formCoordStrings[i]} onChange={(e) => { const updated = [...formCoordStrings]; updated[i] = e.target.value; setFormCoordStrings(updated); }}
                          placeholder="lat, lng" style={inputBase}
                          onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                        />
                        {statusValid && <div style={{ fontSize: '11px', color: '#2e7d32', marginTop: '4px' }}>✓ Valid</div>}
                        {statusError && <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>✗ {parsed.error}</div>}
                        {errors[cfg.key] && <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>✗ {errors[cfg.key]}</div>}
                      </div>
                    );
                  })}
                </div>
                {computedAcreage !== null && (
                  <div style={{ background: 'rgba(46,125,50,0.06)', border: '1px solid rgba(46,125,50,0.2)', borderRadius: '8px', padding: '10px 14px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'opacity 0.3s ease, transform 0.3s ease', opacity: 1, transform: 'translateY(0)' }}>
                    <Ruler size={16} style={{ color: '#2e7d32', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: '13px', color: '#374151' }}>Estimated Farm Area: <span style={{ fontWeight: 700, color: '#2e7d32' }}>{computedAcreage} Est. Acres</span></span>
                      <div style={{ fontSize: '10px', color: '#9ca3af', fontStyle: 'italic', marginTop: '2px' }}>Based on 3-point boundary approximation</div>
                    </div>
                  </div>
                )}
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
                  style={{ background: '#4caf50', color: '#FFFFFF', fontWeight: 600, borderRadius: '12px', padding: '9px 20px', cursor: 'pointer', transition: 'all 0.2s ease', border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(46,125,50,0.35)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
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
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #4caf50, #2e7d2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
              <div style={{ background: 'rgba(255,255,255,0.75)', borderRadius: '16px', padding: '20px 24px', border: '1px solid rgba(255,255,255,0.5)', marginBottom: '20px', overflow: 'visible' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                  <Sprout size={15} style={{ color: '#4caf50' }} />
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
                      {editComputedAcreage !== null && <span style={{ fontSize: '10px', color: '#2e7d2e', background: 'rgba(46,125,50,0.1)', borderRadius: '10px', padding: '2px 6px', marginLeft: '6px' }}>Auto-calculated</span>}
                    </div>
                    <input type="number" min="0" value={editFarmForm.acreage} onChange={(e) => setEditFarmForm({ ...editFarmForm, acreage: e.target.value })}
                      readOnly={editComputedAcreage !== null}
                      placeholder="e.g., 120"
                      style={{
                        ...inputBase,
                        background: editComputedAcreage !== null ? '#f0fdf4' : '#FFFFFF',
                        borderColor: editComputedAcreage !== null ? 'rgba(46,125,50,0.3)' : '#D1D5DB',
                        color: editComputedAcreage !== null ? '#2e7d2e' : '#111827',
                        fontWeight: editComputedAcreage !== null ? 600 : 400,
                        cursor: editComputedAcreage !== null ? 'default' : 'text',
                      }}
                      onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
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
                  <div style={{ gridColumn: '1 / -1' }} data-robot-dropdown-edit>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Bot size={12} style={{ color: '#9CA3AF' }} /> Assign Extra Robots
                    </div>
                    {(() => {
                      const maxRobots = parseInt(editFarmForm.devices, 10) || 0;
                      const unassignedRobots = (robots || []).filter(r => !r.farm || r.farm === '' || r.status === 'Available' || r.farm === editFarm?.name).filter(r => r.name).sort((a, b) => a.name.localeCompare(b.name));
                      return (
                        <>
                          <p style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic', marginBottom: '8px' }}>
                            {maxRobots === 0 ? "Enter connected devices count above to enable robot assignment" : `Select up to ${maxRobots} robot${maxRobots > 1 ? 's' : ''} based on connected devices count`}
                          </p>
                          <div style={{ position: 'relative' }}>
                            <button type="button" disabled={maxRobots === 0} onClick={() => setEditRobotDropdownOpen(prev => !prev)}
                              style={{
                                width: '100%', padding: '10px 14px', textAlign: 'left',
                                background: maxRobots === 0 ? '#f3f4f6' : '#ffffff',
                                border: '1.5px solid #e5e7eb', borderRadius: '10px',
                                fontSize: '13px', color: maxRobots === 0 ? '#9ca3af' : '#374151',
                                cursor: maxRobots === 0 ? 'not-allowed' : 'pointer',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                              }}
                            >
                              <span>{editSelectedRobots.length === 0 ? 'Select robots...' : `${editSelectedRobots.length} robot${editSelectedRobots.length > 1 ? 's' : ''} selected`}</span>
                              <ChevronDown size={16} color="#6b7280" />
                            </button>
                            {editRobotDropdownOpen && maxRobots > 0 && (
                              <div style={{
                                position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                                background: '#ffffff', border: '1px solid rgba(76,175,80,0.2)',
                                borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                zIndex: 9999, maxHeight: '180px', overflowY: 'auto'
                              }}>
                                {unassignedRobots.length === 0 ? (
                                  <div style={{ padding: '12px 14px', fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>No available robots to assign</div>
                                ) : unassignedRobots.map(robot => {
                                  const isSelected = editSelectedRobots.includes(robot.id);
                                  const isDisabled = !isSelected && editSelectedRobots.length >= maxRobots;
                                  return (
                                    <div key={robot.id} onClick={() => { if (isDisabled) return; setEditSelectedRobots(prev => isSelected ? prev.filter(id => id !== robot.id) : [...prev, robot.id]); }}
                                      style={{
                                        padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px',
                                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                                        background: isSelected ? 'rgba(46,125,50,0.06)' : 'transparent',
                                        opacity: isDisabled ? 0.4 : 1
                                      }}
                                    >
                                      <div style={{
                                        width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                                        border: isSelected ? 'none' : '1.5px solid #d1d5db',
                                        background: isSelected ? '#2e7d2e' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                      }}>
                                        {isSelected && <Check size={10} color="#ffffff" />}
                                      </div>
                                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>{robot.name}</span>
                                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>{robot.id}</span>
                                      <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>{robot.model}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          {editSelectedRobots.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                              {editSelectedRobots.map(robotId => {
                                const robot = (robots || []).find(r => r.id === robotId);
                                if (!robot) return null;
                                return (
                                  <span key={robotId} style={{
                                    background: 'rgba(46,125,50,0.1)', border: '1px solid rgba(46,125,50,0.2)',
                                    borderRadius: '20px', padding: '4px 10px', fontSize: '12px', color: '#2e7d2e',
                                    display: 'inline-flex', alignItems: 'center', gap: '6px'
                                  }}>
                                    {robot.name}
                                    <span onClick={() => setEditSelectedRobots(prev => prev.filter(id => id !== robotId))}
                                      style={{ cursor: 'pointer', fontWeight: 700, fontSize: '14px', lineHeight: 1 }}>×</span>
                                  </span>
                                );
                              })}
                            </div>
                          )}
                          {editSelectedRobots.length >= maxRobots && maxRobots > 0 && (
                            <p style={{ fontSize: '11px', color: '#f97316', marginTop: '6px' }}>Maximum robots reached (limit: {maxRobots})</p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              <div style={{ marginTop: '16px', padding: '16px 0 8px', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
                {/* TODO: Replace with real interactive map (e.g. Leaflet.js or Google Maps) once available */}
                <FarmMapPreview points={[parseCoordinate(editFormCoordStrings[0]), parseCoordinate(editFormCoordStrings[1]), parseCoordinate(editFormCoordStrings[2])]} onMapClick={handleEditMapClick} nextPointIndex={editNextPointIndex} modalOpen={!!editFarm} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Farm Boundary Points</div>
                <div style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic', marginBottom: '12px' }}>Enter GPS coordinates for 3 boundary points of your farm. Format: latitude, longitude</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[
                    { label: 'Point 1', color: '#2e7d32', key: 'editCoord0' },
                    { label: 'Point 2', color: '#1d6fa8', key: 'editCoord1' },
                    { label: 'Point 3', color: '#9333ea', key: 'editCoord2' },
                  ].map((cfg, i) => {
                    const parsed = parseCoordinate(editFormCoordStrings[i]);
                    const statusValid = parsed && !parsed.error;
                    const statusError = parsed && parsed.error;
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: cfg.color, marginBottom: '6px' }}>
                          <MapPin size={13} color={cfg.color} /> {cfg.label}
                        </div>
                        <input type="text" value={editFormCoordStrings[i]} onChange={(e) => { const updated = [...editFormCoordStrings]; updated[i] = e.target.value; setEditFormCoordStrings(updated); }}
                          placeholder="lat, lng" style={inputBase}
                          onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                        />
                        {statusValid && <div style={{ fontSize: '11px', color: '#2e7d32', marginTop: '4px' }}>✓ Valid</div>}
                        {statusError && <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>✗ {parsed.error}</div>}
                        {editFarmErrors[cfg.key] && <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>✗ {editFarmErrors[cfg.key]}</div>}
                      </div>
                    );
                  })}
                </div>
                {editComputedAcreage !== null && (
                  <div style={{ background: 'rgba(46,125,50,0.06)', border: '1px solid rgba(46,125,50,0.2)', borderRadius: '8px', padding: '10px 14px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'opacity 0.3s ease, transform 0.3s ease', opacity: 1, transform: 'translateY(0)' }}>
                    <Ruler size={16} style={{ color: '#2e7d32', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: '13px', color: '#374151' }}>Estimated Farm Area: <span style={{ fontWeight: 700, color: '#2e7d32' }}>{editComputedAcreage} Est. Acres</span></span>
                      <div style={{ fontSize: '10px', color: '#9ca3af', fontStyle: 'italic', marginTop: '2px' }}>Based on 3-point boundary approximation</div>
                    </div>
                  </div>
                )}
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
                  style={{ background: '#4caf50', color: '#FFFFFF', fontWeight: 600, borderRadius: '12px', padding: '9px 20px', cursor: 'pointer', transition: 'all 0.2s ease', border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(46,125,50,0.35)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
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
                className="text-xs px-3.5 py-1.5 border border-[rgba(0,0,0,0.05)] rounded-xl bg-white text-text-secondary font-medium hover:bg-[#d1e8d1] hover:border-[rgba(0,0,0,0.15)] cursor-pointer transition-all duration-150 active:scale-[0.97] hover:scale-[1.04] focus-visible:scale-[1.04] focus:outline-none cancel-btn"
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
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #4caf50, #2e7d2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
                  <i className="ph ph-user text-[15px]" style={{ color: '#4caf50' }} />
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
                  style={{ background: '#4caf50', color: '#FFFFFF', fontWeight: 600, borderRadius: '12px', padding: '9px 20px', cursor: 'pointer', transition: 'all 0.2s ease', border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(46,125,50,0.35)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
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
      {profileFarm && <FarmProfileModal farm={profileFarm} onClose={() => setProfileFarm(null)} />}
    </>
  );
}
