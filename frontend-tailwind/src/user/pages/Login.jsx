export default function Login() {
  return (
    <div className="font-sans min-h-screen bg-[#F8F9FA] flex items-center justify-center">
      <div className="bg-white rounded-xl p-10 w-[400px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-center">
        <div className="text-2xl font-semibold mb-2">User Login</div>
        <div className="text-sm text-text-secondary mb-6">Sign in to your account</div>
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-medium text-left">Email</label>
          <input type="email" placeholder="your@email.com" className="text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)] w-full" />
        </div>
        <div className="flex flex-col gap-1.5 mb-6">
          <label className="text-xs font-medium text-left">Password</label>
          <input type="password" placeholder="••••••••" className="text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)] w-full" />
        </div>
        <button className="w-full bg-brand text-white border-none rounded-lg py-2.5 text-sm font-medium cursor-pointer hover:opacity-90">Sign in</button>
        <p className="text-xs text-text-secondary mt-4">
          Don't have an account? <a href="/register" className="text-brand no-underline font-medium">Register</a>
        </p>
      </div>
    </div>
  );
}
