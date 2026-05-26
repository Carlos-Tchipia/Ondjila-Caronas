import { Component, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import {
  PASSENGER_SIDEBAR_CTA,
  PASSENGER_SIDEBAR_MENU,
} from '../../../core/navigation/passenger-sidebar.nav';
import { WalletApiService, WalletTransaction } from '../../../core/services/wallet/wallet-api.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-passenger-payments',
  standalone: true,
  imports: [SidebarLayout, DecimalPipe, RouterLink, FormsModule, TranslatePipe],
  templateUrl: './passenger-payments.page.html',
  styleUrl: './passenger-payments.page.scss',
})
export class PassengerPaymentsPage implements OnInit {
  readonly menu = PASSENGER_SIDEBAR_MENU;
  readonly cta = PASSENGER_SIDEBAR_CTA;
  readonly brand = { titleKey: 'common.brand' };
  readonly balance = signal(0);
  readonly topUpAmount = signal(10000);
  readonly selectedMethod = signal<'multicaixa' | 'bank_transfer'>('multicaixa');
  readonly isLoading = signal(false);
  readonly isToppingUp = signal(false);
  readonly notice = signal<{ kind: 'success' | 'error'; text: string } | null>(null);
  readonly transactions = signal<WalletTransaction[]>([]);

  constructor(private readonly walletApi: WalletApiService) {}

  ngOnInit(): void {
    this.loadWallet();
  }

  loadWallet(): void {
    this.isLoading.set(true);
    this.walletApi.getBalance().subscribe({
      next: (res) => {
        const b = Number(res.data?.balance);
        if (!Number.isNaN(b)) this.balance.set(b);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.walletApi.getTransactions().subscribe({
      next: (res) => this.transactions.set(res.data?.transactions || []),
    });
  }

  setTopUpAmount(amount: number): void {
    this.topUpAmount.set(amount);
  }

  updateCustomAmount(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.topUpAmount.set(Number.isFinite(value) ? value : 0);
  }

  topUp(): void {
    const amount = this.topUpAmount();
    if (amount < 100) {
      this.showNotice('error', 'Informe pelo menos 100 AOA.');
      return;
    }

    this.isToppingUp.set(true);
    this.walletApi.topUp(amount, this.selectedMethod()).subscribe({
      next: (res) => {
        this.isToppingUp.set(false);
        this.balance.set(Number(res.data?.balance || this.balance()));
        this.loadTransactions();
        this.showNotice('success', 'Carteira carregada com sucesso.');
      },
      error: (err) => {
        this.isToppingUp.set(false);
        this.showNotice('error', err.error?.message || 'Não foi possível carregar a carteira.');
      },
    });
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('pt-AO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value.replace(' ', 'T')));
  }

  txIcon(type: string): string {
    const icons: Record<string, string> = {
      top_up: '+',
      ride_payment: '-',
      pool_share: '$',
      refund: 'R',
      withdrawal: 'W',
      commission: '%',
    };
    return icons[type] ?? '$';
  }

  private showNotice(kind: 'success' | 'error', text: string): void {
    this.notice.set({ kind, text });
    setTimeout(() => this.notice.set(null), 3500);
  }
}
