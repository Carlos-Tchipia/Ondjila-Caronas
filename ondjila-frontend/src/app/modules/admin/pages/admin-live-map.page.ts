import { Component } from '@angular/core';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import { AdminTopbar } from '../../../shared/components/admin-topbar/admin-topbar';
import { ADMIN_SIDEBAR_CTA, ADMIN_SIDEBAR_MENU } from '../../../core/navigation/admin-sidebar.nav';

@Component({
  selector: 'app-admin-live-map',
  standalone: true,
  imports: [SidebarLayout, AdminTopbar],
  template: `
    <app-sidebar-layout [brand]="brand" [menu]="menu" [cta]="cta" userGreeting="Admin" userLocation="Live Map">
      <app-admin-topbar appTopbar />
      <div class="ui-card map-full">
        <h1>Live Map View</h1>
        <p>Vista em tempo real da frota em Luanda (integração WebSocket v1.1).</p>
        <div class="map-placeholder" role="img" aria-label="Mapa ao vivo"></div>
      </div>
    </app-sidebar-layout>
  `,
  styles: `
    .map-full { margin: var(--space-6); }
    .map-placeholder {
      height: min(60vh, 500px);
      margin-top: var(--space-4);
      border-radius: var(--rounded-xl);
      background: linear-gradient(160deg, #0f172a, #059669);
    }
  `,
})
export class AdminLiveMapPage {
  readonly menu = ADMIN_SIDEBAR_MENU;
  readonly cta = ADMIN_SIDEBAR_CTA;
  readonly brand = { title: 'Ondjila Admin', subtitle: 'Luanda Fleet Backoffice' };
}
