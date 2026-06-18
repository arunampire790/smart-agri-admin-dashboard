const robots = [
  { name: 'AgriBot Alpha', id: 'AgriBot-001', farm: 'Green Valley Farm', model: 'AB-X1000', battery: 85, batCls: 'bg-[#137333]', status: 'Active', stCls: 'bg-brand-light text-[#137333]' },
  { name: 'AgriBot Beta', id: 'AgriBot-002', farm: 'Sunrise Orchards', model: 'AB-X1000', battery: 62, batCls: 'bg-[#137333]', status: 'Active', stCls: 'bg-brand-light text-[#137333]' },
  { name: 'AgriBot Gamma', id: 'AgriBot-003', farm: 'Golden Harvest', model: 'AB-X2000', battery: 45, batCls: 'bg-warning-text', status: 'Idle', stCls: 'bg-warning-bg text-warning-text' },
  { name: 'AgriBot Delta', id: 'AgriBot-004', farm: 'Maple Ridge Farm', model: 'AB-X1000', battery: 12, batCls: 'bg-danger-text', status: 'Offline', stCls: 'bg-danger-bg text-danger-text' },
];

export default function Robots() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-semibold">Robot Management</div>
          <div className="text-sm text-text-secondary mt-1">Monitor and control agricultural robots</div>
        </div>
        <button className="bg-brand text-white border-none rounded-lg px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 hover:opacity-90">
          <i className="ti ti-plus" /> Add Robot
        </button>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        {[
          { icon: 'ti-robot', cls: 'bg-brand-light text-[#137333]', val: '4', label: 'Online', foot: '85–100% battery' },
          { icon: 'ti-player-pause', cls: 'bg-warning-bg text-warning-text', val: '3', label: 'Idle', foot: '45–62% battery' },
          { icon: 'ti-tool', cls: 'bg-[#E8EAF6] text-[#1A73E8]', val: '0', label: 'Maintenance', foot: 'N/A' },
          { icon: 'ti-plug-off', cls: 'bg-danger-bg text-danger-text', val: '1', label: 'Offline', foot: '12% battery last seen' },
        ].map((item, i) => (
          <div key={i} className="flex-1 min-w-[160px] bg-white border border-[#EAEAEA] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${item.cls}`}>
                <i className={`ti ${item.icon}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#111] leading-tight">{item.val}</div>
                <div className="text-xs text-text-secondary">{item.label}</div>
              </div>
            </div>
            <div className="text-[10px] text-text-secondary border-t border-[#EAEAEA] pt-2">{item.foot}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col items-stretch mb-4">
          <div className="text-sm font-semibold mb-3">All Robots (8)</div>
          <input placeholder="Search robots by ID or model..." aria-label="Search robots" className="text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)] w-full" />
        </div>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Name</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">ID</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Farm</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Model</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Battery</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Status</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Actions</th></tr>
          </thead>
          <tbody>
            {robots.map((r, i) => (
              <tr key={i}>
                <td className="px-4 py-4 border-b border-[#F1F3F4]"><strong className="text-[#111] font-medium">{r.name}</strong></td>
                <td className="px-4 py-4 border-b border-[#F1F3F4]"><code className="text-xs bg-[#F1F3F4] px-1.5 py-0.5 rounded">{r.id}</code></td>
                <td className="px-4 py-4 border-b border-[#F1F3F4] text-text-secondary">{r.farm}</td>
                <td className="px-4 py-4 border-b border-[#F1F3F4] text-text-secondary">{r.model}</td>
                <td className="px-4 py-4 border-b border-[#F1F3F4]">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-[#F1F3F4] rounded overflow-hidden">
                      <div className={`h-full rounded ${r.batCls}`} style={{ width: `${r.battery}%` }} />
                    </div>
                    <span className="text-xs font-medium">{r.battery}%</span>
                  </div>
                </td>
                <td className="px-4 py-4 border-b border-[#F1F3F4]"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${r.stCls}`}>{r.status}</span></td>
                <td className="px-4 py-4 border-b border-[#F1F3F4]">
                  <div className="flex gap-3 items-center">
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
