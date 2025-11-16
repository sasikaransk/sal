import { AfterViewInit, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginCreds } from '../../../types/user';
import { AuthService } from '../../../core/services/auth-service';
import { environment } from '../../../environments/environment.development';
import { AccountService } from '../../../core/services/account.service';
import { HttpErrorResponse } from '@angular/common/http';

declare const google: any; // must be outside the class

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements AfterViewInit {
  private accountService = inject(AccountService);
  private authService = inject(AuthService);
  private router = inject(Router);

  protected creds: LoginCreds = { email: '', password: '' };
  protected loading = false;
  protected errorMsg = '';
  protected showPassword = false;

  submit(): void {
    if (!this.creds.email || !this.creds.password) {
      this.errorMsg = 'Email and password are required.';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this.accountService.login(this.creds).subscribe({
      next: (user) => {
        this.loading = false;

        if (!user?.token) {
          this.errorMsg = 'No token was returned from the server.';
          return;
        }

        this.authService.saveToken(user.token);
        this.navigateAfterLogin();
      },
      error: (err: unknown) => {
        this.loading = false;
        this.errorMsg = this.buildErrorMessage(err);
        console.error('Login failed', err);
      }
    });
  }

  ngAfterViewInit(): void {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => this.handleCredentialResponse(response),
      locale: 'en'
    });

    const buttonContainer = document.getElementById('google-signin-button');
    if (!buttonContainer) {
      return;
    }

    google.accounts.id.renderButton(buttonContainer, {
      theme: 'outline',
      size: 'large',
      type: 'signin',
      shape: 'pill',
      width: '100%',
      logo_alignment: 'center',
      text: 'signin_with'
    });
  }

  private handleCredentialResponse(response: any): void {
    const idToken = response.credential;
    if (!idToken) {
      console.error('No credential received');
      return;
    }

    this.authService.googleLogin(idToken).subscribe({
      next: (res) => console.log('Google login success', res),
      error: (err) => console.error('Google login failed', err)
    });
  }

  private navigateAfterLogin(): void {
    const role = this.authService.getRole();
    if (!role) {
      this.router.navigate(['/']);
      return;
    }

    switch (role) {
      case 'Admin':
        this.router.navigate(['/admin']);
        break;
      case 'Customer':
        this.router.navigate(['/customer']);
        break;
      case 'ServiceProvider':
        this.router.navigate(['/service-provider']);
        break;
      case 'ThirdParty':
        this.router.navigate(['/thirdparty']);
        break;
      default:
        this.router.navigate(['/']);
        break;
    }
  }

  private buildErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0 || err.error instanceof ProgressEvent) {
        return 'Cannot reach the server. Make sure the API is running.';
      }

      if (typeof err.error === 'string') {
        return err.error;
      }

      if (err.error?.message) {
        return err.error.message;
      }

      if (err.message) {
        return err.message;
      }
    }

    if (err instanceof Error) {
      return err.message;
    }

    return 'Login failed. Please try again.';
  }
}
