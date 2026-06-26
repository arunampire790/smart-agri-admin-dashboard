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

  const cropData = [
    { label: 'Wheat', value: 25, color: '#10B981' },
    { label: 'Others', value: 22, color: '#34D399' },
    { label: 'Corn', value: 20, color: '#F59E0B' },
    { label: 'Soybeans', value: 18, color: '#6366F1' },
    { label: 'Rice', value: 15, color: '#EC4899' },
  ];

  const totalVolume = cropData.reduce((sum, item) => sum + item.value, 0);
  const cropSegments = cropData.map((item) => ({
    ...item,
    pct: parseFloat(((item.value / totalVolume) * 100).toFixed(1)),
  }));

  const donutRadius = 80;
  const donutStroke = 28;
  const donutCx = 120;
  const donutCy = 120;
  const donutCirc = 2 * Math.PI * donutRadius;

  let cumPct = 0;
  const donutArcs = cropSegments.map((s) => {
    const offset = cumPct;
    cumPct += s.pct;
    const segmentLen = (s.pct / 100) * donutCirc;
    return { ...s, dashArray: `${segmentLen.toFixed(2)} ${donutCirc.toFixed(2)}`, dashOffset: -((offset / 100) * donutCirc) };
  });

  const ringConfigs = [
    { label: 'Active', pct: activePct, color: '#10B981', radius: 90 },
    { label: 'Idle', pct: idlePct, color: '#F59E0B', radius: 65 },
    { label: 'Offline', pct: offlinePct, color: '#EF4444', radius: 40 },
  ];
  const ringStroke = 16;
  const ringSvgs = ringConfigs.map((r) => ({ ...r, circ: 2 * Math.PI * r.radius }));

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
        <div className="rounded-[20px] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50 min-h-[340px]" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          <div className="text-sm font-semibold text-[#1C1C1E] mb-4">Crop distribution</div>
          <div className="flex items-center gap-4" style={{ minHeight: 'calc(100% - 40px)' }}>
            <div className="w-1/2 flex justify-center">
              <svg width="240" height="240" viewBox="0 0 240 240">
                <circle cx={donutCx} cy={donutCy} r={donutRadius} fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth={donutStroke} />
                {donutArcs.map((seg) => (
                  <circle key={seg.label} cx={donutCx} cy={donutCy} r={donutRadius} fill="none" stroke={seg.color} strokeWidth={donutStroke} strokeDasharray={seg.dashArray} strokeDashoffset={seg.dashOffset} transform={`rotate(-90, ${donutCx}, ${donutCy})`} style={{ transition: 'stroke-dasharray 1s ease-in-out' }} />
                ))}
                <text x={donutCx} y={donutCy - 12} textAnchor="middle" fill="#6B7280" fontSize="12" fontWeight="500" textTransform="uppercase">Total Crops</text>
                <text x={donutCx} y={donutCy + 16} textAnchor="middle" fill="#111827" fontSize="22" fontWeight="700">100%</text>
              </svg>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '16px 1fr 40px 48px', alignItems: 'center', gap: '12px' }}>
              {cropSegments.map((crop) => (
                <div key={crop.label} className="contents">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: crop.color }} />
                  <span style={{ fontSize: '13px', color: '#374151' }}>{crop.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280', textAlign: 'right' }}>{crop.value}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827', textAlign: 'right' }}>{crop.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[20px] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50 min-h-[340px]" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          <div className="text-sm font-semibold text-[#1C1C1E] mb-4">Robot status</div>
          <div className="flex gap-4 mb-4">
            {[
              { label: 'Active', val: active, color: '#10B981' },
              { label: 'Idle', val: idle, color: '#F59E0B' },
              { label: 'Offline', val: offline, color: '#EF4444' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                <span style={{ color: '#6B7280' }}>{item.label}:</span>
                <span style={{ color: '#111827', fontWeight: 600 }}>{item.val}</span>
              </div>
            ))}
          </div>
          <div className="relative flex justify-center" style={{ minHeight: 'calc(100% - 80px)' }}>
            <svg width="260" height="260" viewBox="0 0 260 260" className="self-center">
              <g transform="rotate(-90, 130, 130)">
                {ringSvgs.map((ring) => (
                  <g key={ring.label}>
                    <circle cx="50%" cy="50%" r={ring.radius} fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth={ringStroke} />
                    <circle cx="50%" cy="50%" r={ring.radius} fill="none" stroke={ring.color} strokeWidth={ringStroke} strokeDasharray={`${(ring.pct / 100) * ring.circ} ${ring.circ}`} strokeLinecap="round" className="analytics-ring" />
                  </g>
                ))}
              </g>
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <div style={{ fontSize: '11px', fontWeight: 500, color: '#6B7280' }}>Total Robots</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>{total}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
