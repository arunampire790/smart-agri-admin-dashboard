import { useState, useMemo } from 'react';
import { useFarms } from '../../context/FarmContext';

const inputClass = "text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)] w-full";
const labelClass = "text-xs font-medium text-[#111]";
const cancelBtnClass = "text-xs px-3.5 py-1.5 border border-[#EAEAEA] rounded-lg cursor-pointer bg-white text-text-secondary font-medium hover:bg-[#F1F3F4]";
const submitBtnClass = "bg-brand text-white border-none rounded-lg px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 hover:opacity-90";
const modalOverlay = "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm";
const modalBox = "bg-white rounded-xl p-6 w-[460px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative";

export default function Farms() {
  const { farms, updateFarm, removeFarm } = useFarms();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewFarm, setViewFarm] = useState(null);
  const [editFarm, setEditFarm] = useState(null);
  const [deleteFarm, setDeleteFarm] = useState(null);
  const [form, setForm] = useState({ name: '', location: '', owner: '' });
  const [errors, setErrors] = useState({});

  const regions = useMemo(() => [...new Set(farms.map((f) => f.location.split(', ')[1] + ', ' + f.location.split(', ')[0]))], [farms]);
  const cropTypes = useMemo(() => [...new Set(farms.map((f) => f.crop))], [farms]);

  const filteredFarms = useMemo(() => {
    if (!searchTerm.trim()) return farms;
    const q = searchTerm.toLowerCase();
    return farms.filter((f) => f.name.toLowerCase().includes(q) || f.location.toLowerCase().includes(q) || f.owner.toLowerCase().includes(q));
  }, [farms, searchTerm]);

  const openView = (farm) => setViewFarm(farm);

  const openEdit = (farm) => {
    setForm({ name: farm.name, location: farm.location, owner: farm.owner, crop: farm.crop, soil: farm.soil });
    setErrors({});
    setEditFarm(farm);
  };

  const openDelete = (farm) => setDeleteFarm(farm);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Farm name is required';
    if (!form.location.trim()) errs.location = 'Location is required';
    if (!form.owner.trim()) errs.owner = 'Owner is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    updateFarm(editFarm, { name: form.name.trim(), location: form.location.trim(), owner: form.owner.trim(), crop: form.crop, soil: form.soil });
    setEditFarm(null);
  };

  const handleDelete = () => {
    removeFarm(deleteFarm);
    setDeleteFarm(null);
  };

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
          { icon: 'ti-robot', val: String(farms.length), label: 'Active Robots' },
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
              <tr><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Farm name</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Owner</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Crop</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Soil</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Location</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Robot</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Status</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold border-b border-[#EAEAEA]">Actions</th></tr>
            </thead>
            <tbody>
              {filteredFarms.map((f, i) => (
                <tr key={i}>
                  <td className="px-4 py-4 border-b border-[#F1F3F4]"><strong className="text-[#111] font-medium">{f.name}</strong></td>
                  <td className="px-4 py-4 border-b border-[#F1F3F4] text-text-secondary">{f.owner}</td>
                  <td className="px-4 py-4 border-b border-[#F1F3F4] text-text-secondary">{f.crop}</td>
                  <td className="px-4 py-4 border-b border-[#F1F3F4] text-text-secondary">{f.soil}</td>
                  <td className="px-4 py-4 border-b border-[#F1F3F4] text-text-secondary">{f.location}</td>
                  <td className="px-4 py-4 border-b border-[#F1F3F4] text-text-secondary">{f.robot}</td>
                  <td className="px-4 py-4 border-b border-[#F1F3F4]"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${f.cls}`}>{f.status}</span></td>
                  <td className="px-4 py-4 border-b border-[#F1F3F4]">
                    <div className="flex gap-3 items-center">
                      <button title="View" onClick={() => openView(f)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-lg"><i className="ti ti-eye" /></button>
                      <button title="Edit" onClick={() => openEdit(f)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-lg"><i className="ti ti-edit" /></button>
                      <button title="Delete" onClick={() => openDelete(f)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-danger-text text-lg"><i className="ti ti-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View Farm Modal */}
      {viewFarm && (
        <div className={modalOverlay} onClick={() => setViewFarm(null)}>
          <div className={modalBox} onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-[#111] mb-1">Farm Details</div>
            <div className="text-xs text-text-secondary mb-5">Viewing information for {viewFarm.name}.</div>
            <div className="space-y-4">
              {[
                { label: 'Farm Name', value: viewFarm.name },
                { label: 'Owner', value: viewFarm.owner },
                { label: 'Location', value: viewFarm.location },
                { label: 'Size', value: viewFarm.size },
                { label: 'Crop Types', value: viewFarm.cropTypes },
                { label: 'Connected Devices', value: viewFarm.devices },
                { label: 'Status', value: viewFarm.status },
              ].map((field) => (
                <div key={field.label} className="flex flex-col gap-1">
                  <span className={labelClass}>{field.label}</span>
                  <div className="text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] text-[#111] w-full">{field.value}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setViewFarm(null)} className={cancelBtnClass}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Farm Modal */}
      {editFarm && (
        <div className={modalOverlay}>
          <div className={modalBox}>
            <div className="text-lg font-bold text-[#111] mb-1">Edit Farm Details</div>
            <div className="text-xs text-text-secondary mb-5">Update information for {editFarm.name}.</div>
            <form onSubmit={handleEdit}>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={labelClass}>Farm Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter farm name" className={inputClass} />
                {errors.name && <span className="text-[10px] text-danger-text">{errors.name}</span>}
              </div>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className={labelClass}>Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Enter location" className={inputClass} />
                {errors.location && <span className="text-[10px] text-danger-text">{errors.location}</span>}
              </div>
              <div className="flex flex-col gap-1.5 mb-6">
                <label className={labelClass}>Owner</label>
                <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="Enter owner name" className={inputClass} />
                {errors.owner && <span className="text-[10px] text-danger-text">{errors.owner}</span>}
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditFarm(null)} className={cancelBtnClass}>Cancel</button>
                <button type="submit" className={submitBtnClass}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteFarm && (
        <div className={modalOverlay} onClick={() => setDeleteFarm(null)}>
          <div className="bg-white rounded-xl p-6 w-[400px] shadow-[0_4px_20px_rgba(0,0,0,0.02)]" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-[#111] mb-2">Delete Farm?</div>
            <div className="text-sm text-text-secondary mb-6">
              Are you sure you want to remove <strong className="text-[#111] font-medium">{deleteFarm.name}</strong>? This will detach all registered robots.
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteFarm(null)} className={cancelBtnClass}>Cancel</button>
              <button onClick={handleDelete} className="bg-danger-bg text-danger-text border-none rounded-lg px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 hover:opacity-90">
                <i className="ti ti-trash" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
