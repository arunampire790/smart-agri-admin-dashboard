// Employees = people who sign in to the admin dashboard. Maps to Django's
// /api/employees/ (master admins only). Adding one creates their login, so
// `password` is required on create and optional on update (to reset it).
import { api } from './client';

export const employeesApi = {
  list: () => api.get('/employees/'),
  create: (employee) => api.post('/employees/', employee),
  update: (id, data) => api.patch(`/employees/${id}/`, data),
  remove: (id) => api.delete(`/employees/${id}/`),
};
