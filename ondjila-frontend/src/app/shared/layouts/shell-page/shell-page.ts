import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-shell-page',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './shell-page.html',
  styleUrl: './shell-page.scss',
})
export class ShellPage {
  /** Plain title (legacy) */
  readonly title = input('');
  readonly subtitle = input('');
  /** i18n keys — preferred */
  readonly titleKey = input('');
  readonly subtitleKey = input('');
  readonly badgeKey = input('');
  readonly backLink = input('/passenger/dashboard');
}
