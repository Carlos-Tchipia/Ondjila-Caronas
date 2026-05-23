import { Component, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import {
  PASSENGER_SIDEBAR_CTA,
  PASSENGER_SIDEBAR_MENU,
} from '../../../core/navigation/passenger-sidebar.nav';
import { WalletApiService } from '../../../core/services/wallet/wallet-api.service';

@Component({
  selector: 'app-passenger-payments',
  standalone: true,
  imports: [SidebarLayout, DecimalPipe, RouterLink],
  templateUrl: './passenger-payments.page.html',
  styleUrl: './passenger-payments.page.scss',
})
export class PassengerPaymentsPage implements OnInit {
  readonly menu = PASSENGER_SIDEBAR_MENU;
  readonly cta = PASSENGER_SIDEBAR_CTA;
  readonly brand = { title: 'Ondjila', subtitle: undefined };
  readonly balance = signal(15400);

  constructor(private readonly walletApi: WalletApiService) {}

  ngOnInit(): void {
    this.walletApi.getBalance().subscribe({
      next: (res) => {
        const b = Number(res.data?.balance);
        if (!Number.isNaN(b) && b > 0) this.balance.set(b);
      },
    });
  }
}
