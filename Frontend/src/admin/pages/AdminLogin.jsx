import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@smartagri.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // ── Forgot Password flow state ──
  const [step, setStep] = useState('login'); // login | email | code | reset | success
  const [resetEmail, setResetEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState(''); // TODO: Replace with real backend API call to send email
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codeError, setCodeError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@smartagri.com' && password === 'admin123') {
      login({ name: 'Admin User', email: 'admin@smartagri.com', role: 'masterAdmin' });
      navigate('/admin/dashboard');
    } else {
      alert('Invalid credentials. Use demo credentials shown below.');
    }
  };

  // TODO: Replace with real backend API call to send email with code
  const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleSendCode = (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    const code = generateCode();
    setGeneratedCode(code);
    setCodeDigits(['', '', '', '', '', '']);
    setCodeError('');
    setStep('code');
  };

  const handleDigitChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const next = [...codeDigits];
    next[index] = value;
    setCodeDigits(next);
    setCodeError('');
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // TODO: Replace with real backend API call to verify code
  const handleVerifyCode = (e) => {
    e.preventDefault();
    const entered = codeDigits.join('');
    if (entered !== generatedCode) {
      setCodeError('Incorrect code, please try again');
      return;
    }
    setCodeError('');
    setStep('reset');
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordError('');
    setStep('success');
  };

  const backToLogin = () => {
    setStep('login');
    setResetEmail('');
    setGeneratedCode('');
    setCodeDigits(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setCodeError('');
    setPasswordError('');
  };

  const sharedInputStyle = {
    background: '#FFFFFF', border: '1px solid #E5E7EB', color: '#111827', fontWeight: 400,
  };

  const inputBase = "text-sm w-full rounded-xl outline-none transition-all duration-200 text-[#1C1C1E]";

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden">
      <div className="fixed pointer-events-none" style={{ width: 400, height: 400, background: '#10B981', filter: 'blur(120px)', opacity: 0.35, top: '-10%', left: '-10%' }} />
      <div className="fixed pointer-events-none" style={{ width: 500, height: 500, background: '#6366F1', filter: 'blur(150px)', opacity: 0.25, top: '30%', right: '-5%' }} />
      <div className="fixed pointer-events-none" style={{ width: 350, height: 350, background: '#EC4899', filter: 'blur(100px)', opacity: 0.2, bottom: '-5%', left: '15%' }} />
      <div className="rounded-2xl p-8 w-[400px]" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 20px 40px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.02)' }}>
        <div className="text-center mb-6">
          <div className="flex justify-center mb-6">
            <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center text-white text-base">
              <i className="ph ph-plant" />
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: '#111827' }}>Smart Agriculture</div>
          <div className="text-sm mt-0.5" style={{ color: '#4B5563' }}>
            {step === 'login' && 'Admin Panel · Sign in to continue'}
            {step === 'email' && 'Enter your email to reset your password'}
            {step === 'code' && 'Enter the verification code'}
            {step === 'reset' && 'Choose a new password'}
            {step === 'success' && 'Password has been reset'}
          </div>
        </div>

        {/* ── LOGIN SCREEN ── */}
        {step === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="flex flex-col mb-3">
              <label className="text-xs font-medium text-[#1C1C1E] mb-1.5">Email</label>
              <div className="relative">
                <i className="ph ph-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-placeholder pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-sm w-full rounded-xl outline-none transition-all duration-200 text-[#1C1C1E] bg-white/50 border border-white/60 pl-10 pr-3.5 py-2.5 placeholder:text-text-placeholder"
                  style={{ cursor: 'text' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#9CA3AF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.15)'; e.currentTarget.style.outline = 'none'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                />
              </div>
            </div>
            <div className="flex flex-col mb-1">
              <label className="text-xs font-medium text-[#1C1C1E] mb-1.5">Password</label>
              <div className="relative">
                <i className="ph ph-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-placeholder pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-sm w-full rounded-xl outline-none transition-all duration-200 text-[#1C1C1E] bg-white/50 border border-white/60 pl-10 pr-10 py-2.5 placeholder:text-text-placeholder"
                  style={{ cursor: 'text' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#9CA3AF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.15)'; e.currentTarget.style.outline = 'none'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                />
                <button type="button" onClick={() => setShowPassword((o) => !o)} className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-text-placeholder hover:text-text-secondary p-0 flex">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end mb-5 mt-2">
              <button type="button" onClick={() => { setResetEmail(''); setStep('email'); }} className="bg-none border-none text-xs font-medium cursor-pointer hover:underline" style={{ color: '#059669', padding: 0 }}>Forgot Password?</button>
            </div>
            <button type="submit" className="w-full bg-brand text-white border-none rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
              onMouseEnter={(e) => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(1px) scale(0.98)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = ''; }}
            >Sign in</button>
            <div className="mt-4 p-3 rounded-xl text-xs text-center" style={{ background: 'rgba(255,255,255,0.9)', color: '#374151', border: '1px dashed #D1D5DB' }}>
              <strong>Demo:</strong> admin@smartagri.com / admin123
            </div>
          </form>
        )}

        {/* ── STEP 2: ENTER EMAIL ── */}
        {step === 'email' && (
          <form onSubmit={handleSendCode}>
            <div className="flex flex-col mb-4">
              <label style={{ color: '#374151', fontWeight: 500, fontSize: '13px', marginBottom: '6px' }}>Email Address</label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your email"
                className="text-sm px-3.5 py-2.5 rounded-xl outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full"
                style={sharedInputStyle}
              />
            </div>
            <button type="submit" className="w-full bg-brand text-white border-none rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 login-signin-btn">Send Code</button>
            <div className="mt-4 text-center">
              <button type="button" onClick={backToLogin} className="bg-none border-none text-xs font-medium cursor-pointer hover:underline" style={{ color: '#059669', padding: 0 }}>Back to Sign in</button>
            </div>
          </form>
        )}

        {/* ── STEP 3: ENTER CODE ── */}
        {step === 'code' && (
          <form onSubmit={handleVerifyCode}>
            <div className="text-xs mb-4 text-center" style={{ color: '#4B5563' }}>
              A 6-digit code has been sent to <strong>{resetEmail}</strong>.
            </div>
            {/* TODO: Remove demo box when real email integration is in place */}
            <div className="mb-4 p-3 rounded-xl text-xs text-center" style={{ background: 'rgba(255,255,255,0.9)', color: '#374151', border: '1px dashed #D1D5DB' }}>
              <strong>Demo Code:</strong> {generatedCode}
            </div>
            <div className="flex justify-center gap-2 mb-4">
              {codeDigits.map((digit, i) => (
                <input
                  key={i}
                  id={`code-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(i, e)}
                  className="w-10 h-12 text-center text-sm rounded-xl outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)]"
                  style={{ ...sharedInputStyle, fontWeight: 600, fontSize: '16px' }}
                />
              ))}
            </div>
            {codeError && <div className="text-xs text-center mb-3" style={{ color: '#DC2626' }}>{codeError}</div>}
            <button type="submit" className="w-full bg-brand text-white border-none rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 login-signin-btn">Verify Code</button>
            <div className="mt-4 text-center">
              <button type="button" onClick={backToLogin} className="bg-none border-none text-xs font-medium cursor-pointer hover:underline" style={{ color: '#059669', padding: 0 }}>Back to Sign in</button>
            </div>
          </form>
        )}

        {/* ── STEP 4: RESET PASSWORD ── */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <div className="flex flex-col mb-3">
              <label style={{ color: '#374151', fontWeight: 500, fontSize: '13px', marginBottom: '6px' }}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="text-sm px-3.5 py-2.5 rounded-xl outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full"
                style={sharedInputStyle}
              />
            </div>
            <div className="flex flex-col mb-4">
              <label style={{ color: '#374151', fontWeight: 500, fontSize: '13px', marginBottom: '6px' }}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="text-sm px-3.5 py-2.5 rounded-xl outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full"
                style={sharedInputStyle}
              />
            </div>
            {passwordError && <div className="text-xs text-center mb-3" style={{ color: '#DC2626' }}>{passwordError}</div>}
            <button type="submit" className="w-full bg-brand text-white border-none rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 login-signin-btn">Reset Password</button>
            <div className="mt-4 text-center">
              <button type="button" onClick={backToLogin} className="bg-none border-none text-xs font-medium cursor-pointer hover:underline" style={{ color: '#059669', padding: 0 }}>Back to Sign in</button>
            </div>
          </form>
        )}

        {/* ── STEP 5: SUCCESS ── */}
        {step === 'success' && (
          <div>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                <i className="ph ph-check" style={{ color: '#10B981', fontSize: '28px' }} />
              </div>
            </div>
            <div className="text-center text-sm mb-6" style={{ color: '#374151' }}>Password reset successful!</div>
            <button onClick={backToLogin} className="w-full bg-brand text-white border-none rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 login-signin-btn">
              Back to Sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
