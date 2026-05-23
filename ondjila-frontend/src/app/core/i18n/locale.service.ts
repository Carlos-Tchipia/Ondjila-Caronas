import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  AppLang,
  AppTheme,
  LOCALE_STORAGE_KEY,
  THEME_STORAGE_KEY,
} from './locale.types';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly lang = signal<AppLang>('pt');
  readonly theme = signal<AppTheme>('light');

  constructor() {
    if (this.isBrowser) {
      this.hydrate();
    }
  }

  private hydrate(): void {
    const savedLang = localStorage.getItem(LOCALE_STORAGE_KEY) as AppLang | null;
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme | null;

    if (savedLang === 'pt' || savedLang === 'en') {
      this.lang.set(savedLang);
    }

    if (savedTheme === 'light' || savedTheme === 'dark') {
      this.theme.set(savedTheme);
    } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      this.theme.set('dark');
    }

    this.applyLang(this.lang());
    this.applyTheme(this.theme());
  }

  setLang(lang: AppLang): void {
    this.lang.set(lang);
    if (this.isBrowser) {
      localStorage.setItem(LOCALE_STORAGE_KEY, lang);
      this.applyLang(lang);
    }
  }

  toggleLang(): void {
    this.setLang(this.lang() === 'pt' ? 'en' : 'pt');
  }

  setTheme(theme: AppTheme): void {
    this.theme.set(theme);
    if (this.isBrowser) {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      this.applyTheme(theme);
    }
  }

  toggleTheme(): void {
    this.setTheme(this.theme() === 'light' ? 'dark' : 'light');
  }

  private applyLang(lang: AppLang): void {
    document.documentElement.lang = lang === 'pt' ? 'pt' : 'en';
  }

  private applyTheme(theme: AppTheme): void {
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#0f1419' : '#f8fafc');
    }
  }
}
