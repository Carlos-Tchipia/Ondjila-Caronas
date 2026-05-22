import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const apiBase = environment.apiBaseUrl.replace(/\/$/, '');

  if (!token || !req.url.startsWith(apiBase)) {
    return next(req);
  }

  const cloned = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`),
  });
  return next(cloned);
};
