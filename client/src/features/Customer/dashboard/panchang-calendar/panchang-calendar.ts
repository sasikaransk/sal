import { Component, OnInit, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { HOLIDAYS_2025 } from './holidays-2025';

@Component({
  selector: 'app-panchang-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panchang-calendar.html',
  styleUrls: ['./panchang-calendar.css']
})
export class PanchangCalendarComponent implements OnInit {
  @Output() dateSelected = new EventEmitter<any>();
  private http = inject(HttpClient);

  // Location search state
  locationQuery = '';
  searchResults: Array<any> = [];
  selectedLocation: { display_name: string, lat: number, lon: number } | null = null;

  currentDate: Date = new Date();
  daysInMonth: Array<{ num: number | null, holiday?: any | null }> = [];
  monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor() { }

  ngOnInit(): void {
    // default location -> Jaffna
    this.selectedLocation = {
      display_name: 'Jaffna, Jaffna District, Northern Province, Sri Lanka',
      lat: 9.6615,
      lon: 80.0255
    };
  this.locationQuery = this.selectedLocation.display_name;
  console.debug('[PanchangCalendar] default location set', this.selectedLocation);

    this.generateCalendar();

    // auto-select today's date so dashboard can fetch the cached or live result
    const today = new Date();
    if (today.getFullYear() === this.currentDate.getFullYear() && today.getMonth() === this.currentDate.getMonth()) {
      const day = today.getDate();
      // emit after a tick to allow parent bindings to settle
      setTimeout(() => this.selectDate(day), 50);
    }
  }

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();

    // build a quick map of holidays for this year
    const holidayMap: Record<string, any[]> = {};
    for (const h of HOLIDAYS_2025) {
      // use start date (YYYY-MM-DD)
      const dt = h.start;
      if (!holidayMap[dt]) holidayMap[dt] = [];
      holidayMap[dt].push(h);
    }

    this.daysInMonth = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      this.daysInMonth.push({ num: null });
    }
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const rawHoliday = holidayMap[key] ? holidayMap[key][0] : null;
      let holiday = null;
      if (rawHoliday) {
        // compute category classes for styling (may include multiple)
        const cats: string[] = Array.isArray(rawHoliday.categories) ? rawHoliday.categories : [];
        const classes: string[] = [];
        if (cats.includes('Public')) classes.push('color-public');
        if (cats.includes('Bank')) classes.push('color-bank');
        if (cats.includes('Mercantile')) classes.push('color-merc');
        holiday = { ...rawHoliday, categoryClass: classes.join(' ') };
      }
      this.daysInMonth.push({ num: i, holiday });
    }
  }

  previousMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  selectDate(day: number | null): void {
    if (day) {
      const selected = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
      const dateString = `${selected.getDate()}-${selected.getMonth() + 1}-${selected.getFullYear()}`;
      // Emit date + selected location (if available)
      const payload = {
        date: dateString,
        latitude: this.selectedLocation ? Number(this.selectedLocation.lat) : undefined,
        longitude: this.selectedLocation ? Number(this.selectedLocation.lon) : undefined
      };
      console.debug('[PanchangCalendar] emitting dateSelected', payload);
      this.dateSelected.emit(payload);
    }
  }

  /** Search using OpenStreetMap Nominatim */
  async searchLocation(): Promise<void> {
    this.searchResults = [];
    const q = this.locationQuery?.trim();
    if (!q) return;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`;
    try {
      const res: any = await lastValueFrom(this.http.get(url));
      this.searchResults = Array.isArray(res) ? res : [];
    } catch (err) {
      console.error('Location search error', err);
      this.searchResults = [];
    }
  }

  selectLocation(item: any) {
    this.selectedLocation = { display_name: item.display_name, lat: Number(item.lat), lon: Number(item.lon) };
    this.searchResults = [];
    this.locationQuery = this.selectedLocation.display_name;
  }

  isToday(dayObj: any): boolean {
    const day = dayObj && typeof dayObj === 'object' ? dayObj.num : dayObj;
    const today = new Date();
    return day === today.getDate() &&
           this.currentDate.getMonth() === today.getMonth() &&
           this.currentDate.getFullYear() === today.getFullYear();
  }

  // Returns an array of CSS class names for ngClass, filtering null/undefined values
  getNgClass(day: any): string[] {
    if (!day || !day.holiday) return [];
    const out: string[] = [];
    const cat = day.holiday.categoryClass;
    if (cat) {
      // categoryClass may be space-separated classes
      out.push(...String(cat).split(/\s+/).filter(Boolean));
    }
    const freq = day.holiday.frequencyClass;
    if (freq) out.push(...String(freq).split(/\s+/).filter(Boolean));
    return out;
  }
}
