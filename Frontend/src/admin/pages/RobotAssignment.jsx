import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUsers } from '../../context/UserContext';
import { QrCode, User, CheckCircle, AlertTriangle, Bot, Pencil, Trash2, X } from 'lucide-react';
import { mockRobots, mockHistory, modelOptions, statusOptions } from '../../data/mockRobotAssignments';
import QRCodeLib from 'qrcode';

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

function Select({ options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={{ background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '8px', color: '#111827', fontSize: '14px', height: '40px', padding: '0 36px 0 12px', width: '100%', outline: 'none', boxSizing: 'border-box', cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left', position: 'relative' }}>
        <span style={{ color: value ? '#111827' : '#9CA3AF' }}>{value || placeholder}</span>
        <i className="ph ph-caret-down" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', fontSize: '12px' }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', zIndex: 100, top: '100%', left: 0, right: 0, marginTop: '4px', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.5)', maxHeight: '160px', overflowY: 'auto', background: 'rgba(255,255,255,0.98)' }}>
          {options.map((opt) => {
            const selected = opt === value;
            return (
              <div key={opt} onClick={() => { onChange(opt); setOpen(false); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', fontSize: '13px', cursor: 'pointer', background: selected ? 'rgba(76,175,80,0.08)' : 'transparent', color: selected ? '#2e7d2e' : '#111827' }}>
                <span>{opt}</span>
                {selected && <i className="ph ph-check" style={{ fontSize: '12px', color: '#2e7d2e' }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const statusBadge = (status) => {
  const map = {
    Active: { dot: '#4caf50', text: '#2e7d2e' },
    Assigned: { dot: '#22C55E', text: '#166534' },
    Available: { dot: '#9CA3AF', text: '#6B7280' },
    Maintenance: { dot: '#F59E0B', text: '#D97706' },
    Inactive: { dot: '#EF4444', text: '#DC2626' },
    Lost: { dot: '#DC2626', text: '#991B1B' },
  };
  const c = map[status] || { dot: '#9CA3AF', text: '#6B7280' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.dot, display: 'inline-block', flexShrink: 0 }} />
      <span style={{ fontSize: '13px', fontWeight: 500, color: c.text }}>{status}</span>
    </span>
  );
};

const actionPill = (action) => {
  const map = {
    Assigned: { bg: 'rgba(76,175,80,0.12)', color: '#2e7d2e' },
    Reassigned: { bg: 'rgba(59,130,246,0.12)', color: '#1d4ed8' },
    Maintenance: { bg: 'rgba(245,158,11,0.12)', color: '#D97706' },
    Deactivated: { bg: 'rgba(239,68,68,0.12)', color: '#DC2626' },
    Available: { bg: 'rgba(156,163,175,0.12)', color: '#6B7280' },
  };
  const c = map[action] || { bg: 'rgba(156,163,175,0.12)', color: '#6B7280' };
  return (
    <span className="px-3 py-1 rounded-full text-[11px] font-semibold" style={{ background: c.bg, color: c.color }}>{action}</span>
  );
};

const glassInput = "text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-gray-300 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder text-primary cursor-text hover:border-gray-400";

const btnPrimary = "bg-brand text-white border-none rounded-xl px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(46,125,50,0.35)]";

const inputBase = {
  background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '8px',
  color: '#111827', fontSize: '14px', height: '40px', padding: '0 12px',
  width: '100%', outline: 'none', boxSizing: 'border-box',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'text',
};
const inputFocus = (e) => { e.currentTarget.style.borderColor = '#4caf50'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)'; };
const inputBlur = (e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none'; };
const inputHoverEnter = (e) => e.currentTarget.style.borderColor = '#9CA3AF';
const inputHoverLeave = (e) => e.currentTarget.style.borderColor = '#D1D5DB';

export default function RobotAssignment() {
  const { users } = useUsers();
  const farmerNames = users.length ? users.map((u) => u.name) : [];

  const [robots, setRobots] = useState(mockRobots);
  const [history, setHistory] = useState(mockHistory);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [genForm, setGenForm] = useState({ model: 'AB-X1000', notes: '' });
  const [editForm, setEditForm] = useState({ farmer: '', status: '' });
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [qrCodes, setQrCodes] = useState({});
  const [qrLoading, setQrLoading] = useState(true);
  const [qrErrors, setQrErrors] = useState({});

  const total = robots.length;
  const assigned = robots.filter((r) => r.status === 'Assigned' || r.status === 'Active').length;
  const available = robots.filter((r) => r.status === 'Available').length;
  const needsAttention = robots.filter((r) => r.status === 'Maintenance' || r.status === 'Lost').length;

  const tabs = useMemo(() => [
    { key: 'all', label: `All (${total})` },
    { key: 'available', label: `Available (${robots.filter(r => r.status === 'Available').length})` },
    { key: 'assigned', label: `Assigned (${robots.filter(r => r.status === 'Assigned').length})` },
    { key: 'active', label: `Active (${robots.filter(r => r.status === 'Active').length})` },
    { key: 'maintenance', label: `Maintenance (${robots.filter(r => r.status === 'Maintenance').length})` },
    { key: 'lost', label: `Lost (${robots.filter(r => r.status === 'Lost').length})` },
  ], [robots]);

  const filteredRobots = useMemo(() => {
    let result = robots;
    if (activeTab !== 'all') {
      result = result.filter((r) => r.status.toLowerCase() === activeTab);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((r) =>
        r.id.toLowerCase().includes(q) ||
        (r.farmer || '').toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
      );
    }
    return result;
  }, [robots, activeTab, searchTerm]);

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [history]);

  const openGenerate = () => {
    // TODO: Replace with real backend API call
    const nextId = `ROB-${String(robots.length + 1).padStart(4, '0')}`;
    setGenForm({ model: 'AB-X1000', notes: '' });
    setShowGenerateModal(true);
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    const nextId = `ROB-${String(robots.length + 1).padStart(4, '0')}`;
    const newRobot = {
      id: nextId,
      model: genForm.model,
      farmer: null,
      status: 'Available',
      registered: new Date().toISOString().slice(0, 10),
    };
    setRobots([...robots, newRobot]);
    setHistory([{ robotId: nextId, action: 'Available', farmer: '—', by: 'Admin User', date: new Date().toISOString().slice(0, 10) }, ...history]);
    setShowGenerateModal(false);
    // TODO: Replace with real backend API call
  };

  const openEdit = (robot) => {
    setEditForm({ farmer: robot.farmer || '', status: robot.status });
    setShowEditModal(robot);
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    setRobots(robots.map((r) =>
      r.id === showEditModal.id
        ? { ...r, farmer: editForm.farmer || null, status: editForm.status }
        : r
    ));
    setHistory([{ robotId: showEditModal.id, action: editForm.status, farmer: editForm.farmer || '—', by: 'Admin User', date: new Date().toISOString().slice(0, 10) }, ...history]);
    setShowEditModal(null);
    // TODO: Replace with real backend API call
  };

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') { setShowGenerateModal(false); setShowQRModal(null); setShowEditModal(null); } };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const generateQRCodes = async () => {
      const codes = {};
      const errors = {};
      for (const robot of robots) {
        try {
          // TODO: Replace Robot ID string with a secure token from backend once available
          codes[robot.id] = await QRCodeLib.toDataURL(robot.id, {
            width: 200,
            errorCorrectionLevel: 'M',
            color: { dark: '#166534', light: '#ffffff' },
            margin: 2,
          });
        } catch {
          errors[robot.id] = true;
        }
      }
      setQrCodes(codes);
      setQrErrors(errors);
      setQrLoading(false);
    };
    generateQRCodes();
  }, [robots]);

  const handleDownloadQR = (robotId) => {
    if (!qrCodes[robotId]) return;
    const link = document.createElement('a');
    link.href = qrCodes[robotId];
    link.download = `${robotId}-qr.png`;
    link.click();
  };

  const handlePrintQR = (robotId) => {
    if (!qrCodes[robotId]) return;
    const win = window.open('');
    if (win) {
      win.document.write(`<img src="${qrCodes[robotId]}" style="display:block;margin:40px auto;max-width:90vw" onload="window.print();window.close()" />`);
      win.document.close();
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-bold text-primary">Robot Assignment System</div>
          <div className="text-sm text-text-secondary mt-1">Manage robot registration, QR codes, and farmer assignments</div>
        </div>
        <button onClick={openGenerate} className={btnPrimary}><i className="ph ph-plus" /> Generate Robot</button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-secondary mb-2">Total Robots</div>
              <div className="text-3xl font-extrabold text-primary">{total}</div>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(107,114,128,0.12)' }}>
              <Bot size={18} color="#6B7280" />
            </div>
          </div>
        </GlowCard>
        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-secondary mb-2">Assigned</div>
              <div className="text-3xl font-extrabold text-primary">{assigned}</div>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(46,125,50,0.12)' }}>
              <User size={18} color="#2e7d2e" />
            </div>
          </div>
        </GlowCard>
        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-secondary mb-2">Available</div>
              <div className="text-3xl font-extrabold text-primary">{available}</div>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.12)' }}>
              <CheckCircle size={18} color="#3b82f6" />
            </div>
          </div>
        </GlowCard>
        <GlowCard className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-secondary mb-2">Needs Attention</div>
              <div className="text-3xl font-extrabold text-primary">{needsAttention}</div>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)' }}>
              <AlertTriangle size={18} color="#F59E0B" />
            </div>
          </div>
        </GlowCard>
      </div>

      {/* Robot Registry Table */}
      <div className="rounded-[20px] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', contentVisibility: 'auto', willChange: 'transform' }}>
        <div className="flex flex-col items-stretch mb-5">
          <div className="text-sm font-semibold text-primary mb-3">All Robots ({total})</div>
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search robots by ID, farmer, or status..." aria-label="Search robots" className={glassInput} />
        </div>

        <div className="flex gap-6 mb-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
          {tabs.map((tab) => (
            <div
              key={tab.key}
              className={`pb-2 text-sm cursor-pointer border-b-2 -mb-px transition-colors ${activeTab === tab.key ? 'text-brand border-brand font-medium' : 'text-text-secondary border-transparent'}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {filteredRobots.length === 0 ? (
          <div className="py-12 text-center text-text-secondary text-sm">No robots found matching your criteria.</div>
        ) : (
          <table className="w-full border-collapse text-sm" style={{ userSelect: 'none' }}>
            <colgroup>
              <col style={{ width: 120 }} />
              <col style={{ width: 80 }} />
              <col />
              <col style={{ width: 100 }} />
              <col style={{ width: 130 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 80 }} />
            </colgroup>
            <thead>
              <tr>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Robot ID</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>QR Code</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Farmer Assigned</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Model</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Status</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Registered</th>
                <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRobots.map((r, i) => (
                <tr key={i}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f8f1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  style={{ transition: 'background 0.15s ease' }}
                >
                  <td className="px-5 py-3 border-b font-medium text-primary" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>{r.id}</td>
                  <td className="px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                    {qrLoading ? (
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: '#F3F4F6' }} />
                    ) : qrErrors[r.id] ? (
                      <span className="text-[11px] text-danger-text">⚠ Failed to generate</span>
                    ) : (
                      <img src={qrCodes[r.id]} alt={`QR for ${r.id}`}
                        title={`View QR Code for ${r.id}`}
                        onClick={() => setShowQRModal(r)}
                        style={{ width: 28, height: 28, borderRadius: 6, cursor: 'pointer', display: 'block', transition: 'opacity 0.15s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                      />
                    )}
                  </td>
                  <td className="px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                    {r.farmer
                      ? <span className="font-medium text-primary">{r.farmer}</span>
                      : <span className="italic text-text-secondary">— Unassigned —</span>
                    }
                  </td>
                  <td className="px-5 py-3 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>{r.model}</td>
                  <td className="px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>{statusBadge(r.status)}</td>
                  <td className="px-5 py-3 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>{r.registered}</td>
                  <td className="px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                    <div className="flex gap-3 items-center">
                      <button title="Edit Assignment" onClick={() => openEdit(r)} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary text-lg transition-all duration-200 hover:scale-110">
                        <Pencil size={18} />
                      </button>
                      <button title="Remove" onClick={() => {
                        setRobots(robots.filter((x) => x.id !== r.id));
                        setHistory([{ robotId: r.id, action: 'Deactivated', farmer: r.farmer || '—', by: 'Admin User', date: new Date().toISOString().slice(0, 10) }, ...history]);
                      }} className="bg-none border-none cursor-pointer text-text-placeholder hover:text-danger-text text-lg transition-all duration-200 hover:scale-110">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Assignment History */}
      <div className="rounded-[20px] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50 mt-6" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', contentVisibility: 'auto', willChange: 'transform' }}>
        <div className="mb-5">
          <div className="text-sm font-semibold text-primary">Assignment History</div>
          <div className="text-xs text-text-secondary mt-1">Log of all robot assignments and reassignments</div>
        </div>
        <table className="w-full border-collapse text-sm" style={{ userSelect: 'none' }}>
          <thead>
            <tr>
              <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Robot ID</th>
              <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Action</th>
              <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Farmer</th>
              <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Performed By</th>
              <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {(showAllHistory ? sortedHistory : sortedHistory.slice(0, 5)).map((h, i) => (
              <tr key={i}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f8f1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                style={{ transition: 'background 0.15s ease' }}
              >
                <td className="px-5 py-5 border-b font-medium text-primary" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>{h.robotId}</td>
                <td className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>{actionPill(h.action)}</td>
                <td className="px-5 py-5 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>{h.farmer}</td>
                <td className="px-5 py-5 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>{h.by}</td>
                <td className="px-5 py-5 border-b text-text-secondary" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>{h.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 text-center">
          <button type="button" onClick={() => setShowAllHistory(!showAllHistory)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2e7d2e', fontSize: '13px', fontWeight: 500, transition: 'color 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#1a5c2a'; e.currentTarget.style.textDecoration = 'underline'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#2e7d2e'; e.currentTarget.style.textDecoration = 'none'; }}
          >
            {showAllHistory ? 'Show less \u2191' : `View all ${sortedHistory.length} entries \u2192`}
          </button>
        </div>
      </div>

      {/* Generate Robot Modal */}
      {showGenerateModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={() => setShowGenerateModal(false)}>
          <div className="w-[560px] max-w-[calc(100vw-32px)] rounded-[24px] p-7 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60" onClick={(e) => e.stopPropagation()}
            style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #4caf50, #2e7d2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={20} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>Generate New Robot</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>Create a new robot entry and generate its QR code</div>
                </div>
              </div>
              <button type="button" onClick={() => setShowGenerateModal(false)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#98989D', padding: '4px', display: 'flex', transition: 'color 0.15s ease, transform 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
              ><X size={20} /></button>
            </div>
            <form onSubmit={handleGenerate}>
              <div style={{ background: 'rgba(255,255,255,0.75)', borderRadius: '16px', padding: '20px 24px', border: '1px solid rgba(255,255,255,0.5)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                  <Bot size={15} color="#4caf50" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Robot Details</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 32px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Bot size={12} style={{ color: '#9CA3AF' }} /> Robot ID
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input value={`ROB-${String(robots.length + 1).padStart(4, '0')}`} disabled
                        style={{ ...inputBase, background: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed' }}
                      />
                      <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: '#9CA3AF' }}>Auto-generated</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <i className="ph ph-chip" style={{ fontSize: '12px', color: '#9CA3AF' }} /> Model
                    </div>
                    <Select options={modelOptions} value={genForm.model} onChange={(v) => setGenForm({ ...genForm, model: v })} placeholder="Select model" />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <i className="ph ph-note" style={{ fontSize: '12px', color: '#9CA3AF' }} /> Notes
                    </div>
                    <input value={genForm.notes} onChange={(e) => setGenForm({ ...genForm, notes: e.target.value })} placeholder="Optional notes"
                      style={inputBase} onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                    />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowGenerateModal(false)}
                  style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.15)', color: '#4B5563', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s ease', padding: '9px 18px', fontSize: '13px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >Cancel</button>
                <button type="submit"
                  style={{ background: '#4caf50', color: '#FFFFFF', fontWeight: 600, borderRadius: '12px', padding: '9px 20px', cursor: 'pointer', transition: 'all 0.2s ease', border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(46,125,50,0.35)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '1'; }}
                ><i className="ph ph-check" /> Generate Robot</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* View QR Code Modal */}
      {showQRModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={() => setShowQRModal(null)}>
          <div className="w-[400px] max-w-[calc(100vw-32px)] rounded-[24px] p-7 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60" onClick={(e) => e.stopPropagation()}
            style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #4caf50, #2e7d2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <QrCode size={20} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>QR Code — {showQRModal.id}</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>Robot identification QR code</div>
                </div>
              </div>
              <button type="button" onClick={() => setShowQRModal(null)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#98989D', padding: '4px', display: 'flex', transition: 'color 0.15s ease, transform 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
              ><X size={20} /></button>
            </div>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              {qrCodes[showQRModal.id] ? (
                <img src={qrCodes[showQRModal.id]} alt={`QR Code for ${showQRModal.id}`}
                  style={{ width: 200, height: 200, borderRadius: 16, border: '2px solid #e5e7eb', padding: 12, background: '#ffffff', display: 'inline-block' }}
                />
              ) : (
                <div style={{ width: 200, height: 200, borderRadius: 16, border: '2px solid #e5e7eb', background: '#F3F4F6', margin: '0 auto' }} />
              )}
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginTop: '16px' }}>{showQRModal.id}</div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>{showQRModal.farmer || '— Unassigned —'}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '8px' }}>
              <button type="button" onClick={() => handleDownloadQR(showQRModal.id)}
                style={{ background: 'transparent', border: '1px solid #D1D5DB', color: '#4B5563', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s ease', padding: '9px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = '#9CA3AF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              ><i className="ph ph-download" /> Download QR</button>
              <button type="button" onClick={() => handlePrintQR(showQRModal.id)}
                style={{ background: 'transparent', border: '1px solid #D1D5DB', color: '#4B5563', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s ease', padding: '9px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = '#9CA3AF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              ><i className="ph ph-printer" /> Print QR</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Assignment Modal */}
      {showEditModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={() => setShowEditModal(null)}>
          <div className="w-[560px] max-w-[calc(100vw-32px)] rounded-[24px] p-7 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60" onClick={(e) => e.stopPropagation()}
            style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #4caf50, #2e7d2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Pencil size={20} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>Edit Robot Assignment</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>Reassign or update this robot's status</div>
                </div>
              </div>
              <button type="button" onClick={() => setShowEditModal(null)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#98989D', padding: '4px', display: 'flex', transition: 'color 0.15s ease, transform 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
              ><X size={20} /></button>
            </div>
            <form onSubmit={handleEditSave}>
              <div style={{ background: 'rgba(255,255,255,0.75)', borderRadius: '16px', padding: '20px 24px', border: '1px solid rgba(255,255,255,0.5)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                  <Pencil size={15} color="#4caf50" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Assignment Details</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 32px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Bot size={12} style={{ color: '#9CA3AF' }} /> Robot ID
                    </div>
                    <div style={{ ...inputBase, background: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed', display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '14px', height: '40px' }}>{showEditModal.id}</div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <User size={12} style={{ color: '#9CA3AF' }} /> Current Farmer
                    </div>
                    <div style={{ ...inputBase, background: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed', display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '14px', height: '40px' }}>{showEditModal.farmer || '— Unassigned —'}</div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <User size={12} style={{ color: '#9CA3AF' }} /> Assign To
                    </div>
                    <Select options={farmerNames.length ? farmerNames : ['—']} value={editForm.farmer} onChange={(v) => setEditForm({ ...editForm, farmer: v })} placeholder="Select farmer" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <i className="ph ph-circle" style={{ fontSize: '12px', color: '#9CA3AF' }} /> Status
                    </div>
                    <Select options={statusOptions} value={editForm.status} onChange={(v) => setEditForm({ ...editForm, status: v })} placeholder="Select status" />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowEditModal(null)}
                  style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.15)', color: '#4B5563', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s ease', padding: '9px 18px', fontSize: '13px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >Cancel</button>
                <button type="submit"
                  style={{ background: '#4caf50', color: '#FFFFFF', fontWeight: 600, borderRadius: '12px', padding: '9px 20px', cursor: 'pointer', transition: 'all 0.2s ease', border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(46,125,50,0.35)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '1'; }}
                ><i className="ph ph-check" /> Save Assignment</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
