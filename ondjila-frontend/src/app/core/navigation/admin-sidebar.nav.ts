import { SidebarCta, SidebarMenuItem } from './sidebar.types';

export const ADMIN_SIDEBAR_MENU: SidebarMenuItem[] = [
  { labelKey: 'nav.overview', icon: '▦', route: '/admin/overview' },
  { labelKey: 'nav.users', icon: '👥', route: '/admin/users' },
  { labelKey: 'nav.drivers', icon: '🚗', route: '/admin/drivers' },
  { labelKey: 'nav.rides', icon: '↗', route: '/admin/rides' },
  { labelKey: 'nav.payments', icon: '◎', route: '/admin/payments' },
  { labelKey: 'nav.reports', icon: '📊', route: '/admin/reports' },
];

export const ADMIN_SIDEBAR_CTA: SidebarCta = {
  labelKey: 'admin.liveMap',
  route: '/admin/live-map',
  icon: '⌖',
};
