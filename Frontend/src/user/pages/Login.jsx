import { useState, useRef, useCallback } from 'react';

export default function Login() {
  const cardRef = useRef(null);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlowPos({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setGlowPos({ x: 50, y: 50 });
  }, []);

  const inputStyle = {
    padding: '10px 14px',
    borderRadius: 12,
    border: '1px solid rgba(255, 255, 255, 0.6)',
    background: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    color: '#1C1C1E',
    fontSize: 14,
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = '#059669';
    e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.12)';
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.6)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: '#F2F2F7', position: 'relative' }}
    >
      {/* Background orbs — matching AdminLayout */}
      <div className="fixed pointer-events-none z-0" style={{ width: 400, height: 400, background: '#10B981', filter: 'blur(120px)', opacity: 0.35, top: '-10%', left: '-10%' }} />
      <div className="fixed pointer-events-none z-0" style={{ width: 500, height: 500, background: '#6366F1', filter: 'blur(150px)', opacity: 0.25, top: '30%', right: '-5%' }} />
      <div className="fixed pointer-events-none z-0" style={{ width: 350, height: 350, background: '#EC4899', filter: 'blur(100px)', opacity: 0.2, bottom: '-5%', left: '15%' }} />

      {/* Glass card — matching Forgot Password modal style */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative z-10 w-[400px] max-w-[calc(100vw-32px)] overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          borderRadius: 24,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 8px 32px 0 rgba(31,38,135,0.08)',
          padding: 32,
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* Cursor-tracking radial glow */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: `radial-gradient(circle 250px at ${glowPos.x}% ${glowPos.y}%, rgba(16,185,129,0.15), transparent)`,
            transition: 'background 0.1s ease-out',
          }}
        />

        <div className="relative z-10">
          {/* Header — centered */}
          <div className="text-center mb-7">
            <div className="flex justify-center mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#059669' }}>
                <i className="ph ph-leaf" style={{ color: '#fff', fontSize: 18 }} />
              </div>
            </div>
            <div className="text-2xl font-bold" style={{ color: '#1C1C1E' }}>Smart Agriculture</div>
            <div className="text-sm mt-1" style={{ color: '#8E8E93' }}>Admin Panel · Sign in to continue</div>
          </div>

          {/* Form */}
          <div>
            {/* Email */}
            <div className="mb-4">
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                style={inputStyle}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            {/* Password */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium" style={{ color: '#6B7280' }}>Password</label>
                <button
                  type="button"
                  className="bg-none border-none p-0 text-xs font-medium cursor-pointer"
                  style={{ color: '#059669', transition: 'opacity 0.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  onClick={() => {}}
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                style={inputStyle}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            {/* Sign In */}
            <button
              className="w-full border-none rounded-xl py-2.5 text-sm font-medium cursor-pointer mt-5"
              style={{
                background: '#059669',
                color: '#fff',
                transition: 'all 0.2s ease-in-out',
                boxShadow: '0 4px 14px 0 rgba(5,150,105,0.25)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(5,150,105,0.35)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(5,150,105,0.25)'; }}
            >
              Sign in
            </button>

            {/* Register link */}
            <p className="text-xs text-center mt-4" style={{ color: '#8E8E93' }}>
              Don't have an account?{' '}
              <a
                href="/register"
                className="no-underline font-medium"
                style={{ color: '#059669', transition: 'opacity 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                Register
              </a>
            </p>
          </div>

          {/* Demo credentials — glass info box */}
          <div
            className="mt-5"
            style={{
              padding: '12px 14px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.35)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
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
    </div>
  );
}
