import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import { AdminTopbar } from '../../../shared/components/admin-topbar/admin-topbar';
import { ADMIN_SIDEBAR_CTA, ADMIN_SIDEBAR_MENU } from '../../../core/navigation/admin-sidebar.nav';

@Component({
  selector: 'app-admin-section',
  standalone: true,
  imports: [SidebarLayout, AdminTopbar],
  template: `
    <app-sidebar-layout [brand]="brand" [menu]="menu" [cta]="cta" userGreeting="Admin" userLocation="Backoffice">
      <app-admin-topbar appTopbar />
      <div class="ui-card section-placeholder">
        <h1>{{ title() }}</h1>
        <p>{{ description() }}</p>
        <p class="muted">Módulo em desenvolvimento — dados ligados à API em breve.</p>
      </div>
    </app-sidebar-layout>
  `,
  styles: `
    .section-placeholder {
      margin: var(--space-6);
      h1 { margin-bottom: var(--space-2); }
      .muted { color: var(--color-text-muted); font-size: var(--text-sm); margin-top: var(--space-4); }
    }
  `,
})
export class AdminSectionPage implements OnInit {
  readonly title = signal('Secção');
  readonly description = signal('Gestão e monitorização.');
  readonly menu = ADMIN_SIDEBAR_MENU;
  readonly cta = ADMIN_SIDEBAR_CTA;
  readonly brand = { title: 'Ondjila Admin', subtitle: 'Luanda Fleet Backoffice' };

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    const data = this.route.snapshot.data;
    if (data['title']) this.title.set(String(data['title']));
    if (data['description']) this.description.set(String(data['description']));
  }
}
