import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUsers } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../utils/activityLogger';
import UserProfileModal from '../components/UserProfileModal';

const glassInput = "text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-gray-300 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder text-primary cursor-text hover:border-gray-400";
const modalInput = "text-sm px-3.5 py-2.5 rounded-[12px] bg-white/50 border border-gray-300 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder text-primary cursor-text hover:border-gray-400";

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
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-gray-300 w-full flex items-center justify-between cursor-pointer hover:border-gray-400"
        style={{ outline: 'none', boxShadow: open ? '0 0 0 2px rgba(52,199,89,0.3)' : 'none', transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)' }}
      >
        <span className={value ? 'text-primary' : 'text-text-placeholder'}>{value}</span>
        <i className={`ph ph-caret-down text-text-placeholder text-sm transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-1 overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            border: '1px solid rgba(255,255,255,0.6)',
            borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
          {options.map((opt) => (
            <div key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                padding: '12px 16px', fontSize: '14px',
                color: opt === value ? '#10B981' : '#1d1d1f',
                background: opt === value ? 'rgba(16,185,129,0.12)' : 'transparent',
                cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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

export default function Users() {
  const { users, addUser, removeUser, updateUser } = useUsers();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => { const v = sessionStorage.getItem('globalSearchPrefill'); if (v) { setSearchTerm(v); sessionStorage.removeItem('globalSearchPrefill'); } }, []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', status: 'Active' });
  const [errors, setErrors] = useState({});

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const q = searchTerm.toLowerCase();
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, searchTerm]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') { setShowAddModal(false); setEditUser(null); setViewUser(null); } };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const openAdd = () => { setForm({ name: '', email: '', phone: '', status: 'Active' }); setErrors({}); setShowAddModal(true); };
  const openView = (user) => setViewUser(user);
  const openEdit = (user) => { setForm({ name: user.name, email: user.email, phone: user.phone, status: user.status }); setErrors({}); setEditUser(user); };
  const openDelete = (user) => setDeleteUser(user);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const status = form.status;
    const cls = status === 'Active' ? 'bg-brand-light text-brand-dark' : 'bg-danger-bg text-danger-text';
    addUser({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), farms: 0, status, cls, joined: new Date().toISOString().slice(0, 10) });
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Added User', target: form.name.trim(), details: `Email: ${form.email.trim()}, Status: ${status}` });
    setShowAddModal(false);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const status = form.status;
    const cls = status === 'Active' ? 'bg-brand-light text-brand-dark' : 'bg-danger-bg text-danger-text';
    const prevName = editUser.name;
    updateUser(editUser, { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), status, cls });
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Edited User', target: form.name.trim(), details: `Name: ${prevName} → ${form.name.trim()}, Status: ${status}` });
    setEditUser(null);
  };

  const handleDelete = () => {
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Deleted User', target: deleteUser.name, details: `Email: ${deleteUser.email}` });
    removeUser(deleteUser); setDeleteUser(null);
  };

  const labelClass = "text-xs font-medium text-primary tracking-wide";
  const btnPrimary = "bg-brand text-white border-none rounded-xl px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_8px_25px_rgba(5,150,105,0.3)]";
  const btnGhost = "text-xs px-3.5 py-1.5 border border-white/60 rounded-xl cursor-pointer bg-white/50 text-text-secondary font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] hover:bg-white/80";

  const statusOptions = ['Active', 'Inactive'];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-bold text-primary">User Management</div>
          <div className="text-sm text-text-secondary mt-1">Manage system users and permissions</div>
        </div>
        <button onClick={openAdd} className={btnPrimary}>
          <i className="ph ph-plus" /> Add User
        </button>
      </div>

      <div className="rounded-[20px] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', contentVisibility: 'auto', willChange: 'transform' }}>
        <div className="flex flex-col items-stretch mb-5">
          <div className="text-sm font-semibold text-primary mb-3">All Users ({users.length})</div>
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search users by name or email…" aria-label="Search users" className={glassInput} />
        </div>
        {filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-text-secondary text-sm">No users found matching your search.</div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Name</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Email</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Phone</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Farms</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Status</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Joined</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, i) => (
                <tr key={i}>
                  <td className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                    <span onClick={() => setProfileUser(u)}
                      style={{ cursor: 'pointer', fontWeight: 600, color: '#111827', textDecoration: 'none', transition: 'color 0.15s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#10B981'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#111827'; }}
                    >{u.name}</span>
                  </td>
                  <td className="px-5 py-5 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>{u.email}</td>
                  <td className="px-5 py-5 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>{u.phone}</td>
                  <td className="px-5 py-5 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>{u.farms}</td>
                  <td className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.status === 'Active' ? '#10B981' : '#EF4444', display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: u.status === 'Active' ? '#059669' : '#DC2626' }}>{u.status}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>{u.joined}</td>
                  <td className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                    <div className="flex gap-3 items-center">
                      <button title="View" onClick={() => setProfileUser(u)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-lg transition-all duration-200 hover:scale-110">
                        <i className="ph ph-eye" />
                      </button>
                      <button title="Edit" onClick={() => openEdit(u)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-lg transition-all duration-200 hover:scale-110">
                        <i className="ph ph-pencil" />
                      </button>
                      <button title="Delete" onClick={() => openDelete(u)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-danger-text text-lg transition-all duration-200 hover:scale-110">
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

      {/* Add New User Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={() => setShowAddModal(false)}>
          <div className="w-[560px] max-w-[calc(100vw-32px)] rounded-[24px] p-7 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60" onClick={(e) => e.stopPropagation()}
            style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="ph ph-user-plus text-white text-lg" />
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>Add New User</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>Enter details to register a new user.</div>
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
                  <i className="ph ph-user text-[15px]" style={{ color: '#10B981' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>User Information</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 32px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <i className="ph ph-user text-xs" style={{ color: '#9CA3AF' }} /> Name
                    </div>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter full name"
                      className={glassInput}
                    />
                    {errors.name && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <i className="ph ph-envelope text-xs" style={{ color: '#9CA3AF' }} /> Email
                    </div>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter email address"
                      className={glassInput}
                    />
                    {errors.email && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <i className="ph ph-phone text-xs" style={{ color: '#9CA3AF' }} /> Phone
                    </div>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1-555-xxxx"
                      className={glassInput}
                    />
                    {errors.phone && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <i className="ph ph-circle text-xs" style={{ color: '#9CA3AF' }} /> Status
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
                  <i className="ph ph-check" /> Save User
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* View User Modal */}
      {viewUser && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} onClick={() => setViewUser(null)}>
          <div className="w-[440px] max-w-[calc(100vw-32px)] rounded-[24px] p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-modal)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-lg font-bold text-primary">User Details</div>
                <div className="text-xs text-text-secondary mt-0.5">Viewing information for {viewUser.name}.</div>
              </div>
              <button type="button" onClick={() => setViewUser(null)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                <i className="ph ph-x" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Name', value: viewUser.name },
                { label: 'Email', value: viewUser.email },
                { label: 'Phone', value: viewUser.phone },
                { label: 'Number of Farms', value: viewUser.farms },
                { label: 'Status', value: viewUser.status },
                { label: 'Date Created', value: viewUser.joined },
              ].map((field) => (
                <div key={field.label} className="flex flex-col gap-1">
                  <span className={labelClass}>{field.label}</span>
                  <div className="text-sm px-3.5 py-2.5 rounded-[12px] bg-white/50 border border-white/60 text-primary w-full">{field.value}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setViewUser(null)} className={btnGhost}>Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit User Modal */}
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
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter full name"
                      className={glassInput}
                    />
                    {errors.name && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <i className="ph ph-envelope text-xs" style={{ color: '#9CA3AF' }} /> Email
                    </div>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter email address"
                      className={glassInput}
                    />
                    {errors.email && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <i className="ph ph-phone text-xs" style={{ color: '#9CA3AF' }} /> Phone
                    </div>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1-555-xxxx"
                      className={glassInput}
                    />
                    {errors.phone && <span className="text-[10px]" style={{ color: '#DC2626', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <i className="ph ph-circle text-xs" style={{ color: '#9CA3AF' }} /> Status
                    </div>
                    <StatusDropdown value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={statusOptions} />
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

      {/* Delete User Modal */}
      {deleteUser && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setDeleteUser(null)}>
          <div className="rounded-[20px] p-6 w-[400px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-white/50" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-modal)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}>
            <div className="text-lg font-bold text-primary mb-2">Delete User?</div>
            <div className="text-sm text-text-secondary mb-6">
              Are you sure you want to delete <strong className="text-primary font-medium">{deleteUser.name}</strong>? This action cannot be undone.
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteUser(null)}
                className="text-xs px-3.5 py-1.5 border border-[rgba(0,0,0,0.05)] rounded-xl bg-white text-text-secondary font-medium hover:bg-[#E5E5EA] hover:border-[rgba(0,0,0,0.15)] cursor-pointer transition-all duration-150 active:scale-[0.97] hover:scale-[1.04] focus-visible:scale-[1.04] focus:outline-none cancel-btn"
              >Cancel</button>
              <button onClick={handleDelete} className="bg-danger-bg text-danger-text border-none rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2 cursor-pointer transition-all duration-150 active:scale-[0.97] hover:scale-[1.04] focus-visible:scale-[1.04] focus:outline-none delete-btn">
                <i className="ph ph-trash" /> Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {profileUser && <UserProfileModal user={profileUser} onClose={() => setProfileUser(null)} onEdit={(user) => { setProfileUser(null); openEdit(user); }} />}
      <style>{`
        .cancel-btn:hover, .cancel-btn:focus-visible {
          animation: pulseGlowGray 1.5s ease-in-out infinite;
        }
        .delete-btn:hover, .delete-btn:focus-visible {
          animation: pulseGlowRed 1.5s ease-in-out infinite;
        }
        @keyframes pulseGlowGray {
          0%, 100% { box-shadow: 0 0 4px rgba(0,0,0,0.06); }
          50% { box-shadow: 0 0 12px rgba(0,0,0,0.12); }
        }
        @keyframes pulseGlowRed {
          0%, 100% { box-shadow: 0 0 4px rgba(220,38,38,0.12); }
          50% { box-shadow: 0 0 14px rgba(220,38,38,0.25); }
        }
      `}</style>
    </>
  );
}
