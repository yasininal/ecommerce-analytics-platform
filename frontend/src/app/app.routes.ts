import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { LayoutComponent } from './features/layout/layout.component';
import { AdminDashboardComponent } from './features/admin-dashboard/admin-dashboard.component';
import { CorporateDashboardComponent } from './features/corporate-dashboard/corporate-dashboard.component';
import { IndividualDashboardComponent } from './features/individual-dashboard/individual-dashboard.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },

    // ── Admin Routes ──────────────────────────────────
    {
        path: 'admin',
        component: LayoutComponent,
        canActivate: [authGuard],
        data: { role: 'ROLE_ADMIN' },
        children: [
            { path: 'dashboard', component: AdminDashboardComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    // ── Corporate Routes ──────────────────────────────
    {
        path: 'corporate',
        component: LayoutComponent,
        canActivate: [authGuard],
        data: { role: 'ROLE_CORPORATE' },
        children: [
            { path: 'dashboard', component: CorporateDashboardComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    // ── Individual Routes ─────────────────────────────
    {
        path: 'individual',
        component: LayoutComponent,
        canActivate: [authGuard],
        data: { role: 'ROLE_INDIVIDUAL' },
        children: [
            { path: 'dashboard', component: IndividualDashboardComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' }
];
