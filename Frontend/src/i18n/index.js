// Central translation registry + the useT() hook.
//
// Each namespace lives in its own file under ./locales as
//   export default { en: { key: 'English' }, ja: { key: '日本語' } }
// so pages can be translated independently without merge conflicts.
//
// useT('namespace') returns a t(key, fallback) function. Lookup order:
//   current language → English → provided fallback → the key itself.
// This means any string not yet translated gracefully shows English,
// so a partially-translated app never breaks.
import { useLang } from './LanguageContext';

import common from './locales/common';
import nav from './locales/nav';
import header from './locales/header';
import dashboard from './locales/dashboard';
import analytics from './locales/analytics';
import farms from './locales/farms';
import robotAssignment from './locales/robotAssignment';
import robots from './locales/robots';
import sensors from './locales/sensors';
import users from './locales/users';
import employees from './locales/employees';
import tasks from './locales/tasks';
import settings from './locales/settings';
import activityLog from './locales/activityLog';
import login from './locales/login';
import profile from './locales/profile';

const dicts = {
  common,
  nav,
  header,
  dashboard,
  analytics,
  farms,
  robotAssignment,
  robots,
  sensors,
  users,
  employees,
  tasks,
  settings,
  activityLog,
  login,
  profile,
};

export function useT(namespace) {
  const { lang } = useLang();
  const table = dicts[namespace] || {};
  return (key, fallback) => {
    const inLang = table[lang] && table[lang][key];
    if (inLang) return inLang;
    const inEn = table.en && table.en[key];
    if (inEn) return inEn;
    return fallback !== undefined ? fallback : key;
  };
}

export { useLang } from './LanguageContext';
