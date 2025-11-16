import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  save<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  get<T>(key: string): T | null {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }
}
