import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DriverRidesApiService } from '../../../core/services/rides/driver-rides-api.service';
import { DriverRide } from '../../../core/services/rides/ride-api.types';
import { WalletApiService } from '../../../core/services/wallet/wallet-api.service';
import { MapPanel } from '../../../shared/components/map-panel/map-panel';

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [MapPanel, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy {
  @ViewChild('mapPanel') mapPanel!: MapPanel;

  readonly isOnline = signal(false);
  readonly availablePools = signal<DriverRide[]>([]);
  readonly loading = signal(false);
  readonly acceptingId = signal<number | null>(null);
  readonly processing = signal(false);
  readonly activeRide = signal<DriverRide | null>(null);
  readonly walletBalance = signal(0);
  readonly notice = signal<{ kind: 'success' | 'error'; text: string } | null>(null);

  private pollInterval?: ReturnType<typeof setInterval>;
  private noticeTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly driverRidesApi: DriverRidesApiService,
    private readonly walletApi: WalletApiService
  ) {}

  ngOnInit(): void {
    this.checkCurrentRide();
    this.fetchWalletBalance();

    this.pollInterval = setInterval(() => {
      if (this.isOnline() && !this.activeRide()) {
        this.loadPools();
      }
    }, environment.pollingFallbackMs);
  }

  ngOnDestroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    if (this.noticeTimeout) {
      clearTimeout(this.noticeTimeout);
    }
  }

  toggleOnline(): void {
    this.isOnline.update((value) => !value);
  }

  fetchWalletBalance(): void {
    this.walletApi.getBalance().subscribe({
      next: (res) => this.walletBalance.set(Number(res.data?.balance || 0)),
    });
  }

  checkCurrentRide(): void {
    this.driverRidesApi.getCurrentRide().subscribe({
      next: (res) => {
        const ride = res.data?.ride || null;
        this.activeRide.set(ride);

        if (ride) {
          setTimeout(() => {
            this.mapPanel.drawRoute(
              ride.origin_lng,
              ride.origin_lat,
              ride.destination_lng,
              ride.destination_lat
            );
          }, 500);
        }
      },
    });
  }

  loadPools(): void {
    this.loading.set(true);

    this.driverRidesApi.getAvailablePools().subscribe({
      next: (res) => {
        this.availablePools.set(res.data?.pools || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  acceptPool(pool: DriverRide): void {
    this.acceptingId.set(pool.id);
    this.mapPanel.drawRoute(pool.origin_lng, pool.origin_lat, pool.destination_lng, pool.destination_lat);

    this.driverRidesApi.acceptPool(pool.id).subscribe({
      next: () => {
        this.acceptingId.set(null);
        this.checkCurrentRide();
      },
      error: (err) => {
        this.acceptingId.set(null);
        this.showNotice('error', 'Erro ao aceitar viagem: ' + (err.error?.message || 'Tente novamente'));
      },
    });
  }

  startRide(): void {
    const ride = this.activeRide();
    if (!ride) return;

    this.processing.set(true);

    this.driverRidesApi.startRide(ride.id).subscribe({
      next: () => {
        this.processing.set(false);
        this.checkCurrentRide();
      },
      error: (err) => {
        this.processing.set(false);
        this.showNotice('error', 'Erro ao iniciar viagem: ' + (err.error?.message || 'Tente novamente'));
      },
    });
  }

  completeRide(): void {
    const ride = this.activeRide();
    if (!ride) return;

    this.processing.set(true);

    this.driverRidesApi.completeRide(ride.id).subscribe({
      next: () => {
        this.processing.set(false);
        this.activeRide.set(null);
        this.availablePools.set([]);
        this.showNotice('success', 'Viagem concluída. Excelente trabalho.');
      },
      error: (err) => {
        this.processing.set(false);
        this.showNotice('error', 'Erro ao concluir viagem: ' + (err.error?.message || 'Tente novamente'));
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
