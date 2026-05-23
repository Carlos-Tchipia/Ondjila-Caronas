import { Injectable } from '@angular/core';
import { ApiClient } from '../../api/api-client.service';
import { ApiEndpoints } from '../../api/api-endpoints';
import { ApiResponse } from '../../api/api-response';
import { PoolDetails } from '../../models/pool.types';

@Injectable({
  providedIn: 'root',
})
export class PoolApiService {
  constructor(private readonly api: ApiClient) {}

  getDetails(poolGroupId: number) {
    return this.api.get<ApiResponse<{ pool: PoolDetails }>>(
      `${ApiEndpoints.pool.details}?pool_group_id=${poolGroupId}`
    );
  }

  confirm(poolGroupId: number) {
    return this.api.post<ApiResponse<{ confirmed: boolean; pool: PoolDetails }>>(
      ApiEndpoints.pool.confirm,
      { pool_group_id: poolGroupId }
    );
  }
}
