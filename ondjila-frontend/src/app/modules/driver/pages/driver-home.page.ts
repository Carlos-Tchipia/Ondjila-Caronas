import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import { DRIVER_SIDEBAR_CTA, DRIVER_SIDEBAR_MENU } from '../../../core/navigation/driver-sidebar.nav';

@Component({
  selector: 'app-driver-home',
  standalone: true,
  imports: [SidebarLayout, RouterLink],
  templateUrl: './driver-home.page.html',
  styleUrl: './driver-home.page.scss',
})
export class DriverHomePage {
  readonly menu = DRIVER_SIDEBAR_MENU;
  readonly cta = DRIVER_SIDEBAR_CTA;
  readonly brand = { title: 'Ondjila' };
  readonly online = signal(true);
  readonly poolEnabled = signal(true);

  readonly weekBars = [
    { day: 'SEG', solo: 40, pool: 20 },
    { day: 'TER', solo: 55, pool: 25 },
    { day: 'QUA', solo: 45, pool: 30 },
    { day: 'QUI', solo: 70, pool: 35 },
    { day: 'SEX', solo: 60, pool: 40 },
    { day: 'SAB', solo: 80, pool: 50, today: true },
    { day: 'DOM', solo: 30, pool: 15, muted: true },
  ];

  readonly recentTrips = [
    { time: '14:20', type: 'Individual', passenger: 'Mateus K.', dest: 'Marginal de Luanda', earn: '3.200 AOA' },
    { time: '13:45', type: 'Pool (2P)', passenger: 'Ana P. + 1', dest: 'Kilamba City', earn: '1.850 AOA' },
    { time: '12:10', type: 'Individual', passenger: 'Carlos M.', dest: 'Aeroporto 4 de Fev', earn: '5.500 AOA' },
  ];
}
