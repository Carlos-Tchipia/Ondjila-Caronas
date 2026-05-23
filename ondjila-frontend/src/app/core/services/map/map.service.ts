import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface RouteResponse {
  distance: number;
  duration: number;
  geometry: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface AddressSuggestion {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  source?: 'local' | 'nominatim';
}

const LUANDA_PLACES: AddressSuggestion[] = [
  { place_id: 'local-mutamba', display_name: 'Mutamba, Luanda, Angola', lat: '-8.8147', lon: '13.2302', type: 'bairro', source: 'local' },
  { place_id: 'local-marginal', display_name: 'Marginal de Luanda, Ingombota, Luanda', lat: '-8.8058', lon: '13.2356', type: 'avenida', source: 'local' },
  { place_id: 'local-ilha', display_name: 'Ilha de Luanda, Luanda, Angola', lat: '-8.7767', lon: '13.2457', type: 'bairro', source: 'local' },
  { place_id: 'local-miramar', display_name: 'Miramar, Luanda, Angola', lat: '-8.8237', lon: '13.2447', type: 'bairro', source: 'local' },
  { place_id: 'local-maculusso', display_name: 'Maculusso, Luanda, Angola', lat: '-8.8255', lon: '13.2353', type: 'bairro', source: 'local' },
  { place_id: 'local-maianga', display_name: 'Maianga, Luanda, Angola', lat: '-8.8354', lon: '13.2295', type: 'municipio', source: 'local' },
  { place_id: 'local-alvalade', display_name: 'Alvalade, Luanda, Angola', lat: '-8.8477', lon: '13.2256', type: 'bairro', source: 'local' },
  { place_id: 'local-ingombota', display_name: 'Ingombota, Luanda, Angola', lat: '-8.8163', lon: '13.2361', type: 'municipio', source: 'local' },
  { place_id: 'local-samba', display_name: 'Samba, Luanda, Angola', lat: '-8.8657', lon: '13.2163', type: 'municipio', source: 'local' },
  { place_id: 'local-talatona', display_name: 'Talatona, Luanda, Angola', lat: '-8.9167', lon: '13.1833', type: 'municipio', source: 'local' },
  { place_id: 'local-kilamba', display_name: 'Kilamba, Belas, Luanda', lat: '-8.9983', lon: '13.2675', type: 'bairro', source: 'local' },
  { place_id: 'local-cacuaco', display_name: 'Cacuaco, Luanda, Angola', lat: '-8.7935', lon: '13.3665', type: 'municipio', source: 'local' },
  { place_id: 'local-viana', display_name: 'Viana, Luanda, Angola', lat: '-8.9042', lon: '13.3718', type: 'municipio', source: 'local' },
  { place_id: 'local-benfica', display_name: 'Benfica, Luanda, Angola', lat: '-8.9377', lon: '13.1812', type: 'bairro', source: 'local' },
  { place_id: 'local-camama', display_name: 'Camama, Luanda, Angola', lat: '-8.8919', lon: '13.2491', type: 'bairro', source: 'local' },
  { place_id: 'local-zango', display_name: 'Zango, Viana, Luanda', lat: '-9.0016', lon: '13.4218', type: 'bairro', source: 'local' },
  { place_id: 'local-aeroporto', display_name: 'Aeroporto 4 de Fevereiro, Luanda', lat: '-8.8584', lon: '13.2312', type: 'aeroporto', source: 'local' },
  { place_id: 'local-sequele', display_name: 'Sequele, Cacuaco, Luanda', lat: '-8.8389', lon: '13.4099', type: 'bairro', source: 'local' },
  { place_id: 'local-patriota', display_name: 'Patriota, Talatona, Luanda', lat: '-8.9487', lon: '13.1907', type: 'bairro', source: 'local' },
  { place_id: 'local-morro-bento', display_name: 'Morro Bento, Luanda, Angola', lat: '-8.8914', lon: '13.1978', type: 'bairro', source: 'local' },
  { place_id: 'local-nova-vida', display_name: 'Nova Vida, Kilamba Kiaxi, Luanda', lat: '-8.9174', lon: '13.2448', type: 'bairro', source: 'local' },
  { place_id: 'local-rocha-pinto', display_name: 'Rocha Pinto, Maianga, Luanda', lat: '-8.8569', lon: '13.2328', type: 'bairro', source: 'local' },
  { place_id: 'local-prenda', display_name: 'Prenda, Maianga, Luanda', lat: '-8.8442', lon: '13.2351', type: 'bairro', source: 'local' },
  { place_id: 'local-rangel', display_name: 'Rangel, Luanda, Angola', lat: '-8.8266', lon: '13.2541', type: 'municipio', source: 'local' },
  { place_id: 'local-cazenga', display_name: 'Cazenga, Luanda, Angola', lat: '-8.8215', lon: '13.2917', type: 'municipio', source: 'local' },
  { place_id: 'local-hoji-ya-henda', display_name: 'Hoji Ya Henda, Cazenga, Luanda', lat: '-8.8074', lon: '13.2855', type: 'bairro', source: 'local' },
  { place_id: 'local-kikolo', display_name: 'Kikolo, Cacuaco, Luanda', lat: '-8.7945', lon: '13.3054', type: 'bairro', source: 'local' },
  { place_id: 'local-gamek', display_name: 'Gamek, Kilamba Kiaxi, Luanda', lat: '-8.8785', lon: '13.2431', type: 'bairro', source: 'local' },
  { place_id: 'local-futungo', display_name: 'Futungo de Belas, Talatona, Luanda', lat: '-8.9119', lon: '13.1653', type: 'bairro', source: 'local' },
  { place_id: 'local-mussulo', display_name: 'Ilha do Mussulo, Luanda, Angola', lat: '-8.9881', lon: '13.1047', type: 'ilha', source: 'local' },
];

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private readonly osrmUrl = environment.map.osrmUrl;
  private readonly nominatimUrl = environment.map.nominatimUrl;

  constructor(private http: HttpClient) {}

  searchAddress(query: string): Observable<AddressSuggestion[]> {
    const normalized = this.normalize(query);
    if (normalized.length < 2) {
      return of([]);
    }

    const local = this.localSearch(normalized);

    return this.http.get<AddressSuggestion[]>(`${this.nominatimUrl}/search`, {
      params: {
        q: `${query}, Luanda, Angola`,
        format: 'json',
        countrycodes: 'ao',
        addressdetails: '1',
        bounded: '1',
        viewbox: '12.95,-8.65,13.55,-9.15',
        limit: '8',
      },
    }).pipe(
      map((remote) => this.mergeSuggestions(local, remote)),
      catchError(() => of(local.slice(0, 8)))
    );
  }

  reverseGeocode(lat: number, lng: number): Observable<any> {
    return this.http.get<any>(`${this.nominatimUrl}/reverse`, {
      params: { lat: lat.toString(), lon: lng.toString(), format: 'json' }
    }).pipe(
      catchError(() => of({ display_name: this.nearestLocalName(lat, lng) }))
    );
  }

  getRoute(originLng: number, originLat: number, destLng: number, destLat: number): Observable<any> {
    const coords = `${originLng},${originLat};${destLng},${destLat}`;
    return this.http.get<any>(`${this.osrmUrl}/${coords}`, {
      params: { overview: 'full', geometries: 'geojson' },
    }).pipe(
      catchError(() => of(this.syntheticRoute([{ lat: originLat, lng: originLng }, { lat: destLat, lng: destLng }])))
    );
  }

  getRouteThroughWaypoints(points: LatLng[]): Observable<any> {
    const coords = points.map((p) => `${p.lng},${p.lat}`).join(';');
    return this.http.get<any>(`${this.osrmUrl}/${coords}`, {
      params: { overview: 'full', geometries: 'geojson', steps: 'true' },
    }).pipe(
      catchError(() => of(this.syntheticRoute(points)))
    );
  }

  private localSearch(query: string): AddressSuggestion[] {
    return LUANDA_PLACES
      .map((place) => ({ place, score: this.matchScore(query, place.display_name) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.place);
  }

  private mergeSuggestions(local: AddressSuggestion[], remote: AddressSuggestion[]): AddressSuggestion[] {
    const seen = new Set<string>();
    const normalizedRemote = remote.map((item) => ({
      ...item,
      source: 'nominatim' as const,
    }));

    return [...local, ...normalizedRemote]
      .filter((item) => {
        const key = `${Number(item.lat).toFixed(4)},${Number(item.lon).toFixed(4)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lon));
      })
      .slice(0, 8);
  }

  private matchScore(query: string, label: string): number {
    const normalizedLabel = this.normalize(label);
    if (normalizedLabel.startsWith(query)) return 100;
    if (normalizedLabel.includes(query)) return 70;
    return query.split(' ').filter((part) => part.length > 1 && normalizedLabel.includes(part)).length * 20;
  }

  private nearestLocalName(lat: number, lng: number): string {
    let nearest = LUANDA_PLACES[0];
    let min = Number.POSITIVE_INFINITY;
    for (const place of LUANDA_PLACES) {
      const d = Math.hypot(lat - Number(place.lat), lng - Number(place.lon));
      if (d < min) {
        min = d;
        nearest = place;
      }
    }
    return nearest.display_name;
  }

  private syntheticRoute(points: LatLng[]): unknown {
    const coordinates: number[][] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      for (let step = 0; step <= 24; step++) {
        const t = step / 24;
        const curve = Math.sin(t * Math.PI) * 0.008;
        coordinates.push([
          a.lng + (b.lng - a.lng) * t + curve,
          a.lat + (b.lat - a.lat) * t - curve * 0.45,
        ]);
      }
    }
    return { routes: [{ geometry: { coordinates } }] };
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
