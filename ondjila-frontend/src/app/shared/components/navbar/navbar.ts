import { Component, HostListener, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LocaleControls } from '../locale-controls/locale-controls';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, TranslatePipe, LocaleControls],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  readonly variant = input<'light' | 'transparent' | 'hero'>('transparent');
  scrolled = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 24;
  }
}
