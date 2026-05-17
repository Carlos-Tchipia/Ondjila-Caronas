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
  processing = false;
  
  activeRide: any = null;
  pollInterval: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.checkCurrentRide();

    // Poll a cada 5 segundos
    this.pollInterval = setInterval(() => {
      if (this.isOnline && !this.activeRide) {
        this.loadPools();
      }
    }, 5000);
  }

  checkCurrentRide() {
    this.http.get<any>('http://localhost:8000/api/drivers/current-ride.php')
      .subscribe({
        next: (res) => {
          this.activeRide = res.data?.ride || null;
          if (this.activeRide) {
            // Desenhar rota no mapa caso o motorista faça refresh da página
            setTimeout(() => {
              this.mapPanel.drawRoute(
                this.activeRide.origin_lng, this.activeRide.origin_lat,
                this.activeRide.destination_lng, this.activeRide.destination_lat
              );
            }, 500);
          }
        }
      });
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
    this.mapPanel.drawRoute(pool.origin_lng, pool.origin_lat, pool.destination_lng, pool.destination_lat);

    this.http.post<any>('http://localhost:8000/api/drivers/accept-pool.php', { pool_group_id: pool.id })
      .subscribe({
        next: (res) => {
          this.acceptingId = null;
          this.checkCurrentRide(); // Transita o UI para Viagem em Curso
        },
        error: (err) => {
          this.acceptingId = null;
          alert('Erro ao aceitar viagem: ' + (err.error?.message || 'Tente novamente'));
        }
      });
  }

  startRide() {
    if (!this.activeRide) return;
    this.processing = true;
    this.http.post<any>('http://localhost:8000/api/drivers/start-ride.php', { pool_group_id: this.activeRide.id })
      .subscribe({
        next: (res) => {
          this.processing = false;
          this.checkCurrentRide(); // Atualiza o status para in_progress
        },
        error: (err) => {
          this.processing = false;
          alert('Erro ao iniciar viagem: ' + (err.error?.message || 'Tente novamente'));
        }
      });
  }

  completeRide() {
    if (!this.activeRide) return;
    this.processing = true;
    this.http.post<any>('http://localhost:8000/api/drivers/complete-ride.php', { pool_group_id: this.activeRide.id })
      .subscribe({
        next: (res) => {
          this.processing = false;
          this.activeRide = null; // Remove a viagem ativa, volta ao ecrã de pedidos
          this.availablePools = []; // Limpa cache
          alert('Viagem concluída! Excelente trabalho.');
        },
        error: (err) => {
          this.processing = false;
          alert('Erro ao concluir viagem: ' + (err.error?.message || 'Tente novamente'));
        }
      });
  }
}
