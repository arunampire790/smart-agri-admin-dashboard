import { useState, useRef, useEffect } from 'react';
import { useRobots } from '../../context/RobotContext';
import { useUsers } from '../../context/UserContext';
import { useFarms } from '../../context/FarmContext';

const models = ['AB-X1000', 'AB-X2000', 'AB-X3000'];
const farms = ['Green Valley Farm', 'Sunrise Orchards', 'Golden Harvest', 'Maple Ridge Farm', 'River Bend Agriculture', 'Highland Crops', 'Coastal Farms', 'Valley View Ranch'];
const statuses = ['Active', 'Idle', 'Offline'];

const statusOpts = {
  Active: { stCls: 'bg-brand-light text-brand-dark' },
  Idle: { stCls: 'bg-warning-bg text-warning-text' },
  Offline: { stCls: 'bg-danger-bg text-danger-text' },
};

const inputClass = "text-sm px-3.5 py-2.5 rounded-xl bg-[#7676801F] outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder";
const labelClass = "text-xs font-medium text-[#1C1C1E]";
const cancelBtnClass = "text-xs px-3.5 py-1.5 border border-[rgba(0,0,0,0.05)] rounded-xl cursor-pointer bg-white text-text-secondary font-medium hover:bg-[#E5E5EA]";
const submitBtnClass = "bg-brand text-white border-none rounded-xl px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 hover:opacity-90";
const modalOverlay = "fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm";
const modalBox = "bg-white rounded-2xl p-6 w-[450px] shadow-[0_4px_20px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] relative";

function Select({ options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`text-sm px-3.5 py-2.5 rounded-xl bg-[#7676801F] w-full flex items-center justify-between cursor-pointer border-none ${
          open ? 'shadow-[0_0_0_2px_rgba(52,199,89,0.3)]' : ''
        }`}
      >
        <span className={value ? 'text-[#1C1C1E]' : 'text-text-placeholder'}>
          {value || placeholder}
        </span>
        <i className={`ti ti-chevron-down text-text-placeholder text-sm transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-[100] top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[rgba(0,0,0,0.05)] shadow-[0_4px_16px_rgba(0,0,0,0.08)] max-h-48 overflow-y-auto">
          {options.map((opt) => {
            const selected = opt === value;
            return (
              <div
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`flex items-center justify-between px-3.5 py-2.5 text-sm cursor-pointer ${
                  selected ? 'bg-brand-light text-brand-dark' : 'text-[#1C1C1E] hover:bg-brand-light hover:text-brand-dark'
                }`}
              >
                <span>{opt}</span>
                {selected && <i className="ti ti-check text-sm text-brand-dark" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FormFields({ form, setForm, errors, userNames }) {
  return (
    <>
      <div className="flex flex-col gap-1.5 mb-4">
        <label className={labelClass}>Robot Name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., AgriBot Alpha" className={inputClass} />
        {errors.name && <span className="text-[10px] text-danger-text">{errors.name}</span>}
      </div>
      <div className="flex flex-col gap-1.5 mb-4">
        <label className={labelClass}>Robot ID</label>
        <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="e.g., AgriBot-001" className={inputClass} />
        {errors.id && <span className="text-[10px] text-danger-text">{errors.id}</span>}
      </div>
      <div className="flex flex-col gap-1.5 mb-4">
        <label className={labelClass}>Model</label>
        <Select options={models} value={form.model} onChange={(v) => setForm({ ...form, model: v })} />
      </div>
      <div className="flex flex-col gap-1.5 mb-4">
        <label className={labelClass}>Owner</label>
        <Select options={userNames} value={form.owner} onChange={(v) => setForm({ ...form, owner: v })} placeholder="No users available" />
      </div>
      <div className="flex flex-col gap-1.5 mb-4">
        <label className={labelClass}>Assigned Farm</label>
        <Select options={farms} value={form.farm} onChange={(v) => setForm({ ...form, farm: v })} />
      </div>
      <div className="flex flex-col gap-1.5 mb-6">
        <label className={labelClass}>Status</label>
        <Select options={statuses} value={form.status} onChange={(v) => setForm({ ...form, status: v })} />
      </div>
    </>
  );
}

export default function Robots() {
  const { robots, addRobot, updateRobot, removeRobot } = useRobots();
  const { users } = useUsers();
  const { farms, addFarm, updateFarm } = useFarms();
  const userNames = users.length ? users.map((u) => u.name) : [];
  const defaultOwner = userNames.length ? userNames[0] : '';
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRobot, setEditRobot] = useState(null);
  const [deleteRobot, setDeleteRobot] = useState(null);
  const [form, setForm] = useState({ name: '', id: '', model: 'AB-X1000', owner: defaultOwner, farm: 'Green Valley Farm', status: 'Idle' });
  const [errors, setErrors] = useState({});

  const openAdd = () => {
    setForm({ name: '', id: '', model: 'AB-X1000', owner: defaultOwner, farm: 'Green Valley Farm', status: 'Idle' });
    setErrors({});
    setShowAddModal(true);
  };

  const openEdit = (robot) => {
    setForm({ name: robot.name, id: robot.id, model: robot.model, owner: robot.owner || '', farm: robot.farm, status: robot.status });
    setErrors({});
    setEditRobot(robot);
  };

  const openDelete = (robot) => setDeleteRobot(robot);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Robot name is required';
    if (!form.id.trim()) errs.id = 'Robot ID is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!validate()) return;
    addRobot({
      name: form.name.trim(),
      id: form.id.trim(),
      farm: form.farm,
      model: form.model,
      owner: form.owner,
      battery: 100,
      batCls: 'bg-brand-dark',
      status: form.status,
      stCls: statusOpts[form.status].stCls,
    });
    const targetFarm = farms.find((f) => f.name === form.farm);
    if (targetFarm) {
      updateFarm(targetFarm, { owner: form.owner });
    } else {
      addFarm({ name: form.farm, owner: form.owner, crop: '—', soil: '—', location: '—', robot: '—', status: 'Inactive', cls: 'bg-[#7676801F] text-text-placeholder', size: '—', cropTypes: '—', devices: '0' });
    }
    setShowAddModal(false);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    updateRobot(editRobot, {
      name: form.name.trim(),
      id: form.id.trim(),
      farm: form.farm,
      model: form.model,
      owner: form.owner,
      status: form.status,
      stCls: statusOpts[form.status].stCls,
    });
    const targetFarm = farms.find((f) => f.name === form.farm);
    if (targetFarm) {
      updateFarm(targetFarm, { owner: form.owner });
    } else {
      addFarm({ name: form.farm, owner: form.owner, crop: '—', soil: '—', location: '—', robot: '—', status: 'Inactive', cls: 'bg-[#7676801F] text-text-placeholder', size: '—', cropTypes: '—', devices: '0' });
    }
    setEditRobot(null);
  };

  const handleDelete = () => {
    removeRobot(deleteRobot);
    setDeleteRobot(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-bold text-[#000000]">Robot Management</div>
          <div className="text-sm text-text-secondary mt-1">Monitor and control agricultural robots</div>
        </div>
        <button onClick={openAdd} className={submitBtnClass}>
          <i className="ti ti-plus" /> Add Robot
        </button>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        {[
          { icon: 'ti-robot', cls: 'bg-brand-light text-brand-dark', val: '4', label: 'Online', foot: '85–100% battery' },
          { icon: 'ti-player-pause', cls: 'bg-warning-bg text-warning-text', val: '3', label: 'Idle', foot: '45–62% battery' },
          { icon: 'ti-tool', cls: 'bg-[#E8EAF6] text-[#1A73E8]', val: '0', label: 'Maintenance', foot: 'N/A' },
          { icon: 'ti-plug-off', cls: 'bg-danger-bg text-danger-text', val: '1', label: 'Offline', foot: '12% battery last seen' },
        ].map((item, i) => (
          <div key={i} className="flex-1 min-w-[160px] bg-white border border-[rgba(0,0,0,0.05)] rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${item.cls}`}>
                <i className={`ti ${item.icon}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#000000] leading-tight">{item.val}</div>
                <div className="text-xs text-text-secondary">{item.label}</div>
              </div>
            </div>
            <div className="text-[10px] text-text-secondary border-t border-[rgba(0,0,0,0.05)] pt-2">{item.foot}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col items-stretch mb-4">
          <div className="text-sm font-semibold text-[#1C1C1E] mb-3">All Robots ({robots.length})</div>
          <input placeholder="Search robots by ID or model..." aria-label="Search robots" className={inputClass} />
        </div>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-[rgba(0,0,0,0.05)]">Name</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-[rgba(0,0,0,0.05)]">ID</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-[rgba(0,0,0,0.05)]">Owner</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-[rgba(0,0,0,0.05)]">Farm</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-[rgba(0,0,0,0.05)]">Model</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-[rgba(0,0,0,0.05)]">Battery</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-[rgba(0,0,0,0.05)]">Status</th><th className="text-left px-4 py-3 text-[10px] uppercase font-semibold text-text-secondary border-b border-[rgba(0,0,0,0.05)]">Actions</th></tr>
          </thead>
          <tbody>
            {robots.map((r, i) => (
              <tr key={i}>
                <td className="px-4 py-4 border-b border-[rgba(0,0,0,0.05)]"><strong className="text-[#1C1C1E] font-medium">{r.name}</strong></td>
                <td className="px-4 py-4 border-b border-[rgba(0,0,0,0.05)]"><code className="text-xs bg-[#7676801F] px-1.5 py-0.5 rounded-xl text-[#1C1C1E]">{r.id}</code></td>
                <td className="px-4 py-4 border-b border-[rgba(0,0,0,0.05)] text-text-secondary">{r.owner}</td>
                <td className="px-4 py-4 border-b border-[rgba(0,0,0,0.05)] text-text-secondary">{r.farm}</td>
                <td className="px-4 py-4 border-b border-[rgba(0,0,0,0.05)] text-text-secondary">{r.model}</td>
                <td className="px-4 py-4 border-b border-[rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-[#7676801F] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${r.batCls}`} style={{ width: `${r.battery}%` }} />
                    </div>
                    <span className="text-xs font-medium text-[#1C1C1E]">{r.battery}%</span>
                  </div>
                </td>
                <td className="px-4 py-4 border-b border-[rgba(0,0,0,0.05)]"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${r.stCls}`}>{r.status}</span></td>
                <td className="px-4 py-4 border-b border-[rgba(0,0,0,0.05)]">
                  <div className="flex gap-3 items-center">
                    <button title="Edit" onClick={() => openEdit(r)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-lg"><i className="ti ti-edit" /></button>
                    <button title="Delete" onClick={() => openDelete(r)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-danger-text text-lg"><i className="ti ti-trash" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className={modalOverlay}>
          <div className={modalBox}>
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-lg"><i className="ti ti-x" /></button>
            <div className="text-lg font-bold text-[#1C1C1E] mb-1">Add New Robot</div>
            <div className="text-xs text-text-secondary mb-5">Register a new agricultural robot.</div>
            <form onSubmit={handleAdd}>
              <FormFields form={form} setForm={setForm} errors={errors} userNames={userNames} />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className={cancelBtnClass}>Cancel</button>
                <button type="submit" className={submitBtnClass}>Add Robot</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editRobot && (
        <div className={modalOverlay}>
          <div className={modalBox}>
            <button onClick={() => setEditRobot(null)} className="absolute top-4 right-4 bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-lg"><i className="ti ti-x" /></button>
            <div className="text-lg font-bold text-[#1C1C1E] mb-1">Edit Robot</div>
            <div className="text-xs text-text-secondary mb-5">Update details for {editRobot.name}.</div>
            <form onSubmit={handleEdit}>
              <FormFields form={form} setForm={setForm} errors={errors} userNames={userNames} />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditRobot(null)} className={cancelBtnClass}>Cancel</button>
                <button type="submit" className={submitBtnClass}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteRobot && (
        <div className={modalOverlay} onClick={() => setDeleteRobot(null)}>
          <div className="bg-white rounded-2xl p-6 w-[400px] shadow-[0_4px_20px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)]" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-bold text-[#1C1C1E] mb-2">Delete Robot?</div>
            <div className="text-sm text-text-secondary mb-6">
              Are you sure you want to remove <strong className="text-[#1C1C1E] font-medium">{deleteRobot.name}</strong> ({deleteRobot.id}) from the fleet registry? This action cannot be reverted.
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteRobot(null)} className={cancelBtnClass}>Cancel</button>
              <button onClick={handleDelete} className="bg-danger-bg text-danger-text border-none rounded-xl px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 hover:opacity-90">
                <i className="ti ti-trash" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
