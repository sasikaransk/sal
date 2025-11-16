import { Injectable, computed, signal } from '@angular/core';

const LOCAL_KEY = 'festivaz-admin-session';
const SESSION_KEY = 'festivaz-admin-session-temp';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly authenticated = signal<boolean>(this.restorePersistedState());

  readonly isAuthenticated = computed(() => this.authenticated());

  login(username: string, password: string, remember = true): boolean {
    const isValid = username.trim().toLowerCase() === 'admin' && password === 'Admin';

    if (isValid) {
      this.persistAuth(remember);
      this.authenticated.set(true);
      return true;
    }

    this.clearPersistedState();
    this.authenticated.set(false);
    return false;
  }

  logout(): void {
    this.clearPersistedState();
    this.authenticated.set(false);
  }

  private persistAuth(remember: boolean): void {
    this.clearPersistedState();

    if (remember) {
      localStorage.setItem(LOCAL_KEY, 'true');
    } else {
      sessionStorage.setItem(SESSION_KEY, 'true');
    }
  }

  private restorePersistedState(): boolean {
    return localStorage.getItem(LOCAL_KEY) === 'true' || sessionStorage.getItem(SESSION_KEY) === 'true';
  }

  private clearPersistedState(): void {
    localStorage.removeItem(LOCAL_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }
}

