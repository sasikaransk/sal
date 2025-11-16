import { AfterViewInit, Component, signal } from '@angular/core';

import { AppHeaderComponent } from './app-header/app-header.component';
import { HeroSectionComponent } from './hero-section/hero-section.component';
import { HowItWorksComponent } from './how-it-works/how-it-works.component';
import { EventCategoriesComponent } from './event-categories/event-categories.component';
import { ServicesComponent } from './services/services.component';
import { FeaturedProvidersComponent } from './featured-providers/featured-providers.component';
import { FeaturedEventsComponent } from './featured-events/featured-events.component';
import { TestimonialsComponent } from './testimonials/testimonials.component';
import { ProfessionalTouchComponent } from './professional-touch/professional-touch.component';
import { NewsletterComponent } from './newsletter/newsletter.component';
import { AppFooterComponent } from './app-footer/app-footer.component';
import { Register } from '../../account/register/register';

declare const AOS: {
  init: (options?: {
    duration?: number;
    easing?: string;
    once?: boolean;
    offset?: number;
  }) => void;
  refresh?: () => void;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    Register,
    AppHeaderComponent,
    HeroSectionComponent,
    HowItWorksComponent,
    EventCategoriesComponent,
    ServicesComponent,
    FeaturedProvidersComponent,
    FeaturedEventsComponent,
    TestimonialsComponent,
    ProfessionalTouchComponent,
    NewsletterComponent,
    AppFooterComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements AfterViewInit {

  protected registerMode = signal(false);

  showRegister(value: boolean) {
    this.registerMode.set(value);
  }

  ngAfterViewInit(): void {
    if (typeof AOS !== 'undefined' && AOS) {
      setTimeout(() => {
        AOS.init({
          duration: 750,
          easing: 'ease-out-cubic',
          once: true,
        });
        AOS.refresh?.();
      });
    }
  }
}
