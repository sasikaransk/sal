// admin-pannel.routes.ts
import { Routes } from '@angular/router';
import { AdminDashboard } from './admin-dashboard';
import { AdminGenericPage } from './admin-generic-page';
import { adminAuthGuard, adminAuthChildGuard } from '../login/admin-auth.guard';
import { AdminEventManagement } from '../event-management/admin-event-management';

export const ADMIN_PANNEL_ROUTES: Routes = [
  // NOTE: Login is handled at root route '/adminlogin' per app.routes.ts
  {
    path: '',
    // Parent route already provides AdminLayout in app.routes.ts,
    // so we only add guards and children here.
    canActivate: [adminAuthGuard],
    canActivateChild: [adminAuthChildGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: AdminDashboard, title: 'Dashboard' },
      {
        path: 'event-management',
        component: AdminEventManagement,
        title: 'Event Management',
      },
      {
        path: 'user-settings',
        component: AdminGenericPage,
        data: { title: 'User Settings', description: 'Manage your admin profile and account preferences.' }
      },
      {
        path: 'user',
        component: AdminGenericPage,
        data: { title: 'User Management', description: 'Manage users, roles, and permissions.' }
      },
      {
        path: 'bookings',
        component: AdminGenericPage,
        data: { title: 'Bookings', description: 'Track booking requests, approvals, and cancellations.' }
      },
      {
        path: 'customers',
        component: AdminGenericPage,
        data: { title: 'Customers', description: 'View customer profiles and contact information.' }
      },
      {
        path: 'payments',
        component: AdminGenericPage,
        data: { title: 'Payments', description: 'Review incoming payments and outstanding balances.' }
      },
      {
        path: 'staffs',
        component: AdminGenericPage,
        data: { title: 'Staffs', description: 'Organize staff records, roles, and scheduling.' }
      },
      {
        path: 'drivers',
        component: AdminGenericPage,
        data: { title: 'Drivers', description: 'Monitor driver activity, documents, and status.' }
      },
      {
        path: 'cashier',
        component: AdminGenericPage,
        data: { title: 'Cashier', description: 'Handle cashier operations and reconcile transactions.' }
      },
      {
        path: 'services',
        component: AdminGenericPage,
        data: { title: 'Service Provider', description: 'Manage service providers and their offerings.' }
      },
      {
        path: 'third-party',
        component: AdminGenericPage,
        data: { title: 'Third Party', description: 'Integrate and manage third-party providers.' }
      },
      {
        path: 'offers',
        component: AdminGenericPage,
        data: { title: 'Offers', description: 'Create and manage promotional offers for customers.' }
      },
      {
        path: 'faqs',
        component: AdminGenericPage,
        data: { title: 'FAQs', description: 'Maintain frequently asked questions for quick support.' }
      },
      {
        path: 'reports',
        component: AdminGenericPage,
        data: { title: 'Reports', description: 'Generate detailed reports to understand performance.' }
      }
    ]
  }
];
