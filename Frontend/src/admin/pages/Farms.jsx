import { useState, useMemo } from 'react';
import { useFarms } from '../../context/FarmContext';
import { useRobots } from '../../context/RobotContext';

const inputClass = "text-sm px-3.5 py-2.5 rounded-xl bg-[#7676801F] outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder";

function getStatusLabel(connectedRobots) {
  if (connectedRobots.length === 0) return { label: 'Offline', cls: 'bg-danger-bg text-danger-text pill' };
  if (connectedRobots.some((r) => r.status === 'Active')) return { label: 'Active', cls: 'bg-brand-light text-brand-dark pill' };
  return { label: 'Idle', cls: 'bg-warning-bg text-warning-text pill' };
}

export default function Farms() {
  const { farms } = useFarms();
  const { robots } = useRobots();
  const [searchTerm, setSearchTerm] = useState('');

  const regions = useMemo(() => [...new Set(farms.map((f) => f.location.split(', ')[1] + ', ' + f.location.split(', ')[0]))], [farms]);
  const cropTypes = useMemo(() => [...new Set(farms.map((f) => f.crop))], [farms]);

  const activeRobotCount = useMemo(() => robots.filter((r) => r.status === 'Active').length, [robots]);

  const farmRows = useMemo(() => {
    const visible = !searchTerm.trim()
      ? farms
      : (() => {
          const q = searchTerm.toLowerCase();
          return farms.filter(
            (f) =>
              f.name.toLowerCase().includes(q) ||
              f.location.toLowerCase().includes(q) ||
              f.owner.toLowerCase().includes(q)
          );
        })();

    return visible.map((farm) => {
      const connectedRobots = robots.filter((r) => r.farm === farm.name);
      return {
        farm,
        connectedCount: connectedRobots.length,
        status: getStatusLabel(connectedRobots),
      };
    });
  }, [farms, robots, searchTerm]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-bold text-[#000000]">Farm Management</div>
          <div className="text-sm text-text-secondary mt-1">View and manage agricultural properties</div>
        </div>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        {[
          { icon: 'ph-warehouse', val: String(farms.length), label: 'Total Farms' },
          { icon: 'ph-map-pin', val: String(regions.length), label: 'Regions' },
          { icon: 'ph-seedling', val: String(cropTypes.length), label: 'Crop Types' },
          { icon: 'ph-robot', val: String(activeRobotCount), label: 'Active Robots' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 bg-white border border-[rgba(0,0,0,0.05)] rounded-xl px-4 py-2.5 text-xs text-text-secondary shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <i className={`${item.icon} text-lg`} style={{ color: '#059669' }} />
            <strong className="text-[#1C1C1E] text-sm mr-0.5">{item.val}</strong> {item.label}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col items-stretch mb-4">
          <div className="text-sm font-semibold text-[#1C1C1E] mb-3">All Farms ({farms.length})</div>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search farms by name, location, or owner..."
            aria-label="Search farms"
            className={inputClass}
          />
        </div>

        {farmRows.length === 0 ? (
          <div className="py-12 text-center text-text-secondary text-sm">No farms found matching your criteria.</div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="text-left px-5 py-4 text-[10px] uppercase font-semibold text-text-secondary border-b border-[rgba(0,0,0,0.05)] w-[25%]">Farm Name</th>
                <th className="text-left px-5 py-4 text-[10px] uppercase font-semibold text-text-secondary border-b border-[rgba(0,0,0,0.05)] w-[25%]">Location</th>
                <th className="text-left px-5 py-4 text-[10px] uppercase font-semibold text-text-secondary border-b border-[rgba(0,0,0,0.05)] w-[20%]">Owner</th>
                <th className="text-center px-5 py-4 text-[10px] uppercase font-semibold text-text-secondary border-b border-[rgba(0,0,0,0.05)] w-[15%]">Connected Devices</th>
                <th className="text-center px-5 py-4 text-[10px] uppercase font-semibold text-text-secondary border-b border-[rgba(0,0,0,0.05)] w-[15%]">Status</th>
              </tr>
            </thead>
            <tbody>
              {farmRows.map(({ farm, connectedCount, status }, i) => (
                <tr key={i}>
                  <td className="px-5 py-4 border-b border-[rgba(0,0,0,0.05)]"><strong className="text-[#1C1C1E] font-medium">{farm.name}</strong></td>
                  <td className="px-5 py-4 border-b border-[rgba(0,0,0,0.05)] text-text-secondary">{farm.location}</td>
                  <td className="px-5 py-4 border-b border-[rgba(0,0,0,0.05)] text-text-secondary">{farm.owner}</td>
                  <td className="px-5 py-4 border-b border-[rgba(0,0,0,0.05)] text-center">
                    <span className="pill inline-flex items-center justify-center min-w-[28px] px-2.5 py-0.5 rounded-full bg-[#7676801F] text-text-secondary text-xs font-semibold">{connectedCount}</span>
                  </td>
                  <td className="px-5 py-4 border-b border-[rgba(0,0,0,0.05)] text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${status.cls}`}>{status.label}</span>
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
