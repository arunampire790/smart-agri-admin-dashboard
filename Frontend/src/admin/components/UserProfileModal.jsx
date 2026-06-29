import { useMemo } from 'react';
import { User, Mail, Phone, CheckCircle2, MapPin, Layers, Bot, Clock, Users as UsersIcon, Map } from 'lucide-react';
import { useFarms } from '../../context/FarmContext';
import { useRobots } from '../../context/RobotContext';

const fieldStyle = {
  background: '#F9FAFB',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  color: '#111827',
  fontWeight: 500,
  height: '40px',
  padding: '0 14px',
  display: 'flex',
  alignItems: 'center',
  fontSize: '14px',
  lineHeight: '1.5',
};

const labelStyle = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#4B5563',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '6px',
};

const sectionHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '16px',
  paddingBottom: '12px',
  borderBottom: '1px solid #E5E7EB',
  fontSize: '12px',
  fontWeight: 700,
  color: '#374151',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

export default function UserProfileModal({ user, onClose }) {
  const { farms } = useFarms();
  const { robots } = useRobots();

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

  const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="w-[680px] max-w-[calc(100vw-32px)] rounded-[24px] p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60" onClick={(e) => e.stopPropagation()}
        style={{ background: '#FFFFFF', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: '20px', fontWeight: 700 }}>{initials}</span>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>{user.name}</div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>{user.email}</div>
            </div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: user.status === 'Active' ? '#D1FAE5' : '#FEE2E2', color: user.status === 'Active' ? '#065F46' : '#991B1B' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: user.status === 'Active' ? '#10B981' : '#EF4444' }} />
            {user.status}
          </span>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={sectionHeaderStyle}>
            <UsersIcon size={16} color="#10B981" />
            <span>Core Identity Matrix</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <div style={labelStyle}><User size={13} color="#9CA3AF" style={{ marginRight: '4px' }} />Name</div>
              <div style={fieldStyle}>{user.name}</div>
            </div>
            <div>
              <div style={labelStyle}><Mail size={13} color="#9CA3AF" style={{ marginRight: '4px' }} />Email</div>
              <div style={fieldStyle}>{user.email}</div>
            </div>
            <div>
              <div style={labelStyle}><Phone size={13} color="#9CA3AF" style={{ marginRight: '4px' }} />Phone</div>
              <div style={fieldStyle}>{user.phone}</div>
            </div>
            <div>
              <div style={labelStyle}><CheckCircle2 size={13} color="#10B981" style={{ marginRight: '4px' }} />System Status</div>
              <div style={fieldStyle}>{user.status}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={sectionHeaderStyle}>
            <Map size={16} color="#10B981" />
            <span>Farm Details Infrastructure</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <div style={labelStyle}><MapPin size={13} color="#9CA3AF" style={{ marginRight: '4px' }} />Primary Farm Anchor</div>
              <div style={fieldStyle}>{primaryFarm}</div>
            </div>
            <div>
              <div style={labelStyle}><Layers size={13} color="#9CA3AF" style={{ marginRight: '4px' }} />Sectors</div>
              <div style={fieldStyle}>{sectors}</div>
            </div>
            <div>
              <div style={labelStyle}><Map size={13} color="#9CA3AF" style={{ marginRight: '4px' }} />Total Acreage</div>
              <div style={fieldStyle}>{totalAcreage}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <div style={sectionHeaderStyle}>
            <Bot size={16} color="#10B981" />
            <span>Assigned Robots Dynamic Data</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <div style={labelStyle}><Bot size={13} color="#9CA3AF" style={{ marginRight: '4px' }} />Robot Fleet</div>
              <div style={{ ...fieldStyle, height: 'auto', minHeight: '40px', padding: '8px 14px', flexWrap: 'wrap', wordBreak: 'break-word' }}>{robotFleet}</div>
            </div>
            <div>
              <div style={labelStyle}><Clock size={13} color="#9CA3AF" style={{ marginRight: '4px' }} />Last Sync Timestamp</div>
              <div style={fieldStyle}>{lastSync}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button type="button" onClick={onClose}
            style={{ background: '#10B981', color: '#FFFFFF', fontWeight: 600, padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', border: 'none', fontSize: '14px', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.25)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >Close Statement</button>
        </div>
      </div>
    </div>
  );
}
