import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import { AdminTopbar } from '../../../shared/components/admin-topbar/admin-topbar';
import { ADMIN_SIDEBAR_CTA, ADMIN_SIDEBAR_MENU } from '../../../core/navigation/admin-sidebar.nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { AdminApiService } from '../../../core/services/admin/admin-api.service';
import { AdminReport } from '../../../core/services/admin/admin.types';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [SidebarLayout, AdminTopbar, TranslatePipe, FormsModule],
  templateUrl: './admin-reports.page.html',
  styleUrl: './admin-reports.page.scss',
})
export class AdminReportsPage implements OnInit {
  readonly menu = ADMIN_SIDEBAR_MENU;
  readonly cta = ADMIN_SIDEBAR_CTA;
  readonly brand = { titleKey: 'admin.brand', subtitleKey: 'admin.subtitle' };
  readonly loading = signal(false);
  readonly downloadingPdf = signal(false);
  readonly report = signal<AdminReport | null>(null);
  readonly startDate = signal(this.monthStart());
  readonly endDate = signal(this.today());

  constructor(private readonly adminApi: AdminApiService) {}

  ngOnInit(): void {
    this.generateReport();
  }

  generateReport(): void {
    this.loading.set(true);
    this.adminApi.reports(this.startDate(), this.endDate()).subscribe({
      next: (res) => {
        this.report.set(res.data ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  downloadCsv(): void {
    const current = this.report();
    if (!current) {
      return;
    }

    const lines = [
      ['periodo_inicio', current.range.start_date],
      ['periodo_fim', current.range.end_date],
      ['dias', current.range.days],
      ['total_corridas', current.totals.total_rides],
      ['corridas_concluidas', current.totals.completed_rides],
      ['corridas_pool', current.totals.pool_rides],
      ['corridas_individuais', current.totals.individual_rides],
      ['adocao_pool_pct', current.totals.pool_adoption_pct],
      ['co2_ton', current.totals.co2_saved_ton],
      ['avaliacao_media', current.totals.average_rating],
      ...current.metrics.map((metric) => [metric.key, metric.formatted]),
    ];
    const csv = lines.map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ondjila-admin-report-${current.range.start_date}-${current.range.end_date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  downloadPdf(): void {
    this.downloadingPdf.set(true);
    this.adminApi.reportPdf(this.startDate(), this.endDate()).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ondjila-admin-report-${this.startDate()}-${this.endDate()}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        this.downloadingPdf.set(false);
      },
      error: () => this.downloadingPdf.set(false),
    });
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private monthStart(): string {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
  }
}
