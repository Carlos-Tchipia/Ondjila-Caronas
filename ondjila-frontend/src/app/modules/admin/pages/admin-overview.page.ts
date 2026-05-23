import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import { AdminTopbar } from '../../../shared/components/admin-topbar/admin-topbar';
import { ADMIN_SIDEBAR_CTA, ADMIN_SIDEBAR_MENU } from '../../../core/navigation/admin-sidebar.nav';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [SidebarLayout, AdminTopbar, RouterLink],
  templateUrl: './admin-overview.page.html',
  styleUrl: './admin-overview.page.scss',
})
export class AdminOverviewPage {
  readonly menu = ADMIN_SIDEBAR_MENU;
  readonly cta = ADMIN_SIDEBAR_CTA;
  readonly brand = { title: 'Ondjila Admin', subtitle: 'Luanda Fleet Backoffice' };

  readonly kpis = [
    { label: 'Viagens Hoje', value: '1.432', trend: '+12.5%', color: 'green' },
    { label: 'Receita Hoje', value: '4.2M Kz', trend: '+8.2%', color: 'blue' },
    { label: 'Motoristas Online', value: '284', trend: '-2.4%', color: 'green', down: true },
    { label: 'Novos Utilizadores', value: '56', trend: '+15.0%', color: 'pink' },
  ];

  readonly activity = [
    { id: '#92841', type: 'Individual', driver: 'João M.', passenger: 'Ana S.', status: 'Concluída', value: '3.400 Kz', ok: true },
    { id: '#92840', type: 'Pool', driver: 'Miguel T.', passenger: 'Carlos P.', status: 'Em Curso', value: '1.850 Kz', progress: true },
    { id: '#92839', type: 'Individual', driver: '—', passenger: 'Sofia L.', status: 'Cancelada', value: '0 Kz', cancel: true },
  ];
}
