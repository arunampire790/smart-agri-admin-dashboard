import { useState, useMemo } from 'react';
import { useFarms } from '../../context/FarmContext';
import { useRobots } from '../../context/RobotContext';

const inputClass = "text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)] w-full";

export default function Farms() {
  const { farms } = useFarms();
  const { robots } = useRobots();
  const [searchTerm, setSearchTerm] = useState('');

  const regions = useMemo(() => [...new Set(farms.map((f) => f.location.split(', ')[1] + ', ' + f.location.split(', ')[0]))], [farms]);
  const cropTypes = useMemo(() => [...new Set(farms.map((f) => f.crop))], [farms]);

  const getFarmDevices = (farmName) => robots.filter((r) => r.farm === farmName);

  const getFarmStatus = (farmRobots) => {
    if (farmRobots.length === 0) return { label: 'Inactive', cls: 'bg-[#F1F3F4] text-text-placeholder' };
    if (farmRobots.some((r) => r.status === 'Active')) return { label: 'Active', cls: 'bg-brand-light text-[#137333]' };
    if (farmRobots.every((r) => r.status === 'Offline')) return { label: 'Offline', cls: 'bg-danger-bg text-danger-text' };
    return { label: 'Idle', cls: 'bg-warning-bg text-warning-text' };
  };

  const activeRobots = robots.filter((r) => r.status === 'Active').length;

  const filteredFarms = useMemo(() => {
    if (!searchTerm.trim()) return farms;
    const q = searchTerm.toLowerCase();
    return farms.filter((f) => f.name.toLowerCase().includes(q) || f.location.toLowerCase().includes(q) || f.owner.toLowerCase().includes(q));
  }, [farms, searchTerm]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-semibold">Farm Management</div>
          <div className="text-sm text-text-secondary mt-1">View and manage agricultural properties</div>
        </div>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        {[
          { icon: 'ti-building-cottage', val: String(farms.length), label: 'Total Farms' },
          { icon: 'ti-map-pin', val: String(regions.length), label: 'Regions' },
          { icon: 'ti-seedling', val: String(cropTypes.length), label: 'Crop Types' },
          { icon: 'ti-robot', val: String(activeRobots), label: 'Active Robots' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 bg-white border border-[#EAEAEA] rounded-lg px-4 py-2.5 text-xs text-text-secondary">
            <i className={`ti ${item.icon} text-lg`} style={{ color: '#2B7A3E' }} />
            <strong className="text-[#111] text-sm mr-0.5">{item.val}</strong> {item.label}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col items-stretch mb-4">
          <div className="text-sm font-semibold mb-3">All Farms ({farms.length})</div>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search farms by name, location, or owner..."
            aria-label="Search farms"
            className={inputClass}
          />
        </div>

        {filteredFarms.length === 0 ? (
          <div className="py-12 text-center text-text-secondary text-sm">No farms found matching your criteria.</div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Farm name</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Owner</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Crop</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Soil</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Location</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Connected Devices</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Status</th></tr>
            </thead>
            <tbody>
              {filteredFarms.map((f, i) => {
                const farmRobots = getFarmDevices(f.name);
                const status = getFarmStatus(farmRobots);
                return (
                  <tr key={i}>
                    <td className="px-4 py-4 border-b border-[#F1F3F4]"><strong className="text-[#111] font-medium">{f.name}</strong></td>
                    <td className="px-4 py-4 border-b border-[#F1F3F4] text-text-secondary">{f.owner}</td>
                    <td className="px-4 py-4 border-b border-[#F1F3F4] text-text-secondary">{f.crop}</td>
                    <td className="px-4 py-4 border-b border-[#F1F3F4] text-text-secondary">{f.soil}</td>
                    <td className="px-4 py-4 border-b border-[#F1F3F4] text-text-secondary">{f.location}</td>
                    <td className="px-4 py-4 border-b border-[#F1F3F4] text-text-secondary">{farmRobots.length}</td>
                    <td className="px-4 py-4 border-b border-[#F1F3F4]"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${status.cls}`}>{status.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
