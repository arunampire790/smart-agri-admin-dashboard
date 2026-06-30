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

  return (
    <div
      className="min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #e8f5e9 0%, #f3e5f5 50%, #e3f2fd 100%)', position: 'relative' }}
    >
      {/* Background orbs — high opacity for visible glass effect */}
      <div className="fixed pointer-events-none" style={{ width: 500, height: 500, background: '#10B981', filter: 'blur(140px)', opacity: 0.45, top: '-15%', left: '-10%', zIndex: 0 }} />
      <div className="fixed pointer-events-none" style={{ width: 600, height: 600, background: '#6366F1', filter: 'blur(160px)', opacity: 0.3, top: '25%', right: '-8%', zIndex: 0 }} />
      <div className="fixed pointer-events-none" style={{ width: 450, height: 450, background: '#EC4899', filter: 'blur(120px)', opacity: 0.25, bottom: '-10%', left: '10%', zIndex: 0 }} />
      <div className="fixed pointer-events-none" style={{ width: 350, height: 350, background: '#059669', filter: 'blur(100px)', opacity: 0.35, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0 }} />

      {/* Glass card — matching Forgot Password modal exactly */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-[400px] max-w-[calc(100vw-32px)]"
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          borderRadius: 24,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 8px 32px 0 rgba(31,38,135,0.08)',
          padding: 32,
          zIndex: 10,
          overflow: 'hidden',
        }}
      >
        {/* Cursor-tracking radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle 250px at ${glowPos.x}% ${glowPos.y}%, rgba(16,185,129,0.18), transparent)`,
            zIndex: 0,
          }}
        />

        <div className="relative" style={{ zIndex: 1 }}>
          {/* Header — centered */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, background: '#059669', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ph ph-sprout" style={{ color: '#fff', fontSize: 20 }} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1C1C1E', lineHeight: 1.2 }}>Smart Agriculture</div>
            <div style={{ fontSize: 14, color: '#8E8E93', marginTop: 4 }}>Admin Panel · Sign in to continue</div>
          </div>

          {/* Email field */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '11px 14px',
                borderRadius: 10,
                border: '1px solid rgba(0, 0, 0, 0.12)',
                background: '#ffffff !important',
                color: '#1C1C1E',
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.12)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Password field */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#6B7280' }}>Password</label>
              <button
                type="button"
                style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, fontWeight: 500, color: '#059669', cursor: 'pointer', transition: 'opacity 0.15s' }}
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
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '11px 14px',
                borderRadius: 10,
                border: '1px solid rgba(0, 0, 0, 0.12)',
                background: '#ffffff !important',
                color: '#1C1C1E',
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.12)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Sign in button */}
          <button
            type="button"
            style={{
              width: '100%',
              padding: '11px 0',
              border: 'none',
              borderRadius: 10,
              background: '#059669',
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              boxShadow: '0 4px 14px 0 rgba(5,150,105,0.25)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(5,150,105,0.35)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(5,150,105,0.25)'; }}
          >
            Sign in
          </button>

          {/* Register link */}
          <p style={{ fontSize: 12, textAlign: 'center', marginTop: 16, color: '#8E8E93' }}>
            Don't have an account?{' '}
            <a
              href="/register"
              style={{ color: '#059669', fontWeight: 500, textDecoration: 'none', transition: 'opacity 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              Register
            </a>
          </p>
        </div>

        {/* Demo credentials — glass info box */}
        <div
          className="relative"
          style={{
            marginTop: 20,
            padding: '12px 14px',
            borderRadius: 10,
            background: 'rgba(255, 255, 255, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#059669' }}>Demo Credentials</div>
          <div style={{ fontSize: 12, lineHeight: 1.6, color: '#6B7280' }}>
            <span style={{ color: '#8E8E93' }}>Email:</span> admin@smartagri.com<br />
            <span style={{ color: '#8E8E93' }}>Password:</span> admin123
          </div>
        </div>
      </div>
    </div>
  );
}
