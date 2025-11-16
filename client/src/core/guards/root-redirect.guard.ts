import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AccountService } from '../services/account.service';
import { AuthService } from '../services/auth-service';

@Injectable({ providedIn: 'root' })
export class RootRedirectGuard implements CanActivate {
  constructor(private account: AccountService, private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Only perform the redirect when the target URL is exactly root
    const targetUrl = state.url || '/';
    if (targetUrl !== '/' && targetUrl !== '') {
      return true; // allow navigation to other guest routes (e.g. /events)
    }

    // If there's a valid token or a stored user, redirect to their dashboard
    const isLogged = this.auth.isLoggedIn();
    const user = this.account.currentUser();

    if (!isLogged && !user) {
      return true; // allow guest layout
    }

    // Determine role from available shapes
    const u = user as any;
    const role = u?.role ?? u?.rolePermissions ?? u?.roleName ?? u?.roles ?? this.auth.getRole();

    let roleStr: string | undefined;
    if (Array.isArray(role) && role.length) {
      roleStr = String(role[0]);
    } else if (role && typeof role === 'object') {
      roleStr = String(role.name ?? role.role ?? '');
    } else {
      roleStr = role ? String(role) : undefined;
    }

    // Default to customer dashboard if user exists but no explicit role
    let target = '/';
    if (!roleStr) {
      target = '/customer/dashboard';
    } else {
      switch (roleStr.toLowerCase()) {
        case 'customer':
          target = '/customer/dashboard';
          break;
        case 'admin':
          target = '/admin';
          break;
        case 'serviceprovider':
        case 'service-provider':
          target = '/service-provider';
          break;
        case 'thirdparty':
        case 'third-party':
          target = '/thirdparty';
          break;
        default:
          target = '/customer/dashboard';
      }
    }

    this.router.navigateByUrl(target);
    return false;
  }
}
