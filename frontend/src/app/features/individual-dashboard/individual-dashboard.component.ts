import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, IndividualSummary } from '../dashboard.service';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface OrderDto {
    id: number;
    customerEmail: string;
    storeName: string;
    status: string;
    grandTotal: number;
}

@Component({
  selector: 'app-individual-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-content">
      <div class="welcome-header">
        <div>
          <h1 class="welcome-title" *ngIf="summary">Welcome back, {{ summary.name }}! 👋</h1>
          <h1 class="welcome-title" *ngIf="!summary">My Dashboard</h1>
          <p class="welcome-sub">Your shopping overview and recent activity</p>
        </div>
        <a routerLink="/individual/ai-assistant" class="ai-button">
           <span>🤖</span> Talk to Data AI
        </a>
      </div>

      <div class="kpi-grid" *ngIf="summary">
        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-icon" style="background:rgba(56,189,248,0.2)">🛒</span>
            <span class="kpi-badge">Active</span>
          </div>
          <div class="kpi-value">{{ summary.totalOrders }}</div>
          <div class="kpi-label">Total Orders</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-icon" style="background:rgba(124,92,252,0.2)">💳</span>
            <span class="kpi-badge">Lifetime</span>
          </div>
          <div class="kpi-value">{{ totalSpentFormatted }}</div>
          <div class="kpi-label">Total Spent</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-icon" style="background:rgba(255,181,71,0.2)">⭐</span>
            <span class="kpi-badge">Member</span>
          </div>
          <div class="kpi-value">Gold</div>
          <div class="kpi-label">Membership Tier</div>
        </div>
      </div>

      <div class="dp-loading" *ngIf="!summary">
        <div class="spinner"></div>
        <span>Loading your data...</span>
      </div>

      <div class="card" *ngIf="summary" style="margin-top: 24px; padding: 24px;">
        <div class="section-header">
          <h2>Recent Activity</h2>
          <a routerLink="/my-orders" class="view-all">View All →</a>
        </div>
        <div class="activity-list" *ngIf="recentOrders.length > 0">
          <div class="activity-item" *ngFor="let order of recentOrders">
            <div class="activity-icon" [style.background]="getStatusBg(order.status)">{{ getStatusIcon(order.status) }}</div>
            <div class="activity-info">
              <p class="activity-title">Order #{{ order.id }}</p>
              <p class="activity-sub">{{ order.storeName }} — \${{ order.grandTotal.toFixed(2) }}</p>
            </div>
            <span class="status-pill" [ngClass]="order.status.toLowerCase()">{{ order.status }}</span>
          </div>
        </div>
        <div class="empty-activity" *ngIf="recentOrders.length === 0">
          <p>No orders yet. <a routerLink="/catalog">Start shopping!</a></p>
        </div>
      </div>

      <div class="quick-actions" *ngIf="summary">
        <a routerLink="/catalog" class="action-card">
          <span class="action-icon">🛍️</span>
          <span class="action-label">Browse Products</span>
        </a>
        <a routerLink="/cart" class="action-card">
          <span class="action-icon">🛒</span>
          <span class="action-label">My Cart</span>
        </a>
        <a routerLink="/my-orders" class="action-card">
          <span class="action-icon">📦</span>
          <span class="action-label">Track Orders</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .page-content { padding: 28px 32px; }
    .welcome-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    .welcome-title { font-size: 24px; font-weight: 700; color: var(--text-primary); }
    .welcome-sub { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
    .kpi-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; transition: all var(--transition); }
    .kpi-card:hover { border-color: var(--border-strong); transform: translateY(-2px); }
    .kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .kpi-icon { width: 40px; height: 40px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .kpi-badge { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 99px; background: rgba(0,200,150,0.15); color: var(--success); }
    .kpi-value { font-size: 28px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
    .kpi-label { font-size: 13px; color: var(--text-secondary); }

    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-header h2 { font-size: 16px; font-weight: 600; color: var(--text-primary); margin: 0; }
    .view-all { font-size: 13px; color: var(--accent); text-decoration: none; font-weight: 600; }
    .view-all:hover { text-decoration: underline; }

    .activity-list { display: flex; flex-direction: column; gap: 10px; }
    .activity-item { display: flex; align-items: center; gap: 14px; padding: 14px; background: var(--bg-elevated); border-radius: var(--radius-md); transition: 0.2s; }
    .activity-item:hover { background: var(--bg-hover); }
    .activity-icon { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
    .activity-info { flex: 1; }
    .activity-title { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0; }
    .activity-sub { font-size: 12px; color: var(--text-muted); margin: 2px 0 0; }

    .status-pill { padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .status-pill.pending { background: rgba(251,191,36,0.15); color: #f59e0b; }
    .status-pill.processing { background: rgba(96,165,250,0.15); color: #3b82f6; }
    .status-pill.shipped { background: rgba(168,85,247,0.15); color: #a855f7; }
    .status-pill.delivered { background: rgba(74,222,128,0.15); color: #22c55e; }
    .status-pill.cancelled { background: rgba(248,113,113,0.15); color: #ef4444; }
    .status-pill.returned { background: rgba(248,113,113,0.15); color: #ef4444; }

    .empty-activity { text-align: center; padding: 24px; color: var(--text-muted); }
    .empty-activity a { color: var(--accent); text-decoration: none; font-weight: 600; }

    .quick-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 24px; }
    .action-card { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); text-decoration: none; transition: 0.2s; }
    .action-card:hover { border-color: var(--accent); transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
    .action-icon { font-size: 28px; }
    .action-label { font-size: 13px; font-weight: 600; color: var(--text-primary); }

    .ai-button {
      display: flex; align-items: center; gap: 10px; background: linear-gradient(135deg, var(--accent), var(--accent-light));
      color: white; padding: 12px 24px; border-radius: 99px; text-decoration: none; font-weight: 700; font-size: 14px;
      box-shadow: 0 10px 20px rgba(124, 92, 252, 0.3); transition: 0.3s;
    }
    .ai-button:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(124, 92, 252, 0.4); }
  `]
})
export class IndividualDashboardComponent implements OnInit {
  summary: IndividualSummary | null = null;
  recentOrders: OrderDto[] = [];
  totalSpentFormatted = '';

  constructor(private dashboardService: DashboardService, private http: HttpClient) { }

  ngOnInit(): void {
    this.dashboardService.getIndividualSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.totalSpentFormatted = '$' + data.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      },
      error: (err) => console.error('Individual summary fetch error', err)
    });

    this.http.get<OrderDto[]>('/api/orders/my-orders').subscribe({
      next: (data) => {
        this.recentOrders = data.sort((a, b) => b.id - a.id).slice(0, 5);
      }
    });
  }

  getStatusIcon(status: string): string {
    const map: any = { 'PENDING': '🕐', 'PROCESSING': '⚙️', 'SHIPPED': '🚚', 'DELIVERED': '📦', 'CANCELLED': '❌', 'RETURNED': '↩️' };
    return map[status] || '📋';
  }

  getStatusBg(status: string): string {
    const map: any = { 'PENDING': 'rgba(251,191,36,0.15)', 'PROCESSING': 'rgba(96,165,250,0.15)', 'SHIPPED': 'rgba(168,85,247,0.15)', 'DELIVERED': 'rgba(74,222,128,0.15)', 'CANCELLED': 'rgba(248,113,113,0.15)', 'RETURNED': 'rgba(248,113,113,0.15)' };
    return map[status] || 'rgba(156,163,175,0.15)';
  }
}
