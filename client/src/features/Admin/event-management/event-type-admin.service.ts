import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError, of, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EventType {
  eventTypeId: number;
  eventName: string;
  description?: string | null;
  seasonPreference?: string | null;
  minBudget?: number | null;
  maxBudget?: number | null;
  sortOrder: number;
  iconUrl?: string | null;
  isActive: boolean;
}

export type CreateEventTypePayload = Omit<EventType, 'eventTypeId' | 'isActive'>;
export type UpdateEventTypePayload = EventType;

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

@Injectable({
  providedIn: 'root',
})
export class EventTypeAdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = (environment as any).apiBaseUrl ?? `${environment.apiUrl}/api`;
  private readonly endpoint = `${this.baseUrl}/eventtype`;

  getEventTypes(options?: { includeInactive?: boolean }): Observable<EventType[]> {
    const includeInactive = options?.includeInactive === true;
    const baseParams = new HttpParams();

    const withCommonFlags = includeInactive
      ? baseParams
          .set('includeInactive', 'true')
          .set('includeDeleted', 'true')
          .set('showDeleted', 'true')
          .set('all', 'true')
          .set('activeOnly', 'false')
          .set('status', 'all')
      : undefined;

    const req = (url: string, params?: HttpParams): Observable<EventType[]> =>
      this.http.get<any>(url, { params }).pipe(
        map(resp => this.unwrapList(resp).map(item => this.normalize(item))),
        catchError(() => of([] as EventType[]))
      );

    // Primary request
    const primary$ = req(this.endpoint, withCommonFlags);

    if (!includeInactive) {
      return primary$;
    }

    // Fallbacks for various backend conventions
    const fallbacks$ = [
      req(`${this.endpoint}/all`),
      req(`${this.endpoint}/list`),
      req(`${this.endpoint}/admin`),
      req(this.endpoint, baseParams.set('showInactive', 'true')),
      req(this.endpoint, baseParams.set('isActive', 'false')),
      req(this.endpoint, baseParams.set('IsActive', 'false')),
      req(this.endpoint, baseParams.set('active', 'all')),
    ];

    return forkJoin([primary$, ...fallbacks$]).pipe(
      map(resultSets => {
        const merged = ([] as EventType[]).concat(...resultSets);
        // Unique by id; keep first occurrence
        const seen = new Set<number>();
        const unique = merged.filter(item => {
          const id = item.eventTypeId ?? 0;
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        return unique;
      })
    );
  }

  // Attempt to fetch season enum/options from multiple conventional endpoints.
  // Falls back to a sensible default list if backend does not expose enums.
  getSeasons(): Observable<string[]> {
    const req = (url: string): Observable<string[]> =>
      this.http.get<any>(url).pipe(
        map(resp => this.unwrapSeasons(resp)),
        catchError(() => of([] as string[]))
      );

    const candidates: string[] = [
      `${this.endpoint}/seasons`,
      `${this.baseUrl}/enums/seasons`,
      `${this.baseUrl}/metadata/seasons`,
      `${this.baseUrl}/lookup/seasons`,
      `${this.baseUrl}/season/enums`,
    ];

    return forkJoin(candidates.map(c => req(c))).pipe(
      map(responses => {
        const merged = ([] as string[]).concat(...responses);
        const unique = Array.from(new Set(merged.filter(Boolean)));
        if (unique.length > 0) return unique;
        // Fallback defaults (adjust to your domain)
        return ['Spring', 'Summer', 'Autumn', 'Winter', 'Monsoon', 'All-Season'];
      })
    );
  }

  private unwrapSeasons(resp: any): string[] {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp.map(String);
    if (Array.isArray(resp?.data)) return resp.data.map(String);
    if (Array.isArray(resp?.items)) return resp.items.map(String);
    if (Array.isArray(resp?.seasons)) return resp.seasons.map(String);
    if (Array.isArray(resp?.values)) return resp.values.map(String);
    return [];
  }

  getEventType(id: number): Observable<EventType> {
    return this.http.get<any>(`${this.endpoint}/${id}`).pipe(
      map(resp => this.normalize(this.unwrapItem(resp)))
    );
  }

  createEventType(payload: CreateEventTypePayload): Observable<EventType> {
    const body = this.toCreateRequest(payload);
    return this.http.post<any>(`${this.endpoint}/create`, body).pipe(
      map(resp => this.normalize(this.unwrapItem(resp) ?? body))
    );
  }

  updateEventType(payload: UpdateEventTypePayload): Observable<EventType> {
    const body = this.toUpdateRequest(payload);
    // Backend returns 405 for route PUT /{id}, so use collection root as originally implemented.
    // If your backend uses a different route (e.g., /update), update here accordingly.
      // Try common backend patterns in order: root PUT, /update, /edit, and /{id}
        return this.http.put<any>(this.endpoint, body).pipe(
          catchError(err1 => this.http.put<any>(`${this.endpoint}/update`, body).pipe(
            catchError(err2 => this.http.put<any>(`${this.endpoint}/edit`, body).pipe(
              catchError(err3 => this.http.put<any>(`${this.endpoint}/${payload.eventTypeId}`, body).pipe(
                catchError(err4 => throwError(() => err4))
              ))
            ))
          )),
          map(resp => this.normalize(this.unwrapItem(resp) ?? body))
        );
  }

  deleteEventType(id: number): Observable<void> {
    return this.http.delete(`${this.endpoint}/${id}`).pipe(map(() => void 0));
  }

  private unwrapList(resp: any): any[] {
    if (Array.isArray(resp)) return resp;
    if (resp?.data && Array.isArray(resp.data)) return resp.data;
    if (resp?.items && Array.isArray(resp.items)) return resp.items;
    if (resp?.eventTypes && Array.isArray(resp.eventTypes)) return resp.eventTypes;
    return [];
  }

  private unwrapItem<T = any>(resp: ApiResponse<T> | T): T {
    if (resp == null) return resp as T;
    if (typeof resp === 'object' && 'data' in resp && (resp as ApiResponse<T>).data !== undefined) {
      return (resp as ApiResponse<T>).data as T;
    }
    return resp as T;
  }

  private normalize(api: any): EventType {
    if (!api) {
      return {
        eventTypeId: 0,
        eventName: '',
        description: null,
        seasonPreference: null,
        minBudget: null,
        maxBudget: null,
        sortOrder: 0,
        iconUrl: null,
        isActive: false,
      };
    }

    const eventTypeId =
      api.eventTypeId ?? api.EventTypeId ?? api.id ?? 0;
    return {
      eventTypeId,
      eventName: api.eventName ?? api.EventName ?? api.name ?? '',
      description: api.description ?? api.Description ?? null,
      seasonPreference: api.seasonPreference ?? api.SeasonPreference ?? null,
      minBudget: this.toNumber(api.minBudget ?? api.MinBudget),
      maxBudget: this.toNumber(api.maxBudget ?? api.MaxBudget),
      sortOrder: Number(api.sortOrder ?? api.SortOrder ?? 0),
      iconUrl: api.iconUrl ?? api.IconUrl ?? null,
      isActive: api.isActive ?? api.IsActive ?? true,
    };
  }

  private toCreateRequest(payload: CreateEventTypePayload) {
    return {
      EventName: payload.eventName,
      Description: payload.description ?? null,
      SeasonPreference: payload.seasonPreference ?? null,
      MinBudget: payload.minBudget ?? null,
      MaxBudget: payload.maxBudget ?? null,
      SortOrder: payload.sortOrder,
      IconUrl: payload.iconUrl ?? null,
    };
  }

  private toUpdateRequest(payload: UpdateEventTypePayload) {
    // Send full object to satisfy typical ASP.NET ModelState validation expecting all fields.
    return {
      EventTypeId: payload.eventTypeId,
      EventName: payload.eventName,
      Description: payload.description ?? null,
      SeasonPreference: payload.seasonPreference ?? null,
      MinBudget: payload.minBudget ?? null,
      MaxBudget: payload.maxBudget ?? null,
      SortOrder: payload.sortOrder,
      IconUrl: payload.iconUrl ?? null,
      IsActive: payload.isActive,
    };
  }

  private toNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const asNumber = Number(value);
    return Number.isNaN(asNumber) ? null : asNumber;
  }
}
