import { Injectable } from '@angular/core';
import { ApiClient } from '../../api/api-client.service';
import { ApiEndpoints } from '../../api/api-endpoints';
import { ApiResponse } from '../../api/api-response';
import { AuthSession } from './auth-api.service';

export interface DriverRegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  license_number: string;
  vehicle_plate: string;
  vehicle_type: 'economy' | 'comfort' | 'xl';
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_year?: string;
  vehicle_color?: string;
  vehicle_is_electric?: boolean;
  pool_enabled?: boolean;
  pool_max_passengers?: number;
}

export interface DriverRegisterDocuments {
  doc_license_front: File;
  doc_license_back: File;
  doc_insurance: File;
  doc_id_card: File;
}

@Injectable({
  providedIn: 'root',
})
export class DriverAuthApiService {
  constructor(private readonly api: ApiClient) {}

  register(form: DriverRegisterForm, documents: DriverRegisterDocuments) {
    const payload = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      if (typeof value === 'boolean') {
        payload.append(key, value ? 'true' : 'false');
        return;
      }
      payload.append(key, String(value));
    });

    Object.entries(documents).forEach(([key, file]) => {
      payload.append(key, file, file.name);
    });

    return this.api.postFormData<ApiResponse<AuthSession>>(
      ApiEndpoints.driver.register,
      payload
    );
  }
}
