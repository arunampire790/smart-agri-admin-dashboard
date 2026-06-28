import { useState } from 'react';

const Toggle = ({ checked, onChange }) => (
  <label className="relative w-[51px] h-[31px] cursor-pointer shrink-0">
    <input type="checkbox" checked={checked} onChange={onChange} className="opacity-0 w-0 h-0 peer" />
    <span className="absolute inset-0 bg-[#E9E9EA] rounded-full transition-colors duration-200 peer-checked:bg-brand" />
    <span className="absolute top-[1px] left-[1px] w-[29px] h-[29px] bg-white rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.08)] transition-transform duration-200 peer-checked:translate-x-[20px]" />
  </label>
);

function SettingsSection({ title, subtitle, children }) {
  return (
    <div className="glass-card rounded-2xl p-6 mb-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.04)]">
      <div className="text-base font-semibold text-[#1C1C1E] mb-1">{title}</div>
      <div className="text-xs text-text-secondary mb-5">{subtitle}</div>
      {children}
    </div>
  );
}

function SettingsRow({ label, sublabel, children }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[rgba(0,0,0,0.05)] last:border-b-0">
      <div>
        <div className="text-sm font-medium text-[#1C1C1E]">{label}</div>
        <div className="text-[10px] text-text-secondary mt-0.5">{sublabel}</div>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const [firstName, setFirstName] = useState('Admin');
  const [lastName, setLastName] = useState('User');
  const [email, setEmail] = useState('admin@smartagri.com');
  const [phone, setPhone] = useState('+1-555-0199');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyTasks, setNotifyTasks] = useState(true);
  const [notifyRobotAlerts, setNotifyRobotAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [autoAssign, setAutoAssign] = useState(true);
  const [autoSchedule, setAutoSchedule] = useState(true);
  const [cloudBackup, setCloudBackup] = useState(false);

  return (
    <>
      <div className="mb-6">
        <div className="text-2xl font-bold text-[#000000]">Settings</div>
        <div className="text-sm text-text-secondary mt-1">Manage your profile and system preferences</div>
      </div>

      <SettingsSection title="Profile Settings" subtitle="Update your personal information">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#1C1C1E]">First Name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="text-sm px-3.5 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] focus:bg-white/50 placeholder:text-text-placeholder" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#1C1C1E]">Last Name</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="text-sm px-3.5 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] focus:bg-white/50 placeholder:text-text-placeholder" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-medium text-[#1C1C1E]">Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="text-sm px-3.5 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] focus:bg-white/50 w-full placeholder:text-text-placeholder" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#1C1C1E]">Phone Number</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="text-sm px-3.5 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] focus:bg-white/50 w-full placeholder:text-text-placeholder" />
        </div>
      </SettingsSection>

      <SettingsSection title="Notification Settings" subtitle="Choose what you get notified about">
        <SettingsRow label="Email Notifications" sublabel="System event updates via email"><Toggle checked={notifyEmail} onChange={() => setNotifyEmail(!notifyEmail)} /></SettingsRow>
        <SettingsRow label="Task Assignments" sublabel="Get notified when tasks are assigned"><Toggle checked={notifyTasks} onChange={() => setNotifyTasks(!notifyTasks)} /></SettingsRow>
        <SettingsRow label="Robot Status Alerts" sublabel="Alert when robots go offline"><Toggle checked={notifyRobotAlerts} onChange={() => setNotifyRobotAlerts(!notifyRobotAlerts)} /></SettingsRow>
        <SettingsRow label="Weekly Reports" sublabel="Receive weekly summary reports"><Toggle checked={weeklyReports} onChange={() => setWeeklyReports(!weeklyReports)} /></SettingsRow>
      </SettingsSection>

      <SettingsSection title="Security Settings" subtitle="Manage your security architecture">
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-medium text-[#1C1C1E]">Current Password</label>
          <input type="password" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="text-sm px-3.5 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] focus:bg-white/50 w-full placeholder:text-text-placeholder" />
        </div>
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-medium text-[#1C1C1E]">New Password</label>
          <input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="text-sm px-3.5 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] focus:bg-white/50 w-full placeholder:text-text-placeholder" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#1C1C1E]">Confirm New Password</label>
          <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="text-sm px-3.5 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] focus:bg-white/50 w-full placeholder:text-text-placeholder" />
        </div>
        <SettingsRow label="Two-Factor Authentication" sublabel="Require an extra step at login"><Toggle checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} /></SettingsRow>
      </SettingsSection>

      <SettingsSection title="System Settings" subtitle="Configure automation and data preferences">
        <SettingsRow label="Auto-assign Tasks" sublabel="Automatically assign tasks to available robots"><Toggle checked={autoAssign} onChange={() => setAutoAssign(!autoAssign)} /></SettingsRow>
        <SettingsRow label="Auto-scheduling" sublabel="Schedule tasks based on weather and soil conditions"><Toggle checked={autoSchedule} onChange={() => setAutoSchedule(!autoSchedule)} /></SettingsRow>
        <SettingsRow label="Cloud Backup" sublabel="Auto-backup farm data to cloud daily"><Toggle checked={cloudBackup} onChange={() => setCloudBackup(!cloudBackup)} /></SettingsRow>
      </SettingsSection>

      <div className="flex gap-3 mt-6">
        <button className="text-xs px-3.5 py-1.5 border border-[rgba(0,0,0,0.05)] rounded-xl cursor-pointer bg-white font-medium text-text-secondary hover:bg-[#E5E5EA]" onClick={() => { setFirstName('Admin'); setLastName('User'); setEmail('admin@smartagri.com'); setPhone('+1-555-0199'); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setNotifyEmail(true); setNotifyTasks(true); setNotifyRobotAlerts(true); setWeeklyReports(false); setTwoFactor(false); setAutoAssign(true); setAutoSchedule(true); setCloudBackup(false); }}>Cancel</button>
        <button className="bg-brand text-white border-none rounded-xl px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 hover:opacity-90" onClick={() => alert('Settings saved successfully!')}>Save Changes</button>
      </div>
    </>
  );
}
