import { SidebarCta, SidebarMenuItem } from './sidebar.types';

export const ADMIN_SIDEBAR_MENU: SidebarMenuItem[] = [
  { labelKey: 'nav.overview', icon: 'O', route: '/admin/overview' },
  { labelKey: 'nav.users', icon: 'U', route: '/admin/users' },
  { labelKey: 'nav.drivers', icon: 'D', route: '/admin/drivers' },
  { labelKey: 'nav.rides', icon: 'R', route: '/admin/rides' },
  { labelKey: 'nav.payments', icon: '$', route: '/admin/payments' },
  { labelKey: 'nav.reports', icon: 'A', route: '/admin/reports' },
];

export const ADMIN_SIDEBAR_CTA: SidebarCta = {
  labelKey: 'admin.liveMap',
  route: '/admin/live-map',
  icon: 'L',
};
