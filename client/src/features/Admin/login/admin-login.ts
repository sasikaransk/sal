import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminAuthService } from './admin-auth.service';
import { firstValueFrom } from 'rxjs';

type AdminLoginForm = {
  username: string;
  password: string;
  remember: boolean;
};

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin implements OnInit {
  protected form: AdminLoginForm = {
    username: '',
    password: '',
    remember: true,
  };

  protected showPassword = false;
  protected loading = false;
  protected errorMessage = '';
  // Visual panel image; uses assets from /public directory.
  protected visualImage = {
    src: '/admin_img/admin.png', // updated to png to match existing file in public/admin_img
    alt: 'FestivaZ control room',
  };

  protected fallbackImage = '/logo1.png';

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly adminAuth = inject(AdminAuthService);
  private returnUrl = '/admin/dashboard';

  async ngOnInit(): Promise<void> {
    const params = await firstValueFrom(this.route.queryParamMap);
    this.returnUrl = params.get('returnUrl') || '/admin/dashboard';

    if (this.adminAuth.isAuthenticated()) {
      this.router.navigateByUrl(this.returnUrl, { replaceUrl: true });
    }
  }

  submit(): void {
    this.errorMessage = '';

    if (!this.form.username || !this.form.password) {
      this.errorMessage = 'Username and password are required.';
      return;
    }

    this.loading = true;
    const success = this.adminAuth.login(this.form.username, this.form.password, this.form.remember);
    this.loading = false;

    if (success) {
      this.router.navigateByUrl(this.returnUrl, { replaceUrl: true });
      return;
    }

    this.errorMessage = 'Invalid credentials. Use Admin / Admin for now.';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onImageError(_event: Event): void {
    // Swap to fallback to avoid broken image icon.
    if (this.visualImage.src !== this.fallbackImage) {
      this.visualImage = { ...this.visualImage, src: this.fallbackImage };
    }
  }
}

