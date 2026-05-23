import { SidebarCta, SidebarMenuItem } from './sidebar.types';

export const DRIVER_SIDEBAR_MENU: SidebarMenuItem[] = [
  { labelKey: 'nav.home', icon: '▦', route: '/driver/home' },
  { labelKey: 'nav.trips', icon: '↗', route: '/driver/earnings' },
  { labelKey: 'nav.payments', icon: '◎', route: '/driver/payments' },
  { labelKey: 'nav.security', icon: '🛡', route: '/driver/security' },
  { labelKey: 'nav.support', icon: '?', route: '/driver/support' },
];

export const DRIVER_SIDEBAR_CTA: SidebarCta = {
  labelKey: 'nav.liveMap',
  route: '/driver/live',
  icon: '⌖',
};
