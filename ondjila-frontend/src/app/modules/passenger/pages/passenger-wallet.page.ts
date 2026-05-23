import { Component, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ShellPage } from '../../../shared/layouts/shell-page/shell-page';
import { BottomNav } from '../../../shared/components/bottom-nav/bottom-nav';
import { PASSENGER_NAV } from '../../../core/navigation/passenger-nav';
import { WalletApiService } from '../../../core/services/wallet/wallet-api.service';

@Component({
  selector: 'app-passenger-wallet',
  standalone: true,
  imports: [ShellPage, BottomNav, DecimalPipe],
  template: `
    <app-shell-page
      title="Carteira"
      subtitle="Saldo virtual e movimentos recentes."
      backLink="/passenger/dashboard"
      badge="Pagamentos"
    >
      <div class="shell-card">
        <p class="wallet-hero">Saldo disponível</p>
        <h2 class="wallet-amount">{{ balance() | number:'1.2-2' }} <small>Kz</small></h2>
        <button type="button" class="btn btn--primary" disabled>Carregar saldo (em breve)</button>
      </div>
      <div class="shell-card">
        <h2>Movimentos</h2>
        <ul class="shell-list">
          <li><span>Pagamento de carona</span><strong>- 2 500 Kz</strong></li>
          <li><span>Carregamento</span><strong>+ 5 000 Kz</strong></li>
        </ul>
        <p style="margin-top:1rem">Histórico completo ligado à API em desenvolvimento.</p>
      </div>
    </app-shell-page>
    <app-bottom-nav [items]="nav" />
  `,
  styles: `
    .wallet-hero { font-size: 0.875rem; color: var(--color-text-muted); margin: 0; }
    .wallet-amount { font-size: 2.5rem; font-weight: 800; margin: 0.5rem 0 1.5rem; color: var(--brand-700); }
    .wallet-amount small { font-size: 1rem; font-weight: 600; }
  `,
})
export class PassengerWalletPage implements OnInit {
  readonly nav = PASSENGER_NAV;
  readonly balance = signal(0);

  constructor(private readonly walletApi: WalletApiService) {}

  ngOnInit(): void {
    this.walletApi.getBalance().subscribe({
      next: (res) => this.balance.set(Number(res.data?.balance || 0)),
    });
  }
}
