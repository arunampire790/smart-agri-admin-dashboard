import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Mail, Phone, CheckCircle2, MapPin, Layers, Bot, Clock, Users as UsersIcon, Map, X, Pencil, Check } from 'lucide-react';
import { useFarms } from '../../context/FarmContext';
import { useRobots } from '../../context/RobotContext';
import { useUsers } from '../../context/UserContext';

const cardStyle = {
  background: 'rgba(255,255,255,0.75)',
  borderRadius: '16px',
  padding: '20px 24px',
  border: '1px solid rgba(255,255,255,0.5)',
  marginBottom: '16px',
};

const sectionTitleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '14px',
  paddingBottom: '12px',
  borderBottom: '1px solid rgba(0,0,0,0.07)',
};

const sectionTitleTextStyle = {
  fontSize: '12px',
  fontWeight: 700,
  color: '#374151',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const labelRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '11px',
  fontWeight: 600,
  color: '#6B7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '4px',
};

const valStyle = {
  fontSize: '15px',
  fontWeight: 600,
  color: '#111827',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '16px 32px',
};

export default function UserProfileModal({ user, onClose, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const { farms, updateFarm } = useFarms();
  const { robots } = useRobots();
  const { updateUser } = useUsers();

  const userFarms = useMemo(() => farms.filter((f) => f.owner === user.name), [farms, user.name]);
  const userRobots = useMemo(() => robots.filter((r) => userFarms.some((f) => f.name === r.farm)), [robots, userFarms]);

  const primaryFarm = userFarms.length > 0 ? userFarms[0].name : '\u2014';
  const sectors = userFarms.length > 0
    ? [...new Set(userFarms.flatMap((f) => (f.cropTypes || f.crop).split(', ')))].filter(Boolean).join(', ') || '\u2014'
    : '\u2014';
  const totalAcreage = userFarms.reduce((sum, f) => {
    const m = (f.size || '').match(/\d+/);
    return sum + (m ? Number(m[0]) : 0);
  }, 0) + ' Acres';

  const robotFleet = userRobots.length > 0
    ? userRobots.map((r) => `${r.name} (${r.model || r.id})`).join(', ') : '\u2014';
  const now = new Date();
  const lastSync = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  useEffect(() => {
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      primaryFarm,
      cropTypes: sectors,
      totalAcreage,
    });
  }, [user]);

  const handleSave = () => {
    updateUser(user, {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      status: editForm.status,
    });
    if (userFarms.length > 0) {
      updateFarm(userFarms[0], { cropTypes: editForm.cropTypes, size: editForm.totalAcreage });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      primaryFarm,
      cropTypes: sectors,
      totalAcreage,
    });
    setIsEditing(false);
  };

  const inputStyle = {
    background: '#ffffff',
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: '12px',
    padding: '8px 12px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#111827',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'auto',
  };

  const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase();

  return (
    <>
      <style>{`
        .profile-edit-btn:hover, .profile-edit-btn:focus-visible {
          animation: pulseGlowPencil 1.5s ease-in-out infinite;
        }
        @keyframes pulseGlowPencil {
          0%, 100% { box-shadow: 0 0 4px rgba(0,0,0,0.06); }
          50% { box-shadow: 0 0 12px rgba(0,0,0,0.12); }
        }
      `}</style>
      {createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="w-[680px] max-w-[calc(100vw-32px)] rounded-[24px] p-7 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60" onClick={(e) => e.stopPropagation()}
        style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>{initials}</span>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>{user.name}</div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>{user.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: user.status === 'Active' ? '#D1FAE5' : '#FEE2E2', color: user.status === 'Active' ? '#065F46' : '#991B1B' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: user.status === 'Active' ? '#10B981' : '#EF4444' }} />
              {user.status}
            </span>
            <button type="button" onClick={() => { if (onEdit) { onEdit(user); } else { setIsEditing(true); } }} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#98989D', padding: '4px', display: 'flex', transition: 'color 0.15s ease, transform 0.15s ease' }}
              className="profile-edit-btn"
              onMouseEnter={(e) => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
            ><Pencil size={16} /></button>
            <button type="button" onClick={onClose} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#98989D', padding: '4px', display: 'flex', transition: 'color 0.15s ease, transform 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
            ><X size={18} /></button>
          </div>
        </div>

        {/* Core Identity Matrix */}
        <div style={cardStyle}>
          <div style={sectionTitleStyle}>
            <UsersIcon size={15} color="#10B981" />
            <span style={sectionTitleTextStyle}>Core Identity Matrix</span>
          </div>
          <div style={gridStyle}>
            <div>
              <div style={labelRowStyle}><User size={12} color="#9CA3AF" /> Name</div>
              {isEditing ? (
                <input value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={inputStyle} />
              ) : (
                <div style={valStyle}>{user.name}</div>
              )}
            </div>
            <div>
              <div style={labelRowStyle}><Mail size={12} color="#9CA3AF" /> Email</div>
              {isEditing ? (
                <input value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} style={inputStyle} />
              ) : (
                <div style={valStyle}>{user.email}</div>
              )}
            </div>
            <div>
              <div style={labelRowStyle}><Phone size={12} color="#9CA3AF" /> Phone</div>
              {isEditing ? (
                <input value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} style={inputStyle} />
              ) : (
                <div style={valStyle}>{user.phone}</div>
              )}
            </div>
            <div>
              <div style={labelRowStyle}><CheckCircle2 size={12} color="#9CA3AF" /> System Status</div>
              {isEditing ? (
                <select value={editForm.status || 'Active'} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} style={selectStyle}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: user.status === 'Active' ? '#D1FAE5' : '#FEE2E2', color: user.status === 'Active' ? '#065F46' : '#991B1B' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: user.status === 'Active' ? '#10B981' : '#EF4444' }} />
                  {user.status}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Farm Details Infrastructure */}
        <div style={cardStyle}>
          <div style={sectionTitleStyle}>
            <Map size={15} color="#10B981" />
            <span style={sectionTitleTextStyle}>Farm Details Infrastructure</span>
          </div>
          <div style={gridStyle}>
            <div>
              <div style={labelRowStyle}><MapPin size={12} color="#9CA3AF" /> Primary Farm Anchor</div>
              {isEditing ? (
                <input value={editForm.primaryFarm || ''} onChange={(e) => setEditForm({ ...editForm, primaryFarm: e.target.value })} style={inputStyle} />
              ) : (
                <div style={valStyle}>{primaryFarm}</div>
              )}
            </div>
            <div>
              <div style={labelRowStyle}><Layers size={12} color="#9CA3AF" /> Crop Types</div>
              {isEditing ? (
                <input value={editForm.cropTypes || ''} onChange={(e) => setEditForm({ ...editForm, cropTypes: e.target.value })} style={inputStyle} />
              ) : (
                <div style={valStyle}>{sectors}</div>
              )}
            </div>
            <div>
              <div style={labelRowStyle}><Map size={12} color="#9CA3AF" /> Total Acreage</div>
              {isEditing ? (
                <input value={editForm.totalAcreage || ''} onChange={(e) => setEditForm({ ...editForm, totalAcreage: e.target.value })} style={inputStyle} />
              ) : (
                <div style={valStyle}>{totalAcreage}</div>
              )}
            </div>
          </div>
        </div>

        {/* Assigned Robots Dynamic Data */}
        <div style={cardStyle}>
          <div style={sectionTitleStyle}>
            <Bot size={15} color="#10B981" />
            <span style={sectionTitleTextStyle}>Assigned Robots Dynamic Data</span>
          </div>
          <div style={gridStyle}>
            <div>
              <div style={labelRowStyle}><Bot size={12} color="#9CA3AF" /> Robot Fleet</div>
              <div style={{ ...valStyle, wordBreak: 'break-word' }}>{robotFleet}</div>
            </div>
            <div>
              <div style={labelRowStyle}><Clock size={12} color="#9CA3AF" /> Last Sync Timestamp</div>
              <div style={valStyle}>{lastSync}</div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={handleCancel}
              style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.15)', color: '#4B5563', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s ease', padding: '9px 18px', fontSize: '13px' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Cancel
            </button>
            <button type="button" onClick={handleSave}
              style={{ background: '#10B981', color: '#FFFFFF', fontWeight: 600, borderRadius: '12px', padding: '9px 20px', cursor: 'pointer', transition: 'all 0.2s ease', border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '1'; }}
            >
              <Check size={16} /> Save Changes
            </button>
          </div>
        )}

      </div>
    </div>,
    document.body
  )}
    </>
  );
}
