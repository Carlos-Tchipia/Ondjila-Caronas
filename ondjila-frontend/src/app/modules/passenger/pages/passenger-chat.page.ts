import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ShellPage } from '../../../shared/layouts/shell-page/shell-page';
import { BottomNav } from '../../../shared/components/bottom-nav/bottom-nav';
import { PASSENGER_NAV } from '../../../core/navigation/passenger-nav';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ChatApiService } from '../../../core/services/chat/chat-api.service';
import { ChatMessage, ChatRide } from '../../../core/services/chat/chat.types';

@Component({
  selector: 'app-passenger-chat',
  standalone: true,
  imports: [ShellPage, BottomNav, FormsModule, TranslatePipe],
  templateUrl: './passenger-chat.page.html',
  styleUrl: './passenger-pages.scss',
})
export class PassengerChatPage implements OnInit, OnDestroy {
  readonly nav = PASSENGER_NAV;
  readonly messages = signal<ChatMessage[]>([]);
  readonly ride = signal<ChatRide | null>(null);
  readonly loading = signal(true);
  readonly sending = signal(false);
  draft = '';

  private pollInterval?: ReturnType<typeof setInterval>;

  constructor(private readonly chatApi: ChatApiService) {}

  ngOnInit(): void {
    this.loadMessages();
    this.pollInterval = setInterval(() => this.loadMessages(false), 3000);
  }

  ngOnDestroy(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  send(): void {
    const text = this.draft.trim();
    if (!text) return;

    this.sending.set(true);
    this.chatApi.send(text, this.ride()?.id).subscribe({
      next: (res) => {
        const message = res.data?.message;
        if (message) {
          this.messages.update((messages) => [...messages, message]);
        }
        this.draft = '';
        this.sending.set(false);
      },
      error: () => this.sending.set(false),
    });
  }

  private loadMessages(showLoading = true): void {
    if (showLoading) this.loading.set(true);

    this.chatApi.messages(this.ride()?.id).subscribe({
      next: (res) => {
        this.ride.set(res.data?.ride ?? null);
        this.messages.set(res.data?.messages ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
