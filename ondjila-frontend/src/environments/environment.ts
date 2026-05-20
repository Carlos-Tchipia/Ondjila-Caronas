export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8000',
  realtimeBaseUrl: 'http://localhost:8000',
  pollingFallbackMs: 5000,
  map: {
    osrmUrl: 'https://router.project-osrm.org/route/v1/driving',
    nominatimUrl: 'https://nominatim.openstreetmap.org',
    tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  },
} as const;
