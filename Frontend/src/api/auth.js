// Auth API - maps to Django SimpleJWT's /api/auth/ endpoints.
//
// SimpleJWT authenticates against Django's User model using username + password.
// The login form collects an email, which we send as the `username` field
// (the admin account is created with its email as the username - see the
// backend `create_admin` management command).
import { api, setTokens, clearTokens, getRefreshToken } from './client';

export const authApi = {
  // Returns { access, refresh } on success; throws on invalid credentials.
  login: async (email, password) => {
    const tokens = await api.post('/auth/login/', { username: email, password });
    setTokens(tokens.access, tokens.refresh);
    return tokens;
  },

  // Exchange the stored refresh token for a fresh access token.
  refresh: async () => {
    const refresh = getRefreshToken();
    if (!refresh) throw new Error('No refresh token');
    const data = await api.post('/auth/refresh/', { refresh });
    setTokens(data.access, refresh);
    return data.access;
  },

  logout: () => clearTokens(),
};
