import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap, map, retry } from 'rxjs/operators';
import { EventCategory, EVENT_CATEGORIES } from '../../features/Guest/Events/events/events.data';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);
  // prefer an explicit api base if provided, otherwise fall back to apiUrl + /api
  private base = (environment as any).apiBaseUrl ?? `${environment.apiUrl}/api`;
  private apiUrl = `${this.base}/eventtype`;
  
  // Signal to track if we're using live data
  readonly isLiveData = signal<boolean>(false);
  
  /**
   * Fetch all events from API with mock data fallback
   * Returns mock data immediately via signal, then updates when API responds
   */
  getEvents(): Observable<EventCategory[]> {
    // API returns EventType objects with PascalCase properties; map them to EventCategory
    console.info('[EventService] getEvents -> requesting', this.apiUrl);
    return this.http.get<any>(this.apiUrl).pipe(
      retry(1),
      map(resp => {
        // Some backends return an array directly, others return an object wrapper
        // like { success: true, data: [...] } or { eventTypes: [...] }.
        let items: any[] = [];
        if (Array.isArray(resp)) {
          items = resp;
        } else if (resp == null) {
          items = [];
        } else if (Array.isArray(resp.data)) {
          items = resp.data;
        } else if (Array.isArray(resp.items)) {
          items = resp.items;
        } else if (Array.isArray(resp.eventTypes)) {
          items = resp.eventTypes;
        } else if (Array.isArray(resp.value)) {
          items = resp.value;
        } else {
          // Not an array, log for debugging and try to coerce object entries if possible
          console.debug('[EventService] getEvents -> unexpected response shape', resp);
          // Try treating each property that looks like an array as items
          for (const k of Object.keys(resp)) {
            if (Array.isArray((resp as any)[k])) {
              items = (resp as any)[k];
              break;
            }
          }
        }
        return items.map(i => this.mapFromApi(i));
      }),
      tap(() => this.isLiveData.set(true)),
      catchError(error => {
        // Log detailed error information to help debug network/CORS/backend issues
        console.warn('[EventService] API unavailable, falling back to mock placeholders. error:', error);
        this.isLiveData.set(false);
        // Return an empty array instead of the generated EVENT_CATEGORIES to remove the
        // reliance on the sync-events.js generated file.
        return of(this.getMockEvents());
      })
    );
  }

  /**
   * Fetch single event by ID from API with mock data fallback
   */
  getEventById(id: string): Observable<EventCategory | undefined> {
    const url = `${this.apiUrl}/${id}`;
    console.info('[EventService] getEventById -> requesting', url);
    return this.http.get<any>(url).pipe(
      retry(1),
      map(raw => {
        // API may return the item directly or wrapped (e.g. { data: { ... } })
        let item = raw;
        if (item == null) return undefined;
        if (!item.eventName && !item.EventName && typeof item === 'object') {
          // try common wrapper fields
          if (item.data && typeof item.data === 'object') item = item.data;
          else if (item.value && typeof item.value === 'object') item = item.value;
          else if (item.result && typeof item.result === 'object') item = item.result;
        }
        return item ? this.mapFromApi(item) : undefined;
      }),
      tap(() => this.isLiveData.set(true)),
      catchError(error => {
        console.warn(`[EventService] API unavailable for event ${id}, error:`, error);
        this.isLiveData.set(false);
        // Avoid referencing generated EVENT_CATEGORIES; use getMockEvents() which now
        // returns an empty array (or minimal placeholders if you prefer).
        const mockEvent = this.getMockEvents().find(e => e.id === id);
        return of(mockEvent);
      })
    );
  }

  /**
   * Get mock data synchronously (for initial state)
   */
  getMockEvents(): EventCategory[] {
    // Return the static mock data shipped in the repo so the UI can show
    // consistent placeholder content when the backend is unavailable.
    return EVENT_CATEGORIES;
  }

  /**
   * Map the API EventType payload to our EventCategory model
   * Assumptions:
   * - API returns EventName, Description, IconUrl and optional counts.
   * - If API doesn't provide an id, we generate a slug from EventName.
   */
  private mapFromApi(api: any): EventCategory {
    // Be tolerant of different casing and property names from various backends
    const name: string = api?.EventName ?? api?.eventName ?? api?.Name ?? api?.name ?? api?.eventTypeName ?? '';
    const id = api?.Id ?? api?.id ?? api?.eventTypeId ?? api?.eventTypeID ?? api?.eventTypeId ?? this.slugify(name);
    let image = api?.IconUrl ?? api?.iconUrl ?? api?.Icon ?? api?.icon ?? api?.ImageUrl ?? api?.imageUrl ?? api?.image ?? '';
    // Normalize image path: if it's a relative filename ensure it has a leading slash so
    // the browser will load it from the app's public/ folder. Leave absolute URLs untouched.
    if (image && !image.startsWith('http') && !image.startsWith('/')) {
      image = '/' + image;
    }
    // derive simple tags from the EventName when Tags are not provided
    const tags = Array.isArray(api?.Tags) && api.Tags.length
      ? api.Tags
      : Array.isArray(api?.tags) && api.tags.length
        ? api.tags
        : (name ? name.split(/[-—–:\/,_]+/).map(s => s.trim()).filter(Boolean) : []);
    return {
      id,
      title: name,
  description: api?.Description ?? api?.description ?? api?.desc ?? '',
      image,
      tags,
      providersCount: api?.ProvidersCount ?? api?.providersCount ?? 0,
      servicesCount: api?.ServicesCount ?? api?.servicesCount ?? 0,
      reviewsCount: api?.ReviewsCount ?? api?.reviewsCount ?? 0,
      faqsCount: api?.FaqsCount ?? api?.faqsCount ?? 0,
      galleriesCount: api?.GalleriesCount ?? api?.galleriesCount ?? 0,
      seasonPreference: api?.SeasonPreference ?? api?.seasonPreference,
      minBudget: api?.MinBudget ?? api?.minBudget,
      maxBudget: api?.MaxBudget ?? api?.maxBudget,
      sortOrder: api?.SortOrder ?? api?.sortOrder,
    } as EventCategory;
  }

  private slugify(text: string): string {
    return (text || '')
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
