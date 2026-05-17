import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MapPanel } from '../../../shared/components/map-panel/map-panel';
import { MapService } from '../../../core/services/map/map.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MapPanel],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  @ViewChild('mapPanel') mapPanel!: MapPanel;

  // Localização simulada do utilizador (Mutamba, Luanda)
  originLat = -8.8147;
  originLng = 13.2302;
  originAddress = 'Mutamba, Luanda';

  destLat?: number;
  destLng?: number;

  suggestions: any[] = [];
  selectedType = 'economy';
  isRequesting = false;
  matchStatus: any = null;

  constructor(
    private mapService: MapService,
    private http: HttpClient
  ) {}

  onSearchDest(event: any) {
    const query = event.target.value;
    if (query.length > 3) {
      this.mapService.searchAddress(query).subscribe(res => {
        this.suggestions = res;
      });
    } else {
      this.suggestions = [];
    }
  }

  selectDestination(sug: any) {
    this.destLat = parseFloat(sug.lat);
    this.destLng = parseFloat(sug.lon);
    this.suggestions = [];
    
    // Desenhar a rota provisória
    this.mapPanel.drawRoute(this.originLng, this.originLat, this.destLng, this.destLat);
  }

  requestPool() {
    if (!this.destLat || !this.destLng) return;
    
    this.isRequesting = true;

    const payload = {
      origin_lat: this.originLat,
      origin_lng: this.originLng,
      dest_lat: this.destLat,
      dest_lng: this.destLng,
      vehicle_type: this.selectedType
    };

    // Usar localhost para dev
    this.http.post<any>('http://localhost:8000/api/pool/request.php', payload)
      .subscribe({
        next: (res) => {
          this.isRequesting = false;
          this.matchStatus = {
            message: res.message,
            pool_group_id: res.data.pool_group_id
          };
        },
        error: (err) => {
          this.isRequesting = false;
          alert('Erro ao pedir carona: ' + (err.error?.message || 'Tente novamente'));
        }
      });
  }
}
