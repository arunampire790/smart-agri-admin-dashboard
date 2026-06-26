import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@smartagri.com');
  const [password, setPassword] = useState('admin123');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@smartagri.com' && password === 'admin123') {
      navigate('/admin/dashboard');
    } else {
      alert('Invalid credentials. Use demo credentials shown below.');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden">
      <div className="fixed pointer-events-none" style={{ width: 400, height: 400, background: '#10B981', filter: 'blur(120px)', opacity: 0.35, top: '-10%', left: '-10%' }} />
      <div className="fixed pointer-events-none" style={{ width: 500, height: 500, background: '#6366F1', filter: 'blur(150px)', opacity: 0.25, top: '30%', right: '-5%' }} />
      <div className="fixed pointer-events-none" style={{ width: 350, height: 350, background: '#EC4899', filter: 'blur(100px)', opacity: 0.2, bottom: '-5%', left: '15%' }} />
      <div className="rounded-2xl p-8 w-[400px]" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 20px 40px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.02)' }}>
        <div className="text-center mb-6">
          <div className="flex justify-center mb-6">
            <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center text-white text-base">
              <i className="ph ph-plant" />
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: '#111827' }}>Smart Agriculture</div>
          <div className="text-sm mt-0.5" style={{ color: '#4B5563' }}>Admin Panel · Sign in to continue</div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="flex flex-col mb-2.5">
            <label style={{ color: '#374151', fontWeight: 500, fontSize: '13px', marginBottom: '6px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-sm px-3.5 py-2.5 rounded-xl outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full"
              style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', color: '#111827', fontWeight: 400 }}
            />
          </div>
          <div className="flex flex-col mb-4">
            <label style={{ color: '#374151', fontWeight: 500, fontSize: '13px', marginBottom: '6px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-sm px-3.5 py-2.5 rounded-xl outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full"
              style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', color: '#111827', fontWeight: 400 }}
            />
          </div>
          <button type="submit" className="w-full bg-brand text-white border-none rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2" style={{ cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.opacity = '0.95'} onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
            Sign in
          </button>
          <div className="mt-3 p-3 rounded-xl text-xs" style={{ background: 'rgba(255,255,255,0.9)', color: '#374151', border: '1px dashed #D1D5DB' }}>
            <strong>Demo:</strong> admin@smartagri.com / admin123
          </div>
        </form>
      </div>
    </div>
  );
}
