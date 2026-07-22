import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUsers } from '../../context/UserContext';
import { useRobots } from '../../context/RobotContext';
import { Bot, User, CheckCircle, AlertTriangle, Pencil, Trash2, X, UserCheck, UserX, Download, Printer, FileText, Activity } from 'lucide-react';
import { modelOptions, statusOptions } from '../../data/mockRobotAssignments';
import QRCodeLib from 'qrcode';
import UserProfileModal from '../components/UserProfileModal';
import { useT } from '../../i18n';

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
        transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 8px 24px rgba(26,46,26,0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
        border: '1px solid rgba(0,0,0,0.06)',
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
    Active: { dot: '#16a34a', text: '#16a34a' },
    Assigned: { dot: '#2e7d2e', text: '#2e7d2e' },
    Available: { dot: '#6b7280', text: '#6b7280' },
    Maintenance: { dot: '#f97316', text: '#f97316' },
    Inactive: { dot: '#dc2626', text: '#dc2626' },
    Lost: { dot: '#ef4444', text: '#ef4444' },
  };
  const c = map[status] || { dot: '#9CA3AF', text: '#6B7280' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.dot, display: 'inline-block', flexShrink: 0 }} />
      <span style={{ fontSize: '14px', fontWeight: 500, color: c.text }}>{status}</span>
    </span>
  );
};

const actionPill = (action) => {
  const map = {
    Generated: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
    Available: { bg: 'rgba(107,114,128,0.1)', color: '#6b7280' },
    Assigned: { bg: 'rgba(46,125,50,0.1)', color: '#2e7d2e' },
    Reassigned: { bg: 'rgba(59,130,246,0.12)', color: '#1d4ed8' },
    Unassigned: { bg: 'rgba(107,114,128,0.1)', color: '#6b7280' },
    Maintenance: { bg: 'rgba(249,115,22,0.1)', color: '#f97316' },
    Deactivated: { bg: 'rgba(239,68,68,0.1)', color: '#dc2626' },
    Deleted: { bg: 'rgba(239,68,68,0.1)', color: '#dc2626' },
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
  const t = useT('robotAssignment');
  const { users } = useUsers();
  const { robots, history, addRobot, bulkAddRobots, updateRobot, removeRobot, addHistoryEntry } = useRobots();
  const farmerNames = users.length ? users.map((u) => u.name) : [];
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeCard, setActiveCard] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [genForm, setGenForm] = useState({ quantity: 1, model: 'AB-X1000' });
  const [toast, setToast] = useState(null);
  const [sortGenerated, setSortGenerated] = useState(false);
  const [editForm, setEditForm] = useState({ farmer: '', status: '', model: '', notes: '' });
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [qrCodes, setQrCodes] = useState({});
  const [qrLoading, setQrLoading] = useState(true);
  const [qrErrors, setQrErrors] = useState({});
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [bulkAssignFarmer, setBulkAssignFarmer] = useState('');
  const [bulkAssignSelected, setBulkAssignSelected] = useState(new Set());

  const total = robots.length;
  const assigned = robots.filter((r) => r.farmer !== null && r.farmer !== '').length;
  const available = robots.filter((r) => r.status === 'Available').length;
  const unassigned = robots.filter((r) => !r.farmer || r.farmer.trim() === '').length;
  const needsAttention = robots.filter((r) => r.status === 'Maintenance' || r.status === 'Lost' || r.status === 'Inactive').length;

  const handleCardClick = (card, filter) => {
    setActiveCard(card);
    setActiveFilter(filter);
  };

  const handleTabClick = (key) => {
    setActiveCard(null);
    const map = { all: 'All', unassigned: 'Unassigned', available: 'Available', assigned: 'Assigned', active: 'Active', maintenance: 'Maintenance', lost: 'Lost' };
    setActiveFilter(map[key] || key);
  };

  const activeTabKey = activeFilter === 'NeedsAttention' ? null : activeFilter.toLowerCase();

  const tabs = useMemo(() => [
    { key: 'all', label: `${t('tabAll')} (${total})` },
    { key: 'unassigned', label: `${t('tabUnassigned')} (${unassigned})` },
    { key: 'available', label: `${t('tabAvailable')} (${robots.filter(r => r.status === 'Available').length})` },
    { key: 'assigned', label: `${t('tabAssigned')} (${robots.filter(r => r.status === 'Assigned').length})` },
    { key: 'active', label: `${t('tabActive')} (${robots.filter(r => r.status === 'Active').length})` },
    { key: 'maintenance', label: `${t('tabMaintenance')} (${robots.filter(r => r.status === 'Maintenance').length})` },
    { key: 'lost', label: `${t('tabLost')} (${robots.filter(r => r.status === 'Lost').length})` },
  ], [robots, t, unassigned, total]);

  const filteredRobots = useMemo(() => {
    let result = robots;
    if (activeFilter === 'NeedsAttention') {
      result = result.filter((r) => ['Maintenance', 'Lost', 'Inactive'].includes(r.status));
    } else if (activeFilter === 'Assigned') {
      result = result.filter((r) => r.farmer !== null && r.farmer !== '');
    } else if (activeFilter === 'Unassigned') {
      result = result.filter((r) => !r.farmer || r.farmer.trim() === '');
    } else if (activeFilter !== 'All') {
      result = result.filter((r) => r.status === activeFilter);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((r) =>
        r.id.toLowerCase().includes(q) ||
        (r.farmer || '').toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q) ||
        (r.model || '').toLowerCase().includes(q)
      );
    }
    if (sortGenerated) {
      result = [...result].sort((a, b) => {
        if (a.registered > b.registered) return -1;
        if (a.registered < b.registered) return 1;
        return 0;
      });
    }
    return result;
  }, [robots, activeFilter, searchTerm, sortGenerated]);

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [history]);

  const openGenerate = () => {
    setGenForm({ quantity: 1, model: 'AB-X1000' });
    setShowGenerateModal(true);
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    const qty = parseInt(genForm.quantity, 10);
    if (isNaN(qty) || qty < 1 || qty > 100) return;
    const maxId = robots.reduce((max, r) => {
      const num = parseInt(r.id.replace('ROB-', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const today = new Date().toISOString().split('T')[0];
    const newRobots = [];
    const newHistoryEntries = [];
    for (let i = 1; i <= qty; i++) {
      const idNum = maxId + i;
      const robotId = `ROB-${String(idNum).padStart(4, '0')}`;
      newRobots.push({
        id: robotId,
        name: `Robot ${robotId}`,
        model: genForm.model,
        farmer: null,
        status: 'Available',
        farm: '',
        battery: 0,
        registered: today,
        notes: '',
      });
      newHistoryEntries.push({ robotId, action: 'Generated', farmer: 'â€”', by: 'Admin User', date: today });
    }
    // TODO: Replace with real backend bulk generation API call once available
    bulkAddRobots(newRobots);
    newHistoryEntries.forEach((entry) => addHistoryEntry(entry));
    const firstId = `ROB-${String(maxId + 1).padStart(4, '0')}`;
    const lastId = `ROB-${String(maxId + qty).padStart(4, '0')}`;
    setSortGenerated(true);
    setShowGenerateModal(false);
    setToast({ message: t('toastSuccess').replace('{count}', qty).replace('{first}', firstId).replace('{last}', lastId) });
    setTimeout(() => setToast(null), 3000);
  };

  const openEdit = (robot) => {
    setEditForm({ farmer: robot.farmer || '', status: robot.status, model: robot.model, notes: robot.notes || '' });
    setShowEditModal(robot);
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    if (!showEditModal) return;
    const prevFarmer = showEditModal.farmer;
    const newFarmer = (editForm.farmer && editForm.farmer !== 'â€” Remove Assignment â€”') ? editForm.farmer : null;
    const prevStatus = showEditModal.status;
    let newStatus = editForm.status;

    // Auto-set to Assigned if farmer is selected and status was Available
    if (newFarmer && newStatus === 'Available') {
      newStatus = 'Assigned';
    }
    // If farmer was unassigned (empty string), treat as removing assignment
    let historyAction;
    if (prevFarmer && !newFarmer) {
      // Removing assignment
      newStatus = 'Available';
      historyAction = 'Unassigned';
    } else if (prevFarmer !== newFarmer && newFarmer) {
      historyAction = 'Reassigned';
    } else if (!prevFarmer && newFarmer) {
      historyAction = 'Assigned';
    } else {
      // Status change only
      historyAction = newStatus;
    }

    updateRobot(showEditModal, { farmer: newFarmer, status: newStatus, model: editForm.model, notes: editForm.notes });
    addHistoryEntry({ robotId: showEditModal.id, action: historyAction, farmer: newFarmer || 'â€”', by: 'Admin User', date: new Date().toISOString().slice(0, 10) });
    setShowEditModal(null);
  };

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') { setShowGenerateModal(false); setShowQRModal(null); setShowEditModal(null); setDeleteTarget(null); } };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (searchTerm) setSortGenerated(false);
  }, [searchTerm]);

  useEffect(() => {
    setSortGenerated(false);
  }, [activeFilter]);

  useEffect(() => {
    const generateQRCodes = async () => {
      const codes = {};
      const errors = {};
      for (const robot of robots) {
        try {
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
    link.download = `${robotId}-QR.png`;
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

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    removeRobot(deleteTarget);
    addHistoryEntry({ robotId: deleteTarget.id, action: 'Deleted', farmer: deleteTarget.farmer || 'â€”', by: 'Admin User', date: new Date().toISOString().slice(0, 10) });
    setDeleteTarget(null);
  };
  const handleBulkAssign = () => {
    if (!bulkAssignFarmer || bulkAssignSelected.size === 0) return;
    const selectedRobots = robots.filter(r => bulkAssignSelected.has(r.id));
    selectedRobots.forEach(robot => {
      const newStatus = robot.status === 'Available' ? 'Assigned' : robot.status;
      updateRobot(robot, { farmer: bulkAssignFarmer, status: newStatus });
      addHistoryEntry({ robotId: robot.id, action: 'Assigned', farmer: bulkAssignFarmer, by: 'Admin User', date: new Date().toISOString().slice(0, 10) });
    });
    setToast({ message: t('toastBulkAssign').replace('{count}', bulkAssignSelected.size).replace('{farmer}', bulkAssignFarmer) });
    setTimeout(() => setToast(null), 3000);
    setShowBulkAssignModal(false);
    setBulkAssignFarmer('');
    setBulkAssignSelected(new Set());
  };

  const unassignedRobots = useMemo(() => {
    return robots.filter(r => !r.farmer || r.farmer.trim() === '');
  }, [robots]);
  const greenIconContainer = {
    width: '42px', height: '42px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(46,125,50,0.1)',
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-bold text-primary">{t('title')}</div>
          <div className="text-sm text-text-secondary mt-1">{t('subtitle')}</div>
        </div>
        <button onClick={openGenerate} className={btnPrimary}><i className="ph ph-plus" /> {t('generateRobot')}</button>
      </div>

      {toast && (
        <div style={{ background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: '12px', padding: '10px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, color: '#166534' }}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <GlowCard onClick={() => handleCardClick('total', 'All')} className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-secondary mb-2">{t('totalRobots')}</div>
              <div className="text-3xl font-extrabold text-primary">{total}</div>
            </div>
            <div style={greenIconContainer}>
              <Bot size={18} color="#2e7d2e" />
            </div>
          </div>
        </GlowCard>
        <GlowCard onClick={() => handleCardClick('available', 'Available')} className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-secondary mb-2">{t('available')}</div>
              <div className="text-3xl font-extrabold text-primary">{available}</div>
            </div>
            <div style={greenIconContainer}>
              <CheckCircle size={18} color="#2e7d2e" />
            </div>
          </div>
        </GlowCard>
        <GlowCard onClick={() => handleCardClick('assigned', 'Assigned')} className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-secondary mb-2">{t('assigned')}</div>
              <div className="text-3xl font-extrabold text-primary">{assigned}</div>
            </div>
            <div style={greenIconContainer}>
              <UserCheck size={18} color="#2e7d2e" />
            </div>
          </div>
        </GlowCard>
        <GlowCard onClick={() => handleCardClick('unassigned', 'Unassigned')} className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-secondary mb-2">{t('unassigned')}</div>
              <div className="text-3xl font-extrabold text-primary">{unassigned}</div>
            </div>
            <div style={greenIconContainer}>
              <UserX size={18} color="#6b7280" />
            </div>
          </div>
        </GlowCard>
        <GlowCard onClick={() => handleCardClick('attention', 'NeedsAttention')} className="glass-card rounded-2xl p-5" style={{ contentVisibility: 'auto' }}>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-secondary mb-2">{t('needsAttention')}</div>
              <div className="text-3xl font-extrabold text-primary">{needsAttention}</div>
            </div>
            <div style={greenIconContainer}>
              <AlertTriangle size={18} color="#f97316" />
            </div>
          </div>
        </GlowCard>
      </div>

      {/* Robot Registry Table */}
      <div className="rounded-[20px] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] border border-white/50" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', contentVisibility: 'auto', willChange: 'transform' }}>
        <div className="flex flex-col items-stretch mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-primary">{t('allRobots')} ({filteredRobots.length})</div>
            {activeFilter === 'Unassigned' && unassigned > 0 && (
              <button onClick={() => { setBulkAssignFarmer(''); setBulkAssignSelected(new Set()); setShowBulkAssignModal(true); }}
                style={{ background: '#4caf50', color: '#FFFFFF', fontWeight: 600, borderRadius: '10px', padding: '7px 16px', cursor: 'pointer', transition: 'all 0.2s ease', border: 'none', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(46,125,50,0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              ><i className="ph ph-users-three" /> {t('bulkAssign')}</button>
            )}
          </div>
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('searchPlaceholder')} aria-label="Search robots" className={glassInput} />
        </div>

        <div className="flex mb-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
          {tabs.map((tab) => {
            const isActive = activeTabKey === tab.key;
            return (
              <div
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                style={{
                  padding: '8px 4px', fontSize: '14px', cursor: 'pointer', marginRight: '20px',
                  borderBottom: isActive ? '2px solid #2e7d2e' : '2px solid transparent',
                  marginBottom: '-1px', transition: 'color 0.15s ease, border-color 0.15s ease',
                  color: isActive ? '#2e7d2e' : '#6b7280',
                  fontWeight: isActive ? 600 : 400,
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#1a3a2a'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = '#6b7280'; }}
              >
                {tab.label}
              </div>
            );
          })}
        </div>

        {filteredRobots.length === 0 ? (
          <div className="py-12 text-center text-text-secondary text-sm">{t('noRobotsFound')}</div>
        ) : (
          <table className="w-full border-collapse text-sm" style={{ userSelect: 'none', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th className="px-4 text-[11px] uppercase font-semibold tracking-wider border-b text-left" style={{ color: '#9CA3AF', borderColor: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap', width: 130, padding: '10px 16px' }}>{t('colRobotId')}</th>
                <th className="px-4 text-[11px] uppercase font-semibold tracking-wider border-b text-center" style={{ color: '#9CA3AF', borderColor: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap', width: 80, padding: '10px 16px' }}>{t('colQrCode')}</th>
                <th className="px-4 text-[11px] uppercase font-semibold tracking-wider border-b text-center" style={{ color: '#9CA3AF', borderColor: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap', width: 200, padding: '10px 16px' }}>{t('colFarmerAssigned')}</th>
                <th className="px-4 text-[11px] uppercase font-semibold tracking-wider border-b text-left" style={{ color: '#9CA3AF', borderColor: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap', width: 110, padding: '10px 16px' }}>{t('colModel')}</th>
                <th className="px-4 text-[11px] uppercase font-semibold tracking-wider border-b text-left" style={{ color: '#9CA3AF', borderColor: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap', width: 140, padding: '10px 16px' }}>{t('colStatus')}</th>
                <th className="px-4 text-[11px] uppercase font-semibold tracking-wider border-b text-left" style={{ color: '#9CA3AF', borderColor: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap', width: 120, padding: '10px 16px' }}>{t('colRegistered')}</th>
                <th className="px-4 text-[11px] uppercase font-semibold tracking-wider border-b text-center" style={{ color: '#9CA3AF', borderColor: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap', width: 80, padding: '10px 16px' }}>{t('colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRobots.map((r, i) => (
                <tr key={i}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f8f1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  style={{ transition: 'background 0.15s ease' }}
                >
                  <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)', verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a' }}>{r.id}</span>
                  </td>
                  <td className="px-4 py-4 border-b text-center" style={{ borderColor: 'rgba(255,255,255,0.2)', verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {qrLoading ? (
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: '#F3F4F6', margin: '0 auto' }} />
                    ) : qrErrors[r.id] ? (
                      <span style={{ fontSize: '13px', color: '#DC2626' }}>{t('qrFailed')}</span>
                    ) : (
                      <img src={qrCodes[r.id]} alt={`QR for ${r.id}`}
                        title={t('viewQrTooltip').replace('{id}', r.id)}
                        onClick={() => setShowQRModal(r)}
                        style={{ width: 28, height: 28, borderRadius: 6, cursor: 'pointer', display: 'block', margin: '0 auto' }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                      />
                    )}
                  </td>
                  <td className="px-4 py-4 border-b text-center" style={{ borderColor: 'rgba(255,255,255,0.2)', verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.farmer
                      ? <span onClick={() => { const found = users.find(u => u.name === r.farmer); if (found) setProfileUser(found); }}
                          style={{ cursor: 'pointer', fontWeight: 600, color: '#1a1a1a', transition: 'color 0.15s ease' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#4caf50'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#1a1a1a'; }}
                        >{r.farmer}</span>
                      : <span style={{ fontSize: '14px', fontStyle: 'italic', color: '#9CA3AF' }}>{t('unassigned')}</span>
                    }
                  </td>
                  <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)', verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>{r.model}</span>
                  </td>
                  <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)', verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {statusBadge(r.status)}
                    {(r.status === 'Active' || r.status === 'Assigned') && r.battery > 0 && (
                      <span style={{ fontSize: '12px', color: '#9CA3AF', marginLeft: '8px' }}>ðŸ”‹{r.battery}%</span>
                    )}
                  </td>
                  <td className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.2)', verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>{r.registered}</span>
                  </td>
                  <td className="px-4 py-4 border-b text-center" style={{ borderColor: 'rgba(255,255,255,0.2)', verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <div className="flex items-center justify-center" style={{ gap: '12px' }}>
                      <button title={t('editAssignmentTooltip')} onClick={() => openEdit(r)} className="bg-none border-none cursor-pointer transition-all duration-200 hover:scale-110" style={{ color: '#9CA3AF', padding: 0, display: 'flex' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#1a1a1a'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                      >
                        <Pencil size={16} />
                      </button>
                      <button title={t('deleteRobotTooltip')} onClick={() => setDeleteTarget(r)} className="bg-none border-none cursor-pointer transition-all duration-200 hover:scale-110" style={{ color: '#9CA3AF', padding: 0, display: 'flex' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#DC2626'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                      >
                        <Trash2 size={16} />
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
          <div className="text-sm font-semibold text-primary">{t('assignmentHistory')}</div>
          <div className="text-xs text-text-secondary mt-1">{t('assignmentHistorySub')}</div>
        </div>
        <table className="w-full border-collapse text-sm" style={{ userSelect: 'none' }}>
          <thead>
            <tr>
              <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>{t('histColRobotId')}</th>
              <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>{t('histColAction')}</th>
              <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>{t('histColFarmer')}</th>
              <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>{t('histColPerformedBy')}</th>
              <th className="text-left px-5 py-3.5 text-[11px] uppercase font-semibold tracking-wider text-text-secondary border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>{t('histColDate')}</th>
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
            {showAllHistory ? t('showLess') : t('viewAll').replace('{n}', sortedHistory.length)}
          </button>
        </div>
      </div>

      {/* Generate Robot Modal */}
      {showGenerateModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={() => setShowGenerateModal(false)}>
          <div className="rounded-[16px] p-7 shadow-[0_8px_40px_rgba(0,0,0,0.15)] border border-white/50" onClick={(e) => e.stopPropagation()}
            style={{ background: '#ffffff', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto', width: '560px', maxWidth: 'calc(100vw-32px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #4caf50, #2e7d2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={20} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>{t('generateRobotsTitle')}</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>{t('generateRobotsSub')}</div>
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
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('robotDetails')}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 32px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <i className="ph ph-hash" style={{ fontSize: '12px', color: '#9CA3AF' }} /> {t('numberOfRobots')}
                    </div>
                    <input type="number" min={1} max={100} value={genForm.quantity}
                      onChange={(e) => setGenForm({ ...genForm, quantity: e.target.value })}
                      placeholder={t('quantityPlaceholder')}
                      style={inputBase}
                      onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                    />
                    {(() => {
                      const qty = parseInt(genForm.quantity, 10);
                      if (isNaN(qty) || genForm.quantity === '') return null;
                      if (qty < 1 || qty > 100) {
                        return <div style={{ color: '#DC2626', fontSize: '11px', marginTop: '4px' }}>{t('quantityError')}</div>;
                      }
                      const maxId = robots.reduce((max, r) => {
                        const num = parseInt(r.id.replace('ROB-', ''), 10);
                        return !isNaN(num) && num > max ? num : max;
                      }, 0);
                      const firstId = `ROB-${String(maxId + 1).padStart(4, '0')}`;
                      const lastId = `ROB-${String(maxId + qty).padStart(4, '0')}`;
                      return (
                        <div style={{ color: '#6b7280', fontSize: '12px', fontStyle: 'italic', marginTop: '4px' }}>
                          {t('generateHint').replace('{n}', qty).replace('{first}', firstId).replace('{last}', lastId)}
                        </div>
                      );
                    })()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <i className="ph ph-chip" style={{ fontSize: '12px', color: '#9CA3AF' }} /> {t('robotModel')}
                    </div>
                    <Select options={modelOptions} value={genForm.model} onChange={(v) => setGenForm({ ...genForm, model: v })} placeholder={t('selectModel')} />
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
                >{t('cancel')}</button>
                <button type="submit"
                  disabled={(() => { const q = parseInt(genForm.quantity, 10); return isNaN(q) || q < 1 || q > 100; })()}
                  style={{ background: (() => { const q = parseInt(genForm.quantity, 10); return isNaN(q) || q < 1 || q > 100 ? '#9CA3AF' : '#4caf50'; })(), color: '#FFFFFF', fontWeight: 600, borderRadius: '12px', padding: '9px 20px', cursor: (() => { const q = parseInt(genForm.quantity, 10); return isNaN(q) || q < 1 || q > 100 ? 'not-allowed' : 'pointer'; })(), transition: 'all 0.2s ease', border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => {
                    const q = parseInt(genForm.quantity, 10);
                    if (!isNaN(q) && q >= 1 && q <= 100) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(46,125,50,0.35)';
                    }
                  }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  onMouseDown={(e) => {
                    const q = parseInt(genForm.quantity, 10);
                    if (!isNaN(q) && q >= 1 && q <= 100) {
                      e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95';
                    }
                  }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '1'; }}
                ><i className="ph ph-check" /> {(() => { const q = parseInt(genForm.quantity, 10); return isNaN(q) ? t('generate') : t('generateBtnCount').replace('{n}', q); })()}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* View QR Code Modal */}
      {showQRModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={() => setShowQRModal(null)}>
          <div className="rounded-[16px] p-7 shadow-[0_8px_40px_rgba(0,0,0,0.15)]" onClick={(e) => e.stopPropagation()}
            style={{ background: '#ffffff', width: '400px', maxWidth: 'calc(100vw-32px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #4caf50, #2e7d2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Download size={20} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>{t('qrCodeTitle')} â€” {showQRModal.id}</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>{t('qrCodeSub')}</div>
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
              <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>{showQRModal.farmer || t('unassigned')}</div>
              <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{showQRModal.model} &middot; {showQRModal.status}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '8px' }}>
              <button type="button" onClick={() => handleDownloadQR(showQRModal.id)}
                style={{ background: '#2e7d2e', color: '#FFFFFF', fontWeight: 600, borderRadius: '12px', padding: '9px 20px', cursor: 'pointer', transition: 'all 0.2s ease', border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(46,125,50,0.35)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              ><Download size={14} /> {t('downloadQr')}</button>
              <button type="button" onClick={() => handlePrintQR(showQRModal.id)}
                style={{ background: 'transparent', border: '1px solid #D1D5DB', color: '#4B5563', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s ease', padding: '9px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = '#9CA3AF'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              ><Printer size={14} /> {t('printQr')}</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Robot Assignment Modal */}
      {showEditModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={() => setShowEditModal(null)}>
          <div className="rounded-[16px] p-7 shadow-[0_8px_40px_rgba(0,0,0,0.15)]" onClick={(e) => e.stopPropagation()}
            style={{ background: '#ffffff', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto', width: '560px', maxWidth: 'calc(100vw-32px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #4caf50, #2e7d2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <UserCheck size={20} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>{t('editRobotAssignment')}</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>{showEditModal.id}</div>
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
                  <Activity size={15} color="#4caf50" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('assignmentDetails')}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 32px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <User size={12} style={{ color: '#9CA3AF' }} /> {t('farmer')}
                    </div>
                    <Select options={farmerNames.length ? ['â€” Remove Assignment â€”', ...farmerNames] : ['â€” Remove Assignment â€”']} value={editForm.farmer} onChange={(v) => setEditForm({ ...editForm, farmer: v })} placeholder={t('selectFarmer')} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Activity size={12} style={{ color: '#9CA3AF' }} /> {t('status')}
                    </div>
                    <Select options={statusOptions} value={editForm.status} onChange={(v) => setEditForm({ ...editForm, status: v })} placeholder={t('selectStatus')} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <Bot size={12} style={{ color: '#9CA3AF' }} /> {t('model')}
                    </div>
                    <Select options={modelOptions} value={editForm.model} onChange={(v) => setEditForm({ ...editForm, model: v })} placeholder={t('selectModel')} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      <FileText size={12} style={{ color: '#9CA3AF' }} /> {t('notes')}
                    </div>
                    <input value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} placeholder={t('notesPlaceholder')}
                      style={inputBase} onMouseEnter={inputHoverEnter} onMouseLeave={inputHoverLeave} onFocus={inputFocus} onBlur={inputBlur}
                    />
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
                >{t('cancel')}</button>
                <button type="submit"
                  style={{ background: '#4caf50', color: '#FFFFFF', fontWeight: 600, borderRadius: '12px', padding: '9px 20px', cursor: 'pointer', transition: 'all 0.2s ease', border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(46,125,50,0.35)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '1'; }}
                ><i className="ph ph-check" /> {t('saveAssignment')}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Robot Confirmation Modal */}
      {deleteTarget && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={() => setDeleteTarget(null)}>
          <div className="rounded-[16px] p-6 shadow-[0_8px_40px_rgba(0,0,0,0.15)] w-[400px]" onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff' }}>
            <div className="text-lg font-bold text-primary mb-2">{t('deleteRobotTitle')}</div>
            <div className="text-sm text-text-secondary mb-6">
              {t('deleteConfirmPre')}<strong className="text-primary font-medium">{deleteTarget.id}</strong>{t('deleteConfirmPost')}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)}
                style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.15)', color: '#4B5563', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s ease', padding: '9px 18px', fontSize: '13px' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >{t('cancel')}</button>
              <button onClick={handleDeleteConfirm}
                style={{ background: '#FEE2E2', color: '#DC2626', fontWeight: 600, borderRadius: '12px', padding: '9px 20px', cursor: 'pointer', transition: 'all 0.2s ease', border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FCA5A5'; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(220,38,38,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '1'; }}
              ><Trash2 size={14} /> {t('deleteRobotBtn')}</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Bulk Assign Modal */}
      {showBulkAssignModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={() => setShowBulkAssignModal(false)}>
          <div className="rounded-[16px] p-7 shadow-[0_8px_40px_rgba(0,0,0,0.15)]" onClick={(e) => e.stopPropagation()}
            style={{ background: '#ffffff', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto', width: '560px', maxWidth: 'calc(100vw-32px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #4caf50, #2e7d2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <UserCheck size={20} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>{t('bulkAssignTitle')}</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>{t('bulkAssignSub')}</div>
                </div>
              </div>
              <button type="button" onClick={() => setShowBulkAssignModal(false)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#98989D', padding: '4px', display: 'flex', transition: 'color 0.15s ease, transform 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
              ><X size={20} /></button>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.75)', borderRadius: '16px', padding: '20px 24px', border: '1px solid rgba(255,255,255,0.5)', marginBottom: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  <User size={12} style={{ color: '#9CA3AF' }} /> {t('farmer')}
                </div>
                <Select options={farmerNames.length ? farmerNames : ['No users available']} value={bulkAssignFarmer} onChange={(v) => setBulkAssignFarmer(v)} placeholder={t('selectFarmer')} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Bot size={12} style={{ color: '#9CA3AF' }} /> {t('unassigned')} ({unassignedRobots.length})
                  </div>
                  {unassignedRobots.length > 0 && (
                    <button type="button" onClick={() => {
                      if (bulkAssignSelected.size === unassignedRobots.length) {
                        setBulkAssignSelected(new Set());
                      } else {
                        setBulkAssignSelected(new Set(unassignedRobots.map(r => r.id)));
                      }
                    }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2e7d2e', fontSize: '11px', fontWeight: 600, padding: 0 }}>
                      {bulkAssignSelected.size === unassignedRobots.length ? t('deselectAll') : t('selectAll')}
                    </button>
                  )}
                </div>
                {unassignedRobots.length === 0 ? (
                  <div style={{ padding: '24px 0', textAlign: 'center', fontSize: '13px', color: '#9CA3AF' }}>{t('noUnassignedRobots')}</div>
                ) : (
                  <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '8px' }}>
                    {unassignedRobots.map(r => {
                      const checked = bulkAssignSelected.has(r.id);
                      return (
                        <div key={r.id} onClick={() => {
                          const next = new Set(bulkAssignSelected);
                          if (checked) next.delete(r.id); else next.add(r.id);
                          setBulkAssignSelected(next);
                        }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', cursor: 'pointer', background: checked ? 'rgba(76,175,80,0.06)' : 'transparent', borderBottom: '1px solid rgba(0,0,0,0.04)', transition: 'background 0.15s ease' }}
                          onMouseEnter={(e) => { if (!checked) e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
                          onMouseLeave={(e) => { if (!checked) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <input type="checkbox" checked={checked} onChange={() => {}} style={{ accentColor: '#4caf50', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }} onClick={(e) => e.stopPropagation()} />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827', flex: 1 }}>{r.id}</span>
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>{r.model}</span>
                          {statusBadge(r.status)}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setShowBulkAssignModal(false)}
                style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.15)', color: '#4B5563', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s ease', padding: '9px 18px', fontSize: '13px' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >{t('cancel')}</button>
              <button type="button" onClick={handleBulkAssign}
                disabled={!bulkAssignFarmer || bulkAssignSelected.size === 0}
                style={{ background: (!bulkAssignFarmer || bulkAssignSelected.size === 0) ? '#9CA3AF' : '#4caf50', color: '#FFFFFF', fontWeight: 600, borderRadius: '12px', padding: '9px 20px', cursor: (!bulkAssignFarmer || bulkAssignSelected.size === 0) ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease', border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onMouseEnter={(e) => { if (bulkAssignFarmer && bulkAssignSelected.size > 0) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(46,125,50,0.35)'; }}}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                onMouseDown={(e) => { if (bulkAssignFarmer && bulkAssignSelected.size > 0) { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; }}}
                onMouseUp={(e) => { if (bulkAssignFarmer && bulkAssignSelected.size > 0) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '1'; }}}
              ><i className="ph ph-check" /> {t('assignSelected').replace('{n}', bulkAssignSelected.size || 0)}</button>
            </div>
          </div>
        </div>,
        document.body
      )}      {profileUser && <UserProfileModal user={profileUser} onClose={() => setProfileUser(null)} />}
    </>
  );
}
