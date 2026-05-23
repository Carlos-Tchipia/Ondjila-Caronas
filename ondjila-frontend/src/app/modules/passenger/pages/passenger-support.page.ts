import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import {
  PASSENGER_SIDEBAR_CTA,
  PASSENGER_SIDEBAR_MENU,
} from '../../../core/navigation/passenger-sidebar.nav';

@Component({
  selector: 'app-passenger-support',
  standalone: true,
  imports: [SidebarLayout, RouterLink],
  templateUrl: './passenger-support.page.html',
  styleUrl: './passenger-support.page.scss',
})
export class PassengerSupportPage {
  readonly menu = PASSENGER_SIDEBAR_MENU;
  readonly cta = PASSENGER_SIDEBAR_CTA;
  readonly brand = { title: 'Ondjila' };
}
