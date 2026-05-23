import { Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-map-app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './map-app-header.html',
  styleUrl: './map-app-header.scss',
})
export class MapAppHeader {
  readonly dark = input(false);
  readonly lang = signal<'PT' | 'EN'>('PT');

  toggleLang(): void {
    this.lang.update((v) => (v === 'PT' ? 'EN' : 'PT'));
  }

  userInitials(): string {
    try {
      const raw = localStorage.getItem('ondjila_user');
      if (!raw) return 'OD';
      const u = JSON.parse(raw) as { name?: string };
      return (u.name || 'OD')
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    } catch {
      return 'OD';
    }
  }
}
