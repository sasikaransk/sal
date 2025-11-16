import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router, UrlTree } from '@angular/router';
import { AdminAuthService } from './admin-auth.service';

const redirectToLogin = (url: string): UrlTree => {
  const router = inject(Router);
  return router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: url } });
};

const ensureAuthenticated = (attemptedUrl: string): boolean | UrlTree => {
  const auth = inject(AdminAuthService);
  return auth.isAuthenticated() ? true : redirectToLogin(attemptedUrl);
};

export const adminAuthGuard: CanActivateFn = (_route, state) => ensureAuthenticated(state.url);

export const adminAuthChildGuard: CanActivateChildFn = (_route, state) => ensureAuthenticated(state.url);

