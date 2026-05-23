import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LocaleControls } from '../locale-controls/locale-controls';

@Component({
  selector: 'app-map-app-header',
  standalone: true,
  imports: [RouterLink, TranslatePipe, LocaleControls],
  templateUrl: './map-app-header.html',
  styleUrl: './map-app-header.scss',
})
export class MapAppHeader {
  readonly dark = input(false);

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
