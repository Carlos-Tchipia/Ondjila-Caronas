import { SidebarCta, SidebarMenuItem } from './sidebar.types';

export const DRIVER_SIDEBAR_MENU: SidebarMenuItem[] = [
  { labelKey: 'nav.home', icon: 'H', route: '/driver/home' },
  { labelKey: 'nav.liveMap', icon: 'L', route: '/driver/live' },
  { labelKey: 'nav.rides', icon: 'R', route: '/driver/earnings' },
  { labelKey: 'nav.wallet', icon: 'W', route: '/driver/wallet' },
  { labelKey: 'nav.payments', icon: '$', route: '/driver/payments' },
  { labelKey: 'nav.profile', icon: 'U', route: '/driver/profile' },
  { labelKey: 'nav.support', icon: '?', route: '/driver/support' },
];

export const DRIVER_SIDEBAR_CTA: SidebarCta = {
  labelKey: 'nav.liveMap',
  route: '/driver/live',
  icon: 'L',
};
