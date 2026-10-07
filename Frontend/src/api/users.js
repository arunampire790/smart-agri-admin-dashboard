// Customer/user resource API - maps to Django's /api/farmers/ endpoints.
// The backend returns the exact keys the UI uses (name, email, phone, status,
// farms, joined), so no field translation is needed here.
//
// Accounts are only ever created through this admin-side API: there is no
// public sign-up. `password` is write-only - send it on create, or on update
// to reset it, and it never comes back in a response.
import { api } from './client';

export const usersApi = {
  list: () => api.get('/farmers/'),
  create: (user) => api.post('/farmers/', user),
  update: (id, data) => api.patch(`/farmers/${id}/`, data),
  remove: (id) => api.delete(`/farmers/${id}/`),
};
