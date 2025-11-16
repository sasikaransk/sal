import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface FaqItem {
  id?: string;
  question: string;
  answer?: string;
  askedBy?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class FaqService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api`;

  getEventFaqs(eventId: string): Observable<FaqItem[]> {
    return this.http.get<FaqItem[]>(`${this.base}/events/${eventId}/faqs`).pipe(
      catchError(() => {
        const demo: FaqItem[] = [
          { question: 'What is the typical booking lead time?', answer: 'We recommend booking 6–12 weeks in advance for best availability.' },
          { question: 'Do providers support custom themes?', answer: 'Yes, most providers offer custom styling and themed packages.' },
          { question: 'Is there on-site coordination on the event day?', answer: 'Premium packages include on-site coordinators for setup and execution.' }
        ];
        return of(demo);
      })
    );
  }

  postQuestion(eventId: string, payload: { question: string }): Observable<any> {
    return this.http.post(`${this.base}/events/${eventId}/faqs`, payload).pipe(
      catchError((err) => { throw err; })
    );
  }
}