import { useMemo } from 'react';
import { User, Mail, Phone, CheckCircle2, MapPin, Layers, Bot, Clock, Users as UsersIcon, Map, X } from 'lucide-react';
import { useFarms } from '../../context/FarmContext';
import { useRobots } from '../../context/RobotContext';

const cardStyle = {
  background: 'var(--bg-glass)',
  borderRadius: '16px',
  padding: '20px',
  border: '1px solid var(--border-glass-med)',
  boxShadow: 'var(--shadow-sm)',
  marginBottom: '16px',
};

const labelIconStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '4px',
};

const valStyle = {
  fontSize: '14px',
  fontWeight: 500,
  color: 'var(--text-primary)',
  lineHeight: '1.5',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--overlay-bg)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="w-[680px] max-w-[calc(100vw-32px)] rounded-[24px] p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60" onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: '20px', fontWeight: 700 }}>{initials}</span>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.3' }}>{user.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{user.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: user.status === 'Active' ? 'var(--green-pill-bg)' : 'var(--clr-danger-bg)', color: user.status === 'Active' ? 'var(--green-pill-text)' : 'var(--clr-danger-text)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: user.status === 'Active' ? 'var(--clr-brand)' : 'var(--clr-danger-text)' }} />
              {user.status}
            </span>
            <button type="button" onClick={onClose} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--clr-text-placeholder)', padding: '4px', display: 'flex', transition: 'color 0.15s ease, transform 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
            ><X size={18} /></button>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-divider)' }}>
            <UsersIcon size={16} color="#10B981" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Core Identity Matrix</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div>
              <div style={labelIconStyle}><User size={13} color="#9CA3AF" /> Name</div>
              <div style={valStyle}>{user.name}</div>
            </div>
            <div>
              <div style={labelIconStyle}><Mail size={13} color="#9CA3AF" /> Email</div>
              <div style={valStyle}>{user.email}</div>
            </div>
            <div>
              <div style={labelIconStyle}><Phone size={13} color="#9CA3AF" /> Phone</div>
              <div style={valStyle}>{user.phone}</div>
            </div>
            <div>
              <div style={labelIconStyle}><CheckCircle2 size={13} color="#10B981" /> System Status</div>
              <div style={valStyle}>{user.status}</div>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-divider)' }}>
            <Map size={16} color="#10B981" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Farm Details Infrastructure</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div>
              <div style={labelIconStyle}><MapPin size={13} color="#9CA3AF" /> Primary Farm Anchor</div>
              <div style={valStyle}>{primaryFarm}</div>
            </div>
            <div>
              <div style={labelIconStyle}><Layers size={13} color="#9CA3AF" /> Crop Types</div>
              <div style={valStyle}>{sectors}</div>
            </div>
            <div>
              <div style={labelIconStyle}><Map size={13} color="#9CA3AF" /> Total Acreage</div>
              <div style={valStyle}>{totalAcreage}</div>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-divider)' }}>
            <Bot size={16} color="#10B981" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Assigned Robots Dynamic Data</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div>
              <div style={labelIconStyle}><Bot size={13} color="#9CA3AF" /> Robot Fleet</div>
              <div style={{ ...valStyle, wordBreak: 'break-word' }}>{robotFleet}</div>
            </div>
            <div>
              <div style={labelIconStyle}><Clock size={13} color="#9CA3AF" /> Last Sync Timestamp</div>
              <div style={valStyle}>{lastSync}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
