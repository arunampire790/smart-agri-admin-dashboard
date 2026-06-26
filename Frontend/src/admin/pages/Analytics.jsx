import { useRobots } from '../../context/RobotContext';

export default function Analytics() {
  const { robots } = useRobots();

  const active = robots.filter((r) => r.status === 'Active').length;
  const idle = robots.filter((r) => r.status === 'Idle').length;
  const offline = robots.filter((r) => r.status === 'Offline').length;
  const total = robots.length;
  const activePct = total > 0 ? Math.round((active / total) * 100) : 0;
  const idlePct = total > 0 ? Math.round((idle / total) * 100) : 0;
  const offlinePct = total > 0 ? Math.round((offline / total) * 100) : 0;

  const metrics = [
    { val: '86.5%', label: 'Avg Farm Productivity', change: '↑ +5.2%', changeCls: 'text-[#16A34A]', icon: 'ph-trend-up', iconBg: '#e8f5e9', iconCls: '#059669', glow: 'rgba(5,150,105,0.7)' },
    { val: '92.3%', label: 'Task Completion Rate', change: '↑ +3.1%', changeCls: 'text-[#16A34A]', icon: 'ph-check-circle', iconBg: '#e8f5e9', iconCls: '#059669', glow: 'rgba(5,150,105,0.7)' },
    { val: '78.4%', label: 'Robot Efficiency', change: '↓ -1.8%', changeCls: 'text-[#DC2626]', icon: 'ph-robot', iconBg: '#ffebee', iconCls: '#dc2626', glow: 'rgba(239,68,68,0.7)' },
    { val: '24', label: 'Crop Yield (t/ha)', change: '↑ +2.1%', changeCls: 'text-[#16A34A]', icon: 'ph-flower', iconBg: '#e8f5e9', iconCls: '#059669', glow: 'rgba(5,150,105,0.7)' },
  ];

  return (
    <>
      <div className="mb-6">
        <div className="text-2xl font-bold text-[#000000]">Analytics</div>
        <div className="text-sm text-text-secondary mt-1">System-wide performance metrics</div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {metrics.map((item, i) => (
          <div key={i} className="dashboard-card-link glass-card rounded-2xl p-5 overflow-hidden" style={{ contentVisibility: 'auto' }}>
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: `radial-gradient(circle, ${item.glow} 0%, transparent 70%)`, filter: 'blur(30px)', opacity: 0.35 }} />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[#6B7280] mb-2">{item.label}</div>
                <div className="text-3xl font-extrabold text-[#000000] mb-1">{item.val}</div>
                <div className={`text-[10px] leading-relaxed ${item.changeCls}`}>{item.change}</div>
              </div>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: item.iconBg }}>
                <i className={item.icon} style={{ color: item.iconCls }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-[20px] p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
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
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.3)' }}>
                <div className="h-full rounded-full" style={{ width: `${crop.pct}%`, background: crop.color }} />
              </div>
              <div className="text-xs font-medium text-[#1C1C1E] w-8">{crop.pct}%</div>
            </div>
          ))}
        </div>

        <div className="rounded-[20px] p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          <div className="text-sm font-semibold text-[#1C1C1E] mb-4">Robot status</div>
          {[
            { label: 'Active', val: String(active), dot: '#10B981' },
            { label: 'Idle', val: String(idle), dot: '#F59E0B' },
            { label: 'Offline', val: String(offline), dot: '#F43F5E' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs text-text-secondary mb-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.dot }} />
              {item.label}
              <span className="ml-auto font-medium text-[#1C1C1E]">{item.val}</span>
            </div>
          ))}
          <div className="mt-4">
            <div className="h-1.5 rounded-[6px] overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.3)' }}>
              <div className="h-full" style={{ width: `${activePct}%`, background: '#10B981' }} />
              <div className="h-full" style={{ width: `${idlePct}%`, background: '#F59E0B' }} />
              <div className="h-full" style={{ width: `${offlinePct}%`, background: '#F43F5E' }} />
            </div>
            <div className="flex justify-between text-[10px] text-[#6B7280] mt-1.5">
              <span>Active {activePct}%</span>
              <span>Idle {idlePct}%</span>
              <span>Offline {offlinePct}%</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
