import { Component } from '@angular/core';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import {
  PASSENGER_SIDEBAR_CTA,
  PASSENGER_SIDEBAR_MENU,
} from '../../../core/navigation/passenger-sidebar.nav';

@Component({
  selector: 'app-passenger-security',
  standalone: true,
  imports: [SidebarLayout],
  template: `
    <app-sidebar-layout [brand]="brand" [menu]="menu" [cta]="cta" userGreeting="Olá, Passageiro">
      <header class="page-topbar" appTopbar>
        <div>
          <h1>Segurança</h1>
          <p>Contactos de emergência, partilha de viagem e verificação de motoristas.</p>
        </div>
      </header>
      <div class="ui-card">
        <h2>Centro de Segurança Ondjila</h2>
        <ul class="sec-list">
          <li>🆘 Botão SOS (em breve na app móvel)</li>
          <li>📍 Partilhar viagem em tempo real</li>
          <li>✓ Motoristas com documentação validada</li>
          <li>🛡 Pool com rotas monitorizadas</li>
        </ul>
      </div>
    </app-sidebar-layout>
  `,
  styles: `
    .page-topbar { padding: var(--space-5) var(--space-6); }
    .sec-list { margin: 1rem 0 0; padding-left: 0; list-style: none; line-height: 2; }
  `,
})
export class PassengerSecurityPage {
  readonly menu = PASSENGER_SIDEBAR_MENU;
  readonly cta = PASSENGER_SIDEBAR_CTA;
  readonly brand = { title: 'Ondjila' };
}
