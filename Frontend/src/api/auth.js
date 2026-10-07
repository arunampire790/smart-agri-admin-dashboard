// Auth API - maps to Django SimpleJWT's /api/auth/ endpoints.
//
// SimpleJWT authenticates against Django's User model using username + password.
// The login form collects an email, which we send as the `username` field
// (the admin account is created with its email as the username - see the
// backend `create_admin` management command).
//
// Both login calls pass `auth: false`: they carry no Authorization header, and
// it keeps a failed sign-in from being mistaken for an expired session by the
// client's token-recovery logic.
import { api, setTokens, clearTokens } from './client';

export const authApi = {
  // Returns { access, refresh } on success; throws on invalid credentials.
  login: async (email, password) => {
    const tokens = await api.post(
      '/auth/login/',
      { username: email, password },
      { auth: false }
    );
    setTokens(tokens.access, tokens.refresh);
    return tokens;
  },

  // Robot owners sign in here. Same JWT, different door: the admin endpoint
  // turns non-staff accounts away, this one turns nobody away.
  //
  // Deliberately does NOT store the tokens. The only customer-facing screen is
  // the QR pairing page, a one-visit flow that keeps its token in memory -
  // storing it would clobber the admin session on a shared browser.
  customerLogin: (email, password) =>
    api.post('/auth/customer/login/', { username: email, password }, { auth: false }),

  // Renewing an expired access token is handled inside the client, which
  // retries the original request transparently.

  logout: () => clearTokens(),

  // The signed-in admin's own profile:
  // { name, first_name, last_name, email, phone, role }.
  getAccount: () => api.get('/auth/account/'),
  // Saves any subset of first_name / last_name / email / phone. Email is the
  // login, so changing it changes how the admin signs in next time.
  updateAccount: (fields) => api.patch('/auth/account/', fields),
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/account/password/', {
      current_password: currentPassword,
      new_password: newPassword,
    }),

  // "Forgot password?" - logged out, so none of these carry a token.
  requestPasswordReset: (email) =>
    api.post('/auth/password-reset/request/', { email }, { auth: false }),
  verifyResetCode: (email, code) =>
    api.post('/auth/password-reset/verify/', { email, code }, { auth: false }),
  confirmPasswordReset: (email, code, newPassword) =>
    api.post(
      '/auth/password-reset/confirm/',
      { email, code, new_password: newPassword },
      { auth: false }
    ),
};

// First message from a DRF error body ({ field: ["msg"] } or { detail }),
// for showing under a form instead of the raw "API POST ... failed" string.
export function apiErrorMessage(err, fallback) {
  const data = err?.data;
  if (data && typeof data === 'object') {
    if (typeof data.detail === 'string') return data.detail;
    for (const value of Object.values(data)) {
      if (Array.isArray(value) && value.length) return String(value[0]);
      if (typeof value === 'string') return value;
    }
  }
  return fallback;
}
