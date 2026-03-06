import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, IndividualSummary } from '../dashboard.service';

@Component({
  selector: 'app-individual-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-content">
      <div class="welcome-header">
        <div>
          <h1 class="welcome-title" *ngIf="summary">Welcome back, {{ summary.name }}! 👋</h1>
          <h1 class="welcome-title" *ngIf="!summary">My Dashboard</h1>
          <p class="welcome-sub">Alışveriş geçmişiniz ve hesap bilgileriniz</p>
        </div>
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
        <h2 style="font-size:16px;font-weight:600;color:var(--text-primary);margin-bottom:16px">Recent Activity</h2>
        <div class="activity-list">
          <div class="activity-item" *ngFor="let item of recentActivity">
            <div class="activity-icon" [style.background]="item.bg">{{ item.icon }}</div>
            <div class="activity-info">
              <p class="activity-title">{{ item.title }}</p>
              <p class="activity-sub">{{ item.sub }}</p>
            </div>
            <span class="badge" [ngClass]="item.badgeClass">{{ item.status }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-content { padding: 28px 32px; }
    .welcome-header { margin-bottom: 28px; }
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
    .activity-list { display: flex; flex-direction: column; gap: 14px; }
    .activity-item { display: flex; align-items: center; gap: 14px; padding: 12px; background: var(--bg-elevated); border-radius: var(--radius-md); }
    .activity-icon { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
    .activity-info { flex: 1; }
    .activity-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .activity-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
  `]
})
export class IndividualDashboardComponent implements OnInit {
  summary: IndividualSummary | null = null;
  recentActivity = [
    { icon: '📦', title: 'Order Delivered', sub: 'Wireless Headphones — Dec 2, 2024', status: 'Delivered', badgeClass: 'badge-success', bg: 'rgba(0,200,150,0.15)' },
    { icon: '🚚', title: 'Order Shipped', sub: 'Running Sneakers Pro — Dec 1, 2024', status: 'In Transit', badgeClass: 'badge-info', bg: 'rgba(56,189,248,0.15)' },
    { icon: '🛒', title: 'New Order Placed', sub: 'Smart Watch Series X — Nov 30, 2024', status: 'Pending', badgeClass: 'badge-warning', bg: 'rgba(255,181,71,0.15)' },
  ];

  totalSpentFormatted = '';

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.dashboardService.getIndividualSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.totalSpentFormatted = '$' + data.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      },
      error: (err) => console.error('Individual summary fetch error', err)
    });
  }
}
