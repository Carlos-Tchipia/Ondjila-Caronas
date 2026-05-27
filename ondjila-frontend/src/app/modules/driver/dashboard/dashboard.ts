import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DriverRidesApiService } from '../../../core/services/rides/driver-rides-api.service';
import { DriverRide } from '../../../core/services/rides/ride-api.types';
import { WalletApiService } from '../../../core/services/wallet/wallet-api.service';
import { MapPanel } from '../../../shared/components/map-panel/map-panel';
import { BottomNav } from '../../../shared/components/bottom-nav/bottom-nav';
import { DRIVER_NAV } from '../../../core/navigation/passenger-nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslateService } from '../../../core/i18n/translate.service';
import { catchError, forkJoin, of } from 'rxjs';
@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [MapPanel, CommonModule, BottomNav, TranslatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy {
  readonly navItems = DRIVER_NAV;

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
  private readonly fallbackDriverLocation = { lat: -8.8147, lng: 13.2302 };
  private hasLoadedRequests = false;

  constructor(
    private readonly driverRidesApi: DriverRidesApiService,
    private readonly walletApi: WalletApiService,
    private readonly translate: TranslateService
  ) {}

  private locationInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.checkCurrentRide();
    this.fetchWalletBalance();

    this.pollInterval = setInterval(() => {
      if (this.activeRide()) {
        this.checkCurrentRide();
      } else if (this.isOnline()) {
        this.loadPools(false);
      }
    }, environment.pollingFallbackMs);
  }

  ngOnDestroy(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.locationInterval) clearInterval(this.locationInterval);
    if (this.noticeTimeout) clearTimeout(this.noticeTimeout);
    this.mapPanel?.stopDriverSimulation();
  }

  toggleOnline(): void {
    if (this.isOnline()) {
      this.isOnline.set(false);
      this.availablePools.set([]);
      this.hasLoadedRequests = false;
      this.stopLocationBroadcast();
      this.driverRidesApi.updateAvailability(false).subscribe();
      return;
    }

    this.loading.set(true);
    this.syncCurrentLocation()
      .then(() => {
        this.isOnline.set(true);
        this.startLocationBroadcast();
        this.loadPools(true);
      })
      .catch(() => {
        this.loading.set(false);
        this.isOnline.set(false);
        this.stopLocationBroadcast();
        this.showNotice('error', this.translate.t('driver.locationRequired'));
      });
  }

  private startLocationBroadcast(): void {
    this.stopLocationBroadcast();
    if (!('geolocation' in navigator)) {
      this.showNotice('error', this.translate.t('driver.locationUnavailable'));
      return;
    }

    const tick = (): void => {
      this.syncCurrentLocation().catch(() => {
        this.showNotice('error', this.translate.t('driver.locationRequired'));
      });
    };

    this.locationInterval = setInterval(tick, environment.pollingFallbackMs);
  }

  private stopLocationBroadcast(): void {
    if (this.locationInterval) {
      clearInterval(this.locationInterval);
      this.locationInterval = undefined;
    }
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
          setTimeout(() => this.drawRideOnMap(ride), 500);
          if (ride.status === 'in_progress') {
            this.mapPanel?.simulateDriverAlongRoute(120);
          }
        }
      },
    });
  }

  loadPools(showLoading = false): void {
    if (!this.isOnline()) return;
    if (showLoading || !this.hasLoadedRequests) {
      this.loading.set(true);
    }

    forkJoin({
      rides: this.driverRidesApi.getAvailableRides().pipe(
        catchError(() =>
          of({ success: false, data: { rides: [], location_required: false }, message: '' })
        )
      ),
      pools: this.driverRidesApi.getAvailablePools().pipe(
        catchError(() =>
          of({ success: false, data: { pools: [], location_required: false }, message: '' })
        )
      ),
    }).subscribe({
      next: (res) => {
        const locationRequired =
          !!res.rides.data?.location_required || !!res.pools.data?.location_required;
        this.availablePools.set([
          ...(res.rides.data?.rides || []),
          ...(res.pools.data?.pools || []),
        ]);
        this.hasLoadedRequests = true;
        this.loading.set(false);

        if (locationRequired) {
          this.showNotice('error', this.translate.t('driver.locationRequired'));
        }
      },
      error: () => {
        this.hasLoadedRequests = true;
        this.loading.set(false);
      },
    });
  }

  private syncCurrentLocation(): Promise<void> {
    if (!('geolocation' in navigator)) {
      return this.useFallbackLocation();
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.driverRidesApi.updateLocation(pos.coords.latitude, pos.coords.longitude).subscribe({
            next: () => resolve(),
            error: reject,
          });
        },
        () => {
          this.useFallbackLocation().then(resolve).catch(reject);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 15000,
          timeout: 10000,
        }
      );
    });
  }

  private useFallbackLocation(): Promise<void> {
    if (environment.production) {
      return Promise.reject(new Error('Geolocation unavailable'));
    }

    return new Promise((resolve, reject) => {
      this.driverRidesApi
        .updateLocation(this.fallbackDriverLocation.lat, this.fallbackDriverLocation.lng)
        .subscribe({
          next: () => resolve(),
          error: reject,
        });
    });
  }

  private drawRideOnMap(ride: DriverRide): void {
    if (!this.mapPanel) return;
    const waypoints = ride.route?.waypoints;
    if (waypoints?.length) {
      this.mapPanel.drawPoolRoute(waypoints);
      return;
    }
    this.mapPanel.drawRoute(
      ride.origin_lng,
      ride.origin_lat,
      ride.destination_lng,
      ride.destination_lat
    );
  }

  acceptRequest(ride: DriverRide): void {
    this.acceptingId.set(ride.id);

    const request = ride.ride_type === 'individual'
      ? this.driverRidesApi.acceptRide(ride.id)
      : this.driverRidesApi.acceptPool(ride.id);

    request.subscribe({
      next: () => {
        this.acceptingId.set(null);
        this.checkCurrentRide();
      },
      error: (err) => {
        this.acceptingId.set(null);
        this.showNotice(
          'error',
          this.translate.t('errors.acceptPool', {
            message: err.error?.message || this.translate.t('errors.generic'),
          })
        );
      },
    });
  }

  isReadyToStart(ride: DriverRide): boolean {
    return ride.status === 'active' || ride.status === 'accepted';
  }

  isTripInProgress(ride: DriverRide): boolean {
    return ride.status === 'in_progress';
  }

  requestLabel(ride: DriverRide): string {
    return ride.ride_type === 'individual' ? 'Corrida individual' : 'Grupo';
  }

  requestTrackId(ride: DriverRide): string {
    return `${ride.ride_type ?? 'pool'}-${ride.id}`;
  }

  startRide(): void {
    const ride = this.activeRide();
    if (!ride) return;

    this.processing.set(true);

    this.driverRidesApi.startRide(ride).subscribe({
      next: () => {
        this.processing.set(false);
        this.checkCurrentRide();
      },
      error: (err) => {
        this.processing.set(false);
        this.showNotice(
          'error',
          this.translate.t('errors.startRide', {
            message: err.error?.message || this.translate.t('errors.generic'),
          })
        );
      },
    });
  }

  completeRide(): void {
    const ride = this.activeRide();
    if (!ride) return;

    this.processing.set(true);

    this.driverRidesApi.completeRide(ride).subscribe({
      next: () => {
        this.processing.set(false);
        this.activeRide.set(null);
        this.availablePools.set([]);
        this.showNotice('success', this.translate.t('driver.tripCompleteSuccess'));
      },
      error: (err) => {
        this.processing.set(false);
        this.showNotice(
          'error',
          this.translate.t('errors.completeRide', {
            message: err.error?.message || this.translate.t('errors.generic'),
          })
        );
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
