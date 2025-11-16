import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { AccountService } from '../services/account.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router,
    private accountService: AccountService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['roles'] as Array<string> | undefined;
    if (!this.auth.getToken() || !this.auth.isLoggedIn()) {
      this.accountService.logout();
      this.auth.logout();
      return false;
    }

    if (!expectedRoles?.length) {
      return true;
    }

    const userRole = this.auth.getRole(); // read from JWT or stored user
    if (!userRole || !expectedRoles.includes(userRole)) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}
