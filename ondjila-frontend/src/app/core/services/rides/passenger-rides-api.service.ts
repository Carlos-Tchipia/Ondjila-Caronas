import { Injectable } from '@angular/core';
import { ApiClient } from '../../api/api-client.service';
import { ApiEndpoints } from '../../api/api-endpoints';
import { ApiResponse } from '../../api/api-response';
import { PassengerRide, PoolRequest, PoolRequestResult } from './ride-api.types';

@Injectable({
  providedIn: 'root',
})
export class PassengerRidesApiService {
  constructor(private readonly api: ApiClient) {}

  getCurrentRide() {
    return this.api.get<ApiResponse<{ ride: PassengerRide | null }>>(ApiEndpoints.passenger.currentRide);
  }

  requestPool(payload: PoolRequest) {
    return this.api.post<ApiResponse<PoolRequestResult>>(ApiEndpoints.passenger.requestPool, payload);
  }

  cancelPool() {
    return this.api.post<ApiResponse<null>>(ApiEndpoints.passenger.cancelPool, {});
  }
}
