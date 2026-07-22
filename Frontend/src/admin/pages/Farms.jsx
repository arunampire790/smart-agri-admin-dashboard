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
import { MapPin, Sprout, Home, User, Ruler, Activity, Layers, Trash2, ChevronDown, Check, Bot } from 'lucide-react';
import { computePolygonAreaAcres } from '../../utils/farmArea';
import FarmMapDrawing from '../components/FarmMapDrawing';
import { useT } from '../../i18n';

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
  const t = useT('farms');
  const statLabelKeys = { 'Total Farms': 'statTotalFarms', 'Soil Types': 'statSoilTypes', 'Crop Types': 'statCropTypes', 'Active Robots': 'statActiveRobots' };
  const coordErrText = (msg) => {
    if (msg === 'Use format: lat, lng') return t('errCoordFormat');
    if (msg === 'Lat must be -90 to 90') return t('errLatRange');
    if (msg === 'Lng must be -180 to 180') return t('errLngRange');
    return msg;
  };
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
  const [form, setForm] = useState({ name: '', owner: '', cropTypes: '', acreage: '', status: 'Active' });
  const [errors, setErrors] = useState({});
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', status: 'Active' });
  const [editErrors, setEditErrors] = useState({});
  const [editFarm, setEditFarm] = useState(null);
  const [editFarmForm, setEditFarmForm] = useState({ name: '', owner: '', cropTypes: '', soil: '', acreage: '', robot: '', status: 'Active' });
  const [editFarmErrors, setEditFarmErrors] = useState({});
  const [deleteFarm, setDeleteFarm] = useState(null);
  const [formCoords, setFormCoords] = useState([]);
  const [editCoords, setEditCoords] = useState([]);
  const [formBoundaryMeta, setFormBoundaryMeta] = useState({ boundaryType: 'polygon', circleData: null, polygonClosed: false });
  const [editBoundaryMeta, setEditBoundaryMeta] = useState({ boundaryType: 'polygon', circleData: null, polygonClosed: false });
  const handleFormBoundaryChange = (coords, meta) => { setFormCoords(coords); setFormBoundaryMeta(meta); };
  const handleEditBoundaryChange = (coords, meta) => { setEditCoords(coords); setEditBoundaryMeta(meta); };
  const handleFormAcreage = (a) => { if (a !== null) setForm(prev => ({ ...prev, acreage: a.toFixed(2) })); };
  const handleEditAcreage = (a) => { if (a !== null) setEditFarmForm(prev => ({ ...prev, acreage: a.toFixed(2) })); };
  const soilTypeOpts = ['Clay', 'Loam', 'Sandy', 'Silty', 'Peaty', 'Chalky'];

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') { setShowAddModal(false); setEditUser(null); } };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const userNames = (users || []).length ? (users || []).map((u) => u.name) : [];
  const robotIds = (robots || []).length ? (robots || []).map((r) => r.id) : [];

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = t('errFarmNameRequired');
    if (!form.owner.trim()) errs.owner = t('errOwnerRequired');
    if (!formBoundaryMeta.polygonClosed) errs.coords = 'Please draw and confirm a farm boundary on the map (click \u2713 Done)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!validate()) return;
    addFarm({
      name: form.name.trim(),
      coordinates: formCoords.length >= 3 ? formCoords : [{ lat: 0, lng: 0 }, { lat: 0, lng: 0 }, { lat: 0, lng: 0 }],
      owner: form.owner.trim(),
      crop: form.cropTypes.trim() || '—',
      soil: form.soil || '—',
      status: form.status,
      cls: form.status === 'Active' ? 'bg-brand-light text-brand-dark' : form.status === 'Idle' ? 'bg-warning-bg text-warning-text' : 'bg-danger-bg text-danger-text',
      size: form.acreage ? `${form.acreage} acres` : '—',
      cropTypes: form.cropTypes.trim() || '—',
      boundaryType: formBoundaryMeta.boundaryType,
      circleData: formBoundaryMeta.circleData,
    });
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Added Farm', target: form.name.trim(), details: `Owner: ${form.owner.trim()}, Soil: ${form.soil || '—'}, Status: ${form.status}` });
    setShowAddModal(false);
  };

  const openAdd = () => { setForm({ name: '', owner: '', cropTypes: '', soil: '', acreage: '', status: 'Active' }); setErrors({}); setFormCoords([]); setFormBoundaryMeta({ boundaryType: 'polygon', circleData: null, polygonClosed: false }); setShowAddModal(true); };
  const openEdit = (user) => { setEditForm({ name: user.name, email: user.email, phone: user.phone, status: user.status }); setEditErrors({}); setEditUser(user); };
  const validateEdit = () => {
    const errs = {};
    if (!editForm.name.trim()) errs.name = t('errFullNameRequired');
    if (!editForm.email.trim()) errs.email = t('errEmailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) errs.email = t('errEmailInvalid');
    if (!editForm.phone.trim()) errs.phone = t('errPhoneRequired');
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
    if (!editFarmForm.name.trim()) errs.name = t('errFarmNameRequired');
    if (!editFarmForm.owner.trim()) errs.owner = t('errOwnerRequired');
    if (!editBoundaryMeta.polygonClosed) errs.editCoords = 'Please draw and confirm a farm boundary on the map (click \u2713 Done)';
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
      status: farm.status || 'Active',
    });
    const isCircle = farm.boundaryType === 'circle';
    setEditCoords(farm.coordinates && farm.coordinates.length >= 3 ? farm.coordinates.map(c => ({ lat: c.lat, lng: c.lng })) : []);
    setEditBoundaryMeta({
      boundaryType: isCircle ? 'circle' : 'polygon',
      circleData: isCircle && farm.circleData ? { center: farm.circleData.center, radius: farm.circleData.radius } : null,
      polygonClosed: true,
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
      coordinates: editCoords.length >= 3 ? editCoords : [{ lat: 0, lng: 0 }, { lat: 0, lng: 0 }, { lat: 0, lng: 0 }],
      owner: editFarmForm.owner.trim(),
      crop: editFarmForm.cropTypes.trim() || '—',
      cropTypes: editFarmForm.cropTypes.trim() || '—',
      soil: editFarmForm.soil || '—',
      size: editFarmForm.acreage ? `${editFarmForm.acreage} acres` : '—',
      status,
      cls,
      boundaryType: editBoundaryMeta.boundaryType,
      circleData: editBoundaryMeta.circleData,
    });
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Edited Farm', target: editFarmForm.name.trim(), details: `Owner: ${editFarmForm.owner.trim()}, Soil: ${editFarmForm.soil || '—'}, Status: ${status}` });
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
  const statusOptions = useMemo(() => ['All Statuses', 'Active', 'Idle', 'Offline'], []);
  const ownerOptions = useMemo(() => ['All Owners', ...new Set(farms.map(f => f.owner).filter(Boolean))], [farms]);
  const computedArea = useMemo(() => {
    if (!formBoundaryMeta.polygonClosed) return null;
    if (formBoundaryMeta.boundaryType === 'circle' && formBoundaryMeta.circleData?.radius) {
      return parseFloat((Math.PI * formBoundaryMeta.circleData.radius ** 2 * 0.000247105).toFixed(1));
    }
    if (formCoords.length < 3) return null;
    return computePolygonAreaAcres(formCoords);
  }, [formCoords, formBoundaryMeta]);

  useEffect(() => {
    if (computedArea !== null) setForm(prev => ({ ...prev, acreage: computedArea.toFixed(2) }));
  }, [computedArea]);

  const editComputedArea = useMemo(() => {
    if (!editBoundaryMeta.polygonClosed) return null;
    if (editBoundaryMeta.boundaryType === 'circle' && editBoundaryMeta.circleData?.radius) {
      return parseFloat((Math.PI * editBoundaryMeta.circleData.radius ** 2 * 0.000247105).toFixed(1));
    }
    if (editCoords.length < 3) return null;
    return computePolygonAreaAcres(editCoords);
  }, [editCoords, editBoundaryMeta]);

  useEffect(() => {
    if (editComputedArea !== null) setEditFarmForm(prev => ({ ...prev, acreage: editComputedArea.toFixed(2) }));
  }, [editComputedArea]);

  const activeCardLabel = statusFilter !== 'All Statuses' ? statusFilter : ownerFilter !== 'All Owners' ? 'Total Farms' : 'Total Farms';

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

  const visibleFarmNames = useMemo(() => new Set(filteredFarms.map(f => f.name)), [filteredFarms]);
  const uniqueCropTypes = useMemo(() => {
    return [...new Set(filteredFarms.flatMap(f => (f.cropTypes || f.crop || '').split(',').map(s => s.trim()).filter(Boolean)))].sort();
  }, [filteredFarms]);
  const cropTypeSubtext = useMemo(() => {
    if (uniqueCropTypes.length === 0) return 'No crop data available';
    const names = uniqueCropTypes.slice(0, 3).join(', ');
    return uniqueCropTypes.length > 3 ? `${names} & ${uniqueCropTypes.length - 3} more` : names;
  }, [uniqueCropTypes]);
  const uniqueSoilTypes = useMemo(() => {
    return [...new Set(filteredFarms.map(f => f.soil).filter(Boolean).map(s => s.trim()))].sort();
  }, [filteredFarms]);
  const soilSubtext = useMemo(() => {
    if (uniqueSoilTypes.length === 0) return t('noSoilData');
    const names = uniqueSoilTypes.slice(0, 3).join(', ');
    return uniqueSoilTypes.length > 3 ? `${names} ${t('andCountMore').replace('{count}', uniqueSoilTypes.length - 3)}` : names;
  }, [uniqueSoilTypes, t]);
  const visibleRobots = useMemo(() => (robots || []).filter(r => visibleFarmNames.has(r.farm)), [robots, visibleFarmNames]);
  const activeRobotCount = useMemo(() => visibleRobots.filter(r => r.status === 'Active').length, [visibleRobots]);
  const activeRobotSubtext = useMemo(() => {
    const total = visibleRobots.length;
    if (total === 0) return 'No robots registered';
    const idle = visibleRobots.filter(r => r.status === 'Idle').length;
    const offline = visibleRobots.filter(r => r.status === 'Offline').length;
    return `${activeRobotCount} active · ${idle} idle · ${offline} offline`;
  }, [visibleRobots, activeRobotCount]);
  const visibleActiveFarms = useMemo(() => filteredFarms.filter(f => f.status === 'Active').length, [filteredFarms]);

  const statCards = [
    { val: String(filteredFarms.length), label: 'Total Farms', sub: `${visibleActiveFarms} active \u00B7 ${filteredFarms.length - visibleActiveFarms} inactive`, onClick: () => { setSearchTerm(''); setStatusFilter('All Statuses'); setOwnerFilter('All Owners'); } },
    { val: String(uniqueSoilTypes.length), label: 'Soil Types', sub: soilSubtext },
    { val: String(uniqueCropTypes.length), label: 'Crop Types', sub: cropTypeSubtext },
    { val: String(activeRobotCount), label: 'Active Robots', sub: activeRobotSubtext, onClick: () => { setStatusFilter('Active'); } },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-bold text-primary">{t('farmManagement')}</div>
          <div className="text-sm text-text-secondary mt-1">{t('pageSubtitle')}</div>
        </div>
        <button onClick={openAdd} className={btnPrimary}><i className="ph ph-plus" /> {t('addFarm')}</button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => {
          const { Icon, bg, color } = getIconConfig(card.label);
          const isActive = card.onClick && (card.label === 'Total Farms' ? (activeCardLabel === 'Total Farms') : (card.label === 'Active Robots' && statusFilter === 'Active'));
          return (
            <GlowCard
              key={card.label}
              onClick={card.onClick ? card.onClick : undefined}
              className="glass-card rounded-2xl p-5"
              style={{
                contentVisibility: 'auto',
                outline: isActive ? '2px solid #2e7d32' : 'none',
                outlineOffset: '-1px',
              }}
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-secondary mb-2">{t(statLabelKeys[card.label])}</div>
                  <div className="text-3xl font-extrabold text-primary">{card.val}</div>
                  {card.sub && <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>{card.sub}</div>}
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
          <div className="text-sm font-semibold text-primary mb-3">{t('allFarms')} ({farms.length})</div>
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('searchPlaceholder')} aria-label={t('searchAria')} className={inputClass} />
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', padding: '12px 0', borderBottom: '1px solid rgba(76,175,80,0.08)', marginBottom: '12px' }}>
          <FilterSelect label={t('filterStatus')} options={statusOptions} value={statusFilter} onChange={setStatusFilter} width="160px" />
          <FilterSelect label={t('filterOwner')} options={ownerOptions} value={ownerFilter} onChange={setOwnerFilter} width="160px" />
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span>{t('showingCount').replace('{shown}', filteredFarms.length).replace('{total}', farms.length)}</span>

        </div>
        {farmRows.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.3 }}><i className="ph ph-funnel" /></div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>{t('noFarmsMatch')}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>{t('tryAdjusting')}</div>
            <span onClick={() => { setSearchTerm(''); setStatusFilter('All Statuses'); setOwnerFilter('All Owners'); }}
              style={{ color: '#2e7d32', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(76,175,80,0.3)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(76,175,80,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >{t('clearFilters')}</span>
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
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>{t('colFarmName')}</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>{t('colOwner')}</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>{t('colCropType')}</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>{t('colSoilType')}</th>
                <th className="px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)', textAlign: 'center' }}>{t('colConnectedDevices')}</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>{t('colAssignedRobot')}</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>{t('colStatus')}</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>{t('colActions')}</th>
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
                      className="text-primary font-medium"
                      style={{ cursor: 'pointer', fontWeight: 700, color: '#111827', textDecoration: 'none', transition: 'color 0.15s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#4caf50'; e.currentTarget.style.textDecoration = 'underline'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#111827'; e.currentTarget.style.textDecoration = 'none'; }}
                    >{farm.name}</span>
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
                      <button title={t('tooltipEdit')} onClick={() => openEditFarm(farm)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-lg transition-all duration-200 hover:scale-110">
                        <i className="ph ph-pencil" style={{ pointerEvents: 'none' }} />
                      </button>
                      <button title={t('tooltipDelete')} onClick={() => setDeleteFarm(farm)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-danger-text text-lg transition-all duration-200 hover:scale-110">
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
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>{t('addNewFarm')}</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>{t('addFarmSubtitle')}</div>
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
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('farmInformation')}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 32px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Home size={12} style={{ color: '#9CA3AF' }} /> {t('fieldFarmName')}
                    </div>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('phFarmName')}
                      style={inputBase} onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                    />
                    {errors.name && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <User size={12} style={{ color: '#9CA3AF' }} /> {t('fieldOwner')}
                    </div>
                    <Select options={userNames} value={form.owner} onChange={(v) => setForm({ ...form, owner: v })} placeholder={t('phSelectOwner')} />
                    {errors.owner && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.owner}</span>}
                    {form.owner && (() => { const ownerRobots = (robots || []).filter(r => r.farmer === form.owner); if (ownerRobots.length === 0) return <div style={{ background: 'rgba(46,125,50,0.06)', border: '1px solid rgba(46,125,50,0.15)', borderRadius: '8px', padding: '8px 12px', marginTop: '8px', fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>{t('noRobotsForFarmer')}</div>; return (<div style={{ background: 'rgba(46,125,50,0.06)', border: '1px solid rgba(46,125,50,0.15)', borderRadius: '8px', padding: '8px 12px', marginTop: '8px' }}><div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, marginBottom: '6px' }}>{t('robotsAssignedTo').replace('{owner}', form.owner)}</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>{ownerRobots.map(r => (<span key={r.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ffffff', border: '1px solid rgba(46,125,50,0.15)', borderRadius: '6px', padding: '4px 10px', fontSize: '12px' }}><span style={{ fontWeight: 600, color: '#1a1a1a' }}>{r.id}</span><span style={{ color: '#6b7280' }}>{r.model}</span><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: r.status === 'Active' ? '#4caf50' : r.status === 'Available' ? '#9CA3AF' : '#F59E0B', display: 'inline-block' }} /></span>))}</div></div>); })()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Sprout size={12} style={{ color: '#9CA3AF' }} /> {t('fieldCropTypes')}
                    </div>
                    <input value={form.cropTypes} onChange={(e) => setForm({ ...form, cropTypes: e.target.value })} placeholder={t('phCropTypes')}
                      style={inputBase} onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Ruler size={12} style={{ color: '#9CA3AF' }} /> {t('fieldTotalAcreage')}
                      {formBoundaryMeta.polygonClosed && <span style={{ fontSize: '10px', color: '#2e7d2e', background: 'rgba(46,125,50,0.1)', borderRadius: '10px', padding: '2px 6px', marginLeft: '6px' }}>{t('autoCalculated')}</span>}
                    </div>
                    <input type="number" min="0" value={form.acreage} onChange={(e) => setForm({ ...form, acreage: e.target.value })}
                      readOnly={formBoundaryMeta.polygonClosed}
                      placeholder={t('phAcreage')}
                      style={{
                        ...inputBase,
                        background: formBoundaryMeta.polygonClosed ? '#f0fdf4' : '#FFFFFF',
                        borderColor: formBoundaryMeta.polygonClosed ? 'rgba(46,125,50,0.3)' : '#D1D5DB',
                        color: formBoundaryMeta.polygonClosed ? '#2e7d2e' : '#111827',
                        fontWeight: formBoundaryMeta.polygonClosed ? 600 : 400,
                        cursor: formBoundaryMeta.polygonClosed ? 'default' : 'text',
                      }}
                      onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Layers size={12} style={{ color: '#9CA3AF' }} /> {t('fieldSoilType')}
                    </div>
                    <Select options={soilTypeOpts} value={form.soil} onChange={(v) => setForm({ ...form, soil: v })} placeholder={t('phSelectSoil')} />
                  </div>
                </div>
              <div style={{ marginTop: '16px', padding: '16px 0 8px', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
                <FarmMapDrawing initialCoords={formCoords} initialCircleData={formBoundaryMeta.circleData} initialBoundaryType={formBoundaryMeta.boundaryType} initialClosed={formBoundaryMeta.polygonClosed} onChange={handleFormBoundaryChange} onAcreageChange={handleFormAcreage} modalOpen={showAddModal} />
                {errors.coords && <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '6px' }}>✗ {errors.coords}</div>}
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
                  {t('cancel')}
                </button>
                <button type="submit"
                  style={{ background: '#4caf50', color: '#FFFFFF', fontWeight: 600, borderRadius: '12px', padding: '9px 20px', cursor: 'pointer', transition: 'all 0.2s ease', border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(46,125,50,0.35)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '1'; }}
                >
                  <i className="ph ph-check" /> {t('addFarmBtn')}
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
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>{t('editFarmTitle')}</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>{t('editFarmSubtitle').replace('{name}', editFarm.name)}</div>
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
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('farmInformation')}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 32px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Home size={12} style={{ color: '#9CA3AF' }} /> {t('fieldFarmName')}
                    </div>
                    <input value={editFarmForm.name} onChange={(e) => setEditFarmForm({ ...editFarmForm, name: e.target.value })} placeholder={t('phFarmName')}
                      style={inputBase} onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                    />
                    {editFarmErrors.name && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{editFarmErrors.name}</span>}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <User size={12} style={{ color: '#9CA3AF' }} /> {t('fieldOwner')}
                    </div>
                    <Select options={userNames} value={editFarmForm.owner} onChange={(v) => setEditFarmForm({ ...editFarmForm, owner: v })} placeholder={t('phSelectOwner')} />
                    {editFarmErrors.owner && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{editFarmErrors.owner}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Sprout size={12} style={{ color: '#9CA3AF' }} /> {t('fieldCropTypes')}
                    </div>
                    <input value={editFarmForm.cropTypes} onChange={(e) => setEditFarmForm({ ...editFarmForm, cropTypes: e.target.value })} placeholder={t('phCropTypes')}
                      style={inputBase} onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Layers size={12} style={{ color: '#9CA3AF' }} /> {t('fieldSoilType')}
                    </div>
                    <Select options={soilTypeOpts} value={editFarmForm.soil} onChange={(v) => setEditFarmForm({ ...editFarmForm, soil: v })} placeholder={t('phSelectSoil')} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Ruler size={12} style={{ color: '#9CA3AF' }} /> {t('fieldTotalAcreage')}
                      {editBoundaryMeta.polygonClosed && <span style={{ fontSize: '10px', color: '#2e7d2e', background: 'rgba(46,125,50,0.1)', borderRadius: '10px', padding: '2px 6px', marginLeft: '6px' }}>{t('autoCalculated')}</span>}
                    </div>
                    <input type="number" min="0" value={editFarmForm.acreage} onChange={(e) => setEditFarmForm({ ...editFarmForm, acreage: e.target.value })}
                      readOnly={editBoundaryMeta.polygonClosed}
                      placeholder={t('phAcreage')}
                      style={{
                        ...inputBase,
                        background: editBoundaryMeta.polygonClosed ? '#f0fdf4' : '#FFFFFF',
                        borderColor: editBoundaryMeta.polygonClosed ? 'rgba(46,125,50,0.3)' : '#D1D5DB',
                        color: editBoundaryMeta.polygonClosed ? '#2e7d2e' : '#111827',
                        fontWeight: editBoundaryMeta.polygonClosed ? 600 : 400,
                        cursor: editBoundaryMeta.polygonClosed ? 'default' : 'text',
                      }}
                      onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                </div>
              <div style={{ marginTop: '16px', padding: '16px 0 8px', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
                <FarmMapDrawing initialCoords={editCoords} initialCircleData={editBoundaryMeta.circleData} initialBoundaryType={editBoundaryMeta.boundaryType} initialClosed={editBoundaryMeta.polygonClosed} onChange={handleEditBoundaryChange} onAcreageChange={handleEditAcreage} modalOpen={!!editFarm} />
                {editFarmErrors.editCoords && <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '6px' }}>✗ {editFarmErrors.editCoords}</div>}
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
                  {t('cancel')}
                </button>
                <button type="submit"
                  style={{ background: '#4caf50', color: '#FFFFFF', fontWeight: 600, borderRadius: '12px', padding: '9px 20px', cursor: 'pointer', transition: 'all 0.2s ease', border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(46,125,50,0.35)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '1'; }}
                >
                  <i className="ph ph-check" /> {t('updateFarmBtn')}
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
            <div className="text-lg font-bold text-primary mb-2">{t('deleteFarmTitle')}</div>
            <div className="text-sm text-text-secondary mb-6">
              {t('deleteConfirmPre')}<strong className="text-primary font-medium">{deleteFarm.name}</strong>{t('deleteConfirmPost')}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteFarm(null)}
                className="text-xs px-3.5 py-1.5 border border-[rgba(0,0,0,0.05)] rounded-xl bg-white text-text-secondary font-medium hover:bg-[#d1e8d1] hover:border-[rgba(0,0,0,0.15)] cursor-pointer transition-all duration-150 active:scale-[0.97] hover:scale-[1.04] focus-visible:scale-[1.04] focus:outline-none cancel-btn"
              >{t('cancel')}</button>
              <button onClick={handleDeleteFarm} className="bg-danger-bg text-danger-text border-none rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2 cursor-pointer transition-all duration-150 active:scale-[0.97] hover:scale-[1.04] focus-visible:scale-[1.04] focus:outline-none delete-btn">
                <Trash2 size={14} /> {t('deleteFarmBtn')}
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
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>{t('editUserTitle')}</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>{t('editUserSubtitle').replace('{name}', editUser.name)}</div>
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
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('userInformation')}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 32px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <i className="ph ph-user text-xs" style={{ color: '#9CA3AF' }} /> {t('fieldName')}
                    </div>
                    <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder={t('phFullName')}
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
                      <i className="ph ph-envelope text-xs" style={{ color: '#9CA3AF' }} /> {t('fieldEmail')}
                    </div>
                    <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder={t('phEmail')}
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
                      <i className="ph ph-phone text-xs" style={{ color: '#9CA3AF' }} /> {t('fieldPhone')}
                    </div>
                    <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} placeholder={t('phPhone')}
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
                      <i className="ph ph-circle text-xs" style={{ color: '#9CA3AF' }} /> {t('fieldStatus')}
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
                  {t('cancel')}
                </button>
                <button type="submit"
                  style={{ background: '#4caf50', color: '#FFFFFF', fontWeight: 600, borderRadius: '12px', padding: '9px 20px', cursor: 'pointer', transition: 'all 0.2s ease', border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(46,125,50,0.35)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '1'; }}
                >
                  <i className="ph ph-check" /> {t('saveChanges')}
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
