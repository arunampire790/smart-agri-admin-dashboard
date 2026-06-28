// TODO: Replace localStorage logging with backend API persistence once backend is available.
const STORAGE_KEY = 'smartAgri_activityLog';

export function logActivity({ userId, userName, action, target, details }) {
  const entry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: userId || 'unknown',
    userName: userName || 'Unknown',
    action,
    target: target || '',
    details: details || '',
    timestamp: new Date().toISOString(),
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const log = raw ? JSON.parse(raw) : [];
    log.unshift(entry);
    // Keep last 2000 entries to avoid unbounded growth
    if (log.length > 2000) log.length = 2000;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch (e) {
    // localStorage full or unavailable — silently fail
  }

  return entry;
}

export function getActivityLog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getActivityLogByUser(userName) {
  const log = getActivityLog();
  return log.filter((entry) => entry.userName === userName);
}
