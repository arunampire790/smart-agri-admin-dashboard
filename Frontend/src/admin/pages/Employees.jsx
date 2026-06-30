import { createPortal } from 'react-dom';
import { Check, Clock, UserPlus, User, Mail, Phone, Shield, Activity } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEmployees } from '../../context/EmployeeContext';
import { logActivity, getActivityLogByUser } from '../../utils/activityLogger';

const glassInput = "text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-gray-300 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder text-primary cursor-text hover:border-gray-400";
const inputClass = "add-input-field";
const cancelBtnClass = "add-cancel-btn";
const submitBtnClass = "add-submit-btn";
const closeBtnClass = "add-close-btn";
const labelClass = "text-xs font-medium text-[#1C1C1E] tracking-wide";
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
        <span className={value ? 'text-[#1C1C1E]' : 'text-text-placeholder'}>{value}</span>
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
                color: opt === value ? '#10B981' : '#1d1d1f',
                background: opt === value ? 'rgba(16,185,129,0.12)' : 'transparent',
                outline: 'none !important',
                cursor: 'pointer',
                transition: 'background 0.15s, color 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onMouseEnter={(e) => {
                if (opt !== value) {
                  e.currentTarget.style.background = 'rgba(16,185,129,0.12)';
                  e.currentTarget.style.color = '#10B981';
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
              {opt === value && <span style={{ color: '#10B981', fontSize: '14px', fontWeight: 600 }}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function ActivityLog({ employeeName }) {
  const entries = useMemo(() => getActivityLogByUser(employeeName), [employeeName]);

  if (entries.length === 0) {
    return (
      <div className="py-10 text-center">
        <i className="ph ph-clock text-4xl text-text-placeholder mb-3" />
        <p className="text-sm text-text-secondary">No activity recorded yet for this employee.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-1">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--clr-card)', border: '1px solid rgba(255,255,255,0.3)' }}>
          <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center shrink-0 mt-0.5">
            <Clock size={14} color="#059669" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-sm font-semibold text-[#1C1C1E]">{entry.action}</span>
              <span className="text-[10px] text-text-placeholder whitespace-nowrap">{new Date(entry.timestamp).toLocaleString()}</span>
            </div>
            {entry.target && <div className="text-xs text-text-secondary mt-0.5">Target: <span className="font-medium text-[#1C1C1E]">{entry.target}</span></div>}
            {entry.details && <div className="text-xs text-text-secondary mt-0.5">{entry.details}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <i className="ph ph-shield-warning text-6xl text-text-placeholder mb-4" />
      <h2 className="text-xl font-bold text-[#1C1C1E] mb-2">Access Denied</h2>
      <p className="text-sm text-text-secondary">You don't have permission to view this page.</p>
    </div>
  );
}

export default function Employees() {
  const { currentUser } = useAuth();
  const { employees, addEmployee, removeEmployee, updateEmployee } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [deleteEmployee, setDeleteEmployee] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', status: 'Active' });
  const [errors, setErrors] = useState({});
  const [viewActivity, setViewActivity] = useState(null);

  // TODO: Enforce this role check server-side once backend is added — this is a frontend-only gate for now and can be bypassed via dev tools.
  const isMasterAdmin = currentUser?.role === 'masterAdmin';

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return employees;
    const q = searchTerm.toLowerCase();
    return employees.filter((e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q));
  }, [employees, searchTerm]);

  const openAdd = () => { setForm({ name: '', email: '', phone: '', status: 'Active' }); setErrors({}); setShowAddModal(true); };
  const openEdit = (emp) => { setForm({ name: emp.name, email: emp.email, phone: emp.phone, status: emp.status }); setErrors({}); setEditEmployee(emp); };
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
      status,
      joined: new Date().toISOString().slice(0, 10),
    });
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Added Employee', target: form.name.trim(), details: `Email: ${form.email.trim()}, Role: admin` });
    setShowAddModal(false);
  };

  // TODO: Replace with real backend API call once backend is added — this is a frontend-only simulation.
  const handleEdit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const status = form.status;
    updateEmployee(editEmployee, { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), status });
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Edited Employee', target: editEmployee.name, details: `Status: ${editEmployee.status} → ${status}` });
    setEditEmployee(null);
  };

  // TODO: Replace with real backend API call once backend is added — this is a frontend-only simulation.
  const handleDelete = () => {
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Deleted Employee', target: deleteEmployee.name, details: `Email: ${deleteEmployee.email}` });
    removeEmployee(deleteEmployee); setDeleteEmployee(null);
  };

  const btnPrimary = "bg-brand text-white border-none rounded-xl px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_8px_25px_rgba(5,150,105,0.3)]";

  if (!isMasterAdmin) {
    return (
      <>
        <style>{`
@keyframes statusPulse { 0% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.5; } }
.add-input-field { font-size: 0.875rem; padding: 0.625rem 0.875rem; border-radius: 0.75rem; width: 100%; background: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.6); outline: none; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); cursor: text; box-sizing: border-box; color: #1C1C1E; }
.add-input-field::placeholder { color: #98989D; }
.add-input-field:hover { border-color: #9CA3AF; }
.add-input-field:focus { background: #FFFFFF; border-color: #10B981; box-shadow: 0 0 0 4px rgba(16,185,129,0.15); outline: none; }
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
.add-modal-input:focus { border-color: #10B981; box-shadow: 0 0 0 4px rgba(16,185,129,0.15); outline: none; }
.add-modal-input::placeholder { color: #4B5563; }
.add-modal-label { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; display: block; }
.add-close-btn { cursor: pointer; transition: color 0.15s ease, transform 0.15s ease; background: none; border: none; font-size: 1.25rem; line-height: 1; padding: 0; color: #9CA3AF; }
.add-close-btn:hover { color: #EF4444; transform: scale(1.1); }
.add-input-field { font-size: 0.875rem; padding: 0.625rem 0.875rem; border-radius: 0.75rem; width: 100%; background: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.6); outline: none; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); cursor: text; box-sizing: border-box; color: #1C1C1E; }
.add-input-field::placeholder { color: #98989D; }
.add-input-field:hover { border-color: #9CA3AF; }
.add-input-field:focus { background: #FFFFFF; border-color: #10B981; box-shadow: 0 0 0 4px rgba(16,185,129,0.15); outline: none; }
.add-input-open { background: #FFFFFF !important; border-color: #10B981 !important; box-shadow: 0 0 0 4px rgba(16,185,129,0.15) !important; }
.add-cancel-btn { cursor: pointer; transition: all 0.15s ease; font-size: 0.8125rem; padding: 0.375rem 0.875rem; border: 1px solid rgba(0,0,0,0.05); border-radius: 0.75rem; background: #FFFFFF; color: #6B7280; font-weight: 500; }
.add-cancel-btn:hover { background: #F3F4F6; border-color: #9CA3AF; color: #111827; }
.add-cancel-btn:active { transform: scale(0.97); }
.add-submit-btn { cursor: pointer; transition: all 0.2s ease; background: #10B981; color: #FFFFFF; font-weight: 600; border: none; border-radius: 0.75rem; padding: 0.5rem 1rem; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem; }
.add-submit-btn:hover { background: #059669; box-shadow: 0 4px 14px rgba(16,185,129,0.3); transform: translateY(-1px); }
.add-submit-btn:active { transform: translateY(1px) scale(0.96); opacity: 0.95; }
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
          <div className="text-sm font-semibold text-[#1C1C1E] mb-3">All Employees ({employees.length})</div>
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search employees by name or email..." aria-label="Search employees" className={glassInput} />
        </div>
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-text-secondary text-sm">No employees found matching your search.</div>
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
                <tr key={i} className="group">
                  <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    <span style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', transition: 'color 0.15s ease, text-decoration 0.15s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#10B981'; e.currentTarget.style.textDecoration = 'underline'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.textDecoration = ''; }}
                      onClick={() => { if (isMasterAdmin) setViewActivity(emp); }}
                    >{emp.name}</span>
                  </td>
                  <td className="px-4 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{emp.email}</td>
                  <td className="px-4 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{emp.phone}</td>
                  <td className="px-4 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{emp.role}</td>
                  <td className="px-4 py-4 border-b text-center" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    <span className="inline-flex items-center justify-center" style={{ gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: emp.status === 'Active' ? '#10B981' : '#EF4444', animation: emp.status === 'Active' ? 'statusPulse 2s ease-in-out infinite' : 'none' }} />
                      <span style={{ color: emp.status === 'Active' ? '#10B981' : '#EF4444', fontWeight: 500, fontSize: '12px', letterSpacing: '0.01em' }}>{emp.status}</span>
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
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
                  <User size={15} color="#10B981" />
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
                    <div className={glassInput} style={{ cursor: 'default', opacity: 0.65, display: 'flex', alignItems: 'center', userSelect: 'none' }}>admin</div>
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
                  style={{ background: '#10B981', color: '#FFFFFF', fontWeight: 600, borderRadius: '12px', padding: '9px 20px', cursor: 'pointer', transition: 'all 0.2s ease', border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setEditEmployee(null)}>
          <div className="glass-card rounded-[20px] p-6 w-[450px] shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setEditEmployee(null)} className="add-close-btn absolute top-4 right-4"><i className="ph ph-x" /></button>
            <div className="text-lg font-bold text-[#1C1C1E] mb-1">Edit Employee Details</div>
            <div className="text-xs text-text-secondary mb-5">Update information for {editEmployee.name}.</div>
            <form onSubmit={handleEdit}>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={labelClass}>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter full name" className={inputClass} />
                {errors.name && <span className="text-[10px] text-danger-text">{errors.name}</span>}
              </div>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={labelClass}>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter email address" className={inputClass} />
                {errors.email && <span className="text-[10px] text-danger-text">{errors.email}</span>}
              </div>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={labelClass}>Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1-555-xxxx" className={inputClass} />
                {errors.phone && <span className="text-[10px] text-danger-text">{errors.phone}</span>}
              </div>
              {/* Role is read-only */}
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={labelClass}>Role</label>
                <div className="add-input-field flex items-center text-sm text-[#1C1C1E] select-none" style={{ cursor: 'default', opacity: 0.7 }}>
                  {editEmployee.role || 'admin'}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 mb-6">
                <label className={labelClass}>Status</label>
                <StatusDropdown value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={statusOptions} />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditEmployee(null)} className={cancelBtnClass}>Cancel</button>
                <button type="submit" className={submitBtnClass}><Check size={16} color="#FFFFFF" /> Save Changes</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Activity History Modal (Master Admin only) */}
      {viewActivity && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setViewActivity(null)}>
          <div className="rounded-[20px] p-6 w-[520px] max-h-[80vh] shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] relative overflow-y-auto" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}>
            <button onClick={() => setViewActivity(null)} className="absolute top-4 right-4 bg-none border-none text-text-placeholder text-lg transition-all duration-150"
              style={{ cursor: 'pointer', transition: 'color 0.15s ease, transform 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
            ><i className="ph ph-x" /></button>
            <div className="text-lg font-bold text-[#1C1C1E] mb-1">Activity Log — {viewActivity.name}</div>
            <div className="text-xs text-text-secondary mb-5">All actions performed by this employee.</div>
            <ActivityLog employeeName={viewActivity.name} />
          </div>
        </div>,
        document.body
      )}

      {/* Delete Employee Modal */}
      {deleteEmployee && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setDeleteEmployee(null)}>
          <div className="rounded-[20px] p-6 w-[400px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-white/50" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}>
            <div className="text-lg font-bold text-[#1C1C1E] mb-2">Delete Employee?</div>
            <div className="text-sm text-text-secondary mb-6">
              Are you sure you want to delete <strong className="text-[#1C1C1E] font-medium">{deleteEmployee.name}</strong>? This action cannot be undone.
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteEmployee(null)} className={cancelBtnClass}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.borderColor = '#9CA3AF'; e.currentTarget.style.color = 'var(--text-primary)'; }}
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
        </div>,
        document.body
      )}
    </>
  );
}
