import { Component, signal } from '@angular/core';
import { ShellPage } from '../../../shared/layouts/shell-page/shell-page';
import { BottomNav } from '../../../shared/components/bottom-nav/bottom-nav';
import { PASSENGER_NAV } from '../../../core/navigation/passenger-nav';

interface NotificationItem {
  id: number;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

@Component({
  selector: 'app-passenger-notifications',
  standalone: true,
  imports: [ShellPage, BottomNav],
  templateUrl: './passenger-notifications.page.html',
  styleUrl: './passenger-pages.scss',
})
export class PassengerNotificationsPage {
  readonly nav = PASSENGER_NAV;
  readonly items = signal<NotificationItem[]>([
    { id: 1, title: 'Motorista a caminho', body: 'João aceitou a tua carona.', time: 'Há 2 min', unread: true },
    { id: 2, title: 'Match de pool', body: 'Encontrámos um parceiro na tua rota.', time: 'Há 15 min', unread: true },
    { id: 3, title: 'Promoção', body: '10% de desconto na próxima viagem.', time: 'Ontem', unread: false },
  ]);
}
