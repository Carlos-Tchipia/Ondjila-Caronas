import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import {
  PASSENGER_SIDEBAR_CTA,
  PASSENGER_SIDEBAR_MENU,
} from '../../../core/navigation/passenger-sidebar.nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-passenger-tracking',
  standalone: true,
  imports: [SidebarLayout, RouterLink, TranslatePipe],
  template: `
    <app-sidebar-layout [brand]="brand" [menu]="menu" [cta]="cta" userGreetingKey="common.passengerGreeting">
      <header class="workspace-hero" appTopbar>
        <div>
          <span class="badge badge--live">{{ 'nav.tracking' | translate }}</span>
          <h1>{{ 'passenger.trackingTitle' | translate }}</h1>
          <p>{{ 'passenger.trackingSubtitle' | translate }}</p>
        </div>
        <a routerLink="/passenger/dashboard" class="btn btn--primary">{{ 'common.openMap' | translate }}</a>
      </header>

      <section class="tracking-layout">
        <div class="ui-card tracking-map" role="img" [attr.aria-label]="'admin.luandaMapAria' | translate">
          <div class="tracking-map__route"></div>
          <span class="tracking-map__pin tracking-map__pin--start"></span>
          <span class="tracking-map__pin tracking-map__pin--driver"></span>
          <span class="tracking-map__pin tracking-map__pin--end"></span>
        </div>
        <aside class="ui-card tracking-panel">
          <h2>{{ 'passenger.currentJourney' | translate }}</h2>
          <ul class="shell-list">
            <li><span>{{ 'ride.statusDriverEnRoute' | translate }}</span><strong>4 min</strong></li>
            <li><span>{{ 'pool.passengers' | translate: { count: 2, max: 3 } }}</span><strong>{{ 'common.pool' | translate }}</strong></li>
            <li><span>{{ 'pool.extraMin' | translate: { min: 6 } }}</span><strong>{{ 'pool.directRoute' | translate }}</strong></li>
          </ul>
          <a routerLink="/passenger/chat" class="btn btn--ghost full-width">{{ 'passenger.chatTitle' | translate }}</a>
        </aside>
      </section>
    </app-sidebar-layout>
  `,
})
export class PassengerTrackingPage {
  readonly menu = PASSENGER_SIDEBAR_MENU;
  readonly cta = PASSENGER_SIDEBAR_CTA;
  readonly brand = { titleKey: 'common.brand' };
}
