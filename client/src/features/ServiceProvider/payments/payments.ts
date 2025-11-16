import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-service-provider-payments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payments.html',
  styleUrl: './payments.css'
})
export class Payments {
  readonly payoutSummary = [
    { label: 'Cleared this month', value: '₹3.2L', detail: '8 bookings settled' },
    { label: 'Processing', value: '₹92k', detail: '2 experiences' },
    { label: 'Due today', value: '₹58k', detail: 'Share completion update' }
  ];

  readonly payouts = [
    {
      couple: 'Anya & Vivaan',
      stage: 'Pending completion note',
      amount: '₹58k',
      due: 'Due today',
      status: 'action'
    },
    {
      couple: 'Kavan & Mira',
      stage: 'Processing with FestivaZ',
      amount: '₹1.2L',
      due: '48h',
      status: 'processing'
    },
    {
      couple: 'Noah & Hana',
      stage: 'Advance scheduled',
      amount: '₹92k',
      due: 'Nov 20',
      status: 'scheduled'
    }
  ];

  readonly insights = [
    'Add a premium décor add-on to raise average order value by ₹40k.',
    'Stay in the 48h payout lane by logging completion notes within 6h.',
    'Use FestivaZ Pay to auto-chase vendor reimbursements.'
  ];
}
