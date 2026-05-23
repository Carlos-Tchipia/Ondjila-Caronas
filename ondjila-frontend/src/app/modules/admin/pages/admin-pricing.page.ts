import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminTopbar } from '../../../shared/components/admin-topbar/admin-topbar';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import { ADMIN_SIDEBAR_CTA, ADMIN_SIDEBAR_MENU } from '../../../core/navigation/admin-sidebar.nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { PricingApiService } from '../../../core/services/pricing/pricing-api.service';
import { PricingControls, PricingMetrics } from '../../../core/services/pricing/pricing.types';

@Component({
  selector: 'app-admin-pricing',
  standalone: true,
  imports: [SidebarLayout, AdminTopbar, TranslatePipe, FormsModule],
  templateUrl: './admin-pricing.page.html',
  styleUrl: './admin-pricing.page.scss',
})
export class AdminPricingPage implements OnInit {
  readonly menu = ADMIN_SIDEBAR_MENU;
  readonly cta = ADMIN_SIDEBAR_CTA;
  readonly brand = { titleKey: 'admin.brand', subtitleKey: 'admin.subtitle' };
  readonly controls = signal<PricingControls | null>(null);
  readonly metrics = signal<PricingMetrics | null>(null);
  readonly saving = signal(false);

  constructor(private readonly pricingApi: PricingApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.pricingApi.adminDashboard().subscribe((res) => {
      this.controls.set(res.data?.controls ?? null);
      this.metrics.set(res.data?.metrics ?? null);
    });
  }

  save(): void {
    const controls = this.controls();
    if (!controls) return;

    this.saving.set(true);
    this.pricingApi.updateControls(controls).subscribe({
      next: (res) => {
        this.controls.set(res.data?.controls ?? controls);
        this.saving.set(false);
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  formatAoa(value?: number): string {
    return `${Math.round(value ?? 0).toLocaleString('pt-AO')} AOA`;
  }
}
