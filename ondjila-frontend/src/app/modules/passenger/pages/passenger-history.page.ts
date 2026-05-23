import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import {
  PASSENGER_SIDEBAR_CTA,
  PASSENGER_SIDEBAR_MENU,
} from '../../../core/navigation/passenger-sidebar.nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-passenger-history',
  standalone: true,
  imports: [SidebarLayout, RouterLink, TranslatePipe],
  template: `
    <app-sidebar-layout [brand]="brand" [menu]="menu" [cta]="cta" userGreetingKey="common.passengerGreeting">
      <header class="workspace-hero" appTopbar>
        <div>
          <span class="badge">{{ 'nav.history' | translate }}</span>
          <h1>{{ 'passenger.tripsTitle' | translate }}</h1>
          <p>{{ 'passenger.tripsSubtitle' | translate }}</p>
        </div>
        <a routerLink="/passenger/rate" class="btn btn--ghost">{{ 'passenger.rateTrip' | translate }}</a>
      </header>

      <section class="ui-card">
        <table class="data-table responsive-table">
          <thead>
            <tr>
              <th>{{ 'driver.dateTime' | translate }}</th>
              <th>{{ 'admin.type' | translate }}</th>
              <th>{{ 'driver.colDestination' | translate }}</th>
              <th>{{ 'ride.amount' | translate }}</th>
              <th>{{ 'admin.state' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (trip of trips; track trip.date) {
              <tr>
                <td>{{ trip.date }}</td>
                <td><span class="pill" [class.pill--blue]="trip.type === 'Pool'">{{ trip.type }}</span></td>
                <td>{{ trip.destination }}</td>
                <td><strong>{{ trip.amount }}</strong></td>
                <td>{{ 'admin.completed' | translate }}</td>
              </tr>
            }
          </tbody>
        </table>
      </section>
    </app-sidebar-layout>
  `,
})
export class PassengerHistoryPage {
  readonly menu = PASSENGER_SIDEBAR_MENU;
  readonly cta = PASSENGER_SIDEBAR_CTA;
  readonly brand = { titleKey: 'common.brand' };

  readonly trips = [
    { date: 'Hoje, 14:20', type: 'Pool', destination: 'Talatona', amount: '2.400 AOA' },
    { date: 'Ontem, 09:15', type: 'Individual', destination: 'Mutamba', amount: '3.900 AOA' },
    { date: '12 Mai, 18:40', type: 'Pool', destination: 'Kilamba', amount: '1.850 AOA' },
  ];
}
