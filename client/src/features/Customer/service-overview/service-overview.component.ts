import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { take } from 'rxjs';
import { CATEGORIES, EventKey, ServiceItem } from './models';
import { ProvidersService } from './providers.service';

type NavState = {
  selectedServiceIds?: string[];
  eventType?: EventKey;
};

@Component({
  selector: 'app-service-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './service-overview.component.html',
  styleUrls: ['./service-overview.component.css'],
})
export class ServiceOverviewComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly providers = inject(ProvidersService);

  private readonly selectedIds = signal<string[]>([]);
  private readonly eventTypeSignal = signal<EventKey | null>(null);

  readonly all = signal<ServiceItem[]>(CATEGORIES);
  readonly countsLoaded = signal(false);

  constructor() {
    const nav = this.router.getCurrentNavigation();
    const state = (nav?.extras?.state as NavState | undefined) ?? undefined;
    if (state?.selectedServiceIds?.length) {
      this.selectedIds.set(state.selectedServiceIds);
    }
    if (state?.eventType) {
      this.eventTypeSignal.set(state.eventType);
    }
  }

  @Input()
  set selectedServiceIds(value: string[] | null | undefined) {
    if (value === undefined) {
      return;
    }
    this.selectedIds.set(value ?? []);
  }

  get selectedServiceIds(): string[] {
    return this.selectedIds();
  }

  @Input()
  set eventType(value: EventKey | null | undefined) {
    if (value === undefined) {
      return;
    }
    this.eventTypeSignal.set(value);
  }

  get eventType(): EventKey | null {
    return this.eventTypeSignal();
  }

  readonly selectedSet = computed(() => new Set(this.selectedIds()));

  readonly sorted = computed(() => {
    const sel = this.selectedSet();
    return [...this.all()].sort((a, b) => {
      const diff = Number(sel.has(b.id)) - Number(sel.has(a.id));
      if (diff !== 0) {
        return diff;
      }
      return a.name.localeCompare(b.name);
    });
  });

  ngOnInit(): void {
    this.providers
      .getCounts$(this.eventTypeSignal())
      .pipe(take(1))
      .subscribe(counts => {
        this.all.set(this.providers.attachCounts(CATEGORIES, counts));
        this.countsLoaded.set(true);
      });
  }

  isSelected = (id: string) => this.selectedSet().has(id);

  goToProviders(id: string): void {
    this.router.navigate(['/providers', id], {
      queryParams: { eventType: this.eventTypeSignal() ?? '' },
    });
  }

  startExploring(): void {
    const first =
      this.sorted().find(item => this.isSelected(item.id)) ?? this.sorted()[0];
    if (first) {
      this.goToProviders(first.id);
    }
  }
}
