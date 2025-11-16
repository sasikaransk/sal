import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LocalStorageService } from '../../../../core/services/local-storage.service'; // ✅ correct path

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-event.html',
  styleUrls: ['./create-event.css']
})
export class CreateEvent implements OnDestroy {
  readonly eventTypes = [
    { id: 'wedding', label: 'Wedding', description: 'Timeless vows & handcrafted memories.' },
    { id: 'birthday', label: 'Birthday', description: 'Playful details for every milestone.' },
    { id: 'puberty', label: 'Puberty Ceremony', description: 'Graceful traditions filled with warmth.' },
    { id: 'home-warming', label: 'Home Warming', description: 'Cozy welcomes for new chapters.' },
    { id: 'get-together', label: 'Get Together', description: 'Intimate soirées & reunions.' }
  ];

  readonly createEventForm: FormGroup;
  private successTimeoutId?: ReturnType<typeof setTimeout>;
  isSubmitted = false;
  showSuccessToast = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly storage: LocalStorageService // ✅ inject service
  ) {
    this.createEventForm = this.formBuilder.group({
      eventType: ['', Validators.required],
      eventName: ['', Validators.required],
      venue: [''],
      venueType: ['', Validators.required],
      eventDate: ['', Validators.required],
      eventTime: [''],
      guestCount: [null],
      specialRequirements: ['']
    });
  }

  ngOnDestroy(): void {
    if (this.successTimeoutId) {
      clearTimeout(this.successTimeoutId);
    }
  }

  get selectedEventType(): string | null {
    return this.createEventForm.get('eventType')?.value ?? null;
  }

  getControl(controlName: string) {
    return this.createEventForm.get(controlName);
  }

  isInvalid(controlName: string): boolean {
    const control = this.getControl(controlName);
    if (!control) {
      return false;
    }
    return control.invalid && (control.dirty || control.touched || this.isSubmitted);
  }

  selectEventType(typeId: string): void {
    this.createEventForm.get('eventType')?.setValue(typeId);
    this.createEventForm.get('eventType')?.markAsTouched();
  }

  onSubmit(): void {
    this.isSubmitted = true;

    if (this.createEventForm.invalid) {
      this.createEventForm.markAllAsTouched();
      this.showSuccessToast = false;
      if (this.successTimeoutId) {
        clearTimeout(this.successTimeoutId);
        this.successTimeoutId = undefined;
      }
      return;
    }

    this.showSuccessToast = true;
    if (this.successTimeoutId) {
      clearTimeout(this.successTimeoutId);
    }
    this.successTimeoutId = setTimeout(() => {
      this.showSuccessToast = false;
    }, 4000);

    // ✅ Save selected event type for next step
    const selectedType = this.createEventForm.get('eventType')?.value;
    if (selectedType) {
      this.storage.save('festivaz_eventType', selectedType);
    }

    // ✅ Optional: Save full form data for continuity
    this.storage.save('festivaz_eventData', this.createEventForm.value);

    // ✅ Navigate to Step 2 (Select Services)
    this.router.navigate(['/services']);
  }
}
