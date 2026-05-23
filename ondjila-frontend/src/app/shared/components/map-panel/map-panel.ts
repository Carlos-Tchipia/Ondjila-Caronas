import { AfterViewInit, Component, OnDestroy, input } from '@angular/core';
import * as L from 'leaflet';
import { environment } from '../../../../environments/environment';
import { PoolWaypoint } from '../../../core/models/pool.types';
import { LatLng, MapService } from '../../../core/services/map/map.service';

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
  readonly showcase = input(false);

  private map!: L.Map;
  private routeLayer?: L.Polyline;
  private routeGlowLayer?: L.Polyline;
  private routeAnimatedLayer?: L.Polyline;
  private originMarker?: L.Marker;
  private destMarker?: L.Marker;
  private vehicleMarker?: L.Marker;
  private passengerMarkers: L.Marker[] = [];
  private trafficLayer = L.layerGroup();
  private fleetMarkers: { marker: L.Marker; path: L.LatLngTuple[]; progress: number; speed: number }[] = [];
  private latLngsCache: L.LatLngTuple[] = [];
  private animFrame?: number;
  private fleetAnimFrame?: number;
  private animProgress = 0;
  private driverSimInterval?: ReturnType<typeof setInterval>;

  constructor(private readonly mapService: MapService) {}

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.stopVehicleAnimation();
    this.stopFleetSimulation();
    this.stopDriverSimulation();
    this.map?.remove();
  }

  locateUser(): void {
    this.map.locate({ setView: true, maxZoom: 15, enableHighAccuracy: true });
  }

  drawRoute(originLng: number, originLat: number, destLng: number, destLat: number): void {
    this.mapService.getRoute(originLng, originLat, destLng, destLat).subscribe((res) => {
      const geo = this.extractGeometry(res);
      const markers: L.LatLngTuple[] = [
        [originLat, originLng],
        [destLat, destLng],
      ];
      this.renderRoute(geo.length ? geo : markers, markers);
    });
  }

  drawPoolRoute(waypoints: PoolWaypoint[], driverPosition?: LatLng | null): void {
    if (!waypoints.length) return;

    const sorted = [...waypoints].sort((a, b) => a.order - b.order);
    const points: LatLng[] = sorted.map((w) => ({ lat: w.lat, lng: w.lng }));

    this.mapService.getRouteThroughWaypoints(points).subscribe((res) => {
      const geo = this.extractGeometry(res);
      const markers: L.LatLngTuple[] = points.map((p) => [p.lat, p.lng]);
      this.renderRoute(geo.length ? geo : markers, markers, sorted);

      if (driverPosition) {
        this.setVehiclePosition(driverPosition.lat, driverPosition.lng);
      }
    });
  }

  drawShowcase(): void {
    const waypoints: PoolWaypoint[] = [
      { type: 'pickup', lat: -8.8147, lng: 13.2302, address: 'Mutamba', order: 1 },
      { type: 'pickup', lat: -8.8477, lng: 13.2256, address: 'Alvalade', order: 2 },
      { type: 'dropoff', lat: -8.9167, lng: 13.1833, address: 'Talatona', order: 3 },
    ];
    this.drawPoolRoute(waypoints, { lat: -8.8058, lng: 13.2356 });
  }

  simulateDriverAlongRoute(speedMs = 120): void {
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

  setVehiclePosition(lat: number, lng: number): void {
    if (!this.vehicleMarker) {
      this.vehicleMarker = L.marker([lat, lng], { icon: this.createPin('vehicle') }).addTo(this.map);
    } else {
      this.vehicleMarker.setLatLng([lat, lng]);
    }
  }

  stopDriverSimulation(): void {
    if (this.driverSimInterval) {
      clearInterval(this.driverSimInterval);
      this.driverSimInterval = undefined;
    }
  }

  private initMap(): void {
    this.map = L.map(this.mapId(), {
      zoomControl: false,
      preferCanvas: true,
      inertia: true,
      zoomAnimation: true,
      fadeAnimation: true,
    }).setView([-8.8147, 13.2302], this.showcase() ? 12 : 13);

    const tileUrl =
      this.variant() === 'satellite'
        ? environment.map.satelliteTileUrl
        : environment.map.tileUrl;

    L.tileLayer(tileUrl, {
      attribution: environment.map.attribution,
      maxZoom: 19,
      updateWhenIdle: true,
      keepBuffer: 3,
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    this.trafficLayer.addTo(this.map);
    this.renderTrafficLayer();

    if (this.variant() === 'default' && !this.showcase()) {
      this.map.locate({ setView: true, maxZoom: 15, enableHighAccuracy: true });
    }

    if (this.showcase()) {
      window.setTimeout(() => this.drawShowcase(), 350);
    }
  }

  private createPin(type: 'origin' | 'dest' | 'vehicle' | 'passenger', label?: string): L.DivIcon {
    const inner =
      type === 'vehicle'
        ? '<span class="map-pin__car"><i></i></span>'
        : type === 'passenger'
          ? `<span class="map-pin__passenger">${label ?? 'P'}</span>`
          : '<span class="map-pin__dot"></span>';

    return L.divIcon({
      className: `map-pin map-pin--${type}`,
      html: `<div class="map-pin__wrap">${inner}</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  }

  private createTrafficIcon(level: 'low' | 'mid' | 'high'): L.DivIcon {
    return L.divIcon({
      className: `traffic-pulse traffic-pulse--${level}`,
      html: '<span></span>',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  }

  private renderTrafficLayer(): void {
    const traffic: Array<{ lat: number; lng: number; level: 'low' | 'mid' | 'high' }> = [
      { lat: -8.8147, lng: 13.2302, level: 'high' },
      { lat: -8.8237, lng: 13.2447, level: 'mid' },
      { lat: -8.8477, lng: 13.2256, level: 'mid' },
      { lat: -8.8584, lng: 13.2312, level: 'high' },
      { lat: -8.9167, lng: 13.1833, level: 'low' },
      { lat: -8.9983, lng: 13.2675, level: 'low' },
    ];

    traffic.forEach((point) => {
      L.marker([point.lat, point.lng], {
        icon: this.createTrafficIcon(point.level),
        interactive: false,
      }).addTo(this.trafficLayer);
    });
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
    this.latLngsCache = this.simplifyPath(latLngs);

    this.routeGlowLayer = L.polyline(this.latLngsCache, {
      color: '#38bdf8',
      weight: 18,
      opacity: 0.22,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(this.map);

    this.routeLayer = L.polyline(this.latLngsCache, {
      color: '#059669',
      weight: 6,
      opacity: 0.94,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(this.map);

    this.routeAnimatedLayer = L.polyline(this.latLngsCache, {
      color: '#a7f3d0',
      weight: 3,
      opacity: 0.9,
      dashArray: '12 14',
      className: 'route-line-animated',
      lineCap: 'round',
    }).addTo(this.map);

    if (waypoints?.length) {
      waypoints.forEach((wp) => {
        if (wp.type === 'pickup') {
          this.passengerMarkers.push(
            L.marker([wp.lat, wp.lng], { icon: this.createPin('passenger', String(wp.order)) }).addTo(this.map)
          );
          return;
        }
        this.destMarker = L.marker([wp.lat, wp.lng], { icon: this.createPin('dest') }).addTo(this.map);
      });
    } else if (markerPoints.length >= 2) {
      this.originMarker = L.marker(markerPoints[0], { icon: this.createPin('origin') }).addTo(this.map);
      this.destMarker = L.marker(markerPoints[markerPoints.length - 1], { icon: this.createPin('dest') }).addTo(this.map);
    }

    const start = this.latLngsCache[0];
    if (start) {
      this.vehicleMarker = L.marker(start, { icon: this.createPin('vehicle') }).addTo(this.map);
    }

    this.map.flyToBounds(L.latLngBounds(this.latLngsCache), {
      padding: this.showcase() ? [70, 70] : [100, 100],
      duration: 1.2,
      easeLinearity: 0.25,
    });

    this.startVehicleAnimation();
    if (this.showcase()) {
      this.startFleetSimulation([
        this.latLngsCache,
        this.offsetPath(this.latLngsCache, 0.018, -0.006),
        this.offsetPath(this.latLngsCache, -0.016, 0.01),
      ]);
    }
  }

  private startVehicleAnimation(): void {
    this.stopVehicleAnimation();
    if (this.latLngsCache.length < 2) return;

    const step = () => {
      this.animProgress = (this.animProgress + 0.003) % 1;
      const pos = this.interpolatePath(this.latLngsCache, this.animProgress);
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

  private startFleetSimulation(paths: L.LatLngTuple[][]): void {
    this.stopFleetSimulation();
    this.fleetMarkers = paths
      .filter((path) => path.length > 2)
      .map((path, index) => {
        const progress = index / Math.max(paths.length, 1);
        const marker = L.marker(this.interpolatePath(path, progress) ?? path[0], {
          icon: this.createPin('vehicle'),
          interactive: false,
        }).addTo(this.map);
        return { marker, path, progress, speed: 0.0009 + index * 0.00035 };
      });

    const tick = () => {
      this.fleetMarkers.forEach((car) => {
        car.progress = (car.progress + car.speed) % 1;
        const pos = this.interpolatePath(car.path, car.progress);
        if (pos) car.marker.setLatLng(pos);
      });
      this.fleetAnimFrame = requestAnimationFrame(tick);
    };
    this.fleetAnimFrame = requestAnimationFrame(tick);
  }

  private stopFleetSimulation(): void {
    if (this.fleetAnimFrame) {
      cancelAnimationFrame(this.fleetAnimFrame);
      this.fleetAnimFrame = undefined;
    }
    this.fleetMarkers.forEach((car) => this.map?.removeLayer(car.marker));
    this.fleetMarkers = [];
  }

  private interpolatePath(path: L.LatLngTuple[], t: number): L.LatLngTuple | null {
    if (!path.length) return null;
    const total = path.length - 1;
    const f = t * total;
    const i = Math.min(Math.floor(f), total - 1);
    const frac = f - i;
    const a = path[i];
    const b = path[i + 1] ?? a;
    return [a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac];
  }

  private simplifyPath(path: L.LatLngTuple[]): L.LatLngTuple[] {
    if (path.length <= 140) return path;
    const step = Math.ceil(path.length / 140);
    return path.filter((_, index) => index % step === 0 || index === path.length - 1);
  }

  private offsetPath(path: L.LatLngTuple[], latOffset: number, lngOffset: number): L.LatLngTuple[] {
    return path.map(([lat, lng], index) => [
      lat + latOffset + Math.sin(index / 8) * 0.004,
      lng + lngOffset + Math.cos(index / 9) * 0.004,
    ]);
  }

  private clearRoute(): void {
    this.stopVehicleAnimation();
    this.stopFleetSimulation();
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
