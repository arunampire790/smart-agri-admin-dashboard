// TODO: Replace all mock sensor data with real hardware API/WebSocket readings once connected.

const now = new Date();

export const mockSensorReadings = {
  'AgriBot-001': {
    dht11: { temperature: 24, humidity: 62 },
    soilMoisture: 45,
    ultrasonic: 180,
    wifiLocation: { lat: 36.7783, lng: -119.4179, label: 'Green Valley Farm, CA' },
  },
  'AgriBot-002': {
    dht11: { temperature: 28, humidity: 78 },
    soilMoisture: 18,
    ultrasonic: 25,
    wifiLocation: { lat: 47.7511, lng: -120.7401, label: 'Sunrise Orchards, WA' },
  },
  'AgriBot-003': {
    dht11: { temperature: 31, humidity: 88 },
    soilMoisture: 72,
    ultrasonic: 95,
    wifiLocation: { lat: 41.8780, lng: -93.0977, label: 'Golden Harvest, IA' },
  },
  'AgriBot-004': {
    dht11: { temperature: 22, humidity: 55 },
    soilMoisture: 38,
    ultrasonic: 350,
    wifiLocation: { lat: 40.5865, lng: -89.6187, label: 'Maple Ridge Farm, IL' },
  },
};

// TODO: Replace with real time-series data from sensor API
export const mockHistoryData = {
  'AgriBot-001': [
    { time: '06:00', temperature: 22, soilMoisture: 44 },
    { time: '08:00', temperature: 23, soilMoisture: 45 },
    { time: '10:00', temperature: 25, soilMoisture: 44 },
    { time: '12:00', temperature: 26, soilMoisture: 43 },
    { time: '14:00', temperature: 24, soilMoisture: 45 },
    { time: '16:00', temperature: 24, soilMoisture: 45 },
  ],
  'AgriBot-002': [
    { time: '06:00', temperature: 26, soilMoisture: 20 },
    { time: '08:00', temperature: 27, soilMoisture: 19 },
    { time: '10:00', temperature: 29, soilMoisture: 18 },
    { time: '12:00', temperature: 30, soilMoisture: 17 },
    { time: '14:00', temperature: 28, soilMoisture: 18 },
    { time: '16:00', temperature: 28, soilMoisture: 18 },
  ],
  'AgriBot-003': [
    { time: '06:00', temperature: 29, soilMoisture: 73 },
    { time: '08:00', temperature: 30, soilMoisture: 73 },
    { time: '10:00', temperature: 32, soilMoisture: 72 },
    { time: '12:00', temperature: 33, soilMoisture: 71 },
    { time: '14:00', temperature: 31, soilMoisture: 72 },
    { time: '16:00', temperature: 31, soilMoisture: 72 },
  ],
  'AgriBot-004': [
    { time: '06:00', temperature: 20, soilMoisture: 39 },
    { time: '08:00', temperature: 21, soilMoisture: 38 },
    { time: '10:00', temperature: 23, soilMoisture: 38 },
    { time: '12:00', temperature: 24, soilMoisture: 37 },
    { time: '14:00', temperature: 22, soilMoisture: 38 },
    { time: '16:00', temperature: 22, soilMoisture: 38 },
  ],
};

// TODO: Replace with real last-sync timestamp from hardware API
export const lastSynced = now;
