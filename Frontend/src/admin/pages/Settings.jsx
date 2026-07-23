import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, RotateCcw } from 'lucide-react';
import { useActivityLog } from '../../context/ActivityLogContext';
import { useT } from '../../i18n';

const Toggle = ({ checked, onChange }) => (
  <label className="relative w-[51px] h-[31px] cursor-pointer shrink-0">
    <input type="checkbox" checked={checked} onChange={onChange} className="absolute inset-0 opacity-0 cursor-pointer peer" />
    <span className="absolute inset-0 bg-[#E9E9EA] rounded-full transition-colors duration-200 peer-checked:bg-brand" />
    <span className="absolute top-[1px] left-[1px] w-[29px] h-[29px] bg-white rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.08)] transition-transform duration-200 peer-checked:translate-x-[20px]" />
  </label>
);

function SettingsSection({ title, subtitle, children, danger }) {
  return (
    <div style={{
      background: '#ffffff',
      border: danger ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(0,0,0,0.06)',
      borderRadius: 16,
      padding: '28px 32px',
      marginBottom: 20,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: danger ? '#dc2626' : '#1a1a1a' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2, marginBottom: 20 }}>{subtitle}</div>}
      <div style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', marginBottom: 20 }} />
      {children}
    </div>
  );
}

function SettingsRow({ label, sublabel, children, noBorder }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 0',
      borderBottom: noBorder ? 'none' : '1px solid rgba(0,0,0,0.05)',
    }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{label}</div>
        {sublabel && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{sublabel}</div>}
      </div>
      {children}
    </div>
  );
}

function DangerZoneRow({ label, sublabel, buttonText, onClick, noBorder }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 0',
      borderBottom: noBorder ? 'none' : '1px solid rgba(239,68,68,0.08)',
    }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{label}</div>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{sublabel}</div>
      </div>
      <button type="button" onClick={onClick}
        style={{
          border: '1px solid #ef4444',
          color: '#ef4444',
          background: 'transparent',
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >{buttonText}</button>
    </div>
  );
}

export default function Settings() {
  const { clearLog } = useActivityLog();
  const t = useT('settings');

  const [firstName, setFirstName] = useState('Admin');
  const [lastName, setLastName] = useState('User');
  const [profileEmail, setProfileEmail] = useState('admin@smartagri.com');
  const [phone, setPhone] = useState('+1-555-0199');

  const [emailNotif, setEmailNotif] = useState(true);
  const [taskAssign, setTaskAssign] = useState(true);
  const [robotAlerts, setRobotAlerts] = useState(true);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  const handleClearLog = () => {
    clearLog();
    setShowClearDialog(false);
    showToast(t('toastLogCleared'));
  };

  const handleResetSettings = () => {
    setEmailNotif(true);
    setTaskAssign(true);
    setRobotAlerts(true);
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setShowResetDialog(false);
    showToast(t('toastSettingsReset'));
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const inputStyle = {
    background: '#f9fafb',
    border: '1.5px solid #e5e7eb',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 14,
    color: '#1a1a1a',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.15s ease',
  };

  const inputFocus = (e) => {
    e.target.style.borderColor = '#2e7d2e';
    e.target.style.boxShadow = '0 0 0 3px rgba(46,125,50,0.1)';
    e.target.style.background = '#ffffff';
  };

  const inputBlur = (e) => {
    e.target.style.borderColor = '#e5e7eb';
    e.target.style.boxShadow = 'none';
    e.target.style.background = '#f9fafb';
  };

  const inputHover = (e) => {
    if (document.activeElement !== e.target) {
      e.target.style.borderColor = '#9ca3af';
    }
  };

  const inputLeave = (e) => {
    if (document.activeElement !== e.target) {
      e.target.style.borderColor = '#e5e7eb';
    }
  };

  const btnStyle = {
    background: '#1a3a2a',
    color: '#ffffff',
    border: 'none',
    borderRadius: 8,
    padding: '9px 20px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const btnEnter = (e) => {
    e.currentTarget.style.background = '#2e7d2e';
    e.currentTarget.style.transform = 'translateY(-1px)';
  };

  const btnLeave = (e) => {
    e.currentTarget.style.background = '#1a3a2a';
    e.currentTarget.style.transform = 'translateY(0)';
  };

  return (
    <>
      <style>{`.settings-input::placeholder { color: #9ca3af; font-size: 14px; }`}</style>
      <div className="mb-6">
        <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a' }}>{t('pageTitle')}</div>
        <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>{t('pageSubtitle')}</div>
      </div>

      {/* Profile Settings */}
      <SettingsSection title={t('profileTitle')} subtitle={t('profileSubtitle')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#1a3a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#ffffff', fontSize: 20, fontWeight: 700 }}>AD</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>Admin User</div>
            <button type="button" className="bg-none border-none p-0 cursor-pointer"
              style={{ fontSize: 13, fontWeight: 500, color: '#2e7d2e', transition: 'color 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#1a5c2a'; e.currentTarget.style.textDecoration = 'underline'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#2e7d2e'; e.currentTarget.style.textDecoration = 'none'; }}
            >{t('edit')}</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4" style={{ marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{t('firstName')}</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
              placeholder={t('firstNamePlaceholder')} className="settings-input"
              style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
              onMouseEnter={inputHover} onMouseLeave={inputLeave}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{t('lastName')}</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
              placeholder={t('lastNamePlaceholder')} className="settings-input"
              style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
              onMouseEnter={inputHover} onMouseLeave={inputLeave}
            />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{t('emailAddress')}</label>
          <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)}
            placeholder={t('emailPlaceholder')} className="settings-input"
            style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
            onMouseEnter={inputHover} onMouseLeave={inputLeave}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{t('phoneNumber')}</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="+1-555-0000" className="settings-input"
            style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
            onMouseEnter={inputHover} onMouseLeave={inputLeave}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" style={btnStyle}
            onMouseEnter={btnEnter} onMouseLeave={btnLeave}
            onClick={() => { /* save profile */ }}
          >{t('saveChanges')}</button>
        </div>
      </SettingsSection>

      {/* Notification Settings */}
      <SettingsSection title={t('notificationTitle')} subtitle={t('notificationSubtitle')}>
        <SettingsRow label={t('emailNotifications')} sublabel={t('emailNotificationsDesc')}>
          <Toggle checked={emailNotif} onChange={() => setEmailNotif((p) => !p)} />
        </SettingsRow>
        <SettingsRow label={t('taskAssignments')} sublabel={t('taskAssignmentsDesc')}>
          <Toggle checked={taskAssign} onChange={() => setTaskAssign((p) => !p)} />
        </SettingsRow>
        <SettingsRow label={t('robotStatusAlerts')} sublabel={t('robotStatusAlertsDesc')} noBorder>
          <Toggle checked={robotAlerts} onChange={() => setRobotAlerts((p) => !p)} />
        </SettingsRow>
      </SettingsSection>

      {/* Security Settings */}
      <SettingsSection title={t('securityTitle')} subtitle={t('securitySubtitle')}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{t('currentPassword')}</label>
          <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)}
            placeholder={t('currentPasswordPlaceholder')} className="settings-input"
            style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
            onMouseEnter={inputHover} onMouseLeave={inputLeave}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{t('newPassword')}</label>
          <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)}
            placeholder={t('newPasswordPlaceholder')} className="settings-input"
            style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
            onMouseEnter={inputHover} onMouseLeave={inputLeave}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{t('confirmNewPassword')}</label>
          <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
            placeholder={t('confirmNewPasswordPlaceholder')} className="settings-input"
            style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
            onMouseEnter={inputHover} onMouseLeave={inputLeave}
          />
        </div>
        <div style={{ fontSize: 12, fontStyle: 'italic', color: '#6b7280', marginBottom: 16 }}>
          {t('passwordHint')}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" style={btnStyle}
            onMouseEnter={btnEnter} onMouseLeave={btnLeave}
            onClick={() => { /* update password */ }}
          >{t('updatePassword')}</button>
        </div>
      </SettingsSection>

      {/* Danger Zone */}
      <SettingsSection title={t('dangerZoneTitle')} subtitle={t('dangerZoneSubtitle')} danger>
        <DangerZoneRow
          label={t('clearActivityLog')}
          sublabel={t('clearActivityLogDesc')}
          buttonText={t('clearLog')}
          onClick={() => setShowClearDialog(true)}
        />
        <DangerZoneRow
          label={t('resetAllSettings')}
          sublabel={t('resetAllSettingsDesc')}
          buttonText={t('reset')}
          onClick={() => setShowResetDialog(true)}
          noBorder
        />
      </SettingsSection>

      {/* Clear Activity Log Dialog */}
      {showClearDialog && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowClearDialog(false)}
        >
          <div className="rounded-[20px] p-6 w-[400px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-white/50"
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#ffffff' }}
          >
            <div className="text-lg font-bold text-primary mb-2">{t('clearDialogTitle')}</div>
            <div className="text-sm text-text-secondary mb-6">
              {t('clearDialogMessage')}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowClearDialog(false)}
                className="text-xs px-3.5 py-1.5 border border-[rgba(0,0,0,0.05)] rounded-xl bg-white text-text-secondary font-medium hover:bg-[#d1e8d1] hover:border-[rgba(0,0,0,0.15)] cursor-pointer transition-all duration-150 active:scale-[0.97] hover:scale-[1.04] focus-visible:scale-[1.04] focus:outline-none"
              >{t('cancel')}</button>
              <button onClick={handleClearLog}
                style={{ background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                className="transition-all duration-150 active:scale-[0.97] hover:scale-[1.04]"
              ><Trash2 size={14} /> {t('clearLog')}</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Reset All Settings Dialog */}
      {showResetDialog && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowResetDialog(false)}
        >
          <div className="rounded-[20px] p-6 w-[400px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-white/50"
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#ffffff' }}
          >
            <div className="text-lg font-bold text-primary mb-2">{t('resetDialogTitle')}</div>
            <div className="text-sm text-text-secondary mb-6">
              {t('resetDialogMessage')}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowResetDialog(false)}
                className="text-xs px-3.5 py-1.5 border border-[rgba(0,0,0,0.05)] rounded-xl bg-white text-text-secondary font-medium hover:bg-[#d1e8d1] hover:border-[rgba(0,0,0,0.15)] cursor-pointer transition-all duration-150 active:scale-[0.97] hover:scale-[1.04] focus-visible:scale-[1.04] focus:outline-none"
              >{t('cancel')}</button>
              <button onClick={handleResetSettings}
                style={{ background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                className="transition-all duration-150 active:scale-[0.97] hover:scale-[1.04]"
              ><RotateCcw size={14} /> {t('resetSettings')}</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 200,
          background: '#1a3a2a', color: '#ffffff',
          borderRadius: 8, padding: '10px 16px',
          fontSize: 13, fontWeight: 500,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>{toast}</div>
      )}
    </>
  );
}
