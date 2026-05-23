import { Injectable, computed, inject, signal } from '@angular/core';
import { en } from './translations/en';
import { pt } from './translations/pt';
import { AppLang } from './locale.types';
import { LocaleService } from './locale.service';

import type { DeepStringTree } from './translation.types';

export type TranslationTree = DeepStringTree<typeof pt>;

const DICTS: Record<AppLang, TranslationTree> = { pt, en };

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private readonly locale = inject(LocaleService);

  /** Bump when language changes so templates re-render */
  readonly version = computed(() => this.locale.lang());

  t(key: string, params?: Record<string, string | number>): string {
    const dict = DICTS[this.locale.lang()];
    let value = this.resolve(dict, key);
    if (value === undefined) {
      value = this.resolve(DICTS.pt, key) ?? key;
    }
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
      });
    }
    return value;
  }

  private resolve(obj: unknown, path: string): string {
    const parts = path.split('.');
    let cur: unknown = obj;
    for (const p of parts) {
      if (cur == null || typeof cur !== 'object') return path;
      cur = (cur as Record<string, unknown>)[p];
    }
    return typeof cur === 'string' ? cur : path;
  }
}
