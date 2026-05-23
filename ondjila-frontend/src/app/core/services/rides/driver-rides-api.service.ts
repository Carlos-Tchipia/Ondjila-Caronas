import { Injectable } from '@angular/core';
import { ApiClient } from '../../api/api-client.service';
import { ApiEndpoints } from '../../api/api-endpoints';
import { ApiResponse } from '../../api/api-response';
import { DriverRide } from './ride-api.types';

@Injectable({
  providedIn: 'root',
})
export class DriverRidesApiService {
  constructor(private readonly api: ApiClient) {}

  getCurrentRide() {
    return this.api.get<ApiResponse<{ ride: DriverRide | null }>>(ApiEndpoints.driver.currentRide);
  }

  getAvailablePools() {
    return this.api.get<ApiResponse<{ pools: DriverRide[] }>>(ApiEndpoints.driver.availablePools);
  }

  acceptPool(poolGroupId: number) {
    return this.api.post<ApiResponse<null>>(ApiEndpoints.driver.acceptPool, { pool_group_id: poolGroupId });
  }

  startRide(poolGroupId: number) {
    return this.api.post<ApiResponse<null>>(ApiEndpoints.driver.startRide, { pool_group_id: poolGroupId });
  }

  completeRide(poolGroupId: number) {
    return this.api.post<ApiResponse<null>>(ApiEndpoints.driver.completeRide, { pool_group_id: poolGroupId });
  }

  updateLocation(lat: number, lng: number) {
    return this.api.post<ApiResponse<{ lat: number; lng: number }>>(ApiEndpoints.driver.updateLocation, {
      lat,
      lng,
    });
  }
}
