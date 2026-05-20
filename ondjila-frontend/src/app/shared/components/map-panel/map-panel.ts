import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { MapService } from '../../../core/services/map/map.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-map-panel',
  standalone: true,
  imports: [],
  templateUrl: './map-panel.component.html',
  styleUrl: './map-panel.component.scss'
})
export class MapPanel implements AfterViewInit {
  private map!: L.Map;
  private routeLayer?: L.Polyline;
  private originMarker?: L.Marker;
  private destMarker?: L.Marker;

  constructor(private mapService: MapService) {}

  ngAfterViewInit(): void {
    this.initMap();
    
    // Fix leaf icon issue in Angular
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  private initMap(): void {
    // Focado em Luanda
    this.map = L.map('map', { zoomControl: false }).setView([-8.8147, 13.2302], 13);

    L.tileLayer(environment.map.tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
  }

  public drawRoute(originLng: number, originLat: number, destLng: number, destLat: number): void {
    this.mapService.getRoute(originLng, originLat, destLng, destLat).subscribe(res => {
      if (res && res.routes && res.routes.length > 0) {
        const route = res.routes[0];
        
        // Limpar layers anteriores
        if (this.routeLayer) this.map.removeLayer(this.routeLayer);
        if (this.originMarker) this.map.removeLayer(this.originMarker);
        if (this.destMarker) this.map.removeLayer(this.destMarker);

        // Desativado porque OSRM retorna coordenadas GeoJSON [lng, lat], mas Polyline Leaflet precisa [lat, lng]
        const latLngs = route.geometry.coordinates.map((coord: any) => [coord[1], coord[0]]);
        
        // Desenhar a linha (verde premium para Pooling)
        this.routeLayer = L.polyline(latLngs, { color: '#00D150', weight: 4, opacity: 0.8 }).addTo(this.map);
        
        this.originMarker = L.marker([originLat, originLng]).addTo(this.map).bindPopup('Origem');
        this.destMarker = L.marker([destLat, destLng]).addTo(this.map).bindPopup('Destino');

        this.map.fitBounds(this.routeLayer.getBounds(), { padding: [50, 50] });
      }
    });
  }
}
