// Farm resource API — maps to Django's /api/farms/ endpoints.
// The backend already returns the exact camelCase shape the UI uses
// (name, owner, crop, cropTypes, soil, size, devices, coordinates,
//  status, assignedRobots, robot), so no field translation is needed here.
import { api } from './client';

export const farmsApi = {
  list: () => api.get('/farms/'),
  create: (farm) => api.post('/farms/', farm),
  update: (id, data) => api.patch(`/farms/${id}/`, data),
  remove: (id) => api.delete(`/farms/${id}/`),
};
