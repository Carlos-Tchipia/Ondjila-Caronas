import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiClient {
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private readonly http: HttpClient) {}

  get<TResponse>(path: string) {
    return this.http.get<TResponse>(this.url(path));
  }

  getWithParams<TResponse>(path: string, params: Record<string, string | number | boolean | null | undefined>) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined && value !== '') {
        search.set(key, String(value));
      }
    }
    const query = search.toString();
    return this.http.get<TResponse>(this.url(query ? `${path}?${query}` : path));
  }

  getBlobWithParams(path: string, params: Record<string, string | number | boolean | null | undefined>) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined && value !== '') {
        search.set(key, String(value));
      }
    }
    const query = search.toString();
    return this.http.get(this.url(query ? `${path}?${query}` : path), { responseType: 'blob' });
  }

  post<TResponse>(path: string, body: unknown) {
    return this.http.post<TResponse>(this.url(path), body);
  }

  postFormData<TResponse>(path: string, body: FormData) {
    return this.http.post<TResponse>(this.url(path), body);
  }

  private url(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }
}
