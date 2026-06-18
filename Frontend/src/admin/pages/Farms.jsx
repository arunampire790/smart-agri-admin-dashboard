const farms = [
  { name: 'Green Valley Farm', owner: 'John Smith', crop: 'Wheat', soil: 'Clay', location: 'California, USA', robot: 'AgriBot-001', status: 'Active', cls: 'bg-brand-light text-[#137333]' },
  { name: 'Sunrise Orchards', owner: 'Sarah Johnson', crop: 'Apples', soil: 'Loam', location: 'Washington, USA', robot: 'AgriBot-002', status: 'Active', cls: 'bg-brand-light text-[#137333]' },
  { name: 'Golden Harvest', owner: 'Michael Brown', crop: 'Corn', soil: 'Sandy', location: 'Iowa, USA', robot: 'AgriBot-003', status: 'Active', cls: 'bg-brand-light text-[#137333]' },
  { name: 'Maple Ridge Farm', owner: 'John Smith', crop: 'Soybeans', soil: 'Loam', location: 'Illinois, USA', robot: 'AgriBot-004', status: 'Active', cls: 'bg-brand-light text-[#137333]' },
];

export default function Farms() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-semibold">Farm Management</div>
          <div className="text-sm text-text-secondary mt-1">View and manage agricultural properties</div>
        </div>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        {[
          { icon: 'ti-building-cottage', val: '8', label: 'Total Farms' },
          { icon: 'ti-map-pin', val: '4', label: 'Regions' },
          { icon: 'ti-seedling', val: '6', label: 'Crop Types' },
          { icon: 'ti-robot', val: '8', label: 'Active Robots' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 bg-white border border-[#EAEAEA] rounded-lg px-4 py-2.5 text-xs text-text-secondary">
            <i className={`ti ${item.icon} text-lg`} style={{ color: '#2B7A3E' }} />
            <strong className="text-[#111] text-sm mr-0.5">{item.val}</strong> {item.label}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col items-stretch mb-4">
          <div className="text-sm font-semibold mb-3">All Farms (8)</div>
          <input placeholder="Search farms by name, owner, or location…" aria-label="Search farms" className="text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)] w-full" />
        </div>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Farm name</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Owner</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Crop</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Soil</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Location</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Robot</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Status</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Actions</th></tr>
          </thead>
          <tbody>
            {farms.map((f, i) => (
              <tr key={i}>
                <td className="px-4 py-4 border-b border-[#F1F3F4]"><strong className="text-[#111] font-medium">{f.name}</strong></td>
                <td className="px-4 py-4 border-b border-[#F1F3F4] text-text-secondary">{f.owner}</td>
                <td className="px-4 py-4 border-b border-[#F1F3F4] text-text-secondary">{f.crop}</td>
                <td className="px-4 py-4 border-b border-[#F1F3F4] text-text-secondary">{f.soil}</td>
                <td className="px-4 py-4 border-b border-[#F1F3F4] text-text-secondary">{f.location}</td>
                <td className="px-4 py-4 border-b border-[#F1F3F4] text-text-secondary">{f.robot}</td>
                <td className="px-4 py-4 border-b border-[#F1F3F4]"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${f.cls}`}>{f.status}</span></td>
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
