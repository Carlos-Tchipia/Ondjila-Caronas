import { SidebarCta, SidebarMenuItem } from './sidebar.types';

export const PASSENGER_SIDEBAR_MENU: SidebarMenuItem[] = [
  { label: 'Dashboard', icon: '▦', route: '/passenger/home' },
  { label: 'Minhas Viagens', icon: '↗', route: '/passenger/trips' },
  { label: 'Pagamentos', icon: '◎', route: '/passenger/payments' },
  { label: 'Segurança', icon: '🛡', route: '/passenger/security' },
  { label: 'Suporte', icon: '?', route: '/passenger/support' },
];

export const PASSENGER_SIDEBAR_CTA: SidebarCta = {
  label: 'Pedir Viagem',
  route: '/passenger/choose-ride',
  icon: '+',
};
