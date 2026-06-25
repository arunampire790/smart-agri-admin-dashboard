import { useState, useMemo } from 'react';
import { useUsers } from '../../context/UserContext';

export default function Users() {
  const { users } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const q = searchTerm.toLowerCase();
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, searchTerm]);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xl font-medium text-[#1C1C1E]">User management</div>
          <div className="text-sm text-[#757575] mt-0.5">Manage system users and permissions</div>
        </div>
        <button className="bg-[#2e7d32] text-white border-none rounded-md px-3.5 py-1.5 text-sm cursor-pointer flex items-center gap-1.5 hover:bg-[#1b5e20]">
          <i className="ph ph-plus" /> Add user
        </button>
      </div>

      <div className="bg-white border border-[#e0e0e0] rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium">All users ({users.length})</div>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email…"
            aria-label="Search users"
            className="text-xs px-2.5 py-1.5 border border-[#e0e0e0] rounded-md bg-[#f5f5f5] outline-none focus:border-[#2e7d32] w-[220px]"
          />
        </div>

        {filteredUsers.length === 0 ? (
          <div className="py-8 text-center text-[#757575] text-sm">No users found matching your search.</div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Name</th>
                <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Email</th>
                <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Phone</th>
                <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Farms</th>
                <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Status</th>
                <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Joined</th>
                <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, i) => (
                <tr key={i}>
                  <td className="px-2 py-2 border-b border-[#e0e0e0]"><strong className="font-medium">{u.name}</strong></td>
                  <td className="px-2 py-2 border-b border-[#e0e0e0] text-[#757575]">{u.email}</td>
                  <td className="px-2 py-2 border-b border-[#e0e0e0] text-[#757575]">{u.phone}</td>
                  <td className="px-2 py-2 border-b border-[#e0e0e0] text-[#757575]">{u.farms}</td>
                  <td className="px-2 py-2 border-b border-[#e0e0e0]"><span className={`pill ${u.cls}`}>{u.status}</span></td>
                  <td className="px-2 py-2 border-b border-[#e0e0e0] text-[#757575]">{u.joined}</td>
                  <td className="px-2 py-2 border-b border-[#e0e0e0]">
                    <div className="flex gap-2 items-center">
                      <button title="View" className="bg-none border-none cursor-pointer text-[#757575] hover:text-[#1C1C1E] text-base"><i className="ph ph-eye" /></button>
                      <button title="Edit" className="bg-none border-none cursor-pointer text-[#757575] hover:text-[#1C1C1E] text-base"><i className="ph ph-pencil" /></button>
                      <button title="Delete" className="bg-none border-none cursor-pointer text-[#757575] hover:text-[#c62828] text-base"><i className="ph ph-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
