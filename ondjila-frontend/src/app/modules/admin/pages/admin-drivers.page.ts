import { Component, signal } from '@angular/core';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import { AdminTopbar } from '../../../shared/components/admin-topbar/admin-topbar';
import { ADMIN_SIDEBAR_CTA, ADMIN_SIDEBAR_MENU } from '../../../core/navigation/admin-sidebar.nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-admin-drivers',
  standalone: true,
  imports: [SidebarLayout, AdminTopbar, TranslatePipe],
  templateUrl: './admin-drivers.page.html',
  styleUrl: './admin-drivers.page.scss',
})
export class AdminDriversPage {
  readonly menu = ADMIN_SIDEBAR_MENU;
  readonly cta = ADMIN_SIDEBAR_CTA;
  readonly brand = { titleKey: 'admin.brand', subtitleKey: 'admin.subtitle' };
  readonly tab = signal<'pending' | 'approved' | 'rejected'>('pending');

  readonly drivers = [
    { initials: 'AL', color: '#059669', name: 'António Lopes', id: '#92812', plate: 'LD-45-AB', vehicle: 'Toyota Corolla 2023', date: '20 Mai 2026', docs: 3, docsTotal: 4 },
    { initials: 'MC', color: '#2563eb', name: 'Maria Costa', id: '#92811', plate: 'LD-12-CD', vehicle: 'Hyundai Accent 2022', date: '19 Mai 2026', docs: 4, docsTotal: 4 },
    { initials: 'PS', color: '#7c3aed', name: 'Paulo Silva', id: '#92810', plate: 'LD-88-EF', vehicle: 'Nissan Almera 2021', date: '18 Mai 2026', docs: 2, docsTotal: 4 },
    { initials: 'RK', color: '#ea580c', name: 'Rui Kiala', id: '#92809', plate: 'LD-33-GH', vehicle: 'Kia Rio 2020', date: '17 Mai 2026', docs: 4, docsTotal: 4 },
  ];
}

