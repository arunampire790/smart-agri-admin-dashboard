import { useRobots } from '../../context/RobotContext';

const statusStyle = {
  Active: 'active',
  Idle: 'idle',
  Offline: 'offline',
};

function batteryColor(pct) {
  if (pct >= 60) return '#2e7d32';
  if (pct >= 30) return '#e65100';
  return '#c62828';
}

export default function Robots() {
  const { robots } = useRobots();

  const active = robots.filter((r) => r.status === 'Active').length;
  const idle = robots.filter((r) => r.status === 'Idle').length;
  const offline = robots.filter((r) => r.status === 'Offline').length;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xl font-medium text-[#1C1C1E]">Robot management</div>
          <div className="text-sm text-[#757575] mt-0.5">Monitor and control agricultural robots</div>
        </div>
        <button className="bg-[#2e7d32] text-white border-none rounded-md px-3.5 py-1.5 text-sm cursor-pointer flex items-center gap-1.5 hover:bg-[#1b5e20]">
          <i className="ph ph-plus" /> Add robot
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3.5">
        <div className="bg-white border border-[#e0e0e0] rounded-xl p-3 flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2e7d32]" />
          <div>
            <div className="text-xl font-medium">{active}</div>
            <div className="text-xs text-[#757575]">Active</div>
          </div>
        </div>
        <div className="bg-white border border-[#e0e0e0] rounded-xl p-3 flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e65100]" />
          <div>
            <div className="text-xl font-medium">{idle}</div>
            <div className="text-xs text-[#757575]">Idle</div>
          </div>
        </div>
        <div className="bg-white border border-[#e0e0e0] rounded-xl p-3 flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#c62828]" />
          <div>
            <div className="text-xl font-medium">{offline}</div>
            <div className="text-xs text-[#757575]">Offline</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#e0e0e0] rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium">All robots ({robots.length})</div>
          <input placeholder="Search robots…" aria-label="Search robots" className="text-xs px-2.5 py-1.5 border border-[#e0e0e0] rounded-md bg-[#f5f5f5] outline-none focus:border-[#2e7d32] w-[220px]" />
        </div>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Name</th>
              <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">ID</th>
              <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Farm</th>
              <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Model</th>
              <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Battery</th>
              <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Status</th>
              <th className="text-left px-2 py-1.5 text-[10px] font-medium text-[#757575] border-b border-[#e0e0e0]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {robots.map((r, i) => (
              <tr key={i}>
                <td className="px-2 py-2 border-b border-[#e0e0e0]"><strong className="font-medium">{r.name}</strong></td>
                <td className="px-2 py-2 border-b border-[#e0e0e0]"><code className="text-xs bg-[#f5f5f5] px-1.5 py-0.5 rounded text-[#1C1C1E]">{r.id}</code></td>
                <td className="px-2 py-2 border-b border-[#e0e0e0] text-[#757575]">{r.farm}</td>
                <td className="px-2 py-2 border-b border-[#e0e0e0] text-[#757575]">{r.model}</td>
                <td className="px-2 py-2 border-b border-[#e0e0e0]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-[60px] h-1.5 bg-[#f5f5f5] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${r.battery}%`, background: batteryColor(r.battery) }} />
                    </div>
                    <span className="text-xs text-[#757575]">{r.battery}%</span>
                  </div>
                </td>
                <td className="px-2 py-2 border-b border-[#e0e0e0]"><span className={`pill ${statusStyle[r.status]}`}>{r.status}</span></td>
                <td className="px-2 py-2 border-b border-[#e0e0e0]">
                  <div className="flex gap-2 items-center">
                    <button title="Edit" className="bg-none border-none cursor-pointer text-[#757575] hover:text-[#1C1C1E] text-base"><i className="ph ph-pencil" /></button>
                    <button title="Delete" className="bg-none border-none cursor-pointer text-[#757575] hover:text-[#c62828] text-base"><i className="ph ph-trash" /></button>
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
