import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapPanel } from '../../../shared/components/map-panel/map-panel';
import { environment } from '../../../../environments/environment';
import { DriverRidesApiService } from '../../../core/services/rides/driver-rides-api.service';
import { DriverRide } from '../../../core/services/rides/ride-api.types';
import { WalletApiService } from '../../../core/services/wallet/wallet-api.service';

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [MapPanel, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit, OnDestroy {
  @ViewChild('mapPanel') mapPanel!: MapPanel;
  
  isOnline = false;
  availablePools: DriverRide[] = [];
  loading = false;
  acceptingId: number | null = null;
  processing = false;
  
  activeRide: DriverRide | null = null;
  private pollInterval?: ReturnType<typeof setInterval>;
  walletBalance: number = 0;

  constructor(
    private readonly driverRidesApi: DriverRidesApiService,
    private readonly walletApi: WalletApiService
  ) {}

  ngOnInit() {
    this.checkCurrentRide();
    this.fetchWalletBalance();

    // Poll a cada 5 segundos
    this.pollInterval = setInterval(() => {
      if (this.isOnline && !this.activeRide) {
        this.loadPools();
      }
    }, environment.pollingFallbackMs);
  }

  ngOnDestroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  fetchWalletBalance() {
    this.walletApi.getBalance()
      .subscribe({
        next: (res) => this.walletBalance = Number(res.data?.balance || 0)
      });
  }

  checkCurrentRide() {
    this.driverRidesApi.getCurrentRide()
      .subscribe({
        next: (res) => {
          this.activeRide = res.data?.ride || null;
          const activeRide = this.activeRide;
          if (activeRide) {
            // Desenhar rota no mapa caso o motorista faça refresh da página
            setTimeout(() => {
              this.mapPanel.drawRoute(
                activeRide.origin_lng, activeRide.origin_lat,
                activeRide.destination_lng, activeRide.destination_lat
              );
            }, 500);
          }
        }
      });
  }

  loadPools() {
    this.loading = true;
    this.driverRidesApi.getAvailablePools()
      .subscribe({
        next: (res) => {
          this.availablePools = res.data?.pools || [];
          this.loading = false;
        },
        error: () => this.loading = false
      });
  }

  acceptPool(pool: DriverRide) {
    this.acceptingId = pool.id;
    this.mapPanel.drawRoute(pool.origin_lng, pool.origin_lat, pool.destination_lng, pool.destination_lat);

    this.driverRidesApi.acceptPool(pool.id)
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
    this.driverRidesApi.startRide(this.activeRide.id)
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
    this.driverRidesApi.completeRide(this.activeRide.id)
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
