import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventCategory } from './events.data';
import { EventService } from '../../../../core/services/event.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './events.html',
  styleUrls: ['./events.css']
})
export class Events implements OnInit {
  private eventService = inject(EventService);

  // Theme-aware filters
  readonly allFilters = [
    { key: 'All', label: 'All' },
    { key: 'Wedding', label: 'Wedding' },
    { key: 'Christian', label: 'Christian' },
    { key: 'Hindu', label: 'Hindu' },
    { key: 'Birthday', label: 'Birthday' },
    { key: 'Housewarming', label: 'Housewarming' },
    { key: 'Puberty', label: 'Puberty Ceremony' },
    { key: 'GetTogether', label: 'Get Together' },
  ] as const;

  protected search = signal<string>('');
  protected active = signal<string>('All');
  
  // Start with mock data, will be replaced by API data if available
  protected readonly data = signal<EventCategory[]>(this.eventService.getMockEvents());
  protected readonly isLoading = signal<boolean>(true);

  ngOnInit() {
    // Fetch from API, with automatic fallback to mock data
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.data.set(events);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.isLoading.set(false);
        // data already has mock data from initialization
      }
    });
  }

  protected readonly results = computed(() => {
    const term = this.search().trim().toLowerCase();
    const chip = this.active();
    return this.data().filter(item => {
      const matchesChip = chip === 'All' || item.tags.includes(chip) || item.title.toLowerCase().includes(chip.toLowerCase());
      const matchesSearch = !term || item.title.toLowerCase().includes(term) || item.description.toLowerCase().includes(term);
      return matchesChip && matchesSearch;
    });
  });

  setActive(next: string) {
    this.active.set(next);
  }
}
