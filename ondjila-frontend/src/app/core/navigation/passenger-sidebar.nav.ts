import { SidebarCta, SidebarMenuItem } from './sidebar.types';

export const PASSENGER_SIDEBAR_MENU: SidebarMenuItem[] = [
  { labelKey: 'nav.home', icon: 'H', route: '/passenger/home' },
  { labelKey: 'nav.rides', icon: 'R', route: '/passenger/rides' },
  { labelKey: 'nav.sharedRides', icon: 'P', route: '/passenger/shared-rides' },
  { labelKey: 'nav.tracking', icon: 'T', route: '/passenger/tracking' },
  { labelKey: 'nav.history', icon: 'Y', route: '/passenger/history' },
  { labelKey: 'nav.wallet', icon: 'W', route: '/passenger/wallet' },
  { labelKey: 'nav.payments', icon: '$', route: '/passenger/payments' },
  { labelKey: 'nav.profile', icon: 'U', route: '/passenger/profile' },
  { labelKey: 'nav.settings', icon: 'S', route: '/passenger/settings' },
  { labelKey: 'nav.support', icon: '?', route: '/passenger/support' },
];

export const PASSENGER_SIDEBAR_CTA: SidebarCta = {
  labelKey: 'nav.requestRide',
  route: '/passenger/choose-ride',
  icon: '+',
};
