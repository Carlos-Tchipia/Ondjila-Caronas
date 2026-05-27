import { Injectable } from '@angular/core';
import { ApiClient } from '../../api/api-client.service';
import { ApiEndpoints } from '../../api/api-endpoints';
import { ApiResponse } from '../../api/api-response';
import { ChatMessage, ChatThread } from './chat.types';

@Injectable({
  providedIn: 'root',
})
export class ChatApiService {
  constructor(private readonly api: ApiClient) {}

  messages(rideId?: number) {
    return this.api.getWithParams<ApiResponse<ChatThread>>(ApiEndpoints.chat.messages, {
      ride_id: rideId,
    });
  }

  send(message: string, rideId?: number) {
    return this.api.post<ApiResponse<{ message: ChatMessage }>>(ApiEndpoints.chat.send, {
      message,
      ride_id: rideId,
    });
  }
}
