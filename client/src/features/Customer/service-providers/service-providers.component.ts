import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule, ParamMap } from '@angular/router';

import { ProviderCard, ServiceCategory } from './models';
import { fetchProvidersByCategory } from './providers.api';

type SortKey = 'popular' | 'top-rated' | 'price-asc' | 'price-desc';

const DEFAULT_CATEGORY: ServiceCategory = 'catering';
const VALID_CATEGORIES: ReadonlyArray<ServiceCategory> = ['venue', 'catering', 'decor', 'photo', 'music', 'transport'];
const HERO_OVERLAY = 'linear-gradient(180deg, rgba(250, 249, 240, 0.95), rgba(255, 253, 248, 0.8))';

const SORT_OPTIONS: ReadonlyArray<{ value: SortKey; label: string }> = [
  { value: 'popular', label: 'Popular' },
  { value: 'top-rated', label: 'Top Rated' },
  { value: 'price-asc', label: 'Price Low to High' },
  { value: 'price-desc', label: 'Price High to Low' },
];
const VALID_SORT_KEYS: ReadonlyArray<SortKey> = SORT_OPTIONS.map((option) => option.value);

const RATING_OPTIONS: ReadonlyArray<{ value: number; label: string }> = [
  { value: 0, label: 'Any Rating' },
  { value: 4, label: '4★+' },
  { value: 4.5, label: '4.5★+' },
];

const CATEGORY_INSIGHTS: Record<ServiceCategory, string> = {
  venue: 'Visit the property at dusk to feel how the lighting and acoustics settle.',
  catering: 'Schedule a tasting to finalize menus and ensure seamless plating.',
  decor: 'Layer florals with textured drapery for warmth and depth on stage.',
  photo: 'Share your event timeline early so the team can capture every emotion.',
  music: 'Match your ceremony and reception playlists with a short inspiration call.',
  transport: 'Confirm arrival windows so vehicles align with your ceremonial beats.',
};

const CATEGORY_BACKGROUNDS: Record<ServiceCategory, string> = {
  venue: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1700&q=80',
  catering: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1700&q=80',
  decor: 'https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1700&q=80',
  photo: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1700&q=80',
  music: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?auto=format&fit=crop&w=1700&q=80',
  transport: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1700&q=80',
};

@Component({
  selector: 'festivaz-service-providers',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './service-providers.component.html',
  styleUrls: ['./service-providers.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceProvidersComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly category = signal<ServiceCategory>(DEFAULT_CATEGORY);
  readonly query = signal('');
  readonly minRating = signal(0);
  readonly sortKey = signal<SortKey>('popular');
  readonly providers = signal<ProviderCard[]>([]);
  readonly loading = signal(true);
  readonly toastMessage = signal('');

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  readonly sortOptions = SORT_OPTIONS;
  readonly ratingOptions = RATING_OPTIONS;

  readonly heroBackground = computed(() => {
    const background = CATEGORY_BACKGROUNDS[this.category()];
    if (!background) {
      return HERO_OVERLAY;
    }
    return `${HERO_OVERLAY}, url('${background}')`;
  });

  readonly filtered = computed(() => {
    const items = this.providers();
    const min = this.minRating();
    const search = this.query().trim().toLowerCase();

    const prefiltered = items.filter((provider) => {
      if (provider.rating < min) {
        return false;
      }
      if (!search) {
        return true;
      }
      const haystack = `${provider.name} ${provider.tagline} ${provider.city} ${(provider.tags ?? []).join(' ')}`.toLowerCase();
      return haystack.includes(search);
    });

    const sorted = [...prefiltered];
    switch (this.sortKey()) {
      case 'top-rated':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-asc':
        sorted.sort((a, b) => a.priceMin - b.priceMin);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.priceMax - a.priceMax);
        break;
      default:
        sorted.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    return sorted;
  });

  readonly avgRating = computed(() => {
    const list = this.filtered();
    if (!list.length) {
      return 0;
    }
    return list.reduce((sum, provider) => sum + provider.rating, 0) / list.length;
  });

  readonly insightMessage = computed(() => CATEGORY_INSIGHTS[this.category()] ?? '');

  private readonly providersLoader = effect(() => {
    const activeCategory = this.category();
    this.loading.set(true);
    const subscription = fetchProvidersByCategory(activeCategory).subscribe({
      next: (items: ProviderCard[]) => {
        this.providers.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.providers.set([]);
        this.loading.set(false);
      },
    });
    return () => subscription.unsubscribe();
  });

  ngOnInit() {
    const sub = this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      this.category.set(this.normalizeCategory(params.get('categoryId')));
    });
    // ensure unsubscription when the component is destroyed
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  private normalizeCategory(value: string | null): ServiceCategory {
    if (!value) {
      return DEFAULT_CATEGORY;
    }
    const normalized = value.toLowerCase() as ServiceCategory;
    return VALID_CATEGORIES.includes(normalized) ? normalized : DEFAULT_CATEGORY;
  }

  onSearch(value: string) {
    this.query.set(value ?? '');
  }

  onMinRatingChange(value: string) {
    const parsed = parseFloat(value);
    this.minRating.set(Number.isFinite(parsed) ? parsed : 0);
  }

  onSortChange(value: string) {
    const normalized = (value ?? 'popular') as SortKey;
    this.sortKey.set(VALID_SORT_KEYS.includes(normalized) ? normalized : 'popular');
  }

  viewProfile(providerId: string) {
    this.router.navigate(['/provider-profile', providerId]);
  }

  bookNow(provider: ProviderCard) {
    this.toastMessage.set(`🎉 Booking confirmed with ${provider.name} ✓`);
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.toastMessage.set('');
    }, 3000);

    setTimeout(() => {
      this.router.navigate(['/create-event/overview'], {
        state: {
          fromBooking: true,
          lastBookedService: this.category(),
        },
      });
    }, 1600);
  }
}
