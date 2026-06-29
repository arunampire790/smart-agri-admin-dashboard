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

  const inputClasses = "text-sm px-3.5 py-2.5 rounded-xl bg-[#7676801F] outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder";
  const labelClasses = "text-xs font-medium text-primary";

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.35) 0%, transparent 70%)', filter: 'blur(80px)', opacity: 0.5 }} />
      <div className="absolute -bottom-48 -right-32 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(4,120,87,0.3) 0%, transparent 70%)', filter: 'blur(100px)', opacity: 0.45 }} />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(52,199,89,0.25) 0%, transparent 70%)', filter: 'blur(60px)', opacity: 0.35 }} />

      {/* Login Card */}
      <div className="glass-card rounded-2xl p-10 w-[400px]" style={{ borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.6)' }}>
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
          <div className="flex flex-col gap-1.5 mb-2.5">
            <label className={labelClasses}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} />
          </div>
          <div className="flex flex-col gap-1.5 mb-2">
            <label className={labelClasses}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClasses} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={closeFlow}>
          <div className="glass-card rounded-2xl p-8 w-[420px] max-w-[calc(100vw-32px)]" onClick={(e) => e.stopPropagation()}
            style={{ borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.6)', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>

            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-lg font-bold text-primary">
                  {flowStep === 'email' && 'Reset Password'}
                  {flowStep === 'code' && 'Check Your Email'}
                  {flowStep === 'reset' && 'Create New Password'}
                  {flowStep === 'success' && 'Password Reset'}
                </div>
                <div className="text-xs text-text-secondary mt-0.5">
                  {flowStep === 'email' && 'Enter your email to receive a reset code'}
                  {flowStep === 'code' && 'Enter the 6-digit code sent to your email'}
                  {flowStep === 'reset' && 'Your new password must be at least 8 characters'}
                  {flowStep === 'success' && 'Your password has been reset successfully'}
                </div>
              </div>
              <button type="button" onClick={closeFlow}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#98989D', padding: '4px', display: 'flex', transition: 'color 0.15s ease, transform 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.transform = ''; }}
              ><i className="ph ph-x text-lg" /></button>
            </div>

            {/* Step 2 — Enter Email */}
            {flowStep === 'email' && (
              <div>
                <div className="flex flex-col gap-1.5 mb-5">
                  <label className={labelClasses}>Email Address</label>
                  <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email" className={inputClasses} />
                </div>
                <button type="button" onClick={handleSendCode} disabled={!resetEmail.trim()}
                  className="w-full bg-brand text-white border-none rounded-xl py-2.5 text-sm font-medium cursor-pointer flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                >Send Code</button>
              </div>
            )}

            {/* Step 3 — Enter Code */}
            {flowStep === 'code' && (
              <div>
                <div className="mb-4 p-3 rounded-xl bg-[#D1FAE5] text-xs text-[#065F46] border border-[#A7F3D0]">
                  A verification code has been sent to <strong>{resetEmail || 'your email'}</strong>.
                </div>
                <div className="mb-5 p-3 rounded-xl bg-[#7676801F] text-xs text-text-secondary text-center">
                  Demo Code: <strong className="text-primary tracking-wider text-sm">{generatedCode}</strong>
                </div>
                <div className="flex flex-col gap-1.5 mb-5">
                  <label className={labelClasses}>Verification Code</label>
                  <div className="flex justify-center gap-2">
                    {codeDigits.map((digit, i) => (
                      <input key={i} type="text" inputMode="numeric" maxLength={1} value={digit}
                        ref={(el) => { codeInputRefs.current[i] = el; }}
                        onChange={(e) => handleDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(i, e)}
                        className="w-10 h-12 text-center text-sm font-semibold rounded-xl bg-[#7676801F] outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)]"
                        style={{ color: '#111827' }}
                      />
                    ))}
                  </div>
                  {codeError && <span className="text-xs text-[#DC2626] text-center mt-1">{codeError}</span>}
                </div>
                <button type="button" onClick={handleVerifyCode} disabled={codeDigits.some((d) => !d)}
                  className="w-full bg-brand text-white border-none rounded-xl py-2.5 text-sm font-medium cursor-pointer flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                >Verify Code</button>
              </div>
            )}

            {/* Step 5 — Reset Password */}
            {flowStep === 'reset' && (
              <div>
                <div className="flex flex-col gap-1.5 mb-3">
                  <label className={labelClasses}>New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password" className={inputClasses} />
                </div>
                <div className="flex flex-col gap-1.5 mb-5">
                  <label className={labelClasses}>Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password" className={inputClasses} />
                  {passwordError && <span className="text-xs text-[#DC2626] mt-1">{passwordError}</span>}
                </div>
                <button type="button" onClick={handleResetPassword} disabled={!newPassword || !confirmPassword}
                  className="w-full bg-brand text-white border-none rounded-xl py-2.5 text-sm font-medium cursor-pointer flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                >Reset Password</button>
              </div>
            )}

            {/* Step 6 — Success */}
            {flowStep === 'success' && (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                    <i className="ph ph-check text-2xl" style={{ color: '#10B981' }} />
                  </div>
                </div>
                <div className="text-sm text-text-secondary mb-6">
                  Your password has been reset successfully. You can now sign in with your new password.
                </div>
                <button type="button" onClick={closeFlow}
                  className="w-full bg-brand text-white border-none rounded-xl py-2.5 text-sm font-medium cursor-pointer flex items-center justify-center gap-2 hover:opacity-90"
                >Back to Sign In</button>
              </div>
            )}

            {/* Back link for non-success steps */}
            {flowStep !== 'success' && (
              <div className="text-center mt-4">
                <button type="button" onClick={closeFlow}
                  className="bg-none border-none p-0 text-xs text-text-secondary cursor-pointer hover:text-primary transition-colors"
                >Back to Sign In</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
