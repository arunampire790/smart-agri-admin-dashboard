// Tiny fetch wrapper around the Django REST API.
// Keeps every request in one place: base URL, JSON headers, error handling,
// and the JWT auth token.

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '');
const BASE_URL = API_BASE_URL;

const ACCESS_KEY = 'authAccess';
const REFRESH_KEY = 'authRefresh';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access, refresh) {
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// AuthContext registers a callback here so a session that can't be recovered
// drops the user back to the login screen instead of leaving the dashboard
// stuck on errors.
let onSessionExpired = null;

export function setSessionExpiredHandler(fn) {
  onSessionExpired = fn;
}

// One refresh at a time: a page load fires several requests at once, and they
// would otherwise each burn the refresh token separately.
let refreshInFlight = null;

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  const res = await fetch(`${BASE_URL}/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  setTokens(data.access, refresh);
  return data.access;
}

// `asToken` runs a request under a caller-supplied JWT instead of the stored
// one. The QR pairing page uses it so a robot owner signing in on a shared
// browser never overwrites (or inherits) the admin's dashboard session.
async function request(
  path,
  { method = 'GET', body, auth = true, asToken = null, retrying = false } = {}
) {
  const headers = { 'Content-Type': 'application/json' };
  const stored = asToken ? null : getAccessToken();
  const token = asToken || stored;
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  // Everything below only ever touches the stored session - a borrowed token
  // is the caller's to manage.
  if (auth && stored) {
    // Access tokens last 8 hours. Swap in a fresh one and retry once rather
    // than throwing the admin out mid-task.
    if (res.status === 401 && !retrying) {
      if (!refreshInFlight) {
        refreshInFlight = refreshAccessToken().finally(() => { refreshInFlight = null; });
      }
      const renewed = await refreshInFlight;
      if (renewed) return request(path, { method, body, auth, retrying: true });
      clearTokens();
      if (onSessionExpired) onSessionExpired();
    }
    // Signed in, but as someone without the rights for this endpoint. The
    // stored session belongs to a different account than the UI thinks, so
    // drop it instead of filling the dashboard with errors.
    if (res.status === 403) {
      clearTokens();
      if (onSessionExpired) onSessionExpired();
    }
  }

  if (!res.ok) {
    let detail;
    let data = null;
    try {
      data = await res.json();
      detail = JSON.stringify(data);
    } catch {
      detail = res.statusText;
    }
    const err = new Error(`API ${method} ${path} failed (${res.status}): ${detail}`);
    err.status = res.status;
    // Parsed body, e.g. DRF's { field: ["message"] }, so callers can show
    // the field-level message instead of the raw string above.
    err.data = data;
    throw err;
  }

  // 204 No Content (e.g. DELETE) has no body to parse.
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (path, opts) => request(path, opts),
  post: (path, body, opts) => request(path, { method: 'POST', body, ...opts }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
