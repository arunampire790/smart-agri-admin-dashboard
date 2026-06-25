export default function Analytics() {
  return (
    <>
      <div className="mb-6">
        <div className="text-2xl font-bold text-[#000000]">Analytics</div>
        <div className="text-sm text-text-secondary mt-1">System-wide performance metrics</div>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        {[
          { val: '86.5%', label: 'Avg Farm Productivity', change: '↑ +5.2%', changeCls: 'text-[#16A34A]' },
          { val: '92.3%', label: 'Task Completion Rate', change: '↑ +3.1%', changeCls: 'text-[#16A34A]' },
          { val: '78.4%', label: 'Robot Efficiency', change: '↓ -1.8%', changeCls: 'text-[#DC2626]' },
          { val: '24', label: 'Crop Yield (t/ha)', change: '↑ +2.1%', changeCls: 'text-[#16A34A]' },
        ].map((item, i) => (
          <div key={i} className="flex-1 min-w-[180px] glass-card rounded-[20px] p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)]">
            <div className="text-2xl font-extrabold text-[#000000] leading-tight mb-1">{item.val}</div>
            <div className="text-xs font-semibold text-[#4B5563] mb-1">{item.label}</div>
            <div className={`text-[10px] leading-relaxed ${item.changeCls}`}>{item.change}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-[240px] glass-card rounded-[20px] p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)]">
          <div className="text-sm font-semibold text-[#1C1C1E] mb-4">Crop distribution</div>
          {[
            { label: 'Wheat', pct: 25, color: '#059669' },
            { label: 'Others', pct: 22, color: '#66bb6a' },
            { label: 'Corn', pct: 20, color: '#81c784' },
            { label: 'Soybeans', pct: 18, color: '#a5d6a7' },
            { label: 'Rice', pct: 15, color: '#c8e6c9' },
          ].map((crop) => (
            <div key={crop.label} className="flex items-center gap-3 mb-3">
              <div className="text-xs text-text-secondary w-10 text-right">{crop.label}</div>
              <div className="flex-1 h-2 bg-[#7676801F] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${crop.pct}%`, background: crop.color }} />
              </div>
              <div className="text-xs font-medium text-[#1C1C1E] w-8">{crop.pct}%</div>
            </div>
          ))}
        </div>

        <div className="flex-1 min-w-[240px] glass-card rounded-[20px] p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)]">
          <div className="text-sm font-semibold text-[#1C1C1E] mb-4">Robot status</div>
          {[
            { label: 'Active', val: '4', dot: 'bg-[#10B981]' },
            { label: 'Idle', val: '3', dot: 'bg-[#F59E0B]' },
            { label: 'Offline', val: '1', dot: 'bg-[#F43F5E]' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs text-text-secondary mb-2">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.dot}`} />
              {item.label}
              <span className="ml-auto font-medium text-[#1C1C1E]">{item.val}</span>
            </div>
          ))}
          <div className="mt-4">
            <div className="h-1.5 bg-[#F3F4F6] rounded-[6px] overflow-hidden flex">
              <div className="h-full bg-[#10B981]" style={{ width: '50%' }} />
              <div className="h-full bg-[#F59E0B]" style={{ width: '37.5%' }} />
              <div className="h-full bg-[#F43F5E]" style={{ width: '12.5%' }} />
            </div>
            <div className="flex justify-between text-[10px] text-[#6B7280] mt-1.5">
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
