export default function Onboarding() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-10 max-w-lg w-full shadow-[0_4px_20px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] text-center">
        <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-6">
          <i className="ph ph-plant text-3xl text-white" />
        </div>
        <div className="text-2xl font-bold text-[#000000] mb-2">Welcome to Smart Agriculture</div>
        <div className="text-sm text-text-secondary mb-8">Let's get you started with your farm management journey</div>

        <div className="flex flex-col gap-4 mb-8 text-left">
          {[
            { icon: 'ph-warehouse', title: 'Create Your Farm', desc: 'Register your farm details and location' },
            { icon: 'ph-robot', title: 'Connect Robots', desc: 'Link your agricultural robots for automation' },
            { icon: 'ph-clipboard-text', title: 'Assign Tasks', desc: 'Schedule and manage farming operations' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-[rgba(0,0,0,0.05)]">
              <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand-dark shrink-0">
                <i className={`ti ${step.icon} text-lg`} />
              </div>
              <div>
                <div className="text-sm font-medium text-[#1C1C1E]">{step.title}</div>
                <div className="text-[10px] text-text-secondary mt-0.5">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full bg-brand text-white border-none rounded-xl py-2.5 text-sm font-medium cursor-pointer hover:opacity-90">Get Started</button>
      </div>
    </div>
  );
}
