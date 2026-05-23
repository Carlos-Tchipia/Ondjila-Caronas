import { BottomNavItem } from '../../shared/components/bottom-nav/bottom-nav';

export const PASSENGER_NAV: BottomNavItem[] = [
  { label: 'Início', icon: '⌂', route: '/passenger/home' },
  { label: 'Viagens', icon: '↗', route: '/passenger/trips' },
  { label: 'Pagamentos', icon: '◎', route: '/passenger/payments' },
  { label: 'Perfil', icon: '◉', route: '/passenger/profile' },
];

export const DRIVER_NAV: BottomNavItem[] = [
  { label: 'Início', icon: '⌂', route: '/driver/home' },
  { label: 'Ganhos', icon: '◎', route: '/driver/earnings' },
  { label: 'Mapa', icon: '⌖', route: '/driver/live' },
  { label: 'Perfil', icon: '◉', route: '/driver/profile' },
];
