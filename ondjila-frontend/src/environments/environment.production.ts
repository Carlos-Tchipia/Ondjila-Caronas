export const environment = {
  production: true,
  apiBaseUrl: '',
  realtimeBaseUrl: '',
  pollingFallbackMs: 5000,
  map: {
    osrmUrl: 'https://router.project-osrm.org/route/v1/driving',
    nominatimUrl: 'https://nominatim.openstreetmap.org',
    tileUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    satelliteTileUrl:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; OSM &copy; CARTO',
  },
} as const;
