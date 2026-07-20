import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Layers, Bot, Users as UsersIcon, Map, X, HardDrive, Target, Crosshair } from 'lucide-react';
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

export default function FarmProfileModal({ farm, onClose }) {
  const { robots } = useRobots();
  const { users } = useUsers();

  const farmRobots = useMemo(() => (robots || []).filter(r => r.farm === farm?.name), [robots, farm?.name]);
  const ownerUser = useMemo(() => (users || []).find(u => u.name === farm?.owner), [users, farm?.owner]);

  const robotFleet = farmRobots.length > 0
    ? farmRobots.map(r => `${r.name} (${r.model || r.id})`).join(', ') : '\u2014';
  const deviceCount = farm?.devices || '0';
  const coordsStr = (farm?.coordinates || []).length === 3
    ? farm.coordinates.map((c, i) => `P${i + 1}: ${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`).join(' | ')
    : '\u2014';

  const initials = farm.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>{createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="w-[680px] max-w-[calc(100vw-32px)] rounded-[24px] p-7 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60" onClick={(e) => e.stopPropagation()}
        style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #2e7d32, #1b5e20)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: '16px', fontWeight: 700 }}>{initials}</span>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>{farm.name}</div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>{farm.owner}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: farm.status === 'Active' ? '#D1FAE5' : farm.status === 'Idle' ? '#FEF3C7' : '#FEE2E2', color: farm.status === 'Active' ? '#065F46' : farm.status === 'Idle' ? '#92400E' : '#991B1B' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: farm.status === 'Active' ? '#10B981' : farm.status === 'Idle' ? '#F59E0B' : '#EF4444' }} />
              {farm.status}
            </span>
            <button type="button" onClick={onClose} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#98989D', padding: '4px', display: 'flex', transition: 'color 0.15s ease, transform 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
            ><X size={18} /></button>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={sectionTitleStyle}>
            <Target size={15} color="#2e7d32" />
            <span style={sectionTitleTextStyle}>Core Identity Matrix</span>
          </div>
          <div style={gridStyle}>
            <div>
              <div style={labelRowStyle}><MapPin size={12} color="#9CA3AF" /> Farm Name</div>
              <div style={valStyle}>{farm.name}</div>
            </div>
            <div>
              <div style={labelRowStyle}><UsersIcon size={12} color="#9CA3AF" /> Owner</div>
              <div style={valStyle}>{farm.owner}</div>
            </div>
            <div>
              <div style={labelRowStyle}><Layers size={12} color="#9CA3AF" /> Soil Type</div>
              <div style={valStyle}>{farm.soil || '\u2014'}</div>
            </div>
            <div>
              <div style={labelRowStyle}><Crosshair size={12} color="#9CA3AF" /> System Status</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: farm.status === 'Active' ? '#D1FAE5' : farm.status === 'Idle' ? '#FEF3C7' : '#FEE2E2', color: farm.status === 'Active' ? '#065F46' : farm.status === 'Idle' ? '#92400E' : '#991B1B' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: farm.status === 'Active' ? '#10B981' : farm.status === 'Idle' ? '#F59E0B' : '#EF4444' }} />
                {farm.status}
              </span>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={sectionTitleStyle}>
            <Map size={15} color="#2e7d32" />
            <span style={sectionTitleTextStyle}>Crop & Size Infrastructure</span>
          </div>
          <div style={gridStyle}>
            <div>
              <div style={labelRowStyle}><Layers size={12} color="#9CA3AF" /> Crop Types</div>
              <div style={valStyle}>{farm.cropTypes || farm.crop || '\u2014'}</div>
            </div>
            <div>
              <div style={labelRowStyle}><Map size={12} color="#9CA3AF" /> Farm Size</div>
              <div style={valStyle}>{farm.size || '\u2014'}</div>
            </div>
            <div>
              <div style={labelRowStyle}><HardDrive size={12} color="#9CA3AF" /> Connected Devices</div>
              <div style={valStyle}>{deviceCount}</div>
            </div>
            <div>
              <div style={labelRowStyle}><MapPin size={12} color="#9CA3AF" /> Boundary Coordinates</div>
              <div style={{ ...valStyle, fontSize: '12px', wordBreak: 'break-word' }}>{coordsStr}</div>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={sectionTitleStyle}>
            <Bot size={15} color="#2e7d32" />
            <span style={sectionTitleTextStyle}>Assigned Robots Dynamic Data</span>
          </div>
          <div style={gridStyle}>
            <div>
              <div style={labelRowStyle}><Bot size={12} color="#9CA3AF" /> Robot Fleet</div>
              <div style={{ ...valStyle, wordBreak: 'break-word' }}>{robotFleet}</div>
            </div>
            <div>
              <div style={labelRowStyle}><UsersIcon size={12} color="#9CA3AF" /> Owner Details</div>
              <div style={valStyle}>{ownerUser ? `${ownerUser.email} \u00B7 ${ownerUser.phone}` : '\u2014'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )}</>
  );
}
