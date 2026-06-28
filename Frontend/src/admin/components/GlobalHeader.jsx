import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export default function GlobalHeader() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex justify-between items-center w-full h-[72px] px-6 border-b border-white/30 glass shrink-0">
      <div className="flex items-center">
        <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 w-[320px]" style={{ background: 'var(--bg-glass-light)', border: '1px solid var(--border-glass-light)' }}>
          <i className="ph ph-magnifying-glass text-text-placeholder text-sm" />
          <input placeholder="Search..." aria-label="Search" className="border-none bg-transparent text-sm text-primary w-full outline-none placeholder:text-text-placeholder" />
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center px-3 py-1.5 rounded-full text-xs text-text-secondary font-medium whitespace-nowrap" style={{ background: 'var(--bg-glass-light)', border: '1px solid var(--border-glass-light)' }}>EN / 日本語</div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-text-secondary font-medium whitespace-nowrap" style={{ background: 'var(--bg-glass-light)', border: '1px solid var(--border-glass-light)' }}>
          <span className="w-2 h-2 rounded-full bg-brand inline-block" />
          System Online
        </div>
        <button onClick={toggleTheme} aria-label="Toggle theme" className="bg-none border-none cursor-pointer text-lg text-text-placeholder hover:text-text-secondary shrink-0">
          <i className={`ph ${theme === 'dark' ? 'ph-sun' : 'ph-moon'}`} />
        </button>
        <button aria-label="Notifications" className="relative cursor-pointer bg-none border-none text-lg text-text-secondary shrink-0">
          <i className="ph ph-bell" />
          <span className="absolute -top-1 -right-1 bg-danger-text text-white text-[10px] leading-none px-1 py-0.5 rounded-full font-bold">3</span>
        </button>
        <button aria-label="Profile" className="bg-none border-none cursor-pointer text-lg text-text-placeholder hover:text-text-secondary shrink-0">
          <i className="ph ph-user" />
        </button>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} aria-label="Logout" className="bg-none border-none cursor-pointer text-lg text-text-placeholder hover:text-text-secondary shrink-0">
          <i className="ph ph-sign-out" />
        </button>
      </div>
    </header>
  );
}
