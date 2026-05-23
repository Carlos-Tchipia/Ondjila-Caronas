import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { PassengerRidesApiService } from '../../../core/services/rides/passenger-rides-api.service';
import { PassengerRide, PoolRequest } from '../../../core/services/rides/ride-api.types';
import { PoolRequestResult } from '../../../core/models/pool.types';
import { WalletApiService } from '../../../core/services/wallet/wallet-api.service';
import { MapService } from '../../../core/services/map/map.service';
import { MapPanel } from '../../../shared/components/map-panel/map-panel';
import { BottomNav } from '../../../shared/components/bottom-nav/bottom-nav';
import { PASSENGER_NAV } from '../../../core/navigation/passenger-nav';
import { Router } from '@angular/router';
import { PoolMatchState } from '../../../core/models/pool-match.state';
import { MapAppHeader } from '../../../shared/components/map-app-header/map-app-header';
import { PoolStatusTracker } from '../../../shared/components/pool-status-tracker/pool-status-tracker';
import { PoolRideCard } from '../../../shared/components/pool-ride-card/pool-ride-card';
import { PoolUiState } from '../../../core/models/pool.types';
import { TranslateService } from '../../../core/i18n/translate.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

interface AddressSuggestion {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MapPanel, CommonModule, BottomNav, MapAppHeader, PoolStatusTracker, PoolRideCard, TranslatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy {
  readonly navItems = PASSENGER_NAV;

  @ViewChild('mapPanel') mapPanel!: MapPanel;

  readonly originLat = signal<number>(-8.8147);
  readonly originLng = signal<number>(13.2302);
  readonly originAddress = signal<string>('');

  readonly suggestions = signal<AddressSuggestion[]>([]);
  readonly destLabel = signal('');
  readonly selectedType = signal<'economy' | 'comfort'>('economy');
  readonly isRequesting = signal(false);
  readonly isCancelling = signal(false);
  readonly activeRide = signal<PassengerRide | null>(null);
  readonly walletBalance = signal(0);
  readonly notice = signal<{ kind: 'success' | 'error'; text: string } | null>(null);

  destLat?: number;
  destLng?: number;
  private pollInterval?: ReturnType<typeof setInterval>;
  private noticeTimeout?: ReturnType<typeof setTimeout>;
  private lastUiState?: PoolUiState;

  constructor(
    private readonly mapService: MapService,
    private readonly passengerRidesApi: PassengerRidesApiService,
    private readonly walletApi: WalletApiService,
    private readonly router: Router,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.originAddress.set(this.translate.t('passenger.locating'));
    this.getLocation();
    this.checkCurrentRide();
    this.fetchWalletBalance();
    this.pollInterval = setInterval(() => this.checkCurrentRide(), environment.pollingFallbackMs);
  }

  private getLocation(): void {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.originLat.set(position.coords.latitude);
          this.originLng.set(position.coords.longitude);

          this.mapService.reverseGeocode(position.coords.latitude, position.coords.longitude).subscribe({
            next: (res) => {
              const r = res as { display_name?: string };
              if (r?.display_name) {
                const parts = r.display_name.split(',');
                this.originAddress.set(parts.slice(0, 2).join(', '));
              } else {
                this.originAddress.set(this.translate.t('passenger.currentLocation'));
              }
            },
            error: () => this.originAddress.set(this.translate.t('passenger.currentLocation')),
          });
        },
        () => {
          this.originLat.set(-8.8147);
          this.originLng.set(13.2302);
          this.originAddress.set('Mutamba, Luanda');
        }
      );
    }
  }

  ngOnDestroy(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.noticeTimeout) clearTimeout(this.noticeTimeout);
    this.mapPanel?.stopDriverSimulation();
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
          this.showNotice('success', this.translate.t('ride.tripDoneThanks'));
        }

        this.activeRide.set(newRide);

        if (newRide) {
          this.updateMapForRide(newRide);
          if (newRide.ui_state && newRide.ui_state !== this.lastUiState) {
            this.lastUiState = newRide.ui_state;
          }
        }
      },
    });
  }

  private updateMapForRide(ride: PassengerRide): void {
    if (!this.mapPanel) return;

    const waypoints = ride.pool?.route?.waypoints ?? ride.route?.waypoints;
    if (waypoints?.length) {
      const driverPos =
        ride.driver_lat != null && ride.driver_lng != null
          ? { lat: ride.driver_lat, lng: ride.driver_lng }
          : null;
      this.mapPanel.drawPoolRoute(waypoints, driverPos);

      if (ride.status === 'accepted' || ride.status === 'in_progress') {
        this.mapPanel.simulateDriverAlongRoute(150);
      }
      return;
    }

    if (ride.origin_lat != null && ride.destination_lat != null) {
      this.mapPanel.drawRoute(
        ride.origin_lng!,
        ride.origin_lat,
        ride.destination_lng!,
        ride.destination_lat
      );
    }
  }

  uiState(ride: PassengerRide): PoolUiState {
    return ride.ui_state ?? ride.pool?.ui_state ?? 'searching_passengers';
  }

  getStatusText(ride: PassengerRide): string {
    const state = this.uiState(ride);
    const keys: Record<PoolUiState, string> = {
      searching_passengers: 'ride.statusSearching',
      pool_found: 'ride.statusPoolFound',
      driver_en_route: 'ride.statusDriverEnRoute',
      passenger_picked_up: 'ride.statusPickedUp',
      ride_in_progress: 'ride.statusInProgress',
      completed: 'ride.statusCompleted',
      cancelled: 'ride.statusCancelled',
    };
    return this.translate.t(keys[state] ?? 'ride.statusProcessing');
  }

  canCancelRide(ride: PassengerRide): boolean {
    return ride.status === 'pending' || ride.status === 'accepted';
  }

  onSearchDest(event: Event): void {
    const query = (event.target as HTMLInputElement).value.trim();
    if (query.length > 3) {
      this.mapService.searchAddress(query).subscribe((res) =>
        this.suggestions.set(res as AddressSuggestion[])
      );
      return;
    }
    this.suggestions.set([]);
  }

  selectDestination(suggestion: AddressSuggestion): void {
    this.destLat = Number.parseFloat(suggestion.lat);
    this.destLng = Number.parseFloat(suggestion.lon);
    this.destLabel.set(suggestion.display_name.split(',').slice(0, 2).join(', '));
    this.suggestions.set([]);
    this.mapPanel.drawRoute(this.originLng(), this.originLat(), this.destLng, this.destLat);
  }

  requestPool(): void {
    if (!this.destLat || !this.destLng) return;

    this.isRequesting.set(true);

    const payload: PoolRequest = {
      origin_lat: this.originLat(),
      origin_lng: this.originLng(),
      dest_lat: this.destLat,
      dest_lng: this.destLng,
      vehicle_type: this.selectedType(),
      origin_address: this.originAddress(),
      destination_address: this.destLabel() || this.translate.t('passenger.destination'),
    };

    this.passengerRidesApi.requestPool(payload).subscribe({
      next: (res) => {
        this.isRequesting.set(false);
        const data = res.data as PoolRequestResult | undefined;
        if (data?.match_found && data.pool_details) {
          const mine = data.pool_details.my_ride;
          const state: PoolMatchState = {
            pool_group_id: data.pool_group_id,
            poolPrice: mine?.fare_pool ?? 0,
            soloPrice: mine?.fare_individual ?? 0,
            originLabel: this.originAddress(),
            destLabel: this.destLabel() || this.translate.t('passenger.destination'),
            origin_lat: this.originLat(),
            origin_lng: this.originLng(),
            dest_lat: this.destLat!,
            dest_lng: this.destLng!,
            pool_details: data.pool_details,
            scenario_label: data.scenario_label,
            coPassengerName: data.pool_details.co_passengers[0]?.name,
            coPassengerDest: data.pool_details.co_passengers[0]?.destination_address,
            extraKm:
              data.pool_details.extra_time_minutes > 0
                ? `+${data.pool_details.extra_time_minutes} min`
                : undefined,
          };
          void this.router.navigate(['/passenger/match'], { state });
          return;
        }
        this.checkCurrentRide();
        if (!data?.match_found) {
          this.showNotice('success', this.translate.t('ride.requestRegistered'));
        }
      },
      error: (err) => {
        this.isRequesting.set(false);
        this.showNotice(
          'error',
          this.translate.t('errors.requestPool', {
            message: err.error?.message || this.translate.t('errors.generic'),
          })
        );
      },
    });
  }

  cancelRide(): void {
    this.isCancelling.set(true);
    this.passengerRidesApi.cancelPool().subscribe({
      next: () => {
        this.isCancelling.set(false);
        this.activeRide.set(null);
        this.mapPanel?.stopDriverSimulation();
        this.showNotice('success', this.translate.t('ride.cancelSuccess'));
      },
      error: (err) => {
        this.isCancelling.set(false);
        this.showNotice(
          'error',
          this.translate.t('errors.cancelPool', {
            message: err.error?.message || this.translate.t('errors.generic'),
          })
        );
      },
    });
  }

  formatAoa(value?: number): string {
    return `${Math.round(value ?? 0).toLocaleString('pt-AO')} AOA`;
  }

  private showNotice(kind: 'success' | 'error', text: string): void {
    this.notice.set({ kind, text });
    if (this.noticeTimeout) clearTimeout(this.noticeTimeout);
    this.noticeTimeout = setTimeout(() => this.notice.set(null), 4200);
  }
}
