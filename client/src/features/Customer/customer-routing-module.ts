import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard as CustomerDashboard } from './dashboard/dashboard';
import { ServiceCategoriesComponent } from './service-categories/service-categories';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: CustomerDashboard },
  { path: 'services', component: ServiceCategoriesComponent },
  {
    path: 'providers/:categoryId',
    loadComponent: () =>
      import('./service-providers/service-providers.component').then(
        (m) => m.ServiceProvidersComponent
      ),
  },
  {
    path: 'provider-profile/:id',
    loadComponent: () =>
      import('./provider-profile/provider-profile.component').then(
        (m) => m.ProviderProfileComponent
      ),
  },
  {
    path: 'booking/:providerId',
    loadComponent: () =>
      import('./Booking/booking-page.component').then(
        (m) => m.BookingPageComponent
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
