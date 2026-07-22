import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRobots } from '../../context/RobotContext';
import { useUsers } from '../../context/UserContext';
import { useFarms } from '../../context/FarmContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../utils/activityLogger';
import { useNavigate } from 'react-router-dom';
import UserProfileModal from '../components/UserProfileModal';
import FarmProfileModal from '../components/FarmProfileModal';
import { ChevronDown, Check } from 'lucide-react';
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

const models = ['AB-X1000', 'AB-X2000', 'AB-X3000'];
const farmNames = ['Green Valley Farm', 'Sunrise Orchards', 'Golden Harvest', 'Maple Ridge Farm', 'River Bend Agriculture', 'Highland Crops', 'Coastal Farms', 'Valley View Ranch'];
const statuses = ['Active', 'Idle', 'Offline', 'Maintenance'];

const inputClass = "text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-gray-300 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder text-primary cursor-text hover:border-gray-400";
const labelClass = "text-xs font-medium text-primary";


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
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-gray-300 w-full flex items-center justify-between cursor-pointer hover:border-gray-400"
        style={{ outline: 'none', boxShadow: open ? '0 0 0 2px rgba(52,199,89,0.3)' : 'none', transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)' }}
      >
        <span className={value ? 'text-primary' : 'text-text-placeholder'}>{value || placeholder}</span>
        <i className={`ph ph-caret-down text-text-placeholder text-sm transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-[100] w-full mt-1 overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            border: '1px solid rgba(255,255,255,0.6)',
            borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
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

function FormFields({ form, setForm, errors, userNames, isEditing }) {
  const t = useT('robots');
  return (
    <div style={{ background: 'rgba(255,255,255,0.75)', borderRadius: '16px', padding: '20px 24px', border: '1px solid rgba(255,255,255,0.5)', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <i className="ph ph-robot text-[15px]" style={{ color: '#4caf50' }} />
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('robotInformation')}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            <i className="ph ph-robot text-xs" style={{ color: '#9CA3AF' }} /> {t('robotName')}
          </div>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('robotNamePlaceholder')} className={inputClass} />
          {errors.name && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            <i className="ph ph-hash text-xs" style={{ color: '#9CA3AF' }} /> {t('robotId')}
          </div>
          <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder={t('robotIdPlaceholder')} className={`${inputClass} ${isEditing ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}`} readOnly={isEditing} />
          {errors.id && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.id}</span>}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            <i className="ph ph-cpu text-xs" style={{ color: '#9CA3AF' }} /> {t('model')}
          </div>
          <Select options={models} value={form.model} onChange={(v) => setForm({ ...form, model: v })} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            <i className="ph ph-user text-xs" style={{ color: '#9CA3AF' }} /> {t('farmer')}
          </div>
          <Select options={userNames} value={form.farmer} onChange={(v) => setForm({ ...form, farmer: v })} placeholder={t('noUsersAvailable')} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            <i className="ph ph-map-pin text-xs" style={{ color: '#9CA3AF' }} /> {t('assignedFarm')}
          </div>
          <Select options={farmNames} value={form.farm} onChange={(v) => setForm({ ...form, farm: v })} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            <i className="ph ph-activity text-xs" style={{ color: '#9CA3AF' }} /> {t('status')}
          </div>
          <Select options={statuses} value={form.status} onChange={(v) => setForm({ ...form, status: v })} />
        </div>
      </div>
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

export default function Robots() {
  const t = useT('robots');
  const navigate = useNavigate();
  const { robots, updateRobot, removeRobot, addHistoryEntry } = useRobots();
  const { users } = useUsers();
  const { farms, addFarm, updateFarm } = useFarms();
  const { currentUser } = useAuth();
  const userNames = users.length ? users.map((u) => u.name) : [];
  const defaultFarmer = userNames.length ? userNames[0] : '';
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => { const v = sessionStorage.getItem('globalSearchPrefill'); if (v) { setSearchTerm(v); sessionStorage.removeItem('globalSearchPrefill'); } }, []);
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [batteryFilter, setBatteryFilter] = useState('All Levels');
  const [farmFilter, setFarmFilter] = useState('All Farms');
  const [editRobot, setEditRobot] = useState(null);
  const [deleteRobot, setDeleteRobot] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [profileFarm, setProfileFarm] = useState(null);
  const [form, setForm] = useState({ name: '', id: '', model: 'AB-X1000', farmer: defaultFarmer, farm: 'Green Valley Farm', status: 'Idle' });
  const [errors, setErrors] = useState({});

  const openEdit = (robot) => { setForm({ name: robot.name, id: robot.id, model: robot.model, farmer: robot.farmer || '', farm: robot.farm, status: robot.status }); setErrors({}); setEditRobot(robot); };
  const openDelete = (robot) => setDeleteRobot(robot);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = t('robotNameRequired');
    if (!form.id.trim()) errs.id = t('robotIdRequired');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    updateRobot(editRobot, { name: form.name.trim(), id: form.id.trim(), farm: form.farm, model: form.model, farmer: form.farmer, status: form.status });
    const targetFarm = farms.find((f) => f.name === form.farm);
    if (targetFarm) { updateFarm(targetFarm, { owner: form.farmer }); }
    else { addFarm({ name: form.farm, owner: form.farmer, crop: '—', soil: '—', robot: '—', status: 'Inactive', cls: 'bg-[#7676801F] text-text-placeholder', size: '—', cropTypes: '—', devices: '0' }); }
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Edited Robot', target: form.name.trim(), details: `ID: ${form.id.trim()}, Status: ${form.status}` });
    setEditRobot(null);
  };

  const handleDelete = () => {
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Deleted Robot', target: deleteRobot.name, details: `ID: ${deleteRobot.id}` });
    addHistoryEntry({ robotId: deleteRobot.id, action: 'Deleted', farmer: deleteRobot.farmer || '—', by: 'Admin User', date: new Date().toISOString().slice(0, 10) });
    removeRobot(deleteRobot); setDeleteRobot(null);
  };

  const active = robots.filter((r) => r.status === 'Active').length;
  const idle = robots.filter((r) => r.status === 'Idle').length;
  const maintenance = robots.filter((r) => r.status === 'Maintenance').length;
  const offline = robots.filter((r) => r.status === 'Offline' || r.status === 'Inactive' || r.status === 'Lost').length;

  const filteredRobots = useMemo(() => {
    let result = robots;
    if (statusFilter !== 'All Statuses') {
      result = result.filter(r => r.status === statusFilter);
    }
    if (batteryFilter !== 'All Levels') {
      result = result.filter(r => {
        const b = r.battery;
        if (batteryFilter === 'Critical (<20%)') return b < 20;
        if (batteryFilter === 'Low (<50%)') return b >= 20 && b < 50;
        if (batteryFilter === 'Good (≥50%)') return b >= 50;
        return true;
      });
    }
    if (farmFilter !== 'All Farms') {
      result = result.filter(r => r.farm === farmFilter);
    }
    const term = searchTerm.toLowerCase().trim();
    if (!term) return result;
    return result.filter((r) =>
      (r.name || '').toLowerCase().includes(term) ||
      (r.id || '').toLowerCase().includes(term) ||
      (r.farmer || '').toLowerCase().includes(term) ||
      (r.farm || '').toLowerCase().includes(term) ||
      (r.model || '').toLowerCase().includes(term)
    );
  }, [robots, searchTerm, statusFilter, batteryFilter, farmFilter]);

  const statusFilterOptions = useMemo(() => ['All Statuses', ...new Set(robots.map(r => r.status).filter(Boolean))], [robots]);
  const farmFilterOptions = useMemo(() => ['All Farms', ...new Set(robots.map(r => r.farm).filter(Boolean))], [robots]);
  const batteryOptions = useMemo(() => ['All Levels', 'Critical (<20%)', 'Low (<50%)', 'Good (≥50%)'], []);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-bold text-primary">{t('pageTitle')}</div>
          <div className="text-sm text-text-secondary mt-1">{t('pageSubtitle')}</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <GlowCard onClick={() => navigate('/admin/robots')} className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-secondary mb-2">{t('cardOnline')}</div>
              <div className="text-3xl font-extrabold text-primary">{active}</div>
              <div className="text-[10px] text-[#22C55E] mt-1">{t('cardOnlineBattery')}</div>
            </div>
            <div style={{ background: 'rgba(46,125,50,0.1)', borderRadius: '10px', padding: '10px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ph ph-activity" style={{ fontSize: '20px', color: '#2e7d2e' }} />
            </div>
          </div>
        </GlowCard>
        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-secondary mb-2">{t('cardIdle')}</div>
              <div className="text-3xl font-extrabold text-primary">{idle}</div>
              <div className="text-[10px] text-[#D97706] mt-1">{t('cardIdleBattery')}</div>
            </div>
            <div style={{ background: 'rgba(46,125,50,0.1)', borderRadius: '10px', padding: '10px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ph ph-clock" style={{ fontSize: '20px', color: '#2e7d2e' }} />
            </div>
          </div>
        </GlowCard>
        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-secondary mb-2">{t('cardMaintenance')}</div>
              <div className="text-3xl font-extrabold text-primary">{maintenance}</div>
              <div className="text-[10px] text-text-secondary mt-1">{t('cardMaintenanceBattery')}</div>
            </div>
            <div style={{ background: 'rgba(46,125,50,0.1)', borderRadius: '10px', padding: '10px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ph ph-toolbox" style={{ fontSize: '20px', color: '#2e7d2e' }} />
            </div>
          </div>
        </GlowCard>
        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-secondary mb-2">{t('cardOffline')}</div>
              <div className="text-3xl font-extrabold text-primary">{offline}</div>
              <div className="text-[10px] text-[#EF4444] mt-1">{t('cardOfflineBattery')}</div>
            </div>
            <div style={{ background: 'rgba(46,125,50,0.1)', borderRadius: '10px', padding: '10px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ph ph-wifi-slash" style={{ fontSize: '20px', color: '#2e7d2e' }} />
            </div>
          </div>
        </GlowCard>
      </div>

      <div className="rounded-[20px] p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', contentVisibility: 'auto', willChange: 'transform' }}>
        <div className="flex flex-col items-stretch mb-4">
          <div className="text-sm font-semibold text-primary mb-3">{t('allRobots').replace('{count}', filteredRobots.length)}</div>
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('searchPlaceholder')} aria-label={t('searchAriaLabel')} className={inputClass} />
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', padding: '12px 0', borderBottom: '1px solid rgba(76,175,80,0.08)', marginBottom: '12px' }}>
          <FilterSelect label={t('filterStatus')} options={statusFilterOptions} value={statusFilter} onChange={setStatusFilter} width="160px" />
          <FilterSelect label={t('filterBattery')} options={batteryOptions} value={batteryFilter} onChange={setBatteryFilter} width="160px" />
          <FilterSelect label={t('filterFarm')} options={farmFilterOptions} value={farmFilter} onChange={setFarmFilter} width="160px" />
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span>{t('showing').replace('{shown}', filteredRobots.length).replace('{total}', robots.length)}</span>
          {(searchTerm || statusFilter !== 'All Statuses' || batteryFilter !== 'All Levels' || farmFilter !== 'All Farms') && (
            <span onClick={() => { setSearchTerm(''); setStatusFilter('All Statuses'); setBatteryFilter('All Levels'); setFarmFilter('All Farms'); }}
              style={{ color: '#2e7d32', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1a5c1a'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#2e7d32'}
            >{t('clearFilters')}</span>
          )}
        </div>
        <table className="w-full border-collapse text-sm" style={{ userSelect: 'none', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '16%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
          </colgroup>
          <thead>
            <tr><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{t('colName')}</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{t('colId')}</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{t('colFarmer')}</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{t('colFarm')}</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{t('colModel')}</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{t('colBattery')}</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{t('colStatus')}</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{t('colActions')}</th></tr>
          </thead>
          <tbody>
            {filteredRobots.length === 0 ? (
              <tr><td colSpan="8"><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.3 }}><i className="ph ph-funnel" /></div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>{t('emptyTitle')}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>{t('emptySubtitle')}</div>
                <span onClick={() => { setSearchTerm(''); setStatusFilter('All Statuses'); setBatteryFilter('All Levels'); setFarmFilter('All Farms'); }}
                  style={{ color: '#2e7d32', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(76,175,80,0.3)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(76,175,80,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >{t('clearFilters')}</span>
              </div></td></tr>
            ) : filteredRobots.map((r, i) => (
              <tr key={i}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f8f1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                style={{ transition: 'background 0.15s ease' }}
              >
                <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}><strong className="text-primary font-medium">{r.name}</strong></td>
                <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}><code className="text-xs bg-white/30 px-1.5 py-0.5 rounded-xl text-primary">{r.id}</code></td>
                <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                  {r.farmer ? (
                    <span onClick={() => { const u = users.find((x) => x.name === r.farmer); if (u) setProfileUser(u); }}
                      style={{ cursor: 'pointer', fontWeight: 600, color: '#111827', textDecoration: 'none', transition: 'color 0.15s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#4caf50'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#111827'; }}
                    >{r.farmer}</span>
                  ) : (
                    <span style={{ fontSize: '14px', fontStyle: 'italic', color: '#9CA3AF' }}>{t('unassigned')}</span>
                  )}
                </td>
                <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                  <span onClick={() => { const f = farms.find(x => x.name === r.farm); if (f) setProfileFarm(f); }}
                    style={{ cursor: 'pointer', fontWeight: 600, color: '#6B7280', textDecoration: 'none', transition: 'color 0.15s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#4caf50'; e.currentTarget.style.textDecoration = 'underline'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.textDecoration = 'none'; }}
                  >{r.farm}</span>
                </td>
                <td className="px-4 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{r.model}</td>
                <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.3)' }}>
                      <div className="h-full rounded-full" style={{ width: `${r.battery}%`, background: r.battery >= 60 ? '#22C55E' : r.battery >= 30 ? '#F59E0B' : '#EF4444' }} />
                    </div>
                    <span className="text-xs font-medium text-primary">{r.battery}%</span>
                  </div>
                </td>
                <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600,
                    color: r.status === 'Active' ? '#16a34a' : r.status === 'Assigned' ? '#2e7d2e' : r.status === 'Available' ? '#6b7280' : r.status === 'Idle' ? '#92400E' : r.status === 'Maintenance' ? '#92400E' : r.status === 'Inactive' ? '#991B1B' : '#991B1B' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%',
                      background: r.status === 'Active' ? '#16a34a' : r.status === 'Assigned' ? '#2e7d2e' : r.status === 'Available' ? '#6b7280' : r.status === 'Idle' ? '#F59E0B' : r.status === 'Maintenance' ? '#f97316' : r.status === 'Inactive' ? '#dc2626' : '#ef4444', flexShrink: 0 }} />
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                  <div className="flex gap-3 items-center">
                    <button title={t('editTooltip')} onClick={() => openEdit(r)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-lg transition-all duration-200 hover:scale-110"><i className="ph ph-pencil" /></button>
                    <button title={t('deleteTooltip')} onClick={() => openDelete(r)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-danger-text text-lg transition-all duration-200 hover:scale-110"><i className="ph ph-trash" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editRobot && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={() => setEditRobot(null)}>
          <div className="w-[560px] max-w-[calc(100vw-32px)] rounded-[24px] p-7 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60" onClick={(e) => e.stopPropagation()}
            style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #4caf50, #2e7d2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="ph ph-pen text-white text-lg" />
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>{t('editRobotTitle')}</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>{t('editRobotSubtitle').replace('{name}', editRobot.name)}</div>
                </div>
              </div>
              <button type="button" onClick={() => setEditRobot(null)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#98989D', padding: '4px', display: 'flex', transition: 'color 0.15s ease, transform 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
              ><i className="ph ph-x text-lg" /></button>
            </div>

            <form onSubmit={handleEdit}>
              <FormFields form={form} setForm={setForm} errors={errors} userNames={userNames} isEditing={!!editRobot} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setEditRobot(null)}
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

      {deleteRobot && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setDeleteRobot(null)}>
          <div className="rounded-[20px] p-6 w-[400px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-white/50" onClick={(e) => e.stopPropagation()} style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}>
            <div className="text-lg font-bold text-primary mb-2">{t('deleteRobotTitle')}</div>
            <div className="text-sm text-text-secondary mb-6">
              {t('deleteConfirmPre')}<strong className="text-primary font-medium">{deleteRobot.name}</strong>{t('deleteConfirmPost').replace('{id}', deleteRobot.id)}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteRobot(null)}
                style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.15)', color: '#4B5563', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s ease', padding: '9px 18px', fontSize: '13px' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >{t('cancel')}</button>
              <button onClick={handleDelete}
                style={{ background: '#FEE2E2', color: '#DC2626', fontWeight: 600, borderRadius: '12px', padding: '9px 20px', cursor: 'pointer', transition: 'all 0.2s ease', border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FCA5A5'; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(220,38,38,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '1'; }}
              ><i className="ph ph-trash" /> {t('delete')}</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {profileUser && <UserProfileModal user={profileUser} onClose={() => setProfileUser(null)} />}
      {profileFarm && <FarmProfileModal farm={profileFarm} onClose={() => setProfileFarm(null)} />}
    </>
  );
}
