import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

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
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-logo">
          <div class="logo-mark">📊</div>
          <span class="logo-name">DataPulse</span>
        </div>

        <nav class="sidebar-nav">
          <p class="nav-group-label">MAIN MENU</p>
          <a *ngFor="let item of mainNav"
             [routerLink]="item.route"
             routerLinkActive="active"
             class="nav-item">
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
            <span *ngIf="item.badge" class="nav-badge">{{ item.badge }}</span>
          </a>

          <p class="nav-group-label" style="margin-top:20px">MANAGEMENT</p>
          <a *ngFor="let item of mgmtNav"
             [routerLink]="item.route"
             routerLinkActive="active"
             class="nav-item">
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
            <h2 class="page-title">{{ pageTitle }}</h2>
          </div>
          <div class="top-bar-right">
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
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 20px 16px;
      border-bottom: 1px solid var(--border);
    }
    .logo-mark {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, var(--accent), var(--accent-light));
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }
    .logo-name {
      font-size: 17px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 10px;
    }
    .nav-group-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--text-muted);
      padding: 6px 10px;
      margin-bottom: 4px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition);
      color: var(--text-secondary);
      font-size: 13.5px;
      font-weight: 500;
      margin-bottom: 2px;
      position: relative;
    }
    .nav-item:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    .nav-item.active {
      background: var(--accent-glow);
      color: var(--accent-light);
      border-left: 3px solid var(--accent);
    }
    .nav-icon { font-size: 16px; width: 20px; text-align: center; }
    .nav-label { flex: 1; }
    .nav-badge {
      background: var(--danger);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 99px;
    }

    .sidebar-footer {
      padding: 12px 10px;
      border-top: 1px solid var(--border);
    }
    .logout-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px 12px;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition);
    }
    .logout-btn:hover {
      background: rgba(255,92,122,0.1);
      border-color: rgba(255,92,122,0.3);
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
      padding: 0 28px;
      flex-shrink: 0;
    }
    .page-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .top-bar-right { display: flex; align-items: center; gap: 12px; }
    .user-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: 99px;
      padding: 6px 14px 6px 6px;
    }
    .user-avatar {
      width: 28px; height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent), var(--accent-light));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      color: #fff;
    }
    .user-email { font-size: 12px; color: var(--text-secondary); }

    .main-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }
  `]
})
export class LayoutComponent {
    userEmail = '';
    userInitial = 'U';
    pageTitle = 'DataPulse Analytics';

    mainNav: NavItem[] = [];
    mgmtNav: NavItem[] = [];

    constructor(private authService: AuthService, private router: Router) {
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

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
