import { useState, useMemo, useRef, useEffect } from 'react';
import { useRobots } from '../../context/RobotContext';
import {
  mockSensorReadings, mockHistoryData, lastSynced,
} from '../../data/mockSensorData';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Thermometer, Droplets, Waves, Radar, MapPin, Cpu,
  ArrowLeft, Wifi, WifiOff, RefreshCw,
} from 'lucide-react';

function GlowCard({ className, style: outerStyle, onClick, children }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={className}
      style={{
        ...outerStyle,
        cursor: onClick ? 'pointer' : undefined,
        transition: 'all 0.25s ease',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 8px 24px rgba(26,46,26,0.15)' : '0 2px 12px rgba(46,125,50,0.08)',
      }}
    >
      {children}
    </div>
  );
}

function Select({ options, value, onChange, placeholder, width }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div className="relative" ref={ref} style={width ? { width } : undefined}>
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-gray-300 w-full flex items-center justify-between cursor-pointer hover:border-gray-400"
        style={{ outline: 'none', boxShadow: open ? '0 0 0 2px rgba(52,199,89,0.3)' : 'none', transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)' }}
      >
        <span className={value !== 'All' ? 'text-primary' : 'text-text-placeholder'}>{value || placeholder || 'Select...'}</span>
        <i className={`ph ph-caret-down text-text-placeholder text-sm transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-[100] w-full mt-1 overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            border: '1px solid rgba(255,255,255,0.6)',
            borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
          {options.map((opt) => {
            const selected = opt === value;
            return (
              <div key={opt} onClick={() => { onChange(opt); setOpen(false); }}
                style={{
                  padding: '12px 16px', fontSize: '14px',
                  color: selected ? '#4caf50' : '#1d1d1f',
                  background: selected ? 'rgba(76,175,80,0.12)' : 'transparent',
                  cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
                onMouseEnter={(e) => {
                  if (!selected) { e.currentTarget.style.background = 'rgba(76,175,80,0.12)'; e.currentTarget.style.color = '#4caf50'; }
                }}
                onMouseLeave={(e) => {
                  if (!selected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1d1d1f'; }
                }}
              >
                <span>{opt}</span>
                {selected && <span style={{ color: '#4caf50', fontSize: '14px', fontWeight: 600 }}>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const tempColor = (t) => {
  if (t < 15) return '#3B82F6';
  if (t <= 30) return '#10B981';
  return '#EF4444';
};

const humidityColor = (h) => {
  if (h >= 40 && h <= 70) return '#10B981';
  if (h > 70 && h <= 85) return '#F59E0B';
  return '#EF4444';
};

const soilColor = (s) => {
  if (s < 20) return '#EF4444';
  if (s <= 60) return '#10B981';
  return '#3B82F6';
};

const soilLabel = (s) => {
  if (s < 20) return 'Too Dry';
  if (s <= 60) return 'Optimal';
  return 'Too Wet';
};

const ultrasonicStatus = (u) => {
  if (u < 30) return { label: 'Obstacle Detected', color: '#EF4444', icon: '⚠' };
  if (u <= 200) return { label: 'Clear Path', color: '#10B981', icon: '✓' };
  return { label: 'No Reading', color: '#9CA3AF', icon: '—' };
};

function SemiGauge({ value, max, unit, label, color, size = 160 }) {
  const ratio = Math.min(value / max, 1);
  const bgColor = '#E5E7EB';
  const cx = size / 2, cy = size / 2 + 6, r = size / 2 - 24;
  const circumference = Math.PI * r;
  const offset = circumference * (1 - ratio);
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={bgColor} strokeWidth="12" strokeLinecap="round" />
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize="20" fontWeight="800" fill="#111827">{value}{unit}</text>
      </svg>
      <span className="text-[10px] font-medium text-text-secondary -mt-1">{label}</span>
    </div>
  );
}

function SoilGauge({ value, size = 180 }) {
  const ratio = Math.min(value / 100, 1);
  const color = soilColor(value);
  const bgColor = '#E5E7EB';
  const cx = size / 2, cy = size / 2, r = size / 2 - 20;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - ratio);
  const optStart = (20 / 100) * circumference;
  const optEnd = (60 / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={bgColor} strokeWidth="14" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(16,185,129,0.15)" strokeWidth="14"
          strokeDasharray={`${optEnd - optStart} ${circumference}`} strokeDashoffset={-optStart} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset} transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="28" fontWeight="800" fill="#111827">{value}%</text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize="10" fontWeight="600" fill="#5A7A5A">{soilLabel(value)}</text>
      </svg>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(76,175,80,0.12)', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}>
      <div style={{ fontWeight: 600, color: '#111827', marginBottom: 2 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, fontWeight: 500 }}>{p.name}: {p.value}{p.name === 'Temperature' ? '°C' : '%'}</div>
      ))}
    </div>
  );
}

function DistanceIndicator({ distance }) {
  const rings = [
    { max: 30, color: '#EF4444', label: 'Obstacle' },
    { max: 100, color: '#F59E0B', label: 'Caution' },
    { max: 200, color: '#10B981', label: 'Clear' },
    { max: Infinity, color: '#9CA3AF', label: 'Far' },
  ];
  const activeRing = rings.find((r) => distance <= r.max) || rings[rings.length - 1];
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: 140, height: 140 }}>
        {[120, 90, 60, 30].map((r, i) => (
          <div key={i}
            style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: r, height: r, borderRadius: '50%',
              border: `1.5px solid ${distance <= (4 - i) * 50 + 30 ? activeRing.color : 'rgba(0,0,0,0.06)'}`,
              transition: 'border-color 0.3s ease',
            }}
          />
        ))}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: activeRing.color }}>{distance}</div>
          <div style={{ fontSize: 10, color: '#5A7A5A', fontWeight: 500 }}>cm</div>
        </div>
      </div>
      <span className="text-[11px] font-semibold px-3 py-1 rounded-full"
        style={{ background: `${activeRing.color}15`, color: activeRing.color }}>
        {activeRing.icon || ''} {activeRing.label}
      </span>
    </div>
  );
}

const sensorStatusOk = (readings) => readings !== undefined && readings !== null;

export default function SensorsDetails() {
  const { robots } = useRobots();
  const [selectedRobot, setSelectedRobot] = useState(null);
  const [lastSyncStr] = useState(() => {
    const d = lastSynced;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  const [robotNameFilter, setRobotNameFilter] = useState('All');

  const readingFor = (robotId) => mockSensorReadings[robotId];

  const fleetStats = useMemo(() => {
    const online = robots.filter((r) => r.status !== 'Offline').length;
    const temps = robots
      .filter((r) => r.status !== 'Offline')
      .map((r) => readingFor(r.id)?.dht11?.temperature)
      .filter(Boolean);
    const avgTemp = temps.length > 0
      ? Math.round((temps.reduce((s, v) => s + v, 0) / temps.length) * 10) / 10
      : 0;
    const moistures = robots
      .filter((r) => r.status !== 'Offline')
      .map((r) => readingFor(r.id)?.soilMoisture)
      .filter(Boolean);
    const avgMoisture = moistures.length > 0
      ? Math.round((moistures.reduce((s, v) => s + v, 0) / moistures.length) * 10) / 10
      : 0;
    const obstacles = robots.filter((r) => {
      const u = readingFor(r.id)?.ultrasonic;
      return u !== undefined && u < 30;
    }).length;
    return { online: `${online}/${robots.length}`, avgTemp, avgMoisture, obstacles, total: robots.length };
  }, [robots]);

  const robotNameOptions = useMemo(() => ['All', ...new Set(robots.map(r => r.name).filter(Boolean))], [robots]);

  const filteredRobots = useMemo(() => {
    if (robotNameFilter === 'All') return robots;
    return robots.filter(r => r.name === robotNameFilter);
  }, [robots, robotNameFilter]);

  if (!robots || robots.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-text-secondary">No robot data available.</div>
      </div>
    );
  }

  if (selectedRobot) {
    const r = selectedRobot;
    const rId = r.id;
    const readings = readingFor(rId);
    const historyData = mockHistoryData[rId] || [];
    const isOnline = r.status !== 'Offline';

    return (
      <>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setSelectedRobot(null)}
            style={{ background: 'rgba(76,175,80,0.1)', border: 'none', borderRadius: '10px', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease', color: '#2e7d2e' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(76,175,80,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(76,175,80,0.1)'; }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="text-2xl font-bold text-primary">{r.name}</div>
            <div className="text-sm text-text-secondary mt-0.5">{r.id} · {r.farm} · {r.model}</div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5"
              style={{ background: isOnline ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: isOnline ? '#10B981' : '#EF4444' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: isOnline ? '#10B981' : '#EF4444' }} />
              {r.status}
            </span>
            <span className="px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5"
              style={{ background: 'rgba(76,175,80,0.1)', color: '#2e7d2e' }}>
              <Cpu size={14} /> Battery {r.battery}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
            <div className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
              <Thermometer size={16} color="#2e7d2e" /> DHT11 — Temperature & Humidity
            </div>
            {isOnline && readings ? (
              <div className="flex items-center justify-around">
                <SemiGauge value={readings.dht11.temperature} max={50} unit="°C" label="Temperature" color={tempColor(readings.dht11.temperature)} />
                <SemiGauge value={readings.dht11.humidity} max={100} unit="%" label="Humidity" color={humidityColor(readings.dht11.humidity)} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[100px]">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: 'rgba(156,163,175,0.12)', color: '#9CA3AF' }}>Sensor Offline</span>
              </div>
            )}
          </GlowCard>

          <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
            <div className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
              <Droplets size={16} color="#2e7d2e" /> Soil Moisture
            </div>
            {isOnline && readings ? (
              <div className="flex justify-center">
                <SoilGauge value={readings.soilMoisture} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[180px]">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: 'rgba(156,163,175,0.12)', color: '#9CA3AF' }}>Sensor Offline</span>
              </div>
            )}
          </GlowCard>

          <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
            <div className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
              <Radar size={16} color="#2e7d2e" /> Ultrasonic
            </div>
            {isOnline && readings ? (
              <div className="flex justify-center">
                <DistanceIndicator distance={readings.ultrasonic} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[180px]">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: 'rgba(156,163,175,0.12)', color: '#9CA3AF' }}>Sensor Offline</span>
              </div>
            )}
          </GlowCard>

          <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
            <div className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
              <MapPin size={16} color="#2e7d2e" /> WiFi Location
            </div>
            {isOnline && readings ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                  <Wifi size={12} /> Tracking Active
                </div>
                <div className="p-4 rounded-xl w-full text-center"
                  style={{ background: 'rgba(0,0,0,0.03)', border: '1px dashed rgba(0,0,0,0.08)' }}>
                  <MapPin size={24} color="#2e7d2e" className="mx-auto mb-2" />
                  <div className="text-sm font-semibold text-primary">
                    {readings.wifiLocation.lat.toFixed(4)}, {readings.wifiLocation.lng.toFixed(4)}
                  </div>
                  <div className="text-[10px] text-text-secondary mt-1">{readings.wifiLocation.label}</div>
                </div>
                <div className="text-[9px] text-text-secondary">// TODO: Replace with real interactive map (Leaflet.js or Google Maps)</div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[180px]">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: 'rgba(156,163,175,0.12)', color: '#9CA3AF' }}>Sensor Offline</span>
              </div>
            )}
          </GlowCard>
        </div>

        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-primary">Sensor Reading History</div>
            <div className="text-[9px] text-text-secondary">// TODO: Replace with real time-series data from sensor API</div>
          </div>
          {historyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={historyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="temp" domain={[10, 40]} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="moisture" domain={[0, 100]} orientation="right" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(val) => <span style={{ color: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 500 }}>{val}</span>}
                />
                <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke="#EF4444" strokeWidth={2.5} dot={false} name="Temperature" activeDot={{ r: 4, fill: '#EF4444', stroke: '#fff', strokeWidth: 2 }} />
                <Line yAxisId="moisture" type="monotone" dataKey="soilMoisture" stroke="#10B981" strokeWidth={2.5} dot={false} name="Soil Moisture" activeDot={{ r: 4, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-sm text-text-secondary">No history data available</div>
          )}
        </GlowCard>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(76,175,80,0.12)' }}>
          <Cpu size={22} color="#2e7d2e" />
        </div>
        <div>
          <div className="text-2xl font-bold text-primary">Robot Sensor Details</div>
          <div className="text-sm text-text-secondary mt-1">Live sensor readings from every robot in the fleet</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <GlowCard className="glass-card rounded-2xl p-4" style={{ contentVisibility: 'auto' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-text-secondary mb-1">Sensors Online</div>
              <div className="text-xl font-extrabold text-primary">{fleetStats.online}</div>
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(76,175,80,0.12)' }}>
              <Wifi size={16} color="#10B981" />
            </div>
          </div>
        </GlowCard>
        <GlowCard className="glass-card rounded-2xl p-4" style={{ contentVisibility: 'auto' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-text-secondary mb-1">Avg Temperature</div>
              <div className="text-xl font-extrabold text-primary">{fleetStats.avgTemp}°C</div>
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(76,175,80,0.12)' }}>
              <Thermometer size={16} color="#2e7d2e" />
            </div>
          </div>
        </GlowCard>
        <GlowCard className="glass-card rounded-2xl p-4" style={{ contentVisibility: 'auto' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-text-secondary mb-1">Avg Soil Moisture</div>
              <div className="text-xl font-extrabold text-primary">{fleetStats.avgMoisture}%</div>
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(76,175,80,0.12)' }}>
              <Droplets size={16} color="#2e7d2e" />
            </div>
          </div>
        </GlowCard>
        <GlowCard className="glass-card rounded-2xl p-4" style={{ contentVisibility: 'auto' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-text-secondary mb-1">Obstacles Detected</div>
              <div className="text-xl font-extrabold text-primary">{fleetStats.obstacles}</div>
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(239,68,68,0.12)' }}>
              <Radar size={16} color="#EF4444" />
            </div>
          </div>
        </GlowCard>
        <GlowCard className="glass-card rounded-2xl p-4" style={{ contentVisibility: 'auto' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold text-text-secondary mb-1">Last Synced</div>
              <div className="text-xl font-extrabold text-primary">{lastSyncStr}</div>
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(76,175,80,0.12)' }}>
              <RefreshCw size={16} color="#2e7d2e" />
            </div>
          </div>
        </GlowCard>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div className="text-sm font-semibold text-primary">Robot Sensor Grid ({filteredRobots.length})</div>
        <div>
          <div style={{ color: '#6b7280', fontSize: '11px', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Robot</div>
          <Select options={robotNameOptions} value={robotNameFilter} onChange={setRobotNameFilter} width="200px" />
        </div>
      </div>
      {robotNameFilter !== 'All' && (
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
          Showing {filteredRobots.length} of {robots.length} robots
          <span onClick={() => setRobotNameFilter('All')}
            style={{ marginLeft: '12px', color: '#4caf50', cursor: 'pointer', fontSize: '11px', fontWeight: 600, textDecoration: 'underline' }}
          >Clear Filter</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRobots.map((r) => {
          const rId = r.id;
          const readings = readingFor(rId);
          const isOnline = r.status !== 'Offline';
          const us = readings ? ultrasonicStatus(readings.ultrasonic) : null;

          return (
            <GlowCard key={r.id} onClick={() => setSelectedRobot(r)}
              className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto', cursor: 'pointer' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-primary truncate">{r.name}</div>
                  <div className="text-[10px] text-text-secondary truncate mt-0.5">{r.id} · {r.farm}</div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full shrink-0 ml-2"
                  style={{ background: r.status === 'Active' ? '#10B981' : r.status === 'Idle' ? '#F59E0B' : '#EF4444' }} />
              </div>

              {!isOnline ? (
                <div className="flex items-center justify-center h-[120px]">
                  <div className="flex flex-col items-center gap-1.5">
                    <WifiOff size={20} color="#9CA3AF" />
                    <span className="text-[11px] font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(156,163,175,0.12)', color: '#9CA3AF' }}>Sensor Offline</span>
                  </div>
                </div>
              ) : readings ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider">DHT11</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold" style={{ color: tempColor(readings.dht11.temperature) }}>
                        <Thermometer size={12} className="inline mr-0.5" style={{ verticalAlign: 'middle' }} />{readings.dht11.temperature}°C
                      </span>
                      <span className="text-[11px] font-bold" style={{ color: humidityColor(readings.dht11.humidity) }}>
                        <Droplets size={12} className="inline mr-0.5" style={{ verticalAlign: 'middle' }} />{readings.dht11.humidity}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider">Soil Moisture</span>
                      <span className="text-[10px] font-bold" style={{ color: soilColor(readings.soilMoisture) }}>{readings.soilMoisture}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.06)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${readings.soilMoisture}%`, background: soilColor(readings.soilMoisture) }} />
                    </div>
                    <div className="text-[9px] font-medium mt-0.5" style={{ color: soilColor(readings.soilMoisture) }}>{soilLabel(readings.soilMoisture)}</div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                    <div className="flex items-center gap-1.5">
                      <Radar size={12} color="#5A7A5A" />
                      <span className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider">Ultrasonic</span>
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: us?.color }}>{us?.icon} {readings.ultrasonic}cm</span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <MapPin size={11} color="#5A7A5A" />
                    <span className="text-[9px] text-text-secondary">({readings.wifiLocation.lat.toFixed(2)}, {readings.wifiLocation.lng.toFixed(2)})</span>
                    <span className="text-[8px] font-semibold ml-auto" style={{ color: '#10B981' }}>📍 Active</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[120px]">
                  <span className="text-[11px] text-text-secondary">No sensor data</span>
                </div>
              )}
            </GlowCard>
          );
        })}
      </div>
    </>
  );
}
