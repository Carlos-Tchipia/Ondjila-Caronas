import { Component, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarBrand, SidebarCta, SidebarMenuItem } from '../../../core/navigation/sidebar.types';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LocaleControls } from '../../components/locale-controls/locale-controls';

@Component({
  selector: 'app-sidebar-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe, LocaleControls],
  templateUrl: './sidebar-layout.html',
  styleUrl: './sidebar-layout.scss',
})
export class SidebarLayout implements OnInit {
  readonly brand = input.required<SidebarBrand>();
  readonly menu = input.required<SidebarMenuItem[]>();
  readonly cta = input<SidebarCta | null>(null);
  readonly userGreetingKey = input('common.passengerGreeting');
  readonly userLocationKey = input('common.locationDefault');
  readonly footerLinks = input<{ labelKey: string; route: string }[]>([
    { labelKey: 'common.privacy', route: '/' },
    { labelKey: 'common.terms', route: '/' },
    { labelKey: 'common.help', route: '/' },
    { labelKey: 'common.contact', route: '/' },
  ]);

  readonly initials = signal('OD');

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    try {
      const raw = localStorage.getItem('ondjila_user');
      if (raw) {
        const u = JSON.parse(raw) as { name?: string };
        const parts = (u.name || 'OD').split(' ');
        this.initials.set(parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase());
      }
    } catch {
      /* ignore */
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('ondjila_user');
    void this.router.navigate(['/login']);
  }
}
