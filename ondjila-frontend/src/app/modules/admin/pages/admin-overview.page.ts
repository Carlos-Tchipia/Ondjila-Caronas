import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import { AdminTopbar } from '../../../shared/components/admin-topbar/admin-topbar';
import { ADMIN_SIDEBAR_CTA, ADMIN_SIDEBAR_MENU } from '../../../core/navigation/admin-sidebar.nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { AdminActivity, AdminDistrict, AdminKpi, AdminOverview } from '../../../core/services/admin/admin.types';
import { AdminApiService } from '../../../core/services/admin/admin-api.service';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [SidebarLayout, AdminTopbar, RouterLink, TranslatePipe],
  templateUrl: './admin-overview.page.html',
  styleUrl: './admin-overview.page.scss',
})
export class AdminOverviewPage implements OnInit {
  readonly menu = ADMIN_SIDEBAR_MENU;
  readonly cta = ADMIN_SIDEBAR_CTA;
  readonly brand = { titleKey: 'admin.brand', subtitleKey: 'admin.subtitle' };
  readonly loading = signal(true);
  readonly kpis = signal<AdminKpi[]>([]);
  readonly fleet = signal<AdminOverview['fleet']>({ individual: 0, pool: 0 });
  readonly zones = signal<AdminDistrict[]>([]);
  readonly activity = signal<AdminActivity[]>([]);

  constructor(private readonly adminApi: AdminApiService) {}

  ngOnInit(): void {
    this.adminApi.overview().subscribe({
      next: (res) => {
        const data = res.data;
        this.kpis.set(data?.kpis ?? []);
        this.fleet.set(data?.fleet ?? { individual: 0, pool: 0 });
        this.zones.set(data?.zones ?? []);
        this.activity.set(data?.activity ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  fleetTotal(): number {
    const current = this.fleet();
    return current.individual + current.pool;
  }

  fleetPct(type: 'individual' | 'pool'): number {
    const total = this.fleetTotal();
    return total > 0 ? Math.round((this.fleet()[type] / total) * 100) : 0;
  }
}
