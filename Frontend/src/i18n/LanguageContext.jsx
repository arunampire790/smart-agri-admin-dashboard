import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const LanguageContext = createContext(null);

// Supported languages. Add more here later if needed.
export const LANGS = ['en', 'ja'];

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('lang');
    return LANGS.includes(saved) ? saved : 'en';
  });

  // Persist choice so it survives reloads.
  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l) => {
    if (LANGS.includes(l)) setLangState(l);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((l) => (l === 'en' ? 'ja' : 'en'));
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
