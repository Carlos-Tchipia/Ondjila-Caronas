import { Component, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarBrand, SidebarCta, SidebarMenuItem } from '../../../core/navigation/sidebar.types';

@Component({
  selector: 'app-sidebar-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar-layout.html',
  styleUrl: './sidebar-layout.scss',
})
export class SidebarLayout implements OnInit {
  readonly brand = input.required<SidebarBrand>();
  readonly menu = input.required<SidebarMenuItem[]>();
  readonly cta = input<SidebarCta | null>(null);
  readonly userGreeting = input('Olá');
  readonly userLocation = input('Luanda, AO');
  readonly footerLinks = input<{ label: string; route: string }[]>([
    { label: 'Privacidade', route: '/' },
    { label: 'Termos', route: '/' },
    { label: 'Ajuda', route: '/' },
    { label: 'Contacto', route: '/' },
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
