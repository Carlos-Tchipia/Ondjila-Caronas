import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ShellPage } from '../../../shared/layouts/shell-page/shell-page';
import { BottomNav } from '../../../shared/components/bottom-nav/bottom-nav';
import { PASSENGER_NAV } from '../../../core/navigation/passenger-nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslateService } from '../../../core/i18n/translate.service';

interface ChatMessage {
  from: 'driver' | 'me';
  textKey?: string;
  text?: string;
  time: string;
}

@Component({
  selector: 'app-passenger-chat',
  standalone: true,
  imports: [ShellPage, BottomNav, FormsModule, TranslatePipe],
  templateUrl: './passenger-chat.page.html',
  styleUrl: './passenger-pages.scss',
})
export class PassengerChatPage {
  readonly nav = PASSENGER_NAV;
  readonly messages = signal<ChatMessage[]>([
    { from: 'driver', textKey: 'passenger.chatDriverSample', time: '14:02' },
    { from: 'me', textKey: 'passenger.chatPassengerSample', time: '14:03' },
  ]);
  draft = '';

  constructor(private readonly translate: TranslateService) {}

  send(): void {
    const text = this.draft.trim();
    if (!text) return;
    this.messages.update((m) => [...m, { from: 'me', text, time: this.translate.t('common.now') }]);
    this.draft = '';
  }
}
