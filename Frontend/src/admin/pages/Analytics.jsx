import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarms } from '../../context/FarmContext';
import { useRobots } from '../../context/RobotContext';
import { useTasks } from '../../context/TaskContext';
import {
  CheckCircle, Calendar, TrendingUp, DollarSign,
  Thermometer, Droplets, CloudRain, Leaf,
  ChevronDown, Check, Bot, ClipboardList,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

const TIME_LABELS = ["00:00", "02:30", "05:00", "07:30", "10:00", "12:30", "15:00", "17:30", "20:00", "22:30"];

const CROP_DAYS = {
  Rice: 12, Wheat: 45, Corn: 30, Soybeans: 25, Barley: 38,
  Apples: 60, Pears: 55, Strawberries: 20, Tomatoes: 25,
  Alfalfa: 40, Hay: 45, Cotton: 50, Vegetables: 15,
};

const YIELD_FACTORS = {
  Rice: 2.5, Wheat: 1.8, Corn: 3.2, Soybeans: 1.5, Barley: 2.0,
  Apples: 2.2, Pears: 2.0, Strawberries: 1.5, Tomatoes: 3.5,
  Alfalfa: 3.0, Hay: 2.5, Cotton: 1.8, Vegetables: 2.8,
};

const CROP_PRICES = {
  Rice: 400, Wheat: 300, Corn: 250, Soybeans: 500, Barley: 280,
  Apples: 350, Pears: 320, Strawberries: 600, Tomatoes: 450,
  Alfalfa: 200, Hay: 180, Cotton: 350, Vegetables: 380,
};

const OP_COST_PER_ACRE = 50;

function parseAcres(size) {
  return parseFloat(size) || 0;
}

const SENSOR_DATA = (() => {
  const data = {
    "All Farms": {
      temperature: [19, 17, 16, 19, 23, 26, 28, 27, 25, 23],
      soilMoisture: [58, 56, 55, 54, 52, 50, 49, 50, 52, 54],
      humidity: [75, 76, 78, 77, 75, 72, 70, 71, 73, 75],
      npk: [40, 41, 42, 43, 44, 45, 45, 45, 44, 44],
    },
    "Green Valley Farm": {
      temperature: [18, 16, 15, 18, 22, 25, 28, 27, 26, 24],
      soilMoisture: [65, 63, 62, 61, 58, 56, 56, 57, 58, 60],
      humidity: [78, 79, 80, 79, 77, 75, 72, 73, 74, 76],
      npk: [42, 43, 43, 44, 44, 45, 45, 45, 45, 45],
    },
    "Sunrise Orchards": {
      temperature: [20, 18, 17, 20, 24, 27, 30, 29, 27, 25],
      soilMoisture: [45, 43, 42, 41, 39, 37, 36, 37, 39, 41],
      humidity: [70, 71, 73, 72, 70, 68, 65, 66, 68, 70],
      npk: [35, 36, 37, 38, 39, 40, 40, 40, 39, 39],
    },
    "Golden Harvest": {
      temperature: [22, 20, 19, 22, 26, 29, 32, 31, 29, 27],
      soilMoisture: [72, 70, 69, 68, 66, 64, 63, 64, 66, 68],
      humidity: [82, 83, 85, 84, 82, 80, 77, 78, 80, 82],
      npk: [48, 49, 50, 51, 52, 53, 53, 52, 51, 50],
    },
    "Maple Ridge Farm": {
      temperature: [17, 15, 14, 17, 21, 24, 27, 26, 24, 22],
      soilMoisture: [55, 53, 52, 51, 49, 47, 46, 47, 49, 51],
      humidity: [73, 74, 76, 75, 73, 71, 68, 69, 71, 73],
      npk: [38, 39, 40, 41, 42, 43, 43, 42, 41, 40],
    },
  };

  const allFarms = [
    "Green Valley Farm", "Sunrise Orchards", "Golden Harvest", "Maple Ridge Farm",
    "River Bend Agriculture", "Highland Crops", "Coastal Farms", "Valley View Ranch",
  ];
  const base = data["All Farms"];

  allFarms.forEach((name) => {
    if (!data[name]) {
      const seed = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      data[name] = {};
      for (const key of Object.keys(base)) {
        data[name][key] = base[key].map((v, i) => {
          const variation = 1 + ((seed * (i + 1) * 7) % 11 - 5) / 100;
          return Math.round(v * variation * 10) / 10;
        });
      }
    }
  });

  return data;
})();

function Select({ label, options, value, onChange, width }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div>
      {label && (
        <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
          {label}
        </div>
      )}
      <div className="relative" ref={ref} style={{ width: width || '200px' }}>
        <button type="button" onClick={() => setOpen((o) => !o)}
          style={{
            background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '8px',
            color: '#111827', fontSize: '14px', height: '40px', padding: '0 36px 0 12px',
            width: '100%', outline: 'none', boxSizing: 'border-box', cursor: 'pointer',
            transition: 'all 0.2s ease', textAlign: 'left', position: 'relative',
            display: 'flex', alignItems: 'center',
            boxShadow: open ? '0 0 0 2px rgba(52,199,89,0.3)' : 'none',
          }}
          onMouseEnter={(e) => { if (!open) e.currentTarget.style.borderColor = '#9CA3AF'; }}
          onMouseLeave={(e) => { if (!open) e.currentTarget.style.borderColor = '#D1D5DB'; }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, color: selected ? '#111827' : '#9CA3AF' }}>
            {selected ? selected.label : 'Select...'}
          </span>
          <ChevronDown size={14} style={{ position: 'absolute', right: '8px', top: '50%', transform: `translateY(-50%) rotate(${open ? '180deg' : '0deg'})`, color: '#6B7280', transition: 'transform 0.2s ease', flexShrink: 0 }} />
        </button>
        {open && (
          <div style={{
            position: 'absolute', zIndex: 100, top: '100%', left: 0, right: 0, marginTop: '4px',
            maxHeight: '240px', overflowY: 'auto',
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(25px)',
            border: '1px solid rgba(255,255,255,0.6)', borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden',
          }}>
            {options.map((opt) => {
              const sel = opt.value === value;
              return (
                <div key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
                  style={{
                    padding: '10px 14px', fontSize: '13px', cursor: 'pointer',
                    background: sel ? 'rgba(76,175,80,0.12)' : 'transparent',
                    color: sel ? '#4caf50' : '#1d1d1f',
                    transition: 'background 0.15s, color 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                  onMouseEnter={(e) => { if (!sel) { e.currentTarget.style.background = 'rgba(76,175,80,0.12)'; e.currentTarget.style.color = '#4caf50'; } }}
                  onMouseLeave={(e) => { if (!sel) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1d1d1f'; } }}
                >
                  <span>{opt.label}</span>
                  {sel && <Check size={12} color="#4caf50" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function getSensorStatus(type, value) {
  if (type === 'temperature') {
    if (value < 15 || value > 35) return { label: 'Critical', color: '#ef4444' };
    if (value >= 15 && value <= 20) return { label: 'Low', color: '#f97316' };
    if (value > 30) return { label: 'High', color: '#f97316' };
    return { label: 'Normal', color: '#2e7d2e' };
  }
  if (type === 'soilMoisture') {
    if (value < 30) return { label: 'Critical', color: '#ef4444' };
    if (value >= 30 && value <= 45) return { label: 'Low', color: '#f97316' };
    if (value > 70) return { label: 'High', color: '#f97316' };
    return { label: 'Optimal', color: '#2e7d2e' };
  }
  if (type === 'humidity') {
    if (value < 40) return { label: 'Low', color: '#f97316' };
    if (value > 80) return { label: 'High', color: '#f97316' };
    return { label: 'Normal', color: '#2e7d2e' };
  }
  if (type === 'npk') {
    if (value < 20) return { label: 'Low', color: '#f97316' };
    if (value > 60) return { label: 'High', color: '#f97316' };
    return { label: 'Optimal', color: '#2e7d2e' };
  }
  return { label: 'Normal', color: '#6b7280' };
}

function AnimatedValue({ value, duration = 600, decimals = 0 }) {
  const [display, setDisplay] = useState(Number(value) || 0);
  const startRef = useRef(null);
  const fromRef = useRef(Number(value) || 0);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = null;
    const target = Number(value) || 0;
    if (Math.abs(target - fromRef.current) < 0.01) { setDisplay(target); return; }
    const animate = (now) => {
      if (!startRef.current) startRef.current = now;
      const p = Math.min((now - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(fromRef.current + (target - fromRef.current) * eased);
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <>{display.toFixed(decimals)}</>;
}

export default function Analytics() {
  const navigate = useNavigate();
  const { farms } = useFarms();
  const { robots } = useRobots();
  const { tasks } = useTasks();

  const [selectedFarmName, setSelectedFarmName] = useState('All Farms');
  const [graphType, setGraphType] = useState('line');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const now = new Date();

  const selectedFarm = useMemo(() => {
    if (selectedFarmName === 'All Farms') return null;
    return farms.find((f) => f.name === selectedFarmName) || null;
  }, [selectedFarmName, farms]);

  const sensorReadings = useMemo(() => {
    const d = SENSOR_DATA[selectedFarmName];
    if (d) return d;
    return SENSOR_DATA['All Farms'];
  }, [selectedFarmName]);

  const harvestInfo = useMemo(() => {
    const findNearest = (farmList) => {
      let minDays = Infinity, minCrop = '', minFarm = '';
      farmList.forEach((f) => {
        (f.cropTypes || '').split(',').map((s) => s.trim()).filter(Boolean).forEach((crop) => {
          const days = CROP_DAYS[crop];
          if (days !== undefined && days < minDays) {
            minDays = days;
            minCrop = crop;
            minFarm = f.name;
          }
        });
      });
      if (minDays === Infinity) return null;
      return { days: minDays, crop: minCrop, farmName: minFarm };
    };

    if (selectedFarm) return findNearest([selectedFarm]);
    return findNearest(farms);
  }, [selectedFarm, farms]);

  const computedYield = useMemo(() => {
    const calcFarm = (f) => {
      const acres = parseAcres(f.size);
      const crops = (f.cropTypes || '').split(',').map((s) => s.trim()).filter(Boolean);
      if (crops.length === 0) return 0;
      return crops.reduce((sum, crop) => {
        const factor = YIELD_FACTORS[crop];
        return sum + (factor ? (acres / crops.length) * factor : 0);
      }, 0);
    };

    if (selectedFarm) return calcFarm(selectedFarm);
    return farms.reduce((sum, f) => sum + calcFarm(f), 0);
  }, [selectedFarm, farms]);

  const computedProfit = useMemo(() => {
    const calcFarm = (f) => {
      const acres = parseAcres(f.size);
      const crops = (f.cropTypes || '').split(',').map((s) => s.trim()).filter(Boolean);
      if (crops.length === 0) return 0;
      return crops.reduce((sum, crop) => {
        const factor = YIELD_FACTORS[crop];
        const price = CROP_PRICES[crop];
        if (!factor || !price) return sum;
        const cropAcres = acres / crops.length;
        return sum + (cropAcres * factor * price - cropAcres * OP_COST_PER_ACRE);
      }, 0);
    };

    if (selectedFarm) return calcFarm(selectedFarm);
    return farms.reduce((sum, f) => sum + calcFarm(f), 0);
  }, [selectedFarm, farms]);

  const growthStatus = useMemo(() => {
    const lastTemp = sensorReadings.temperature[sensorReadings.temperature.length - 1];
    const lastSoil = sensorReadings.soilMoisture[sensorReadings.soilMoisture.length - 1];
    const lastHum = sensorReadings.humidity[sensorReadings.humidity.length - 1];

    let normal = 0;
    if (lastTemp >= 20 && lastTemp <= 30) normal++;
    if (lastSoil >= 45 && lastSoil <= 70) normal++;
    if (lastHum >= 40 && lastHum <= 80) normal++;

    const pct = Math.round((normal / 3) * 100);
    if (pct >= 66) return { label: 'Healthy', color: '#2e7d2e', pct };
    if (pct >= 33) return { label: 'Needs Attention', color: '#f97316', pct };
    return { label: 'Critical', color: '#ef4444', pct };
  }, [sensorReadings]);

  const chartData = useMemo(() => {
    return {
      temperature: sensorReadings.temperature.map((v, i) => ({ time: TIME_LABELS[i], value: v })),
      soilMoisture: sensorReadings.soilMoisture.map((v, i) => ({ time: TIME_LABELS[i], value: v })),
      humidity: sensorReadings.humidity.map((v, i) => ({ time: TIME_LABELS[i], value: v })),
      npk: sensorReadings.npk.map((v, i) => ({ time: TIME_LABELS[i], value: v })),
    };
  }, [sensorReadings]);

  const farmOptions = useMemo(() => {
    return [{ value: 'All Farms', label: 'All Farms' }, ...farms.map((f) => ({ value: f.name, label: f.name }))];
  }, [farms]);

  const graphOptions = [
    { value: 'line', label: 'Line Chart' },
    { value: 'bar', label: 'Bar Chart' },
    { value: 'area', label: 'Area Chart' },
  ];

  const sensorConfigs = [
    { key: 'temperature', label: 'Temperature', unit: '°C', icon: Thermometer, color: '#f97316', badgeBg: 'rgba(249,115,22,0.12)' },
    { key: 'soilMoisture', label: 'Soil Moisture', unit: '%', icon: Droplets, color: '#3b82f6', badgeBg: 'rgba(59,130,246,0.12)' },
    { key: 'humidity', label: 'Humidity', unit: '%', icon: CloudRain, color: '#06b6d4', badgeBg: 'rgba(6,182,212,0.12)' },
    { key: 'npk', label: 'NPK Level', unit: 'ppm', icon: Leaf, color: '#1a3a2a', badgeBg: 'rgba(26,58,42,0.12)' },
  ];

  const filteredRobots = useMemo(() => {
    if (selectedFarmName === 'All Farms') return (robots || []);
    return (robots || []).filter(r => r.farm === selectedFarmName);
  }, [robots, selectedFarmName]);

  const filteredTasks = useMemo(() => {
    if (selectedFarmName === 'All Farms') return (tasks || []);
    return (tasks || []).filter(t => t.farm === selectedFarmName);
  }, [tasks, selectedFarmName]);

  const overdueTasks = filteredTasks.filter((t) => t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < now);

  const batterySorted = useMemo(() => {
    return [...filteredRobots].filter((r) => r.battery > 0).sort((a, b) => a.battery - b.battery);
  }, [filteredRobots]);

  const statusData = useMemo(() => [
    { name: 'Pending', value: filteredTasks.filter((t) => t.status === 'Pending').length, color: '#f97316' },
    { name: 'In Progress', value: filteredTasks.filter((t) => t.status === 'In Progress').length, color: '#3b82f6' },
    { name: 'Completed', value: filteredTasks.filter((t) => t.status === 'Completed').length, color: '#2e7d2e' },
  ].filter(d => d.value > 0), [filteredTasks]);

  const completedCount = filteredTasks.filter(t => t.status === 'Completed').length;
  const completionRate = filteredTasks.length > 0 ? Math.round((completedCount / filteredTasks.length) * 100) : 0;
  const needsCharging = filteredRobots.filter((r) => r.battery > 0 && r.battery < 50).length;

  const cardStyle = {
    background: '#ffffff', border: '1px solid rgba(76,175,80,0.12)',
    borderRadius: '14px', padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  };

  const sectionTitle = { color: '#1a1a1a', fontSize: '16px', fontWeight: 700, marginBottom: '4px' };
  const sectionSub = { color: '#6b7280', fontSize: '12px', marginBottom: '10px' };

  const statCardStyle = {
    background: '#ffffff', border: '1px solid rgba(76,175,80,0.12)',
    borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(46,125,50,0.08)',
    cursor: 'default', transition: 'all 0.25s ease',
  };

  const badgeStyle = (bg) => ({
    background: bg, borderRadius: '8px', padding: '8px',
    width: '36px', height: '36px', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  });

  function renderChart(data, dataKey, color, type) {
    const common = { data, margin: { top: 5, right: 5, bottom: 5, left: -15 } };
    const axisProps = { tick: { fontSize: 10, fill: '#9CA3AF' }, axisLine: false, tickLine: false };
    const grid = <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />;
    const tooltip = <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px', fontSize: '12px', color: '#374151', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />;

    if (type === 'bar') {
      return (
        <BarChart {...common}>
          {grid}
          <XAxis dataKey="time" {...axisProps} />
          <YAxis {...axisProps} />
          {tooltip}
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      );
    }
    if (type === 'area') {
      return (
        <AreaChart {...common}>
          {grid}
          <XAxis dataKey="time" {...axisProps} />
          <YAxis {...axisProps} />
          {tooltip}
          <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2} dot={false} />
        </AreaChart>
      );
    }
    return (
      <LineChart {...common}>
        {grid}
        <XAxis dataKey="time" {...axisProps} />
        <YAxis {...axisProps} />
        {tooltip}
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    );
  }

  const harvestDateStr = useMemo(() => {
    if (!harvestInfo) return '';
    const d = new Date();
    d.setDate(d.getDate() + harvestInfo.days);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [harvestInfo]);

  return (
    <>
      <div className="mb-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="text-2xl font-bold text-primary">
              Analytics{selectedFarm ? ` \u2014 ${selectedFarm.name} (${selectedFarm.cropTypes})` : ''}
            </div>
            <div className="text-sm text-text-secondary mt-1">
              Real-time sensor data and performance metrics across all farms
            </div>
          </div>
          <Select
            label="Select Farm"
            options={farmOptions}
            value={selectedFarmName}
            onChange={setSelectedFarmName}
            width="220px"
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* SECTION 1: Crop Performance */}
        <div data-section="crop" className="section-entrance" style={{ animationDelay: '0s' }}>
          <div style={sectionTitle}>Crop Performance</div>
          <div style={sectionSub}>Key metrics for {selectedFarmName === 'All Farms' ? 'all farms' : selectedFarmName}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {/* Card 1 */}
            <div className="card-hover" style={statCardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,46,26,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(46,125,50,0.08)'; }} onClick={() => setSelectedCrop(selectedCrop === 'growth' ? null : 'growth')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ flex: 1 }} />
                <div style={badgeStyle(selectedCrop === 'growth' ? 'rgba(46,125,50,0.2)' : 'rgba(46,125,50,0.12)')}>
                  <CheckCircle size={18} color="#2e7d2e" />
                </div>
              </div>
              <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Growth Status</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: growthStatus.color }}>{growthStatus.label}</div>
              <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}><AnimatedValue value={growthStatus.pct} decimals={0} />% optimal</div>
            </div>
            {/* Card 2 */}
            <div className="card-hover" style={statCardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,46,26,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(46,125,50,0.08)'; }} onClick={() => setSelectedCrop(selectedCrop === 'harvest' ? null : 'harvest')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ flex: 1 }} />
                <div style={badgeStyle(selectedCrop === 'harvest' ? 'rgba(46,125,50,0.2)' : 'rgba(46,125,50,0.12)')}>
                  <Calendar size={18} color="#2e7d2e" />
                </div>
              </div>
              <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Harvest In</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a1a' }}>
                {harvestInfo ? <><AnimatedValue value={harvestInfo.days} decimals={0} /> Days</> : '--'}
              </div>
              <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>
                {harvestInfo ? (selectedFarm ? harvestDateStr : `${harvestDateStr} \u2014 ${harvestInfo.farmName}`) : ''}
              </div>
            </div>
            {/* Card 3 */}
            <div className="card-hover" style={statCardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,46,26,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(46,125,50,0.08)'; }} onClick={() => setSelectedCrop(selectedCrop === 'yield' ? null : 'yield')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ flex: 1 }} />
                <div style={badgeStyle(selectedCrop === 'yield' ? 'rgba(249,115,22,0.2)' : 'rgba(249,115,22,0.12)')}>
                  <TrendingUp size={18} color="#f97316" />
                </div>
              </div>
              <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Yield</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a1a' }}><AnimatedValue value={computedYield} decimals={1} /> Tons</div>
              <div style={{ color: '#2e7d2e', fontSize: '12px', marginTop: '2px' }}>↑ +15%</div>
            </div>
            {/* Card 4 */}
            <div className="card-hover" style={statCardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,46,26,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(46,125,50,0.08)'; }} onClick={() => setSelectedCrop(selectedCrop === 'revenue' ? null : 'revenue')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ flex: 1 }} />
                <div style={badgeStyle(selectedCrop === 'revenue' ? 'rgba(46,125,50,0.2)' : 'rgba(46,125,50,0.12)')}>
                  <DollarSign size={18} color="#2e7d2e" />
                </div>
              </div>
              <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Net Profit</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#2e7d2e' }}>$<AnimatedValue value={computedProfit / 1000} decimals={0} />K</div>
              <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>Revenue: $<AnimatedValue value={computedProfit / 1000} decimals={0} />K</div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Sensor Analytics */}
        <div data-section="sensors" className="section-entrance" style={{ animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
            <div>
              <div style={sectionTitle}>Sensor Analytics</div>
              <div style={sectionSub}>24-hour readings at ~2.4 hour intervals</div>
            </div>
            <div className="card-hover-select">
              <Select label="Graph Type" options={graphOptions} value={graphType} onChange={setGraphType} width="160px" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {sensorConfigs.map((s) => {
              const readings = sensorReadings[s.key];
              const lastVal = readings[readings.length - 1];
              const prevVal = readings[readings.length - 2];
              const trend = lastVal >= prevVal ? 'up' : 'down';
              const status = getSensorStatus(s.key, lastVal);

              return (
                <div key={s.key} className="card-hover-sensor" style={{
                  background: '#ffffff', border: '1px solid rgba(76,175,80,0.12)',
                  borderRadius: '14px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ background: s.badgeBg, borderRadius: '8px', padding: '6px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <s.icon size={14} color={s.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px', color: '#1a1a1a' }}>{s.label}</span>
                        <span style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a' }}>{lastVal}{s.unit}</span>
                        <span style={{ fontSize: '12px', color: trend === 'up' ? '#2e7d2e' : '#ef4444' }}>{trend === 'up' ? '\u2191' : '\u2193'}</span>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '10px', fontWeight: 600, padding: '4px 10px', borderRadius: '9999px',
                      background: `${status.color}18`, color: status.color, flexShrink: 0,
                    }}>
                      {status.label}
                    </span>
                  </div>
                  <div key={graphType} className="chart-fade">
                    <ResponsiveContainer width="100%" height={130}>
                      {renderChart(chartData[s.key], 'value', s.color, graphType)}
                    </ResponsiveContainer>
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '11px', fontStyle: 'italic', marginTop: '6px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={`Trend over time — shows how ${s.label.toLowerCase()} changes throughout the day for ${selectedFarmName === 'All Farms' ? 'all farms' : selectedFarmName}.`}>
                    Trend over time — shows how {s.label.toLowerCase()} changes throughout the day for {selectedFarmName === 'All Farms' ? 'all farms' : selectedFarmName}.
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Fleet Overview */}
        <div style={{ border: 'none', borderTop: '1px solid rgba(76,175,80,0.12)', margin: '4px 0' }} />
        <div style={{ color: '#6b7280', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Fleet Overview</div>

        {/* SECTION 4: Fleet Intelligence */}
        <div data-section="fleet" className="section-entrance" style={{ animationDelay: '0.4s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Left: Battery Health */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>Battery Health — Full Fleet</span>
              <span className="card-hover-link" style={{ fontSize: '12px', color: '#6b7280', cursor: 'pointer' }} onClick={() => navigate('/admin/robots')}>
                {selectedFarmName === 'All Farms' ? 'Click any robot →' : 'Click to view details →'}
              </span>
            </div>
            <div style={sectionSub}>{selectedFarmName === 'All Farms' ? 'Sorted by battery level (lowest first)' : `Robots assigned to ${selectedFarmName} — click to view details →`}</div>
            <div>
              {filteredRobots.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', gap: '8px' }}>
                  <Bot size={32} color="#9CA3AF" />
                  <div style={{ color: '#9CA3AF', fontSize: '14px', fontWeight: 600 }}>{selectedFarmName === 'All Farms' ? 'No robots registered' : `No robots assigned to ${selectedFarmName}`}</div>
                  <div style={{ color: '#9CA3AF', fontSize: '12px' }}>Select a different farm or assign robots in Robot Management</div>
                </div>
              ) : batterySorted.map((r) => {
                const barColor = r.battery < 20 ? '#ef4444' : r.battery < 50 ? '#f97316' : '#22C55E';
                const statusLabel = r.battery < 20 ? 'Critical' : r.battery < 50 ? 'Low' : r.battery < 80 ? 'Good' : 'Excellent';
                const dotColor = r.status === 'Offline' ? '#ef4444' : r.status === 'Active' ? '#4caf50' : '#f97316';

                return (
                  <div key={r.id} className="card-hover-slide" onClick={() => navigate('/admin/robots')}
                    style={{ padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
                  >
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontWeight: 600, color: '#1a1a1a', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
                    <div style={{ width: '70px', height: '6px', borderRadius: '999px', background: 'rgba(0,0,0,0.06)', overflow: 'hidden', flexShrink: 0 }}>
                      <div style={{ width: `${Math.min(r.battery, 100)}%`, height: '100%', borderRadius: '999px', background: barColor }} />
                    </div>
                    <span style={{ fontWeight: 700, color: barColor, fontSize: '12px', minWidth: '28px', textAlign: 'right' }}>{r.battery}%</span>
                    <span style={{
                      fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '9999px',
                      background: `${barColor}18`, color: barColor, flexShrink: 0,
                    }}>
                      {statusLabel}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="card-hover-link" onClick={() => navigate('/admin/robots')} style={{
              marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(76,175,80,0.08)',
              fontSize: '12px', fontWeight: 500, cursor: 'pointer', color: needsCharging > 0 ? '#f97316' : '#2e7d32',
            }}>
              {selectedFarmName === 'All Farms'
                ? `${needsCharging} of ${filteredRobots.length} robots need charging soon →`
                : `${filteredRobots.length} robot(s) assigned to ${selectedFarmName} — ${needsCharging} need charging →`}
            </div>
          </div>

          {/* Right: Task Operations */}
          <div style={cardStyle}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a', marginBottom: '4px' }}>Task Operations</div>
            <div style={sectionSub}>{selectedFarmName === 'All Farms' ? 'Status breakdown across all tasks' : `Tasks assigned to ${selectedFarmName}`}</div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(76,175,80,0.08)' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a' }}><AnimatedValue value={filteredTasks.length} decimals={0} /></div>
                <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Tasks</div>
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a' }}><AnimatedValue value={completionRate} decimals={0} />%</div>
                <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completion Rate</div>
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: overdueTasks.length > 0 ? '#ef4444' : '#1a1a1a' }}>{overdueTasks.length}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overdue</div>
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', gap: '8px' }}>
                <ClipboardList size={32} color="#9CA3AF" />
                <div style={{ color: '#9CA3AF', fontSize: '14px', fontWeight: 600 }}>{selectedFarmName === 'All Farms' ? 'No tasks found' : `No tasks found for ${selectedFarmName}`}</div>
                <div style={{ color: '#9CA3AF', fontSize: '12px' }}>Select a different farm or assign tasks in Task Management</div>
              </div>
            ) : statusData.length === 0 ? (
              <div style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No tasks found</div>
            ) : (
            <div className="relative flex items-center justify-center">
              <div style={{ width: '100%', maxWidth: '320px' }}>
                <div className="relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0} isAnimationActive={true} animationBegin={200} animationDuration={600}>
                        {statusData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#1a1a1a', lineHeight: 1 }}><AnimatedValue value={filteredTasks.length} decimals={0} /></div>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>Total Tasks</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
                  {statusData.map((entry) => (
                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '12px', color: '#374151' }}>{entry.name}</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )}

            <div className="card-hover-link" onClick={() => navigate('/admin/tasks')} style={{
              marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(76,175,80,0.08)',
              textAlign: 'right', cursor: 'pointer', color: '#2e7d32', fontSize: '12px', fontWeight: 500,
            }}>
              View all tasks →
            </div>
          </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .recharts-wrapper, .recharts-surface,
        .recharts-wrapper svg, .recharts-layer,
        .recharts-pie, .recharts-pie-sector,
        .recharts-bar-rectangle, .recharts-line,
        .recharts-area, .recharts-cartesian-grid,
        .recharts-responsive-container,
        .recharts-wrapper:focus, .recharts-surface:focus,
        .recharts-wrapper *:focus {
          outline: none !important;
          border: none !important;
        }

        .card-hover { cursor: default; }
        .card-hover-sensor { transition: all 0.2s ease; cursor: default; }
        .card-hover-sensor:hover { transform: scale(1.01); box-shadow: 0 6px 20px rgba(46,125,50,0.12); }
        .card-hover-slide { transition: all 0.15s ease; cursor: pointer; }
        .card-hover-slide:hover { background: #f8fdf8; transform: translateX(3px); }
        .card-hover-link { transition: all 0.15s ease; cursor: pointer; }
        .card-hover-link:hover { color: #1a3a2a; transform: translateX(3px); }
        .card-hover-select { transition: all 0.15s ease; cursor: pointer; }
        .card-hover-select:hover { box-shadow: 0 2px 8px rgba(46,125,50,0.15); }

        .section-entrance { animation: sectionEntrance 0.4s ease-out forwards; opacity: 0; }
        @keyframes sectionEntrance { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        .chart-fade { animation: chartFade 0.35s ease-out; }
        @keyframes chartFade { from { opacity: 0.2; } to { opacity: 1; } }
      `}} />
    </>
  );
}
