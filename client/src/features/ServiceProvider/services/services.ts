import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type ServicePackage = {
  title: string;
  tier: string;
  description: string;
  deliverables: string[];
  status: 'featured' | 'standard';
  investment: string;
};

@Component({
  selector: 'app-service-provider-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.html',
  styleUrl: './services.css'
})
export class Services {
  readonly packages: ServicePackage[] = [
    {
      title: 'Signature Immersion',
      tier: 'Flagship',
      description: 'Full creative direction across ceremonies with on-ground art direction.',
      deliverables: ['Moodboard trilogy', 'Vendor curation', 'Experience choreography'],
      status: 'featured',
      investment: 'Starts ₹4.5L'
    },
    {
      title: 'Curated Chapters',
      tier: 'Premium',
      description: 'Pick moments that need our aesthetic finesse.',
      deliverables: ['Ceremony styling', 'Hospitality playbook', 'Lighting direction'],
      status: 'standard',
      investment: 'Starts ₹2.8L'
    },
    {
      title: 'Design Sprints',
      tier: 'Studio',
      description: 'Fast-tracked concept decks for intimate or fusion events.',
      deliverables: ['Concept blueprint', 'Palette build', 'Vendor brief kit'],
      status: 'standard',
      investment: 'Starts ₹95k'
    }
  ];

  readonly addOns = [
    { title: 'Sustainable floral upgrades', note: 'Cut waste by 40%' },
    { title: 'Concierge-level guest gifting', note: 'Hand-picked, locally sourced' },
    { title: 'After-party mood lighting', note: 'Concert-style reveal' }
  ];
}
