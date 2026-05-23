import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import {
  PASSENGER_SIDEBAR_CTA,
  PASSENGER_SIDEBAR_MENU,
} from '../../../core/navigation/passenger-sidebar.nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-passenger-rides',
  standalone: true,
  imports: [SidebarLayout, RouterLink, TranslatePipe],
  template: `
    <app-sidebar-layout [brand]="brand" [menu]="menu" [cta]="cta" userGreetingKey="common.passengerGreeting">
      <header class="workspace-hero" appTopbar>
        <div>
          <span class="badge">{{ 'shell.badgePassenger' | translate }}</span>
          <h1>{{ 'nav.rides' | translate }}</h1>
          <p>{{ 'passenger.ridesHubSubtitle' | translate }}</p>
        </div>
        <a routerLink="/passenger/choose-ride" class="btn btn--primary">{{ 'nav.requestRide' | translate }}</a>
      </header>

      <section class="product-grid product-grid--three">
        @for (option of rideOptions; track option.route) {
          <a [routerLink]="option.route" class="product-card product-card--link">
            <span class="product-card__eyebrow">{{ option.eyebrowKey | translate }}</span>
            <h2>{{ option.titleKey | translate }}</h2>
            <p>{{ option.bodyKey | translate }}</p>
            <strong>{{ option.ctaKey | translate }}</strong>
          </a>
        }
      </section>

      <section class="ui-card timeline-card">
        <div>
          <h2>{{ 'passenger.currentJourney' | translate }}</h2>
          <p>{{ 'passenger.currentJourneyBody' | translate }}</p>
        </div>
        <div class="timeline-card__steps">
          @for (step of steps; track step.labelKey) {
            <span>{{ step.labelKey | translate }}</span>
          }
        </div>
      </section>
    </app-sidebar-layout>
  `,
})
export class PassengerRidesPage {
  readonly menu = PASSENGER_SIDEBAR_MENU;
  readonly cta = PASSENGER_SIDEBAR_CTA;
  readonly brand = { titleKey: 'common.brand' };

  readonly rideOptions = [
    {
      eyebrowKey: 'common.individual',
      titleKey: 'passenger.soloTrip',
      bodyKey: 'passenger.soloDesc',
      ctaKey: 'passenger.confirmSolo',
      route: '/passenger/choose-ride',
    },
    {
      eyebrowKey: 'common.pool',
      titleKey: 'passenger.poolTrip',
      bodyKey: 'passenger.poolDesc',
      ctaKey: 'passenger.choosePool',
      route: '/passenger/shared-rides',
    },
    {
      eyebrowKey: 'nav.tracking',
      titleKey: 'passenger.trackingTitle',
      bodyKey: 'passenger.trackingBody',
      ctaKey: 'common.openMap',
      route: '/passenger/tracking',
    },
  ];

  readonly steps = [
    { labelKey: 'passenger.chooseMode' },
    { labelKey: 'passenger.requestOnMap' },
    { labelKey: 'pool.driverEnRoute' },
    { labelKey: 'pool.done' },
  ];
}
