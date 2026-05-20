import { Component, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { MapPanel } from '../../../shared/components/map-panel/map-panel';
import { MapService } from '../../../core/services/map/map.service';

import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { PassengerRidesApiService } from '../../../core/services/rides/passenger-rides-api.service';
import { PassengerRide, PoolRequest } from '../../../core/services/rides/ride-api.types';
import { WalletApiService } from '../../../core/services/wallet/wallet-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MapPanel, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit, OnDestroy {
  @ViewChild('mapPanel') mapPanel!: MapPanel;

  originLat = -8.8147; originLng = 13.2302; originAddress = 'Mutamba, Luanda';
  destLat?: number; destLng?: number;

  suggestions: any[] = [];
  selectedType = 'economy';
  isRequesting = false;
  
  activeRide: PassengerRide | null = null;
  private pollInterval?: ReturnType<typeof setInterval>;
  walletBalance: number = 0;

  constructor(
    private readonly mapService: MapService,
    private readonly passengerRidesApi: PassengerRidesApiService,
    private readonly walletApi: WalletApiService
  ) {}

  ngOnInit() {
    this.checkCurrentRide();
    this.fetchWalletBalance();
    this.pollInterval = setInterval(() => this.checkCurrentRide(), environment.pollingFallbackMs);
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
    this.passengerRidesApi.getCurrentRide()
      .subscribe({
        next: (res) => {
          const newRide = res.data?.ride || null;
          // Se a viagem acabou de ser concluída (antes tínhamos e agora é null)
          if (this.activeRide && !newRide && this.activeRide.status === 'in_progress') {
             alert('A sua viagem chegou ao destino! Obrigado por viajar com Ondjila.');
             this.mapPanel.drawRoute(this.originLng, this.originLat, this.originLng, this.originLat); // Reset route
          }
          this.activeRide = newRide;
        }
      });
  }

  getStatusText(): string {
    if (!this.activeRide) return '';
    if (this.activeRide.status === 'pending') return 'A aguardar motorista...';
    if (this.activeRide.status === 'accepted') return 'O Motorista está a caminho!';
    if (this.activeRide.status === 'in_progress') return 'Viagem em Curso';
    return 'Status desconhecido';
  }

  onSearchDest(event: any) {
    const query = event.target.value;
    if (query.length > 3) {
      this.mapService.searchAddress(query).subscribe(res => this.suggestions = res);
    } else {
      this.suggestions = [];
    }
  }

  selectDestination(sug: any) {
    this.destLat = parseFloat(sug.lat); this.destLng = parseFloat(sug.lon);
    this.suggestions = [];
    this.mapPanel.drawRoute(this.originLng, this.originLat, this.destLng, this.destLat);
  }

  requestPool() {
    if (!this.destLat || !this.destLng) return;
    this.isRequesting = true;
    const payload: PoolRequest = {
      origin_lat: this.originLat,
      origin_lng: this.originLng,
      dest_lat: this.destLat,
      dest_lng: this.destLng,
      vehicle_type: this.selectedType
    };

    this.passengerRidesApi.requestPool(payload)
      .subscribe({
        next: (res) => {
          this.isRequesting = false;
          this.checkCurrentRide(); // Força update imediato
        },
        error: (err) => {
          this.isRequesting = false;
          alert('Erro ao pedir carona: ' + (err.error?.message || 'Tente novamente'));
        }
      });
  }
}
