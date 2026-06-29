import { useState } from 'react';
import { useRobots } from '../../context/RobotContext';

export default function Analytics() {
  const { robots } = useRobots();
  const [hoveredCrop, setHoveredCrop] = useState(null);
  const [hoveredRadial, setHoveredRadial] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const active = robots.filter((r) => r.status === 'Active').length;
  const idle = robots.filter((r) => r.status === 'Idle').length;
  const offline = robots.filter((r) => r.status === 'Offline').length;
  const total = robots.length;
  const activePct = total > 0 ? active / total : 0;
  const idlePct = total > 0 ? idle / total : 0;

  const crops = [
    { label: 'Wheat', pct: 25, color: '#10B981' },
    { label: 'Others', pct: 22, color: '#34D399' },
    { label: 'Corn', pct: 20, color: '#F59E0B' },
    { label: 'Soybeans', pct: 18, color: '#6366F1' },
    { label: 'Rice', pct: 15, color: '#EC4899' },
  ];

  const metrics = [
    { val: '86.5%', label: 'Avg Farm Productivity', change: '↑ +5.2%', changeCls: 'text-[#16A34A]', icon: 'ph-trend-up', iconBg: '#e8f5e9', iconCls: '#059669', glow: 'rgba(5,150,105,0.7)' },
    { val: '92.3%', label: 'Task Completion Rate', change: '↑ +3.1%', changeCls: 'text-[#16A34A]', icon: 'ph-check-circle', iconBg: '#e8f5e9', iconCls: '#059669', glow: 'rgba(5,150,105,0.7)' },
    { val: '78.4%', label: 'Robot Efficiency', change: '↓ -1.8%', changeCls: 'text-[#DC2626]', icon: 'ph-robot', iconBg: '#ffebee', iconCls: '#dc2626', glow: 'rgba(239,68,68,0.7)' },
    { val: '24', label: 'Crop Yield (t/ha)', change: '↑ +2.1%', changeCls: 'text-[#16A34A]', icon: 'ph-flower', iconBg: '#e8f5e9', iconCls: '#059669', glow: 'rgba(5,150,105,0.7)' },
  ];

  const cx = 60, cy = 60, donutR = 42, donutStroke = 14;
  const donutCirc = 2 * Math.PI * donutR;
  let accum = 0;
  const donutSegments = crops.map((crop) => {
    const len = (crop.pct / 100) * donutCirc;
    const seg = { ...crop, len, offset: accum };
    accum -= len;
    return seg;
  });

  const radialR1 = 40, radialR2 = 28, radialStroke = 12;
  const radialCirc1 = 2 * Math.PI * radialR1;
  const radialCirc2 = 2 * Math.PI * radialR2;

  const handleCropHover = (crop, idx, e) => {
    setHoveredCrop(idx);
    const rect = e.currentTarget.closest('.crop-card').getBoundingClientRect();
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top - 10 });
  };

  const handleRadialHover = (key, e) => {
    setHoveredRadial(key);
    const rect = e.currentTarget.closest('.radial-card').getBoundingClientRect();
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top - 10 });
  };

  const radialData = [
    { key: 'active', label: 'Active', count: active, pct: activePct, color: '#10B981', r: radialR1, circ: radialCirc1 },
    { key: 'idle', label: 'Idle', count: idle, pct: idlePct, color: '#F59E0B', r: radialR2, circ: radialCirc2 },
  ];

  return (
    <>
      <div className="mb-6">
        <div className="text-2xl font-bold text-primary">Analytics</div>
        <div className="text-sm text-text-secondary mt-1">System-wide performance metrics</div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {metrics.map((item, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 overflow-hidden" style={{ contentVisibility: 'auto' }}>
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: `radial-gradient(circle, ${item.glow} 0%, transparent 70%)`, filter: 'blur(30px)', opacity: 0.35 }} />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-secondary mb-2">{item.label}</div>
                <div className="text-3xl font-extrabold text-primary mb-1">{item.val}</div>
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
        {/* Crop Distribution — SVG Donut Chart */}
        <div className="crop-card relative rounded-[20px] p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          <div className="text-sm font-semibold text-primary mb-4">Crop distribution</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
            <div className="relative shrink-0">
              <svg viewBox="0 0 120 120" className="w-32 h-32">
                <g style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }}>
                  {donutSegments.map((seg, i) => (
                    <g key={seg.label}
                      style={{ transformOrigin: '60px 60px', transition: 'transform 0.2s ease', cursor: 'pointer' }}
                      onMouseEnter={(e) => handleCropHover(seg, i, e)}
                      onMouseLeave={() => setHoveredCrop(null)}
                    >
                      <circle cx={cx} cy={cy} r={donutR} fill="none"
                        stroke={seg.color}
                        strokeWidth={donutStroke}
                        strokeDasharray={`${seg.len} ${donutCirc - seg.len}`}
                        strokeDashoffset={seg.offset}
                        strokeLinecap="round"
                        opacity={hoveredCrop === null || hoveredCrop === i ? 1 : 0.4}
                        style={{ transform: hoveredCrop === i ? 'scale(1.05)' : 'scale(1)', transformOrigin: '60px 60px', transition: 'transform 0.2s ease, opacity 0.2s ease' }}
                      />
                    </g>
                  ))}
                </g>
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ color: '#6B7280', fontSize: '12px', fontWeight: 500 }}>Total Crops</div>
                <div style={{ color: '#111827', fontSize: '22px', fontWeight: 700, marginTop: '4px' }}>100%</div>
              </div>
            </div>
            <div className="flex-1">
              {crops.map((crop, i) => (
                <div key={crop.label}
                  className="flex items-center gap-3 py-1.5"
                  style={{ cursor: 'pointer', opacity: hoveredCrop === null || hoveredCrop === i ? 1 : 0.4, transition: 'opacity 0.2s ease' }}
                  onMouseEnter={() => setHoveredCrop(i)}
                  onMouseLeave={() => setHoveredCrop(null)}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: crop.color }} />
                  <span className="text-xs text-text-secondary flex-1">{crop.label}</span>
                  <span className="text-xs font-semibold text-primary">{crop.pct}%</span>
                </div>
              ))}
            </div>
          </div>
          {hoveredCrop !== null && (
            <div style={{ position: 'absolute', top: `${tooltipPos.y - 40}px`, left: `${tooltipPos.x - 60}px`, background: '#1f2937', color: '#fff', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: crops[hoveredCrop].color, marginRight: '8px', verticalAlign: 'middle' }} />
              {crops[hoveredCrop].label}
              <span style={{ fontWeight: 700, marginLeft: '6px' }}>{crops[hoveredCrop].pct}%</span>
            </div>
          )}
        </div>

        {/* Robot Status — Concentric Radial Bar Chart */}
        <div className="radial-card relative rounded-[20px] p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          <div className="text-sm font-semibold text-primary mb-4">Robot status</div>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '16px', fontSize: '12px', fontWeight: 500 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280' }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#10B981' }} /> Active: {active}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280' }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#F59E0B' }} /> Idle: {idle}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280' }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#EF4444' }} /> Offline: {offline}
            </span>
          </div>
          <div className="relative" style={{ display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 120 120" className="w-36 h-36">
              <g style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }}>
                {radialData.map((d) => (
                  <g key={d.key}>
                    <circle cx={cx} cy={cy} r={d.r} fill="none" stroke="#E5E7EB" strokeWidth={radialStroke} />
                    <circle cx={cx} cy={cy} r={d.r} fill="none"
                      stroke={d.color}
                      strokeWidth={radialStroke}
                      strokeDasharray={d.pct > 0 ? `${d.pct * d.circ} ${d.circ}` : `0 ${d.circ}`}
                      strokeDashoffset={0}
                      strokeLinecap="round"
                      style={{ cursor: 'pointer', transition: 'stroke-width 0.2s ease, opacity 0.2s ease' }}
                      opacity={hoveredRadial === null || hoveredRadial === d.key ? 1 : 0.4}
                      strokeWidth={hoveredRadial === d.key ? radialStroke + 2 : radialStroke}
                      onMouseEnter={(e) => handleRadialHover(d.key, e)}
                      onMouseLeave={() => setHoveredRadial(null)}
                    />
                  </g>
                ))}
              </g>
              <circle cx={cx} cy={cy} r={6} fill="#EF4444" style={{ cursor: 'pointer' }}
                opacity={hoveredRadial === null || hoveredRadial === 'offline' ? 1 : 0.4}
                onMouseEnter={(e) => handleRadialHover('offline', e)}
                onMouseLeave={() => setHoveredRadial(null)}
              />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ color: '#6B7280', fontSize: '11px', fontWeight: 500 }}>Total Robots</div>
              <div style={{ color: '#111827', fontSize: '24px', fontWeight: 800, marginTop: '2px' }}>{total}</div>
            </div>
          </div>
          {hoveredRadial !== null && (
            <div style={{ position: 'absolute', top: `${tooltipPos.y - 40}px`, left: `${tooltipPos.x - 80}px`, background: '#1f2937', color: '#fff', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              {hoveredRadial === 'active' && <><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', marginRight: '8px', verticalAlign: 'middle' }} />Active: {active} robot{active !== 1 ? 's' : ''} ({Math.round(activePct * 100)}%)</>}
              {hoveredRadial === 'idle' && <><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', marginRight: '8px', verticalAlign: 'middle' }} />Idle: {idle} robot{idle !== 1 ? 's' : ''} ({Math.round(idlePct * 100)}%)</>}
              {hoveredRadial === 'offline' && <><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', marginRight: '8px', verticalAlign: 'middle' }} />Offline: {offline} robot{offline !== 1 ? 's' : ''}</>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
