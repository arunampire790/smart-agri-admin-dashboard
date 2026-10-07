// Sensor readings - what the robot will POST once it exists.
//
// The entry page uses the same endpoint the machine will, so nothing here
// changes when the hardware ships: only the caller does.
import { api } from './client';

export const sensorDataApi = {
  // Newest first. Always scope to one robot - a week of 3-hourly readings
  // from a handful of robots is a lot of rows to pull for a table.
  listForRobot: (robotId, limit = 10) =>
    api.get(`/sensor-data/?robot=${encodeURIComponent(robotId)}&limit=${limit}`),

  // `recorded_at` is optional; the backend stamps it with now when omitted.
  create: (reading) => api.post('/sensor-data/', reading),

  // Drop this robot's history. The advisory averages the last 24 hours, so on
  // a bench a new reading is blended with the ones before it - clearing first
  // is what makes "send this, see that" actually hold.
  clearForRobot: (robotId) =>
    api.delete(`/sensor-data/clear/?robot=${encodeURIComponent(robotId)}`),
};
