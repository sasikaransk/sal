import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-service-provider-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  readonly essentials = [
    { label: 'Base city', value: 'Bengaluru • travels PAN India' },
    { label: 'Experience', value: '8+ years crafting luxury celebrations' },
    { label: 'Team strength', value: '12 full-time stylists & artisans' },
    { label: 'Avg. turnaround', value: '4 days for curated concepts' }
  ];

  readonly expertiseTags = [
    'Immersive décor storytelling',
    'Modern mandap curation',
    'Artisan network',
    'Hospitality choreography',
    'Sustainable installations'
  ];

  readonly experienceTimeline = [
    {
      period: '2025',
      title: 'Residency partner, FestivaZ',
      detail: 'Lead curator for premium cross-city takeovers.'
    },
    {
      period: '2023',
      title: 'Featured stylist, Vogue Weddings',
      detail: 'Recognised for transitional experiences and lighting.'
    },
    {
      period: '2022',
      title: 'Scaled bespoke atelier',
      detail: 'Expanded artisan network to Rajasthan and Kerala.'
    }
  ];

  readonly signatureServices = [
    {
      name: 'Bespoke décor direction',
      description: 'Complete visual language, moodboarding and styling cues tailored per ceremony.',
      investment: 'Starting ₹1.2L'
    },
    {
      name: 'On-ground art direction',
      description: 'White-glove execution, vendor alignment and timeline choreography.',
      investment: '₹85k for first day • ₹35k add-on per day'
    },
    {
      name: 'Experiential hospitality',
      description: 'Guest journey scripting with lounge curation, gifting and hospitality playbooks.',
      investment: 'Custom proposal'
    }
  ];
}
