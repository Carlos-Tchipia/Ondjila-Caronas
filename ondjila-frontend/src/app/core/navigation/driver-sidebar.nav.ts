import { SidebarCta, SidebarMenuItem } from './sidebar.types';

export const DRIVER_SIDEBAR_MENU: SidebarMenuItem[] = [
  { label: 'Dashboard', icon: '▦', route: '/driver/home' },
  { label: 'Minhas Viagens', icon: '↗', route: '/driver/earnings' },
  { label: 'Pagamentos', icon: '◎', route: '/driver/payments' },
  { label: 'Segurança', icon: '🛡', route: '/driver/security' },
  { label: 'Suporte', icon: '?', route: '/driver/support' },
];

export const DRIVER_SIDEBAR_CTA: SidebarCta = {
  label: 'Mapa ao vivo',
  route: '/driver/live',
  icon: '⌖',
};
