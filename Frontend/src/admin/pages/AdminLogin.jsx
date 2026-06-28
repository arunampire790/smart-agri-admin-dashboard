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
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.35) 0%, transparent 70%)', filter: 'blur(80px)', opacity: 0.5 }} />
      <div className="absolute -bottom-48 -right-32 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(4,120,87,0.3) 0%, transparent 70%)', filter: 'blur(100px)', opacity: 0.45 }} />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(52,199,89,0.25) 0%, transparent 70%)', filter: 'blur(60px)', opacity: 0.35 }} />
      <div className="glass-card rounded-2xl p-10 w-[400px]">
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
            <label className="text-xs font-medium text-primary">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-sm px-3.5 py-2.5 rounded-xl bg-[#7676801F] outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder"
            />
          </div>
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-xs font-medium text-primary">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-sm px-3.5 py-2.5 rounded-xl bg-[#7676801F] outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder"
            />
          </div>
          <button type="submit" className="w-full bg-brand text-white border-none rounded-xl py-2.5 text-sm font-medium cursor-pointer flex items-center justify-center gap-2 hover:opacity-90">
            Sign in
          </button>
          <div className="mt-3 p-3 rounded-xl bg-[#7676801F] text-xs text-text-secondary">
            <strong>Demo:</strong> admin@smartagri.com / admin123
          </div>
        </form>
      </div>
    </div>
  );
}
