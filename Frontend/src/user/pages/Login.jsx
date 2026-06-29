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
      style={{ background: '#F2F2F7', position: 'relative' }}
    >
      {/* Background orbs — matching AdminLayout */}
      <div className="fixed pointer-events-none z-0" style={{ width: 400, height: 400, background: '#10B981', filter: 'blur(120px)', opacity: 0.35, top: '-10%', left: '-10%' }} />
      <div className="fixed pointer-events-none z-0" style={{ width: 500, height: 500, background: '#6366F1', filter: 'blur(150px)', opacity: 0.25, top: '30%', right: '-5%' }} />
      <div className="fixed pointer-events-none z-0" style={{ width: 350, height: 350, background: '#EC4899', filter: 'blur(100px)', opacity: 0.2, bottom: '-5%', left: '15%' }} />

      {/* Glass card with cursor-tracking glow */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative z-10 w-[400px] text-center overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: 20,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.06)',
          padding: '40px 40px 36px',
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
                border: '1px solid rgba(255, 255, 255, 0.6)',
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#1C1C1E',
                fontSize: 14,
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.12)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.6)'; e.target.style.boxShadow = 'none'; }}
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
                border: '1px solid rgba(255, 255, 255, 0.6)',
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#1C1C1E',
                fontSize: 14,
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.12)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.6)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <button
            className="w-full border-none rounded-xl py-2.5 text-sm font-medium cursor-pointer"
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

          <p className="text-xs mt-5" style={{ color: '#8E8E93' }}>
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

          {/* Demo credentials — glass info box */}
          <div
            className="mt-6 text-left"
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
