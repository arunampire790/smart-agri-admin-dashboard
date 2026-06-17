import React from 'react';

export default function Settings() {
  return (
    <>
      <div className="page-header">
        <div className="page-title">Settings</div>
        <div className="page-sub">Manage your profile and system preferences</div>
      </div>
      
      <div className="settings-section">
        <div className="settings-group-title">Profile Settings</div>
        <div className="settings-group-sub">Update your personal information</div>
        <div className="form-row">
          <div className="form-group"><div className="form-label">First Name</div><input className="form-input" defaultValue="Admin" /></div>
          <div className="form-group"><div className="form-label">Last Name</div><input className="form-input" defaultValue="User" /></div>
        </div>
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <div className="form-label">Email Address</div>
          <input className="form-input" defaultValue="admin@smartagri.com" style={{ width: '100%' }} />
        </div>
        <div className="form-group">
          <div className="form-label">Phone Number</div>
          <input className="form-input" defaultValue="+1-555-0199" style={{ width: '100%' }} />
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-group-title">Notification Settings</div>
        <div className="settings-group-sub">Choose what you get notified about</div>
        <div className="settings-row">
          <div><div className="settings-label">Email Notifications</div><div className="settings-sublabel">System event updates via email</div></div>
          <label className="toggle"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></label>
        </div>
        <div className="settings-row">
          <div><div className="settings-label">Task Assignments</div><div className="settings-sublabel">Get notified when tasks are assigned</div></div>
          <label className="toggle"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></label>
        </div>
        <div className="settings-row">
          <div><div className="settings-label">Robot Status Alerts</div><div className="settings-sublabel">Alert when robots go offline</div></div>
          <label className="toggle"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></label>
        </div>
        <div className="settings-row">
          <div><div className="settings-label">Weekly Reports</div><div className="settings-sublabel">Receive weekly summary reports</div></div>
          <label className="toggle"><input type="checkbox" /><span className="toggle-slider"></span></label>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-group-title">Security Settings</div>
        <div className="settings-group-sub">Manage your security architecture</div>
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <div className="form-label">Current Password</div>
          <input className="form-input" type="password" placeholder="Enter current password" style={{ width: '100%' }} />
        </div>
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <div className="form-label">New Password</div>
          <input className="form-input" type="password" placeholder="Enter new password" style={{ width: '100%' }} />
        </div>
        <div className="form-group">
          <div className="form-label">Confirm New Password</div>
          <input className="form-input" type="password" placeholder="Confirm new password" style={{ width: '100%' }} />
        </div>
        <div className="settings-row" style={{ marginTop: '20px' }}>
          <div><div className="settings-label">Two-Factor Authentication</div><div className="settings-sublabel">Require an extra step at login</div></div>
          <label className="toggle"><input type="checkbox" /><span className="toggle-slider"></span></label>
        </div>
      </div>

      <div className="save-bar">
        <button className="btn-sm">Cancel</button>
        <button className="btn-primary">Save Changes</button>
      </div>
    </>
  );
}
