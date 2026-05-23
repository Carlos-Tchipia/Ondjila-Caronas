import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import { AdminTopbar } from '../../../shared/components/admin-topbar/admin-topbar';
import { ADMIN_SIDEBAR_CTA, ADMIN_SIDEBAR_MENU } from '../../../core/navigation/admin-sidebar.nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-admin-section',
  standalone: true,
  imports: [SidebarLayout, AdminTopbar, TranslatePipe],
  template: `
    <app-sidebar-layout
      [brand]="brand"
      [menu]="menu"
      [cta]="cta"
      userGreetingKey="common.adminGreeting"
      userLocationKey="admin.subtitle"
    >
      <app-admin-topbar appTopbar />
      <div class="ui-card section-placeholder">
        <h1>{{ title() | translate }}</h1>
        <p>{{ description() | translate }}</p>
        <p class="muted">{{ 'admin.sectionDev' | translate }}</p>
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
  readonly title = signal('');
  readonly description = signal('');
  readonly menu = ADMIN_SIDEBAR_MENU;
  readonly cta = ADMIN_SIDEBAR_CTA;
  readonly brand = { titleKey: 'admin.brand', subtitleKey: 'admin.subtitle' };

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    const data = this.route.snapshot.data;
    const titleKey = String(data['titleKey'] || '');
    const descriptionKey = String(data['descriptionKey'] || '');
    this.title.set(titleKey || 'admin.sectionDefault');
    this.description.set(descriptionKey || 'admin.sectionDefaultDesc');
  }
}
