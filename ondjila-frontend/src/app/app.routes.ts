import { Routes } from '@angular/router';
import { Landing } from './modules/auth/landing/landing';
import { Login } from './modules/auth/login/login';
import { Register } from './modules/auth/register/register';
import { RegisterDriver } from './modules/auth/register-driver/register-driver';
import { Dashboard as PassengerDashboard } from './modules/passenger/dashboard/dashboard';
import { Dashboard as DriverDashboard } from './modules/driver/dashboard/dashboard';
import { PassengerTripsPage } from './modules/passenger/pages/passenger-trips.page';
import { PassengerRidesPage } from './modules/passenger/pages/passenger-rides.page';
import { PassengerSharedRidesPage } from './modules/passenger/pages/passenger-shared-rides.page';
import { PassengerTrackingPage } from './modules/passenger/pages/passenger-tracking.page';
import { PassengerHistoryPage } from './modules/passenger/pages/passenger-history.page';
import { PassengerProfilePage } from './modules/passenger/pages/passenger-profile.page';
import { PassengerMatchPage } from './modules/passenger/pages/passenger-match.page';
import { PassengerNotificationsPage } from './modules/passenger/pages/passenger-notifications.page';
import { PassengerSettingsPage } from './modules/passenger/pages/passenger-settings.page';
import { PassengerChatPage } from './modules/passenger/pages/passenger-chat.page';
import { PassengerRatePage } from './modules/passenger/pages/passenger-rate.page';
import { PassengerHomePage } from './modules/passenger/pages/passenger-home.page';
import { PassengerPaymentsPage } from './modules/passenger/pages/passenger-payments.page';
import { PassengerWalletPage } from './modules/passenger/pages/passenger-wallet.page';
import { PassengerChooseRidePage } from './modules/passenger/pages/passenger-choose-ride.page';
import { PassengerSupportPage } from './modules/passenger/pages/passenger-support.page';
import { PassengerSecurityPage } from './modules/passenger/pages/passenger-security.page';
import { DriverProfilePage } from './modules/driver/pages/driver-profile.page';
import { DriverHomePage } from './modules/driver/pages/driver-home.page';
import { DriverEarningsPage } from './modules/driver/pages/driver-earnings.page';
import { DriverPaymentsPage } from './modules/driver/pages/driver-payments.page';
import { DriverWalletPage } from './modules/driver/pages/driver-wallet.page';
import { DriverSupportPage } from './modules/driver/pages/driver-support.page';
import { DriverSecurityPage } from './modules/driver/pages/driver-security.page';
import { AdminOverviewPage } from './modules/admin/pages/admin-overview.page';
import { AdminDriversPage } from './modules/admin/pages/admin-drivers.page';
import { AdminReportsPage } from './modules/admin/pages/admin-reports.page';
import { AdminSupportPage } from './modules/admin/pages/admin-support.page';
import { AdminSectionPage } from './modules/admin/pages/admin-section.page';
import { AdminLiveMapPage } from './modules/admin/pages/admin-live-map.page';
import { AdminPricingPage } from './modules/admin/pages/admin-pricing.page';
import { authGuard } from './core/guards/auth/auth-guard';
import { driverGuard } from './core/guards/auth/driver-guard';
import { adminGuard } from './core/guards/auth/admin-guard';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'register/driver', component: RegisterDriver },

  { path: 'passenger/home', component: PassengerHomePage, canActivate: [authGuard] },
  { path: 'passenger/dashboard', component: PassengerDashboard, canActivate: [authGuard] },
  { path: 'passenger/rides', component: PassengerRidesPage, canActivate: [authGuard] },
  { path: 'passenger/shared-rides', component: PassengerSharedRidesPage, canActivate: [authGuard] },
  { path: 'passenger/tracking', component: PassengerTrackingPage, canActivate: [authGuard] },
  { path: 'passenger/history', component: PassengerHistoryPage, canActivate: [authGuard] },
  { path: 'passenger/choose-ride', component: PassengerChooseRidePage, canActivate: [authGuard] },
  { path: 'passenger/match', component: PassengerMatchPage, canActivate: [authGuard] },
  { path: 'passenger/trips', component: PassengerTripsPage, canActivate: [authGuard] },
  { path: 'passenger/payments', component: PassengerPaymentsPage, canActivate: [authGuard] },
  { path: 'passenger/wallet', component: PassengerWalletPage, canActivate: [authGuard] },
  { path: 'passenger/security', component: PassengerSecurityPage, canActivate: [authGuard] },
  { path: 'passenger/support', component: PassengerSupportPage, canActivate: [authGuard] },
  { path: 'passenger/profile', component: PassengerProfilePage, canActivate: [authGuard] },
  { path: 'passenger/notifications', component: PassengerNotificationsPage, canActivate: [authGuard] },
  { path: 'passenger/settings', component: PassengerSettingsPage, canActivate: [authGuard] },
  { path: 'passenger/chat', component: PassengerChatPage, canActivate: [authGuard] },
  { path: 'passenger/rate', component: PassengerRatePage, canActivate: [authGuard] },

  { path: 'driver/home', component: DriverHomePage, canActivate: [authGuard, driverGuard] },
  { path: 'driver/live', component: DriverDashboard, canActivate: [authGuard, driverGuard] },
  { path: 'driver/dashboard', redirectTo: 'driver/live', pathMatch: 'full' },
  { path: 'driver/earnings', component: DriverEarningsPage, canActivate: [authGuard, driverGuard] },
  { path: 'driver/payments', component: DriverPaymentsPage, canActivate: [authGuard, driverGuard] },
  { path: 'driver/wallet', component: DriverWalletPage, canActivate: [authGuard, driverGuard] },
  { path: 'driver/security', component: DriverSecurityPage, canActivate: [authGuard, driverGuard] },
  { path: 'driver/support', component: DriverSupportPage, canActivate: [authGuard, driverGuard] },
  { path: 'driver/profile', component: DriverProfilePage, canActivate: [authGuard, driverGuard] },

  { path: 'admin', redirectTo: 'admin/overview', pathMatch: 'full' },
  { path: 'admin/overview', component: AdminOverviewPage, canActivate: [authGuard, adminGuard] },
  { path: 'admin/dashboard', redirectTo: 'admin/overview', pathMatch: 'full' },
  { path: 'admin/support', component: AdminSupportPage, canActivate: [authGuard, adminGuard] },
  { path: 'admin/drivers', component: AdminDriversPage, canActivate: [authGuard, adminGuard] },
  { path: 'admin/reports', component: AdminReportsPage, canActivate: [authGuard, adminGuard] },
  { path: 'admin/live-map', component: AdminLiveMapPage, canActivate: [authGuard, adminGuard] },
  { path: 'admin/pricing', component: AdminPricingPage, canActivate: [authGuard, adminGuard] },
  {
    path: 'admin/users',
    component: AdminSectionPage,
    canActivate: [authGuard, adminGuard],
    data: { titleKey: 'nav.users', descriptionKey: 'admin.usersPageDesc' },
  },
  {
    path: 'admin/rides',
    component: AdminSectionPage,
    canActivate: [authGuard, adminGuard],
    data: { titleKey: 'nav.rides', descriptionKey: 'admin.ridesPageDesc' },
  },
  {
    path: 'admin/payments',
    component: AdminSectionPage,
    canActivate: [authGuard, adminGuard],
    data: { titleKey: 'nav.payments', descriptionKey: 'admin.paymentsPageDesc' },
  },
  { path: '**', redirectTo: '' },
];
