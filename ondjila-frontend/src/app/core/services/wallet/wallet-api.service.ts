import { Injectable } from '@angular/core';
import { ApiClient } from '../../api/api-client.service';
import { ApiEndpoints } from '../../api/api-endpoints';
import { ApiResponse } from '../../api/api-response';

export interface WalletBalance {
  balance: number | string;
}

export interface WalletTopUpResult {
  amount: number;
  balance: number;
}

export interface WalletTransaction {
  id: number;
  ride_id: number | null;
  type: string;
  amount: number;
  balance_after: number;
  description: string;
  status: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class WalletApiService {
  constructor(private readonly api: ApiClient) {}

  getBalance() {
    return this.api.get<ApiResponse<WalletBalance>>(ApiEndpoints.wallet.balance);
  }

  topUp(amount: number, method: 'multicaixa' | 'bank_transfer' = 'multicaixa') {
    return this.api.post<ApiResponse<WalletTopUpResult>>(ApiEndpoints.wallet.topUp, {
      amount,
      method,
    });
  }

  getTransactions() {
    return this.api.get<ApiResponse<{ transactions: WalletTransaction[] }>>(ApiEndpoints.wallet.transactions);
  }
}
