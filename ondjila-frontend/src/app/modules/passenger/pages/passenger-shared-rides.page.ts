import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import {
  PASSENGER_SIDEBAR_CTA,
  PASSENGER_SIDEBAR_MENU,
} from '../../../core/navigation/passenger-sidebar.nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-passenger-shared-rides',
  standalone: true,
  imports: [SidebarLayout, RouterLink, TranslatePipe],
  template: `
    <app-sidebar-layout [brand]="brand" [menu]="menu" [cta]="cta" userGreetingKey="common.passengerGreeting">
      <header class="workspace-hero" appTopbar>
        <div>
          <span class="badge">{{ 'common.pool' | translate }}</span>
          <h1>{{ 'nav.sharedRides' | translate }}</h1>
          <p>{{ 'passenger.poolHubSubtitle' | translate }}</p>
        </div>
        <a routerLink="/passenger/dashboard" class="btn btn--primary">{{ 'passenger.requestPool' | translate }}</a>
      </header>

      <section class="product-grid product-grid--three">
        @for (card of cards; track card.titleKey) {
          <article class="product-card">
            <span class="product-card__eyebrow">{{ card.eyebrowKey | translate }}</span>
            <h2>{{ card.titleKey | translate }}</h2>
            <p>{{ card.bodyKey | translate }}</p>
          </article>
        }
      </section>

      <section class="ui-card route-preview">
        <div>
          <h2>{{ 'pool.routeOrder' | translate }}</h2>
          <p>{{ 'passenger.poolRouteBody' | translate }}</p>
        </div>
        <ol>
          <li>{{ 'pool.pickupPoint' | translate }}</li>
          <li>{{ 'pool.coPassengers' | translate }}</li>
          <li>{{ 'pool.yourDestination' | translate }}</li>
        </ol>
      </section>
    </app-sidebar-layout>
  `,
})
export class PassengerSharedRidesPage {
  readonly menu = PASSENGER_SIDEBAR_MENU;
  readonly cta = PASSENGER_SIDEBAR_CTA;
  readonly brand = { titleKey: 'common.brand' };

  readonly cards = [
    { eyebrowKey: 'pool.scenarioSame', titleKey: 'passenger.moreEconomical', bodyKey: 'passenger.poolMaxStops' },
    { eyebrowKey: 'pool.scenarioDiff', titleKey: 'passenger.sustainable', bodyKey: 'passenger.timeCommitmentBody' },
    { eyebrowKey: 'passenger.safetyTitle', titleKey: 'passenger.poolSafety', bodyKey: 'passenger.securityPoolRoutes' },
  ];
}
