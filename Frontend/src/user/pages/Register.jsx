export default function Register() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="bg-white rounded-2xl p-10 w-[400px] shadow-[0_4px_20px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] text-center">
        <div className="text-2xl font-bold text-[#000000] mb-2">Create Account</div>
        <div className="text-sm text-text-secondary mb-6">Join Smart Agriculture</div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-medium text-[#1C1C1E]">First Name</label>
            <input type="text" placeholder="John" className="text-sm px-3.5 py-2.5 rounded-xl bg-[#7676801F] outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder" />
          </div>
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-medium text-[#1C1C1E]">Last Name</label>
            <input type="text" placeholder="Doe" className="text-sm px-3.5 py-2.5 rounded-xl bg-[#7676801F] outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 mb-4 text-left">
          <label className="text-xs font-medium text-[#1C1C1E]">Email</label>
          <input type="email" placeholder="your@email.com" className="text-sm px-3.5 py-2.5 rounded-xl bg-[#7676801F] outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder" />
        </div>
        <div className="flex flex-col gap-1.5 mb-4 text-left">
          <label className="text-xs font-medium text-[#1C1C1E]">Password</label>
          <input type="password" placeholder="••••••••" className="text-sm px-3.5 py-2.5 rounded-xl bg-[#7676801F] outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder" />
        </div>
        <div className="flex flex-col gap-1.5 mb-6 text-left">
          <label className="text-xs font-medium text-[#1C1C1E]">Confirm Password</label>
          <input type="password" placeholder="••••••••" className="text-sm px-3.5 py-2.5 rounded-xl bg-[#7676801F] outline-none focus:shadow-[0_0_0_2px_rgba(52,199,89,0.3)] w-full placeholder:text-text-placeholder" />
        </div>
        <button className="w-full bg-brand text-white border-none rounded-xl py-2.5 text-sm font-medium cursor-pointer hover:opacity-90">Register</button>
        <p className="text-xs text-text-secondary mt-4">
          Already have an account? <a href="/" className="text-brand no-underline font-medium">Sign in</a>
        </p>
      </div>
    </div>
  );
}
