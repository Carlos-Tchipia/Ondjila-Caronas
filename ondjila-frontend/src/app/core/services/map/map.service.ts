import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RouteResponse {
  distance: number;
  duration: number;
  geometry: string; // Polilinha codificada
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private osrmUrl = 'https://router.project-osrm.org/route/v1/driving';
  private nominatimUrl = 'https://nominatim.openstreetmap.org';

  constructor(private http: HttpClient) {}

  // Autocomplete
  searchAddress(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.nominatimUrl}/search`, {
      params: { q: query, format: 'json', countrycodes: 'ao', limit: '5' }
    });
  }

  // Obter rota via OSRM
  getRoute(originLng: number, originLat: number, destLng: number, destLat: number): Observable<any> {
    const coords = `${originLng},${originLat};${destLng},${destLat}`;
    return this.http.get<any>(`${this.osrmUrl}/${coords}`, {
      params: { overview: 'full', geometries: 'geojson' }
    });
  }
}
