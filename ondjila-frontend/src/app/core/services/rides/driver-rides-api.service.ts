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

  getAvailableRides() {
    return this.api.get<ApiResponse<{ rides: DriverRide[] }>>(ApiEndpoints.driver.availableRides);
  }

  acceptRide(rideId: number) {
    return this.api.post<ApiResponse<null>>(ApiEndpoints.driver.acceptRide, { ride_id: rideId });
  }

  acceptPool(poolGroupId: number) {
    return this.api.post<ApiResponse<null>>(ApiEndpoints.driver.acceptPool, { pool_group_id: poolGroupId });
  }

  startRide(ride: DriverRide) {
    const body = ride.ride_type === 'individual'
      ? { ride_id: ride.id }
      : { pool_group_id: ride.id };
    return this.api.post<ApiResponse<null>>(ApiEndpoints.driver.startRide, body);
  }

  completeRide(ride: DriverRide) {
    const body = ride.ride_type === 'individual'
      ? { ride_id: ride.id }
      : { pool_group_id: ride.id };
    return this.api.post<ApiResponse<null>>(ApiEndpoints.driver.completeRide, body);
  }

  updateLocation(lat: number, lng: number) {
    return this.api.post<ApiResponse<{ lat: number; lng: number }>>(ApiEndpoints.driver.updateLocation, {
      lat,
      lng,
    });
  }
}
