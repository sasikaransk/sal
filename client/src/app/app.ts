import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Router, RouterOutlet } from '@angular/router';
import { AccountService } from '../core/services/account.service';
import { AppHeaderComponent } from '../features/Common/home/app-header/app-header.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'], // ✅ fixed
})
export class App implements OnInit {
  private accountService = inject(AccountService);
  private http = inject(HttpClient);
  protected router = inject(Router);

  protected readonly title = signal('Social Media App');
  protected members = signal<any[]>([]);

  isAdmin(): boolean {
    const url = this.router.url;
    return url.startsWith('/admin');
  }

  protected shouldOffset(): boolean {
    const url = this.router.url;
    if (this.isAdmin()) return false; // Admin should be full-bleed without offsets
    return !['/', '/login', '/register', '/contact'].includes(url);
  }

  async ngOnInit(): Promise<void> {
    this.members.set(await this.getMembers());
    this.setCurrentUser();
  }

  setCurrentUser(): void {
    const userString = localStorage.getItem('user');
    if (!userString) return;

    try {
      const user = JSON.parse(userString);
      this.accountService.currentUser.set(user);
    } catch (err) {
      console.error('Invalid user data in localStorage:', err);
      localStorage.removeItem('user');
    }
  }

  async getMembers(): Promise<any[]> {
    try {
      return await lastValueFrom(
        this.http.get<any[]>('http://localhost:5170/api/appuser')
      );
    } catch (error) {
      console.error('Failed to load members:', error);
      return [];
    }
  }
}
