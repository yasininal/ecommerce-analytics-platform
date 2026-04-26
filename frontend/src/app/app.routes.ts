import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { LayoutComponent } from './features/layout/layout.component';
import { AdminDashboardComponent } from './features/admin-dashboard/admin-dashboard.component';
import { CorporateDashboardComponent } from './features/corporate-dashboard/corporate-dashboard.component';
import { IndividualDashboardComponent } from './features/individual-dashboard/individual-dashboard.component';
import { OrdersComponent } from './features/orders/orders.component';
import { ProductsComponent } from './features/products/products.component';
import { AnalyticsComponent } from './features/analytics/analytics.component';
import { CustomersComponent } from './features/customers/customers.component';
import { ShipmentsComponent } from './features/shipments/shipments.component';
import { ReviewsComponent } from './features/reviews/reviews.component';
import { AiAssistantComponent } from './features/ai-assistant/ai-assistant.component';
import { SettingsComponent } from './features/settings/settings.component';
import { CatalogComponent } from './features/catalog/catalog.component';
import { ProductDetailComponent } from './features/product-detail/product-detail.component';
import { CartComponent } from './features/cart/cart.component';
import { MyOrdersComponent } from './features/my-orders/my-orders.component';
import { PaymentSuccessComponent } from './features/payment-success/payment-success.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
    // ── PUBLIC ACCESSIBLE ROUTES ────
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: 'catalog', component: CatalogComponent },
            { path: 'catalog/:id', component: ProductDetailComponent },
            { path: 'cart', component: CartComponent },
            { path: 'payment-success', component: PaymentSuccessComponent, canActivate: [authGuard] },
            { path: 'my-orders', component: MyOrdersComponent, canActivate: [authGuard] },
            { path: '', redirectTo: 'catalog', pathMatch: 'full' }
        ]
    },

    { path: 'login', component: LoginComponent },

    // ── PROTECTED ROUTES (BY ROLE) ───────────────────
    {
        path: 'admin',
        component: LayoutComponent,
        canActivate: [authGuard],
        data: { role: 'ROLE_ADMIN' },
        children: [
            { path: 'dashboard', component: AdminDashboardComponent },
            { path: 'ai-assistant', component: AiAssistantComponent },
            { path: 'analytics', component: AnalyticsComponent },
            { path: 'orders', component: OrdersComponent },
            { path: 'products', component: ProductsComponent },
            { path: 'customers', component: CustomersComponent },
            { path: 'shipments', component: ShipmentsComponent },
            { path: 'reviews', component: ReviewsComponent },
            { path: 'catalog', component: CatalogComponent },
            { path: 'catalog/:id', component: ProductDetailComponent },
            { path: 'favorites', loadComponent: () => import('./features/favorites/favorites.component').then(m => m.FavoritesComponent) },
            { path: 'settings', component: SettingsComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    {
        path: 'corporate',
        component: LayoutComponent,
        canActivate: [authGuard],
        data: { role: 'ROLE_CORPORATE' },
        children: [
            { path: 'dashboard', component: CorporateDashboardComponent },
            { path: 'ai-assistant', component: AiAssistantComponent },
            { path: 'analytics', component: AnalyticsComponent },
            { path: 'orders', component: OrdersComponent },
            { path: 'products', component: ProductsComponent },
            { path: 'shipments', component: ShipmentsComponent },
            { path: 'reviews', component: ReviewsComponent },
            { path: 'catalog', component: CatalogComponent },
            { path: 'catalog/:id', component: ProductDetailComponent },
            { path: 'favorites', loadComponent: () => import('./features/favorites/favorites.component').then(m => m.FavoritesComponent) },
            { path: 'settings', component: SettingsComponent },
            { path: 'dashboard', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    {
        path: 'individual',
        component: LayoutComponent,
        canActivate: [authGuard],
        data: { role: 'ROLE_INDIVIDUAL' },
        children: [
            { path: 'dashboard', component: IndividualDashboardComponent },
            { path: 'ai-assistant', component: AiAssistantComponent },
            { path: 'orders', component: OrdersComponent },
            { path: 'catalog', component: CatalogComponent },
            { path: 'catalog/:id', component: ProductDetailComponent },
            { path: 'favorites', loadComponent: () => import('./features/favorites/favorites.component').then(m => m.FavoritesComponent) },
            { path: 'reviews', component: ReviewsComponent },
            { path: 'settings', component: SettingsComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    { path: '**', redirectTo: '/catalog' }
];
