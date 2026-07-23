import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { User, Mail, Shield, Activity, Pencil, X, Check } from 'lucide-react';
import { logActivity } from '../../utils/activityLogger';
import { useT } from '../../i18n';

const glassInput = "text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-gray-300 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder text-primary cursor-text hover:border-gray-400";

const cardStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  padding: '20px 24px',
  border: '1px solid rgba(76,175,80,0.15)',
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

const RoleDropdown = ({ value, onChange }) => {
  const t = useT('profile');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const options = ['Master Admin', 'Admin'];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className={glassInput}
        style={{ cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <span>{value || t('adminSelectRole')}</span>
        <i className={`ph ph-caret-down text-text-placeholder text-sm transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-1 overflow-hidden"
          style={{
            background: '#ffffff',
            border: '1px solid rgba(76,175,80,0.15)',
            borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}
        >
          {options.map((opt) => (
            <div key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                padding: '12px 16px',
                fontSize: '14px',
                color: opt === value ? '#10B981' : '#1d1d1f',
                background: opt === value ? 'rgba(16,185,129,0.12)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.15s, color 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onMouseEnter={(e) => { if (opt !== value) { e.currentTarget.style.background = 'rgba(16,185,129,0.12)'; e.currentTarget.style.color = '#10B981'; } }}
              onMouseLeave={(e) => { if (opt !== value) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1d1d1f'; } }}
            >
              {opt}
              {opt === value && <i className="ph ph-check text-sm" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function AdminProfileModal({ currentName, currentEmail, onClose, onSave }) {
  const t = useT('profile');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentName || 'Admin User');
  const [email, setEmail] = useState(currentEmail || 'admin@smartagri.com');
  const [role, setRole] = useState('Master Admin');

  const initials = (name || 'Admin User').split(' ').map((n) => n[0]).join('').toUpperCase();

  useEffect(() => {
    setName(currentName || 'Admin User');
    setEmail(currentEmail || 'admin@smartagri.com');
  }, [currentName, currentEmail]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSave = () => {
    logActivity({
      userId: currentEmail || 'admin@smartagri.com',
      userName: currentName || 'Admin User',
      action: 'Edited Profile',
      target: 'Self',
      details: `Name: ${currentName || 'Admin User'} → ${name.trim()}, Email: ${currentEmail || 'admin@smartagri.com'} → ${email.trim()}, Role: ${role}`,
    });
    onSave?.(name.trim(), email.trim());
    setEditing(false);
  };

  const handleCancel = () => {
    setName(currentName || 'Admin User');
    setEmail(currentEmail || 'admin@smartagri.com');
    setRole('Master Admin');
    setEditing(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}>
      <div className="w-[680px] max-w-[calc(100vw-32px)] rounded-[24px] p-7 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60"
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#ffffff', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>{initials}</span>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>{name}</div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>{email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!editing && (
              <button type="button" onClick={() => setEditing(true)} title={t('adminEditProfile')}
                style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#9CA3AF', padding: '4px', display: 'flex', transition: 'color 0.15s ease, transform 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#10B981'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
              ><Pencil size={16} /></button>
            )}
            <button type="button" onClick={onClose}
              style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#98989D', padding: '4px', display: 'flex', transition: 'color 0.15s ease, transform 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
            ><X size={18} /></button>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={sectionTitleStyle}>
            <Shield size={15} color="#10B981" />
            <span style={sectionTitleTextStyle}>{t('adminInformation')}</span>
          </div>
          <div style={gridStyle}>
            <div>
              <div style={labelRowStyle}><User size={12} color="#9CA3AF" /> {t('adminName')}</div>
              {editing ? (
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('adminEnterFullName')} className={glassInput} />
              ) : (
                <div style={valStyle}>{name}</div>
              )}
            </div>
            <div>
              <div style={labelRowStyle}><Mail size={12} color="#9CA3AF" /> {t('adminEmail')}</div>
              {editing ? (
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('adminEnterEmail')} className={glassInput} />
              ) : (
                <div style={valStyle}>{email}</div>
              )}
            </div>
            <div>
              <div style={labelRowStyle}><Shield size={12} color="#9CA3AF" /> {t('adminRole')}</div>
              {editing ? (
                <RoleDropdown value={role} onChange={setRole} />
              ) : (
                <div style={{ ...valStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ padding: '2px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, background: 'rgba(16,185,129,0.12)', color: '#059669' }}>{role}</span>
                </div>
              )}
            </div>
            <div>
              <div style={labelRowStyle}><Activity size={12} color="#9CA3AF" /> {t('adminSystemStatus')}</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: '#D1FAE5', color: '#065F46' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                {t('adminActive')}
              </span>
            </div>
          </div>
        </div>

        {editing && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={handleCancel}
              style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.15)', color: '#4B5563', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s ease', padding: '9px 18px', fontSize: '13px' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >{t('adminCancel')}</button>
            <button type="button" onClick={handleSave}
              style={{ background: '#10B981', color: '#FFFFFF', fontWeight: 600, borderRadius: '12px', padding: '9px 20px', cursor: 'pointer', transition: 'all 0.2s ease', border: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '1'; }}
            >
              <Check size={16} /> {t('adminSaveChanges')}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
