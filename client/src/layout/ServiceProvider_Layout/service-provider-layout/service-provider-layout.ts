import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppHeaderComponent } from '../../../features/Common/home/app-header/app-header.component';
import { ChatbotComponent } from '../../chatbot/chatbot.component';

@Component({
  selector: 'app-service-provider-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AppHeaderComponent,
    ChatbotComponent
  ],
  templateUrl: './service-provider-layout.html',
  styleUrl: './service-provider-layout.css'
})
export class ServiceProviderLayout {
  readonly sidebarLinks = [
    { label: 'Dashboard', icon: 'gauge', path: 'dashboard' },
    { label: 'Profile', icon: 'person', path: 'profile' },
    { label: 'Bookings', icon: 'calendar', path: 'bookings' },
    { label: 'Payments', icon: 'credit_card', path: 'payments' },
    { label: 'Messages', icon: 'chat', path: 'messages' },
    { label: 'Services', icon: 'handshake', path: 'services' }
  ];

  readonly badges = [
    { label: 'Response Rate', value: '98%' },
    { label: 'Avg. Rating', value: '4.9' },
    { label: 'Active Packages', value: '6' }
  ];

  readonly spotlightNotes = [
    'Remember to refresh your portfolio before the weekend rush.',
    'You have 2 quotes expiring in the next 24 hours.',
    'Boost payouts by promoting your premium décor bundle.'
  ];
}
