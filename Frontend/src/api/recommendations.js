// Advisory recommendations - the engine's live suggestions per farm.
//
// Order comes from the server: most urgent first, by priority score. The
// notification bell shows the top of this list, so don't re-sort on arrival.
import { api } from './client';

export const recommendationsApi = {
  // Everything still standing. Dismissed advice drops out - the admin has
  // already said no to it, and it should not keep ringing the bell.
  live: (limit = 20) =>
    api.get(`/recommendations/?exclude_status=Dismissed&limit=${limit}`),

  listForFarm: (farmId) => api.get(`/recommendations/?farm=${farmId}`),

  accept: (id) => api.post(`/recommendations/${id}/accept/`),
  dismiss: (id) => api.post(`/recommendations/${id}/dismiss/`),
};
