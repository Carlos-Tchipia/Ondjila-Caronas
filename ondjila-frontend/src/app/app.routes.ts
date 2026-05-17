import { Routes } from '@angular/router';
import { Landing } from './modules/auth/landing/landing';
import { Login } from './modules/auth/login/login';
import { Register } from './modules/auth/register/register';
import { Dashboard } from './modules/passenger/dashboard/dashboard';
import { authGuard } from './core/guards/auth/auth-guard';

export const routes: Routes = [
    { path: '', component: Landing },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'passenger/dashboard', component: Dashboard, canActivate: [authGuard] }
];
