import { Sprout, CheckCircle2, Bot, Wheat } from 'lucide-react';
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

  return (
    <>
      <div className="mb-6">
        <div className="text-2xl font-bold text-[#000000]">Analytics</div>
        <div className="text-sm text-text-secondary mt-1">System-wide performance metrics</div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="dashboard-card-link glass-card rounded-2xl p-5 overflow-hidden" style={{ contentVisibility: 'auto' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.7) 0%, transparent 70%)', filter: 'blur(30px)', opacity: 0.35 }} />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#6B7280] mb-2">Avg Farm Productivity</div>
              <div className="text-3xl font-extrabold text-[#000000] mb-1">86.5%</div>
              <div className="text-[10px] leading-relaxed text-[#16A34A]">↑ +5.2%</div>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#e8f5e9' }}>
              <Sprout size={18} color="#059669" />
            </div>
          </div>
        </div>
        <div className="dashboard-card-link glass-card rounded-2xl p-5 overflow-hidden" style={{ contentVisibility: 'auto' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.7) 0%, transparent 70%)', filter: 'blur(30px)', opacity: 0.35 }} />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#6B7280] mb-2">Task Completion Rate</div>
              <div className="text-3xl font-extrabold text-[#000000] mb-1">92.3%</div>
              <div className="text-[10px] leading-relaxed text-[#16A34A]">↑ +3.1%</div>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#e8f5e9' }}>
              <CheckCircle2 size={18} color="#059669" />
            </div>
          </div>
        </div>
        <div className="dashboard-card-link glass-card rounded-2xl p-5 overflow-hidden" style={{ contentVisibility: 'auto' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.7) 0%, transparent 70%)', filter: 'blur(30px)', opacity: 0.35 }} />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#6B7280] mb-2">Robot Efficiency</div>
              <div className="text-3xl font-extrabold text-[#000000] mb-1">78.4%</div>
              <div className="text-[10px] leading-relaxed text-[#DC2626]">↓ -1.8%</div>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#ffebee' }}>
              <Bot size={18} color="#dc2626" />
            </div>
          </div>
        </div>
        <div className="dashboard-card-link glass-card rounded-2xl p-5 overflow-hidden" style={{ contentVisibility: 'auto' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.7) 0%, transparent 70%)', filter: 'blur(30px)', opacity: 0.35 }} />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#6B7280] mb-2">Crop Yield (t/ha)</div>
              <div className="text-3xl font-extrabold text-[#000000] mb-1">24</div>
              <div className="text-[10px] leading-relaxed text-[#16A34A]">↑ +2.1%</div>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#e8f5e9' }}>
              <Wheat size={18} color="#059669" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-[20px] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          <div className="text-sm font-semibold text-[#1C1C1E] mb-5">Crop distribution</div>
          <div className="flex flex-col space-y-5">
            {[
              { label: 'Wheat', pct: 25, gradient: 'linear-gradient(90deg, #10B981, #059669)' },
              { label: 'Others', pct: 22, gradient: 'linear-gradient(90deg, #34D399, #10B981)' },
              { label: 'Corn', pct: 20, gradient: 'linear-gradient(90deg, #6EE7B7, #34D399)' },
              { label: 'Soybeans', pct: 18, gradient: 'linear-gradient(90deg, #A7F3D0, #6EE7B7)' },
              { label: 'Rice', pct: 15, gradient: 'linear-gradient(90deg, #D1FAE5, #A7F3D0)' },
            ].map((crop) => (
              <div key={crop.label}>
                <div className="flex items-center justify-between mb-2">
                  <div style={{ fontWeight: 500, color: '#374151', fontSize: '13px' }}>{crop.label}</div>
                  <div style={{ fontWeight: 600, color: '#111827', fontSize: '13px' }}>{crop.pct}%</div>
                </div>
                <div className="w-full overflow-hidden" style={{ height: '8px', borderRadius: '9999px', background: 'rgba(0,0,0,0.05)' }}>
                  <div className="h-full" style={{ width: `${crop.pct}%`, height: '8px', borderRadius: '9999px', background: crop.gradient, transition: 'width 1s ease-in-out' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[20px] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          <div className="text-sm font-semibold text-[#1C1C1E] mb-5">Robot status</div>
          <div className="flex flex-col space-y-5">
            {[
              { label: 'Active', val: String(active), pct: activePct, dot: '#10B981' },
              { label: 'Idle', val: String(idle), pct: idlePct, dot: '#F59E0B' },
              { label: 'Offline', val: String(offline), pct: offlinePct, dot: '#F43F5E' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.dot, filter: 'drop-shadow(0 0 4px ' + item.dot + '80)' }} />
                    <span style={{ fontWeight: 500, color: '#374151', fontSize: '13px' }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>{item.val}</span>
                </div>
                <div className="w-full overflow-hidden" style={{ height: '6px', borderRadius: '9999px', background: 'rgba(0,0,0,0.05)' }}>
                  <div className="h-full" style={{ width: `${item.pct}%`, height: '6px', borderRadius: '9999px', background: item.dot, transition: 'width 1s ease-in-out' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
