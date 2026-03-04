import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { AdminDashboardComponent } from './features/admin-dashboard/admin-dashboard.component';
import { CorporateDashboardComponent } from './features/corporate-dashboard/corporate-dashboard.component';
import { IndividualDashboardComponent } from './features/individual-dashboard/individual-dashboard.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: 'admin',
        component: AdminDashboardComponent,
        canActivate: [authGuard],
        data: { role: 'ROLE_ADMIN' }
    },
    {
        path: 'corporate',
        component: CorporateDashboardComponent,
        canActivate: [authGuard],
        data: { role: 'ROLE_CORPORATE' }
    },
    {
        path: 'individual',
        component: IndividualDashboardComponent,
        canActivate: [authGuard],
        data: { role: 'ROLE_INDIVIDUAL' }
    },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' }
];
