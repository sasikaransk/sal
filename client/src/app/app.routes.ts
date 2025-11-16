import { Routes } from '@angular/router';
import { GuestLayout } from '../layout/Guest_Layout/guest-layout/guest-layout';
import { Dashboard as CustomerLayout } from '../layout/Customer_Layout/dashboard/dashboard';

import { Dashboard as ThirdPartyLayout } from '../features/ThirdParty/dashboard/dashboard';
import { RoleGuard } from '../core/guards/role-guard';

import { ServiceProviderLayout } from '../layout/ServiceProvider_Layout/service-provider-layout/service-provider-layout';
import { AdminLayout } from '../layout/Admin_Layout/admin-layout';
import { AdminLogin } from '../features/Admin/login/admin-login';


export const routes: Routes = [
  {
    path: 'customer',
    component: CustomerLayout,
    canActivate: [RoleGuard],
    data: { roles: ['Customer'] },
    loadChildren: () =>
      import('../features/Customer/customer-routing-module').then(
        m => m.CustomerRoutingModule
      )
  },
  {
    path: 'admin',
    component: AdminLayout,
    // canActivate: [RoleGuard],
    // data: { roles: ['SuperAdmin'] },
    loadChildren: () =>
      import('../features/Admin/dashboard/admin-pannel.routes').then(
        m => m.ADMIN_PANNEL_ROUTES
      )
  },
  {
    path: 'service-provider',
    component: ServiceProviderLayout,
    canActivate: [RoleGuard],
    data: { roles: ['ServiceProvider'] },
    loadChildren: () =>
      import('../features/ServiceProvider/serviceprovider-routing-module').then(
        m => m.routes
      )
  },
  {
    path: 'thirdparty',
    component: ThirdPartyLayout,
    canActivate: [RoleGuard],
    data: { roles: ['ThirdParty'] },
    loadChildren: () =>
      import('../features/ThirdParty/thirdparty-routing-module').then(
        m => m.ThirdpartyRoutingModule
      )
  },
  { path: 'adminlogin', component: AdminLogin, title: 'Admin Login' },
  {
    path: '',
    component: GuestLayout,
    loadChildren: () =>
      import('../features/Guest/guest-routing-module').then(m => m.routes)
  },

  { path: '**', redirectTo: '' }
];