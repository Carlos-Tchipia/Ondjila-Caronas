import { Routes } from '@angular/router';
import { Landing } from './modules/auth/landing/landing';
import { Login } from './modules/auth/login/login';
import { Register } from './modules/auth/register/register';
import { Dashboard as PassengerDashboard } from './modules/passenger/dashboard/dashboard';
import { Dashboard as DriverDashboard } from './modules/driver/dashboard/dashboard';
import { authGuard } from './core/guards/auth/auth-guard';
import { driverGuard } from './core/guards/auth/driver-guard';

export const routes: Routes = [
    { path: '', component: Landing },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'passenger/dashboard', component: PassengerDashboard, canActivate: [authGuard] },
    { path: 'driver/dashboard', component: DriverDashboard, canActivate: [authGuard, driverGuard] }
];
