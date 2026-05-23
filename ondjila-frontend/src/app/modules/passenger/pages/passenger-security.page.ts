import { Component } from '@angular/core';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import {
  PASSENGER_SIDEBAR_CTA,
  PASSENGER_SIDEBAR_MENU,
} from '../../../core/navigation/passenger-sidebar.nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-passenger-security',
  standalone: true,
  imports: [SidebarLayout, TranslatePipe],
  template: `
    <app-sidebar-layout [brand]="brand" [menu]="menu" [cta]="cta" userGreetingKey="common.passengerGreeting">
      <header class="page-topbar" appTopbar>
        <div>
          <h1>{{ 'passenger.securityTitle' | translate }}</h1>
          <p>{{ 'passenger.securitySubtitle' | translate }}</p>
        </div>
      </header>
      <div class="ui-card">
        <h2>{{ 'passenger.securityCenter' | translate }}</h2>
        <ul class="sec-list">
          <li>🆘 {{ 'passenger.securitySos' | translate }}</li>
          <li>📍 {{ 'passenger.securityShareTrip' | translate }}</li>
          <li>✓ {{ 'passenger.securityValidatedDrivers' | translate }}</li>
          <li>🛡 {{ 'passenger.securityPoolRoutes' | translate }}</li>
        </ul>
      </div>
    </app-sidebar-layout>
  `,
  styles: `
    .page-topbar { padding: var(--space-5) var(--space-6); }
    .sec-list { margin: 1rem 0 0; padding-left: 0; list-style: none; line-height: 2; }
  `,
})
export class PassengerSecurityPage {
  readonly menu = PASSENGER_SIDEBAR_MENU;
  readonly cta = PASSENGER_SIDEBAR_CTA;
  readonly brand = { titleKey: 'common.brand' };
}
