import { useState, useEffect, useCallback } from 'react';
import { User, Mail, Phone, Shield, X, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../utils/activityLogger';

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

const inputStyle = {
  fontSize: '14px',
  fontWeight: 500,
  color: 'var(--text-primary)',
  lineHeight: '1.5',
  background: 'var(--bg-white)',
  border: '1px solid var(--border-input)',
  borderRadius: '8px',
  padding: '6px 10px',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
};

export default function AdminProfileModal({ onClose }) {
  const { currentUser, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    if (currentUser) {
      setForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
      });
    }
  }, [currentUser]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSave = () => {
    // TODO: Replace with real backend API call once backend is added
    const updated = { ...currentUser, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() };
    login(updated);
    logActivity({ userId: currentUser?.email, userName: currentUser?.name, action: 'Edited Profile', target: 'Self', details: `Name: ${currentUser?.name} → ${form.name.trim()}, Email: ${currentUser?.email} → ${form.email.trim()}` });
    setEditing(false);
  };

  const handleCancel = () => {
    setForm({ name: currentUser?.name || '', email: currentUser?.email || '', phone: currentUser?.phone || '' });
    setEditing(false);
  };

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : 'AD';

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
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.3' }}>{currentUser?.name || 'Admin User'}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{currentUser?.email || 'admin@smartagri.com'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: 'var(--green-pill-bg)', color: 'var(--green-pill-text)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981' }} />
              Active
            </span>
            {!editing && (
              <button type="button" onClick={() => setEditing(true)} title="Edit profile" style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--clr-text-placeholder)', padding: '4px', display: 'flex', transition: 'color 0.15s ease, transform 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#10B981'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
              ><i className="ph ph-pencil" style={{ fontSize: '18px' }} /></button>
            )}
            <button type="button" onClick={onClose} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--clr-text-placeholder)', padding: '4px', display: 'flex', transition: 'color 0.15s ease, transform 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
            ><X size={18} /></button>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-divider)' }}>
            <User size={16} color="#10B981" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Profile Details</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div>
              <div style={labelIconStyle}><User size={13} color="#9CA3AF" /> Name</div>
              {editing ? (
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              ) : (
                <div style={valStyle}>{currentUser?.name || 'Admin User'}</div>
              )}
            </div>
            <div>
              <div style={labelIconStyle}><Mail size={13} color="#9CA3AF" /> Email</div>
              {editing ? (
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
              ) : (
                <div style={valStyle}>{currentUser?.email || 'admin@smartagri.com'}</div>
              )}
            </div>
            <div>
              <div style={labelIconStyle}><Phone size={13} color="#9CA3AF" /> Phone</div>
              {editing ? (
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1-555-xxxx" style={inputStyle} />
              ) : (
                <div style={valStyle}>{currentUser?.phone || '+1-555-0199'}</div>
              )}
            </div>
            <div>
              <div style={labelIconStyle}><Shield size={13} color="#9CA3AF" /> Role</div>
              <div style={{ ...valStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: 'rgba(16,185,129,0.12)', color: 'var(--clr-brand)' }}>masterAdmin</span>
              </div>
            </div>
          </div>
        </div>

        {editing && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '4px' }}>
            <button type="button" onClick={handleCancel} style={{ cursor: 'pointer', fontSize: '13px', padding: '6px 14px', border: '1px solid var(--clr-border)', borderRadius: '12px', background: 'var(--bg-white)', color: 'var(--text-muted)', fontWeight: 500, transition: 'all 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.borderColor = '#9CA3AF'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; }}
            >Cancel</button>
            <button type="button" onClick={handleSave} style={{ cursor: 'pointer', fontSize: '13px', padding: '6px 14px', border: 'none', borderRadius: '12px', background: '#10B981', color: 'var(--bg-white)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.boxShadow = ''; }}
            ><Check size={14} color="#FFFFFF" /> Save</button>
          </div>
        )}
      </div>
    </div>
  );
}
