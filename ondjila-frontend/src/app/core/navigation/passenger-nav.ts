import { BottomNavItem } from '../../shared/components/bottom-nav/bottom-nav';

export const PASSENGER_NAV: BottomNavItem[] = [
  { labelKey: 'nav.home', icon: 'H', route: '/passenger/home' },
  { labelKey: 'nav.rides', icon: 'R', route: '/passenger/rides' },
  { labelKey: 'nav.tracking', icon: 'T', route: '/passenger/tracking' },
  { labelKey: 'nav.profile', icon: 'U', route: '/passenger/profile' },
];

export const DRIVER_NAV: BottomNavItem[] = [
  { labelKey: 'nav.home', icon: 'H', route: '/driver/home' },
  { labelKey: 'nav.earnings', icon: 'E', route: '/driver/earnings' },
  { labelKey: 'nav.liveMap', icon: 'L', route: '/driver/live' },
  { labelKey: 'nav.profile', icon: 'U', route: '/driver/profile' },
];
