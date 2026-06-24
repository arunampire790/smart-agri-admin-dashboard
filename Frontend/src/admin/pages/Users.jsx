import { useState, useMemo } from 'react';
import { useUsers } from '../../context/UserContext';

export default function Users() {
  const { users, addUser, removeUser, updateUser } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const q = searchTerm.toLowerCase();
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, searchTerm]);

  const openAdd = () => {
    setForm({ name: '', email: '', phone: '' });
    setErrors({});
    setShowAddModal(true);
  };

  const openView = (user) => setViewUser(user);

  const openEdit = (user) => {
    setForm({ name: user.name, email: user.email, phone: user.phone });
    setErrors({});
    setEditUser(user);
  };

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
    const today = new Date().toISOString().slice(0, 10);
    addUser({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), farms: 0, status: 'Active', cls: 'bg-brand-light text-brand-dark', joined: today });
    setShowAddModal(false);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    updateUser(editUser, { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() });
    setEditUser(null);
  };

  const handleDelete = () => {
    removeUser(deleteUser);
    setDeleteUser(null);
  };

  const inputClass = "text-sm px-3.5 py-2.5 rounded-xl bg-[#7676801F] outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder";
  const labelClass = "text-xs font-medium text-[#1C1C1E]";
  const cancelBtnClass = "text-xs px-3.5 py-1.5 border border-[rgba(0,0,0,0.05)] rounded-xl cursor-pointer bg-white text-text-secondary font-medium hover:bg-[#E5E5EA]";
  const submitBtnClass = "bg-brand text-white border-none rounded-xl px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 hover:opacity-90";
  const modalOverlay = "fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm";
  const modalBox = "bg-white rounded-[20px] p-6 w-[440px] shadow-[0px_4px_24px_rgba(0,0,0,0.04),0px_1px_2px_rgba(0,0,0,0.02)]";

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-bold text-[#000000]">User Management</div>
          <div className="text-sm text-text-secondary mt-1">Manage system users and permissions</div>
        </div>
        <button onClick={openAdd} className={submitBtnClass}>
          <i className="ph ph-plus" /> Add User
        </button>
      </div>

      <div className="bg-white rounded-[20px] p-5 shadow-[0px_4px_24px_rgba(0,0,0,0.04),0px_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col items-stretch mb-4">
          <div className="text-sm font-semibold text-[#1C1C1E] mb-3">All Users ({users.length})</div>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name or email…"
            aria-label="Search users"
            className={inputClass}
          />
        </div>

        {filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-text-secondary text-sm">No users found matching your search.</div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-table-sep">Name</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-table-sep">Email</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-table-sep">Phone</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-table-sep">Farms</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-table-sep">Status</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-table-sep">Joined</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-table-sep">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, i) => (
                <tr key={i}>
                  <td className="px-4 py-4 border-b border-table-sep"><strong className="text-[#1C1C1E] font-medium">{u.name}</strong></td>
                  <td className="px-4 py-4 border-b border-table-sep text-text-secondary">{u.email}</td>
                  <td className="px-4 py-4 border-b border-table-sep text-text-secondary">{u.phone}</td>
                  <td className="px-4 py-4 border-b border-table-sep text-text-secondary">{u.farms}</td>
                  <td className="px-4 py-4 border-b border-table-sep">
                    <span className={`pill inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${u.cls}`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-4 border-b border-table-sep text-text-secondary">{u.joined}</td>
                  <td className="px-4 py-4 border-b border-table-sep">
                    <div className="flex gap-3 items-center">
                      <button title="View" onClick={() => openView(u)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-lg">
                        <i className="ph ph-eye" />
                      </button>
                      <button title="Edit" onClick={() => openEdit(u)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-lg">
                        <i className="ph ph-pencil" />
                      </button>
                      <button title="Delete" onClick={() => openDelete(u)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-danger-text text-lg">
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className={modalOverlay}>
          <div className={modalBox}>
            <div className="text-lg font-bold text-[#1C1C1E] mb-1">Add New User</div>
            <div className="text-xs text-text-secondary mb-5">Enter details to register a new user.</div>
            <form onSubmit={handleAdd}>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={labelClass}>Full Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter full name" className={inputClass} />
                {errors.name && <span className="text-[10px] text-danger-text">{errors.name}</span>}
              </div>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={labelClass}>Email Address</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter email address" className={inputClass} />
                {errors.email && <span className="text-[10px] text-danger-text">{errors.email}</span>}
              </div>
              <div className="flex flex-col gap-1.5 mb-6">
                <label className={labelClass}>Phone Number</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1-555-xxxx" className={inputClass} />
                {errors.phone && <span className="text-[10px] text-danger-text">{errors.phone}</span>}
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className={cancelBtnClass}>Cancel</button>
                <button type="submit" className={submitBtnClass}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {viewUser && (
        <div className={modalOverlay} onClick={() => setViewUser(null)}>
          <div className={modalBox} onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-[#1C1C1E] mb-1">User Details</div>
            <div className="text-xs text-text-secondary mb-5">Viewing information for {viewUser.name}.</div>
            <div className="space-y-4">
              {[
                { label: 'Full Name', value: viewUser.name },
                { label: 'Email Address', value: viewUser.email },
                { label: 'Phone Number', value: viewUser.phone },
                { label: 'Number of Farms', value: viewUser.farms },
                { label: 'Status', value: viewUser.status },
                { label: 'Date Created', value: viewUser.joined },
              ].map((field) => (
                <div key={field.label} className="flex flex-col gap-1">
                  <span className={labelClass}>{field.label}</span>
                  <div className="text-sm px-3.5 py-2.5 rounded-xl bg-[#7676801F] text-[#1C1C1E] w-full">{field.value}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setViewUser(null)} className={cancelBtnClass}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className={modalOverlay}>
          <div className={modalBox}>
            <div className="text-lg font-bold text-[#1C1C1E] mb-1">Edit User Details</div>
            <div className="text-xs text-text-secondary mb-5">Update information for {editUser.name}.</div>
            <form onSubmit={handleEdit}>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={labelClass}>Full Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter full name" className={inputClass} />
                {errors.name && <span className="text-[10px] text-danger-text">{errors.name}</span>}
              </div>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={labelClass}>Email Address</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter email address" className={inputClass} />
                {errors.email && <span className="text-[10px] text-danger-text">{errors.email}</span>}
              </div>
              <div className="flex flex-col gap-1.5 mb-6">
                <label className={labelClass}>Phone Number</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1-555-xxxx" className={inputClass} />
                {errors.phone && <span className="text-[10px] text-danger-text">{errors.phone}</span>}
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditUser(null)} className={cancelBtnClass}>Cancel</button>
                <button type="submit" className={submitBtnClass}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteUser && (
        <div className={modalOverlay} onClick={() => setDeleteUser(null)}>
          <div className="bg-white rounded-[20px] p-6 w-[380px] shadow-[0px_4px_24px_rgba(0,0,0,0.04),0px_1px_2px_rgba(0,0,0,0.02)]" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-[#1C1C1E] mb-2">Delete User?</div>
            <div className="text-sm text-text-secondary mb-6">
              Are you sure you want to delete <strong className="text-[#1C1C1E] font-medium">{deleteUser.name}</strong>? This action cannot be undone.
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteUser(null)} className={cancelBtnClass}>Cancel</button>
              <button onClick={handleDelete} className="bg-danger-bg text-danger-text border-none rounded-xl px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 hover:opacity-90">
                <i className="ph ph-trash" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
