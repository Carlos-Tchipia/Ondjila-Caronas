import { Component } from '@angular/core';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import { DRIVER_SIDEBAR_CTA, DRIVER_SIDEBAR_MENU } from '../../../core/navigation/driver-sidebar.nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-driver-security',
  standalone: true,
  imports: [SidebarLayout, TranslatePipe],
  template: `
    <app-sidebar-layout [brand]="brand" [menu]="menu" [cta]="cta" userGreetingKey="common.driverGreeting">
      <header class="page-topbar" appTopbar><h1>{{ 'nav.security' | translate }}</h1></header>
      <div class="ui-card">
        <ul style="list-style: none; line-height: 2">
          <li>✓ {{ 'driver.secIdentity' | translate }}</li>
          <li>✓ {{ 'driver.secLocationShare' | translate }}</li>
          <li>✓ {{ 'driver.secSupport247' | translate }}</li>
        </ul>
      </div>
    </app-sidebar-layout>
  `,
  styles: `.page-topbar { padding: var(--space-5) var(--space-6); }`,
})
export class DriverSecurityPage {
  readonly menu = DRIVER_SIDEBAR_MENU;
  readonly cta = DRIVER_SIDEBAR_CTA;
  readonly brand = { titleKey: 'common.brand' };
}
