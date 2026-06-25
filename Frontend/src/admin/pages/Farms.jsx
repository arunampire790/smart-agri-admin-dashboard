import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarms } from '../../context/FarmContext';
import { useRobots } from '../../context/RobotContext';

const inputClass = "text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-white/60 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder text-[#1C1C1E]";

function getStatusLabel(connectedRobots) {
  if (connectedRobots.length === 0) return { label: 'Offline', cls: 'bg-danger-bg text-danger-text pill' };
  if (connectedRobots.some((r) => r.status === 'Active')) return { label: 'Active', cls: 'bg-brand-light text-brand-dark pill' };
  return { label: 'Idle', cls: 'bg-warning-bg text-warning-text pill' };
}

function getGlowColor(label) {
  switch (label) {
    case 'Total Farms': return 'radial-gradient(circle, rgba(5,150,105,0.7) 0%, transparent 70%)';
    case 'Regions': return 'radial-gradient(circle, rgba(59,130,246,0.7) 0%, transparent 70%)';
    case 'Crop Types': return 'radial-gradient(circle, rgba(147,51,234,0.7) 0%, transparent 70%)';
    case 'Active Robots': return 'radial-gradient(circle, rgba(5,150,105,0.7) 0%, transparent 70%)';
    default: return 'radial-gradient(circle, rgba(59,130,246,0.7) 0%, transparent 70%)';
  }
}

function getIconConfig(label) {
  switch (label) {
    case 'Total Farms': return { icon: 'ph-warehouse', bg: '#e8f5e9', color: '#059669' };
    case 'Regions': return { icon: 'ph-map-pin', bg: '#e0f2fe', color: '#0284c7' };
    case 'Crop Types': return { icon: 'ph-flower', bg: '#f3e5f5', color: '#7c3aed' };
    case 'Active Robots': return { icon: 'ph-robot', bg: '#e8f5e9', color: '#059669' };
    default: return { icon: 'ph-info', bg: '#f5f5f5', color: '#757575' };
  }
}

export default function Farms() {
  const navigate = useNavigate();
  const { farms } = useFarms();
  const { robots } = useRobots();
  const [searchTerm, setSearchTerm] = useState('');

  const regions = useMemo(() => [...new Set(farms.map((f) => f.location.split(', ')[1] + ', ' + f.location.split(', ')[0]))], [farms]);
  const cropTypes = useMemo(() => [...new Set(farms.map((f) => f.crop))], [farms]);
  const activeRobotCount = useMemo(() => robots.filter((r) => r.status === 'Active').length, [robots]);

  const statCards = [
    { val: String(farms.length), label: 'Total Farms', route: '/admin/farms' },
    { val: String(regions.length), label: 'Regions' },
    { val: String(cropTypes.length), label: 'Crop Types' },
    { val: String(activeRobotCount), label: 'Active Robots', route: '/admin/robots' },
  ];

  const farmRows = useMemo(() => {
    const visible = !searchTerm.trim()
      ? farms
      : (() => {
          const q = searchTerm.toLowerCase();
          return farms.filter(
            (f) => f.name.toLowerCase().includes(q) || f.location.toLowerCase().includes(q) || f.owner.toLowerCase().includes(q)
          );
        })();
    return visible.map((farm) => {
      const connectedRobots = robots.filter((r) => r.farm === farm.name);
      return { farm, connectedCount: connectedRobots.length, status: getStatusLabel(connectedRobots) };
    });
  }, [farms, robots, searchTerm]);

  return (
    <>
      <style>{`@keyframes statusPulse { 0% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.5; } }`}</style>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-bold text-[#000000]">Farm Management</div>
          <div className="text-sm text-text-secondary mt-1">View and manage agricultural properties</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => {
          return (
            <div
              key={card.label}
              onClick={card.route ? () => navigate(card.route) : undefined}
              className="dashboard-card-link glass-card rounded-2xl p-5 overflow-hidden"
              style={{ contentVisibility: 'auto' }}
            >
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: getGlowColor(card.label), filter: 'blur(30px)', opacity: 0.35 }} />
              <div className="relative z-10">
                <div className="text-xs font-semibold text-[#6B7280] mb-2">{card.label}</div>
                <div className="text-3xl font-extrabold text-[#000000]">{card.val}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-[20px] p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', contentVisibility: 'auto', willChange: 'transform' }}>
        <div className="flex flex-col items-stretch mb-4">
          <div className="text-sm font-semibold text-[#1C1C1E] mb-3">All Farms ({farms.length})</div>
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search farms by name, location, or owner..." aria-label="Search farms" className={inputClass} />
        </div>
        {farmRows.length === 0 ? (
          <div className="py-12 text-center text-text-secondary text-sm">No farms found matching your criteria.</div>
        ) : (
          <table className="w-full border-collapse text-sm" style={{ userSelect: 'none' }}>
            <thead>
              <tr>
                <th className="text-left px-5 py-4 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)', width: '25%' }}>Farm Name</th>
                <th className="text-left px-5 py-4 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)', width: '25%' }}>Location</th>
                <th className="text-left px-5 py-4 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)', width: '20%' }}>Owner</th>
                <th className="text-center px-5 py-4 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)', width: '15%' }}>Connected Devices</th>
                <th className="text-center px-5 py-4 text-[10px] uppercase font-semibold text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.2)', width: '15%' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {farmRows.map(({ farm, connectedCount, status }, i) => (
                <tr key={i}>
                  <td className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}><strong className="text-[#1C1C1E] font-medium">{farm.name}</strong></td>
                  <td className="px-5 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{farm.location}</td>
                  <td className="px-5 py-4 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>{farm.owner}</td>
                  <td className="px-5 py-4 border-b text-center" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    <span className="pill inline-flex items-center justify-center min-w-[28px] px-2.5 py-0.5 rounded-full bg-white/40 text-text-secondary text-xs font-semibold">{connectedCount}</span>
                  </td>
                  <td className="px-5 py-4 border-b text-center" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    <span className="inline-flex items-center justify-center" style={{ gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: status.label === 'Active' ? '#10B981' : status.label === 'Idle' ? '#D97706' : '#EF4444', animation: status.label === 'Active' ? 'statusPulse 2s ease-in-out infinite' : 'none' }} />
                      <span style={{ color: status.label === 'Active' ? '#10B981' : status.label === 'Idle' ? '#D97706' : '#EF4444', fontSize: '12px', fontWeight: 500, letterSpacing: '0.01em' }}>{status.label}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
