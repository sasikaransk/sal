import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { AuthService } from './auth-service';
import { catchError, map } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient, private auth: AuthService) { }

  private authHeaders() {
    const token = this.auth.getToken();
    if (!token) return {};
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  /** Try to fetch a single customer by id, fallback to listing and filtering */
  getCustomerById(id: string) {
    if (!id) return of(null);
    return this.http.get<any>(`${this.base}/Customer/${id}`, this.authHeaders()).pipe(
      catchError(() => {
        // fallback to list and filter
        return this.http.get<any[]>(`${this.base}/Customer`, this.authHeaders()).pipe(
          map(list => (list || []).find((c: any) => String(c.id || c.Id) === String(id)) || null),
          catchError(() => of(null))
        );
      })
    );
  }

  /** Try to fetch bookings for a customer. Falls back to listing all bookings then filtering. */
  getBookingsForCustomer(customerId: string) {
    if (!customerId) return of([]);
    // Preferred: backend supports query param ?customerId=...
    return this.http.get<any>(`${this.base}/bookings?customerId=${customerId}`, this.authHeaders()).pipe(
      catchError(() => {
        return this.http.get<any[]>(`${this.base}/bookings`, this.authHeaders()).pipe(
          map(list => (list || []).filter(b => String(b.customerId || b.CustomerId) === String(customerId))),
          catchError(() => of([]))
        );
      })
    );
  }

  /** Compose a dashboard payload for the given user/customer id */
  getDashboardForCustomer(customerId: string) {
    if (!customerId) return of({ customer: null, bookings: [], stats: {} });

    return forkJoin({
      customer: this.getCustomerById(customerId),
      bookings: this.getBookingsForCustomer(customerId)
    }).pipe(
      map((result: any) => {
        const bookings = result.bookings || [];
        const stats = {
          totalBooked: bookings.length,
          activeEvents: bookings.filter((b: any) => (b.status || b.Status) === 1).length,
          pendingPayments: bookings.filter((b: any) => (b.paymentStatus || b.PaymentStatus) === 'Pending' || (b.status || b.Status) === 0).length,
          spendOverview: bookings.reduce((s: number, b: any) => s + ((b.totalAmount || b.Total || 0) || 0), 0)
        };
        return { customer: result.customer, bookings, stats };
      })
    );
  }
}
