import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Profile } from './profile/profile';
import { Bookings } from './bookings/bookings';
import { Payments } from './payments/payments';
import { Messages } from './messages/messages';
import { Services } from './services/services';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'profile', component: Profile },
  { path: 'bookings', component: Bookings },
  { path: 'payments', component: Payments },
  { path: 'messages', component: Messages },
  { path: 'services', component: Services }
];
