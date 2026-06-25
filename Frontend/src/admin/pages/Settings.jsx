function Toggle({ defaultChecked }) {
  return (
    <label className="relative w-9 h-5 cursor-pointer shrink-0">
      <input type="checkbox" defaultChecked={defaultChecked} className="opacity-0 w-0 h-0 peer" />
      <span className="absolute inset-0 bg-[#f5f5f5] rounded-[10px] border border-[#e0e0e0] transition-colors duration-200 peer-checked:bg-[#2e7d32] peer-checked:border-[#2e7d32]" />
      <span className="absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-transform duration-200 peer-checked:translate-x-4" />
    </label>
  );
}

function SettingsSection({ title, subtitle, children }) {
  return (
    <div className="bg-white border border-[#e0e0e0] rounded-xl p-4 mb-3">
      <div className="text-sm font-medium mb-1">{title}</div>
      <div className="text-xs text-[#757575] mb-3.5">{subtitle}</div>
      {children}
    </div>
  );
}

function SettingsRow({ label, sublabel, children }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#e0e0e0] last:border-b-0">
      <div>
        <div className="text-sm">{label}</div>
        <div className="text-[10px] text-[#757575]">{sublabel}</div>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  return (
    <>
      <div className="mb-4">
        <div className="text-xl font-medium text-[#1C1C1E]">Settings</div>
        <div className="text-sm text-[#757575] mt-0.5">Manage your profile and system preferences</div>
      </div>

      <SettingsSection title="Profile" subtitle="Update your personal information">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#757575]">First name</label>
            <input defaultValue="Admin" className="text-sm px-2.5 py-1.5 border border-[#e0e0e0] rounded-md bg-[#f5f5f5] outline-none focus:border-[#2e7d32]" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#757575]">Last name</label>
            <input defaultValue="User" className="text-sm px-2.5 py-1.5 border border-[#e0e0e0] rounded-md bg-[#f5f5f5] outline-none focus:border-[#2e7d32]" />
          </div>
        </div>
        <div className="flex flex-col gap-1 mb-2.5">
          <label className="text-xs text-[#757575]">Email</label>
          <input defaultValue="admin@smartagri.com" className="text-sm px-2.5 py-1.5 border border-[#e0e0e0] rounded-md bg-[#f5f5f5] outline-none focus:border-[#2e7d32] w-full" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#757575]">Phone</label>
          <input defaultValue="+1-555-0199" className="text-sm px-2.5 py-1.5 border border-[#e0e0e0] rounded-md bg-[#f5f5f5] outline-none focus:border-[#2e7d32] w-full" />
        </div>
      </SettingsSection>

      <SettingsSection title="Notifications" subtitle="Choose what you get notified about">
        <SettingsRow label="Email notifications" sublabel="System event updates via email"><Toggle defaultChecked /></SettingsRow>
        <SettingsRow label="Task assignments" sublabel="Get notified when tasks are assigned"><Toggle defaultChecked /></SettingsRow>
        <SettingsRow label="Robot status alerts" sublabel="Alert when robots go offline"><Toggle defaultChecked /></SettingsRow>
        <SettingsRow label="Weekly reports" sublabel="Receive weekly summary reports"><Toggle /></SettingsRow>
      </SettingsSection>

      <SettingsSection title="System" subtitle="Configure system-wide preferences">
        <SettingsRow label="Auto-assign tasks" sublabel="AI-powered task assignment"><Toggle /></SettingsRow>
        <SettingsRow label="Robot auto-scheduling" sublabel="Automatic robot task scheduling"><Toggle defaultChecked /></SettingsRow>
        <SettingsRow label="Daily data backup" sublabel="Automatically backup system data"><Toggle defaultChecked /></SettingsRow>
      </SettingsSection>

      <SettingsSection title="Security" subtitle="Change your password">
        <div className="flex flex-col gap-1 mb-2.5">
          <label className="text-xs text-[#757575]">Current password</label>
          <input type="password" placeholder="Enter current password" className="text-sm px-2.5 py-1.5 border border-[#e0e0e0] rounded-md bg-[#f5f5f5] outline-none focus:border-[#2e7d32] w-full" />
        </div>
        <div className="flex flex-col gap-1 mb-2.5">
          <label className="text-xs text-[#757575]">New password</label>
          <input type="password" placeholder="Enter new password" className="text-sm px-2.5 py-1.5 border border-[#e0e0e0] rounded-md bg-[#f5f5f5] outline-none focus:border-[#2e7d32] w-full" />
        </div>
        <div className="flex flex-col gap-1 mb-3">
          <label className="text-xs text-[#757575]">Confirm new password</label>
          <input type="password" placeholder="Confirm new password" className="text-sm px-2.5 py-1.5 border border-[#e0e0e0] rounded-md bg-[#f5f5f5] outline-none focus:border-[#2e7d32] w-full" />
        </div>
        <SettingsRow label="Two-factor authentication" sublabel="Extra security for your account"><Toggle /></SettingsRow>
      </SettingsSection>

      <div className="flex gap-2 mt-4">
        <button className="bg-[#2e7d32] text-white border-none rounded-md px-4 py-2 text-sm cursor-pointer flex items-center gap-1.5 hover:bg-[#1b5e20]">Save changes</button>
        <button className="text-xs px-3 py-1.5 border border-[#e0e0e0] rounded-md cursor-pointer bg-transparent text-[#1C1C1E] hover:bg-[#f5f5f5]">Cancel</button>
      </div>
    </>
  );
}
