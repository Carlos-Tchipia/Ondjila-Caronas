import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { AuthApiService } from '../../services/auth/auth-api.service';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authApi = inject(AuthApiService);
  const raw = localStorage.getItem('ondjila_user');

  if (!raw) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const user = JSON.parse(raw) as { role?: string };
    if (user.role !== 'admin') {
      router.navigate(['/passenger/dashboard']);
      return false;
    }

    return authApi.me().pipe(
      map((res) => {
        const freshUser = res.data?.user;
        if (freshUser) {
          authApi.storeUser(freshUser);
        }
        if (freshUser?.role === 'admin') {
          return true;
        }
        return router.parseUrl('/passenger/home');
      }),
      catchError(() => of(router.parseUrl('/login')))
    );
  } catch {
    router.navigate(['/login']);
    return false;
  }
};
