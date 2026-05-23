import { AfterViewInit, Component, OnInit, ViewChild, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MapPanel } from '../../../shared/components/map-panel/map-panel';
import { MapAppHeader } from '../../../shared/components/map-app-header/map-app-header';
import { PoolMatchState } from '../../../core/models/pool-match.state';
import { PoolApiService } from '../../../core/services/pool/pool-api.service';
import { PoolDetails } from '../../../core/models/pool.types';
import { PoolRideCard } from '../../../shared/components/pool-ride-card/pool-ride-card';

@Component({
  selector: 'app-passenger-match',
  standalone: true,
  imports: [MapPanel, MapAppHeader, PoolRideCard],
  templateUrl: './passenger-match.page.html',
  styleUrl: './passenger-match.page.scss',
})
export class PassengerMatchPage implements OnInit, AfterViewInit {
  @ViewChild('mapPanel') mapPanel!: MapPanel;

  readonly match = signal<PoolMatchState | null>(null);
  readonly poolDetails = signal<PoolDetails | null>(null);
  readonly confirming = signal(false);

  constructor(
    private readonly router: Router,
    private readonly poolApi: PoolApiService
  ) {}

  ngOnInit(): void {
    const state = history.state as PoolMatchState | undefined;
    if (!state?.pool_group_id) {
      void this.router.navigate(['/passenger/dashboard']);
      return;
    }

    this.match.set(state);

    if (state.pool_details) {
      this.poolDetails.set(state.pool_details);
      return;
    }

    this.poolApi.getDetails(state.pool_group_id).subscribe({
      next: (res) => {
        const pool = res.data?.pool;
        if (pool) {
          this.poolDetails.set(pool);
          this.enrichMatchFromPool(pool);
        }
      },
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.drawMap(), 400);
  }

  private enrichMatchFromPool(pool: PoolDetails): void {
    const cp = pool.co_passengers[0];
    const m = this.match();
    if (!m) return;
    this.match.set({
      ...m,
      poolPrice: pool.my_ride?.fare_pool ?? m.poolPrice,
      soloPrice: pool.my_ride?.fare_individual ?? m.soloPrice,
      coPassengerName: cp?.name ?? m.coPassengerName,
      coPassengerDest: cp?.destination_address ?? m.coPassengerDest,
      scenario_label: pool.scenario_label,
      extraKm:
        pool.extra_time_minutes > 0
          ? `+${pool.extra_time_minutes} min estimados`
          : 'Rota directa',
    });
  }

  private drawMap(): void {
    const pool = this.poolDetails();
    if (pool?.route?.waypoints?.length && this.mapPanel) {
      this.mapPanel.drawPoolRoute(pool.route.waypoints);
      return;
    }
    const m = this.match();
    if (m && this.mapPanel) {
      this.mapPanel.drawRoute(m.origin_lng, m.origin_lat, m.dest_lng, m.dest_lat);
    }
  }

  formatPrice(value: number): string {
    return `${Math.round(value).toLocaleString('pt-AO')} AOA`;
  }

  initials(name?: string): string {
    return (name ?? 'OD')
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  confirmPool(): void {
    const m = this.match();
    if (!m) return;

    this.confirming.set(true);
    this.poolApi.confirm(m.pool_group_id).subscribe({
      next: () => {
        void this.router.navigate(['/passenger/dashboard'], {
          state: { poolConfirmed: true },
        });
      },
      error: () => {
        this.confirming.set(false);
        void this.router.navigate(['/passenger/dashboard']);
      },
    });
  }

  goSolo(): void {
    void this.router.navigate(['/passenger/dashboard'], {
      state: { preferSolo: true },
    });
  }
}
