import { Component, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import { AdminTopbar } from '../../../shared/components/admin-topbar/admin-topbar';
import { ADMIN_SIDEBAR_CTA, ADMIN_SIDEBAR_MENU } from '../../../core/navigation/admin-sidebar.nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { MapPanel } from '../../../shared/components/map-panel/map-panel';
import { AdminApiService } from '../../../core/services/admin/admin-api.service';
import { AdminLiveMapDriver, AdminLiveMapRide } from '../../../core/services/admin/admin.types';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-live-map',
  standalone: true,
  imports: [SidebarLayout, AdminTopbar, TranslatePipe, MapPanel],
  template: `
    <app-sidebar-layout
      [brand]="brand"
      [menu]="menu"
      [cta]="cta"
      userGreetingKey="common.adminGreeting"
      userLocationKey="admin.liveMap"
    >
      <app-admin-topbar appTopbar />
      <section class="ops-shell">
        <div class="ops-map">
          <app-map-panel #mapPanel mapId="admin-live-map" [warmTone]="true" />
        </div>
        <aside class="ops-panel">
          <div class="ops-panel__head">
            <div>
              <h1>{{ 'admin.liveMapTitle' | translate }}</h1>
              <p>{{ 'admin.liveMapSub' | translate }}</p>
            </div>
            <button type="button" class="btn btn--primary btn--sm" (click)="load()">Atualizar</button>
          </div>

          <div class="ops-stats">
            <span><strong>{{ onlineDrivers() }}</strong> online</span>
            <span><strong>{{ rides().length }}</strong> viagens ativas</span>
          </div>

          <h2>Viagens em tempo real</h2>
          <div class="ops-list">
            @for (ride of rides(); track ride.id) {
              <button type="button" class="ops-item" (click)="focusRide(ride)">
                <span class="ops-item__type">{{ ride.ride_type }}</span>
                <strong>#{{ ride.id }} · {{ ride.status }}</strong>
                <small>{{ ride.passenger_name }} → {{ ride.destination_address }}</small>
              </button>
            } @empty {
              <div class="ops-empty">Sem viagens ativas neste momento.</div>
            }
          </div>

          <h2>Motoristas aprovados</h2>
          <div class="driver-list">
            @for (driver of drivers(); track driver.id) {
              <div class="driver-row">
                <span class="driver-dot" [class.online]="driver.is_available"></span>
                <span>
                  <strong>{{ driver.name }}</strong>
                  <small>{{ driver.vehicle }} · {{ driver.plate }}</small>
                </span>
              </div>
            }
          </div>
        </aside>
      </section>
    </app-sidebar-layout>
  `,
  styles: `
    .ops-shell {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 390px;
      gap: var(--space-5);
      padding: var(--space-6);
      min-height: calc(100vh - 90px);
    }

    .ops-map {
      min-height: 620px;
      border-radius: var(--rounded-xl);
      overflow: hidden;
      border: 1px solid var(--color-border);
    }

    .ops-panel {
      background: white;
      border: 1px solid var(--color-border);
      border-radius: var(--rounded-lg);
      padding: var(--space-4);
      overflow: auto;
      max-height: calc(100vh - 120px);
    }

    .ops-panel__head {
      display: flex;
      justify-content: space-between;
      gap: var(--space-3);
      align-items: flex-start;
    }

    .ops-panel h1 {
      font-size: var(--text-xl);
      margin: 0 0 4px;
    }

    .ops-panel h2 {
      font-size: var(--text-base);
      margin: var(--space-5) 0 var(--space-3);
    }

    .ops-panel p,
    .ops-panel small {
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }

    .ops-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-2);
      margin-top: var(--space-4);
    }

    .ops-stats span {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: var(--rounded-lg);
      color: var(--brand-700);
      padding: var(--space-3);
      font-size: var(--text-sm);
    }

    .ops-list,
    .driver-list {
      display: grid;
      gap: var(--space-2);
    }

    .ops-item {
      border: 1px solid var(--color-border);
      background: white;
      border-radius: var(--rounded-lg);
      padding: var(--space-3);
      text-align: left;
      cursor: pointer;
      display: grid;
      gap: 4px;
    }

    .ops-item__type {
      color: var(--brand-700);
      font-size: var(--text-xs);
      font-weight: 800;
      text-transform: uppercase;
    }

    .driver-row {
      align-items: center;
      border-bottom: 1px solid var(--color-border);
      display: flex;
      gap: var(--space-2);
      padding: 10px 0;
    }

    .driver-row span:last-child {
      display: grid;
      gap: 2px;
    }

    .driver-dot {
      width: 10px;
      height: 10px;
      background: #94a3b8;
      border-radius: 50%;
      flex: 0 0 auto;
    }

    .driver-dot.online {
      background: var(--brand-600);
      box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.12);
    }

    .ops-empty {
      color: var(--color-text-muted);
      background: var(--color-surface-dim);
      border-radius: var(--rounded-lg);
      padding: var(--space-4);
      text-align: center;
      font-size: var(--text-sm);
    }

    @media (max-width: 980px) {
      .ops-shell {
        grid-template-columns: 1fr;
      }

      .ops-panel {
        max-height: none;
      }
    }
  `,
})
export class AdminLiveMapPage implements OnInit, OnDestroy {
  readonly menu = ADMIN_SIDEBAR_MENU;
  readonly cta = ADMIN_SIDEBAR_CTA;
  readonly brand = { titleKey: 'admin.brand', subtitleKey: 'admin.subtitle' };
  readonly drivers = signal<AdminLiveMapDriver[]>([]);
  readonly rides = signal<AdminLiveMapRide[]>([]);

  @ViewChild('mapPanel') mapPanel?: MapPanel;

  private pollInterval?: ReturnType<typeof setInterval>;

  constructor(private readonly adminApi: AdminApiService) {}

  ngOnInit(): void {
    this.load();
    this.pollInterval = setInterval(() => this.load(false), environment.pollingFallbackMs);
  }

  ngOnDestroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  onlineDrivers(): number {
    return this.drivers().filter((driver) => driver.is_available).length;
  }

  load(shouldFocus = true): void {
    this.adminApi.liveMap().subscribe({
      next: (res) => {
        this.drivers.set(res.data?.drivers ?? []);
        this.rides.set(res.data?.rides ?? []);
        if (shouldFocus) {
          setTimeout(() => {
            const firstRide = this.rides()[0];
            if (firstRide) {
              this.focusRide(firstRide);
              return;
            }
            const firstDriver = this.drivers().find((driver) => driver.current_lat && driver.current_lng);
            if (firstDriver?.current_lat && firstDriver.current_lng) {
              this.mapPanel?.setVehiclePosition(firstDriver.current_lat, firstDriver.current_lng);
            }
          }, 350);
        }
      },
    });
  }

  focusRide(ride: AdminLiveMapRide): void {
    this.mapPanel?.drawRoute(
      ride.origin_lng,
      ride.origin_lat,
      ride.destination_lng,
      ride.destination_lat
    );
  }
}
