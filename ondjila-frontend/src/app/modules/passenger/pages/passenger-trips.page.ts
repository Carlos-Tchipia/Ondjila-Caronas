import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ShellPage } from '../../../shared/layouts/shell-page/shell-page';
import { BottomNav } from '../../../shared/components/bottom-nav/bottom-nav';
import { PASSENGER_NAV } from '../../../core/navigation/passenger-nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-passenger-trips',
  standalone: true,
  imports: [ShellPage, BottomNav, RouterLink, TranslatePipe],
  templateUrl: './passenger-trips.page.html',
  styleUrl: './passenger-pages.scss',
})
export class PassengerTripsPage {
  readonly nav = PASSENGER_NAV;
  readonly trips = signal([
    {
      id: 1,
      date: '22 Mai 2026',
      from: 'Marginal de Luanda',
      to: 'Talatona Shopping',
      price: 680,
      statusKey: 'admin.completed',
      driver: 'João M.',
    },
    {
      id: 2,
      date: '18 Mai 2026',
      from: 'Mutamba',
      to: 'Aeroporto 4 de Fevereiro',
      price: 2500,
      statusKey: 'admin.completed',
      driver: 'Miguel S.',
    },
  ]);
}
