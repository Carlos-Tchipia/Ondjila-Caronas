import { Injectable } from '@angular/core';
import { ApiClient } from '../../api/api-client.service';
import { ApiEndpoints } from '../../api/api-endpoints';
import { ApiResponse } from '../../api/api-response';

export interface AuthUser {
  id: number | string;
  name: string;
  email: string;
  role: 'passenger' | 'driver' | 'admin' | string;
  avatar_url?: string | null;
}

export interface AuthSession {
  access_token: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetCode {
  reset_code: string;
  expires_in_minutes: number;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  new_password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  constructor(private readonly api: ApiClient) {}

  login(payload: LoginRequest) {
    return this.api.post<ApiResponse<AuthSession>>(ApiEndpoints.auth.login, payload);
  }

  register(payload: RegisterRequest) {
    return this.api.post<ApiResponse<AuthSession>>(ApiEndpoints.auth.register, payload);
  }

  requestPasswordReset(payload: PasswordResetRequest) {
    return this.api.post<ApiResponse<PasswordResetCode>>(
      ApiEndpoints.auth.requestPasswordReset,
      payload
    );
  }

  resetPassword(payload: ResetPasswordRequest) {
    return this.api.post<ApiResponse<null>>(ApiEndpoints.auth.resetPassword, payload);
  }

  me() {
    return this.api.get<ApiResponse<{ user: AuthUser }>>(ApiEndpoints.auth.me);
  }

  storeSession(session: AuthSession): void {
    localStorage.setItem('token', session.access_token);
    localStorage.setItem('ondjila_user', JSON.stringify(session.user));
  }

  storeUser(user: AuthUser): void {
    localStorage.setItem('ondjila_user', JSON.stringify(user));
  }

  dashboardRouteFor(user: AuthUser): string {
    if (user.role === 'admin') return '/admin/overview';
    if (user.role === 'driver') return '/driver/home';
    return '/passenger/home';
  }
}
