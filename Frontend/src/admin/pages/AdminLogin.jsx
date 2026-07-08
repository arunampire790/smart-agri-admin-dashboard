import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

function useCardGlow() {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const onMouseEnter = useCallback(() => setIsHovered(true), []);
  const onMouseLeave = useCallback(() => { setIsHovered(false); setPos({ x: 50, y: 50 }); }, []);

  return { ref, onMouseMove, onMouseEnter, onMouseLeave, pos, isHovered };
}

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@smartagri.com');
  const [password, setPassword] = useState('admin123');
  const navigate = useNavigate();

  // Forgot Password flow state
  const [flowStep, setFlowStep] = useState('login'); // 'login' | 'email' | 'code' | 'reset' | 'success'
  const [resetEmail, setResetEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codeError, setCodeError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const codeInputRefs = useRef([]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@smartagri.com' && password === 'admin123') {
      navigate('/admin/dashboard');
    } else {
      alert('Invalid credentials. Use demo credentials shown below.');
    }
  };

  const openForgotPassword = () => {
    setFlowStep('email');
    setResetEmail('');
    setGeneratedCode('');
    setCodeDigits(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setCodeError('');
    setPasswordError('');
  };

  // TODO: Replace with real backend API call once backend is added
  const handleSendCode = () => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedCode(code);
    setFlowStep('code');
    setCodeDigits(['', '', '', '', '', '']);
    setCodeError('');
    setTimeout(() => { if (codeInputRefs.current[0]) codeInputRefs.current[0].focus(); }, 100);
  };

  const handleDigitChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newDigits = [...codeDigits];
    newDigits[index] = value;
    setCodeDigits(newDigits);
    setCodeError('');
    if (value && index < 5) codeInputRefs.current[index + 1]?.focus();
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  // TODO: Replace with real backend API call once backend is added
  const handleVerifyCode = () => {
    const entered = codeDigits.join('');
    if (entered === generatedCode) {
      setFlowStep('reset');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    } else {
      setCodeError('Invalid code. Please try again.');
    }
  };

  // TODO: Replace with real backend API call once backend is added
  const handleResetPassword = () => {
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setFlowStep('success');
  };

  const closeFlow = () => setFlowStep('login');

  const inputClasses = "text-sm outline-none w-full";
  const inputStyle = {
    padding: '11px 14px',
    borderRadius: 10,
    border: '1px solid rgba(0, 0, 0, 0.12)',
    background: '#ffffff',
    color: '#111827',
    fontSize: 14,
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const loginInputStyle = {
    ...inputStyle,
    background: 'rgba(255, 255, 255, 0.07)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    width: '100%',
  };
  const modalInputStyle = {
    padding: '10px 14px',
    borderRadius: 12,
    border: '1px solid rgba(76,175,80,0.25)',
    background: '#ffffff',
    color: '#1a2e1a',
    fontSize: 14,
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const modalLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#5a7a5a',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '6px',
  };
  const labelClasses = "text-xs font-medium mb-1";
  const labelStyle = { color: '#374151' };

  const { ref: cardRef, onMouseMove: cardMouseMove, onMouseEnter: cardEnter, onMouseLeave: cardLeave, pos: cardPos, isHovered: cardHovered } = useCardGlow();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#1a2e1a' }}
    >
      <style>{`.admin-login-modal input::placeholder { color: #9CA3AF; } @keyframes pulse-glow{0%,100%{box-shadow:0 0 8px rgba(76,175,80,0.3)}50%{box-shadow:0 0 16px rgba(76,175,80,0.5)}}`}</style>
      <div className="absolute pointer-events-none" style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(46,125,50,0.6) 0%, transparent 70%)', filter: 'blur(80px)', opacity: 0.6, top: '-100px', left: '-100px', zIndex: 0 }} />
      <div className="absolute pointer-events-none" style={{ width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(76,175,80,0.5) 0%, transparent 70%)', filter: 'blur(90px)', opacity: 0.5, top: '-80px', right: '-80px', zIndex: 0 }} />
      <div className="absolute pointer-events-none" style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(46,125,50,0.4) 0%, transparent 70%)', filter: 'blur(100px)', opacity: 0.4, bottom: '-100px', right: '-50px', zIndex: 0 }} />

      {/* Login Card */}
      <div ref={cardRef} onMouseMove={cardMouseMove} onMouseEnter={cardEnter} onMouseLeave={cardLeave} className="p-10" style={{
        width: '420px',
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 20,
        boxShadow: cardHovered ? '0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)' : '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        position: 'relative',
        zIndex: 10,
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease',
      }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit',
          background: `radial-gradient(circle 200px at ${cardPos.x}% ${cardPos.y}%, rgba(76,175,80,0.15), transparent)`,
          opacity: cardHovered ? 1 : 0,
          transition: 'opacity 0.2s ease',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div className="text-center mb-0" style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex justify-center mb-6">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-base" style={{ background: '#2e7d2e', transition: 'transform 0.2s ease', cursor: 'default' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <i className="ph ph-sprout" />
            </div>
          </div>
          <div style={{ color: '#ffffff', fontSize: '26px', fontWeight: 700 }}>Smart Agriculture</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', marginTop: '6px' }}>Admin Panel · Sign in to continue</div>
        </div>

        <div style={{ borderBottom: '1px solid rgba(76,175,80,0.3)', margin: '16px 0' }} />

        <form onSubmit={handleLogin} style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex flex-col mb-5">
            <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} style={loginInputStyle}
              placeholder="Enter your email"
              onFocus={(e) => { e.target.style.borderColor = 'rgba(76,175,80,0.8)'; e.target.style.boxShadow = '0 0 0 3px rgba(76,175,80,0.15)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.boxShadow = 'none'; }}
              onMouseEnter={(e) => { if (document.activeElement !== e.target) { e.target.style.borderColor = 'rgba(76,175,80,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(76,175,80,0.06)'; } }}
              onMouseLeave={(e) => { if (document.activeElement !== e.target) { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.boxShadow = 'none'; } }}
            />
          </div>
          <div className="flex flex-col mb-5">
            <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClasses} style={loginInputStyle}
              placeholder="Enter your password"
              onFocus={(e) => { e.target.style.borderColor = 'rgba(76,175,80,0.8)'; e.target.style.boxShadow = '0 0 0 3px rgba(76,175,80,0.15)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.boxShadow = 'none'; }}
              onMouseEnter={(e) => { if (document.activeElement !== e.target) { e.target.style.borderColor = 'rgba(76,175,80,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(76,175,80,0.06)'; } }}
              onMouseLeave={(e) => { if (document.activeElement !== e.target) { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.boxShadow = 'none'; } }}
            />
          </div>
          <div className="mb-4 text-right">
            <button type="button" onClick={openForgotPassword}
              className="bg-none border-none p-0 cursor-pointer font-medium"
              style={{ color: 'rgba(76,175,80,0.8)', fontSize: '13px', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#4caf50'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(76,175,80,0.8)'; }}
            >Forgot Password?</button>
          </div>
          <button type="submit"
            style={{
              background: '#2e7d2e',
              border: 'none', borderRadius: 10, padding: '13px', width: '100%',
              color: '#ffffff', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#3d9140'; e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(46,125,50,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#2e7d2e'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Sign in
          </button>
          <div className="mt-4" style={{ background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.2)', borderRadius: '8px', padding: '10px 14px' }}>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>
              <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Demo:</strong> admin@smartagri.com / admin123
            </div>
          </div>
        </form>
      </div>

      {/* Forgot Password Flow Overlay */}
      {flowStep !== 'login' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={closeFlow}>
          <div className="admin-login-modal relative z-10 w-[420px] max-w-[calc(100vw-32px)]" onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(255,255,255,0.65)',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(25px)',
              border: '1px solid rgba(255,255,255,0.6)',
              borderRadius: 24,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              maxHeight: 'calc(100vh - 40px)',
              overflowY: 'auto',
              padding: '28px',
            }}>

            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-lg font-bold" style={{ color: '#111827' }}>
                  {flowStep === 'email' && 'Reset Password'}
                  {flowStep === 'code' && 'Check Your Email'}
                  {flowStep === 'reset' && 'Create New Password'}
                  {flowStep === 'success' && 'Password Reset'}
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#4B5563' }}>
                  {flowStep === 'email' && 'Enter your email to receive a reset code'}
                  {flowStep === 'code' && 'Enter the 6-digit code sent to your email'}
                  {flowStep === 'reset' && 'Your new password must be at least 8 characters'}
                  {flowStep === 'success' && 'Your password has been reset successfully'}
                </div>
              </div>
              <button type="button" onClick={closeFlow}
                style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#9CA3AF', padding: '4px', display: 'flex', transition: 'color 0.15s ease, transform 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.transform = 'scale(1)'; }}
              ><i className="ph ph-x text-lg" /></button>
            </div>

            {/* Step 2 — Enter Email */}
            {flowStep === 'email' && (
              <div>
                <div className="flex flex-col mb-5">
                  <label style={modalLabelStyle}>Email Address</label>
                  <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email" className={inputClasses}
                    style={modalInputStyle}
                    onFocus={(e) => { e.target.style.borderColor = '#10B981'; e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.15)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <button type="button" onClick={handleSendCode} disabled={!resetEmail.trim()}
                  className="w-full border-none rounded-xl py-2.5 text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: '#10B981', color: '#fff', borderRadius: '12px', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = '#059669'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  onMouseDown={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; } }}
                  onMouseUp={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '1'; } }}
                >Send Code</button>
              </div>
            )}

            {/* Step 3 — Enter Code */}
            {flowStep === 'code' && (
              <div>
                <div className="mb-4 p-3 rounded-xl text-xs text-center" style={{ background: 'rgba(16,185,129,0.08)', color: '#065F46', border: '1px solid rgba(16,185,129,0.15)' }}>
                  A verification code has been sent to <strong>{resetEmail || 'your email'}</strong>.
                </div>
                <div className="mb-5 p-3 rounded-xl text-xs text-center" style={{ background: 'rgba(255,255,255,0.35)', color: '#8E8E93' }}>
                  Demo Code: <strong style={{ color: '#1C1C1E' }} className="tracking-wider text-sm">{generatedCode}</strong>
                </div>
                <div className="flex flex-col mb-5">
                  <label style={modalLabelStyle}>Verification Code</label>
                  <div className="flex justify-center gap-2">
                    {codeDigits.map((digit, i) => (
                      <input key={i} type="text" inputMode="numeric" maxLength={1} value={digit}
                        ref={(el) => { codeInputRefs.current[i] = el; }}
                        onChange={(e) => handleDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(i, e)}
                        className="w-10 h-12 text-center text-sm font-semibold outline-none"
                        style={{
                          borderRadius: 12,
                          border: '1px solid #D1D5DB',
                          background: 'rgba(255,255,255,0.5)',
                          color: '#1C1C1E',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#10B981'; e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.15)'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                      />
                    ))}
                  </div>
                  {codeError && <span className="text-xs text-center mt-1" style={{ color: '#DC2626' }}>{codeError}</span>}
                </div>
                <button type="button" onClick={handleVerifyCode} disabled={codeDigits.some((d) => !d)}
                  className="w-full border-none rounded-xl py-2.5 text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: '#10B981', color: '#fff', borderRadius: '12px', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = '#059669'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  onMouseDown={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; } }}
                  onMouseUp={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '1'; } }}
                >Verify Code</button>
              </div>
            )}

            {/* Step 5 — Reset Password */}
            {flowStep === 'reset' && (
              <div>
                <div className="flex flex-col mb-3">
                  <label style={modalLabelStyle}>New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password" className={inputClasses}
                    style={modalInputStyle}
                    onFocus={(e) => { e.target.style.borderColor = '#10B981'; e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.15)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div className="flex flex-col mb-5">
                  <label style={modalLabelStyle}>Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password" className={inputClasses}
                    style={modalInputStyle}
                    onFocus={(e) => { e.target.style.borderColor = '#10B981'; e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.15)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                  />
                  {passwordError && <span className="text-xs mt-1" style={{ color: '#DC2626' }}>{passwordError}</span>}
                </div>
                <button type="button" onClick={handleResetPassword} disabled={!newPassword || !confirmPassword}
                  className="w-full border-none rounded-xl py-2.5 text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: '#10B981', color: '#fff', borderRadius: '12px', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = '#059669'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  onMouseDown={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; } }}
                  onMouseUp={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '1'; } }}
                >Reset Password</button>
              </div>
            )}

            {/* Step 6 — Success */}
            {flowStep === 'success' && (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
                    <i className="ph ph-check text-2xl" style={{ color: '#10B981' }} />
                  </div>
                </div>
                <div className="text-sm mb-6" style={{ color: '#8E8E93' }}>
                  Your password has been reset successfully. You can now sign in with your new password.
                </div>
                <button type="button" onClick={closeFlow}
                  className="w-full border-none rounded-xl py-2.5 text-sm font-semibold cursor-pointer"
                  style={{ background: '#10B981', color: '#fff', borderRadius: '12px', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.96)'; e.currentTarget.style.opacity = '0.95'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '1'; }}
                >Back to Sign In</button>
              </div>
            )}

            {/* Back link for non-success steps */}
            {flowStep !== 'success' && (
              <div className="text-center mt-4">
                <button type="button" onClick={closeFlow}
                  className="bg-none border-none p-0 text-xs cursor-pointer font-medium"
                  style={{ color: '#374151', transition: 'color 0.15s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#059669'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#374151'; }}
                >Back to Sign In</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
