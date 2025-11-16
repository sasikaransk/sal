import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ReviewItem {
  author: string;
  rating: number; // 1..5
  text: string;
  images?: string[];
  createdAt?: string;
}

export interface RatingSummary {
  average: number; // 0..5
  total: number;
  counts: { [stars: number]: number }; // 1..5 -> count
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api`;

  getEventReviews(eventId: string): Observable<ReviewItem[]> {
    return this.http.get<ReviewItem[]>(`${this.base}/events/${eventId}/reviews`).pipe(
      catchError(() => {
        // fallback demo data
        const demo: ReviewItem[] = [
          { author: 'John Watson', rating: 5, text: 'Outstanding Experience!!!' },
          { author: 'Ishara D.', rating: 5, text: 'Flawless planning and stunning decor.' },
          { author: 'Naveen R.', rating: 4, text: 'Great service options and transparent pricing.' }
        ];
        return of(demo);
      })
    );
  }

  getEventRatingSummary(eventId: string): Observable<RatingSummary> {
    return this.http.get<RatingSummary>(`${this.base}/events/${eventId}/ratings`).pipe(
      catchError(() => {
        const fallback: RatingSummary = {
          average: 4.6,
          total: 2563,
          counts: { 5: 1780, 4: 620, 3: 98, 2: 21, 1: 9 }
        };
        return of(fallback);
      })
    );
  }

  postReview(eventId: string, payload: { rating: number; text: string; files: File[] }): Observable<any> {
    const form = new FormData();
    form.append('rating', String(payload.rating));
    form.append('text', payload.text ?? '');
    payload.files?.forEach((f, i) => form.append('images', f, f.name));
    return this.http.post(`${this.base}/events/${eventId}/reviews`, form).pipe(
      catchError((err) => {
        // surface to callers; they can decide UI behavior
        throw err;
      })
    );
  }
}
