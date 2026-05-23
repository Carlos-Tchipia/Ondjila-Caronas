import { SidebarCta, SidebarMenuItem } from './sidebar.types';

export const PASSENGER_SIDEBAR_MENU: SidebarMenuItem[] = [
  { labelKey: 'nav.home', icon: '▦', route: '/passenger/home' },
  { labelKey: 'nav.trips', icon: '↗', route: '/passenger/trips' },
  { labelKey: 'nav.payments', icon: '◎', route: '/passenger/payments' },
  { labelKey: 'nav.security', icon: '🛡', route: '/passenger/security' },
  { labelKey: 'nav.support', icon: '?', route: '/passenger/support' },
];

export const PASSENGER_SIDEBAR_CTA: SidebarCta = {
  labelKey: 'nav.requestRide',
  route: '/passenger/choose-ride',
  icon: '+',
};
