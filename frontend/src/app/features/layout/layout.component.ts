import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';

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
    <div class="app-shell">
      <!-- Sidebar Overlay (mobile) -->
      <div class="sidebar-overlay" [class.visible]="sidebarOpen" (click)="closeSidebar()"></div>

      <!-- Sidebar -->
      <aside class="sidebar" [class.open]="sidebarOpen">
        <div class="sidebar-logo">
          <div class="logo-mark">🛍️</div>
          <span class="logo-name">DataPulse</span>
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
            <button class="hamburger-btn" (click)="toggleSidebar()">
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
            </button>
            <h2 class="page-title">{{ pageTitle }}</h2>
          </div>
          <div class="top-bar-right">
            <button class="theme-toggle-btn" (click)="toggleTheme()" [title]="currentTheme === 'light' ? 'Dark Mode' : 'Light Mode'">
              {{ currentTheme === 'light' ? '🌙' : '☀️' }}
            </button>
            <div class="user-pill">
              <div class="user-avatar">{{ userInitial }}</div>
              <span class="user-email">{{ userEmail }}</span>
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

    .main-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      background: var(--bg-base);
    }
  `]
})
export class LayoutComponent {
    userEmail = '';
    userInitial = 'U';
    pageTitle = 'DataPulse Analytics';
    currentTheme = 'light';
    sidebarOpen = false;

    mainNav: NavItem[] = [];
    mgmtNav: NavItem[] = [];

    constructor(
      private authService: AuthService, 
      private router: Router,
      private themeService: ThemeService
    ) {
        this.themeService.theme$.subscribe(t => this.currentTheme = t);

        const token = localStorage.getItem('token');
        const roles = JSON.parse(localStorage.getItem('roles') || '[]');

        // Parse email from token
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                this.userEmail = payload.sub || '';
                this.userInitial = this.userEmail.charAt(0).toUpperCase();
            } catch { }
        }

        // Set nav based on role
        if (roles.includes('ROLE_ADMIN')) {
            this.mainNav = [
                { label: 'Dashboard', icon: '🏠', route: '/admin/dashboard' },
                { label: 'AI Assistant', icon: '🤖', route: '/admin/ai-assistant' },
                { label: 'Analytics', icon: '📈', route: '/admin/analytics' },
                { label: 'Orders', icon: '🛒', route: '/admin/orders' },
                { label: 'Products', icon: '📦', route: '/admin/products' },
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
            ];
            this.mgmtNav = [
                { label: 'Store Settings', icon: '⚙️', route: '/corporate/settings' },
                { label: 'Shipments', icon: '🚚', route: '/corporate/shipments' },
                { label: 'Reviews', icon: '⭐', route: '/corporate/reviews' },
            ];
        } else {
            this.mainNav = [
                { label: 'Dashboard', icon: '🏠', route: '/individual/dashboard' },
                { label: 'AI Assistant', icon: '🤖', route: '/individual/ai-assistant' },
                { label: 'My Orders', icon: '🛒', route: '/individual/orders' },
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

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
