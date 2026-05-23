import { Component } from '@angular/core';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import { AdminTopbar } from '../../../shared/components/admin-topbar/admin-topbar';
import { ADMIN_SIDEBAR_CTA, ADMIN_SIDEBAR_MENU } from '../../../core/navigation/admin-sidebar.nav';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [SidebarLayout, AdminTopbar],
  templateUrl: './admin-reports.page.html',
  styleUrl: './admin-reports.page.scss',
})
export class AdminReportsPage {
  readonly menu = ADMIN_SIDEBAR_MENU;
  readonly cta = ADMIN_SIDEBAR_CTA;
  readonly brand = { title: 'Ondjila Admin', subtitle: 'Luanda Fleet Backoffice' };

  readonly metrics = [
    { label: 'Receita Bruta', value: '12.450.000 Kz', trend: '+12.4%' },
    { label: 'Comissões', value: '1.867.500 Kz', trend: '+5.2%' },
    { label: 'Lucro Líquido', value: '10.582.500 Kz', trend: '+18.1%', highlight: true },
  ];

  readonly bairros = [
    { name: 'Talatona', trips: '4.2k viagens', pct: 100 },
    { name: 'Maianga', trips: '3.8k viagens', pct: 90 },
    { name: 'Kilamba', trips: '3.1k viagens', pct: 74 },
    { name: 'Alvalade', trips: '2.4k viagens', pct: 57 },
    { name: 'Samba', trips: '1.9k viagens', pct: 45 },
  ];

  readonly adoptionBars = [40, 55, 50, 60, 90, 45, 70];
  readonly days = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];
}
