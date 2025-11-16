import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomPackage, ProviderProfile } from './models';
import { ProviderProfileApi } from './provider.api';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { CustomPackageModalComponent, CustomPackagePayload } from './custom-package-modal.component';

const STORAGE_KEYS = {
  provider: 'festivaz_selectedProvider',
  tab: 'festivaz_profileTab',
  customPackage: 'festivaz_customPackage',
} as const;

const TAB_LABELS = ['About', 'Packages & Pricing', 'Portfolio Gallery', 'Reviews & Ratings'];

@Component({
  selector: 'app-provider-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomPackageModalComponent],
  templateUrl: './provider-profile.component.html',
  styleUrl: './provider-profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProviderProfileComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly providerApi = inject(ProviderProfileApi);
  private readonly storage = inject(LocalStorageService);

  readonly tabs = TAB_LABELS;
  readonly provider = signal<ProviderProfile | null>(null);
  readonly loading = signal(true);
  readonly selectedTab = signal(0);
  readonly isModalOpen = signal(false);
  readonly toastMessage = signal<string | null>(null);
  readonly savedCustomPackage = signal<CustomPackage | null>(
    this.storage.get<CustomPackage>(STORAGE_KEYS.customPackage)
  );

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  readonly activeCustomPackage = computed(() => {
    const current = this.provider();
    const saved = this.savedCustomPackage();
    return current && saved?.providerId === current.id ? saved : null;
  });

  constructor() {
    this.restoreTabState();
    this.restoreStoredProvider();
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        return;
      }
      this.loadProvider(id);
    });
  }

  selectTab(index: number) {
    this.selectedTab.set(index);
    this.storage.save(STORAGE_KEYS.tab, index);
  }

  openModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  submitCustomPackage(payload: CustomPackagePayload) {
    const provider = this.provider();
    if (!provider) {
      return;
    }
    const saved: CustomPackage = {
      providerId: provider.id,
      services: payload.services,
      notes: payload.notes,
      total: payload.total,
      createdAt: new Date().toISOString(),
    };
    this.savedCustomPackage.set(saved);
    this.storage.save(STORAGE_KEYS.customPackage, saved);
    this.closeModal();
    this.showToast('✨ Your custom package request was sent successfully!');
  }

  bookNow() {
    const provider = this.provider();
    if (!provider) {
      return;
    }
    this.storage.save(STORAGE_KEYS.provider, provider);
    this.showToast('✨ Provider locked in. Taking you to the overview.');
    setTimeout(() => this.router.navigate(['/create-event/overview']), 500);
  }

  chatPlaceholder() {
    this.showToast('Live chat will arrive soon – one tap away!');
  }

  viewRelatedProvider(id: string) {
    this.router.navigate(['/customer/provider-profile', id]);
  }

  private loadProvider(id: string) {
    this.loading.set(true);
    this.providerApi
      .getProviderById(id)
      .pipe(takeUntilDestroyed())
      .subscribe((result) => {
        if (result) {
          this.provider.set(result);
          this.storage.save(STORAGE_KEYS.provider, result);
        } else {
          this.provider.set(null);
        }
        this.loading.set(false);
      });
  }

  private restoreTabState() {
    const saved = this.storage.get<number>(STORAGE_KEYS.tab);
    const index = typeof saved === 'number' && !Number.isNaN(saved) ? saved : 0;
    this.selectedTab.set(this.normalizeTabIndex(index));
  }

  private normalizeTabIndex(value: number) {
    if (value < 0) {
      return 0;
    }
    if (value >= this.tabs.length) {
      return this.tabs.length - 1;
    }
    return value;
  }

  private restoreStoredProvider() {
    const stored = this.storage.get<ProviderProfile>(STORAGE_KEYS.provider);
    if (stored) {
      this.provider.set(stored);
    }
  }

  heroBackground() {
    const profile = this.provider();
    if (!profile) {
      return 'linear-gradient(120deg, rgba(250,249,240,0.95), rgba(255,253,248,0.9))';
    }
    return `linear-gradient(120deg, rgba(250,249,240,0.95), rgba(255,253,248,0.75)), url(${profile.bannerUrl})`;
  }

  private showToast(message: string) {
    this.toastMessage.set(message);
    this.scrollToTop();
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.toastMessage.set(null);
      this.toastTimer = null;
    }, 3200);
  }

  private scrollToTop() {
    window?.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
