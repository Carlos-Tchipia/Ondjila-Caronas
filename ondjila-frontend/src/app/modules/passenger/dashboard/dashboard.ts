import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { PassengerRidesApiService } from '../../../core/services/rides/passenger-rides-api.service';
import { PassengerRide, PoolRequest } from '../../../core/services/rides/ride-api.types';
import { WalletApiService } from '../../../core/services/wallet/wallet-api.service';
import { MapService } from '../../../core/services/map/map.service';
import { MapPanel } from '../../../shared/components/map-panel/map-panel';

interface AddressSuggestion {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MapPanel, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy {
  @ViewChild('mapPanel') mapPanel!: MapPanel;

  readonly originLat = -8.8147;
  readonly originLng = 13.2302;
  readonly originAddress = 'Mutamba, Luanda';

  readonly suggestions = signal<AddressSuggestion[]>([]);
  readonly selectedType = signal<'economy' | 'comfort'>('economy');
  readonly isRequesting = signal(false);
  readonly activeRide = signal<PassengerRide | null>(null);
  readonly walletBalance = signal(0);
  readonly notice = signal<{ kind: 'success' | 'error'; text: string } | null>(null);

  destLat?: number;
  destLng?: number;
  private pollInterval?: ReturnType<typeof setInterval>;
  private noticeTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly mapService: MapService,
    private readonly passengerRidesApi: PassengerRidesApiService,
    private readonly walletApi: WalletApiService
  ) {}

  ngOnInit(): void {
    this.checkCurrentRide();
    this.fetchWalletBalance();
    this.pollInterval = setInterval(() => this.checkCurrentRide(), environment.pollingFallbackMs);
  }

  ngOnDestroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    if (this.noticeTimeout) {
      clearTimeout(this.noticeTimeout);
    }
  }

  fetchWalletBalance(): void {
    this.walletApi.getBalance().subscribe({
      next: (res) => this.walletBalance.set(Number(res.data?.balance || 0)),
    });
  }

  checkCurrentRide(): void {
    this.passengerRidesApi.getCurrentRide().subscribe({
      next: (res) => {
        const previousRide = this.activeRide();
        const newRide = res.data?.ride || null;

        if (previousRide && !newRide && previousRide.status === 'in_progress') {
          this.showNotice('success', 'A sua viagem chegou ao destino. Obrigado por viajar com Ondjila.');
          this.mapPanel.drawRoute(this.originLng, this.originLat, this.originLng, this.originLat);
        }

        this.activeRide.set(newRide);
      },
    });
  }

  getStatusText(ride: PassengerRide): string {
    if (ride.status === 'pending') return 'A aguardar motorista...';
    if (ride.status === 'accepted') return 'O motorista está a caminho!';
    if (ride.status === 'in_progress') return 'Viagem em curso';
    return 'Estado desconhecido';
  }

  onSearchDest(event: Event): void {
    const query = (event.target as HTMLInputElement).value.trim();

    if (query.length > 3) {
      this.mapService.searchAddress(query).subscribe((res) => this.suggestions.set(res as AddressSuggestion[]));
      return;
    }

    this.suggestions.set([]);
  }

  selectDestination(suggestion: AddressSuggestion): void {
    this.destLat = Number.parseFloat(suggestion.lat);
    this.destLng = Number.parseFloat(suggestion.lon);
    this.suggestions.set([]);
    this.mapPanel.drawRoute(this.originLng, this.originLat, this.destLng, this.destLat);
  }

  requestPool(): void {
    if (!this.destLat || !this.destLng) return;

    this.isRequesting.set(true);

    const payload: PoolRequest = {
      origin_lat: this.originLat,
      origin_lng: this.originLng,
      dest_lat: this.destLat,
      dest_lng: this.destLng,
      vehicle_type: this.selectedType(),
    };

    this.passengerRidesApi.requestPool(payload).subscribe({
      next: () => {
        this.isRequesting.set(false);
        this.checkCurrentRide();
      },
      error: (err) => {
        this.isRequesting.set(false);
        this.showNotice('error', 'Erro ao pedir carona: ' + (err.error?.message || 'Tente novamente'));
      },
    });
  }

  private showNotice(kind: 'success' | 'error', text: string): void {
    this.notice.set({ kind, text });
    if (this.noticeTimeout) {
      clearTimeout(this.noticeTimeout);
    }
    this.noticeTimeout = setTimeout(() => this.notice.set(null), 4200);
  }
}
