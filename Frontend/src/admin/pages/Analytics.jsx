import { useState, useMemo } from 'react';
import { useRobots } from '../../context/RobotContext';
import { useTasks } from '../../context/TaskContext';
import { useFarms } from '../../context/FarmContext';
import { Clock, Sprout, Bug, Droplets, Zap, Thermometer, AlertTriangle, Wind, Tractor, Cpu } from 'lucide-react';

function Card({ children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="analytics-data-card"
      style={{ transition: 'all 0.25s ease', transform: hovered ? 'translateY(-2px)' : 'translateY(0)', boxShadow: hovered ? '0 8px 20px rgba(20,46,28,0.1)' : undefined }}>
      {children}
    </div>
  );
}

const CHART_SIZE = { height: '260px', minHeight: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', boxSizing: 'border-box' };
const CHART_INNER = { display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '28px', width: '100%', flex: 1, minHeight: 0 };

const cx = 60, cy = 60, donutR = 42, donutStroke = 16;
const donutCirc = 2 * Math.PI * donutR;

function Donut({ segments, centerLabel, centerVal, hovered, setHovered }) {
  let accum = 0;
  const segs = segments.map((s) => {
    const len = (s.pct / 100) * donutCirc;
    const seg = { ...s, len, offset: accum };
    accum -= len;
    return seg;
  });
  return (
    <div className="relative shrink-0">
      <svg viewBox="0 0 120 120" style={{ width: '200px', height: '200px', display: 'block' }}>
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
        <div style={{ color: '#6B7280', fontSize: '12px', fontWeight: 500 }}>{centerLabel}</div>
        <div style={{ color: '#111827', fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>{centerVal}</div>
      </div>
    </div>
  );
}

function Legend({ items, hovered, setHovered }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '160px', width: '100%' }}>
      {items.map((item, i) => (
        <div key={item.label} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', borderRadius: '4px', transition: 'background 0.15s ease', cursor: 'pointer', opacity: hovered === null || hovered === i ? 1 : 0.25 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, display: 'inline-block' }} />
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#4B5563' }}>{item.label}</span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>{item.val}</span>
        </div>
      ))}
    </div>
  );
}

function StressBar({ name, score, color, onEnter, onLeave, dimmed }) {
  return (
    <div onMouseEnter={onEnter} onMouseLeave={onLeave}
      style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: dimmed ? 0.25 : 1, transition: 'opacity 0.15s ease' }}>
      <span style={{ fontSize: '11px', fontWeight: 500, color: '#4B5563', minWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
      <div style={{ flex: 1, height: '16px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(score, 100)}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: '11px', fontWeight: 700, color: score > 70 ? '#DC2626' : score > 45 ? '#D97706' : '#16A34A', minWidth: '28px', textAlign: 'right' }}>{score}</span>
    </div>
  );
}

function WueBar({ name, pct, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
      <span style={{ fontSize: '11px', fontWeight: 500, color: '#4B5563', minWidth: '70px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
      <div style={{ flex: 1, height: '18px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: '11px', fontWeight: 700, color: '#111827', minWidth: '32px', textAlign: 'right' }}>{pct}%</span>
    </div>
  );
}

const timeRanges = ['Today', 'Week', 'Month'];

export default function Analytics() {
  const { robots } = useRobots();
  const { tasks } = useTasks();
  const { farms } = useFarms();
  const [timeRange, setTimeRange] = useState('Week');
  const [hoveredRui, setHoveredRui] = useState(null);
  const [hoveredCrop, setHoveredCrop] = useState(null);
  const [hoveredStress, setHoveredStress] = useState(null);

  const totalRobots = robots.length;
  const activeRobots = robots.filter((r) => r.status === 'Active').length;
  const idleRobots = robots.filter((r) => r.status === 'Idle').length;
  const lowBattRobots = robots.filter((r) => r.battery < 30).length;
  const ruiPct = totalRobots > 0 ? Math.round((activeRobots / totalRobots) * 100) : 0;

  const ruiSegments = [
    { label: 'Working', pct: totalRobots > 0 ? Math.round((activeRobots / totalRobots) * 100) : 0, color: '#10B981' },
    { label: 'Charging', pct: totalRobots > 0 ? Math.round((lowBattRobots / totalRobots) * 100) : 0, color: '#F59E0B' },
    { label: 'Idle', pct: totalRobots > 0 ? Math.round(((totalRobots - activeRobots - lowBattRobots) / totalRobots) * 100) : 0, color: '#EF4444' },
  ];

  const workingHours = activeRobots * 168;
  const chargingHours = lowBattRobots * 40;
  const idleHours = (totalRobots - activeRobots) * 120;

  const taskCategories = useMemo(() => {
    const groups = {};
    tasks.forEach((t) => {
      const type = t.type || 'Other';
      if (!groups[type]) groups[type] = { total: 0, completed: 0, pending: 0 };
      groups[type].total++;
      if (t.status === 'Completed') groups[type].completed++;
      else if (t.status === 'Pending') groups[type].pending++;
    });
    return Object.entries(groups).map(([type, data]) => ({
      type,
      total: data.total,
      completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      pendingRate: data.total > 0 ? Math.round((data.pending / data.total) * 100) : 0,
      color: type === 'Irrigation' ? '#F59E0B' : type === 'Fertilizer' ? '#10B981' : type === 'Inspection' ? '#1B4327' : type === 'Maintenance' ? '#F59E0B' : type === 'Harvest' ? '#10B981' : type === 'Planting' ? '#1B4327' : '#6B7280',
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
      color: ['#1B4327', '#A7F3D0', '#F59E0B', '#10B981', '#EF4444'][i % 5],
      tons: Math.round(val * 10) / 10,
    })).sort((a, b) => b.pct - a.pct);
    return { segments, totalTons: Math.round(totalTons * 10) / 10 };
  }, [farms]);

  const cropStressScores = useMemo(() => {
    const soilRisk = { Clay: 30, Loam: 20, Sandy: 50, Silt: 25, Peat: 35 };
    return farms.map((f) => {
      const sizeNum = parseInt(f.size) || 100;
      const devices = parseInt(f.devices) || 1;
      const base = soilRisk[f.soil] || 30;
      const score = Math.round(Math.max(5, Math.min(95, base * Math.min(sizeNum / 100, 2) - devices * 5 + 25)));
      return { name: f.name, score, soil: f.soil, devices, crop: f.crop, color: score > 70 ? '#EF4444' : score > 45 ? '#F59E0B' : '#10B981' };
    }).sort((a, b) => b.score - a.score);
  }, [farms]);

  const avgStress = cropStressScores.length > 0 ? Math.round(cropStressScores.reduce((s, f) => s + f.score, 0) / cropStressScores.length) : 0;

  const wueMetrics = useMemo(() => {
    const irrigationTasks = tasks.filter((t) => t.type === 'Irrigation');
    return farms.map((f) => {
      const sizeNum = parseInt(f.size) || 100;
      const farmTasks = irrigationTasks.filter((t) => t.farm === f.name);
      const efficiency = Math.round(Math.max(40, Math.min(98, 75 - (sizeNum / 30) + farmTasks.length * 3)));
      return { name: f.name, efficiency, size: sizeNum, color: efficiency > 75 ? '#10B981' : efficiency > 55 ? '#F59E0B' : '#EF4444' };
    }).sort((a, b) => a.efficiency - b.efficiency);
  }, [farms, tasks]);

  const avgWue = wueMetrics.length > 0 ? Math.round(wueMetrics.reduce((s, f) => s + f.efficiency, 0) / wueMetrics.length) : 0;

  const ecoFootprint = useMemo(() => {
    const carbonOffset = Math.round(activeRobots * 12.4 * 10) / 10;
    const fuelSaved = Math.round(activeRobots * 45 * 10) / 10;
    const energyEfficiency = activeRobots > 0 ? Math.round(85 - (idleRobots / Math.max(totalRobots, 1)) * 20) : 0;
    return { carbonOffset, fuelSaved, energyEfficiency };
  }, [activeRobots, idleRobots, totalRobots]);

  const recommendedActions = useMemo(() => {
    const alerts = [];
    robots.filter((r) => r.battery < 30).forEach((r) => {
      alerts.push({ text: `${r.name} battery low (${r.battery}%). Send to charging.`, status: 'immediate', farm: r.farm });
    });
    cropStressScores.filter((f) => f.score > 70).forEach((f) => {
      alerts.push({ text: `${f.name} crops stressed (${f.score}/100). Check ${f.soil} soil and irrigate.`, status: 'immediate', farm: f.name });
    });
    tasks.filter((t) => t.priority === 'High' && t.status === 'Pending').forEach((t) => {
      alerts.push({ text: `"${t.title}" overdue on ${t.farm}. Assign ${t.assignedTo}.`, status: 'immediate', farm: t.farm });
    });
    wueMetrics.filter((f) => f.efficiency < 55).forEach((f) => {
      alerts.push({ text: `${f.name} using too much water (${f.efficiency}%). Inspect drips.`, status: 'pending', farm: f.name });
    });
    robots.filter((r) => r.status === 'Idle').forEach((r) => {
      const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
      alerts.push({ text: `${r.name} idle on ${r.farm}. ${pendingCount} tasks waiting.`, status: 'pending', farm: r.farm });
    });
    cropStressScores.filter((f) => f.score < 30).slice(0, 2).forEach((f) => {
      alerts.push({ text: `${f.name} crops healthy (${f.score}/100). No action needed.`, status: 'optimal', farm: f.name });
    });
    return alerts.slice(0, 6);
  }, [robots, cropStressScores, tasks, wueMetrics]);

  const statusBadge = (s) => {
    if (s === 'immediate') return <span style={{ background: '#FEE2E2', color: '#EF4444', fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>Immediate</span>;
    if (s === 'pending') return <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>Standby</span>;
    return <span style={{ background: '#D1FAE5', color: '#10B981', fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>Optimal</span>;
  };

  return (
    <>
      <div className="mb-6">
        <div className="text-2xl font-bold text-[#111827]">Analytics</div>
        <div className="text-sm text-[#5A7A5A] mt-1">Overview of farm performance and field conditions</div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#5A7A5A] mb-1">Robot Active Hours</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>{ruiPct}%</div>
              <div className="text-[10px] leading-relaxed text-[#16A34A] mt-0.5">↑ +{Math.round(ruiPct * 0.08)}% from last {timeRange.toLowerCase()}</div>
            </div>
            <div style={{ background: 'rgba(20,46,28,0.05)', borderRadius: '10px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} color="#142E1C" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#5A7A5A] mb-1">Expected Harvest</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>{yieldForecast.totalTons}</div>
              <div className="text-[10px] leading-relaxed text-[#16A34A] mt-0.5">↑ +6.8% vs last season</div>
            </div>
            <div style={{ background: 'rgba(20,46,28,0.05)', borderRadius: '10px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sprout size={20} color="#142E1C" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#5A7A5A] mb-1">Crop Health Alerts</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>{avgStress}<span style={{ fontSize: '14px', fontWeight: 500, color: '#5A7A5A' }}>/100</span></div>
              <div className={`text-[10px] leading-relaxed mt-0.5 ${avgStress < 50 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>{avgStress < 50 ? '↓ Healthy' : '↑ Monitor'} across {farms.length} farms</div>
            </div>
            <div style={{ background: 'rgba(20,46,28,0.05)', borderRadius: '10px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bug size={20} color="#142E1C" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#5A7A5A] mb-1">Water Savings</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>{avgWue}<span style={{ fontSize: '14px', fontWeight: 500, color: '#5A7A5A' }}>%</span></div>
              <div className={`text-[10px] leading-relaxed mt-0.5 ${avgWue > 60 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>{avgWue > 60 ? '↑ Efficient' : '↓ Needs attention'}</div>
            </div>
            <div style={{ background: 'rgba(20,46,28,0.05)', borderRadius: '10px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Droplets size={20} color="#142E1C" />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {timeRanges.map((r) => (
          <button key={r} onClick={() => setTimeRange(r)}
            style={{ padding: '6px 16px', fontSize: '12px', fontWeight: 600, border: 'none', borderRadius: '6px', cursor: 'pointer', background: timeRange === r ? '#142E1C' : '#F3F4F6', color: timeRange === r ? '#FFFFFF' : '#4B5563', transition: 'all 0.15s ease' }}>
            {r}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <div style={CHART_SIZE}>
            <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>Robot Active Hours</div>
            <div style={CHART_INNER}>
              <Donut segments={ruiSegments} centerLabel="Total Robots" centerVal={totalRobots} hovered={hoveredRui} setHovered={setHoveredRui} />
              <div>
                <Legend items={ruiSegments.map((s) => ({ ...s, val: s.pct + '%' }))} hovered={hoveredRui} setHovered={setHoveredRui} />
                <div style={{ marginTop: '8px', padding: '6px 10px', background: '#F9FAFB', borderRadius: '6px', border: '1px solid #F3F4F6', fontSize: '10px', color: '#5A7A5A' }}>
                  Working: {workingHours}h · Charging: {chargingHours}h · Idle: {idleHours}h
                </div>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={CHART_SIZE}>
            <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>Task Progress</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', flex: 1, justifyContent: 'center' }}>
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
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <div style={CHART_SIZE}>
            <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>Expected Harvest by Crop</div>
            <div style={CHART_INNER}>
              <Donut segments={yieldForecast.segments.map((s) => ({ label: s.label, pct: s.pct, color: s.color }))} centerLabel="Projected" centerVal={`${yieldForecast.totalTons}t`} hovered={hoveredCrop} setHovered={setHoveredCrop} />
              <Legend items={yieldForecast.segments.map((s) => ({ ...s, val: s.tons + 't' }))} hovered={hoveredCrop} setHovered={setHoveredCrop} />
            </div>
          </div>
        </Card>
        <Card>
          <div style={CHART_SIZE}>
            <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>Crop Health Alerts</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', flex: 1, justifyContent: 'center' }}>
              {cropStressScores.map((f, i) => (
                <StressBar key={f.name} name={f.name} score={f.score} color={f.color} dimmed={hoveredStress !== null && hoveredStress !== i} onEnter={() => setHoveredStress(i)} onLeave={() => setHoveredStress(null)} />
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <div style={CHART_SIZE}>
            <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>Water Savings</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', flex: 1, justifyContent: 'center' }}>
              {wueMetrics.map((f) => (
                <WueBar key={f.name} name={f.name} pct={f.efficiency} color={f.color} />
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <div style={CHART_SIZE}>
            <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>Fleet Eco-Savings</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', flex: 1, justifyContent: 'center' }}>
              <div className="flex items-center gap-4 p-3" style={{ background: '#F9FAFB', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: '8px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wind size={18} color="#10B981" /></div>
                <div><div className="text-[10px] font-medium text-[#5A7A5A]">Carbon Offset</div><div className="text-base font-bold text-[#111827]">{ecoFootprint.carbonOffset} tCO₂</div></div>
              </div>
              <div className="flex items-center gap-4 p-3" style={{ background: '#F9FAFB', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: '8px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Tractor size={18} color="#10B981" /></div>
                <div><div className="text-[10px] font-medium text-[#5A7A5A]">Fuel Saved</div><div className="text-base font-bold text-[#111827]">{ecoFootprint.fuelSaved} L</div></div>
              </div>
              <div className="flex items-center gap-4 p-3" style={{ background: '#F9FAFB', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: '8px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={18} color="#10B981" /></div>
                <div><div className="text-[10px] font-medium text-[#5A7A5A]">Energy Savings</div><div className="text-base font-bold text-[#111827]">{ecoFootprint.energyEfficiency}%</div></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Cpu size={16} color="#1B4327" />
            <span className="text-sm font-semibold text-[#111827]">Recommended Actions</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', marginLeft: 'auto' }}>Live</span>
          </div>

          <div style={{ border: '1px solid #F3F4F6', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px', gap: '0', background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
              <div style={{ padding: '8px 12px', fontSize: '10px', fontWeight: 600, color: '#5A7A5A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Action</div>
              <div style={{ padding: '8px 12px', fontSize: '10px', fontWeight: 600, color: '#5A7A5A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Farm</div>
              <div style={{ padding: '8px 12px', fontSize: '10px', fontWeight: 600, color: '#5A7A5A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</div>
            </div>
            {recommendedActions.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: '#5A7A5A' }}>All systems nominal — no actions needed.</div>
            )}
            {recommendedActions.map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px', gap: '0', borderBottom: i < recommendedActions.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <div style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 500, color: '#111827' }}>{item.text}</div>
                <div style={{ padding: '10px 12px', fontSize: '11px', color: '#5A7A5A' }}>{item.farm}</div>
                <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center' }}>{statusBadge(item.status)}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </>
  );
}
