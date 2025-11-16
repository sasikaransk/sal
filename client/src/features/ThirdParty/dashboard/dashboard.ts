import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  driver = {
    name: 'Ariana Chen',
    role: 'Lead Third-Party Driver',
    avatar: '/driver.png',
    rating: 4.9,
    completed: 128,
    responseTime: '12m avg'
  };

  stats = [
    { title: 'Active Deliveries', value: 3, change: '+12%', trend: 'up' },
    { title: 'Events Today', value: 5, change: '2 new', trend: 'neutral' },
    { title: 'Avg. Satisfaction', value: '4.8/5', change: '+0.3', trend: 'up' },
    { title: 'Pending Tasks', value: 7, change: '-3', trend: 'down' },
  ];

  deliveries = [
    {
      id: '#EZ-84',
      event: 'Sunset Rooftop Reception',
      customer: 'Nova Events Co.',
      window: '14:30 - 15:15',
      location: 'Harborview Pavilion',
      status: 'On Route',
      priority: 'High'
    },
    {
      id: '#EZ-79',
      event: 'Midnight Masquerade',
      customer: 'Aurora Luxury',
      window: '18:00 - 18:45',
      location: 'Elysian Ballroom',
      status: 'Stage Ready',
      priority: 'Medium'
    },
    {
      id: '#EZ-75',
      event: 'Garden Vows Ceremony',
      customer: 'Florence Planners',
      window: '10:15 - 11:00',
      location: 'Botanic Courtyard',
      status: 'Delivered',
      priority: 'Low'
    },
  ];

  upcomingEvents = [
    {
      name: 'Neon Nights Festival',
      date: 'Nov 12 • 20:00',
      service: 'Lighting Rig + Bar Setup',
      status: 'Briefing 17:00'
    },
    {
      name: 'Luxe Corporate Summit',
      date: 'Nov 14 • 07:30',
      service: 'Audio Visual + Catering Logistics',
      status: 'Route Check'
    },
    {
      name: 'Starlit Charity Gala',
      date: 'Nov 16 • 19:30',
      service: 'VIP Transport Coordination',
      status: 'Awaiting Permits'
    },
  ];

  notifications = [
    'Hydration carts requested for Sunset Rooftop Reception.',
    'Route 3 congestion alert: add 8 minutes buffer.',
    'New driver handbook revisions released this morning.',
  ];

  insights = [
    { label: 'On-Time Arrival', value: 96, accent: '#DBEAFE' },
    { label: 'Gear Readiness', value: 91, accent: '#DCFCE7' },
    { label: 'Client Feedback', value: 88, accent: '#FEE2E2' },
  ];

  get driverInitials(): string {
    return this.driver.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase();
  }
}
