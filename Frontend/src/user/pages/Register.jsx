export default function Register() {
  return (
    <div className="font-sans min-h-screen bg-[#F8F9FA] flex items-center justify-center">
      <div className="bg-white rounded-xl p-10 w-[400px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-center">
        <div className="text-2xl font-semibold mb-2">Create Account</div>
        <div className="text-sm text-text-secondary mb-6">Join Smart Agriculture</div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-medium">First Name</label>
            <input type="text" placeholder="John" className="text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)] w-full" />
          </div>
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-medium">Last Name</label>
            <input type="text" placeholder="Doe" className="text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)] w-full" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 mb-4 text-left">
          <label className="text-xs font-medium">Email</label>
          <input type="email" placeholder="your@email.com" className="text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)] w-full" />
        </div>
        <div className="flex flex-col gap-1.5 mb-4 text-left">
          <label className="text-xs font-medium">Password</label>
          <input type="password" placeholder="••••••••" className="text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)] w-full" />
        </div>
        <div className="flex flex-col gap-1.5 mb-6 text-left">
          <label className="text-xs font-medium">Confirm Password</label>
          <input type="password" placeholder="••••••••" className="text-sm px-3.5 py-2.5 rounded-lg bg-[#F1F3F4] outline-none focus:shadow-[0_0_0_2px_rgba(43,122,62,0.2)] w-full" />
        </div>
        <button className="w-full bg-brand text-white border-none rounded-lg py-2.5 text-sm font-medium cursor-pointer hover:opacity-90">Register</button>
        <p className="text-xs text-text-secondary mt-4">
          Already have an account? <a href="/" className="text-brand no-underline font-medium">Sign in</a>
        </p>
      </div>
    </div>
  );
}
