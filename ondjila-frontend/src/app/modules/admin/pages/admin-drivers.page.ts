import { Component, OnInit, computed, signal } from '@angular/core';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import { AdminTopbar } from '../../../shared/components/admin-topbar/admin-topbar';
import { ADMIN_SIDEBAR_CTA, ADMIN_SIDEBAR_MENU } from '../../../core/navigation/admin-sidebar.nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { AdminDriver, AdminDriversResponse } from '../../../core/services/admin/admin.types';
import { AdminApiService } from '../../../core/services/admin/admin-api.service';

@Component({
  selector: 'app-admin-drivers',
  standalone: true,
  imports: [SidebarLayout, AdminTopbar, TranslatePipe],
  templateUrl: './admin-drivers.page.html',
  styleUrl: './admin-drivers.page.scss',
})
export class AdminDriversPage implements OnInit {
  readonly menu = ADMIN_SIDEBAR_MENU;
  readonly cta = ADMIN_SIDEBAR_CTA;
  readonly brand = { titleKey: 'admin.brand', subtitleKey: 'admin.subtitle' };
  readonly tab = signal<'pending' | 'approved' | 'rejected' | 'suspended'>('pending');
  readonly search = signal('');
  readonly loading = signal(true);
  readonly actionId = signal<number | null>(null);
  readonly notice = signal<{ kind: 'success' | 'error'; text: string } | null>(null);
  readonly summary = signal<AdminDriversResponse['summary']>({
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
    online: 0,
    total: 0,
  });
  readonly drivers = signal<AdminDriver[]>([]);
  readonly filteredDrivers = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.drivers().filter((driver) => {
      const matchesStatus = driver.approval_status === this.tab();
      const searchable = `${driver.name} ${driver.email} ${driver.plate} ${driver.vehicle}`.toLowerCase();
      return matchesStatus && (!term || searchable.includes(term));
    });
  });
  readonly approvalRate = computed(() => {
    const summary = this.summary();
    return summary.total > 0 ? Math.round((summary.approved / summary.total) * 100) : 0;
  });

  constructor(private readonly adminApi: AdminApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.adminApi.drivers().subscribe({
      next: (res) => {
        this.summary.set(res.data?.summary ?? this.summary());
        this.drivers.set(res.data?.drivers ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  decide(driver: AdminDriver, action: 'approve' | 'reject' | 'suspend' | 'reactivate'): void {
    this.actionId.set(driver.id);
    this.adminApi.decideDriver(driver.id, action).subscribe({
      next: (res) => {
        const updated = res.data?.driver;
        if (updated) {
          this.drivers.update((drivers) => drivers.map((item) => item.id === updated.id ? updated : item));
        }
        if (res.data?.summary) {
          this.summary.set(res.data.summary);
        }
        this.actionId.set(null);
        this.showNotice('success', 'Estado do motorista atualizado.');
      },
      error: (err) => {
        this.actionId.set(null);
        this.showNotice('error', err.error?.message || 'Não foi possível atualizar o motorista.');
      },
    });
  }

  private showNotice(kind: 'success' | 'error', text: string): void {
    this.notice.set({ kind, text });
    setTimeout(() => this.notice.set(null), 3500);
  }

  avatarColor(index: number): string {
    const colors = ['#059669', '#2563eb', '#7c3aed', '#ea580c', '#0f766e'];
    return colors[index % colors.length];
  }
}
