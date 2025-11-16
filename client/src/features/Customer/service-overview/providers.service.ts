import { Injectable, signal } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { EventKey, ServiceItem } from './models';

@Injectable({ providedIn: 'root' })
export class ProvidersService {
  private readonly counts = signal<Record<string, number>>({
    venue: 14,
    catering: 8,
    decor: 10,
    photo: 9,
    music: 6,
    transport: 5,
  });

  getCounts$(eventType: EventKey | null): Observable<Record<string, number>> {
    void eventType;
    return of(this.counts()).pipe(delay(250));
  }

  attachCounts(items: ServiceItem[], counts: Record<string, number>): ServiceItem[] {
    return items.map(item => ({
      ...item,
      providerCount: counts[item.id] ?? 0,
    }));
  }
}
