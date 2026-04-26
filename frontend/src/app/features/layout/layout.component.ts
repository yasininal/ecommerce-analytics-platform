import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { CartService } from '../../core/services/cart.service';
import { DashboardService, NotificationData } from '../dashboard.service';

interface NavItem {
    label: string;
    icon: string;
    route: string;
    badge?: string;
}

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
    template: `
    <div class="app-shell" [class.no-sidebar]="!isLoggedIn">
      <!-- Sidebar Overlay (mobile) -->
      <div class="sidebar-overlay" [class.visible]="sidebarOpen" (click)="closeSidebar()"></div>

      <!-- Sidebar - Only for Logged In users -->
      <aside class="sidebar" [class.open]="sidebarOpen" *ngIf="isLoggedIn">

        <div class="sidebar-logo">
          <div class="logo-mark">🛍️</div>
          <span class="logo-name">TrendAnalytix</span>
          <button class="sidebar-close-btn" (click)="closeSidebar()">✕</button>
        </div>

        <nav class="sidebar-nav">
          <p class="nav-group-label">MAIN MENU</p>
          <a *ngFor="let item of mainNav"
             [routerLink]="item.route"
             routerLinkActive="active"
             class="nav-item"
             (click)="closeSidebar()">
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
            <span *ngIf="item.badge" class="nav-badge">{{ item.badge }}</span>
          </a>

          <p class="nav-group-label" style="margin-top:24px" *ngIf="mgmtNav.length > 0">MANAGEMENT</p>
          <a *ngFor="let item of mgmtNav"
             [routerLink]="item.route"
             routerLinkActive="active"
             class="nav-item"
             (click)="closeSidebar()">
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="logout-btn" (click)="logout()">
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- Main Area -->
      <div class="main-area">
        <header class="top-bar">
          <div class="top-bar-left">
            <button class="hamburger-btn" (click)="toggleSidebar()" *ngIf="isLoggedIn">
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
            </button>
            <h1 class="logo-placeholder" (click)="goToHome()" style="cursor:pointer">🛍️ TrendAnalytix</h1>
            <nav class="guest-nav" *ngIf="!isLoggedIn">
               <a routerLink="/catalog" routerLinkActive="active">Marketplace</a>
               <a routerLink="/cart" routerLinkActive="active">Cart</a>
            </nav>
            <h2 class="page-title" *ngIf="isLoggedIn">{{ pageTitle }}</h2>
          </div>
          <div class="top-bar-right">
            <button class="theme-toggle-btn" (click)="toggleTheme()" [title]="currentTheme === 'light' ? 'Dark Mode' : 'Light Mode'">
              {{ currentTheme === 'light' ? '🌙' : '☀️' }}
            </button>
            
            <!-- Notifications -->
            <div class="notif-wrapper" *ngIf="isLoggedIn">
               <button class="notif-btn" (click)="toggleNotifications()">
                  🔔
                  <span class="notif-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
               </button>
               <div class="notif-dropdown" *ngIf="showNotifs">
                  <div class="notif-header">
                     <span>Notifications</span>
                     <button (click)="loadNotifications()">🔄</button>
                  </div>
                  <div class="notif-list">
                     <div *ngFor="let n of notifications" class="notif-item" [class.unread]="!n.isRead" (click)="readNotif(n)">
                        <div class="notif-msg">{{ n.message }}</div>
                        <div class="notif-time">{{ n.createdAt | date:'short' }}</div>
                     </div>
                     <div class="notif-empty" *ngIf="notifications.length === 0">No notifications</div>
                  </div>
               </div>
            </div>

            <!-- Cart Icon -->
            <a routerLink="/cart" class="cart-icon-btn" title="Shopping Cart">
              🛒
              <span class="cart-badge" *ngIf="cartCount > 0">{{ cartCount }}</span>
            </a>
            <!-- User is Logged In -->
            <div class="user-pill" *ngIf="isLoggedIn">

              <div class="user-avatar">{{ userInitial }}</div>
              <span class="user-email">{{ userEmail }}</span>
            </div>
            
            <!-- User is Guest -->
            <div class="guest-actions" *ngIf="!isLoggedIn">
               <button class="btn btn-ghost" (click)="goToLogin()">Sign In</button>
               <button class="btn btn-primary" (click)="goToRegister()">Register</button>
            </div>
          </div>
        </header>

        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
    styles: [`
    .app-shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--bg-base);
    }

    /* ── Sidebar Overlay ── */
    .sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      backdrop-filter: blur(4px);
      z-index: 99;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .sidebar-overlay.visible {
      display: block;
      opacity: 1;
    }

    /* ── Sidebar ── */
    .sidebar {
      width: var(--sidebar-width);
      min-width: var(--sidebar-width);
      background: var(--bg-surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      overflow-x: hidden;
      position: fixed;
      top: 0;
      left: calc(-1 * var(--sidebar-width));
      height: 100vh;
      z-index: 100;
      transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: none;
    }
    .sidebar.open {
      left: 0;
      box-shadow: 8px 0 30px rgba(0,0,0,0.15);
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 20px;
      border-bottom: 1px solid var(--border);
    }
    .logo-mark {
      width: 38px; height: 38px;
      background: var(--accent);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }
    .logo-name {
      font-size: 19px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      flex: 1;
    }
    .sidebar-close-btn {
      background: none;
      border: none;
      font-size: 18px;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      transition: all var(--transition);
    }
    .sidebar-close-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .sidebar-nav {
      flex: 1;
      padding: 20px 12px;
    }
    .nav-group-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      padding: 6px 14px;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 14px;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition);
      color: var(--text-secondary);
      font-size: 14.5px;
      font-weight: 500;
      margin-bottom: 3px;
      position: relative;
    }
    .nav-item:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    .nav-item.active {
      background: var(--accent-glow);
      color: var(--accent);
      font-weight: 600;
    }
    .nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 10%;
      height: 80%;
      width: 4px;
      background: var(--accent);
      border-radius: 0 4px 4px 0;
    }
    .nav-icon { font-size: 18px; width: 22px; text-align: center; }
    .nav-label { flex: 1; }
    .nav-badge {
      background: var(--danger);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 99px;
    }

    .sidebar-footer {
      padding: 16px 12px;
      border-top: 1px solid var(--border);
    }
    .logout-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 12px;
      background: transparent;
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition);
    }
    .logout-btn:hover {
      background: rgba(193, 58, 58, 0.06);
      border-color: var(--danger);
      color: var(--danger);
    }

    /* ── Main Area ── */
    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .top-bar {
      height: var(--header-height);
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      flex-shrink: 0;
    }
    .top-bar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    /* Hamburger Button */
    .hamburger-btn {
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 8px;
      border-radius: var(--radius-sm);
      transition: background var(--transition);
    }
    .hamburger-btn:hover {
      background: var(--bg-hover);
    }
    .hamburger-line {
      display: block;
      width: 22px;
      height: 2px;
      background: var(--text-primary);
      border-radius: 2px;
      transition: all 0.2s ease;
    }

    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    }
    .top-bar-right { display: flex; align-items: center; gap: 14px; }
    
    .theme-toggle-btn {
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      cursor: pointer;
      transition: all var(--transition);
    }
    .theme-toggle-btn:hover {
      background: var(--bg-hover);
      border-color: var(--border-strong);
      transform: rotate(15deg) scale(1.05);
    }

    .user-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: 99px;
      padding: 6px 16px 6px 6px;
      transition: all var(--transition);
      cursor: pointer;
    }
    .user-pill:hover {
      border-color: var(--border-strong);
    }
    .user-avatar {
      width: 32px; height: 32px;
      border-radius: 50%;
      background: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      color: #fff;
    }
    .user-email { font-size: 13px; font-weight: 500; color: var(--text-primary); }

    .cart-icon-btn { position: relative; width: 40px; height: 40px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer; text-decoration: none; transition: all var(--transition); }
    .cart-icon-btn:hover { background: var(--bg-hover); border-color: var(--accent); transform: scale(1.05); }
    .cart-badge { position: absolute; top: -4px; right: -4px; background: var(--accent); color: white; font-size: 10px; font-weight: 800; min-width: 18px; height: 18px; border-radius: 99px; display: flex; align-items: center; justify-content: center; padding: 0 4px; }

    .main-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      background: var(--bg-base);
    }
    
    .logo-placeholder { font-size: 22px; font-weight: 800; color: var(--accent); margin-right: 20px; }
    .guest-nav { display: flex; gap: 20px; }
    .guest-nav a { font-size: 14px; font-weight: 600; color: var(--text-secondary); text-decoration: none; transition: 0.2s; }
    .guest-nav a:hover, .guest-nav a.active { color: var(--accent); }
    .guest-actions { display: flex; gap: 10px; }
    .btn-ghost { background: none; border: 1px solid var(--border-strong); color: var(--text-primary); }
    .btn-ghost:hover { background: var(--bg-hover); }

    /* ── Notifications ── */
    .notif-wrapper { position: relative; }
    .notif-btn { background: var(--bg-elevated); border: 1px solid var(--border); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer; transition: 0.2s; position: relative; }
    .notif-btn:hover { background: var(--bg-hover); transform: scale(1.05); }
    .notif-badge { position: absolute; top: -2px; right: -2px; background: #ef4444; color: white; font-size: 10px; font-weight: 800; min-width: 16px; height: 16px; border-radius: 99px; display: flex; align-items: center; justify-content: center; }
    
    .notif-dropdown { position: absolute; top: 100%; right: 0; margin-top: 10px; width: 320px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); z-index: 1000; overflow: hidden; animation: slideDown 0.3s ease; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    
    .notif-header { padding: 14px 18px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: var(--bg-elevated); }
    .notif-header span { font-weight: 800; font-size: 13px; text-transform: uppercase; color: var(--text-primary); }
    .notif-header button { background: none; border: none; cursor: pointer; opacity: 0.6; }
    
    .notif-list { max-height: 400px; overflow-y: auto; }
    .notif-item { padding: 16px 18px; border-bottom: 1px solid var(--border); cursor: pointer; transition: 0.2s; }
    .notif-item:hover { background: var(--bg-hover); }
    .notif-item.unread { background: rgba(124,92,252,0.05); border-left: 4px solid var(--accent); }
    .notif-msg { font-size: 13px; line-height: 1.4; color: var(--text-primary); margin-bottom: 6px; }
    .notif-time { font-size: 11px; color: var(--text-muted); }
    .notif-empty { padding: 40px; text-align: center; color: var(--text-muted); font-size: 13px; }
  `]
})
export class LayoutComponent {
    userEmail = '';
    userInitial = 'U';
    pageTitle = 'TrendAnalytix Analytics';
    currentTheme = 'light';
    sidebarOpen = false;
    isLoggedIn = false;
    cartCount = 0;
    
    unreadCount = 0;
    notifications: NotificationData[] = [];
    showNotifs = false;

    mainNav: NavItem[] = [];
    mgmtNav: NavItem[] = [];

    constructor(
      private authService: AuthService, 
      private router: Router,
      private themeService: ThemeService,
      private cartService: CartService,
      private dashboardService: DashboardService
    ) {
        this.themeService.theme$.subscribe(t => this.currentTheme = t);
        this.cartService.cart$.subscribe(items => {
            this.cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
        });

        // Subscribe to auth state
        this.authService.currentUser$.subscribe(user => {
            this.isLoggedIn = !!user;
            if (user) {
                this.userEmail = user.sub || localStorage.getItem('userEmail') || '';
                this.userInitial = this.userEmail.charAt(0).toUpperCase();
                this.updateNavigation();
                this.loadNotificationCount();
            } else {
                this.userEmail = '';
                this.userInitial = 'U';
                this.mainNav = [];
                this.mgmtNav = [];
                this.unreadCount = 0;
                this.notifications = [];
            }
        });
    }

    loadNotificationCount() {
        this.dashboardService.getUnreadNotificationCount().subscribe(c => this.unreadCount = c);
    }

    toggleNotifications() {
        this.showNotifs = !this.showNotifs;
        if (this.showNotifs) {
            this.loadNotifications();
        }
    }

    loadNotifications() {
        this.dashboardService.getNotifications().subscribe(list => {
            this.notifications = list;
            this.loadNotificationCount();
        });
    }

    readNotif(n: NotificationData) {
        if (!n.isRead) {
            this.dashboardService.markNotificationAsRead(n.id).subscribe(() => {
                n.isRead = true;
                this.loadNotificationCount();
            });
        }
    }

    private updateNavigation() {
        const roles = JSON.parse(localStorage.getItem('roles') || '[]');
        
        if (roles.includes('ROLE_ADMIN')) {
            this.mainNav = [
                { label: 'Dashboard', icon: '🏠', route: '/admin/dashboard' },
                { label: 'AI Assistant', icon: '🤖', route: '/admin/ai-assistant' },
                { label: 'Analytics', icon: '📈', route: '/admin/analytics' },
                { label: 'Orders', icon: '🛒', route: '/admin/orders' },
                { label: 'Products', icon: '📦', route: '/admin/products' },
                { label: 'Marketplace', icon: '💎', route: '/admin/catalog' },
                { label: 'My Favorites', icon: '❤️', route: '/admin/favorites' },
                { label: 'My Cart', icon: '🛒', route: '/cart' },
                { label: 'My Orders', icon: '📦', route: '/my-orders' },
                { label: 'My Reviews', icon: '📝', route: '/admin/reviews' },
            ];
            this.mgmtNav = [
                { label: 'Customers', icon: '👥', route: '/admin/customers' },
                { label: 'Store Settings', icon: '⚙️', route: '/admin/settings' },
                { label: 'Shipments', icon: '🚚', route: '/admin/shipments' },
                { label: 'Reviews', icon: '⭐', route: '/admin/reviews' },
            ];
        } else if (roles.includes('ROLE_CORPORATE')) {
            this.mainNav = [
                { label: 'Dashboard', icon: '🏠', route: '/corporate/dashboard' },
                { label: 'AI Assistant', icon: '🤖', route: '/corporate/ai-assistant' },
                { label: 'Analytics', icon: '📈', route: '/corporate/analytics' },
                { label: 'Orders', icon: '🛒', route: '/corporate/orders' },
                { label: 'Products', icon: '📦', route: '/corporate/products' },
                { label: 'Marketplace', icon: '💎', route: '/corporate/catalog' },
                { label: 'My Favorites', icon: '❤️', route: '/corporate/favorites' },
                { label: 'My Cart', icon: '🛒', route: '/cart' },
                { label: 'My Orders', icon: '📦', route: '/my-orders' },
                { label: 'My Reviews', icon: '📝', route: '/corporate/reviews' },
            ];
            this.mgmtNav = [
                { label: 'Store Settings', icon: '⚙️', route: '/corporate/settings' },
                { label: 'Shipments', icon: '🚚', route: '/corporate/shipments' },
                { label: 'Reviews', icon: '⭐', route: '/corporate/reviews' },
            ];
        } else {
            this.mainNav = [
                { label: 'Dashboard', icon: '🏠', route: '/individual/dashboard' },
                { label: 'Marketplace', icon: '💎', route: '/individual/catalog' },
                { label: 'My Favorites', icon: '❤️', route: '/individual/favorites' },
                { label: 'My Cart', icon: '🛒', route: '/cart' },
                { label: 'My Orders', icon: '📦', route: '/my-orders' },
                { label: 'My Reviews', icon: '📝', route: '/individual/reviews' },
                { label: 'AI Assistant', icon: '🤖', route: '/individual/ai-assistant' },
                { label: 'Settings', icon: '⚙️', route: '/individual/settings' },
            ];
            this.mgmtNav = [];
        }
    }

    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
    }

    closeSidebar() {
        this.sidebarOpen = false;
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    goToLogin() {
        this.router.navigate(['/login']);
    }

    goToRegister() {
        this.router.navigate(['/login'], { queryParams: { mode: 'register' } });
    }

    goToHome() {
        this.router.navigate(['/catalog']);
    }

    logout() {
        this.authService.logout();
        this.isLoggedIn = false;
        this.sidebarOpen = false;
        this.router.navigate(['/login']);
    }
}
