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
          <button type="button" class="btn btn--ghost">{{ 'common.export' | translate }}</button>
        </div>

        <table class="data-table responsive-table">
          <thead>
            <tr>
              <th>{{ 'admin.item' | translate }}</th>
              <th>{{ 'admin.state' | translate }}</th>
              <th>{{ 'admin.value' | translate }}</th>
              <th>{{ 'admin.action' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.name) {
              <tr>
                <td>{{ row.name }}</td>
                <td><span class="pill pill--green">{{ row.status }}</span></td>
                <td><strong>{{ row.value }}</strong></td>
                <td><button type="button" class="btn btn--ghost btn--sm">{{ 'admin.analyze' | translate }}</button></td>
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
  readonly metrics = signal<{ labelKey: string; value: string; trend: string; good?: boolean }[]>([]);
  readonly rows = signal<{ name: string; status: string; value: string }[]>([]);

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    const data = this.route.snapshot.data;
    const titleKey = String(data['titleKey'] || '');
    const descriptionKey = String(data['descriptionKey'] || '');
    this.title.set(titleKey || 'admin.sectionDefault');
    this.description.set(descriptionKey || 'admin.sectionDefaultDesc');

    if (titleKey === 'nav.users') {
      this.metrics.set([
        { labelKey: 'admin.newUsers', value: '128', trend: '+18%', good: true },
        { labelKey: 'admin.tripsToday', value: '642', trend: '+9%' },
        { labelKey: 'admin.satisfaction', value: '94%', trend: 'AVG', good: true },
      ]);
      this.rows.set([
        { name: 'Ana Ferreira', status: 'Activo', value: '24 viagens' },
        { name: 'Mateus Kiala', status: 'Activo', value: '12 viagens' },
        { name: 'Sofia Manuel', status: 'Novo', value: '2 viagens' },
      ]);
      return;
    }

    if (titleKey === 'nav.rides') {
      this.metrics.set([
        { labelKey: 'admin.tripsToday', value: '642', trend: '+12%', good: true },
        { labelKey: 'admin.poolAnalysis', value: '38%', trend: 'Pool mix' },
        { labelKey: 'admin.revenueToday', value: '1.9M Kz', trend: '+7%', good: true },
      ]);
      this.rows.set([
        { name: '#OD-2042 - Talatona', status: 'Em Curso', value: '4.200 Kz' },
        { name: '#OD-2041 - Mutamba', status: 'Concluida', value: '2.850 Kz' },
        { name: '#OD-2040 - Kilamba Pool', status: 'Activo', value: '5.100 Kz' },
      ]);
      return;
    }

    this.metrics.set([
      { labelKey: 'admin.grossRevenue', value: '14.8M Kz', trend: '+11%', good: true },
      { labelKey: 'admin.commissions', value: '2.4M Kz', trend: '+6%' },
      { labelKey: 'admin.netProfit', value: '7.2M Kz', trend: '+8%', good: true },
    ]);
    this.rows.set([
      { name: 'Wallet Pool Settlement', status: 'Completo', value: '820.000 Kz' },
      { name: 'Multicaixa Reconciliation', status: 'Pendente', value: '240.000 Kz' },
      { name: 'Driver Payout Batch', status: 'Agendado', value: '1.1M Kz' },
    ]);
  }
}
