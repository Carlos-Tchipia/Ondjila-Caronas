import { Component } from '@angular/core';
import { SidebarLayout } from '../../../shared/layouts/sidebar-layout/sidebar-layout';
import { AdminTopbar } from '../../../shared/components/admin-topbar/admin-topbar';
import { ADMIN_SIDEBAR_CTA, ADMIN_SIDEBAR_MENU } from '../../../core/navigation/admin-sidebar.nav';

@Component({
  selector: 'app-admin-support',
  standalone: true,
  imports: [SidebarLayout, AdminTopbar],
  templateUrl: './admin-support.page.html',
  styleUrl: './admin-support.page.scss',
})
export class AdminSupportPage {
  readonly menu = ADMIN_SIDEBAR_MENU;
  readonly cta = ADMIN_SIDEBAR_CTA;
  readonly brand = { title: 'Ondjila Admin', subtitle: 'Luanda Fleet Backoffice' };
}
