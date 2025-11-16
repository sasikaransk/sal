import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventCategory } from '../events.data';
import { EventService } from '../../../../../core/services/event.service';
import { ReviewService, ReviewItem, RatingSummary } from '../../../../../core/services/review.service';
import { AccountService } from '../../../../../core/services/account.service';
import { AddReviewComponent } from '../../../../Customer/reviews/add-review/add-review';
import { FaqSectionComponent } from './faq-section/faq-section';
import { GALLERIES } from './galleries.data';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterLink, AddReviewComponent, FaqSectionComponent],
  templateUrl: './event-details.html',
  styleUrls: ['./event-details.css']
})
export class EventDetails {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  
  protected id = signal<string>('');
  protected item = signal<EventCategory | undefined>(undefined);
  protected isLoading = signal<boolean>(true);

  // gallery images will be loaded from public/Event Galleries via a mapping file
  protected readonly gallery = signal<string[]>([]);
  protected readonly galleriesCount = computed(() => this.gallery().length);
  // pagination/lazy-display for gallery
  private readonly pageSize = 6;
  protected showCount = signal<number>(this.pageSize);
  protected readonly visibleGallery = computed(() => this.gallery().slice(0, this.showCount()));
  protected galleryLoading = signal<boolean>(true);

  protected showMore() {
    this.showCount.set(Math.min(this.gallery().length, this.showCount() + this.pageSize));
  }
  protected showLess() {
    this.showCount.set(this.pageSize);
  }

  private reviewService = inject(ReviewService);
  private accountService = inject(AccountService);
  protected readonly reviews = signal<ReviewItem[]>([]);
  protected readonly ratingSummary = signal<RatingSummary | null>(null);
  protected readonly reviewsLoading = signal<boolean>(false);
  protected readonly ratingLoading = signal<boolean>(false);
  protected readonly showReviewModal = signal<boolean>(false);
  protected readonly isLoggedIn = computed(() => !!this.accountService.currentUser());
  protected readonly averageStars = computed(() => this.buildAverageStars(this.ratingSummary()?.average || 0));
  protected readonly distribution = computed(() => {
    const summary = this.ratingSummary();
    if (!summary) return [] as Array<{ stars: number; count: number; pct: number }>;
    const total = summary.total || 1;
    return [5,4,3,2,1].map(stars => {
      const c = summary.counts[stars] || 0;
      return { stars, count: c, pct: Math.round((c / total) * 100) };
    });
  });

  // FAQ list now handled by FaqSectionComponent

  ngOnInit() {
    this.route.paramMap.subscribe(p => {
      const eventId = p.get('id') ?? '';
      this.id.set(eventId);
      
      // Fetch event details from API with mock data fallback
      this.eventService.getEventById(eventId).subscribe({
        next: (event) => {
          this.item.set(event);
          this.isLoading.set(false);
          // ensure fireworks are started once the title is in the DOM
          setTimeout(() => this.setupFireworks(), 0);
        },
        error: (err) => {
          console.error('Error loading event details:', err);
          this.isLoading.set(false);
        }
      });

      this.loadReviews(eventId);
      this.loadRatingSummary(eventId);

      // Load gallery images for this event from the mapping (public/Event Galleries)
      // Try to load a manifest.json from the public folder to auto-refresh images
      this.galleryLoading.set(true);
      this.loadGalleryFromManifest(eventId)
        .then(found => {
          if (!found) {
            const imgs = GALLERIES[eventId] ?? [];
            this.gallery.set(imgs.map(p => p));
          }
          this.showCount.set(this.pageSize); // reset page
          this.galleryLoading.set(false);
        })
        .catch(() => {
          const imgs = GALLERIES[eventId] ?? [];
            this.gallery.set(imgs.map(p => p));
            this.showCount.set(this.pageSize);
            this.galleryLoading.set(false);
        });
    });
  }

  // Fireworks canvas handling
  @ViewChild('fireworks', { static: false }) private fireworksCanvas?: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D | null = null;
  private fireworks: Array<Array<{ x: number; y: number; angle: number; speed: number; radius: number; color: string; alpha: number }>> = [];
  private rafId: number | null = null;
  private intervalId: number | null = null;
  private emitTimeoutId: number | null = null;
  private emitting = true;
  private resizeHandler = () => {};
  private fireworksStarted = false;

  /**
   * Attempt to fetch a manifest file from public/Event Galleries/<id>/manifest.json
   * The manifest should be an array of file names, e.g. ["image1.webp", "image2.webp"].
   * Returns true if manifest was found and applied, false otherwise.
   */
  private async loadGalleryFromManifest(id: string): Promise<boolean> {
    if (!id) return false;
    const base = `/Event Galleries/${id}`;
    const url = `${base}/manifest.json?ts=${Date.now()}`; // bypass cache in dev
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return false;
      const files: unknown = await res.json();
      if (!Array.isArray(files)) return false;
      const paths = (files as string[]).map(f => `${base}/${f}`);
      if (paths.length) {
        this.gallery.set(paths);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  ngAfterViewInit(): void {
    this.setupFireworks();
  }

  private setupFireworks(): void {
    if (this.fireworksStarted) return;
    const canvas = this.fireworksCanvas?.nativeElement;
    if (!canvas) return; // will retry when view updates
    this.fireworksStarted = true;
    this.ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.clientWidth || window.innerWidth;
      canvas.height = 160;
    };
    resize();
    window.addEventListener('resize', resize);
    this.resizeHandler = resize;

    const createFirework = () => {
      if (!this.emitting) return;
      const x = Math.random() * canvas.width;
      const y = Math.random() * 80 + 40;
      const particles: Array<{ x: number; y: number; angle: number; speed: number; radius: number; color: string; alpha: number }> = [];
      for (let i = 0; i < 28; i++) {
        particles.push({
          x,
          y,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 3 + 1,
          radius: 2 + Math.random() * 1.5,
          color: `hsl(${Math.random() * 360},100%,60%)`,
          alpha: 1
        });
      }
      this.fireworks.push(particles);
    };

    const draw = () => {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.fireworks.forEach((fw, idx) => {
        fw.forEach(p => {
          p.x += Math.cos(p.angle) * p.speed;
          p.y += Math.sin(p.angle) * p.speed;
          p.alpha -= 0.02;
          this.ctx!.globalAlpha = Math.max(0, p.alpha);
          this.ctx!.fillStyle = p.color;
          this.ctx!.beginPath();
          this.ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          this.ctx!.fill();
          this.ctx!.globalAlpha = 1;
        });
        if (fw.length && fw[0].alpha <= 0) this.fireworks.splice(idx, 1);
      });
    };

    this.intervalId = window.setInterval(createFirework, 700);
    this.emitTimeoutId = window.setTimeout(() => {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      this.emitting = false;
    }, 5000);

    const animate = () => {
      draw();
      if (!this.emitting && this.fireworks.length === 0) {
        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
        return;
      }
      this.rafId = requestAnimationFrame(animate);
    };
    animate();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.emitTimeoutId) {
      clearTimeout(this.emitTimeoutId);
      this.emitTimeoutId = null;
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler as EventListenerOrEventListenerObject);
    }
    this.fireworks = [];
    this.ctx = null;
  }

  protected initials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  protected starsArray(count: number): number[] {
    const c = Math.max(0, Math.min(5, Math.round(count)));
    return Array.from({ length: 5 }, (_, i) => i < c ? 1 : 0);
  }

  private buildAverageStars(avg: number): Array<'full'|'half'|'empty'> {
    const stars: Array<'full'|'half'|'empty'> = [];
    for (let i = 1; i <= 5; i++) {
      if (avg >= i) stars.push('full');
      else if (avg >= i - 0.5) stars.push('half');
      else stars.push('empty');
    }
    return stars;
  }

  protected openReviewModal() {
    if (!this.isLoggedIn()) {
      // redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    this.showReviewModal.set(true);
  }

  protected closeReviewModal() {
    this.showReviewModal.set(false);
  }

  protected handleSubmitReview(ev: { rating: number; text: string; files: File[] }) {
    const eventId = this.id();
    if (!eventId) return;
    this.reviewService.postReview(eventId, ev).subscribe({
      next: () => {
        this.closeReviewModal();
        this.loadReviews(eventId);
        this.loadRatingSummary(eventId);
      },
      error: (err) => console.error('Error posting review', err)
    });
  }

  private loadReviews(eventId: string) {
    this.reviewsLoading.set(true);
    this.reviewService.getEventReviews(eventId).subscribe({
      next: data => { this.reviews.set(data); this.reviewsLoading.set(false); },
      error: err => { console.error('Load reviews failed', err); this.reviewsLoading.set(false); }
    });
  }

  private loadRatingSummary(eventId: string) {
    this.ratingLoading.set(true);
    this.reviewService.getEventRatingSummary(eventId).subscribe({
      next: data => { this.ratingSummary.set(data); this.ratingLoading.set(false); },
      error: err => { console.error('Load rating summary failed', err); this.ratingLoading.set(false); }
    });
  }
}
