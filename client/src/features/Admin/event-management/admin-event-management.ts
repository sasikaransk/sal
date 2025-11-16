import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  CreateEventTypePayload,
  EventType,
  EventTypeAdminService,
  UpdateEventTypePayload,
} from './event-type-admin.service';

@Component({
  selector: 'app-admin-event-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-event-management.html',
})
export class AdminEventManagement implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly eventTypeService = inject(EventTypeAdminService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly eventForm = this.fb.group(
    {
      eventTypeId: [0],
      eventName: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      seasonPreference: [''],
      // Explicitly type as number | null to satisfy Angular typed forms
      minBudget: this.fb.control<number | null>(null, [Validators.min(0)]),
      maxBudget: this.fb.control<number | null>(null, [Validators.min(0)]),
      sortOrder: [1, [Validators.required, Validators.min(0)]],
      iconUrl: [''],
      isActive: [true],
    },
    { validators: budgetRangeValidator }
  );

  protected readonly loading = signal(false);
  protected readonly loadingSeasons = signal(false);
  protected readonly saving = signal(false);
  protected readonly deleting = signal<number | null>(null);
  protected readonly feedback = signal<{ variant: 'success' | 'error'; text: string } | null>(null);
  protected readonly eventTypes = signal<EventType[]>([]);
  protected readonly seasonOptions = signal<string[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly formMode = signal<'create' | 'edit'>('create');
  // Always show all (active + inactive) in the live data table per product requirement
  protected readonly showInactive = signal(true);
  protected readonly activeCount = computed(() => this.eventTypes().reduce((n, e) => n + (e.isActive ? 1 : 0), 0));
  protected readonly inactiveCount = computed(() => Math.max(0, this.eventTypes().length - this.activeCount()));

  protected readonly filteredEventTypes = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    // Show all items; only apply text search filtering
    const items = this.eventTypes();
    if (!term) return items;
    return items.filter(item => {
      const haystack = `${item.eventName} ${item.description ?? ''} ${item.seasonPreference ?? ''}`.toLowerCase();
      return haystack.includes(term);
    });
  });

  protected readonly isEditing = computed(() => this.formMode() === 'edit');

  ngOnInit(): void {
    this.resetForm();
    this.loadSeasons();
    this.loadEventTypes();
  }

  protected loadEventTypes(): void {
    this.loading.set(true);
    this.eventTypeService
      // Always request inactive records as well, using common backend flags
      .getEventTypes({ includeInactive: true })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: eventTypes => this.eventTypes.set(this.sortEventTypes(eventTypes)),
        error: error => this.showFeedback('error', this.resolveError(error, 'load event types')),
      });
  }

  protected loadSeasons(): void {
    this.loadingSeasons.set(true);
    this.eventTypeService
      .getSeasons()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingSeasons.set(false))
      )
      .subscribe({
        next: seasons => this.seasonOptions.set(seasons),
        error: () => this.seasonOptions.set(['Spring', 'Summer', 'Autumn', 'Winter', 'Monsoon', 'All-Season']),
      });
  }

  /**
   * Requirement change: admin should always see all event types (active + inactive) in Live data.
   * The previous implementation filtered out inactive unless a toggle was enabled. We now:
   *  - Force includeInactive=true on service request
   *  - Remove client-side active filtering in `filteredEventTypes`
   *  - Keep method name `toggleShowInactive` as a harmless no-op to avoid template errors if referenced elsewhere.
   */

  protected onSubmit(): void {
    this.eventForm.markAllAsTouched();
    if (this.eventForm.invalid) return;

    const base = this.toEventType();
    this.saving.set(true);
    if (this.isEditing()) {
      this.updateEventType(base);
    } else {
      this.createEventType(base);
    }
  }

  protected editEventType(eventType: EventType): void {
    this.formMode.set('edit');
    // Maintain typed controls for minBudget/maxBudget; cast other primitives appropriately
    this.eventForm.patchValue({
      eventTypeId: eventType.eventTypeId,
      eventName: eventType.eventName,
      description: eventType.description ?? '',
      seasonPreference: eventType.seasonPreference ?? '',
      minBudget: eventType.minBudget ?? null,
      maxBudget: eventType.maxBudget ?? null,
      sortOrder: eventType.sortOrder,
      iconUrl: eventType.iconUrl ?? '',
      isActive: eventType.isActive,
    });
    // If incoming value isn't present in options (legacy/custom), append temporarily so it appears selected
    const season = (eventType.seasonPreference ?? '').trim();
    if (season && !this.seasonOptions().includes(season)) {
      this.seasonOptions.update(list => [...list, season]);
    }
    this.scrollToTop();
  }

  protected deleteEventType(eventType: EventType): void {
    const confirmed =
      typeof window !== 'undefined'
        ? window.confirm(`Delete "${eventType.eventName}"? This cannot be undone.`)
        : true;

    if (!confirmed) return;

    this.deleting.set(eventType.eventTypeId);
    this.eventTypeService
      .deleteEventType(eventType.eventTypeId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.deleting.set(null))
      )
      .subscribe({
        next: () => {
          this.showFeedback('success', `"${eventType.eventName}" deleted.`);
          this.eventTypes.update(items => items.filter(item => item.eventTypeId !== eventType.eventTypeId));
          if (this.eventForm.getRawValue().eventTypeId === eventType.eventTypeId) {
            this.resetForm();
          }
        },
        error: error => this.showFeedback('error', this.resolveError(error, 'delete event type')),
      });
  }

  protected cancelEdit(): void {
    this.resetForm();
  }

  protected onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  protected clearSearch(): void {
    this.searchTerm.set('');
  }

  // Toggle disabled: requirement is to always show all
  protected toggleShowInactive(): void {
    // No-op; enforce showing all
    if (!this.showInactive()) {
      this.showInactive.set(true);
      this.loadEventTypes();
    }
  }

  protected toggleActive(event: EventType): void {
    const previous = { ...event };
    const newValue = !event.isActive;
    const updated: EventType = { ...event, isActive: newValue };
    // Optimistic list update
    this.eventTypes.update(list => list.map(i => (i.eventTypeId === event.eventTypeId ? updated : i)));
    // If editing this item, patch the form
    if (this.isEditing() && this.eventForm.getRawValue().eventTypeId === event.eventTypeId) {
      this.eventForm.patchValue({ isActive: newValue });
    }
    this.saving.set(true);
    this.eventTypeService
      .updateEventType(updated)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false))
      )
      .subscribe({
        next: () => this.showFeedback('success', `Event "${event.eventName}" ${newValue ? 'activated' : 'deactivated'}.`),
        error: error => {
          // Revert
          this.eventTypes.update(list => list.map(i => (i.eventTypeId === previous.eventTypeId ? previous : i)));
          if (this.isEditing() && this.eventForm.getRawValue().eventTypeId === previous.eventTypeId) {
            this.eventForm.patchValue({ isActive: previous.isActive });
          }
          this.showFeedback('error', this.resolveError(error, newValue ? 'activate event type' : 'deactivate event type'));
        },
      });
  }

  protected dismissFeedback(): void {
    this.feedback.set(null);
  }

  protected trackByEventId(_index: number, event: EventType): number {
    return event.eventTypeId;
  }

  protected get hasBudgetRangeError(): boolean {
    if (!this.eventForm.hasError('budgetRange')) return false;
    const minCtrl = this.eventForm.get('minBudget');
    const maxCtrl = this.eventForm.get('maxBudget');
    return Boolean(minCtrl && maxCtrl && (minCtrl.touched || maxCtrl.touched));
  }

  private createEventType(base: EventType): void {
    const payload: CreateEventTypePayload = {
      eventName: base.eventName,
      description: base.description ?? null,
      seasonPreference: base.seasonPreference ?? null,
      minBudget: base.minBudget ?? null,
      maxBudget: base.maxBudget ?? null,
      sortOrder: base.sortOrder,
      iconUrl: base.iconUrl ?? null,
    };

    this.eventTypeService
      .createEventType(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false))
      )
      .subscribe({
        next: () => {
          this.showFeedback('success', 'Event type created successfully.');
          this.resetForm();
          this.loadEventTypes();
        },
        error: error => this.showFeedback('error', this.resolveError(error, 'create event type')),
      });
  }

  private updateEventType(base: EventType): void {
    const payload: UpdateEventTypePayload = { ...base };
    this.eventTypeService
      .updateEventType(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false))
      )
      .subscribe({
        next: () => {
          this.showFeedback('success', 'Event type updated successfully.');
          this.resetForm();
          this.loadEventTypes();
        },
        error: error => this.showFeedback('error', this.resolveError(error, 'update event type')),
      });
  }

  protected resetForm(): void {
    this.formMode.set('create');
    this.eventForm.reset({
      eventTypeId: 0,
      eventName: '',
      description: '',
      seasonPreference: '',
      minBudget: null,
      maxBudget: null,
      sortOrder: this.nextSortOrder(),
      iconUrl: '',
      isActive: true,
    });
    this.eventForm.markAsPristine();
    this.eventForm.markAsUntouched();
  }

  private toEventType(): EventType {
    const raw = this.eventForm.getRawValue();
    return {
      eventTypeId: Number(raw.eventTypeId ?? 0),
      eventName: (raw.eventName ?? '').trim(),
      description: (raw.description ?? '').trim() || null,
      seasonPreference: (raw.seasonPreference ?? '').trim() || null,
      minBudget: this.toNumber(raw.minBudget),
      maxBudget: this.toNumber(raw.maxBudget),
      sortOrder: Number(raw.sortOrder ?? 0),
      iconUrl: (raw.iconUrl ?? '').trim() || null,
      isActive: Boolean(raw.isActive),
    };
  }

  private toNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private sortEventTypes(eventTypes: EventType[]): EventType[] {
    return [...eventTypes].sort((a, b) => {
      const orderDelta = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      if (orderDelta !== 0) return orderDelta;
      return a.eventName.localeCompare(b.eventName);
    });
  }

  private nextSortOrder(): number {
    const values = this.eventTypes().map(event => event.sortOrder ?? 0);
    if (!values.length) return 1;
    return Math.max(...values) + 1;
  }

  private showFeedback(variant: 'success' | 'error', text: string): void {
    this.feedback.set({ variant, text });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  private resolveError(error: unknown, action: string): string {
    const fallback = `Unable to ${action}. Please try again.`;
    if (!error) return fallback;
    if (typeof error === 'string') return error;
    const serverMessage =
      (error as any)?.error?.message ||
      (error as any)?.error?.title ||
      (error as any)?.message;
    return serverMessage ?? fallback;
  }

  private scrollToTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

function budgetRangeValidator(group: AbstractControl): ValidationErrors | null {
  const min = group.get('minBudget')?.value;
  const max = group.get('maxBudget')?.value;
  if (min != null && max != null && min !== '' && max !== '' && Number(min) > Number(max)) {
    return { budgetRange: true };
  }
  return null;
}
