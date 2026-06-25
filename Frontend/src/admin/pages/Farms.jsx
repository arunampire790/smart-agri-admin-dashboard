import { useState, useMemo } from 'react';
import { useFarms } from '../../context/FarmContext';

export default function Farms() {
  const { farms } = useFarms();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFarms = useMemo(() => {
    if (!searchTerm.trim()) return farms;
    const q = searchTerm.toLowerCase();
    return farms.filter((f) =>
      f.name.toLowerCase().includes(q) ||
      f.location.toLowerCase().includes(q) ||
      f.owner.toLowerCase().includes(q)
    );
  }, [farms, searchTerm]);

  return (
    <>
      <div className="mb-4">
        <div className="text-xl font-medium text-[#1C1C1E]">Farm management</div>
        <div className="text-sm text-[#757575] mt-0.5">View and manage agricultural properties</div>
      </div>

      <div className="flex items-center gap-2 bg-[#e8f5e9] border-l-[3px] border-[#2e7d32] rounded-r-md px-3 py-2.5 mb-3 text-xs text-[#1b5e20]">
        <i className="ph ph-info" />
        Farms are created through the farmer onboarding system — admins can view, edit, and manage existing farms here.
      </div>

      <div className="bg-white border border-[#e0e0e0] rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium">All farms ({farms.length})</div>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search farms…"
            aria-label="Search farms"
            className="text-xs px-2.5 py-1.5 border border-[#e0e0e0] rounded-md bg-[#f5f5f5] outline-none focus:border-[#2e7d32] w-[220px]"
          />
        </div>

        {filteredFarms.length === 0 ? (
          <div className="py-8 text-center text-[#757575] text-sm">No farms found.</div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Farm name</th>
                <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Owner</th>
                <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Crop</th>
                <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Soil</th>
                <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Location</th>
                <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Robot</th>
                <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Status</th>
                <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFarms.map((f, i) => (
                <tr key={i}>
                  <td className="px-2 py-2 border-b border-[#e0e0e0]"><strong className="font-medium">{f.name}</strong></td>
                  <td className="px-2 py-2 border-b border-[#e0e0e0] text-[#757575]">{f.owner}</td>
                  <td className="px-2 py-2 border-b border-[#e0e0e0] text-[#757575]">{f.crop}</td>
                  <td className="px-2 py-2 border-b border-[#e0e0e0] text-[#757575]">{f.soil}</td>
                  <td className="px-2 py-2 border-b border-[#e0e0e0] text-[#757575]">{f.location}</td>
                  <td className="px-2 py-2 border-b border-[#e0e0e0] text-[#757575]">{f.robot}</td>
                  <td className="px-2 py-2 border-b border-[#e0e0e0]"><span className={`pill ${f.cls}`}>{f.status}</span></td>
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
