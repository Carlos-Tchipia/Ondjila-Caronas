import { Component } from '@angular/core';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import { AdminTopbar } from '../../../shared/components/admin-topbar/admin-topbar';
import { ADMIN_SIDEBAR_CTA, ADMIN_SIDEBAR_MENU } from '../../../core/navigation/admin-sidebar.nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-admin-live-map',
  standalone: true,
  imports: [SidebarLayout, AdminTopbar, TranslatePipe],
  template: `
    <app-sidebar-layout
      [brand]="brand"
      [menu]="menu"
      [cta]="cta"
      userGreetingKey="common.adminGreeting"
      userLocationKey="admin.liveMap"
    >
      <app-admin-topbar appTopbar />
      <div class="ui-card map-full">
        <h1>{{ 'admin.liveMapTitle' | translate }}</h1>
        <p>{{ 'admin.liveMapSub' | translate }}</p>
        <div class="map-placeholder" role="img" [attr.aria-label]="'admin.liveMapAria' | translate"></div>
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
  readonly brand = { titleKey: 'admin.brand', subtitleKey: 'admin.subtitle' };
}
