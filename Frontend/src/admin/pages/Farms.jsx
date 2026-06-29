import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarms } from '../../context/FarmContext';
import { useRobots } from '../../context/RobotContext';
import { useUsers } from '../../context/UserContext';

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
    case 'Total Farms': return { icon: 'ph-warehouse', bg: '#e8f5e9', color: '#059669' };
    case 'Regions': return { icon: 'ph-map-pin', bg: '#e0f2fe', color: '#0284c7' };
    case 'Crop Types': return { icon: 'ph-flower', bg: '#f3e5f5', color: '#7c3aed' };
    case 'Active Robots': return { icon: 'ph-robot', bg: '#e8f5e9', color: '#059669' };
    default: return { icon: 'ph-info', bg: '#f5f5f5', color: '#757575' };
  }
}

const statusOpts = ['Active', 'Idle', 'Offline'];

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
  const { farms, addFarm } = useFarms();
  const { robots } = useRobots();
  const { users } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', owner: '', cropTypes: '', acreage: '', devices: '0', status: 'Active' });
  const [errors, setErrors] = useState({});

  const userNames = users.length ? users.map((u) => u.name) : [];

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
      soil: '—',
      robot: '—',
      status: form.status,
      cls: form.status === 'Active' ? 'bg-brand-light text-brand-dark' : form.status === 'Idle' ? 'bg-warning-bg text-warning-text' : 'bg-danger-bg text-danger-text',
      size: form.acreage ? `${form.acreage} acres` : '—',
      cropTypes: form.cropTypes.trim() || '—',
      devices: form.devices || '0',
    });
    setShowAddModal(false);
    // TODO: Replace with real backend API call once backend is added.
  };

  const openAdd = () => { setForm({ name: '', location: '', owner: '', cropTypes: '', acreage: '', devices: '0', status: 'Active' }); setErrors({}); setShowAddModal(true); };

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-bold text-primary">Farm Management</div>
          <div className="text-sm text-text-secondary mt-1">View and manage agricultural properties</div>
        </div>
        <button onClick={openAdd} className={btnPrimary}><i className="ph ph-plus" /> Add Farm</button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => {
          const iconCfg = getIconConfig(card.label);
          return (
            <div
              key={card.label}
              onClick={card.route ? () => navigate(card.route) : undefined}
              className={card.route ? "dashboard-card-link glass-card rounded-2xl p-5 overflow-hidden" : "glass-card rounded-2xl p-5 overflow-hidden"}
              style={{ contentVisibility: 'auto' }}
            >
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: getGlowColor(card.label), filter: 'blur(30px)', opacity: 0.35 }} />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-secondary mb-2">{card.label}</div>
                  <div className="text-3xl font-extrabold text-primary">{card.val}</div>
                </div>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: iconCfg.bg }}>
                  <i className={`${iconCfg.icon}`} style={{ color: iconCfg.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-[20px] p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', contentVisibility: 'auto', willChange: 'transform' }}>
        <div className="flex flex-col items-stretch mb-4">
          <div className="text-sm font-semibold text-primary mb-3">All Farms ({farms.length})</div>
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
                  <td className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}><strong className="text-primary font-medium">{farm.name}</strong></td>
                  <td className="px-5 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{farm.location}</td>
                  <td className="px-5 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{farm.owner}</td>
                  <td className="px-5 py-4 border-b text-center" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    <span className="pill inline-flex items-center justify-center min-w-[28px] px-2.5 py-0.5 rounded-full bg-white/40 text-text-secondary text-xs font-semibold">{connectedCount}</span>
                  </td>
                  <td className="px-5 py-4 border-b text-center" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${status.cls}`}>{status.label}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} onClick={() => setShowAddModal(false)}>
          <div
            className="w-[440px] max-w-[calc(100vw-32px)] p-8 max-h-[calc(100vh-40px)] overflow-y-auto"
            style={{
              background: 'rgba(255, 255, 255, 0.96)',
              border: '1px solid rgba(229, 231, 235, 0.5)',
              borderRadius: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-lg font-bold" style={{ color: '#111827' }}>Add New Farm</div>
                <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Enter details to register a new farm.</div>
              </div>
              <button type="button" onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '20px', padding: 0, lineHeight: 1, transition: 'color 0.15s ease, transform 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <i className="ph ph-x" />
              </button>
            </div>

            <form onSubmit={handleAdd}>
              <div className="space-y-4 mb-6">
                <div className="flex flex-col gap-1.5">
                  <label style={labelStyle}>Farm Name <span style={{ color: '#DC2626' }}>*</span></label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Green Valley Farm"
                    style={inputBase} onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                  />
                  {errors.name && <span className="text-[10px]" style={{ color: '#DC2626' }}>{errors.name}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label style={labelStyle}>Location <span style={{ color: '#DC2626' }}>*</span></label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g., California, USA"
                    style={inputBase} onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                  />
                  {errors.location && <span className="text-[10px]" style={{ color: '#DC2626' }}>{errors.location}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label style={labelStyle}>Owner <span style={{ color: '#DC2626' }}>*</span></label>
                  <Select options={userNames} value={form.owner} onChange={(v) => setForm({ ...form, owner: v })} placeholder="Select an owner" />
                  {errors.owner && <span className="text-[10px]" style={{ color: '#DC2626' }}>{errors.owner}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label style={labelStyle}>Crop Types</label>
                  <input value={form.cropTypes} onChange={(e) => setForm({ ...form, cropTypes: e.target.value })} placeholder="e.g., Wheat, Barley"
                    style={inputBase} onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label style={labelStyle}>Total Acreage</label>
                  <input type="number" min="0" value={form.acreage} onChange={(e) => setForm({ ...form, acreage: e.target.value })} placeholder="e.g., 120"
                    style={inputBase} onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label style={labelStyle}>Connected Devices</label>
                  <input type="number" min="0" value={form.devices} onChange={(e) => setForm({ ...form, devices: e.target.value })} placeholder="0"
                    style={inputBase} onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label style={labelStyle}>Status <span style={{ color: '#DC2626' }}>*</span></label>
                  <div className="flex gap-2">
                    {statusOpts.map((opt) => (
                      <button key={opt} type="button"
                        onClick={() => setForm({ ...form, status: opt })}
                        style={{
                          flex: 1, padding: '8px 0', fontSize: '13px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer',
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
                  {errors.status && <span className="text-[10px]" style={{ color: '#DC2626' }}>{errors.status}</span>}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)}
                  style={{
                    background: '#FFFFFF', border: '1px solid #D1D5DB', color: '#4B5563',
                    fontWeight: 500, borderRadius: '8px', cursor: 'pointer',
                    transition: 'all 0.15s ease', padding: '8px 16px', fontSize: '13px',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#111827'; e.currentTarget.style.borderColor = '#9CA3AF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = '#4B5563'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Cancel
                </button>
                <button type="submit"
                  style={{
                    background: '#10B981', color: '#FFFFFF', fontWeight: 600, borderRadius: '8px',
                    padding: '10px 20px', cursor: 'pointer', transition: 'all 0.2s ease',
                    border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.transform = 'scale(1)'; }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                >
                  <i className="ph ph-plus" /> Add Farm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
