import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiClient {
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/$/, '');
  private readonly requestTimeoutMs = 15000;

  constructor(private readonly http: HttpClient) {}

  get<TResponse>(path: string) {
    return this.http.get<TResponse>(this.url(path)).pipe(timeout(this.requestTimeoutMs));
  }

  getWithParams<TResponse>(path: string, params: Record<string, string | number | boolean | null | undefined>) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined && value !== '') {
        search.set(key, String(value));
      }
    }
    const query = search.toString();
    return this.http
      .get<TResponse>(this.url(query ? `${path}?${query}` : path))
      .pipe(timeout(this.requestTimeoutMs));
  }

  getBlobWithParams(path: string, params: Record<string, string | number | boolean | null | undefined>) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined && value !== '') {
        search.set(key, String(value));
      }
    }
    const query = search.toString();
    return this.http
      .get(this.url(query ? `${path}?${query}` : path), { responseType: 'blob' })
      .pipe(timeout(this.requestTimeoutMs));
  }

  post<TResponse>(path: string, body: unknown) {
    return this.http.post<TResponse>(this.url(path), body).pipe(timeout(this.requestTimeoutMs));
  }

  postFormData<TResponse>(path: string, body: FormData) {
    return this.http.post<TResponse>(this.url(path), body).pipe(timeout(this.requestTimeoutMs));
  }

  private url(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }
}
