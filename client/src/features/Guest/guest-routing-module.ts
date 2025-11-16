import { Routes } from '@angular/router';
import { Home } from '../Common/home/home';
import { About } from './About/about/about';
import { Contact } from './Contacts/contact/contact';
import { Events } from './Events/events/events';
import { EventDetails } from './Events/events/details/event-details';
import { CreateEvent } from './CreateEvent/create-event/create-event';
import { Login } from '../account/login/login';
import { Register } from '../account/register/register';
import { GalleryComponent } from './Gallery/gallery/gallery.component';
import { RegisterServiceprovider } from '../account/register-serviceprovider/register-serviceprovider';
import { ServiceCategoriesComponent } from '../Customer/service-categories/service-categories';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: 'events', component: Events },
  { path: 'events/:id', component: EventDetails },
  { path: 'create-event', component: CreateEvent },
  { path: 'create-event/services', component: ServiceCategoriesComponent },
  {
    path: 'create-event/overview',
    loadComponent: () =>
      import('../Customer/service-overview/service-overview.component').then(
        m => m.ServiceOverviewComponent
      ),
  },
    {
    path: 'providers/:categoryId',
    loadComponent: () =>
      import('../Customer/service-providers/service-providers.component').then(
        (m) => m.ServiceProvidersComponent
      ),
  },
    {
    path: 'provider-profile/:id',
    loadComponent: () =>
      import('../Customer/provider-profile/provider-profile.component').then(
        (m) => m.ProviderProfileComponent
      ),
  },
  {
    path: 'booking/:providerId',
    loadComponent: () =>
      import('../Customer/Booking/booking-page.component').then(
        (m) => m.BookingPageComponent
      ),
  },
  { path: 'gallery', component: GalleryComponent},
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'register-serviceprovider', component: RegisterServiceprovider },
  { path: 'services', component: ServiceCategoriesComponent },
  { path: '**', redirectTo: '' }
];
