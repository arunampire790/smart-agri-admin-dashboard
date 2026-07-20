import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Layers, Bot, Users as UsersIcon, Map, X, HardDrive, Target, Crosshair, ClipboardList, Calendar, AlertCircle, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { useRobots } from '../../context/RobotContext';
import { useUsers } from '../../context/UserContext';
import { useTasks } from '../../context/TaskContext';
import { computeTriangleAreaAcres } from '../../utils/farmArea';

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

const statusBadge = (status) => {
  const map = {
    'Active': { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
    'Idle': { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
    'Offline': { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
    'Pending': { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
    'In Progress': { bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
    'Completed': { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
    'High': { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
    'Medium': { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
    'Low': { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
  };
  return map[status] || { bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF' };
};

const taskTypeMeta = (type) => {
  const map = {
    'Irrigation': { icon: 'Droplets', color: '#3B82F6' },
    'Fertilizer': { icon: 'Sprout', color: '#10B981' },
    'Inspection': { icon: 'Search', color: '#8B5CF6' },
    'Maintenance': { icon: 'Wrench', color: '#F59E0B' },
    'Harvest': { icon: 'Wheat', color: '#F97316' },
    'Planting': { icon: 'Seedling', color: '#22C55E' },
  };
  return map[type] || { icon: 'ClipboardList', color: '#6B7280' };
};

const TaskDot = ({ color }) => (
  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
);

export default function FarmProfileModal({ farm, onClose }) {
  const { robots } = useRobots();
  const { users } = useUsers();
  const { tasks } = useTasks();

  const farmRobots = useMemo(() => (robots || []).filter(r => r.farm === farm?.name), [robots, farm?.name]);
  const ownerUser = useMemo(() => (users || []).find(u => u.name === farm?.owner), [users, farm?.owner]);
  const farmTasks = useMemo(() => (tasks || []).filter(t => t.farm === farm?.name), [tasks, farm?.name]);

  const robotFleet = farmRobots.length > 0
    ? farmRobots.map(r => `${r.name} (${r.model || r.id})`).join(', ') : '\u2014';
  const deviceCountDynamic = farmRobots.length;
  const coordsStr = (farm?.coordinates || []).length === 3
    ? farm.coordinates.map((c, i) => `P${i + 1}: ${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`).join(' | ')
    : '\u2014';

  const computedAcreage = useMemo(() => {
    const coords = farm?.coordinates;
    if (!coords || coords.length !== 3) return null;
    if (!coords.every(c => c && typeof c.lat === 'number' && typeof c.lng === 'number' && !isNaN(c.lat) && !isNaN(c.lng))) return null;
    try {
      return computeTriangleAreaAcres(coords[0], coords[1], coords[2]);
    } catch { return null; }
  }, [farm?.coordinates]);

  const displaySize = computedAcreage !== null ? `${computedAcreage.toFixed(2)} acres` : (farm?.size || '\u2014');

  const pendingTasks = farmTasks.filter(t => t.status === 'Pending').length;
  const inProgressTasks = farmTasks.filter(t => t.status === 'In Progress').length;
  const completedTasks = farmTasks.filter(t => t.status === 'Completed').length;

  const initials = (farm?.name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

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
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>{farm?.name}</div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>{farm?.owner}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: statusBadge(farm?.status).bg, color: statusBadge(farm?.status).color }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusBadge(farm?.status).dot }} />
              {farm?.status}
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
              <div style={valStyle}>{farm?.name || '\u2014'}</div>
            </div>
            <div>
              <div style={labelRowStyle}><UsersIcon size={12} color="#9CA3AF" /> Owner</div>
              <div style={valStyle}>{farm?.owner || '\u2014'}</div>
            </div>
            <div>
              <div style={labelRowStyle}><Layers size={12} color="#9CA3AF" /> Soil Type</div>
              <div style={valStyle}>{farm?.soil || '\u2014'}</div>
            </div>
            <div>
              <div style={labelRowStyle}><Crosshair size={12} color="#9CA3AF" /> System Status</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: statusBadge(farm?.status).bg, color: statusBadge(farm?.status).color }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusBadge(farm?.status).dot }} />
                {farm?.status}
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
              <div style={valStyle}>{farm?.cropTypes || farm?.crop || '\u2014'}</div>
            </div>
            <div>
              <div style={labelRowStyle}><Map size={12} color="#9CA3AF" /> Farm Size</div>
              <div style={valStyle}>{displaySize}</div>
            </div>
            <div>
              <div style={labelRowStyle}><HardDrive size={12} color="#9CA3AF" /> Connected Devices</div>
              <div style={valStyle}>{deviceCountDynamic}</div>
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

        <div style={cardStyle}>
          <div style={sectionTitleStyle}>
            <ClipboardList size={15} color="#2e7d32" />
            <span style={sectionTitleTextStyle}>Tasks & Activities</span>
          </div>
          {farmTasks.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#6B7280', fontStyle: 'italic', padding: '8px 0' }}>No tasks assigned to this farm</div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
                {[
                  { label: 'Total', count: farmTasks.length, bg: 'rgba(46,125,50,0.08)', color: '#2e7d32', icon: ClipboardList },
                  { label: 'Pending', count: pendingTasks, bg: 'rgba(245,158,11,0.1)', color: '#92400E', icon: Clock },
                  { label: 'In Progress', count: inProgressTasks, bg: 'rgba(59,130,246,0.1)', color: '#1E40AF', icon: AlertCircle },
                  { label: 'Completed', count: completedTasks, bg: 'rgba(16,185,129,0.1)', color: '#065F46', icon: CheckCircle2 },
                ].map((item, idx) => (
                  <div key={idx} style={{ flex: 1, textAlign: 'center', background: item.bg, borderRadius: '12px', padding: '12px 8px', border: '1px solid rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                      <item.icon size={16} color={item.color} />
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: item.color }}>{item.count}</div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: item.color, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>{item.label}</div>
                  </div>
                ))}
              </div>
              {farmTasks.map((t, i) => {
                const meta = taskTypeMeta(t.type);
                const sb = statusBadge(t.priority);
                const ss = statusBadge(t.status);
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: i % 2 === 0 ? 'rgba(255,255,255,0.5)' : 'transparent', borderRadius: '12px', marginBottom: '4px', border: '1px solid rgba(255,255,255,0.3)' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${meta.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <TaskDot color={meta.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: meta.color }}>{t.type}</span>
                        <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#D1D5DB' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Calendar size={10} color="#9CA3AF" />
                          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>{t.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', flexShrink: 0 }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: sb.bg, color: sb.color, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{t.priority}</span>
                      <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: ss.bg, color: ss.color, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{t.status}</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )}</>
  );
}
