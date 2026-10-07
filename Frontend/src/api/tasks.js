// Task board API - maps to Django's /api/tasks/ endpoints.
//
// The backend returns the exact camelCase shape the board already renders
// (title, assignedTo, farm, type, priority, dueDate, status), so no field
// translation is needed here. `farm` is the farm's name on the way in and
// out, not its id.
//
// Order comes from the server: most urgent first, by the advisory engine's
// priority score. Don't re-sort on arrival or advisory tasks stop lining up.
import { api } from './client';

export const tasksApi = {
  list: () => api.get('/tasks/'),
  create: (task) => api.post('/tasks/', task),
  update: (id, data) => api.patch(`/tasks/${id}/`, data),
  remove: (id) => api.delete(`/tasks/${id}/`),
};
