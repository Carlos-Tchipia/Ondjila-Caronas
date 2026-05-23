export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8000',
  realtimeBaseUrl: 'http://localhost:8000',
  pollingFallbackMs: 5000,
  map: {
    osrmUrl: 'https://router.project-osrm.org/route/v1/driving',
    nominatimUrl: 'https://nominatim.openstreetmap.org',
    tileUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    satelliteTileUrl:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
} as const;
