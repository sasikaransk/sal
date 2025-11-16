import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-service-provider-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css'
})
export class Bookings {
  readonly summary = [
    { label: 'Confirmed', value: 9, meta: 'Ready for execution' },
    { label: 'Pending design', value: 3, meta: 'Need creative sign-off' },
    { label: 'Awaiting payment', value: 2, meta: 'Share reminders' }
  ];

  readonly bookings = [
    {
      couple: 'Kavan & Mira',
      date: 'Nov 18',
      city: 'Hyderabad',
      service: 'Immersive Sangeet',
      stage: 'Design review',
      investment: '₹2.4L',
      status: 'confirmed'
    },
    {
      couple: 'Anya & Vivaan',
      date: 'Nov 28',
      city: 'Delhi',
      service: 'Reception runway',
      stage: 'Awaiting advance',
      investment: '₹1.6L',
      status: 'due'
    },
    {
      couple: 'Noah & Hana',
      date: 'Dec 04',
      city: 'Pune',
      service: 'Destination curation',
      stage: 'Concept deck in review',
      investment: '₹3.1L',
      status: 'pending'
    },
    {
      couple: 'Vihaan & Isha',
      date: 'Dec 11',
      city: 'Jaipur',
      service: 'Luxury reception',
      stage: 'Vendor line-up',
      investment: '₹4.0L',
      status: 'confirmed'
    }
  ];

  readonly filters = ['All', 'This week', 'Design', 'Payments'];
  activeFilter = 'All';

  setFilter(filter: string): void {
    this.activeFilter = filter;
  }
}
