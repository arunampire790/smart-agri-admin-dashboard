import { useState } from 'react';

const initialUsers = [
  { name: 'John Smith', email: 'john.smith@example.com', phone: '+1-555-0101', farms: 3, status: 'Active', cls: 'bg-brand-light text-[#137333]', joined: '2025-12-15' },
  { name: 'Sarah Johnson', email: 'sarah.j@example.com', phone: '+1-555-0102', farms: 2, status: 'Active', cls: 'bg-brand-light text-[#137333]', joined: '2026-01-10' },
  { name: 'Michael Brown', email: 'michael.b@example.com', phone: '+1-555-0103', farms: 5, status: 'Active', cls: 'bg-brand-light text-[#137333]', joined: '2025-11-20' },
  { name: 'Emily Davis', email: 'emily.davis@example.com', phone: '+1-555-0104', farms: 1, status: 'Inactive', cls: 'bg-danger-bg text-danger-text', joined: '2026-02-05' },
  { name: 'David Wilson', email: 'david.w@example.com', phone: '+1-555-0105', farms: 4, status: 'Active', cls: 'bg-brand-light text-[#137333]', joined: '2025-10-12' },
];

export default function Users() {
  const [users, setUsers] = useState(initialUsers);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});

  const openModal = () => {
    setForm({ name: '', email: '', phone: '' });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const today = new Date().toISOString().slice(0, 10);
    const newUser = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      farms: 0,
      status: 'Active',
      cls: 'bg-brand-light text-[#137333]',
      joined: today,
    };

    setUsers((prev) => [...prev, newUser]);
    closeModal();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-semibold">User Management</div>
          <div className="text-sm text-text-secondary mt-1">Manage system users and permissions</div>
        </div>
        <button onClick={openModal} className="bg-brand text-white border-none rounded-lg px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 hover:opacity-90">
          <i className="ti ti-plus" /> Add User
        </button>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col items-stretch mb-4">
          <div className="text-sm font-semibold mb-3">All Users ({users.length})</div>
          <input placeholder="Search users by name or email…" aria-label="Search users" className="text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)] w-full" />
        </div>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Name</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Email</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Phone</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Farms</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Status</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Joined</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i}>
                <td className="px-4 py-4 border-b border-[#F1F3F4]"><strong className="text-[#111] font-medium">{u.name}</strong></td>
                <td className="px-4 py-4 border-b border-[#F1F3F4] text-text-secondary">{u.email}</td>
                <td className="px-4 py-4 border-b border-[#F1F3F4] text-text-secondary">{u.phone}</td>
                <td className="px-4 py-4 border-b border-[#F1F3F4] text-text-secondary">{u.farms}</td>
                <td className="px-4 py-4 border-b border-[#F1F3F4]"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${u.cls}`}>{u.status}</span></td>
                <td className="px-4 py-4 border-b border-[#F1F3F4] text-text-secondary">{u.joined}</td>
                <td className="px-4 py-4 border-b border-[#F1F3F4]">
                  <div className="flex gap-3 items-center">
                    <button title="View" className="bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-lg"><i className="ti ti-eye" /></button>
                    <button title="Edit" className="bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-lg"><i className="ti ti-edit" /></button>
                    <button title="Delete" className="bg-none border-none cursor-pointer text-text-placeholder hover:text-danger-text text-lg"><i className="ti ti-trash" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-[440px] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="text-lg font-bold text-[#111] mb-1">Add New User</div>
            <div className="text-xs text-text-secondary mb-5">Enter details to register a new user.</div>

            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-xs font-medium text-[#111]">Full Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter full name"
                  className="text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)] w-full"
                />
                {errors.name && <span className="text-[10px] text-danger-text">{errors.name}</span>}
              </div>

              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-xs font-medium text-[#111]">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Enter email address"
                  className="text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)] w-full"
                />
                {errors.email && <span className="text-[10px] text-danger-text">{errors.email}</span>}
              </div>

              <div className="flex flex-col gap-1.5 mb-6">
                <label className="text-xs font-medium text-[#111]">Phone Number</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1-555-xxxx"
                  className="text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)] w-full"
                />
                {errors.phone && <span className="text-[10px] text-danger-text">{errors.phone}</span>}
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="text-xs px-3.5 py-1.5 border border-[#EAEAEA] rounded-lg cursor-pointer bg-white text-text-secondary font-medium hover:bg-[#F1F3F4]">
                  Cancel
                </button>
                <button type="submit" className="bg-brand text-white border-none rounded-lg px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 hover:opacity-90">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
