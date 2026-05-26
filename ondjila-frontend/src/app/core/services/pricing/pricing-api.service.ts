import { Injectable } from '@angular/core';
import { ApiClient } from '../../api/api-client.service';
import { ApiEndpoints } from '../../api/api-endpoints';
import { ApiResponse } from '../../api/api-response';
import { PricingControls, PricingMetrics, PricingQuote, PricingQuoteCatalog, PricingQuoteRequest } from './pricing.types';

@Injectable({
  providedIn: 'root',
})
export class PricingApiService {
  constructor(private readonly api: ApiClient) {}

  quote(payload: PricingQuoteRequest) {
    return this.api.post<ApiResponse<{ quote: PricingQuote; quotes: PricingQuoteCatalog }>>(ApiEndpoints.pricing.quote, payload);
  }

  adminDashboard() {
    return this.api.get<ApiResponse<{ controls: PricingControls; metrics: PricingMetrics }>>(ApiEndpoints.admin.pricing);
  }

  updateControls(payload: Partial<PricingControls>) {
    return this.api.post<ApiResponse<{ controls: PricingControls }>>(ApiEndpoints.admin.pricing, payload);
  }
}
