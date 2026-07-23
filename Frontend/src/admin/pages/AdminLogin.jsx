import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { useT } from '../../i18n';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const t = useT('login');
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [submitting, setSubmitting] = useState(false);
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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setLoginError('');
    setSubmitting(true);
    try {
      // Verifies email + password against the backend (JWT). Only navigates on success.
      await login(email.trim(), password);
      navigate('/admin/dashboard');
    } catch (err) {
      // 401 = wrong credentials; anything else is likely the backend being unreachable.
      setLoginError(err.status === 401 ? t('invalidCredentials') : t('loginFailed'));
    } finally {
      setSubmitting(false);
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
      setCodeError(t('invalidCode'));
    }
  };

  const handleResetPassword = () => {
    if (newPassword.length < 8) {
      setPasswordError(t('passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwordsDoNotMatch'));
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
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a' }}>{t('appTitle')}</div>
            <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 28 }}>{t('subtitle')}</div>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{t('email')}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')} className="login-input" style={inputStyle}
                onFocus={inputFocus} onBlur={inputBlur}
                onMouseEnter={inputHover} onMouseLeave={inputLeave}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{t('password')}</label>
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
              >{t('forgotPassword')}</button>
            </div>

            {loginError && (
              <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, fontWeight: 500 }}>
                {loginError}
              </div>
            )}

            <button type="submit" disabled={submitting} style={{ ...primaryBtn, opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
              onMouseEnter={(e) => { if (!submitting) primaryBtnEnter(e); }}
              onMouseLeave={primaryBtnLeave}
              onMouseDown={(e) => { if (!submitting) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,58,42,0.2)'; } }}
              onMouseUp={(e) => { if (!submitting) primaryBtnEnter(e); }}
            >{submitting ? t('signingIn') : t('signIn')}</button>
          </form>
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
                  {flowStep === 'email' && t('resetPasswordTitle')}
                  {flowStep === 'code' && t('checkEmailTitle')}
                  {flowStep === 'reset' && t('createNewPasswordTitle')}
                  {flowStep === 'success' && t('passwordResetTitle')}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2, marginBottom: 20 }}>
                  {flowStep === 'email' && t('resetPasswordSubtitle')}
                  {flowStep === 'code' && t('checkEmailSubtitle')}
                  {flowStep === 'reset' && t('createNewPasswordSubtitle')}
                  {flowStep === 'success' && t('passwordResetSubtitle')}
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
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{t('emailAddress')}</label>
                  <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                    placeholder={t('enterEmailPlaceholder')} style={inputStyle}
                    onFocus={inputFocus} onBlur={inputBlur}
                    onMouseEnter={inputHover} onMouseLeave={inputLeave}
                  />
                </div>
                <button type="button" onClick={handleSendCode} disabled={!resetEmail.trim()} style={{ ...primaryBtn }} className="disabled:opacity-40 disabled:cursor-not-allowed"
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) { primaryBtnEnter(e); } }}
                  onMouseLeave={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = 'linear-gradient(180deg, #2d5a3d 0%, #1a3a2a 100%)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                >{t('sendCode')}</button>
              </div>
            )}

            {flowStep === 'code' && (
              <div>
                <div style={{ marginBottom: 4, padding: '10px 14px', borderRadius: 8, background: '#f8fdf8', border: '1px solid rgba(46,125,50,0.15)', fontSize: 13, color: '#374151' }}>
                  {t('codeSentPrefix')}<strong>{resetEmail || t('yourEmail')}</strong>{t('codeSentSuffix')}
                </div>
                <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: '#f0f5f0', fontSize: 13, color: '#6b7280' }}>
                  {t('demoCode')} <strong style={{ color: '#1a1a1a', letterSpacing: '0.1em' }}>{generatedCode}</strong>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{t('verificationCode')}</label>
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
                >{t('verifyCode')}</button>
              </div>
            )}

            {flowStep === 'reset' && (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{t('newPassword')}</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('enterNewPasswordPlaceholder')} style={inputStyle}
                    onFocus={inputFocus} onBlur={inputBlur}
                    onMouseEnter={inputHover} onMouseLeave={inputLeave}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{t('confirmNewPassword')}</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('confirmNewPasswordPlaceholder')} style={inputStyle}
                    onFocus={inputFocus} onBlur={inputBlur}
                    onMouseEnter={inputHover} onMouseLeave={inputLeave}
                  />
                  {passwordError && <div style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{passwordError}</div>}
                </div>
                <button type="button" onClick={handleResetPassword} disabled={!newPassword || !confirmPassword} style={{ ...primaryBtn }} className="disabled:opacity-40 disabled:cursor-not-allowed"
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled) { primaryBtnEnter(e); } }}
                  onMouseLeave={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = 'linear-gradient(180deg, #2d5a3d 0%, #1a3a2a 100%)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                >{t('resetPasswordButton')}</button>
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
                  {t('passwordResetSuccessMessage')}
                </div>
                <button type="button" onClick={closeFlow} style={primaryBtn}
                  onMouseEnter={primaryBtnEnter}
                  onMouseLeave={primaryBtnLeave}
                >{t('backToSignIn')}</button>
              </div>
            )}

            {flowStep !== 'success' && (
              <div className="text-center" style={{ marginTop: 16 }}>
                <button type="button" onClick={closeFlow} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#2e7d2e', transition: 'color 0.15s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#1a5c2a'; e.currentTarget.style.textDecoration = 'underline'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#2e7d2e'; e.currentTarget.style.textDecoration = 'none'; }}
                >{t('backToSignIn')}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
