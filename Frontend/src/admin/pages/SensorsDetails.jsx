import { useState, useRef, useCallback } from 'react';
import { AlertTriangle, FlaskRoundIcon as Flask, Camera, TestTube, Leaf, Radar } from 'lucide-react';

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
        background: `radial-gradient(circle 200px at ${pos.x}% ${pos.y}%, rgba(76,175,80,0.15), transparent)`,
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.2s ease',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      {children}
    </div>
  );
}

// TODO: Replace mock sensor data with real backend/IoT integration once available.
const sectorData = [
  { name: 'Sector A', nutrients: { nitrogen: { value: 72, status: 'Good' }, phosphorus: { value: 85, status: 'Good' }, potassium: { value: 64, status: 'Good' } } },
  { name: 'Sector B', nutrients: { nitrogen: { value: 28, status: 'Low' }, phosphorus: { value: 55, status: 'Good' }, potassium: { value: 90, status: 'Too High' } } },
  { name: 'Sector C', nutrients: { nitrogen: { value: 65, status: 'Good' }, phosphorus: { value: 30, status: 'Low' }, potassium: { value: 70, status: 'Good' } } },
  { name: 'Sector D', nutrients: { nitrogen: { value: 80, status: 'Good' }, phosphorus: { value: 78, status: 'Good' }, potassium: { value: 55, status: 'Good' } } },
];

const nutrientColor = (status) => {
  switch (status) {
    case 'Good': return { bar: '#4caf50', text: '#4caf50', bg: 'rgba(76,175,80,0.12)' };
    case 'Low': return { bar: '#EF4444', text: '#EF4444', bg: 'rgba(239,68,68,0.12)' };
    case 'Too High': return { bar: '#D97706', text: '#D97706', bg: 'rgba(217,119,6,0.12)' };
    default: return { bar: '#4caf50', text: '#4caf50', bg: 'rgba(76,175,80,0.12)' };
  }
};

// TODO: Replace placeholder image with real camera feed integration.
const cameraFeeds = [
  { id: 1, sector: 'Sector B', label: 'North Path', warning: '⚠ Large Stone Detected in Path', description: 'Large stones on the main path could puncture tires. Clear before starting the next irrigation cycle.' },
  { id: 2, sector: 'Sector B', label: 'South Path', warning: '⚠ Deep Washout Hole Detected', description: 'A deep hole formed near the drain. Avoid crossing with any machinery until the ground crew fills it in and packs it down.' },
];

export default function SensorsDetails() {

  return (
    <>
      <style>{`
        @keyframes statusPulse { 0% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.5; } }
        .sensor-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .sensor-card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
      `}</style>

      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center shrink-0">
          <Radar size={22} color="#2e7d2e" />
        </div>
        <div>
          <div className="text-2xl font-bold text-[#000000]">Sensors Details</div>
          <div className="text-sm text-text-secondary mt-1">A simple look at your farm sensors and soil health</div>
        </div>
      </div>

      {/* Sensor Connection Checklist */}
      <div className="text-base font-semibold text-[#1a2e1a] mb-4">Sensor Connection Checklist</div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* NPK Soil Probes */}
        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(76,175,80,0.7) 0%, transparent 70%)', filter: 'blur(30px)', opacity: 0.35 }} />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold text-text-secondary mb-1">NPK Soil Probes</div>
              <div className="text-sm font-medium text-[#1a2e1a] mb-2">8 Working Perfectly</div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-light text-brand-dark">0 Offline</span>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(76,175,80,0.12)' }}>
              <Flask size={18} color="#2e7d2e" />
            </div>
          </div>
        </GlowCard>

        {/* Field Camera */}
        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(217,119,6,0.7) 0%, transparent 70%)', filter: 'blur(30px)', opacity: 0.35 }} />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold text-text-secondary mb-1">Field Camera</div>
              <div className="text-sm font-medium text-[#1a2e1a] mb-2">1 Needs Attention</div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-warning-bg text-warning-text">Lens may be dirty</span>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(217,119,6,0.12)' }}>
              <Camera size={18} color="#D97706" />
            </div>
          </div>
        </GlowCard>

        {/* Fertilizer Tester */}
        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(76,175,80,0.7) 0%, transparent 70%)', filter: 'blur(30px)', opacity: 0.35 }} />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold text-text-secondary mb-1">Fertilizer Tester</div>
              <div className="text-sm font-medium text-[#1a2e1a] mb-2">Ready to Use</div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-light text-brand-dark">All Systems OK</span>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(76,175,80,0.12)' }}>
              <TestTube size={18} color="#2e7d2e" />
            </div>
          </div>
        </GlowCard>
      </div>

      {/* AI Field Camera Feed */}
      <div className="text-base font-semibold text-[#1a2e1a] mb-4">AI Field Camera Feed</div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {cameraFeeds.map((feed) => (
          <div key={feed.id} className="glass-card rounded-2xl p-5 relative overflow-hidden sensor-card" style={{ contentVisibility: 'auto' }}>
            {/* TODO: Replace placeholder with real camera feed integration. */}
            <div className="w-full h-40 rounded-xl mb-3 flex flex-col items-center justify-center gap-2 text-text-secondary relative overflow-hidden border border-dashed" style={{ background: 'rgba(0,0,0,0.03)' }}>
              <Camera size={36} strokeWidth={1.2} className="opacity-60" />
              <span className="text-xs font-medium tracking-wide">Camera Feed</span>
              <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)' }} />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-warning-bg text-warning-text mb-2">
              <span>{feed.warning}</span>
            </div>
            <div className="text-sm font-semibold text-[#1a2e1a] mt-2">Camera #{feed.id} — {feed.sector} ({feed.label})</div>
            <div className="text-xs text-text-secondary mt-1">{feed.description}</div>
          </div>
        ))}
      </div>

      {/* Warning Banner */}
      <div className="flex items-start gap-3 p-4 mb-6 rounded-xl border-l-4 border-warning-text" style={{ background: 'rgba(217,119,6,0.1)' }}>
        <AlertTriangle size={20} color="#D97706" className="shrink-0 mt-0.5" />
        <div className="text-sm text-[#1a2e1a]">
          <span className="font-semibold">Warning:</span> Obstacles detected in Sector B. Clear the stones and avoid the washout hole before driving heavy machinery or tractors through this path.
        </div>
      </div>

      {/* Soil Nutrition Breakdown */}
      <div className="text-base font-semibold text-[#1a2e1a] mb-4">Soil Nutrition Breakdown</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {sectorData.map((sector) => (
          <div key={sector.name} className="glass-card rounded-2xl p-5 relative overflow-hidden sensor-card" style={{ contentVisibility: 'auto' }}>
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(76,175,80,0.5) 0%, transparent 70%)', filter: 'blur(30px)', opacity: 0.25 }} />
            <div className="relative z-10">
              <div className="text-sm font-semibold text-[#1a2e1a] mb-4">{sector.name}</div>
              <div className="grid grid-cols-3 gap-3">
                {['nitrogen', 'phosphorus', 'potassium'].map((key) => {
                  const nutrient = sector.nutrients[key];
                  const shortLabel = key === 'nitrogen' ? 'N' : key === 'phosphorus' ? 'P' : 'K';
                  const fullLabel = key === 'nitrogen' ? 'Nitrogen' : key === 'phosphorus' ? 'Phosphorus' : 'Potassium';
                  const compactLabel = `${fullLabel} (${shortLabel})`;
                  const colors = nutrientColor(nutrient.status);
                  const r = 28;
                  const circumference = 2 * Math.PI * r;
                  const offset = circumference - (nutrient.value / 100) * circumference;
                  const size = 76;
                  const cxcy = size / 2;
                  return (
                    <div key={key} className="flex flex-col items-center gap-1.5">
                      <div className="relative" style={{ width: size, height: size }}>
                        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: `drop-shadow(0 0 4px ${colors.bar}40)` }}>
                          <circle cx={cxcy} cy={cxcy} r={r} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6" />
                          <circle cx={cxcy} cy={cxcy} r={r} fill="none" stroke={colors.bar} strokeWidth="6" strokeLinecap="round"
                            strokeDasharray={circumference} strokeDashoffset={offset} transform={`rotate(-90 ${cxcy} ${cxcy})`}
                            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                          />
                          <text x={cxcy} y={cxcy} textAnchor="middle" dominantBaseline="central" fontSize="16" fontWeight="800" fill="#1a2e1a">{nutrient.value}%</text>
                        </svg>
                      </div>
                      <span className="text-[10px] font-semibold text-primary leading-tight">{compactLabel}</span>
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ background: colors.bg, color: colors.text }}>{nutrient.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fertilizer Tip Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl border-l-4 border-brand" style={{ background: 'rgba(76,175,80,0.1)' }}>
        <Leaf size={20} color="#4caf50" className="shrink-0 mt-0.5" />
        <div className="text-sm text-[#1a2e1a]">
          <span className="font-semibold">Fertilizer Tip:</span> Soil Nitrogen is Low in Sector B. Add a light application of nitrogen-rich fertilizer during your next watering cycle.
        </div>
      </div>
    </>
  );
}
