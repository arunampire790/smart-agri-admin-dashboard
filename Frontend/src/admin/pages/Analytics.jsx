import { useState } from 'react';
import { Sprout, CheckCircle2, Bot, Wheat } from 'lucide-react';
import { useRobots } from '../../context/RobotContext';

export default function Analytics() {
  const { robots } = useRobots();
  const [hoveredDonut, setHoveredDonut] = useState(null);
  const [hoveredRing, setHoveredRing] = useState(null);

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

  const donutHoverIn = (label) => setHoveredDonut(label);
  const donutHoverOut = () => setHoveredDonut(null);
  const ringHoverIn = (label) => setHoveredRing(label);
  const ringHoverOut = () => setHoveredRing(null);

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
        <div className="rounded-[20px] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50 min-h-[340px]" style={{ background: 'var(--clr-card)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(31,38,135,0.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        >
          <div className="text-sm font-semibold text-[#1C1C1E] mb-4">Crop distribution</div>
          <div className="flex items-center gap-4" style={{ minHeight: 'calc(100% - 40px)' }}>
            <div className="w-1/2 flex justify-center">
              <svg width="240" height="240" viewBox="0 0 240 240">
                <circle cx={donutCx} cy={donutCy} r={donutRadius} fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth={donutStroke} />
                {donutArcs.map((seg) => (
                  <circle key={seg.label} cx={donutCx} cy={donutCy} r={donutRadius} fill="none" stroke={seg.color}
                    strokeWidth={hoveredDonut === seg.label ? donutStroke + 3 : donutStroke}
                    strokeDasharray={seg.dashArray} strokeDashoffset={seg.dashOffset}
                    transform={`rotate(-90, ${donutCx}, ${donutCy})`}
                    style={{ transition: 'opacity 0.2s ease, stroke-width 0.2s ease', cursor: 'pointer', opacity: hoveredDonut && hoveredDonut !== seg.label ? 0.4 : 1 }}
                    onMouseEnter={() => donutHoverIn(seg.label)}
                    onMouseLeave={donutHoverOut}
                  />
                ))}
                <text x={donutCx} y={donutCy - 12} textAnchor="middle" fill="#6B7280" fontSize="12" fontWeight="500" textTransform="uppercase">Total Crops</text>
                <text x={donutCx} y={donutCy + 16} textAnchor="middle" fill="#111827" fontSize="22" fontWeight="700">100%</text>
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cropSegments.map((crop) => (
                <div key={crop.label}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '12px', width: 'fit-content', cursor: 'pointer', userSelect: 'none', borderRadius: '8px', padding: '2px 6px', margin: '-2px -6px', background: hoveredDonut === crop.label ? 'var(--border-glass-light)' : 'transparent', transition: 'background 0.2s ease' }}
                  onMouseEnter={() => donutHoverIn(crop.label)}
                  onMouseLeave={donutHoverOut}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: crop.color, flexShrink: 0, transition: 'transform 0.2s ease', transform: hoveredDonut === crop.label ? 'scale(1.3)' : 'scale(1)' }} />
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', minWidth: '80px' }}>{crop.label}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginLeft: '4px' }}>{crop.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[20px] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50 min-h-[340px]" style={{ background: 'var(--clr-card)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(31,38,135,0.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        >
          <div className="text-sm font-semibold text-[#1C1C1E] mb-4">Robot status</div>
          <div className="flex gap-4 mb-4">
            {[
              { label: 'Active', val: active, color: '#10B981' },
              { label: 'Idle', val: idle, color: '#F59E0B' },
              { label: 'Offline', val: offline, color: '#EF4444' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-xs"
                style={{ cursor: 'pointer', userSelect: 'none', padding: '2px 6px', borderRadius: '6px', background: hoveredRing === item.label ? 'var(--border-glass-light)' : 'transparent', transition: 'background 0.2s ease' }}
                onMouseEnter={() => ringHoverIn(item.label)}
                onMouseLeave={ringHoverOut}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                <span style={{ color: 'var(--text-muted)' }}>{item.label}:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.val}</span>
              </div>
            ))}
          </div>
          <div className="relative flex justify-center" style={{ minHeight: 'calc(100% - 80px)' }}>
            <svg width="260" height="260" viewBox="0 0 260 260" className="self-center">
              <g transform="rotate(-90, 130, 130)">
                {ringSvgs.map((ring) => (
                  <g key={ring.label}>
                    <circle cx="50%" cy="50%" r={ring.radius} fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth={ringStroke} />
                    <circle cx="50%" cy="50%" r={ring.radius} fill="none" stroke={ring.color}
                      strokeWidth={hoveredRing === ring.label ? ringStroke + 3 : ringStroke}
                      strokeDasharray={`${(ring.pct / 100) * ring.circ} ${ring.circ}`} strokeLinecap="round"
                      className="analytics-ring"
                      style={{ cursor: 'pointer', opacity: hoveredRing && hoveredRing !== ring.label ? 0.4 : 1, transition: 'opacity 0.2s ease, stroke-width 0.2s ease' }}
                      onMouseEnter={() => ringHoverIn(ring.label)}
                      onMouseLeave={ringHoverOut}
                    />
                  </g>
                ))}
              </g>
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)' }}>Total Robots</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>{total}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
