export const environment = {
  production: true,
  apiBaseUrl: '',
  realtimeBaseUrl: '',
  pollingFallbackMs: 5000,
  map: {
    osrmUrl: 'https://router.project-osrm.org/route/v1/driving',
    nominatimUrl: 'https://nominatim.openstreetmap.org',
    tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  },
} as const;
