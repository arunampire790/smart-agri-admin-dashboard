const Toggle = ({ defaultChecked }) => (
  <label className="relative w-11 h-6 cursor-pointer">
    <input type="checkbox" defaultChecked={defaultChecked} className="opacity-0 w-0 h-0 peer" />
    <span className="absolute inset-0 bg-[#EAEAEA] rounded-full transition-colors peer-checked:bg-brand" />
    <span className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform peer-checked:translate-x-5" />
  </label>
);

function SettingsSection({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl p-6 mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      <div className="text-base font-semibold mb-1">{title}</div>
      <div className="text-xs text-text-secondary mb-5">{subtitle}</div>
      {children}
    </div>
  );
}

function SettingsRow({ label, sublabel, children }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#EAEAEA] last:border-b-0">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[10px] text-text-secondary mt-0.5">{sublabel}</div>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  return (
    <>
      <div className="mb-6">
        <div className="text-2xl font-semibold">Settings</div>
        <div className="text-sm text-text-secondary mt-1">Manage your profile and system preferences</div>
      </div>

      <SettingsSection title="Profile Settings" subtitle="Update your personal information">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium">First Name</label>
            <input defaultValue="Admin" className="text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium">Last Name</label>
            <input defaultValue="User" className="text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)]" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-medium">Email Address</label>
          <input defaultValue="admin@smartagri.com" className="text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)] w-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium">Phone Number</label>
          <input defaultValue="+1-555-0199" className="text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)] w-full" />
        </div>
      </SettingsSection>

      <SettingsSection title="Notification Settings" subtitle="Choose what you get notified about">
        <SettingsRow label="Email Notifications" sublabel="System event updates via email"><Toggle defaultChecked /></SettingsRow>
        <SettingsRow label="Task Assignments" sublabel="Get notified when tasks are assigned"><Toggle defaultChecked /></SettingsRow>
        <SettingsRow label="Robot Status Alerts" sublabel="Alert when robots go offline"><Toggle defaultChecked /></SettingsRow>
        <SettingsRow label="Weekly Reports" sublabel="Receive weekly summary reports"><Toggle /></SettingsRow>
      </SettingsSection>

      <SettingsSection title="Security Settings" subtitle="Manage your security architecture">
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-medium">Current Password</label>
          <input type="password" placeholder="Enter current password" className="text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)] w-full" />
        </div>
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-medium">New Password</label>
          <input type="password" placeholder="Enter new password" className="text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)] w-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium">Confirm New Password</label>
          <input type="password" placeholder="Confirm new password" className="text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)] w-full" />
        </div>
        <SettingsRow label="Two-Factor Authentication" sublabel="Require an extra step at login"><Toggle /></SettingsRow>
      </SettingsSection>

      <SettingsSection title="System Settings" subtitle="Configure automation and data preferences">
        <SettingsRow label="Auto-assign Tasks" sublabel="Automatically assign tasks to available robots"><Toggle defaultChecked /></SettingsRow>
        <SettingsRow label="Auto-scheduling" sublabel="Schedule tasks based on weather and soil conditions"><Toggle defaultChecked /></SettingsRow>
        <SettingsRow label="Cloud Backup" sublabel="Auto-backup farm data to cloud daily"><Toggle /></SettingsRow>
      </SettingsSection>

      <div className="flex gap-3 mt-6">
        <button className="text-xs px-3.5 py-1.5 border border-[#EAEAEA] rounded-lg cursor-pointer bg-white font-medium hover:bg-[#F1F3F4]">Cancel</button>
        <button className="bg-brand text-white border-none rounded-lg px-4 py-2 text-sm font-medium cursor-pointer flex items-center gap-2 hover:opacity-90">Save Changes</button>
      </div>
    </>
  );
}
