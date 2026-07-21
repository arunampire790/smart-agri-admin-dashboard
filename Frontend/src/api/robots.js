// Robot + assignment-history API — maps to Django's /api/robots/ and
// /api/robot-history/ endpoints. The backend returns the exact shape the UI
// uses (id "ROB-0001", name, model, status, farmer, farm, battery,
// registered, notes), so no field translation is needed here.
import { api } from './client';

export const robotsApi = {
  list: () => api.get('/robots/'),
  create: (robot) => api.post('/robots/', robot),
  // Bulk generate: POST each robot in parallel, return the created rows.
  bulkCreate: (robots) => Promise.all(robots.map((r) => api.post('/robots/', r))),
  update: (id, data) => api.patch(`/robots/${id}/`, data),
  remove: (id) => api.delete(`/robots/${id}/`),
};

export const robotHistoryApi = {
  list: () => api.get('/robot-history/'),
  create: (entry) => api.post('/robot-history/', entry),
};
