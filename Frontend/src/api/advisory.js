// Advisory API - the rule engine's endpoints on the farms resource.
//
// GET  /farms/{id}/advisory/  works the analysis out fresh and returns it
//      without writing anything, so the page can be opened as often as you
//      like. `?weather=0` skips the WeatherAPI call.
// POST /farms/{id}/advisory/  runs the same engine and commits the result -
//      recommendations are upserted per rule and tasks raised from them.
import { api } from './client';

export const advisoryApi = {
  preview: (farmId, { weather = true } = {}) =>
    api.get(`/farms/${farmId}/advisory/${weather ? '' : '?weather=0'}`),

  generate: (farmId, { weather = true, tasks = true } = {}) =>
    api.post(`/farms/${farmId}/advisory/`, { weather, tasks }),

  refreshWeather: (farmId) => api.post(`/farms/${farmId}/refresh-weather/`),
};
