import { useState, useMemo } from 'react';
import { useRobots } from '../../context/RobotContext';
import { useTasks } from '../../context/TaskContext';
import { useFarms } from '../../context/FarmContext';
import { Droplets, AlertTriangle, Zap, Bug, Thermometer, Cpu, Wind, Tractor, Sprout, Clock } from 'lucide-react';

function Card({ className, style: outerStyle, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className={`analytics-data-card ${className || ''}`}
      style={{ ...outerStyle, transition: 'all 0.25s ease', transform: hovered ? 'translateY(-2px)' : 'translateY(0)', boxShadow: hovered ? '0 8px 20px rgba(20,46,28,0.1)' : undefined }}>
      {children}
    </div>
  );
}

const LABEL_CLS = 'text-xs font-semibold text-[#5A7A5A] mb-1';
const VALUE_CLS = 'text-2xl font-extrabold text-[#111827]';
const CHANGE_CLS = (up) => `text-[10px] leading-relaxed ${up ? 'text-[#16A34A]' : 'text-[#DC2626]'}`;

const cx = 60, cy = 60, donutR = 42, donutStroke = 16;
const donutCirc = 2 * Math.PI * donutR;

function Donut({ segments, centerLabel, centerVal, colors, hovered, setHovered }) {
  let accum = 0;
  const segs = segments.map((s) => {
    const len = (s.pct / 100) * donutCirc;
    const seg = { ...s, len, offset: accum };
    accum -= len;
    return seg;
  });
  return (
    <div className="relative shrink-0">
      <svg viewBox="0 0 120 120" style={{ width: '170px', height: '170px', display: 'block' }}>
        <g style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }}>
          {segs.map((seg, i) => (
            <g key={seg.label} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              <circle cx={cx} cy={cy} r={donutR} fill="none" stroke={seg.color} strokeWidth={donutStroke}
                strokeDasharray={`${seg.len} ${donutCirc - seg.len}`} strokeDashoffset={seg.offset} strokeLinecap="round"
                opacity={hovered === null || hovered === i ? 1 : 0.25}
                style={{ cursor: 'pointer', pointerEvents: 'stroke', strokeWidth: hovered === i ? 19 : 16, transition: 'stroke-width 0.15s ease-out, opacity 0.2s ease' }} />
            </g>
          ))}
        </g>
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
        <div className="text-[#6B7280] text-[10px] font-medium">{centerLabel}</div>
        <div className="text-[#111827] text-xl font-extrabold mt-0.5">{centerVal}</div>
      </div>
    </div>
  );
}

function Legend({ items, hovered, setHovered }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '130px' }}>
      {items.map((item, i) => (
        <div key={item.label} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.15s ease', opacity: hovered === null || hovered === i ? 1 : 0.3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.color, display: 'inline-block' }} />
            <span style={{ fontSize: '11px', fontWeight: 500, color: '#4B5563' }}>{item.label}</span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#111827' }}>{item.val}</span>
        </div>
      ))}
    </div>
  );
}

function MiniBar({ pct, color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
      <span style={{ fontSize: '11px', fontWeight: 500, color: '#4B5563', minWidth: '70px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      <div style={{ flex: 1, height: '18px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: '11px', fontWeight: 700, color: '#111827', minWidth: '32px', textAlign: 'right' }}>{pct}%</span>
    </div>
  );
}

export default function Analytics() {
  const { robots } = useRobots();
  const { tasks } = useTasks();
  const { farms } = useFarms();
  const [hoveredRui, setHoveredRui] = useState(null);
  const [hoveredCrop, setHoveredCrop] = useState(null);
  const [hoveredStress, setHoveredStress] = useState(null);
  const [hoveredWue, setHoveredWue] = useState(null);

  const totalRobots = robots.length;
  const activeRobots = robots.filter((r) => r.status === 'Active').length;
  const idleRobots = robots.filter((r) => r.status === 'Idle').length;
  const lowBattRobots = robots.filter((r) => r.battery < 30).length;
  const ruiPct = totalRobots > 0 ? Math.round((activeRobots / totalRobots) * 100) : 0;

  const ruiSegments = [
    { label: 'Working Hours', pct: totalRobots > 0 ? Math.round((activeRobots / totalRobots) * 100) : 0, color: '#4caf50' },
    { label: 'Charging Cycles', pct: totalRobots > 0 ? Math.round((lowBattRobots / totalRobots) * 100) : 0, color: '#F59E0B' },
    { label: 'Idle Gaps', pct: totalRobots > 0 ? Math.round(((totalRobots - activeRobots - lowBattRobots) / totalRobots) * 100) : 0, color: '#EF4444' },
  ];

  const workingHours = activeRobots * 168;
  const chargingHours = lowBattRobots * 40;
  const idleHours = (totalRobots - activeRobots) * 120;

  const taskCategories = useMemo(() => {
    const groups = {};
    tasks.forEach((t) => {
      const type = t.type || 'Other';
      if (!groups[type]) groups[type] = { total: 0, completed: 0, pending: 0, inProgress: 0, avgDays: 0 };
      groups[type].total++;
      if (t.status === 'Completed') groups[type].completed++;
      else if (t.status === 'Pending') groups[type].pending++;
      else if (t.status === 'In Progress') groups[type].inProgress++;
    });
    return Object.entries(groups).map(([type, data]) => ({
      type,
      total: data.total,
      completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      pendingRate: data.total > 0 ? Math.round((data.pending / data.total) * 100) : 0,
      color: type === 'Irrigation' ? '#06B6D4' : type === 'Fertilizer' ? '#8B5CF6' : type === 'Inspection' ? '#F59E0B' : type === 'Maintenance' ? '#6366F1' : type === 'Harvest' ? '#EC4899' : type === 'Planting' ? '#10B981' : '#6B7280',
    }));
  }, [tasks]);

  const yieldForecast = useMemo(() => {
    const yieldPerAcre = { Wheat: 3.2, Barley: 2.8, Corn: 4.5, Soybeans: 2.9, Apples: 8.0, Pears: 6.5, Rice: 5.0, Strawberries: 10.0, Tomatoes: 12.0, Alfalfa: 6.0, Hay: 5.5 };
    const totals = {};
    farms.forEach((f) => {
      const sizeNum = parseInt(f.size) || 100;
      const types = f.cropTypes.split(', ').map((s) => s.trim());
      types.forEach((t) => {
        const perCrop = sizeNum / types.length;
        const yieldTon = yieldPerAcre[t] || 3.0;
        totals[t] = (totals[t] || 0) + perCrop * yieldTon;
      });
    });
    const entries = Object.entries(totals);
    const totalTons = entries.reduce((s, [, v]) => s + v, 0);
    const segments = entries.map(([label, val], i) => ({
      label, pct: totalTons > 0 ? Math.round((val / totalTons) * 100) : 0,
      color: ['#4caf50', '#A7F3D0', '#F59E0B', '#6366F1', '#EC4899', '#06B6D4', '#8B5CF6'][i % 7],
      tons: Math.round(val * 10) / 10,
    })).sort((a, b) => b.pct - a.pct);
    return { segments, totalTons: Math.round(totalTons * 10) / 10 };
  }, [farms]);

  const cropStressScores = useMemo(() => {
    const soilRisk = { Clay: 30, Loam: 20, Sandy: 50, 'Silt': 25, 'Peat': 35 };
    return farms.map((f) => {
      const sizeNum = parseInt(f.size) || 100;
      const devices = parseInt(f.devices) || 1;
      const base = soilRisk[f.soil] || 30;
      const sizeFactor = Math.min(sizeNum / 100, 2);
      const deviceBonus = devices * 5;
      const score = Math.round(Math.max(5, Math.min(95, base * sizeFactor - deviceBonus + 25)));
      return { name: f.name, score, soil: f.soil, devices, crop: f.crop, color: score > 70 ? '#EF4444' : score > 45 ? '#F59E0B' : '#4caf50' };
    }).sort((a, b) => b.score - a.score);
  }, [farms]);

  const avgStress = cropStressScores.length > 0 ? Math.round(cropStressScores.reduce((s, f) => s + f.score, 0) / cropStressScores.length) : 0;

  const wueMetrics = useMemo(() => {
    const irrigationTasks = tasks.filter((t) => t.type === 'Irrigation');
    const totalIrrig = irrigationTasks.length;
    const completedIrrig = irrigationTasks.filter((t) => t.status === 'Completed').length;
    return farms.map((f) => {
      const sizeNum = parseInt(f.size) || 100;
      const farmTasks = irrigationTasks.filter((t) => t.farm === f.name);
      const efficiency = Math.round(Math.max(40, Math.min(98, 75 - (sizeNum / 30) + farmTasks.length * 3)));
      return { name: f.name, efficiency, size: sizeNum, tasks: farmTasks.length, color: efficiency > 75 ? '#4caf50' : efficiency > 55 ? '#F59E0B' : '#EF4444' };
    }).sort((a, b) => a.efficiency - b.efficiency);
  }, [farms, tasks]);

  const avgWue = wueMetrics.length > 0 ? Math.round(wueMetrics.reduce((s, f) => s + f.efficiency, 0) / wueMetrics.length) : 0;

  const ecoFootprint = useMemo(() => {
    const totalActiveRobots = activeRobots;
    const totalIdleRobots = idleRobots;
    const carbonOffset = Math.round(totalActiveRobots * 12.4 * 10) / 10;
    const fuelSaved = Math.round(totalActiveRobots * 45 * 10) / 10;
    const energyEfficiency = totalActiveRobots > 0 ? Math.round(85 - (totalIdleRobots / Math.max(totalRobots, 1)) * 20) : 0;
    return { carbonOffset, fuelSaved, energyEfficiency };
  }, [activeRobots, idleRobots, totalRobots]);

  const priorityFeed = useMemo(() => {
    const alerts = [];
    robots.filter((r) => r.battery < 30).forEach((r) => {
      alerts.push({ icon: Zap, text: `${r.name} battery critically low at ${r.battery}%. Assign charging station immediately.`, priority: 'high', farm: r.farm });
    });
    cropStressScores.filter((f) => f.score > 70).forEach((f) => {
      alerts.push({ icon: Thermometer, text: `${f.name} ${f.crop} stress score at ${f.score}/100 (${f.soil} soil). Recommend soil amendment and targeted irrigation.`, priority: 'high', farm: f.name });
    });
    tasks.filter((t) => t.priority === 'High' && t.status === 'Pending').forEach((t) => {
      alerts.push({ icon: AlertTriangle, text: `High-priority "${t.title}" (${t.type}) assigned to ${t.assignedTo} is still pending on ${t.farm}.`, priority: 'high', farm: t.farm });
    });
    wueMetrics.filter((f) => f.efficiency < 55).forEach((f) => {
      alerts.push({ icon: Droplets, text: `${f.name} water efficiency at ${f.efficiency}%. Inspect irrigation lines and schedule drip maintenance.`, priority: 'medium', farm: f.name });
    });
    const idleFleet = robots.filter((r) => r.status === 'Idle');
    idleFleet.forEach((r) => {
      alerts.push({ icon: Clock, text: `${r.name} has been idle on ${r.farm}. Consider reassigning to pending ${tasks.filter((t) => t.status === 'Pending').length} tasks.`, priority: 'medium', farm: r.farm });
    });
    return alerts.slice(0, 6);
  }, [robots, cropStressScores, tasks, wueMetrics]);

  return (
    <>
      <div className="mb-6">
        <div className="text-2xl font-bold text-[#111827]">Analytics</div>
        <div className="text-sm text-[#5A7A5A] mt-1">Intelligent telemetry & predictive agronomy brain</div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className={LABEL_CLS}>Robot Utilization Index</div>
              <div className={VALUE_CLS}>{ruiPct}%</div>
              <div className={CHANGE_CLS(true)}>↑ +{Math.round(ruiPct * 0.08)}% from last cycle</div>
            </div>
            <div style={{ background: 'rgba(46,125,50,0.1)', borderRadius: '10px', padding: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={18} color="#2e7d2e" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className={LABEL_CLS}>Yield Forecast</div>
              <div className={VALUE_CLS}>{yieldForecast.totalTons}</div>
              <div className="text-[10px] leading-relaxed text-[#16A34A]">↑ +6.8% vs previous season</div>
            </div>
            <div style={{ background: 'rgba(46,125,50,0.1)', borderRadius: '10px', padding: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sprout size={18} color="#2e7d2e" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className={LABEL_CLS}>Crop Stress Index</div>
              <div className={VALUE_CLS}>{avgStress}<span className="text-sm font-medium text-[#5A7A5A]">/100</span></div>
              <div className={CHANGE_CLS(avgStress < 50)}>{avgStress < 50 ? '↓ Healthy' : '↑ Monitor'} across {farms.length} farms</div>
            </div>
            <div style={{ background: 'rgba(46,125,50,0.1)', borderRadius: '10px', padding: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bug size={18} color="#2e7d2e" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className={LABEL_CLS}>Water Use Efficiency</div>
              <div className={VALUE_CLS}>{avgWue}<span className="text-sm font-medium text-[#5A7A5A]">%</span></div>
              <div className={CHANGE_CLS(avgWue > 60)}>{avgWue > 60 ? '↑ Efficient' : '↓ Needs attention'}</div>
            </div>
            <div style={{ background: 'rgba(46,125,50,0.1)', borderRadius: '10px', padding: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Droplets size={18} color="#2e7d2e" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card className="p-4" style={{ minHeight: '240px' }}>
          <div className="text-sm font-semibold text-[#111827] mb-3">Robot Utilization Index</div>
          <div className="flex items-center gap-4" style={{ minHeight: '160px' }}>
            <Donut segments={ruiSegments} centerLabel="Total Fleet" centerVal={totalRobots} hovered={hoveredRui} setHovered={setHoveredRui} />
            <div>
              <Legend items={ruiSegments.map((s) => ({ ...s, val: s.pct + '%' }))} hovered={hoveredRui} setHovered={setHoveredRui} />
              <div style={{ marginTop: '10px', padding: '8px 10px', background: '#F9FAFB', borderRadius: '6px', border: '1px solid #F3F4F6' }}>
                <div className="text-[10px] text-[#5A7A5A] font-medium">Working: {workingHours}h | Charging: {chargingHours}h | Idle: {idleHours}h</div>
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4" style={{ minHeight: '240px' }}>
          <div className="text-sm font-semibold text-[#111827] mb-3">Task Bottleneck Matrix</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {taskCategories.map((cat) => (
              <div key={cat.type}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: cat.color, display: 'inline-block' }} />
                    <span style={{ fontSize: '11px', fontWeight: 500, color: '#111827' }}>{cat.type}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#5A7A5A' }}>{cat.completed}/{cat.total} done</span>
                </div>
                <div style={{ display: 'flex', gap: '2px', height: '16px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ flex: cat.completionRate, background: cat.color, minWidth: cat.completionRate > 0 ? '4px' : 0, transition: 'flex 0.3s ease' }} />
                  <div style={{ flex: cat.pendingRate, background: '#E5E7EB', minWidth: cat.pendingRate > 0 ? '4px' : 0 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card className="p-4" style={{ minHeight: '240px' }}>
          <div className="text-sm font-semibold text-[#111827] mb-3">Yield Forecast by Crop</div>
          <div className="flex items-center gap-4" style={{ minHeight: '160px' }}>
            <Donut segments={yieldForecast.segments.map((s) => ({ label: s.label, pct: s.pct, color: s.color }))} centerLabel="Projected" centerVal={`${yieldForecast.totalTons}t`} hovered={hoveredCrop} setHovered={setHoveredCrop} />
            <div>
              <Legend items={yieldForecast.segments.map((s) => ({ ...s, val: s.tons + 't' }))} hovered={hoveredCrop} setHovered={setHoveredCrop} />
            </div>
          </div>
        </Card>
        <Card className="p-4" style={{ minHeight: '240px' }}>
          <div className="text-sm font-semibold text-[#111827] mb-3">Crop Stress Index by Farm</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {cropStressScores.map((f, i) => (
              <div key={f.name} onMouseEnter={() => setHoveredStress(i)} onMouseLeave={() => setHoveredStress(null)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: hoveredStress === null || hoveredStress === i ? 1 : 0.3, transition: 'opacity 0.15s ease' }}>
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#4B5563', minWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</span>
                <div style={{ flex: 1, height: '16px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ width: `${f.score}%`, height: '100%', background: f.color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: f.score > 70 ? '#DC2626' : f.score > 45 ? '#D97706' : '#16A34A', minWidth: '28px', textAlign: 'right' }}>{f.score}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-4" style={{ minHeight: '220px' }}>
          <div className="text-sm font-semibold text-[#111827] mb-3">Water Use Efficiency</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {wueMetrics.map((f, i) => (
              <MiniBar key={f.name} label={f.name} pct={f.efficiency} color={f.color} />
            ))}
          </div>
        </Card>
        <Card className="p-4" style={{ minHeight: '220px' }}>
          <div className="text-sm font-semibold text-[#111827] mb-3">Automation Fleet Eco-Footprint</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', height: 'calc(100% - 24px)' }}>
            <div className="flex items-center gap-4 p-3" style={{ background: '#F9FAFB', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
              <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: '8px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wind size={18} color="#10B981" /></div>
              <div><div className="text-[10px] font-medium text-[#5A7A5A]">Carbon Offset</div><div className="text-base font-bold text-[#111827]">{ecoFootprint.carbonOffset} tCO₂</div></div>
            </div>
            <div className="flex items-center gap-4 p-3" style={{ background: '#F9FAFB', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
              <div style={{ background: 'rgba(99,102,241,0.1)', borderRadius: '8px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Tractor size={18} color="#6366F1" /></div>
              <div><div className="text-[10px] font-medium text-[#5A7A5A]">Fuel Saved</div><div className="text-base font-bold text-[#111827]">{ecoFootprint.fuelSaved} L</div></div>
            </div>
            <div className="flex items-center gap-4 p-3" style={{ background: '#F9FAFB', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
              <div style={{ background: 'rgba(245,158,11,0.1)', borderRadius: '8px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={18} color="#F59E0B" /></div>
              <div><div className="text-[10px] font-medium text-[#5A7A5A]">Energy Efficiency</div><div className="text-base font-bold text-[#111827]">{ecoFootprint.energyEfficiency}%</div></div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Cpu size={16} color="#2e7d2e" />
          <span className="text-sm font-semibold text-[#111827]">AI Priority Command Feed</span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(46,125,50,0.1)', color: '#2e7d2e', marginLeft: 'auto' }}>Live</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {priorityFeed.length === 0 && (
            <div className="text-sm text-[#5A7A5A] py-4 text-center">All systems nominal — no priority actions required.</div>
          )}
          {priorityFeed.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3" style={{ background: item.priority === 'high' ? 'rgba(239,68,68,0.04)' : 'rgba(245,158,11,0.04)', borderRadius: '8px', border: `1px solid ${item.priority === 'high' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)'}` }}>
              <div className="mt-0.5 shrink-0" style={{ color: item.priority === 'high' ? '#DC2626' : '#D97706' }}><item.icon size={14} /></div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-[#111827] leading-relaxed">{item.text}</div>
                <div className="text-[10px] text-[#5A7A5A] mt-1">{item.farm}</div>
              </div>
              <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded shrink-0" style={{ background: item.priority === 'high' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: item.priority === 'high' ? '#DC2626' : '#D97706' }}>{item.priority}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
