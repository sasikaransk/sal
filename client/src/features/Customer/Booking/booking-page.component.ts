import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { LocalStorageService } from '../../../core/services/local-storage.service';
import { CustomPackage, ProviderProfile } from '../provider-profile/models';
import { ProviderProfileApi } from '../provider-profile/provider.api';

type PaymentMethod = 'card' | 'upi' | 'bank';

interface HighlightedPackage {
  title: string;
  description: string;
  price: number;
  services: string[];
  badge: string;
  image?: string;
}

const STORAGE_KEYS = {
  provider: 'festivaz_selectedProvider',
  customPackage: 'festivaz_customPackage',
} as const;

const STEP_LABELS = [
  'Confirm Details',
  'Add Special Notes',
  'Payment',
  'Confirmation',
] as const;

const STEP_DESCRIPTIONS = [
  'Review the curated package, pricing, and event essentials.',
  'Share rituals, preferences, or logistics your planner should know.',
  'Secure the booking with your preferred payment method.',
  'Receive instant confirmation and concierge follow-up.',
] as const;

const PAYMENT_OPTIONS: ReadonlyArray<{
  id: PaymentMethod;
  label: string;
  caption: string;
}> = [
  { id: 'card', label: 'Credit / Debit Card', caption: 'Visa, Mastercard, Amex' },
  { id: 'upi', label: 'UPI', caption: 'PhonePe, Google Pay, BHIM' },
  { id: 'bank', label: 'Bank Transfer', caption: 'Instant or scheduled transfer' },
];

const REQUIREMENT_HINTS = [
  '“Please align the entrance florals with our ivory-gold palette.”',
  '“Need a Jain-friendly tasting menu for the sangeet night.”',
  '“Add a live mehendi corner near the lake-facing promenade.”',
];

const TRUST_SIGNALS = [
  { label: 'Verified Luxury Partner', value: 'Since 2018' },
  { label: 'Average Rating', value: '4.9 / 5' },
  { label: 'On-time Execution', value: '98% of events' },
];

const SERVICE_FEE_RATE = 0.045;
const CONCIERGE_FEE = 3800;

@Component({
  selector: 'festivaz-booking-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './booking-page.component.html',
  styleUrls: ['./booking-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly providerApi = inject(ProviderProfileApi);
  private readonly storage = inject(LocalStorageService);

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  readonly steps = STEP_LABELS;
  readonly stepDescriptions = STEP_DESCRIPTIONS;
  readonly paymentOptions = PAYMENT_OPTIONS;
  readonly requirementHints = REQUIREMENT_HINTS;
  readonly trustSignals = TRUST_SIGNALS;

  readonly provider = signal<ProviderProfile | null>(
    this.storage.get<ProviderProfile>(STORAGE_KEYS.provider)
  );
  readonly loading = signal(true);
  readonly selectedStep = signal(1);
  readonly toastMessage = signal<string | null>(null);
  readonly savedCustomPackage = signal<CustomPackage | null>(
    this.storage.get<CustomPackage>(STORAGE_KEYS.customPackage)
  );
  readonly paymentMethod = signal<PaymentMethod>('card');

  readonly requirementsForm = this.fb.group({
    eventDate: [''],
    eventCity: [''],
    guestCount: [150, [Validators.min(25)]],
    requirements: [''],
    inspirationLink: [''],
  });

  readonly paymentForm = this.fb.group({
    method: ['card' as PaymentMethod, Validators.required],
    cardholder: ['', [Validators.required, Validators.minLength(3)]],
    cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9 ]{12,19}$/)]],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    upiId: [''],
    referenceId: [''],
    savePayment: [true],
    acceptPolicy: [true, Validators.requiredTrue],
  });

  readonly activeCustomPackage = computed(() => {
    const provider = this.provider();
    const saved = this.savedCustomPackage();
    if (provider && saved?.providerId === provider.id) {
      return saved;
    }
    return null;
  });

  readonly highlightedPackage = computed<HighlightedPackage | null>(() => {
    const provider = this.provider();
    if (!provider) {
      return null;
    }

    const custom = this.activeCustomPackage();
    if (custom) {
      return {
        title: 'Custom Bespoke Experience',
        description:
          'A handcrafted selection finalised with your Festivaz planner for a seamless celebration.',
        price: custom.total,
        services: custom.services,
        badge: 'Custom Package',
      };
    }

    const pkg = provider.packages?.[0];
    if (!pkg) {
      return null;
    }

    return {
      title: pkg.title,
      description: pkg.description,
      price: pkg.price,
      services: [pkg.description],
      badge: 'Signature Package',
      image: pkg.image,
    };
  });

  readonly priceBreakdown = computed(() => {
    const base = this.highlightedPackage()?.price ?? 0;
    const serviceFee = Math.round(base * SERVICE_FEE_RATE);
    const concierge = base ? CONCIERGE_FEE : 0;
    const total = base + serviceFee + concierge;
    return {
      base,
      serviceFee,
      concierge,
      total,
    };
  });

  readonly progressPercent = computed(() =>
    Math.round(((this.selectedStep() + 1) / this.steps.length) * 100)
  );

  constructor() {
    this.updatePaymentValidators('card');

    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const providerId = params.get('providerId');
      if (!providerId) {
        this.loading.set(false);
        return;
      }
      this.fetchProvider(providerId);
    });

    this.paymentForm
      .get('method')!
      .valueChanges.pipe(takeUntilDestroyed())
      .subscribe((raw) => {
        const method: PaymentMethod = (raw as PaymentMethod) ?? 'card';
        this.paymentMethod.set(method);
        this.updatePaymentValidators(method);
      });
  }

  heroBackground() {
    const profile = this.provider();
    if (!profile?.bannerUrl) {
      return 'linear-gradient(135deg, rgba(250,249,240,0.95), rgba(255,253,248,0.85))';
    }
    return `linear-gradient(135deg, rgba(250,249,240,0.92), rgba(0,0,0,0.35)), url(${profile.bannerUrl})`;
  }

  goBackToProfile() {
    const provider = this.provider();
    if (!provider) {
      this.router.navigate(['/customer/providers', 'catering']);
      return;
    }
    this.router.navigate(['/customer/provider-profile', provider.id]);
  }

  focusOnPayment() {
    this.setActiveStep(2);
    const section = document?.getElementById('payment-section');
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  setActiveStep(index: number) {
    if (index < 0 || index >= this.steps.length) {
      return;
    }
    this.selectedStep.set(index);
  }

  onPaymentOptionSelect(method: PaymentMethod) {
    if (this.paymentMethod() === method) {
      return;
    }
    this.paymentForm.get('method')?.setValue(method);
  }

  confirmBooking() {
    this.requirementsForm.markAllAsTouched();
    this.paymentForm.markAllAsTouched();

    if (!this.paymentForm.valid || !this.isPaymentDetailsValid()) {
      this.showToast('Please complete the highlighted payment details to continue.');
      return;
    }

    const provider = this.provider();
    const packageName = this.highlightedPackage()?.title ?? 'selected package';

    this.showToast(`Booking confirmed for ${provider?.name ?? 'your provider'} - ${packageName}.`);
    this.setActiveStep(this.steps.length - 1);
  }

  private fetchProvider(id: string) {
    this.loading.set(true);
    this.providerApi
      .getProviderById(id)
      .pipe(takeUntilDestroyed())
      .subscribe((result) => {
        if (result) {
          this.provider.set(result);
          this.storage.save(STORAGE_KEYS.provider, result);
        }
        this.loading.set(false);
      });
  }

  private updatePaymentValidators(method: PaymentMethod) {
    const cardholder = this.paymentForm.get('cardholder');
    const cardNumber = this.paymentForm.get('cardNumber');
    const expiry = this.paymentForm.get('expiry');
    const cvv = this.paymentForm.get('cvv');
    const upiId = this.paymentForm.get('upiId');
    const referenceId = this.paymentForm.get('referenceId');

    if (method === 'card') {
      cardholder?.setValidators([Validators.required, Validators.minLength(3)]);
      cardNumber?.setValidators([Validators.required, Validators.pattern(/^[0-9 ]{12,19}$/)]);
      expiry?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]);
      cvv?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
      upiId?.clearValidators();
      referenceId?.clearValidators();
    } else if (method === 'upi') {
      cardholder?.clearValidators();
      cardNumber?.clearValidators();
      expiry?.clearValidators();
      cvv?.clearValidators();
      upiId?.setValidators([
        Validators.required,
        Validators.pattern(/^[\w.\-]{3,}@([a-zA-Z]){2,}$/),
      ]);
      referenceId?.clearValidators();
    } else {
      cardholder?.clearValidators();
      cardNumber?.clearValidators();
      expiry?.clearValidators();
      cvv?.clearValidators();
      upiId?.clearValidators();
      referenceId?.setValidators([
        Validators.required,
        Validators.pattern(/^[A-Z0-9]{8,18}$/),
      ]);
    }

    cardholder?.updateValueAndValidity({ emitEvent: false });
    cardNumber?.updateValueAndValidity({ emitEvent: false });
    expiry?.updateValueAndValidity({ emitEvent: false });
    cvv?.updateValueAndValidity({ emitEvent: false });
    upiId?.updateValueAndValidity({ emitEvent: false });
    referenceId?.updateValueAndValidity({ emitEvent: false });
  }

  private isPaymentDetailsValid() {
    const method = this.paymentMethod();
    if (method === 'card') {
      return [
        'cardholder',
        'cardNumber',
        'expiry',
        'cvv',
        'acceptPolicy',
      ].every((key) => this.paymentForm.get(key)?.valid);
    }

    if (method === 'upi') {
      return ['upiId', 'acceptPolicy'].every((key) => this.paymentForm.get(key)?.valid);
    }

    return ['referenceId', 'acceptPolicy'].every((key) => this.paymentForm.get(key)?.valid);
  }

  private showToast(message: string) {
    this.toastMessage.set(message);
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.toastMessage.set(null);
      this.toastTimer = null;
    }, 3200);
  }
}

