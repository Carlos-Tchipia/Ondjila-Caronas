import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import { AdminTopbar } from '../../../shared/components/admin-topbar/admin-topbar';
import { ADMIN_SIDEBAR_CTA, ADMIN_SIDEBAR_MENU } from '../../../core/navigation/admin-sidebar.nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { AdminApiService } from '../../../core/services/admin/admin-api.service';
import { AdminSectionMetric, AdminSectionRow } from '../../../core/services/admin/admin.types';

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
      <header class="workspace-hero">
        <div>
          <span class="badge">{{ 'shell.badgeAdmin' | translate }}</span>
          <h1>{{ title() | translate }}</h1>
          <p>{{ description() | translate }}</p>
        </div>
      </header>

      <section class="product-grid product-grid--three">
        @for (metric of metrics(); track metric.labelKey) {
          <article class="kpi-card">
            <div class="kpi-label">{{ metric.labelKey | translate }}</div>
            <div class="kpi-value" [class.kpi-value--green]="metric.good">{{ metric.value }}</div>
            <div class="kpi-trend">{{ metric.trend }}</div>
          </article>
        }
      </section>

      <section class="ui-card admin-workbench">
        <div class="admin-workbench__head">
          <div>
            <h2>{{ title() | translate }}</h2>
            <p>{{ 'admin.sectionWorkbench' | translate }}</p>
          </div>
        </div>

        <table class="data-table responsive-table">
          <thead>
            <tr>
              <th>{{ 'admin.item' | translate }}</th>
              <th>{{ 'admin.state' | translate }}</th>
              <th>{{ 'admin.value' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.name) {
              <tr>
                <td>{{ row.name }}</td>
                <td><span class="pill pill--green">{{ row.status }}</span></td>
                <td><strong>{{ row.value }}</strong></td>
              </tr>
            } @empty {
              <tr>
                <td colspan="3" class="empty-table">{{ loading() ? ('common.loading' | translate) : ('admin.noRealData' | translate) }}</td>
              </tr>
            }
          </tbody>
        </table>
      </section>
    </app-sidebar-layout>
  `,
  styles: `
    .admin-workbench__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }

    .admin-workbench__head h2 {
      margin: 0 0 var(--space-1);
    }

    .admin-workbench__head p {
      margin: 0;
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }

    .btn--sm {
      padding: 8px 12px;
      font-size: var(--text-sm);
    }

    .empty-table {
      text-align: center;
      color: var(--color-text-muted);
      padding: var(--space-6);
    }

    @media (max-width: 720px) {
      .admin-workbench {
        overflow-x: auto;
      }
    }
  `,
})
export class AdminSectionPage implements OnInit {
  readonly title = signal('');
  readonly description = signal('');
  readonly menu = ADMIN_SIDEBAR_MENU;
  readonly cta = ADMIN_SIDEBAR_CTA;
  readonly brand = { titleKey: 'admin.brand', subtitleKey: 'admin.subtitle' };
  readonly loading = signal(true);
  readonly metrics = signal<AdminSectionMetric[]>([]);
  readonly rows = signal<AdminSectionRow[]>([]);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly adminApi: AdminApiService,
  ) {}

  ngOnInit(): void {
    const data = this.route.snapshot.data;
    const titleKey = String(data['titleKey'] || '');
    const descriptionKey = String(data['descriptionKey'] || '');
    this.title.set(titleKey || 'admin.sectionDefault');
    this.description.set(descriptionKey || 'admin.sectionDefaultDesc');

    const section = this.sectionKey(titleKey);
    if (!section) {
      this.loading.set(false);
      return;
    }

    this.adminApi.section(section).subscribe({
      next: (res) => {
        this.metrics.set(res.data?.metrics ?? []);
        this.rows.set(res.data?.rows ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private sectionKey(titleKey: string): 'users' | 'rides' | 'payments' | null {
    if (titleKey === 'nav.users') {
      return 'users';
    }
    if (titleKey === 'nav.rides') {
      return 'rides';
    }
    if (titleKey === 'nav.payments') {
      return 'payments';
    }
    return null;
  }
}
