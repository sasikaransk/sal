import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs';
import {
  ServiceProviderRegistrationPayload,
  ServiceProviderRegistrationService,
} from '../../../core/services/service-provider-registration.service';

@Component({
  selector: 'app-register-serviceprovider',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './register-serviceprovider.html',
  styleUrls: ['./register-serviceprovider.css'],
})
export class RegisterServiceprovider {
  readonly step = signal(1);
  readonly sections = [
    { title: 'Account', caption: 'Secure login credentials' },
    { title: 'Brand', caption: 'Introduce your services' },
    { title: 'Location', caption: 'Tell us where you operate' },
    { title: 'Policies', caption: 'Set experience expectations' },
  ];
  readonly totalSteps = this.sections.length;
  readonly isSubmitting = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly progressPercent = computed(() => {
    if (this.totalSteps <= 1) {
      return 100;
    }
    const ratio = (this.step() - 1) / (this.totalSteps - 1);
    return Math.round(ratio * 100);
  });

  accountForm!: FormGroup;
  providerForm!: FormGroup;
  addressForm!: FormGroup;
  settingsForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private registrationService: ServiceProviderRegistrationService
  ) {
    this.initForms();
  }

  // --- Add inside class ---
readonly descriptionLimit = 500;
readonly descCount = signal(0);
readonly jsonState = signal({ cancellationValid: true, paymentsValid: true });

public validateJson(ctrl: 'cancellationPolicy' | 'paymentMethods', raw?: string): void {
  const control = this.settingsForm.get(ctrl);
  const val = (raw ?? String(control?.value ?? '')).trim();
  let ok = true;
  try {
    // Defaults if empty
    const base = ctrl === 'paymentMethods' ? '[]' : '{}';
    JSON.parse(val || base);
  } catch {
    ok = false;
  }
  this.jsonState.update(s => ({
    ...s,
    [ctrl === 'paymentMethods' ? 'paymentsValid' : 'cancellationValid']: ok,
  }));
}

formatJson(ctrl: 'cancellationPolicy' | 'paymentMethods'): void {
  const c = this.settingsForm.get(ctrl);
  if (!c) return;
  try {
    const raw = (c.value ?? (ctrl === 'paymentMethods' ? '[]' : '{}')) as string;
    const pretty = JSON.stringify(JSON.parse(raw || (ctrl === 'paymentMethods' ? '[]' : '{}')), null, 2);
    c.setValue(pretty);
    this.validateJson(ctrl, pretty);
  } catch {
    // ignore
  }
}


  private initForms(): void {
    this.accountForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      isActive: [true],
    });

    this.providerForm = this.fb.group({
      companyName: ['', Validators.required],
      brandName: ['', Validators.required],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^[0-9()+\-\s]{7,15}$/)],
      ],
      description: ['', [Validators.maxLength(500)]],
    });

    this.addressForm = this.fb.group({
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      district: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
    });

    this.settingsForm = this.fb.group({
      maxConcurrentBookings: [5, [Validators.required, Validators.min(1)]],
      minLeadTimeDays: [3, [Validators.required, Validators.min(0)]],
      bookingWindowDays: [90, [Validators.required, Validators.min(7)]],
      creditPeriod: [90, [Validators.required, Validators.min(0)]],
      businessLicense: [''],
      taxId: [''],
      cancellationPolicy: ['{}'],
      paymentMethods: ['[]'],
    });

    // Track description count
this.providerForm.get('description')!.valueChanges.subscribe((v: string) => {
  this.descCount.set((v ?? '').length);
});

// Validate JSON on input
this.settingsForm.get('cancellationPolicy')!.valueChanges.subscribe(v => this.validateJson('cancellationPolicy', v as string));
this.settingsForm.get('paymentMethods')!.valueChanges.subscribe(v => this.validateJson('paymentMethods', v as string));

  }

  private get forms(): FormGroup[] {
    return [this.accountForm, this.providerForm, this.addressForm, this.settingsForm];
  }

  private currentForm(): FormGroup | null {
    const index = this.step() - 1;
    return this.forms[index] ?? null;
  }

  get isLastStep(): boolean {
    return this.step() === this.totalSteps;
  }

  get canProceed(): boolean {
    return this.currentForm()?.valid ?? false;
  }

  sectionStatus(index: number): 'complete' | 'active' | 'upcoming' {
    const currentIndex = this.step() - 1;
    if (index < currentIndex) return 'complete';
    if (index === currentIndex) return 'active';
    return 'upcoming';
  }

  next(): void {
    this.currentForm()?.markAllAsTouched();
    if (this.step() < this.totalSteps && this.canProceed) {
      this.step.update(value => value + 1);
      this.errorMessage.set(null);
    }
  }

  prev(): void {
    if (this.step() > 1) {
      this.step.update(value => value - 1);
      this.errorMessage.set(null);
    }
  }

  private buildPayload(): ServiceProviderRegistrationPayload {
    const account = this.accountForm.value;
    const provider = this.providerForm.value;
    const address = this.addressForm.value;
    const settings = this.settingsForm.value;

    return {
      ...account,
      ...provider,
      ...address,
      ...settings,
      description: provider.description?.trim() ?? '',
      businessLicense: settings.businessLicense?.trim() ?? '',
      taxId: settings.taxId?.trim() ?? '',
      cancellationPolicy: settings.cancellationPolicy ?? '{}',
      paymentMethods: settings.paymentMethods ?? '[]',
      rolePermissions: 'ServiceProvider',
    } as ServiceProviderRegistrationPayload;
  }

  private touchAll(): void {
    this.forms.forEach(form => form.markAllAsTouched());
  }

    /** Smoothly scroll to the top of the page after step changes or alerts */
  private scrollTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /** Allow jumping back to completed steps from the sidebar */
  jumpTo(index: number): void {
    const target = index + 1;          // steps are 1-based
    if (target < this.step()) {        // only allow jumping back, not forward
      this.step.set(target);
      this.errorMessage.set(null);
      this.scrollTop();
    }
  }


  submit(): void {
    this.touchAll();
    this.successMessage.set(null);
    this.errorMessage.set(null);

    if (this.forms.some(form => form.invalid)) {
      this.errorMessage.set('Please fix the highlighted fields before submitting.');
      return;
    }

    const payload = this.buildPayload();
    this.isSubmitting.set(true);

    this.registrationService
      .register(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Thanks! Your profile has been submitted for review.');
          this.step.set(1);
          this.initForms();
        },
        error: error => {
          const message =
            error?.error?.title ||
            error?.error?.message ||
            'Unable to complete registration at the moment.';
          this.errorMessage.set(message);
        },
      });
  }
}

