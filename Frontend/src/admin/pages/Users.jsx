import { Check } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useUsers } from '../../context/UserContext';

const glassInput = "text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/60 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder text-[#1C1C1E] select-none";
const modalInput = "modal-input-field";
const addModalInput = "add-modal-input";
const inputClass = "add-input-field";
const cancelBtnClass = "add-cancel-btn";
const submitBtnClass = "add-submit-btn";
const closeBtnClass = "add-close-btn";

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

export default function Users() {
  const { users, addUser, removeUser, updateUser } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', status: 'Active' });
  const [errors, setErrors] = useState({});

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const q = searchTerm.toLowerCase();
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, searchTerm]);

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
    setShowAddModal(false);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const status = form.status;
    const cls = status === 'Active' ? 'bg-brand-light text-brand-dark' : 'bg-danger-bg text-danger-text';
    updateUser(editUser, { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), status, cls });
    setEditUser(null);
  };

  const handleDelete = () => { removeUser(deleteUser); setDeleteUser(null); };

  const labelClass = "text-xs font-medium text-[#1C1C1E] tracking-wide";
  const btnPrimary = "bg-brand text-white border-none rounded-xl px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_8px_25px_rgba(5,150,105,0.3)]";
  const btnGhost = "text-xs px-3.5 py-1.5 border border-white/60 rounded-xl cursor-pointer bg-white/50 text-text-secondary font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] hover:bg-white/80";

  const statusOptions = ['Active', 'Inactive'];

  return (
    <>
      <style>{`
@keyframes statusPulse { 0% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.5; } }
.modal-input-field { background: #F3F4F6; border: 1px solid transparent; transition: all 0.2s ease; cursor: text; text-sm px-3.5 py-2.5 rounded-[12px] w-full placeholder:text-text-placeholder text-[#1C1C1E]; }
.modal-input-field:hover { background: #E5E7EB; border-color: #D1D5DB; }
.modal-input-field:focus { background: #FFFFFF; border-color: #10B981; box-shadow: 0 0 0 3px rgba(16,185,129,0.15); outline: none; }
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
          <div className="text-2xl font-bold text-[#000000]">User Management</div>
          <div className="text-sm text-text-secondary mt-1">Manage system users and permissions</div>
        </div>
        <button onClick={openAdd} className={btnPrimary}>
          <i className="ph ph-plus" /> Add User
        </button>
      </div>

      <div className="rounded-[20px] p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', contentVisibility: 'auto', willChange: 'transform' }}>
        <div className="flex flex-col items-stretch mb-4">
          <div className="text-sm font-semibold text-[#1C1C1E] mb-3">All Users ({users.length})</div>
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search users by name or email..." aria-label="Search users" className={glassInput} />
        </div>
        {filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-text-secondary text-sm">No users found matching your search.</div>
        ) : (
          <table className="w-full border-collapse text-sm" style={{ userSelect: 'none' }}>
            <thead>
              <tr>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Name</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Email</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Phone</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Farms</th>
                <th className="text-center px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Status</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Joined</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, i) => (
                <tr key={i} className="group">
                  <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}><strong className="text-[#1C1C1E] font-medium">{u.name}</strong></td>
                  <td className="px-4 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{u.email}</td>
                  <td className="px-4 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{u.phone}</td>
                  <td className="px-4 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{u.farms}</td>
                  <td className="px-4 py-4 border-b text-center" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    <span className="inline-flex items-center justify-center" style={{ gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.status === 'Active' ? '#10B981' : '#EF4444', animation: u.status === 'Active' ? 'statusPulse 2s ease-in-out infinite' : 'none' }} />
                      <span style={{ color: u.status === 'Active' ? '#10B981' : '#EF4444', fontWeight: 500, fontSize: '12px', letterSpacing: '0.01em' }}>{u.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{u.joined}</td>
                  <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    <div className="flex gap-3 items-center">
                      <button title="View" onClick={() => openView(u)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-lg transition-all duration-200 hover:scale-110">
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
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="glass-card rounded-[20px] p-6 w-[450px] shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowAddModal(false)} className="add-close-btn absolute top-4 right-4"><i className="ph ph-x" /></button>
            <div className="text-lg font-bold text-[#1C1C1E] mb-1">Add New User</div>
            <div className="text-xs text-text-secondary mb-5">Enter details to register a new user.</div>
            <form onSubmit={handleAdd}>
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
              <div className="flex flex-col gap-1.5 mb-6">
                <label className={labelClass}>Status</label>
                <StatusDropdown value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={statusOptions} />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className={cancelBtnClass}>Cancel</button>
                <button type="submit" className={submitBtnClass}><Check size={16} color="#FFFFFF" /> Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', transition: 'all 0.3s ease' }} onClick={() => setViewUser(null)}>
          <div className="w-[440px] max-w-[calc(100vw-32px)] rounded-[24px] p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60" onClick={(e) => e.stopPropagation()} style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-lg font-bold text-[#1C1C1E]">User Details</div>
                <div className="text-xs text-text-secondary mt-0.5">Viewing information for {viewUser.name}.</div>
              </div>
              <button type="button" onClick={() => setViewUser(null)} className="modal-close-btn">
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
                  <div className="text-sm px-3.5 py-2.5 rounded-[12px] bg-white/50 border border-white/60 text-[#1C1C1E] w-full">{field.value}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setViewUser(null)} className={btnGhost}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setEditUser(false)}>
          <div className="glass-card rounded-[20px] p-6 w-[450px] shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setEditUser(null)} className="add-close-btn absolute top-4 right-4"><i className="ph ph-x" /></button>
            <div className="text-lg font-bold text-[#1C1C1E] mb-1">Edit User Details</div>
            <div className="text-xs text-text-secondary mb-5">Update information for {editUser.name}.</div>
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
              <div className="flex flex-col gap-1.5 mb-6">
                <label className={labelClass}>Status</label>
                <StatusDropdown value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={statusOptions} />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditUser(null)} className={cancelBtnClass}>Cancel</button>
                <button type="submit" className={submitBtnClass}><Check size={16} color="#FFFFFF" /> Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', transition: 'all 0.3s ease' }} onClick={() => setDeleteUser(null)}>
          <div className="w-[400px] max-w-[calc(100vw-32px)] rounded-[24px] p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60" onClick={(e) => e.stopPropagation()} style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold text-[#1C1C1E]">Delete User?</div>
              <button type="button" onClick={() => setDeleteUser(null)} className="modal-close-btn">
                <i className="ph ph-x" />
              </button>
            </div>
            <div className="text-sm text-text-secondary mb-6">
              Are you sure you want to delete <strong className="text-[#1C1C1E] font-medium">{deleteUser.name}</strong>? This action cannot be undone.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteUser(null)} className="modal-btn-cancel">Cancel</button>
              <button onClick={handleDelete} className="modal-btn-primary" style={{ background: '#FEE2E2', color: '#DC2626' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FECACA'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(220,38,38,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(0px) scale(0.97)'; e.currentTarget.style.opacity = '0.95'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '1'; }}
              >
                <i className="ph ph-trash" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
