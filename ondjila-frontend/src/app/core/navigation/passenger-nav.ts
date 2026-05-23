import { BottomNavItem } from '../../shared/components/bottom-nav/bottom-nav';

export const PASSENGER_NAV: BottomNavItem[] = [
  { labelKey: 'nav.home', icon: '⌂', route: '/passenger/home' },
  { labelKey: 'nav.trips', icon: '↗', route: '/passenger/trips' },
  { labelKey: 'nav.payments', icon: '◎', route: '/passenger/payments' },
  { labelKey: 'nav.profile', icon: '◉', route: '/passenger/profile' },
];

export const DRIVER_NAV: BottomNavItem[] = [
  { labelKey: 'nav.home', icon: '⌂', route: '/driver/home' },
  { labelKey: 'nav.earnings', icon: '◎', route: '/driver/earnings' },
  { labelKey: 'nav.liveMap', icon: '⌖', route: '/driver/live' },
  { labelKey: 'nav.profile', icon: '◉', route: '/driver/profile' },
];
