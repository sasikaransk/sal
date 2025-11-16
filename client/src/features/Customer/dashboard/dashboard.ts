// import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { PanchangCalendarComponent } from './panchang-calendar/panchang-calendar';
import { PanchangDetailsComponent } from './panchang-details/panchang-details';
import { PanchangService } from '../../../core/services/panchang.service';
import { DashboardService } from '../../../core/services/dashboard.service';
// import { CustomerNavbarComponent } from './customer-navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, PanchangCalendarComponent, PanchangDetailsComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})

export class Dashboard {


  private accountService = inject(AccountService);
  private router = inject(Router);
  private panchangService = inject(PanchangService);
  private dashboardService = inject(DashboardService);

  isLoggedIn = computed(() => !!this.accountService.currentUser());
  displayName = computed(() => this.accountService.currentUser()?.displayName ?? 'Customer');
  panchangData: any = null;
  // debug: store last emitted payload from calendar
  lastPayload: any = null;
  panchangError: string | null = null;

  loadingDashboard = false;

  stats = { totalBooked: 12, activeEvents: 3, pendingPayments: 2, spendOverview: 5400 };
  upcomingEvent = {
    title: 'Wedding - Hindu',
    dateText: 'Sat, Nov 23, 2024 at 7:00 PM',
    venue: 'Grand Ballroom Center',
    progress: 60,
    image: '/Dashboard/Dash-1.jpg'
  };
  recentBookings = [
    { title: 'Tech Summit 2024', tags: ['Corporate', 'Confirmed'], image: '/Events/event_2.jpg' },
    { title: 'Miller-Jones Wedding', tags: ['Wedding', 'Pending'], image: '/Events/event_3.jpg' },
  ];
  notifications = [
    { icon: '✅', text: 'Your payment was successful', time: '2 hours ago' },
    { icon: '💬', text: 'New message from your event planner', time: '1 day ago' },
  ];

  constructor() {
    // attempt to load dashboard when component initializes
    try { this.loadDashboard(); } catch (e) { /* ignore */ }
  }

  loadDashboard() {
    const user = this.accountService.currentUser();
    if (!user || !user.id) return;
    this.loadingDashboard = true;
    (this.dashboardService.getDashboardForCustomer(user.id) as any).subscribe(
      (res: any) => {
        if (!res) return;
        // set stats and bookings
        if (res.stats) this.stats = res.stats;
        if (Array.isArray(res.bookings)) {
          this.recentBookings = (res.bookings || []).slice(0,5).map((b: any) => ({ title: b.eventName || b.EventName || ('Booking #' + (b.bookingId || b.BookingId || '')), tags: [ (b.status || b.Status) === 1 ? 'Confirmed' : 'Pending' ], image: '/Events/event_2.jpg' }));
        }
        // set upcomingEvent from first active booking if present
        const active = (res.bookings || []).find((b: any) => (b.status || b.Status) === 1 || (b.status || b.Status) === 0);
        if (active) {
          this.upcomingEvent = {
            title: active.eventName || active.EventName || this.upcomingEvent.title,
            dateText: active.eventDate || active.serviceDate || this.upcomingEvent.dateText,
            venue: active.venue || this.upcomingEvent.venue,
            progress: 10,
            image: active.imageUrl || this.upcomingEvent.image
          };
        }
      },
      (err: any) => {
        console.error('Dashboard load error', err);
        this.loadingDashboard = false;
      },
      () => { this.loadingDashboard = false; }
    );
  }

  onDateSelected(payload: { date: string, latitude?: number, longitude?: number }) {
    if (!payload) return;
    const { date, latitude, longitude } = payload;
    this.lastPayload = payload;
    if (latitude == null || longitude == null) {
      console.warn('No location selected; please choose a location before selecting a date.');
      return;
    }

    // Convert incoming date string D-M-YYYY to Date object
    const [d, m, y] = date.split('-').map(Number);
    const dt = new Date(y, (m - 1), d);
    this.panchangError = null;
    this.panchangService.getGoodBadTimes(dt, latitude, longitude).subscribe({
      next: (data: any) => {
        console.log('Panchang Data:', data);
        this.panchangData = data;
      },
      error: (err: any) => {
        console.error('Error fetching panchang data:', err);
        this.panchangError = err?.message || String(err);
      }
    });
  }

  // Allow manual retry from the debug UI
  retryFetch() {
    const p = this.lastPayload;
    if (!p) return;
    const [d, m, y] = p.date.split('-').map(Number);
    const dt = new Date(y, (m - 1), d);
    this.panchangError = null;
    this.panchangService.getGoodBadTimes(dt, p.latitude, p.longitude).subscribe({
      next: (data: any) => { this.panchangData = data; },
      error: (err: any) => { this.panchangError = err?.message || String(err); }
    });
  }

  goToProfile(): void {
    // Navigate to profile when available; currently routes to /profile (add later if needed)
    this.router.navigateByUrl('/profile');
  }
}
