import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MapPanel } from '../../../shared/components/map-panel/map-panel';

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [MapPanel],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  @ViewChild('mapPanel') mapPanel!: MapPanel;
  
  isOnline = false;
  availablePools: any[] = [];
  loading = false;
  acceptingId: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Poll a cada 5 segundos para novas viagens, se estiver online
    setInterval(() => {
      if (this.isOnline) {
        this.loadPools();
      }
    }, 5000);
  }

  loadPools() {
    this.loading = true;
    this.http.get<any>('http://localhost:8000/api/drivers/available-pools.php')
      .subscribe({
        next: (res) => {
          this.availablePools = res.data?.pools || [];
          this.loading = false;
        },
        error: () => this.loading = false
      });
  }

  acceptPool(pool: any) {
    this.acceptingId = pool.id;
    
    // Desenhar logo no mapa para preview
    this.mapPanel.drawRoute(pool.origin_lng, pool.origin_lat, pool.destination_lng, pool.destination_lat);

    this.http.post<any>('http://localhost:8000/api/drivers/accept-pool.php', { pool_group_id: pool.id })
      .subscribe({
        next: (res) => {
          this.acceptingId = null;
          alert('Viagem Aceite! Siga para o local.');
          this.loadPools(); // Atualiza a lista para remover o aceite
        },
        error: (err) => {
          this.acceptingId = null;
          alert('Erro ao aceitar viagem: ' + (err.error?.message || 'Tente novamente'));
        }
      });
  }
}
