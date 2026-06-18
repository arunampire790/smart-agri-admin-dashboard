export default function Onboarding() {
  return (
    <div className="font-sans min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
      <div className="bg-white rounded-xl p-10 max-w-lg w-full shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-center">
        <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-6">
          <i className="ti ti-plant-2 text-3xl text-white" />
        </div>
        <div className="text-2xl font-semibold mb-2">Welcome to Smart Agriculture</div>
        <div className="text-sm text-text-secondary mb-8">Let's get you started with your farm management journey</div>

        <div className="flex flex-col gap-4 mb-8 text-left">
          {[
            { icon: 'ti-building-cottage', title: 'Create Your Farm', desc: 'Register your farm details and location' },
            { icon: 'ti-robot', title: 'Connect Robots', desc: 'Link your agricultural robots for automation' },
            { icon: 'ti-checklist', title: 'Assign Tasks', desc: 'Schedule and manage farming operations' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-[#EAEAEA]">
              <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center text-brand shrink-0">
                <i className={`ti ${step.icon} text-lg`} />
              </div>
              <div>
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-[10px] text-text-secondary mt-0.5">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full bg-brand text-white border-none rounded-lg py-2.5 text-sm font-medium cursor-pointer hover:opacity-90">Get Started</button>
      </div>
    </div>
  );
}
