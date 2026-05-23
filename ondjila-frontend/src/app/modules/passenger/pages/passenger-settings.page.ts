import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ShellPage } from '../../../shared/layouts/shell-page/shell-page';
import { BottomNav } from '../../../shared/components/bottom-nav/bottom-nav';
import { PASSENGER_NAV } from '../../../core/navigation/passenger-nav';
import { LocaleService } from '../../../core/i18n/locale.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-passenger-settings',
  standalone: true,
  imports: [ShellPage, BottomNav, ReactiveFormsModule, TranslatePipe],
  templateUrl: './passenger-settings.page.html',
  styleUrl: './passenger-pages.scss',
})
export class PassengerSettingsPage {
  readonly nav = PASSENGER_NAV;
  readonly locale = inject(LocaleService);
  readonly poolEnabled = signal(true);
  readonly saved = signal(false);

  save(): void {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
  }
}
