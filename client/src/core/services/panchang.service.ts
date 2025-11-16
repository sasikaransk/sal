import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface PanchangRequest {
  year: number;
  month: number;
  date: number;
  hours: number;
  minutes: number;
  seconds: number;
  latitude: number;
  longitude: number;
  timezone: number;
  config?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PanchangService {
  // Updated endpoint as per the sample Node request provided — now using the divided endpoint
  private apiUrl = 'https://json.freeastrologyapi.com/good-bad-times';
  private apiKey = environment.astrologyApi?.apiKey ?? '';

  constructor(private http: HttpClient) { }

  /**
   * Fetch good/bad times (or panchang) for a given date/time and location.
   * Uses a simple localStorage cache keyed by endpoint+date+lat+lon to avoid repeated API calls.
   */
  getGoodBadTimes(date: Date | string, latitude: number, longitude: number, timezone = 5.5, time?: { hours?: number; minutes?: number; seconds?: number; }, config: any = { observation_point: 'topocentric', ayanamsha: 'lahiri' }): Observable<any> {
    let d: Date;
    if (typeof date === 'string') {
      const [day, month, year] = date.split('-').map(Number);
      d = new Date(year, (month - 1), day);
    } else {
      d = date;
    }

    const req: PanchangRequest = {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      date: d.getDate(),
      hours: time?.hours ?? 6,
      minutes: time?.minutes ?? 0,
      seconds: time?.seconds ?? 0,
      latitude,
      longitude,
      timezone,
      config
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey
    });

    // Create a cache key per endpoint + date + lat + lon
    const dateKey = `${req.year}-${String(req.month).padStart(2, '0')}-${String(req.date).padStart(2, '0')}`;
    const cacheKey = `panchang_cache:good-bad-times:${dateKey}:${latitude}:${longitude}`;

    // Check cache
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        console.debug('[PanchangService] returning cached response for', cacheKey);
        return of(parsed);
      }
    } catch (e) {
      // ignore localStorage parse errors and continue to network fetch
      console.warn('Panchang cache read error', e);
    }

    // If not cached, call the API and cache the first response
    console.debug('[PanchangService] calling API', this.apiUrl, req);
    return this.http.post(this.apiUrl, req, { headers }).pipe(
      tap((res: any) => {
        try {
          // store raw response for subsequent requests for same date+location
          localStorage.setItem(cacheKey, JSON.stringify(res));
          console.debug('[PanchangService] cached response for', cacheKey);
        } catch (e) {
          console.warn('Panchang cache write error', e);
        }
      })
    );
  }
}
