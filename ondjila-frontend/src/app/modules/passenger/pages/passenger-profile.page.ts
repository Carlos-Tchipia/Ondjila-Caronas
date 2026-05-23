import { Component, signal } from '@angular/core';
import { ShellPage } from '../../../shared/layouts/shell-page/shell-page';
import { BottomNav } from '../../../shared/components/bottom-nav/bottom-nav';
import { PASSENGER_NAV } from '../../../core/navigation/passenger-nav';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-passenger-profile',
  standalone: true,
  imports: [ShellPage, BottomNav, RouterLink],
  template: `
    <app-shell-page title="Perfil" subtitle="Conta e preferências." backLink="/passenger/dashboard">
      <div class="shell-card profile-card">
        <div class="avatar profile-avatar">{{ initials() }}</div>
        <div>
          <h2>{{ user()?.name || 'Utilizador' }}</h2>
          <p>{{ user()?.email }}</p>
        </div>
      </div>
      <a routerLink="/passenger/wallet" class="shell-card link-card">◎ Carteira</a>
      <a routerLink="/passenger/trips" class="shell-card link-card">↗ As minhas viagens</a>
      <a routerLink="/passenger/notifications" class="shell-card link-card">🔔 Notificações</a>
      <a routerLink="/passenger/settings" class="shell-card link-card">⚙ Configurações</a>
    </app-shell-page>
    <app-bottom-nav [items]="nav" />
  `,
  styles: `
    .profile-card { display: flex; gap: 1rem; align-items: center; }
    .profile-avatar { width: 56px; height: 56px; font-size: 1.25rem; }
    .link-card { text-decoration: none; color: inherit; font-weight: 600; transition: box-shadow 0.2s; }
    .link-card:hover { box-shadow: var(--shadow-md); }
  `,
})
export class PassengerProfilePage {
  readonly nav = PASSENGER_NAV;
  readonly user = signal<{ name?: string; email?: string } | null>(null);
  readonly initials = signal('OD');

  constructor() {
    try {
      const raw = localStorage.getItem('ondjila_user');
      if (raw) {
        const u = JSON.parse(raw);
        this.user.set(u);
        const parts = (u.name || 'OD').split(' ');
        this.initials.set(parts.map((p: string) => p[0]).join('').slice(0, 2).toUpperCase());
      }
    } catch {
      /* ignore */
    }
  }
}
