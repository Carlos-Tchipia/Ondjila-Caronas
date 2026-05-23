import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '../../core/i18n/translate.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly translate = inject(TranslateService);

  transform(key: string, params?: Record<string, string | number>): string {
    this.translate.version();
    return this.translate.t(key, params);
  }
}
