import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');

  if (token) return true;
  if(!token || token === 'null') {
    router.navigate(['/login']);
    localStorage.removeItem('access_token');
  }
  router.navigate(['/login']);
  return false;
};