import { Component, AfterViewInit, OnDestroy, input } from '@angular/core';
import * as L from 'leaflet';
import { MapService, LatLng } from '../../../core/services/map/map.service';
import { environment } from '../../../../environments/environment';
import { PoolWaypoint } from '../../../core/models/pool.types';

@Component({
  selector: 'app-map-panel',
  standalone: true,
  imports: [],
  templateUrl: './map-panel.component.html',
  styleUrl: './map-panel.component.scss',
  host: {
    '[class.map-panel--satellite]': 'variant() === "satellite"',
    '[class.map-panel--warm]': 'warmTone()',
  },
})
export class MapPanel implements AfterViewInit, OnDestroy {
  readonly variant = input<'default' | 'satellite'>('default');
  readonly warmTone = input(false);
  readonly mapId = input('map');

  private map!: L.Map;
  private routeLayer?: L.Polyline;
  private routeGlowLayer?: L.Polyline;
  private routeAnimatedLayer?: L.Polyline;
  private originMarker?: L.Marker;
  private destMarker?: L.Marker;
  private vehicleMarker?: L.Marker;
  private passengerMarkers: L.Marker[] = [];
  private latLngsCache: L.LatLngTuple[] = [];
  private animFrame?: number;
  private animProgress = 0;
  private driverSimInterval?: ReturnType<typeof setInterval>;

  constructor(private mapService: MapService) {}

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.stopVehicleAnimation();
    this.stopDriverSimulation();
  }

  private initMap(): void {
    const elId = this.mapId();
    this.map = L.map(elId, {
      zoomControl: false,
      preferCanvas: true,
    }).setView([-8.8147, 13.2302], 13);

    const tileUrl =
      this.variant() === 'satellite'
        ? environment.map.satelliteTileUrl
        : environment.map.tileUrl;

    L.tileLayer(tileUrl, {
      attribution: environment.map.attribution,
      maxZoom: 19,
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    if (this.variant() === 'default') {
      this.map.locate({ setView: true, maxZoom: 15, enableHighAccuracy: true });
    }
  }

  locateUser(): void {
    this.map.locate({ setView: true, maxZoom: 15, enableHighAccuracy: true });
  }

  private createPin(type: 'origin' | 'dest' | 'vehicle' | 'passenger', label?: string): L.DivIcon {
    const inner =
      type === 'vehicle'
        ? `<span class="map-pin__car">🚕</span>`
        : type === 'passenger'
          ? `<span class="map-pin__passenger">${label ?? 'P'}</span>`
          : `<span class="map-pin__dot"></span>`;

    return L.divIcon({
      className: `map-pin map-pin--${type}`,
      html: `<div class="map-pin__wrap">${inner}</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });
  }

  public drawRoute(originLng: number, originLat: number, destLng: number, destLat: number): void {
    this.mapService.getRoute(originLng, originLat, destLng, destLat).subscribe((res) => {
      const geo = this.extractGeometry(res);
      if (!geo.length) return;
      this.renderRoute(geo, [
        [originLat, originLng],
        [destLat, destLng],
      ]);
    });
  }

  public drawPoolRoute(waypoints: PoolWaypoint[], driverPosition?: LatLng | null): void {
    if (!waypoints.length) return;

    const sorted = [...waypoints].sort((a, b) => a.order - b.order);
    const points: LatLng[] = sorted.map((w) => ({ lat: w.lat, lng: w.lng }));

    this.mapService.getRouteThroughWaypoints(points).subscribe((res) => {
      const geo = this.extractGeometry(res);
      const markers: L.LatLngTuple[] = points.map((p) => [p.lat, p.lng]);
      this.renderRoute(geo.length ? geo : markers, markers, sorted);
      if (driverPosition) {
        this.setVehiclePosition(driverPosition.lat, driverPosition.lng);
      } else {
        this.startVehicleAnimation();
      }
    });
  }

  /** Simula deslocamento do motorista ao longo da rota (demo / polling fallback) */
  public simulateDriverAlongRoute(speedMs = 120): void {
    this.stopDriverSimulation();
    if (this.latLngsCache.length < 2) return;

    let idx = 0;
    this.driverSimInterval = setInterval(() => {
      const pt = this.latLngsCache[idx];
      if (pt) {
        this.setVehiclePosition(pt[0], pt[1]);
      }
      idx += 1;
      if (idx >= this.latLngsCache.length) {
        this.stopDriverSimulation();
      }
    }, speedMs);
  }

  public setVehiclePosition(lat: number, lng: number): void {
    if (!this.vehicleMarker) {
      this.vehicleMarker = L.marker([lat, lng], { icon: this.createPin('vehicle') }).addTo(this.map);
    } else {
      this.vehicleMarker.setLatLng([lat, lng]);
    }
  }

  public stopDriverSimulation(): void {
    if (this.driverSimInterval) {
      clearInterval(this.driverSimInterval);
      this.driverSimInterval = undefined;
    }
  }

  private extractGeometry(res: unknown): L.LatLngTuple[] {
    const r = res as { routes?: { geometry: { coordinates: number[][] } }[] };
    if (!r?.routes?.length) return [];
    return r.routes[0].geometry.coordinates.map((c) => [c[1], c[0]] as L.LatLngTuple);
  }

  private renderRoute(
    latLngs: L.LatLngTuple[],
    markerPoints: L.LatLngTuple[],
    waypoints?: PoolWaypoint[]
  ): void {
    this.clearRoute();
    this.latLngsCache = latLngs;

    this.routeGlowLayer = L.polyline(latLngs, {
      color: '#2563eb',
      weight: 14,
      opacity: 0.15,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(this.map);

    this.routeLayer = L.polyline(latLngs, {
      color: '#059669',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(this.map);

    this.routeAnimatedLayer = L.polyline(latLngs, {
      color: '#34d399',
      weight: 3,
      opacity: 0.85,
      dashArray: '12 14',
      className: 'route-line-animated',
      lineCap: 'round',
    }).addTo(this.map);

    if (waypoints?.length) {
      waypoints.forEach((wp, i) => {
        if (wp.type === 'pickup') {
          const m = L.marker([wp.lat, wp.lng], {
            icon: this.createPin('passenger', String(wp.order)),
          }).addTo(this.map);
          this.passengerMarkers.push(m);
        } else if (wp.type === 'dropoff') {
          this.destMarker = L.marker([wp.lat, wp.lng], { icon: this.createPin('dest') }).addTo(this.map);
        }
      });
    } else if (markerPoints.length >= 2) {
      this.originMarker = L.marker(markerPoints[0], { icon: this.createPin('origin') }).addTo(this.map);
      this.destMarker = L.marker(markerPoints[markerPoints.length - 1], {
        icon: this.createPin('dest'),
      }).addTo(this.map);
    }

    const mid = latLngs[Math.floor(latLngs.length / 2)];
    if (mid && !this.vehicleMarker) {
      this.vehicleMarker = L.marker(mid, { icon: this.createPin('vehicle') }).addTo(this.map);
    }

    this.map.flyToBounds(L.latLngBounds(latLngs), {
      padding: [100, 100],
      duration: 1.2,
      easeLinearity: 0.25,
    });

    this.startVehicleAnimation();
  }

  private startVehicleAnimation(): void {
    this.stopVehicleAnimation();
    if (this.latLngsCache.length < 2) return;

    const step = () => {
      this.animProgress += 0.004;
      if (this.animProgress > 1) this.animProgress = 0;

      const pos = this.interpolateAlongRoute(this.animProgress);
      if (pos && this.vehicleMarker) {
        this.vehicleMarker.setLatLng(pos);
      }
      this.animFrame = requestAnimationFrame(step);
    };
    this.animFrame = requestAnimationFrame(step);
  }

  private stopVehicleAnimation(): void {
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = undefined;
    }
  }

  private interpolateAlongRoute(t: number): L.LatLngTuple | null {
    const pts = this.latLngsCache;
    if (!pts.length) return null;
    const total = pts.length - 1;
    const f = t * total;
    const i = Math.min(Math.floor(f), total - 1);
    const frac = f - i;
    const a = pts[i];
    const b = pts[i + 1] ?? a;
    return [a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac];
  }

  private clearRoute(): void {
    this.stopVehicleAnimation();
    this.animProgress = 0;
    if (this.routeLayer) this.map.removeLayer(this.routeLayer);
    if (this.routeGlowLayer) this.map.removeLayer(this.routeGlowLayer);
    if (this.routeAnimatedLayer) this.map.removeLayer(this.routeAnimatedLayer);
    if (this.originMarker) this.map.removeLayer(this.originMarker);
    if (this.destMarker) this.map.removeLayer(this.destMarker);
    if (this.vehicleMarker) this.map.removeLayer(this.vehicleMarker);
    this.passengerMarkers.forEach((m) => this.map.removeLayer(m));
    this.passengerMarkers = [];
    this.originMarker = undefined;
    this.destMarker = undefined;
    this.vehicleMarker = undefined;
    this.routeLayer = undefined;
    this.routeGlowLayer = undefined;
    this.routeAnimatedLayer = undefined;
  }
}
