import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { ChatbotComponent } from '../chatbot/chatbot.component';


type AdminNavItem = {
  label: string;
  path: string;
  icon: 'dashboard' | 'users' | 'shield' | 'staff' | 'customer' | 'credit-card' | 'calendar' | 'photo' | 'tag' | 'briefcase' | 'link' | 'question' | 'gift';
  initials: string; // kept for fallback or future use
};

const NAV_ITEMS: AdminNavItem[] = [
  { label: 'Dashboard', path: 'dashboard', icon: 'dashboard', initials: 'DB' },
  { label: 'Event Management', path: 'event-management', icon: 'calendar', initials: 'EM' },
  { label: 'Cashier', path: 'cashier', icon: 'tag', initials: 'CS' },
  { label: 'Bookings', path: 'bookings', icon: 'staff', initials: 'BK' },
  { label: 'Payments', path: 'payments', icon: 'credit-card', initials: 'PY' },
  { label: 'Staffs', path: 'staffs', icon: 'calendar', initials: 'ST' },
  { label: 'Third Party', path: 'third-party', icon: 'link', initials: 'TP' },
  { label: 'Customers', path: 'customers', icon: 'customer', initials: 'CU' },
  { label: 'Service Provider', path: 'services', icon: 'briefcase', initials: 'SV' },
  { label: 'FAQs', path: 'faqs', icon: 'question', initials: 'FQ' },
  { label: 'Offers', path: 'offers', icon: 'gift', initials: 'OF' },
  { label: 'User Settings', path: 'user-settings', icon: 'shield', initials: 'US' },
];

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, ChatbotComponent],
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  protected readonly navItems = NAV_ITEMS;
  private readonly profileMenuOpen = signal(false);
  private readonly mobileMenuOpen = signal(false);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly currentSection = signal(this.resolveCurrentSection(this.router.url));

  protected isProfileMenuOpen = computed(() => this.profileMenuOpen());
  protected isMobileMenuOpen = computed(() => this.mobileMenuOpen());

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(event => {
        this.currentSection.set(this.resolveCurrentSection(event.urlAfterRedirects));
      });
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen.update(open => !open);
  }

  closeProfileMenu(): void {
    this.profileMenuOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(open => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  logout(): void {

    this.closeProfileMenu();
    this.closeMobileMenu();
    this.router.navigate(['/admin/login']);
  }

  private resolveCurrentSection(url: string): string {
    const rawPath = url.split('/').pop() ?? '';
    const path = rawPath.split('?')[0];
    if (!path || path === 'admin') {
      return 'Dashboard';
    }
    const match = this.navItems.find(item => item.path === path);
    return match?.label ?? 'Dashboard';
  }
}
