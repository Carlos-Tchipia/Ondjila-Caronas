import { Injectable } from '@angular/core';
import { ApiClient } from '../../api/api-client.service';
import { ApiEndpoints } from '../../api/api-endpoints';
import { ApiResponse } from '../../api/api-response';
import {
  AdminDriverDecisionResponse,
  AdminDriversResponse,
  AdminLiveMapResponse,
  AdminOverview,
  AdminReport,
  AdminSectionResponse,
} from './admin.types';

@Injectable({
  providedIn: 'root',
})
export class AdminApiService {
  constructor(private readonly api: ApiClient) {}

  overview() {
    return this.api.get<ApiResponse<AdminOverview>>(ApiEndpoints.admin.overview);
  }

  reports(startDate: string, endDate: string) {
    return this.api.getWithParams<ApiResponse<AdminReport>>(ApiEndpoints.admin.reports, {
      start_date: startDate,
      end_date: endDate,
    });
  }

  reportPdf(startDate: string, endDate: string) {
    return this.api.getBlobWithParams(ApiEndpoints.admin.reportsPdf, {
      start_date: startDate,
      end_date: endDate,
    });
  }

  drivers() {
    return this.api.get<ApiResponse<AdminDriversResponse>>(ApiEndpoints.admin.drivers);
  }

  decideDriver(driverId: number, action: 'approve' | 'reject' | 'suspend' | 'reactivate') {
    return this.api.post<ApiResponse<AdminDriverDecisionResponse>>(ApiEndpoints.admin.driverDecision, {
      driver_id: driverId,
      action,
    });
  }

  liveMap() {
    return this.api.get<ApiResponse<AdminLiveMapResponse>>(ApiEndpoints.admin.liveMap);
  }

  section(section: 'users' | 'rides' | 'payments') {
    return this.api.getWithParams<ApiResponse<AdminSectionResponse>>(ApiEndpoints.admin.section, { section });
  }
}
