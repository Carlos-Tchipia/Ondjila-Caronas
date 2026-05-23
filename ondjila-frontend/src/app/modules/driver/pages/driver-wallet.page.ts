import { Component, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ShellPage } from '../../../shared/layouts/shell-page/shell-page';
import { BottomNav } from '../../../shared/components/bottom-nav/bottom-nav';
import { DRIVER_NAV } from '../../../core/navigation/passenger-nav';
import { WalletApiService } from '../../../core/services/wallet/wallet-api.service';

@Component({
  selector: 'app-driver-wallet',
  standalone: true,
  imports: [ShellPage, BottomNav, DecimalPipe],
  template: `
    <app-shell-page title="Ganhos" subtitle="Receitas de pools e caronas." backLink="/driver/dashboard" badge="Motorista">
      <div class="shell-card">
        <p style="margin:0;color:var(--color-text-muted);font-size:0.875rem">Saldo disponível</p>
        <h2 style="font-size:2.5rem;font-weight:800;color:var(--brand-700);margin:0.5rem 0 1rem">
          {{ balance() | number:'1.2-2' }} <small style="font-size:1rem">Kz</small>
        </h2>
      </div>
      <div class="shell-card">
        <h2>Últimas receitas</h2>
        <p>Detalhe por viagem após conclusão no dashboard.</p>
      </div>
    </app-shell-page>
    <app-bottom-nav [items]="nav" />
  `,
})
export class DriverWalletPage implements OnInit {
  readonly nav = DRIVER_NAV;
  readonly balance = signal(0);

  constructor(private readonly walletApi: WalletApiService) {}

  ngOnInit(): void {
    this.walletApi.getBalance().subscribe({
      next: (res) => this.balance.set(Number(res.data?.balance || 0)),
    });
  }
}
