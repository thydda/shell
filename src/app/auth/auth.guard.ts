import { inject } from '@angular/core';
import { Router, type CanMatchFn } from '@angular/router';
import { AUTH_SERVICE, type AuthService } from '@thydda/auth-contracts';

export const authGuard: CanMatchFn = (_route, segments) => {
  const auth = inject<AuthService>(AUTH_SERVICE);
  return auth.user()
    ? true
    : inject(Router).createUrlTree(['/login'], {
        queryParams: { returnUrl: '/' + segments.map((segment) => segment.path).join('/') },
      });
};
