import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const raw = localStorage.getItem('ondjila_user');

  if (!raw) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const user = JSON.parse(raw) as { role?: string };
    if (user.role === 'admin') return true;
  } catch {
    router.navigate(['/login']);
    return false;
  }

  router.navigate(['/passenger/dashboard']);
  return false;
};
