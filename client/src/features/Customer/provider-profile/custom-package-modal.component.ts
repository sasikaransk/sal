import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  computed,
  signal,
} from '@angular/core';

export interface CustomPackagePayload {
  services: string[];
  notes: string;
  total: number;
}

interface AddOnOption {
  id: string;
  label: string;
  description: string;
  price: number;
}

const ADD_ONS: AddOnOption[] = [
  {
    id: 'cinematic-film',
    label: 'Cinematic Film',
    description: 'Story-driven film edit & teaser for socials.',
    price: 65000,
  },
  {
    id: 'artisan-florals',
    label: 'Artisan Florals',
    description: 'Hand-wrapped florals & sculpted installations.',
    price: 48000,
  },
  {
    id: 'illumination-story',
    label: 'Immersive Lighting',
    description: 'Programmable lights & theatrical haze cues.',
    price: 52000,
  },
  {
    id: 'culinary-poetry',
    label: 'Culinary Poetry',
    description: 'Chef-led tasting & bespoke dessert moments.',
    price: 36000,
  },
];

@Component({
  selector: 'app-custom-package-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-package-modal.component.html',
  styleUrl: './custom-package-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomPackageModalComponent {
  private readonly basePrice = 120000;
  readonly addOns = ADD_ONS;
  readonly notes = signal('');
  readonly selectedServices = signal<Set<string>>(new Set());

  @Input() providerName: string | null = null;

  @Input()
  set initialNotes(value: string | null) {
    this.notes.set(value || '');
  }

  @Input()
  set initialServices(value: string[] | null) {
    const next = new Set<string>(value ?? []);
    this.selectedServices.set(next);
  }

  @Output() close = new EventEmitter<void>();
  @Output() submitRequest = new EventEmitter<CustomPackagePayload>();

  readonly addOnsTotal = computed(() =>
    Array.from(this.selectedServices()).reduce((acc, optionId) => {
      const option = this.addOns.find((item) => item.id === optionId);
      return option ? acc + option.price : acc;
    }, 0)
  );

  readonly total = computed(() => this.basePrice + this.addOnsTotal());

  isSelected(id: string) {
    return this.selectedServices().has(id);
  }

  toggleService(id: string) {
    const next = new Set(this.selectedServices());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.selectedServices.set(next);
  }

  onNotesChange(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.notes.set(target?.value ?? '');
  }

  submit() {
    if (!this.selectedServices().size) {
      return;
    }
    this.submitRequest.emit({
      services: Array.from(this.selectedServices()),
      notes: this.notes(),
      total: this.total(),
    });
  }

  dismiss() {
    this.close.emit();
  }

  hasSelection() {
    return this.selectedServices().size > 0;
  }

  @HostListener('document:keydown.escape')
  handleEscape() {
    this.dismiss();
  }
}
