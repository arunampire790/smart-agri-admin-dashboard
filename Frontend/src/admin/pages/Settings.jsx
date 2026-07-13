import { useState } from 'react';

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

function DangerZoneRow({ label, sublabel, buttonText, onClick }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 0',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
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
        <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a' }}>Settings</div>
        <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Manage your profile and system preferences</div>
      </div>

      {/* Profile Settings */}
      <SettingsSection title="Profile Settings" subtitle="Update your personal information">
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
            >Edit</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4" style={{ marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>First Name</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name" className="settings-input"
              style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
              onMouseEnter={inputHover} onMouseLeave={inputLeave}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Last Name</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name" className="settings-input"
              style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
              onMouseEnter={inputHover} onMouseLeave={inputLeave}
            />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Email Address</label>
          <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)}
            placeholder="your@email.com" className="settings-input"
            style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
            onMouseEnter={inputHover} onMouseLeave={inputLeave}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Phone Number</label>
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
          >Save Changes</button>
        </div>
      </SettingsSection>

      {/* Notification Settings */}
      <SettingsSection title="Notification Settings" subtitle="Choose what you get notified about">
        <SettingsRow label="Email Notifications" sublabel="System event updates via email">
          <Toggle checked={emailNotif} onChange={() => setEmailNotif((p) => !p)} />
        </SettingsRow>
        <SettingsRow label="Task Assignments" sublabel="Get notified when tasks are assigned">
          <Toggle checked={taskAssign} onChange={() => setTaskAssign((p) => !p)} />
        </SettingsRow>
        <SettingsRow label="Robot Status Alerts" sublabel="Alert when robots go offline" noBorder>
          <Toggle checked={robotAlerts} onChange={() => setRobotAlerts((p) => !p)} />
        </SettingsRow>
      </SettingsSection>

      {/* Security Settings */}
      <SettingsSection title="Security Settings" subtitle="Manage your security preferences">
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Current Password</label>
          <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)}
            placeholder="Enter current password" className="settings-input"
            style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
            onMouseEnter={inputHover} onMouseLeave={inputLeave}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>New Password</label>
          <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)}
            placeholder="Enter new password" className="settings-input"
            style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
            onMouseEnter={inputHover} onMouseLeave={inputLeave}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Confirm New Password</label>
          <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
            placeholder="Confirm new password" className="settings-input"
            style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}
            onMouseEnter={inputHover} onMouseLeave={inputLeave}
          />
        </div>
        <div style={{ fontSize: 12, fontStyle: 'italic', color: '#6b7280', marginBottom: 16 }}>
          Passwords must be at least 8 characters
        </div>
        <SettingsRow label="Two-Factor Authentication" sublabel="Require an extra step at login" noBorder>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(107,114,128,0.1)', color: '#6b7280', borderRadius: 20, fontSize: 11, padding: '2px 8px', whiteSpace: 'nowrap' }}>Coming Soon</span>
            <div style={{ opacity: 0.4, pointerEvents: 'none' }}>
              <Toggle checked={false} onChange={() => {}} />
            </div>
          </div>
        </SettingsRow>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" style={btnStyle}
            onMouseEnter={btnEnter} onMouseLeave={btnLeave}
            onClick={() => { /* update password */ }}
          >Update Password</button>
        </div>
      </SettingsSection>

      {/* Danger Zone */}
      <SettingsSection title="Danger Zone" subtitle="Irreversible actions — proceed with caution" danger>
        <DangerZoneRow
          label="Clear Activity Log"
          sublabel="Permanently delete all audit log entries"
          buttonText="Clear Log"
          onClick={() => { /* clear activity log */ }}
        />
        <DangerZoneRow
          label="Reset All Settings"
          sublabel="Restore all settings to their default values"
          buttonText="Reset"
          onClick={() => { /* reset settings */ }}
        />
      </SettingsSection>
    </>
  );
}
