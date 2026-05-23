import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import { AdminTopbar } from '../../../shared/components/admin-topbar/admin-topbar';
import { ADMIN_SIDEBAR_CTA, ADMIN_SIDEBAR_MENU } from '../../../core/navigation/admin-sidebar.nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [SidebarLayout, AdminTopbar, RouterLink, TranslatePipe],
  templateUrl: './admin-overview.page.html',
  styleUrl: './admin-overview.page.scss',
})
export class AdminOverviewPage {
  readonly menu = ADMIN_SIDEBAR_MENU;
  readonly cta = ADMIN_SIDEBAR_CTA;
  readonly brand = { titleKey: 'admin.brand', subtitleKey: 'admin.subtitle' };

  readonly kpis = [
    { labelKey: 'admin.tripsToday', value: '1.432', trend: '+12.5%', color: 'green' },
    { labelKey: 'admin.revenueToday', value: '4.2M Kz', trend: '+8.2%', color: 'blue' },
    { labelKey: 'admin.driversOnline', value: '284', trend: '-2.4%', color: 'green', down: true },
    { labelKey: 'admin.newUsers', value: '56', trend: '+15.0%', color: 'pink' },
  ];

  readonly activity = [
    { id: '#92841', type: 'Individual', driver: 'João M.', passenger: 'Ana S.', statusKey: 'admin.completed', value: '3.400 Kz', ok: true },
    { id: '#92840', type: 'Pool', driver: 'Miguel T.', passenger: 'Carlos P.', statusKey: 'admin.inProgress', value: '1.850 Kz', progress: true },
    { id: '#92839', type: 'Individual', driver: '—', passenger: 'Sofia L.', statusKey: 'admin.cancelled', value: '0 Kz', cancel: true },
  ];
}

