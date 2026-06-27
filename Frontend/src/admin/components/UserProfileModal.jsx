const labelClass = "text-xs font-medium text-[#1C1C1E] tracking-wide";
const btnGhost = "text-xs px-3.5 py-1.5 border border-white/60 rounded-xl cursor-pointer bg-white/50 text-text-secondary font-medium transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] hover:bg-white/80";

export default function UserProfileModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', transition: 'all 0.3s ease' }} onClick={onClose}>
      <div className="w-[440px] max-w-[calc(100vw-32px)] rounded-[24px] p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-white/60" onClick={(e) => e.stopPropagation()} style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-lg font-bold text-[#1C1C1E]">User Details</div>
            <div className="text-xs text-text-secondary mt-0.5">Viewing information for {user.name}.</div>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn" style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#98989D', fontSize: '18px', transition: 'color 0.15s ease, transform 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
          >
            <i className="ph ph-x" />
          </button>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Name', value: user.name },
            { label: 'Email', value: user.email },
            { label: 'Phone', value: user.phone },
            { label: 'Number of Farms', value: user.farms },
            { label: 'Status', value: user.status },
            { label: 'Date Created', value: user.joined },
          ].map((field) => (
            <div key={field.label} className="flex flex-col gap-1">
              <span className={labelClass}>{field.label}</span>
              <div className="text-sm px-3.5 py-2.5 rounded-[12px] bg-white/50 border border-white/60 text-[#1C1C1E] w-full">{field.value}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <button onClick={onClose} className={btnGhost}>Close</button>
        </div>
      </div>
    </div>
  );
}
