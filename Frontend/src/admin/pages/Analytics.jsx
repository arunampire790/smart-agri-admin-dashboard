import { useRobots } from '../../context/RobotContext';

export default function Analytics() {
  const { robots } = useRobots();

  const active = robots.filter((r) => r.status === 'Active').length;
  const idle = robots.filter((r) => r.status === 'Idle').length;
  const offline = robots.filter((r) => r.status === 'Offline').length;
  const total = robots.length;

  const cropData = [
    { label: 'Wheat', pct: 25, color: '#2e7d32' },
    { label: 'Others', pct: 22, color: '#66bb6a' },
    { label: 'Corn', pct: 20, color: '#81c784' },
    { label: 'Soybeans', pct: 18, color: '#a5d6a7' },
    { label: 'Rice', pct: 15, color: '#c8e6c9' },
  ];

  return (
    <>
      <div className="mb-4">
        <div className="text-xl font-medium text-[#1C1C1E]">Analytics</div>
        <div className="text-sm text-[#757575] mt-0.5">System-wide performance metrics</div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white border border-[#e0e0e0] rounded-xl p-3.5">
          <div className="text-xs text-[#757575] mb-1.5">Avg farm productivity</div>
          <div className="text-xl font-medium mb-1">86.5%</div>
          <div className="text-xs text-[#2e7d32]">↑ +5.2% from last month</div>
        </div>
        <div className="bg-white border border-[#e0e0e0] rounded-xl p-3.5">
          <div className="text-xs text-[#757575] mb-1.5">Task completion rate</div>
          <div className="text-xl font-medium mb-1">92.3%</div>
          <div className="text-xs text-[#2e7d32]">↑ +3.1% from last month</div>
        </div>
        <div className="bg-white border border-[#e0e0e0] rounded-xl p-3.5">
          <div className="text-xs text-[#757575] mb-1.5">Robot efficiency</div>
          <div className="text-xl font-medium mb-1">78.4%</div>
          <div className="text-xs text-[#c62828]">↓ -1.8% from last month</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-[#e0e0e0] rounded-xl p-3.5">
          <div className="text-sm font-medium mb-3">Crop distribution</div>
          {cropData.map((crop) => (
            <div key={crop.label} className="flex items-center gap-2 mb-2">
              <div className="text-xs text-[#757575] w-10 text-right">{crop.label}</div>
              <div className="flex-1 h-2 bg-[#f5f5f5] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${crop.pct}%`, background: crop.color }} />
              </div>
              <div className="text-xs font-medium w-7">{crop.pct}%</div>
            </div>
          ))}
        </div>
        <div className="bg-white border border-[#e0e0e0] rounded-xl p-3.5">
          <div className="text-sm font-medium mb-3">Robot status</div>
          <div className="flex items-center gap-2 text-xs text-[#757575] mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2e7d32]" />
            Active
            <span className="ml-auto font-medium text-[#1C1C1E]">{active}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#757575] mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e65100]" />
            Idle
            <span className="ml-auto font-medium text-[#1C1C1E]">{idle}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#757575] mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c62828]" />
            Offline
            <span className="ml-auto font-medium text-[#1C1C1E]">{offline}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden flex">
            {total > 0 && (
              <>
                <div className="bg-[#2e7d32]" style={{ width: `${(active / total) * 100}%` }} />
                <div className="bg-[#e65100]" style={{ width: `${(idle / total) * 100}%` }} />
                <div className="bg-[#c62828]" style={{ width: `${(offline / total) * 100}%` }} />
              </>
            )}
          </div>
          <div className="flex justify-between text-[10px] text-[#757575] mt-1">
            <span>Active {total > 0 ? Math.round((active / total) * 100) : 0}%</span>
            <span>Idle {total > 0 ? Math.round((idle / total) * 100) : 0}%</span>
            <span>Offline {total > 0 ? Math.round((offline / total) * 100) : 0}%</span>
          </div>
        </div>
      </div>
    </>
  );
}
