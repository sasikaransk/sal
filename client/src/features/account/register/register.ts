import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RegisterCreds } from '../../../types/user';
import { AccountService } from '../../../core/services/account.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private accountService = inject(AccountService);

  cancelRegister = output<boolean>();

  protected creds: RegisterCreds = {
    email: '',
    password: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    postalCode: '',
    country: '',
    dateOfBirth: null,
  };
  protected loading = false;
  protected errorMsg = '';
  protected showPassword = false;
  protected showConfirmPassword = false;
  protected confirmPassword = '';
  protected phoneInvalid = false;
  protected emailInvalid = false;

  private e164 = /^\+?[1-9]\d{1,14}$/;
  private emailRx = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  register() {
    // basic validations
    this.phoneInvalid = false;
    this.emailInvalid = false;

    if (!this.creds.email || !this.creds.password || !this.creds.customerName || !this.creds.customerPhone || !this.confirmPassword) {
      this.errorMsg = 'Please fill in all required fields.';
      this.emailInvalid = !!this.creds.email && !this.emailRx.test(this.creds.email);
      this.phoneInvalid = !!this.creds.customerPhone && !this.e164.test(this.creds.customerPhone);
      return;
    }

    if (!this.emailRx.test(this.creds.email)) {
      this.errorMsg = 'Enter a valid email address.';
      this.emailInvalid = true;
      return;
    }

    if (this.creds.password.length < 6) {
      this.errorMsg = 'Password must be at least 6 characters.';
      return;
    }

    if (this.creds.password !== this.confirmPassword) {
      this.errorMsg = 'Passwords do not match.';
      return;
    }

    if (!this.e164.test(this.creds.customerPhone)) {
      this.errorMsg = 'Phone number must be in E.164 format (e.g., +123456789).';
      this.phoneInvalid = true;
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    const toIsoOrNull = (d?: string | null) => (d ? new Date(d + 'T00:00:00Z').toISOString() : null);

    const body: RegisterCreds = {
      ...this.creds,
      dateOfBirth: toIsoOrNull(this.creds.dateOfBirth ?? null),
      rolePermissions: 'Customer',
      isActive: true,
      status: 'Active',
    };

    this.accountService.register(body).subscribe({
      next: () => {
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = err?.error || 'Registration failed. Please try again.';
        console.error(err);
      },
    });
  }

  cancel() {
    this.cancelRegister.emit(false);
  }
}


// ng g c features/members/member-list --dry-run
// ng g c features/members/member-detailed
// ng g c features/lists
// ng g c features/messages

