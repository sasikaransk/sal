import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-service-provider-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  readonly insightCards = [
    {
      label: 'Active Bookings',
      value: '12',
      detail: '3 deliver this weekend',
      trend: '+2.3% week over week',
      trendType: 'positive'
    },
    {
      label: 'Projected Revenue',
      value: '₹4.2L',
      detail: 'Across premium packages',
      trend: '+₹38k from add-ons',
      trendType: 'positive'
    },
    {
      label: 'Avg. Response Time',
      value: '1h 12m',
      detail: 'Goal • under 2 hours',
      trend: '8 new leads waiting',
      trendType: 'neutral'
    },
    {
      label: 'Experience Rating',
      value: '4.9',
      detail: 'Last 10 verified reviews',
      trend: '2 mentions of décor finesse',
      trendType: 'highlight'
    }
  ];

  readonly pipeline = [
    {
      client: 'Kavan & Mira',
      date: 'Nov 18',
      package: 'Immersive Sangeet',
      stage: 'Design review',
      location: 'Hyderabad',
      status: 'in-progress'
    },
    {
      client: 'Noah & Hana',
      date: 'Nov 24',
      package: 'Destination Curation',
      stage: 'Venue walk-through',
      location: 'Pune',
      status: 'scheduled'
    },
    {
      client: 'Vihaan & Isha',
      date: 'Dec 02',
      package: 'Luxury Reception',
      stage: 'Logistics lock',
      location: 'Jaipur',
      status: 'at-risk'
    }
  ];

  readonly actionItems = [
    {
      title: 'Refresh floral palette for Mira',
      due: 'Today • 6:00 PM',
      priority: 'high'
    },
    {
      title: 'Share lighting plan with Vihaan',
      due: 'Tomorrow • 11:00 AM',
      priority: 'medium'
    },
    {
      title: 'Confirm art install permits',
      due: 'Friday • 4:00 PM',
      priority: 'low'
    }
  ];

  readonly curationHighlights = [
    {
      label: 'Premium décor bundle',
      value: 'Booked 5 times in November'
    },
    {
      label: 'New experience',
      value: 'Sustainable welcome lounge beta'
    },
    {
      label: 'Top mention',
      value: '"Immaculate transitions" • Rianka'
    }
  ];
}
