import { Component } from '@angular/core';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import { DRIVER_SIDEBAR_CTA, DRIVER_SIDEBAR_MENU } from '../../../core/navigation/driver-sidebar.nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-driver-support',
  standalone: true,
  imports: [SidebarLayout, TranslatePipe],
  template: `
    <app-sidebar-layout [brand]="brand" [menu]="menu" [cta]="cta" userGreetingKey="common.driverGreeting">
      <header class="page-topbar" appTopbar><h1>{{ 'nav.support' | translate }}</h1></header>
      <div class="ui-card">
        <p>{{ 'driver.supportLine' | translate }} <strong style="color: var(--brand-700)">+244 923 111 222</strong></p>
        <p style="margin-top: 0.5rem">{{ 'driver.supportEmailLabel' | translate }} motoristas@ondjila.ao</p>
      </div>
    </app-sidebar-layout>
  `,
  styles: `.page-topbar { padding: var(--space-5) var(--space-6); }`,
})
export class DriverSupportPage {
  readonly menu = DRIVER_SIDEBAR_MENU;
  readonly cta = DRIVER_SIDEBAR_CTA;
  readonly brand = { titleKey: 'common.brand' };
}
