export default function Analytics() {
  return (
    <>
      <div className="mb-6">
        <div className="text-2xl font-semibold">Analytics</div>
        <div className="text-sm text-text-secondary mt-1">System-wide performance metrics</div>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        {[
          { icon: 'ti-chart-arrows-vertical', bg: '#E6F4EA', color: '#137333', val: '86.5%', label: 'Avg Farm Productivity', change: '↑ +5.2%', up: true },
          { icon: 'ti-checklist', bg: '#E6F4EA', color: '#137333', val: '92.3%', label: 'Task Completion Rate', change: '↑ +3.1%', up: true },
          { icon: 'ti-activity', bg: '#FCE8E6', color: '#C5221F', val: '78.4%', label: 'Robot Efficiency', change: '↓ -1.8%', up: false },
          { icon: 'ti-plant-2', bg: '#E6F4EA', color: '#137333', val: '24', label: 'Crop Yield (t/ha)', change: '↑ +2.1%', up: true },
        ].map((item, i) => (
          <div key={i} className="flex-1 min-w-[180px] flex items-center gap-3 bg-white border border-[#EAEAEA] rounded-lg p-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ background: item.bg, color: item.color }}>
              <i className={`ti ${item.icon}`} />
            </div>
            <div>
              <div className="text-lg font-bold text-[#111] leading-tight">{item.val}</div>
              <div className="text-[10px] text-text-secondary mt-0.5">{item.label}</div>
              <div className={`text-[10px] mt-1 ${item.up ? 'text-[#137333]' : 'text-danger-text'}`}>{item.change}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-[240px] bg-white rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="text-sm font-semibold mb-4">Crop distribution</div>
          {[
            { label: 'Wheat', pct: 25, color: '#2B7A3E' },
            { label: 'Others', pct: 22, color: '#66bb6a' },
            { label: 'Corn', pct: 20, color: '#81c784' },
            { label: 'Soybeans', pct: 18, color: '#a5d6a7' },
            { label: 'Rice', pct: 15, color: '#c8e6c9' },
          ].map((crop) => (
            <div key={crop.label} className="flex items-center gap-3 mb-3">
              <div className="text-xs text-text-secondary w-10 text-right">{crop.label}</div>
              <div className="flex-1 h-2 bg-[#F1F3F4] rounded overflow-hidden">
                <div className="h-full rounded" style={{ width: `${crop.pct}%`, background: crop.color }} />
              </div>
              <div className="text-xs font-medium w-8 text-[#111]">{crop.pct}%</div>
            </div>
          ))}
        </div>

        <div className="flex-1 min-w-[240px] bg-white rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="text-sm font-semibold mb-4">Robot status</div>
          {[
            { label: 'Active', val: '4', dot: 'bg-[#137333]' },
            { label: 'Idle', val: '3', dot: 'bg-warning-text' },
            { label: 'Offline', val: '1', dot: 'bg-danger-text' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs text-text-secondary mb-2">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.dot}`} />
              {item.label}
              <span className="ml-auto font-medium text-[#111]">{item.val}</span>
            </div>
          ))}
          <div className="mt-4">
            <div className="h-2 rounded overflow-hidden flex">
              <div className="h-full bg-[#137333]" style={{ width: '50%' }} />
              <div className="h-full bg-warning-text" style={{ width: '37.5%' }} />
              <div className="h-full bg-danger-text" style={{ width: '12.5%' }} />
            </div>
            <div className="flex justify-between text-[10px] text-text-secondary mt-1.5">
              <span>Active 50%</span>
              <span>Idle 37.5%</span>
              <span>Offline 12.5%</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
