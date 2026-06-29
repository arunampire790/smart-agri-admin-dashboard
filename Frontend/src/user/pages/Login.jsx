export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F2F2F7' }}>
      <div
        className="w-[400px] text-center"
        style={{
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: 20,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.06)',
          padding: '40px 40px 36px',
        }}
      >
        <div className="text-2xl font-bold mb-2" style={{ color: '#1C1C1E' }}>User Login</div>
        <div className="text-sm mb-8" style={{ color: '#8E8E93' }}>Sign in to your account</div>

        <div className="flex flex-col gap-1.5 mb-5 text-left">
          <label className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Email</label>
          <input
            type="email"
            placeholder="your@email.com"
            className="text-sm outline-none w-full"
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid #E5E5EA',
              background: '#fff',
              color: '#1C1C1E',
              fontSize: 14,
            }}
            onFocus={(e) => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.12)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#E5E5EA'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        <div className="flex flex-col gap-1.5 mb-7 text-left">
          <label className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="text-sm outline-none w-full"
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid #E5E5EA',
              background: '#fff',
              color: '#1C1C1E',
              fontSize: 14,
            }}
            onFocus={(e) => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.12)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#E5E5EA'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        <button
          className="w-full border-none rounded-xl py-2.5 text-sm font-medium cursor-pointer"
          style={{
            background: '#059669',
            color: '#fff',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          Sign in
        </button>

        <p className="text-xs mt-5" style={{ color: '#8E8E93' }}>
          Don't have an account?{' '}
          <a href="/register" className="no-underline font-medium" style={{ color: '#059669' }}>Register</a>
        </p>

        <div
          className="mt-6 text-left"
          style={{
            padding: '12px 14px',
            borderRadius: 12,
            background: 'rgba(5, 150, 105, 0.06)',
            border: '1px solid rgba(5, 150, 105, 0.12)',
          }}
        >
          <div className="text-xs font-semibold mb-1.5" style={{ color: '#059669' }}>Demo Credentials</div>
          <div className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
            <span style={{ color: '#8E8E93' }}>Email:</span> admin@smartagri.com<br />
            <span style={{ color: '#8E8E93' }}>Password:</span> admin123
          </div>
        </div>
      </div>
    </div>
  );
}
