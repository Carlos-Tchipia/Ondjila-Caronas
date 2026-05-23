import { SidebarCta, SidebarMenuItem } from './sidebar.types';

export const ADMIN_SIDEBAR_MENU: SidebarMenuItem[] = [
  { label: 'Overview', icon: '▦', route: '/admin/overview' },
  { label: 'Users', icon: '👥', route: '/admin/users' },
  { label: 'Drivers', icon: '🚗', route: '/admin/drivers' },
  { label: 'Rides', icon: '↗', route: '/admin/rides' },
  { label: 'Payments', icon: '◎', route: '/admin/payments' },
  { label: 'Reports', icon: '📊', route: '/admin/reports' },
];

export const ADMIN_SIDEBAR_CTA: SidebarCta = {
  label: 'Live Map View',
  route: '/admin/live-map',
  icon: '⌖',
};
