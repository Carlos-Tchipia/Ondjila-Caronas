import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ShellPage } from '../../../shared/layouts/shell-page/shell-page';
import { BottomNav } from '../../../shared/components/bottom-nav/bottom-nav';
import { PASSENGER_NAV } from '../../../core/navigation/passenger-nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-passenger-rate',
  standalone: true,
  imports: [ShellPage, BottomNav, TranslatePipe],
  templateUrl: './passenger-rate.page.html',
  styleUrl: './passenger-pages.scss',
})
export class PassengerRatePage {
  readonly nav = PASSENGER_NAV;
  readonly stars = signal(0);
  readonly comment = signal('');

  constructor(private readonly router: Router) {}

  setStars(n: number): void {
    this.stars.set(n);
  }

  submit(): void {
    void this.router.navigate(['/passenger/trips']);
  }
}
