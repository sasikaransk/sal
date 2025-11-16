import { CommonModule, NgClass } from '@angular/common';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';

type EventKey = 'wedding' | 'birthday' | 'puberty' | 'housewarming' | 'gettogether';

type ServiceItem = {
  id: string;
  name: string;
  desc: string;
  icon: 'venue' | 'catering' | 'decor' | 'photo' | 'music' | 'transport';
  appliesTo: EventKey[];
  tags?: string[];
};

const DEFAULT_EVENT_TYPE: EventKey = 'wedding';

const CATEGORIES: ServiceItem[] = [
  {
    id: 'venue',
    name: 'Venue / Hall',
    desc: 'Banquet & hotel function halls.',
    icon: 'venue',
    appliesTo: ['wedding', 'birthday', 'puberty', 'gettogether', 'housewarming'],
    tags: ['Book early', 'Deposit required'],
  },
  {
    id: 'catering',
    name: 'Catering',
    desc: 'Vegetarian & multi-course menus.',
    icon: 'catering',
    appliesTo: ['wedding', 'birthday', 'puberty', 'gettogether', 'housewarming'],
    tags: ['Min guests', 'Advance order'],
  },
  {
    id: 'decor',
    name: 'Decoration & Floral',
    desc: 'Stage, florals, lighting.',
    icon: 'decor',
    appliesTo: ['wedding', 'birthday', 'puberty', 'gettogether', 'housewarming'],
  },
  {
    id: 'photo',
    name: 'Photography & Video',
    desc: 'Candid + cinematic coverage.',
    icon: 'photo',
    appliesTo: ['wedding', 'birthday', 'puberty', 'gettogether', 'housewarming'],
    tags: ['Limited dates', 'Deposit'],
  },
  {
    id: 'music',
    name: 'Music / DJ / Band',
    desc: 'Live bands or DJ sets.',
    icon: 'music',
    appliesTo: ['wedding', 'birthday', 'gettogether', 'housewarming'],
  },
  {
    id: 'transport',
    name: 'Transportation',
    desc: 'Decorated cars, vans, buses.',
    icon: 'transport',
    appliesTo: ['wedding', 'puberty', 'gettogether', 'housewarming'],
    tags: ['Book 1+ week ahead'],
  },
];

@Component({
  selector: 'app-service-categories',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './service-categories.html',
  styleUrl: './service-categories.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceCategoriesComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly storage = inject(LocalStorageService);

  private _eventType: EventKey = DEFAULT_EVENT_TYPE;

  readonly selected = signal<Set<string>>(new Set());
  readonly query = signal('');
  readonly activeType = signal<EventKey>(DEFAULT_EVENT_TYPE);
  readonly services = signal<ServiceItem[]>(CATEGORIES);

  @Output() servicesSelected = new EventEmitter<string[]>();

  readonly progressSteps = [
    { step: 1, label: 'Choose Mood', status: 'done' },
    { step: 2, label: 'Select Services', status: 'active' },
    { step: 3, label: 'Confirm', status: 'upcoming' },
  ];

  ngOnInit() {
    const savedType = this.storage.get<EventKey>('festivaz_eventType');
    this._eventType = savedType ?? DEFAULT_EVENT_TYPE;
    this.activeType.set(this._eventType);
  }

  readonly filtered = computed(() => {
    const type = this.activeType();
    const q = this.query();
    const hasQuery = q.length > 0;

    return this.services().filter((item) => {
      if (!item.appliesTo.includes(type)) return false;
      if (!hasQuery) return true;

      const haystack = `${item.name} ${item.desc} ${(item.tags ?? []).join(' ')}`.toLowerCase();
      return haystack.includes(q);
    });
  });

  setQuery(value: string) {
    this.query.set((value ?? '').trim().toLowerCase());
  }

  handleSearchSubmit(value: string, event?: Event) {
    event?.preventDefault();
    this.setQuery(value);
  }

  toggle(id: string) {
    const next = new Set(this.selected());
    next.has(id) ? next.delete(id) : next.add(id);
    this.selected.set(next);
  }

  isSelected(id: string): boolean {
    return this.selected().has(id);
  }

  confirmSelection() {
    const selection = Array.from(this.selected());
    if (!selection.length) return;

    this.storage.save('festivaz_selectedServices', selection);

    this.servicesSelected.emit(selection);
    this.router.navigate(['/create-event/overview'], {
      state: { selectedServiceIds: selection, eventType: this.activeType() },
    });
  }

  // Helper for displaying readable event label
  get eventLabel(): string {
    const map: Record<EventKey, string> = {
      wedding: 'Wedding',
      birthday: 'Birthday',
      puberty: 'Puberty Ceremony',
      housewarming: 'Housewarming',
      gettogether: 'Get Together',
    };
    return map[this._eventType];
  }
}
