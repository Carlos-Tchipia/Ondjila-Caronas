import { Injectable } from '@angular/core';
import { ApiClient } from '../../api/api-client.service';
import { ApiEndpoints } from '../../api/api-endpoints';
import { ApiResponse } from '../../api/api-response';

export interface WalletBalance {
  balance: number | string;
}

@Injectable({
  providedIn: 'root',
})
export class WalletApiService {
  constructor(private readonly api: ApiClient) {}

  getBalance() {
    return this.api.get<ApiResponse<WalletBalance>>(ApiEndpoints.wallet.balance);
  }
}
