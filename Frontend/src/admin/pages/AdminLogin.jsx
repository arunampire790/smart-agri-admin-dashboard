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
    <div className="font-sans min-h-screen bg-[#F8F9FA] flex items-center justify-center">
      <div className="bg-white rounded-xl p-10 w-[400px] shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-6">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white text-base">
              <i className="ti ti-plant-2" />
            </div>
          </div>
          <div className="text-2xl font-semibold">Smart Agriculture</div>
          <div className="text-sm text-text-secondary mt-0.5">Admin Panel · Sign in to continue</div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="flex flex-col gap-1.5 mb-2.5">
            <label className="text-xs font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)] w-full"
            />
          </div>
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-xs font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)] w-full"
            />
          </div>
          <button type="submit" className="w-full bg-brand text-white border-none rounded-lg py-2.5 text-sm font-medium cursor-pointer flex items-center justify-center gap-2 hover:opacity-90">
            Sign in
          </button>
          <div className="mt-3 p-3 rounded-lg bg-[#F1F3F4] text-xs text-text-secondary">
            <strong>Demo:</strong> admin@smartagri.com / admin123
          </div>
        </form>
      </div>
    </div>
  );
}
