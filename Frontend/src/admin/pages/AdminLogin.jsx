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
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
      <div className="bg-white border border-[#e0e0e0] rounded-xl p-8 w-[360px]">
        <div className="text-center mb-5">
          <div className="flex justify-center mb-3">
            <div className="w-11 h-11 bg-[#2e7d32] rounded-lg flex items-center justify-center text-white text-lg">
              <i className="ph ph-plant" />
            </div>
          </div>
          <div className="text-lg font-medium text-[#1C1C1E]">Smart Agriculture</div>
          <div className="text-sm text-[#757575] mt-0.5">Admin Panel · Sign in to continue</div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="flex flex-col gap-1 mb-2.5">
            <label className="text-xs text-[#757575]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-sm px-2.5 py-2 border border-[#e0e0e0] rounded-md bg-[#f5f5f5] outline-none focus:border-[#2e7d32] w-full"
            />
          </div>
          <div className="flex flex-col gap-1 mb-4">
            <label className="text-xs text-[#757575]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-sm px-2.5 py-2 border border-[#e0e0e0] rounded-md bg-[#f5f5f5] outline-none focus:border-[#2e7d32] w-full"
            />
          </div>
          <button type="submit" className="w-full bg-[#2e7d32] text-white border-none rounded-md py-2.5 text-sm font-medium cursor-pointer flex items-center justify-center gap-2 hover:bg-[#1b5e20]">
            Sign in
          </button>
          <div className="mt-3 p-2.5 rounded-md bg-[#f5f5f5] border border-[#e0e0e0] text-xs text-[#757575]">
            <strong className="text-[#1C1C1E]">Demo:</strong> admin@smartagri.com / admin123
          </div>
        </form>
      </div>
    </div>
  );
}
