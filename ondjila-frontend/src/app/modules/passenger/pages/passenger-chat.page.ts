import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ShellPage } from '../../../shared/layouts/shell-page/shell-page';
import { BottomNav } from '../../../shared/components/bottom-nav/bottom-nav';
import { PASSENGER_NAV } from '../../../core/navigation/passenger-nav';

@Component({
  selector: 'app-passenger-chat',
  standalone: true,
  imports: [ShellPage, BottomNav, FormsModule],
  templateUrl: './passenger-chat.page.html',
  styleUrl: './passenger-pages.scss',
})
export class PassengerChatPage {
  readonly nav = PASSENGER_NAV;
  readonly messages = signal([
    { from: 'driver', text: 'Olá! Estou a 3 minutos do ponto de recolha.', time: '14:02' },
    { from: 'me', text: 'Perfeito, estou na Marginal.', time: '14:03' },
  ]);
  draft = '';

  send(): void {
    const text = this.draft.trim();
    if (!text) return;
    this.messages.update((m) => [...m, { from: 'me', text, time: 'Agora' }]);
    this.draft = '';
  }
}
