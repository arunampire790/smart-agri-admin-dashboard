/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { flushSync } from 'react-dom';

const LanguageContext = createContext(null);

// Supported languages. Add more here later if needed.
export const LANGS = ['en', 'ja'];

// Length of the fallback fade-out, in ms. Keep in step with the
// html.lang-switching rule in index.css.
const FADE_MS = 150;

// Swap the language with a soft crossfade instead of a sudden jump.
// Browsers with the View Transitions API crossfade old text into new (and
// slide the EN/日本語 switch); others fade the page out and back in.
// Anyone who asked their OS for reduced motion gets the instant switch.
function applyWithTransition(update) {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    update();
    return;
  }
  if (document.startViewTransition) {
    // flushSync so the new language is on screen when the browser takes
    // its "after" snapshot.
    document.startViewTransition(() => flushSync(update));
    return;
  }
  const root = document.documentElement;
  root.classList.add('lang-switching');
  setTimeout(() => {
    flushSync(update);
    requestAnimationFrame(() => root.classList.remove('lang-switching'));
  }, FADE_MS);
}

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
    if (LANGS.includes(l) && l !== lang) applyWithTransition(() => setLangState(l));
  }, [lang]);

  const toggleLang = useCallback(() => {
    const next = lang === 'en' ? 'ja' : 'en';
    applyWithTransition(() => setLangState(next));
  }, [lang]);

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
