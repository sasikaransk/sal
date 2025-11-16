import { Component, HostListener, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../../../core/services/account.service';
import { AuthService } from '../../../../core/services/auth-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './app-header.component.html'
})
export class AppHeaderComponent {
  private accountService = inject(AccountService);
  private authService = inject(AuthService);

  menuOpen = false;
  userMenuOpen = false;
  notificationOpen = false;

  // Example notifications; in production these should come from a notifications service
  notifications = [
    { id: 1, icon: '✅', text: 'Payment received for Miller-Jones Wedding', time: '2h', unread: true },
    { id: 2, icon: '💬', text: 'Message from planner: timeline update', time: '1d', unread: true },
    { id: 3, icon: '📄', text: 'Invoice #INV-1024 is ready', time: '3d', unread: false }
  ];

  protected readonly currentUser = this.accountService.currentUser;
  protected readonly homeLink = computed(() => {
    const u = this.currentUser();
    if (!u) return '/';
    // Try multiple possible role fields returned by backend (rolePermissions, role, roles, roleName)
    const role = (u as any).rolePermissions ?? (u as any).role ?? (u as any).roles ?? (u as any).roleName;

    // Normalize role string if array/object provided
    let roleStr: string | undefined;
    if (Array.isArray(role) && role.length) {
      roleStr = String(role[0]);
    } else if (role && typeof role === 'object') {
      roleStr = String((role as any).name ?? (role as any).role ?? '');
    } else {
      roleStr = role ? String(role) : undefined;
    }

    if (!roleStr) {
      // User exists but role isn't present — assume customer by default (safer UX)
      return '/customer/dashboard';
    }

    switch (roleStr) {
      case 'Customer':
      case 'customer':
      case 'CUSTOMER':
        return '/customer/dashboard';
      case 'Admin':
      case 'admin':
        return '/admin';
      case 'ServiceProvider':
      case 'serviceprovider':
      case 'service-provider':
      case 'Service Provider':
        return '/service-provider';
      case 'ThirdParty':
      case 'thirdparty':
      case 'third-party':
        return '/thirdparty';
      default:
        return '/customer/dashboard';
    }
  });

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
    this.userMenuOpen = false;
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  toggleNotifications(): void {
    this.notificationOpen = !this.notificationOpen;
    // If opening notifications, mark them as seen in UI (optional)
    if (this.notificationOpen) {
      this.notifications = this.notifications.map(n => ({ ...n, unread: false }));
    }
  }

  @HostListener('document:mousedown', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }
    const clickedInsideUserMenu = !!target.closest('[data-user-menu]');
    const clickedInsideNotifications = !!target.closest('[data-notifications-menu]');

    if (!clickedInsideUserMenu) {
      this.userMenuOpen = false;
    }

    if (!clickedInsideNotifications) {
      this.notificationOpen = false;
    }
  }

  logout(): void {
    this.accountService.logout();
    this.authService.logout();
    this.menuOpen = false;
    this.userMenuOpen = false;
  }

  getUserInitial(): string {
    const user = this.currentUser();
    if (user?.displayName?.length) {
      return user.displayName.charAt(0).toUpperCase();
    }

    if (user?.email?.length) {
      return user.email.charAt(0).toUpperCase();
    }

    return 'U';
  }

  unreadCount(): number {
    return this.notifications.filter(n => n.unread).length;
  }

}
