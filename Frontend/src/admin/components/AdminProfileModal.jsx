import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { User, Mail, Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { logActivity } from '../../utils/activityLogger';

const glassInput = "text-sm px-3.5 py-2.5 rounded-xl bg-white/50 border border-gray-300 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder text-primary cursor-text hover:border-gray-400";

export default function AdminProfileModal({ currentName, currentEmail, onClose, onSave }) {
  const [name, setName] = useState(currentName || 'Admin User');
  const [email, setEmail] = useState(currentEmail || 'admin@smartagri.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState('');

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
    setPasswordError('');

    const anyPasswordFilled = currentPassword || newPassword || confirmPassword;
    if (anyPasswordFilled) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordError('All three password fields must be filled to change your password.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError('New Password and Confirm New Password must match.');
        return;
      }
      if (newPassword.length < 8) {
        setPasswordError('Password must be at least 8 characters.');
        return;
      }
    }

    logActivity({
      userId: currentEmail || 'admin@smartagri.com',
      userName: currentName || 'Admin User',
      action: 'Edited Profile',
      target: 'Self',
      details: `Name: ${currentName || 'Admin User'} → ${name.trim()}, Email: ${currentEmail || 'admin@smartagri.com'} → ${email.trim()}`,
    });

    onSave?.(name.trim(), email.trim());
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="w-[560px] max-w-[calc(100vw-32px)] rounded-[24px] p-7 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60"
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: '16px', fontWeight: 700 }}>{initials}</span>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', lineHeight: '1.3' }}>Admin Profile</div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '1px' }}>Manage your profile and password.</div>
            </div>
          </div>
          <button type="button" onClick={onClose}
            style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#98989D', padding: '4px', display: 'flex', transition: 'color 0.15s ease, transform 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
          ><X size={18} /></button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.75)', borderRadius: '16px', padding: '20px 24px', border: '1px solid rgba(255,255,255,0.5)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
            <User size={15} color="#10B981" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Profile Information</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 32px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                <User size={12} color="#9CA3AF" /> Name
              </div>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name"
                className={glassInput}
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                <Mail size={12} color="#9CA3AF" /> Email
              </div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email address"
                className={glassInput}
              />
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.75)', borderRadius: '16px', padding: '20px 24px', border: '1px solid rgba(255,255,255,0.5)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
            <Lock size={15} color="#10B981" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Change Password</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 32px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                <Lock size={12} color="#9CA3AF" /> Current Password
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password"
                  className={glassInput} style={{ paddingRight: '32px' }}
                />
                <button type="button" onClick={() => setShowCurrent((o) => !o)} tabIndex={-1}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', background: 'none', border: 'none', color: '#9CA3AF', padding: '2px', display: 'flex' }}
                >
                  {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                <Lock size={12} color="#9CA3AF" /> New Password
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password"
                  className={glassInput} style={{ paddingRight: '32px' }}
                />
                <button type="button" onClick={() => setShowNew((o) => !o)} tabIndex={-1}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', background: 'none', border: 'none', color: '#9CA3AF', padding: '2px', display: 'flex' }}
                >
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              <Lock size={12} color="#9CA3AF" /> Confirm New Password
            </div>
            <div style={{ position: 'relative' }}>
              <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password"
                className={glassInput} style={{ paddingRight: '32px' }}
              />
              <button type="button" onClick={() => setShowConfirm((o) => !o)} tabIndex={-1}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', background: 'none', border: 'none', color: '#9CA3AF', padding: '2px', display: 'flex' }}
              >
                {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '8px' }}>Minimum 8 characters. Leave empty to keep current password.</div>
          {passwordError && (
            <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>&#9888;&#65039;</span> {passwordError}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={onClose}
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
      </div>
    </div>,
    document.body
  );
}
