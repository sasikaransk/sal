import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiBaseUrl}/account`;
  private tokenKey = 'app_token';

  constructor(private http: HttpClient, private router: Router) {}

  googleLogin(idToken: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/google-login`, { idToken });
  }

  // dY"1 Store token after login
  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // dY"1 Get token from local storage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // dY"1 Decode token and return payload
  getDecodedToken(): any {
    const token = this.getToken();
    if (!token) return null;
    return this.decodeJwt(token);
  }

  // dY"1 Get user role from token
  getRole(): string | null {
    const decoded = this.getDecodedToken();
    if (!decoded || !decoded.role) return null;
    return decoded.role;
  }

  // dY"1 Check if token exists and is valid
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const decoded = this.decodeJwt(token);
    if (!decoded || !decoded.exp) return false;

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp > now;
  }

  // dY"1 Remove token (logout)
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  private decodeJwt(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;

      const base64 = this.padBase64(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const json = this.base64Decode(base64);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  private padBase64(value: string): string {
    const remainder = value.length % 4;
    if (remainder === 0) return value;
    return value + '='.repeat(4 - remainder);
  }

  private base64Decode(value: string): string {
    if (typeof atob === 'function') {
      return atob(value);
    }

    const bufferCtor = (globalThis as any)?.Buffer;
    if (bufferCtor) {
      return bufferCtor.from(value, 'base64').toString('utf-8');
    }

    throw new Error('No base64 decoder available');
  }
}
