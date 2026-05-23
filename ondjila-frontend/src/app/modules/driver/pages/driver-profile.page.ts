import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ShellPage } from '../../../shared/layouts/shell-page/shell-page';
import { BottomNav } from '../../../shared/components/bottom-nav/bottom-nav';
import { DRIVER_NAV } from '../../../core/navigation/passenger-nav';

@Component({
  selector: 'app-driver-profile',
  standalone: true,
  imports: [ShellPage, BottomNav, RouterLink],
  templateUrl: './driver-profile.page.html',
  styleUrl: '../../passenger/pages/passenger-pages.scss',
})
export class DriverProfilePage {
  readonly nav = DRIVER_NAV;
  readonly user = signal<{ name?: string; email?: string } | null>(null);

  constructor() {
    try {
      const raw = localStorage.getItem('ondjila_user');
      if (raw) this.user.set(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }
}
