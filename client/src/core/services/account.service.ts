import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { LoginCreds, RegisterCreds, User } from '../../types/user';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { AuthService } from './auth-service';

@Injectable({providedIn: 'root'})

export class AccountService {

  private http = inject(HttpClient);
  currentUser = signal<User | null>(null);


  private baseUrl = environment.apiBaseUrl;
  private auth = inject(AuthService);

  
  constructor() {
    // Restore user from localStorage on service init so UI (layout/header)
    // can reflect logged-in state after refresh or initial load.
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const user = JSON.parse(raw) as User;
        this.currentUser.set(user);
      }
    } catch (e) {
      // ignore malformed storage
    }

    // Validate token on startup; if token exists but expired, clear stored user/token silently
    try {
      const tokenValid = this.auth.isLoggedIn();
      if (!tokenValid) {
        // If token is invalid/expired, clear local storage without forcing navigation here.
        try {
          localStorage.removeItem('app_token');
        } catch {}
        try {
          localStorage.removeItem('user');
        } catch {}
        this.currentUser.set(null);
      }
    } catch (e) {
      // ignore
    }
  }

  // REGISTER METHOD
  register(creds: RegisterCreds) {
    return this.http.post<User>(`${this.baseUrl}/account/registercustomer`, creds).pipe(
      tap((user) => {
        if (user) {
          this.setCurrentUser(user); // call setCurrentUser method
        }
      })
    );
  }


  login(creds: LoginCreds) {
    return this.http.post<User>(`${this.baseUrl}/account/login`, creds).pipe(
      tap((user) => {
        if(user){
          this.setCurrentUser(user);
        }
      })
    )
  }

  setCurrentUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user)); // store user in local storage
    this.currentUser.set(user);
  }

  logout(){
    localStorage.removeItem('user'); // remove user from local storage
    this.currentUser.set(null);
  }

  cancel(){
    
  }
  
}
