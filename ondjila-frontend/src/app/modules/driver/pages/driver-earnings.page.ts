import { Component, signal } from '@angular/core';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import { DRIVER_SIDEBAR_CTA, DRIVER_SIDEBAR_MENU } from '../../../core/navigation/driver-sidebar.nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-driver-earnings',
  standalone: true,
  imports: [SidebarLayout, TranslatePipe],
  templateUrl: './driver-earnings.page.html',
  styleUrl: './driver-earnings.page.scss',
})
export class DriverEarningsPage {
  readonly menu = DRIVER_SIDEBAR_MENU;
  readonly cta = DRIVER_SIDEBAR_CTA;
  readonly brand = { titleKey: 'common.brand' };
  readonly period = signal<'dia' | 'semana' | 'mes'>('dia');

  readonly transactions = [
    { dt: '22 Mai, 14:20', service: 'Individual', gross: '3.650,00 Kz', fee: '-450,00 Kz', net: '3.200,00 Kz', pool: false },
    { dt: '22 Mai, 13:45', service: 'Pool (2P)', gross: '2.100,00 Kz', fee: '-250,00 Kz', net: '1.850,00 Kz', pool: true },
    { dt: '22 Mai, 12:10', service: 'Individual', gross: '6.200,00 Kz', fee: '-700,00 Kz', net: '5.500,00 Kz', pool: false },
    { dt: '21 Mai, 19:00', service: 'Pool (3P)', gross: '2.800,00 Kz', fee: '-320,00 Kz', net: '2.480,00 Kz', pool: true },
  ];
}

