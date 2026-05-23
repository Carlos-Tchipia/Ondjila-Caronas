import { Component, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import { DRIVER_SIDEBAR_CTA, DRIVER_SIDEBAR_MENU } from '../../../core/navigation/driver-sidebar.nav';
import { WalletApiService } from '../../../core/services/wallet/wallet-api.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-driver-payments',
  standalone: true,
  imports: [SidebarLayout, DecimalPipe, TranslatePipe],
  template: `
    <app-sidebar-layout [brand]="brand" [menu]="menu" [cta]="cta" userGreetingKey="common.driverGreeting">
      <header class="page-topbar" appTopbar>
        <div>
          <h1>{{ 'driver.paymentsTitle' | translate }}</h1>
          <p>{{ 'driver.paymentsSubtitle' | translate }}</p>
        </div>
      </header>
      <div class="ui-card ui-card--gradient-green">
        <span class="kpi-label">{{ 'driver.availableBalance' | translate }}</span>
        <p class="amt">{{ balance() | number:'1.2-2' }} <small>Kz</small></p>
        <button type="button" class="btn btn--primary">{{ 'driver.withdrawEarnings' | translate }}</button>
      </div>
      <div class="ui-card" style="margin-top: 1rem">
        <h2>{{ 'driver.transferAccount' | translate }}</h2>
        <p style="color: var(--color-text-muted); font-size: 0.875rem">{{ 'driver.transferHint' | translate }}</p>
      </div>
    </app-sidebar-layout>
  `,
  styles: `
    .page-topbar { padding: var(--space-5) var(--space-6); }
    .amt { font-size: 2.5rem; font-weight: 800; color: var(--brand-700); margin: 0.5rem 0 1.5rem; }
  `,
})
export class DriverPaymentsPage implements OnInit {
  readonly menu = DRIVER_SIDEBAR_MENU;
  readonly cta = DRIVER_SIDEBAR_CTA;
  readonly brand = { titleKey: 'common.brand' };
  readonly balance = signal(452800);

  constructor(private readonly walletApi: WalletApiService) {}

  ngOnInit(): void {
    this.walletApi.getBalance().subscribe({
      next: (res) => {
        const b = Number(res.data?.balance);
        if (!Number.isNaN(b) && b > 0) this.balance.set(b);
      },
    });
  }
}
