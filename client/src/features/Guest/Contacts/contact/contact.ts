import { Component, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare const L: any;

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css'],
})
export class Contact implements AfterViewInit {
  // Primary hero image expected to live in client/public
  // Use the existing public asset placed by you: contactus.jpeg
  defaultHero = '/contactus.jpeg';
  // Fallback if the image is missing or fails to load
  fallbackHero = '/user.png';

  // Form state
  form = { name: '', email: '', subject: '', message: '' };
  loading = false;
  errorMsg = '';
  successMsg = '';

  onHeroError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    img.src = this.fallbackHero;
  }

  onSubmit() {
    this.errorMsg = '';
    this.successMsg = '';
    if (!this.form.name || !this.form.email || !this.form.message) {
      this.errorMsg = 'Please fill in your name, email, and message.';
      return;
    }
    this.loading = true;
    // Simulate async send; replace with real API call later
    setTimeout(() => {
      this.loading = false;
      this.successMsg = 'Thanks! Your message has been sent.';
      this.form = { name: '', email: '', subject: '', message: '' };
    }, 500);
  }

  ngAfterViewInit(): void {
    // Initialize Leaflet map after view is ready
    if (typeof (window as any).L === 'undefined') return;
    const container = document.getElementById('contact-map');
    if (!container) return; // Skip if template uses embedded iframe map instead
  // Jaffna, Sri Lanka
  const coords: [number, number] = [9.6615, 80.0255];
    const map = L.map('contact-map', {
      center: coords,
  zoom: 13,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Gold-accented marker to match theme
    const marker = L.circleMarker(coords, {
      radius: 8,
      color: '#c88b35',
      fillColor: '#d8a24a',
      fillOpacity: 0.95,
      weight: 2,
    }).addTo(map);

    marker.bindPopup('<strong>FestivaZ</strong><br/>Jaffna, Sri Lanka');
  }
}
