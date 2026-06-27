import { useMemo } from 'react';
import { useFarms } from '../../context/FarmContext';
import { useRobots } from '../../context/RobotContext';

const labelStyle = { fontSize: '12px', fontWeight: 600, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' };
const fieldStyle = { background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#111827', fontWeight: 500, height: '40px', padding: '0 14px', display: 'flex', alignItems: 'center', fontSize: '14px', width: '100%' };

export default function UserProfileModal({ user, onClose }) {
  const { farms } = useFarms();
  const { robots } = useRobots();

  const userFarms = useMemo(() => farms.filter((f) => f.owner === user.name), [farms, user.name]);
  const userRobots = useMemo(() => robots.filter((r) => userFarms.some((f) => f.name === r.farm)), [robots, userFarms]);

  const primaryFarm = userFarms.length > 0 ? userFarms[0].name : '\u2014';
  const sectors = userFarms.length > 0 ? [...new Set(userFarms.flatMap((f) => (f.cropTypes || f.crop).split(', ')))]
    .filter(Boolean).join(', ') || '\u2014' : '\u2014';
  const totalAcreage = userFarms.reduce((sum, f) => {
    const match = (f.size || '').match(/\d+/);
    return sum + (match ? Number(match[0]) : 0);
  }, 0) + ' Acres';

  const robotFleet = userRobots.length > 0
    ? userRobots.map((r) => `${r.name} (${r.model || r.id})`).join(', ') : '\u2014';
  const now = new Date();
  const lastSync = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="w-[680px] max-w-[calc(100vw-32px)] rounded-[24px] p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60" onClick={(e) => e.stopPropagation()} style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-lg font-bold text-[#1C1C1E]">Form Statement</div>
            <div className="text-xs text-text-secondary mt-0.5">Viewing information for {user.name}.</div>
          </div>
          <button type="button" onClick={onClose} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#98989D', fontSize: '18px', transition: 'color 0.15s ease, transform 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
          ><i className="ph ph-x" /></button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Core Identity Matrix</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <div style={labelStyle}>Name</div>
              <div style={fieldStyle}>{user.name}</div>
            </div>
            <div>
              <div style={labelStyle}>Email</div>
              <div style={fieldStyle}>{user.email}</div>
            </div>
            <div>
              <div style={labelStyle}>Phone</div>
              <div style={fieldStyle}>{user.phone}</div>
            </div>
            <div>
              <div style={labelStyle}>System Status</div>
              <div style={fieldStyle}>{user.status}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Farm Details Infrastructure</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <div style={labelStyle}>Primary Farm Anchor</div>
              <div style={fieldStyle}>{primaryFarm}</div>
            </div>
            <div>
              <div style={labelStyle}>Sector Sectors</div>
              <div style={fieldStyle}>{sectors}</div>
            </div>
            <div>
              <div style={labelStyle}>Total Acreage</div>
              <div style={fieldStyle}>{totalAcreage}</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Assigned Robots Dynamic Data</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <div style={labelStyle}>Robot Fleet</div>
              <div style={{ ...fieldStyle, whiteSpace: 'normal', wordBreak: 'break-word', height: 'auto', minHeight: '40px', padding: '8px 14px' }}>{robotFleet}</div>
            </div>
            <div>
              <div style={labelStyle}>Last Sync Timestamp</div>
              <div style={fieldStyle}>{lastSync}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button onClick={onClose} style={{ background: '#10B981', color: '#FFFFFF', fontWeight: 600, padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', border: 'none', transition: 'all 0.2s', fontSize: '14px' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.25)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
          >Close Statement</button>
        </div>
      </div>
    </div>
  );
}
