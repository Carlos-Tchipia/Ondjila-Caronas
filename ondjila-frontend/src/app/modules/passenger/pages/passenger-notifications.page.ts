import { Component, signal } from '@angular/core';
import { ShellPage } from '../../../shared/layouts/shell-page/shell-page';
import { BottomNav } from '../../../shared/components/bottom-nav/bottom-nav';
import { PASSENGER_NAV } from '../../../core/navigation/passenger-nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

interface NotificationItem {
  id: number;
  titleKey: string;
  bodyKey: string;
  timeKey: string;
  unread: boolean;
}

@Component({
  selector: 'app-passenger-notifications',
  standalone: true,
  imports: [ShellPage, BottomNav, TranslatePipe],
  templateUrl: './passenger-notifications.page.html',
  styleUrl: './passenger-pages.scss',
})
export class PassengerNotificationsPage {
  readonly nav = PASSENGER_NAV;
  readonly items = signal<NotificationItem[]>([
    {
      id: 1,
      titleKey: 'passenger.notifDriverEnRoute',
      bodyKey: 'passenger.notifDriverEnRouteBody',
      timeKey: 'passenger.timeAgo2min',
      unread: true,
    },
    {
      id: 2,
      titleKey: 'passenger.notifPoolMatch',
      bodyKey: 'passenger.notifPoolMatchBody',
      timeKey: 'passenger.timeAgo15min',
      unread: true,
    },
    {
      id: 3,
      titleKey: 'passenger.notifPromo',
      bodyKey: 'passenger.notifPromoBody',
      timeKey: 'passenger.timeYesterday',
      unread: false,
    },
  ]);
}
