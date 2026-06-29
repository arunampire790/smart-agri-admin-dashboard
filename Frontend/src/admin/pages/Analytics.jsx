import { useState, useRef, useCallback } from 'react';
import { useRobots } from '../../context/RobotContext';
import { TrendingUp, CheckCircle, Bot, Sprout } from 'lucide-react';

function useCardGlow() {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const onMouseEnter = useCallback(() => setIsHovered(true), []);
  const onMouseLeave = useCallback(() => { setIsHovered(false); setPos({ x: 50, y: 50 }); }, []);

  return { ref, onMouseMove, onMouseEnter, onMouseLeave, pos, isHovered };
}

function GlowCard({ className, style: outerStyle, children }) {
  const { ref, onMouseMove, onMouseEnter, onMouseLeave, pos, isHovered } = useCardGlow();

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={className}
      style={{
        ...outerStyle,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isHovered ? '0 10px 20px rgba(0,0,0,0.1)' : outerStyle?.boxShadow,
      }}
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        background: `radial-gradient(circle 200px at ${pos.x}% ${pos.y}%, rgba(16,185,129,0.15), transparent)`,
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.2s ease',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      {children}
    </div>
  );
}

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
    { label: 'Others', pct: 22, color: '#A7F3D0' },
    { label: 'Corn', pct: 20, color: '#F59E0B' },
    { label: 'Soybeans', pct: 18, color: '#6366F1' },
    { label: 'Rice', pct: 15, color: '#EC4899' },
  ];

  const metrics = [
    { val: '86.5%', label: 'Avg Farm Productivity', change: '↑ +5.2%', changeCls: 'text-[#16A34A]', Icon: TrendingUp, iconBg: 'rgba(46,158,107,0.12)', iconColor: '#059669', glow: 'rgba(5,150,105,0.7)' },
    { val: '92.3%', label: 'Task Completion Rate', change: '↑ +3.1%', changeCls: 'text-[#16A34A]', Icon: CheckCircle, iconBg: 'rgba(46,158,107,0.12)', iconColor: '#059669', glow: 'rgba(5,150,105,0.7)' },
    { val: '78.4%', label: 'Robot Efficiency', change: '↓ -1.8%', changeCls: 'text-[#DC2626]', Icon: Bot, iconBg: 'rgba(239,68,68,0.12)', iconColor: '#dc2626', glow: 'rgba(239,68,68,0.7)' },
    { val: '24', label: 'Crop Yield (t/ha)', change: '↑ +2.1%', changeCls: 'text-[#16A34A]', Icon: Sprout, iconBg: 'rgba(46,158,107,0.12)', iconColor: '#059669', glow: 'rgba(5,150,105,0.7)' },
  ];

  const cx = 60, cy = 60, donutR = 42, donutStroke = 16;
  const donutCirc = 2 * Math.PI * donutR;
  let accum = 0;
  const donutSegments = crops.map((crop) => {
    const len = (crop.pct / 100) * donutCirc;
    const seg = { ...crop, len, offset: accum };
    accum -= len;
    return seg;
  });

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

  const handleRadialMove = (e) => {
    if (hoveredRadial !== null) {
      const rect = e.currentTarget.closest('.radial-card').getBoundingClientRect();
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top - 10 });
    }
  };

  return (
    <>
      <div className="mb-6">
        <div className="text-2xl font-bold text-primary">Analytics</div>
        <div className="text-sm text-text-secondary mt-1">System-wide performance metrics</div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {metrics.map((item, i) => (
          <GlowCard key={i} className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: `radial-gradient(circle, ${item.glow} 0%, transparent 70%)`, filter: 'blur(30px)', opacity: 0.35 }} />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-secondary mb-2">{item.label}</div>
                <div className="text-3xl font-extrabold text-primary mb-1">{item.val}</div>
                <div className={`text-[10px] leading-relaxed ${item.changeCls}`}>{item.change}</div>
              </div>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: item.iconBg }}>
                <item.Icon size={18} color={item.iconColor} />
              </div>
            </div>
          </GlowCard>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Crop Distribution — SVG Donut Chart */}
        <GlowCard className="crop-card relative rounded-[20px] shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50" style={{ height: '260px', minHeight: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', boxSizing: 'border-box', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>Crop distribution</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '28px', width: '100%', flex: 1, minHeight: 0 }}>
            <div className="relative shrink-0">
              <svg viewBox="0 0 120 120" style={{ width: '200px', height: '200px', display: 'block' }}>
                <g style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }}>
                  {donutSegments.map((seg, i) => (
                    <g key={seg.label}
                      style={{ transformOrigin: '60px 60px', transition: 'transform 0.2s ease-out', cursor: 'pointer' }}
                      onMouseEnter={(e) => handleCropHover(seg, i, e)}
                      onMouseLeave={() => setHoveredCrop(null)}
                    >
                      <circle cx={cx} cy={cy} r={donutR} fill="none"
                        stroke={seg.color}
                        strokeWidth={donutStroke}
                        strokeDasharray={`${seg.len} ${donutCirc - seg.len}`}
                        strokeDashoffset={seg.offset}
                        strokeLinecap="round"
                        opacity={hoveredCrop === null || hoveredCrop === i ? 1 : 0.25}
                        style={{ cursor: 'pointer', pointerEvents: 'stroke', transform: hoveredCrop === i ? 'scale(1.05)' : 'scale(1)', transformOrigin: '60px 60px', transition: 'transform 0.2s ease-out, opacity 0.2s ease', filter: hoveredCrop === i ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' : 'none' }}
                      />
                    </g>
                  ))}
                </g>
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ color: '#6B7280', fontSize: '12px', fontWeight: 500 }}>Total Crops</div>
                <div style={{ color: '#111827', fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>100%</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '160px', width: '100%' }}>
              {crops.map((crop, i) => (
                <div key={crop.label}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', borderRadius: '4px', transition: 'background 0.15s ease', cursor: 'pointer', opacity: hoveredCrop === null || hoveredCrop === i ? 1 : 0.25 }}
                  onMouseEnter={() => setHoveredCrop(i)}
                  onMouseLeave={() => setHoveredCrop(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: crop.color }} />
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#4B5563' }}>{crop.label}</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>{crop.pct}%</span>
                </div>
              ))}
            </div>
          </div>
          {hoveredCrop !== null && (
            <div style={{ position: 'absolute', top: `${tooltipPos.y - 50}px`, left: `${tooltipPos.x - 70}px`, background: '#FFFFFF', borderRadius: '8px', padding: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB', pointerEvents: 'none', zIndex: 20, whiteSpace: 'nowrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: crops[hoveredCrop].color }} />
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>{crops[hoveredCrop].label}</span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginLeft: '16px' }}>{crops[hoveredCrop].pct}%</div>
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '16px', marginTop: '2px' }}>of total crop area</div>
            </div>
          )}
        </GlowCard>

        {/* Robot Status — Concentric Radial Bar Chart */}
        <GlowCard className="radial-card relative rounded-[20px] shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50" style={{ height: '260px', minHeight: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', boxSizing: 'border-box', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>Robot status</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '28px', width: '100%', flex: 1, minHeight: 0 }}>
            <div className="relative shrink-0">
              <svg viewBox="0 0 200 200" style={{ width: '200px', height: '200px', display: 'block' }}>
                <circle cx={100} cy={100} r={70} fill="none" stroke="#F3F4F6" strokeWidth={16} />
                <g style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }}>
                  {activePct > 0 && (
                    <circle cx={100} cy={100} r={70} fill="none"
                      stroke="#10B981" strokeWidth={16} strokeLinecap="round"
                      strokeDasharray={`${activePct * 2 * Math.PI * 70} ${2 * Math.PI * 70}`}
                      strokeDashoffset={0}
                      style={{ cursor: 'pointer', pointerEvents: 'stroke', transition: 'stroke-width 0.2s ease, opacity 0.2s ease', strokeWidth: hoveredRadial === 'active' ? 19 : 16 }}
                      opacity={hoveredRadial === null || hoveredRadial === 'active' ? 1 : 0.25}
                      onMouseEnter={(e) => handleRadialHover('active', e)}
                      onMouseMove={handleRadialMove}
                      onMouseLeave={() => setHoveredRadial(null)}
                    />
                  )}
                  {idlePct > 0 && (
                    <g style={{ transform: `rotate(${activePct * 360 + 16}deg, 100px 100px)` }}>
                      <circle cx={100} cy={100} r={70} fill="none"
                        stroke="#F59E0B" strokeWidth={16} strokeLinecap="round"
                        strokeDasharray={`${idlePct * 2 * Math.PI * 70} ${2 * Math.PI * 70}`}
                        strokeDashoffset={0}
                        style={{ cursor: 'pointer', pointerEvents: 'stroke', transition: 'stroke-width 0.2s ease, opacity 0.2s ease', strokeWidth: hoveredRadial === 'idle' ? 19 : 16 }}
                        opacity={hoveredRadial === null || hoveredRadial === 'idle' ? 1 : 0.25}
                        onMouseEnter={(e) => handleRadialHover('idle', e)}
                        onMouseMove={handleRadialMove}
                        onMouseLeave={() => setHoveredRadial(null)}
                      />
                    </g>
                  )}
                </g>
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ color: '#6B7280', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Robots</div>
                <div style={{ color: '#111827', fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>{total}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '160px', width: '100%' }}>
              {[
                { key: 'active', label: 'Active', count: active, color: '#10B981' },
                { key: 'idle', label: 'Idle', count: idle, color: '#F59E0B' },
                { key: 'offline', label: 'Offline', count: offline, color: '#EF4444' },
              ].map((item) => (
                <div key={item.key}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', transition: 'background 0.15s ease', opacity: hoveredRadial === null || hoveredRadial === item.key ? 1 : 0.25 }}
                  onMouseEnter={() => setHoveredRadial(item.key)}
                  onMouseLeave={() => setHoveredRadial(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#4B5563' }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
          {hoveredRadial !== null && (
            <div style={{ position: 'absolute', zIndex: 100, top: `${tooltipPos.y - 50}px`, left: `${tooltipPos.x - 90}px`, background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '10px 14px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
              {hoveredRadial === 'active' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>Active</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginLeft: '16px' }}>{active}</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '16px', marginTop: '2px' }}>{Math.round(activePct * 100)}% of fleet deployed</div>
                </div>
              )}
              {hoveredRadial === 'idle' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>Idle</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginLeft: '16px' }}>{idle}</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '16px', marginTop: '2px' }}>Status: Cooldown</div>
                </div>
              )}
              {hoveredRadial === 'offline' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>Offline</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginLeft: '16px' }}>{offline}</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '16px', marginTop: '2px' }}>No connection</div>
                </div>
              )}
            </div>
          )}
        </GlowCard>
      </div>
    </>
  );
}
