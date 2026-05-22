import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const driverGuard: CanActivateFn = () => {
  const router = inject(Router);
  const rawUser = localStorage.getItem('ondjila_user');

  if (!rawUser) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const user = JSON.parse(rawUser) as { role?: string };
    if (user.role === 'driver') {
      return true;
    }
  } catch {
    router.navigate(['/login']);
    return false;
  }

  router.navigate(['/passenger/dashboard']);
  return false;
};
