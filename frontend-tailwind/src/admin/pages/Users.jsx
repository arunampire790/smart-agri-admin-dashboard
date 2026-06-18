const users = [
  { name: 'John Smith', email: 'john.smith@example.com', phone: '+1-555-0101', farms: 3, status: 'Active', cls: 'bg-brand-light text-[#137333]', joined: '2025-12-15' },
  { name: 'Sarah Johnson', email: 'sarah.j@example.com', phone: '+1-555-0102', farms: 2, status: 'Active', cls: 'bg-brand-light text-[#137333]', joined: '2026-01-10' },
  { name: 'Michael Brown', email: 'michael.b@example.com', phone: '+1-555-0103', farms: 5, status: 'Active', cls: 'bg-brand-light text-[#137333]', joined: '2025-11-20' },
  { name: 'Emily Davis', email: 'emily.davis@example.com', phone: '+1-555-0104', farms: 1, status: 'Inactive', cls: 'bg-danger-bg text-danger-text', joined: '2026-02-05' },
  { name: 'David Wilson', email: 'david.w@example.com', phone: '+1-555-0105', farms: 4, status: 'Active', cls: 'bg-brand-light text-[#137333]', joined: '2025-10-12' },
];

export default function Users() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-semibold">User Management</div>
          <div className="text-sm text-text-secondary mt-1">Manage system users and permissions</div>
        </div>
        <button className="bg-brand text-white border-none rounded-lg px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 hover:opacity-90">
          <i className="ti ti-plus" /> Add User
        </button>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col items-stretch mb-4">
          <div className="text-sm font-semibold mb-3">All Users (8)</div>
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
    </>
  );
}
