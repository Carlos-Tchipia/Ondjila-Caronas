import { Component, input, inject } from '@angular/core';
import { LocaleService } from '../../../core/i18n/locale.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-locale-controls',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './locale-controls.html',
  styleUrl: './locale-controls.scss',
})
export class LocaleControls {
  readonly variant = input<'default' | 'dark' | 'glass'>('default');
  readonly locale = inject(LocaleService);

  setLang(lang: 'pt' | 'en'): void {
    this.locale.setLang(lang);
  }

  toggleTheme(): void {
    this.locale.toggleTheme();
  }
}
