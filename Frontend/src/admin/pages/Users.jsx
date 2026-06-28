import { useState, useMemo } from 'react';
import { useUsers } from '../../context/UserContext';

const glassInput = "text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/60 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder text-primary select-none";
const modalInput = "text-sm px-3.5 py-2.5 rounded-[12px] bg-white/50 border border-white/60 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder text-primary select-none";

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

      <div className="rounded-[20px] p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', contentVisibility: 'auto', willChange: 'transform' }}>
        <div className="flex flex-col items-stretch mb-4">
          <div className="text-sm font-semibold text-primary mb-3">All Users ({users.length})</div>
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search users by name or email…" aria-label="Search users" className={glassInput} />
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
                <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Status</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Joined</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, i) => (
                <tr key={i}>
                  <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}><strong className="text-primary font-medium">{u.name}</strong></td>
                  <td className="px-4 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{u.email}</td>
                  <td className="px-4 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{u.phone}</td>
                  <td className="px-4 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{u.farms}</td>
                  <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    <span className={`pill inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${u.cls}`}>{u.status}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} onClick={() => setShowAddModal(false)}>
          <div
            className="w-[440px] max-w-[calc(100vw-32px)] rounded-[24px] p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60"
            style={{ background: 'var(--bg-modal)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-lg font-bold text-primary">Add New User</div>
                <div className="text-xs text-text-secondary mt-0.5">Enter details to register a new user.</div>
              </div>
              <button type="button" onClick={() => setShowAddModal(false)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                <i className="ph ph-x" />
              </button>
            </div>

            <form onSubmit={handleAdd}>
              <div className="space-y-4 mb-6">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter full name" className={modalInput} />
                  {errors.name && <span className="text-[10px] text-danger-text">{errors.name}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter email address" className={modalInput} />
                  {errors.email && <span className="text-[10px] text-danger-text">{errors.email}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1-555-xxxx" className={modalInput} />
                  {errors.phone && <span className="text-[10px] text-danger-text">{errors.phone}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="text-sm px-3.5 py-2.5 rounded-[12px] bg-white/50 border border-white/60 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full text-primary appearance-none cursor-pointer select-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 fill=%27%23757575%27 viewBox=%270 0 256 256%27%3E%3Cpath d=%27M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80a8,8,0,0,1,11.32-11.32L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z%27%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '14px' }}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 text-sm px-4 py-2.5 border border-white/60 rounded-xl cursor-pointer bg-white/50 text-text-secondary font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] hover:bg-white/80">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-brand text-white border-none rounded-xl px-4 py-2.5 text-sm font-medium cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_8px_25px_rgba(5,150,105,0.3)]">
                  <i className="ph ph-check" /> Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {viewUser && (
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
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}>
          <div className="w-[440px] max-w-[calc(100vw-32px)] rounded-[24px] p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60" style={{ background: 'var(--bg-modal)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-lg font-bold text-primary">Edit User Details</div>
                <div className="text-xs text-text-secondary mt-0.5">Update information for {editUser.name}.</div>
              </div>
              <button type="button" onClick={() => setEditUser(null)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                <i className="ph ph-x" />
              </button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="space-y-4 mb-6">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter full name" className={modalInput} />
                  {errors.name && <span className="text-[10px] text-danger-text">{errors.name}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter email address" className={modalInput} />
                  {errors.email && <span className="text-[10px] text-danger-text">{errors.email}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1-555-xxxx" className={modalInput} />
                  {errors.phone && <span className="text-[10px] text-danger-text">{errors.phone}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="text-sm px-3.5 py-2.5 rounded-[12px] bg-white/50 border border-white/60 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full text-primary appearance-none cursor-pointer select-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 fill=%27%23757575%27 viewBox=%270 0 256 256%27%3E%3Cpath d=%27M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80a8,8,0,0,1,11.32-11.32L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z%27%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '14px' }}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditUser(null)} className="flex-1 text-sm px-4 py-2.5 border border-white/60 rounded-xl cursor-pointer bg-white/50 text-text-secondary font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] hover:bg-white/80">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-brand text-white border-none rounded-xl px-4 py-2.5 text-sm font-medium cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_8px_25px_rgba(5,150,105,0.3)]">
                  <i className="ph ph-check" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} onClick={() => setDeleteUser(null)}>
          <div className="w-[400px] max-w-[calc(100vw-32px)] rounded-[24px] p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-modal)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold text-primary">Delete User?</div>
              <button type="button" onClick={() => setDeleteUser(null)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                <i className="ph ph-x" />
              </button>
            </div>
            <div className="text-sm text-text-secondary mb-6">
              Are you sure you want to delete <strong className="text-primary font-medium">{deleteUser.name}</strong>? This action cannot be undone.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteUser(null)} className="flex-1 text-sm px-4 py-2.5 border border-white/60 rounded-xl cursor-pointer bg-white/50 text-text-secondary font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] hover:bg-white/80">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 bg-danger-bg text-danger-text border-none rounded-xl px-4 py-2.5 text-sm font-medium cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_8px_25px_rgba(220,38,38,0.3)]">
                <i className="ph ph-trash" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
