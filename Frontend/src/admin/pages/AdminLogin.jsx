import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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
    background: 'rgba(255, 255, 255, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  };
  const labelClasses = "text-xs font-medium mb-1";
  const labelStyle = { color: '#374151' };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #d4edda 0%, #e8d5f5 50%, #cce5ff 100%)' }}
    >
      <style>{`.admin-login-modal input::placeholder { color: #9CA3AF; }`}</style>
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full" style={{ background: '#059669', filter: 'blur(150px)', opacity: 0.4 }} />
      <div className="absolute -bottom-48 -right-32 w-[550px] h-[550px] rounded-full" style={{ background: '#7C3AED', filter: 'blur(140px)', opacity: 0.3 }} />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full" style={{ background: '#0D9488', filter: 'blur(120px)', opacity: 0.35 }} />
      <div className="absolute bottom-1/3 left-1/4 w-[320px] h-[320px] rounded-full" style={{ background: '#10B981', filter: 'blur(100px)', opacity: 0.3 }} />

      {/* Login Card */}
      <div className="rounded-2xl p-10 w-[400px]" style={{
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        borderRadius: 24,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        position: 'relative',
      }}>
        <div className="text-center mb-6">
          <div className="flex justify-center mb-6">
            <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center text-white text-base">
              <i className="ph ph-plant" />
            </div>
          </div>
          <div className="text-2xl font-bold text-primary">Smart Agriculture</div>
          <div className="text-sm text-text-secondary mt-0.5">Admin Panel · Sign in to continue</div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="flex flex-col gap-1.5 mb-4">
            <label className={labelClasses} style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} style={loginInputStyle}
              onFocus={(e) => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.12)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.3)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <div className="flex flex-col gap-1.5 mb-4">
            <label className={labelClasses} style={labelStyle}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClasses} style={loginInputStyle}
              onFocus={(e) => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.12)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.3)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <div className="mb-4 text-right">
            <button type="button" onClick={openForgotPassword}
              className="bg-none border-none p-0 text-xs text-brand cursor-pointer hover:underline font-medium"
            >Forgot Password?</button>
          </div>
          <button type="submit" className="w-full bg-brand text-white border-none rounded-xl py-2.5 text-sm font-medium cursor-pointer flex items-center justify-center gap-2 hover:opacity-90">
            Sign in
          </button>
          <div className="mt-3 p-3 rounded-xl bg-[#7676801F] text-xs text-text-secondary">
            <strong>Demo:</strong> admin@smartagri.com / admin123
          </div>
        </form>
      </div>

      {/* Forgot Password Flow Overlay */}
      {flowStep !== 'login' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={closeFlow}>
          <div className="admin-login-modal relative z-10 w-[420px] max-w-[calc(100vw-32px)]" onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              borderRadius: 24,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 8px 32px 0 rgba(31,38,135,0.08)',
              maxHeight: 'calc(100vh - 40px)',
              overflowY: 'auto',
              padding: '32px 32px 28px',
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
                style={{ background: 'rgba(0,0,0,0.04)', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '6px', display: 'flex', borderRadius: 8, transition: 'all 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.08)'; e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.transform = 'scale(1)'; }}
              ><i className="ph ph-x text-lg" /></button>
            </div>

            {/* Step 2 — Enter Email */}
            {flowStep === 'email' && (
              <div>
                <div className="flex flex-col gap-1.5 mb-5">
                  <label className={labelClasses} style={labelStyle}>Email Address</label>
                  <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email" className={inputClasses}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.12)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <button type="button" onClick={handleSendCode} disabled={!resetEmail.trim()}
                  className="w-full border-none rounded-xl py-2.5 text-sm font-medium cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: '#059669', color: '#fff', transition: 'all 0.2s ease-in-out', boxShadow: '0 4px 14px 0 rgba(5,150,105,0.25)' }}
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(5,150,105,0.35)'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(5,150,105,0.25)'; }}
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
                <div className="flex flex-col gap-1.5 mb-5">
                  <label className={labelClasses} style={labelStyle}>Verification Code</label>
                  <div className="flex justify-center gap-2">
                    {codeDigits.map((digit, i) => (
                      <input key={i} type="text" inputMode="numeric" maxLength={1} value={digit}
                        ref={(el) => { codeInputRefs.current[i] = el; }}
                        onChange={(e) => handleDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(i, e)}
                        className="w-10 h-12 text-center text-sm font-semibold outline-none"
                        style={{
                          borderRadius: 10,
                          border: '1px solid rgba(0,0,0,0.12)',
                          background: '#ffffff',
                          color: '#1C1C1E',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.12)'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; e.target.style.boxShadow = 'none'; }}
                      />
                    ))}
                  </div>
                  {codeError && <span className="text-xs text-center mt-1" style={{ color: '#DC2626' }}>{codeError}</span>}
                </div>
                <button type="button" onClick={handleVerifyCode} disabled={codeDigits.some((d) => !d)}
                  className="w-full border-none rounded-xl py-2.5 text-sm font-medium cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: '#059669', color: '#fff', transition: 'all 0.2s ease-in-out', boxShadow: '0 4px 14px 0 rgba(5,150,105,0.25)' }}
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(5,150,105,0.35)'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(5,150,105,0.25)'; }}
                >Verify Code</button>
              </div>
            )}

            {/* Step 5 — Reset Password */}
            {flowStep === 'reset' && (
              <div>
                <div className="flex flex-col gap-1.5 mb-3">
                  <label className={labelClasses} style={labelStyle}>New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password" className={inputClasses}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.12)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div className="flex flex-col gap-1.5 mb-5">
                  <label className={labelClasses} style={labelStyle}>Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password" className={inputClasses}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.12)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; e.target.style.boxShadow = 'none'; }}
                  />
                  {passwordError && <span className="text-xs mt-1" style={{ color: '#DC2626' }}>{passwordError}</span>}
                </div>
                <button type="button" onClick={handleResetPassword} disabled={!newPassword || !confirmPassword}
                  className="w-full border-none rounded-xl py-2.5 text-sm font-medium cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: '#059669', color: '#fff', transition: 'all 0.2s ease-in-out', boxShadow: '0 4px 14px 0 rgba(5,150,105,0.25)' }}
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(5,150,105,0.35)'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(5,150,105,0.25)'; }}
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
                  className="w-full border-none rounded-xl py-2.5 text-sm font-medium cursor-pointer"
                  style={{ background: '#059669', color: '#fff', transition: 'all 0.2s ease-in-out', boxShadow: '0 4px 14px 0 rgba(5,150,105,0.25)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(5,150,105,0.35)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(5,150,105,0.25)'; }}
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
