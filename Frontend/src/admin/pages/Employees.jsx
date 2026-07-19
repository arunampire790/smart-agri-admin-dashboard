import { createPortal } from 'react-dom';
import { Check, ChevronDown, Clock, UserPlus, User, Mail, Phone, Shield, Activity, UserPen, Trash2 } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEmployees } from '../../context/EmployeeContext';
import { logActivity, getActivityLog } from '../../utils/activityLogger';

const glassInput = "text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-gray-300 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder text-primary cursor-text hover:border-gray-400";
const inputClass = "add-input-field";
const cancelBtnClass = "add-cancel-btn";
const submitBtnClass = "add-submit-btn";
const closeBtnClass = "add-close-btn";
const labelClass = "text-xs font-medium text-[#1a2e1a] tracking-wide";
const statusOptions = ['Active', 'Inactive'];

const StatusDropdown = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className={`add-input-field flex items-center justify-between ${open ? 'add-input-open' : ''}`} style={{ cursor: 'pointer' }}>
        <span className={value ? 'text-[#1a2e1a]' : 'text-text-placeholder'}>{value}</span>
        <i className={`ph ph-caret-down text-text-placeholder text-sm transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className="absolute z-50 w-full mt-1 overflow-hidden"
          style={{
            background: 'rgba(245,245,247,0.75)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            border: '1px solid rgba(255,255,255,0.6)',
            borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            outline: 'none !important',
          }}
        >
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                padding: '12px 16px',
                fontSize: '14px',
                color: opt === value ? '#4caf50' : '#1d1d1f',
                background: opt === value ? 'rgba(76,175,80,0.12)' : 'transparent',
                outline: 'none !important',
                cursor: 'pointer',
                transition: 'background 0.15s, color 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onMouseEnter={(e) => {
                if (opt !== value) {
                  e.currentTarget.style.background = 'rgba(76,175,80,0.12)';
                  e.currentTarget.style.color = '#4caf50';
                }
              }}
              onMouseLeave={(e) => {
                if (opt !== value) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#1d1d1f';
                }
              }}
            >
              <span>{opt}</span>
              {opt === value && <span style={{ color: '#4caf50', fontSize: '14px', fontWeight: 600 }}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
        <span className={value !== 'All' ? 'text-primary' : 'text-text-placeholder'}>{value || placeholder || 'Select...'}</span>
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

function ActivityLog({ employeeName }) {
  const entries = useMemo(() => {
    const log = getActivityLog();
    return log.filter((entry) => entry.target === employeeName);
  }, [employeeName]);

  const extractEntity = (action) => {
    if (action.includes('User')) return 'User';
    if (action.includes('Farm')) return 'Farm';
    if (action.includes('Robot')) return 'Robot';
    if (action.includes('Task')) return 'Task';
    return '';
  };

  const extractAction = (action) => action.split(' ')[0];

  const entityColors = {
    User: 'bg-blue-100 text-blue-800',
    Farm: 'bg-emerald-100 text-emerald-800',
    Robot: 'bg-violet-100 text-violet-800',
    Task: 'bg-amber-100 text-amber-800',
  };

  const actionIcons = {
    'Added': 'ph-plus-circle',
    'Edited': 'ph-pencil',
    'Deleted': 'ph-trash',
    'Assigned': 'ph-user-plus',
    'Started': 'ph-play',
    'Completed': 'ph-check-circle',
  };

  const entityBorderColors = {
    User: 'rgba(59,130,246,0.35)',
    Farm: 'rgba(76,175,80,0.35)',
    Robot: 'rgba(139,92,246,0.35)',
    Task: 'rgba(245,158,11,0.35)',
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-text-placeholder">
        <i className="ph ph-clock-counter-clockwise text-4xl mb-3 opacity-50" />
        <p className="text-sm font-medium">No activity recorded yet for this employee.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[50vh] overflow-y-auto">
      {entries.map((entry) => {
        const entity = extractEntity(entry.action);
        const actionType = extractAction(entry.action);
        const entityColor = entityColors[entity] || 'bg-gray-100 text-gray-800';
        const icon = actionIcons[actionType] || 'ph-dot';

        return (
          <div key={entry.id} className="flex items-start gap-3.5 px-5 py-5 transition-colors hover:bg-white/20" style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', borderLeft: `3px solid ${entityBorderColors[entity] || 'transparent'}`, paddingLeft: 'calc(1.25rem - 3px)' }}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${entityColor}`}>
              <i className={`ph ${icon} text-sm`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-semibold text-primary">{entry.userName}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/40 text-text-secondary">{entity || 'System'}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${entityColor}`}>{entry.action}</span>
              </div>
              <div style={{ marginTop: '10px' }}>
                <div className="text-sm font-medium text-primary">{entry.target}</div>
                {entry.details && (
                  <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: '6px' }}>
                    {entry.details.split(', ').map((seg, i) => {
                      const colonIdx = seg.indexOf(':');
                      const label = colonIdx > -1 ? seg.slice(0, colonIdx).trim() : '';
                      const value = colonIdx > -1 ? seg.slice(colonIdx + 1).trim() : seg;
                      const hasChange = value.includes('→');
                      const parts = hasChange ? value.split('→').map(s => s.trim()) : [value];
                      const actuallyChanged = hasChange && parts[0] !== parts[1];
                      return (
                        <span key={i} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          background: actuallyChanged ? 'rgba(76,175,80,0.1)' : 'rgba(0,0,0,0.04)',
                          border: `1px solid ${actuallyChanged ? 'rgba(76,175,80,0.2)' : 'rgba(0,0,0,0.06)'}`,
                          borderRadius: '6px', padding: '4px 8px', fontSize: '12px',
                        }}>
                          <span style={{ color: '#6B7280', fontWeight: 500 }}>{label}:</span>
                          <span style={{ color: actuallyChanged ? '#2e7d2e' : '#374151', fontWeight: 500 }}>
                            {hasChange ? (
                              <>{parts[0]} <span style={{ color: '#9CA3AF' }}>→</span> {parts[1]}</>
                            ) : value}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-text-placeholder whitespace-nowrap shrink-0" style={{ paddingTop: '2px' }}>
              {formatTime(entry.timestamp)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <i className="ph ph-shield-warning text-6xl text-text-placeholder mb-4" />
      <h2 className="text-xl font-bold text-[#1a2e1a] mb-2">Access Denied</h2>
      <p className="text-sm text-text-secondary">You don't have permission to view this page.</p>
    </div>
  );
}

export default function Employees() {
  const { currentUser } = useAuth();
  const { employees, addEmployee, removeEmployee, updateEmployee } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  useEffect(() => { const v = sessionStorage.getItem('globalSearchPrefill'); if (v) { setSearchTerm(v); sessionStorage.removeItem('globalSearchPrefill'); } }, []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [deleteEmployee, setDeleteEmployee] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'Admin', status: 'Active' });
  const [errors, setErrors] = useState({});
  const [viewActivity, setViewActivity] = useState(null);

  // TODO: Enforce this role check server-side once backend is added — this is a frontend-only gate for now and can be bypassed via dev tools.
  const isMasterAdmin = currentUser?.role === 'masterAdmin';

  const filtered = useMemo(() => {
    let result = employees;
    if (statusFilter !== 'All Statuses') result = result.filter(e => e.status === statusFilter);
    if (roleFilter !== 'All Roles') result = result.filter(e => e.role === roleFilter);
    if (!searchTerm.trim()) return result;
    const q = searchTerm.toLowerCase();
    return result.filter((e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q));
  }, [employees, searchTerm, statusFilter, roleFilter]);

  const statusFilterOptions = useMemo(() => ['All Statuses', ...new Set(employees.map(e => e.status).filter(Boolean))], [employees]);
  const roleFilterOptions = useMemo(() => ['All Roles', ...new Set(employees.map(e => e.role).filter(Boolean))], [employees]);

  const openAdd = () => { setForm({ name: '', email: '', phone: '', role: 'Admin', status: 'Active' }); setErrors({}); setShowAddModal(true); };
  const openEdit = (emp) => { setForm({ name: emp.name, email: emp.email, phone: emp.phone, role: emp.role || 'Admin', status: emp.status }); setErrors({}); setEditEmployee(emp); };
  const openDelete = (emp) => setDeleteEmployee(emp);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // TODO: Replace with real backend API call once backend is added — this is a frontend-only simulation.
  const handleAdd = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const status = form.status;
    addEmployee({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role,
      status,
      joined: new Date().toISOString().slice(0, 10),
    });
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Added Employee', target: form.name.trim(), details: `Email: ${form.email.trim()}, Role: ${form.role}` });
    setShowAddModal(false);
  };

  // TODO: Replace with real backend API call once backend is added — this is a frontend-only simulation.
  const handleEdit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const status = form.status;
    updateEmployee(editEmployee, { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), role: form.role, status });
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Edited Employee', target: editEmployee.name, details: `Role: ${form.role}, Status: ${editEmployee.status} → ${status}` });
    setEditEmployee(null);
  };

  // TODO: Replace with real backend API call once backend is added — this is a frontend-only simulation.
  const handleDelete = () => {
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Deleted Employee', target: deleteEmployee.name, details: `Email: ${deleteEmployee.email}` });
    removeEmployee(deleteEmployee); setDeleteEmployee(null);
  };

  const btnPrimary = "bg-brand text-white border-none rounded-xl px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(46,125,50,0.35)]";

  if (!isMasterAdmin) {
    return (
      <>
        <style>{`
@keyframes statusPulse { 0% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.5; } }
.add-input-field { font-size: 0.875rem; padding: 0.625rem 0.875rem; border-radius: 0.75rem; width: 100%; background: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.6); outline: none; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); cursor: text; box-sizing: border-box; color: #1a2e1a; }
.add-input-field::placeholder { color: #98989D; }
.add-input-field:hover { border-color: #9CA3AF; }
.add-input-field:focus { background: #FFFFFF; border-color: #4caf50; box-shadow: 0 0 0 4px rgba(76,175,80,0.15); outline: none; }
        `}</style>
        <AccessDenied />
      </>
    );
  }

  return (
    <>
      <style>{`
@keyframes statusPulse { 0% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.5; } }
.add-modal-input { width: 100%; height: 40px; border-radius: 8px; padding: 0 14px; font-size: 14px; background: #FFFFFF; color: #111827; border: 1px solid #D1D5DB; transition: all 0.2s ease; box-sizing: border-box; cursor: text; }
.add-modal-input:hover { border-color: #9CA3AF; }
.add-modal-input:focus { border-color: #4caf50; box-shadow: 0 0 0 4px rgba(76,175,80,0.15); outline: none; }
.add-modal-input::placeholder { color: #4B5563; }
.add-modal-label { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; display: block; }
.add-close-btn { cursor: pointer; transition: color 0.15s ease, transform 0.15s ease; background: none; border: none; font-size: 1.25rem; line-height: 1; padding: 0; color: #9CA3AF; }
.add-close-btn:hover { color: #EF4444; transform: scale(1.1); }
.add-input-field { font-size: 0.875rem; padding: 0.625rem 0.875rem; border-radius: 0.75rem; width: 100%; background: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.6); outline: none; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); cursor: text; box-sizing: border-box; color: #1a2e1a; }
.add-input-field::placeholder { color: #98989D; }
.add-input-field:hover { border-color: #9CA3AF; }
.add-input-field:focus { background: #FFFFFF; border-color: #4caf50; box-shadow: 0 0 0 4px rgba(76,175,80,0.15); outline: none; }
.add-input-open { background: #FFFFFF !important; border-color: #4caf50 !important; box-shadow: 0 0 0 4px rgba(76,175,80,0.15) !important; }
.add-cancel-btn { cursor: pointer; transition: all 0.15s ease; font-size: 0.8125rem; padding: 0.375rem 0.875rem; border: 1px solid rgba(0,0,0,0.05); border-radius: 0.75rem; background: #FFFFFF; color: #6B7280; font-weight: 500; }
.add-cancel-btn:hover { background: #F3F4F6; border-color: #9CA3AF; color: #111827; }
.add-cancel-btn:active { transform: scale(0.97); }
.add-submit-btn { cursor: pointer; transition: all 0.2s ease; background: #4caf50; color: #FFFFFF; font-weight: 600; border: none; border-radius: 0.75rem; padding: 0.5rem 1rem; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem; }
.add-submit-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(46,125,50,0.35); }
.add-submit-btn:active { transform: translateY(1px) scale(0.96); opacity: 0.95; }
.cancel-btn:hover, .cancel-btn:focus-visible { animation: pulseGlowGray 1.5s ease-in-out infinite; }
.delete-btn:hover, .delete-btn:focus-visible { animation: pulseGlowRed 1.5s ease-in-out infinite; }
@keyframes pulseGlowGray { 0%, 100% { box-shadow: 0 0 4px rgba(0,0,0,0.06); } 50% { box-shadow: 0 0 12px rgba(0,0,0,0.12); } }
@keyframes pulseGlowRed { 0%, 100% { box-shadow: 0 0 4px rgba(220,38,38,0.12); } 50% { box-shadow: 0 0 14px rgba(220,38,38,0.25); } }
      `}</style>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-bold text-[#000000]">Employee Management</div>
          <div className="text-sm text-text-secondary mt-1">Manage admin-level staff accounts</div>
        </div>
        <button onClick={openAdd} className={btnPrimary}>
          <i className="ph ph-plus" /> Add Employee
        </button>
      </div>

      <div className="rounded-[20px] p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50" style={{ background: 'var(--clr-card)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', contentVisibility: 'auto', willChange: 'transform' }}>
        <div className="flex flex-col items-stretch mb-4">
          <div className="text-sm font-semibold text-[#1a2e1a] mb-3">All Employees ({employees.length})</div>
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search employees by name or email..." aria-label="Search employees" className={glassInput} />
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', padding: '12px 0', borderBottom: '1px solid rgba(76,175,80,0.08)', marginBottom: '12px' }}>
          <FilterSelect label="STATUS" options={statusFilterOptions} value={statusFilter} onChange={setStatusFilter} width="160px" />
          <FilterSelect label="ROLE" options={roleFilterOptions} value={roleFilter} onChange={setRoleFilter} width="160px" />
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span>Showing {filtered.length} of {employees.length} employees</span>
          {(searchTerm || statusFilter !== 'All Statuses' || roleFilter !== 'All Roles') && (
            <span onClick={() => { setSearchTerm(''); setStatusFilter('All Statuses'); setRoleFilter('All Roles'); }}
              style={{ color: '#2e7d32', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1a5c1a'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#2e7d32'}
            >Clear Filters</span>
          )}
        </div>
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.3 }}><i className="ph ph-funnel" /></div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>No employees match your current filters</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>Try adjusting or clearing your filters</div>
            <span onClick={() => { setSearchTerm(''); setStatusFilter('All Statuses'); setRoleFilter('All Roles'); }}
              style={{ color: '#2e7d32', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(76,175,80,0.3)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(76,175,80,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >Clear Filters</span>
          </div>
        ) : (
          <table className="w-full border-collapse text-sm" style={{ userSelect: 'none' }}>
            <thead>
              <tr>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Name</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Email</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Phone</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Role</th>
                <th className="text-center px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Status</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Joined</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, i) => (
                <tr key={i} className="group"
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f8f1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  style={{ transition: 'background 0.15s ease' }}
                >
                  <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    <span style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', transition: 'color 0.15s ease, text-decoration 0.15s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#4caf50'; e.currentTarget.style.textDecoration = 'underline'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.textDecoration = ''; }}
                      onClick={() => { if (isMasterAdmin) setViewActivity(emp); }}
                    >{emp.name}</span>
                  </td>
                  <td className="px-4 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{emp.email}</td>
                  <td className="px-4 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{emp.phone}</td>
                  <td className="px-4 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{emp.role}</td>
                  <td className="px-4 py-4 border-b text-center" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    <span className="inline-flex items-center justify-center" style={{ gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: emp.status === 'Active' ? '#4caf50' : '#EF4444', animation: emp.status === 'Active' ? 'statusPulse 2s ease-in-out infinite' : 'none' }} />
                      <span style={{ color: emp.status === 'Active' ? '#4caf50' : '#EF4444', fontWeight: 500, fontSize: '12px', letterSpacing: '0.01em' }}>{emp.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{emp.joined}</td>
                  <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    <div className="flex gap-3 items-center">
                      <button title="Edit" onClick={() => openEdit(emp)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-lg transition-all duration-200 hover:scale-110">
                        <i className="ph ph-pencil" />
                      </button>
                      <button title="Delete" onClick={() => openDelete(emp)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-danger-text text-lg transition-all duration-200 hover:scale-110">
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

      {/* Add Employee Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={() => setShowAddModal(false)}>
          <div className="w-[560px] max-w-[calc(100vw-32px)] rounded-[24px] p-7 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60" onClick={(e) => e.stopPropagation()}
            style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #4caf50, #2e7d2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <UserPlus size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>Add New Employee</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>Create a new admin staff account.</div>
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
                  <User size={15} color="#4caf50" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Employee Information</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 32px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <User size={12} color="#9CA3AF" /> Name
                    </div>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter full name"
                      className={glassInput}
                    />
                    {errors.name && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Mail size={12} color="#9CA3AF" /> Email
                    </div>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter email address"
                      className={glassInput}
                    />
                    {errors.email && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Phone size={12} color="#9CA3AF" /> Phone
                    </div>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1-555-xxxx"
                      className={glassInput}
                    />
                    {errors.phone && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Shield size={12} color="#9CA3AF" /> Role
                    </div>
                    <StatusDropdown value={form.role} onChange={(v) => setForm({ ...form, role: v })} options={['Master Admin', 'Admin']} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Activity size={12} color="#9CA3AF" /> Status
                    </div>
                    <StatusDropdown value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={statusOptions} />
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
                  style={{ background: '#4caf50', color: '#FFFFFF', fontWeight: 600, borderRadius: '12px', padding: '9px 20px', cursor: 'pointer', transition: 'all 0.2s ease', border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(46,125,50,0.35)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '1'; }}
                >
                  <Check size={16} /> Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Employee Modal */}
      {editEmployee && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={() => setEditEmployee(null)}>
          <div className="w-[560px] max-w-[calc(100vw-32px)] rounded-[24px] p-7 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60" onClick={(e) => e.stopPropagation()}
            style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #4caf50, #2e7d2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <UserPen size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>Edit Employee Details</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>Update information for {editEmployee.name}.</div>
                </div>
              </div>
              <button type="button" onClick={() => setEditEmployee(null)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#98989D', padding: '4px', display: 'flex', transition: 'color 0.15s ease, transform 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
              ><i className="ph ph-x text-lg" /></button>
            </div>

            <form onSubmit={handleEdit}>
              <div style={{ background: 'rgba(255,255,255,0.75)', borderRadius: '16px', padding: '20px 24px', border: '1px solid rgba(255,255,255,0.5)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                  <User size={15} color="#4caf50" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Employee Information</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 32px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <User size={12} color="#9CA3AF" /> Name
                    </div>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter full name"
                      className={glassInput}
                    />
                    {errors.name && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Mail size={12} color="#9CA3AF" /> Email
                    </div>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter email address"
                      className={glassInput}
                    />
                    {errors.email && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Phone size={12} color="#9CA3AF" /> Phone
                    </div>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1-555-xxxx"
                      className={glassInput}
                    />
                    {errors.phone && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Shield size={12} color="#9CA3AF" /> Role
                    </div>
                    <StatusDropdown value={form.role} onChange={(v) => setForm({ ...form, role: v })} options={['Master Admin', 'Admin']} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Activity size={12} color="#9CA3AF" /> Status
                    </div>
                    <StatusDropdown value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={statusOptions} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setEditEmployee(null)}
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
                  <Check size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Activity History Modal (Master Admin only) */}
      {viewActivity && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={() => setViewActivity(null)}>
          <div className="w-[560px] max-w-[calc(100vw-32px)] rounded-[24px] p-7 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60" onClick={(e) => e.stopPropagation()}
            style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #4caf50, #2e7d2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>Activity Log — {viewActivity.name}</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>All actions performed by this employee.</div>
                </div>
              </div>
              <button type="button" onClick={() => setViewActivity(null)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#98989D', padding: '4px', display: 'flex', transition: 'color 0.15s ease, transform 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
              ><i className="ph ph-x text-lg" /></button>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.75)', borderRadius: '16px', padding: '20px 24px', border: '1px solid rgba(255,255,255,0.5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                <Activity size={15} color="#4caf50" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Activity History</span>
              </div>
              <ActivityLog employeeName={viewActivity.name} />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Employee Modal */}
      {deleteEmployee && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setDeleteEmployee(null)}>
          <div className="rounded-[20px] p-6 w-[400px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-white/50" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-modal)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}>
            <div className="text-lg font-bold text-primary mb-2">Delete Employee?</div>
            <div className="text-sm text-text-secondary mb-6">
              Are you sure you want to delete <strong className="text-primary font-medium">{deleteEmployee.name}</strong>? This action cannot be undone.
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteEmployee(null)}
                className="text-xs px-3.5 py-1.5 border border-[rgba(0,0,0,0.05)] rounded-xl bg-white text-text-secondary font-medium hover:bg-[#d1e8d1] hover:border-[rgba(0,0,0,0.15)] cursor-pointer transition-all duration-150 active:scale-[0.97] hover:scale-[1.04] focus-visible:scale-[1.04] focus:outline-none cancel-btn"
              >Cancel</button>
              <button onClick={handleDelete} className="bg-danger-bg text-danger-text border-none rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2 cursor-pointer transition-all duration-150 active:scale-[0.97] hover:scale-[1.04] focus-visible:scale-[1.04] focus:outline-none delete-btn">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
