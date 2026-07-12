import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@smartagri.com');
  const [password, setPassword] = useState('admin123');
  const navigate = useNavigate();

  const [flowStep, setFlowStep] = useState('login');
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

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '11px 14px',
    borderRadius: 10,
    border: '1.5px solid #d1fae5',
    background: '#f9fafb',
    color: '#1a1a1a',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  };

  const inputFocus = (e) => {
    e.target.style.borderColor = '#2e7d2e';
    e.target.style.boxShadow = '0 0 0 3px rgba(46,125,50,0.12)';
    e.target.style.background = '#ffffff';
  };

  const inputBlur = (e) => {
    e.target.style.borderColor = '#d1fae5';
    e.target.style.boxShadow = 'none';
    e.target.style.background = '#f9fafb';
  };

  const inputHover = (e) => {
    if (document.activeElement !== e.target) {
      e.target.style.borderColor = '#6ee7b7';
    }
  };

  const inputLeave = (e) => {
    if (document.activeElement !== e.target) {
      e.target.style.borderColor = '#d1fae5';
    }
  };

  const primaryBtn = {
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: 10,
    background: 'linear-gradient(180deg, #2d5a3d 0%, #1a3a2a 100%)',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const primaryBtnEnter = (e) => {
    if (!e.currentTarget.disabled) {
      e.currentTarget.style.background = 'linear-gradient(180deg, #3d7a4d 0%, #2d5a3d 100%)';
      e.currentTarget.style.boxShadow = '0 6px 20px rgba(26,58,42,0.35)';
      e.currentTarget.style.transform = 'translateY(-1px)';
    }
  };

  const primaryBtnLeave = (e) => {
    e.currentTarget.style.background = 'linear-gradient(180deg, #2d5a3d 0%, #1a3a2a 100%)';
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.transform = 'translateY(0)';
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e8f0e8 0%, #d4e6d4 40%, #e0ede0 100%)' }}>
      <style>{`.login-input::placeholder { color: #9ca3af; font-size: 14px; }`}</style>
      <div style={{ width: '420px', maxWidth: 'calc(100vw - 32px)' }}>
        <div style={{ background: '#ffffff', borderRadius: 20, boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 12px 48px rgba(0,0,0,0.12), 0 4px 16px rgba(26,58,42,0.08)', border: '1px solid rgba(255,255,255,0.9)', padding: '44px 40px 36px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#1a3a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 16px rgba(46,125,50,0.25)' }}>
              <Sprout size={24} color="#ffffff" strokeWidth={2} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a' }}>Smart Agriculture</div>
            <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 28 }}>Admin Panel · Sign in to continue</div>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com" className="login-input" style={inputStyle}
                onFocus={inputFocus} onBlur={inputBlur}
                onMouseEnter={inputHover} onMouseLeave={inputLeave}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" className="login-input" style={inputStyle}
                onFocus={inputFocus} onBlur={inputBlur}
                onMouseEnter={inputHover} onMouseLeave={inputLeave}
              />
            </div>

            <div style={{ textAlign: 'right', marginTop: 6, marginBottom: 20 }}>
              <button type="button" onClick={openForgotPassword}
                className="bg-none border-none p-0 cursor-pointer"
                style={{ color: '#2e7d2e', fontSize: 13, fontWeight: 500, transition: 'color 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#1a5c2a'; e.currentTarget.style.textDecoration = 'underline'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#2e7d2e'; e.currentTarget.style.textDecoration = 'none'; }}
              >Forgot Password?</button>
            </div>

            <button type="submit" style={primaryBtn}
              onMouseEnter={primaryBtnEnter}
              onMouseLeave={primaryBtnLeave}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,58,42,0.2)'; }}
              onMouseUp={(e) => { primaryBtnEnter(e); }}
            >Sign in</button>
          </form>

          <div style={{ marginTop: 16, padding: '10px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0' }}>
            <span style={{ color: '#166534', fontWeight: 700, fontSize: 13 }}>Demo:</span>
            <span style={{ color: '#15803d', fontSize: 13, marginLeft: 4 }}>admin@smartagri.com / admin123</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Flow Overlay */}
      {flowStep !== 'login' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(26,46,26,0.4)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} onClick={closeFlow}>
          <div className="relative z-10" onClick={(e) => e.stopPropagation()}
            style={{ width: '420px', maxWidth: 'calc(100vw - 32px)', background: '#ffffff', borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.15)', padding: '28px 32px', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>
                  {flowStep === 'email' && 'Reset Password'}
                  {flowStep === 'code' && 'Check Your Email'}
                  {flowStep === 'reset' && 'Create New Password'}
                  {flowStep === 'success' && 'Password Reset'}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2, marginBottom: 20 }}>
                  {flowStep === 'email' && 'Enter your email to receive a reset code'}
                  {flowStep === 'code' && 'Enter the 6-digit code sent to your email'}
                  {flowStep === 'reset' && 'Your new password must be at least 8 characters'}
                  {flowStep === 'success' && 'Your password has been reset successfully'}
                </div>
              </div>
              <button type="button" onClick={closeFlow} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#6b7280', padding: '4px', display: 'flex', transition: 'color 0.15s ease, transform 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#1a1a1a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#6b7280'; }}
              ><i className="ph ph-x text-lg" /></button>
            </div>

            {flowStep === 'email' && (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Email Address</label>
                  <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email" style={inputStyle}
                    onFocus={inputFocus} onBlur={inputBlur}
                    onMouseEnter={inputHover} onMouseLeave={inputLeave}
                  />
                </div>
                <button type="button" onClick={handleSendCode} disabled={!resetEmail.trim()} style={{ ...primaryBtn }} className="disabled:opacity-40 disabled:cursor-not-allowed"
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) { primaryBtnEnter(e); } }}
                  onMouseLeave={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = 'linear-gradient(180deg, #2d5a3d 0%, #1a3a2a 100%)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                >Send Code</button>
              </div>
            )}

            {flowStep === 'code' && (
              <div>
                <div style={{ marginBottom: 4, padding: '10px 14px', borderRadius: 8, background: '#f8fdf8', border: '1px solid rgba(46,125,50,0.15)', fontSize: 13, color: '#374151' }}>
                  A verification code has been sent to <strong>{resetEmail || 'your email'}</strong>.
                </div>
                <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: '#f0f5f0', fontSize: 13, color: '#6b7280' }}>
                  Demo Code: <strong style={{ color: '#1a1a1a', letterSpacing: '0.1em' }}>{generatedCode}</strong>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Verification Code</label>
                  <div className="flex justify-center gap-2">
                    {codeDigits.map((digit, i) => (
                      <input key={i} type="text" inputMode="numeric" maxLength={1} value={digit}
                        ref={(el) => { codeInputRefs.current[i] = el; }}
                        onChange={(e) => handleDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(i, e)}
                        style={{
                          width: 40, height: 44, textAlign: 'center', fontSize: 14, fontWeight: 600,
                          borderRadius: 10, border: '1px solid #d1d5db', background: '#ffffff', color: '#1a1a1a',
                          outline: 'none', transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#2e7d2e'; e.target.style.boxShadow = '0 0 0 3px rgba(46,125,50,0.1)'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
                      />
                    ))}
                  </div>
                  {codeError && <div style={{ fontSize: 12, color: '#DC2626', textAlign: 'center', marginTop: 4 }}>{codeError}</div>}
                </div>
                <button type="button" onClick={handleVerifyCode} disabled={codeDigits.some((d) => !d)} style={{ ...primaryBtn }} className="disabled:opacity-40 disabled:cursor-not-allowed"
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) { primaryBtnEnter(e); } }}
                  onMouseLeave={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = 'linear-gradient(180deg, #2d5a3d 0%, #1a3a2a 100%)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                >Verify Code</button>
              </div>
            )}

            {flowStep === 'reset' && (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password" style={inputStyle}
                    onFocus={inputFocus} onBlur={inputBlur}
                    onMouseEnter={inputHover} onMouseLeave={inputLeave}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password" style={inputStyle}
                    onFocus={inputFocus} onBlur={inputBlur}
                    onMouseEnter={inputHover} onMouseLeave={inputLeave}
                  />
                  {passwordError && <div style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{passwordError}</div>}
                </div>
                <button type="button" onClick={handleResetPassword} disabled={!newPassword || !confirmPassword} style={{ ...primaryBtn }} className="disabled:opacity-40 disabled:cursor-not-allowed"
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) { primaryBtnEnter(e); } }}
                  onMouseLeave={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = 'linear-gradient(180deg, #2d5a3d 0%, #1a3a2a 100%)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                >Reset Password</button>
              </div>
            )}

            {flowStep === 'success' && (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div style={{ width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(46,125,50,0.1)' }}>
                    <i className="ph ph-check text-2xl" style={{ color: '#2e7d2e' }} />
                  </div>
                </div>
                <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
                  Your password has been reset successfully. You can now sign in with your new password.
                </div>
                <button type="button" onClick={closeFlow} style={primaryBtn}
                  onMouseEnter={primaryBtnEnter}
                  onMouseLeave={primaryBtnLeave}
                >Back to Sign In</button>
              </div>
            )}

            {flowStep !== 'success' && (
              <div className="text-center" style={{ marginTop: 16 }}>
                <button type="button" onClick={closeFlow} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#2e7d2e', transition: 'color 0.15s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#1a5c2a'; e.currentTarget.style.textDecoration = 'underline'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#2e7d2e'; e.currentTarget.style.textDecoration = 'none'; }}
                >Back to Sign In</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
