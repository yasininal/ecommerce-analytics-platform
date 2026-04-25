import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, AdminSummary } from '../dashboard.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-content">
      <!-- Welcome Header -->
      <div class="welcome-header">
        <div>
          <h1 class="welcome-title">Welcome back, Admin! 👋</h1>
          <p class="welcome-sub">Here's what's happening with your store today.</p>
        </div>
        <a routerLink="/admin/ai-assistant" class="ai-button">
           <span>🤖</span> Talk to Data AI
        </a>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid" *ngIf="summary">
        <div class="kpi-card" *ngFor="let kpi of kpis">
          <div class="kpi-top">
            <span class="kpi-icon" [ngClass]="kpi.iconClass">{{ kpi.icon }}</span>
            <span class="kpi-trend" [class.up]="kpi.trendUp" [class.down]="!kpi.trendUp">
              {{ kpi.trendUp ? '↑' : '↓' }} {{ kpi.trend }}
            </span>
          </div>
          <div class="kpi-value">{{ kpi.value }}</div>
          <div class="kpi-label">{{ kpi.label }}</div>
        </div>
      </div>

      <!-- Loading -->
      <div class="dp-loading" *ngIf="!summary">
        <div class="spinner"></div>
        <span>Loading dashboard data...</span>
      </div>

      <!-- Revenue Overview Chart placeholder -->
      <div class="card revenue-card" *ngIf="summary" style="margin-top: 32px;">
        <div class="section-header" style="margin-bottom: 24px;">
          <div>
            <h2 style="font-size:18px;font-weight:600;color:var(--text-primary)">Revenue Overview</h2>
            <p style="font-size:13px;color:var(--text-secondary);margin-top:4px">Last 7 days performance</p>
          </div>
        </div>
        <div class="chart-placeholder">
          <div class="chart-bars">
            <div class="bar" *ngFor="let h of chartBars" [style.height.%]="h"></div>
          </div>
          <div class="chart-labels">
            <span *ngFor="let d of chartDays">{{ d }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-content { padding: 40px; max-width: 1400px; margin: 0 auto; }

    .welcome-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 32px;
    }
    .welcome-title {
      font-size: 28px;
      font-weight: 400;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }
    .welcome-sub {
      font-size: 15px;
      color: var(--text-secondary);
      margin-top: 6px;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
      margin-bottom: 8px;
    }
    .kpi-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 24px;
      transition: all var(--transition);
      box-shadow: var(--shadow-card);
    }
    .kpi-card:hover {
      border-color: var(--border-strong);
      transform: translateY(-4px);
    }
    .kpi-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .kpi-icon {
      width: 48px; height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    .icon-accent { background: var(--accent-glow); color: var(--accent); }
    .icon-info { background: rgba(0, 86, 179, 0.1); color: var(--info); }
    .icon-warning { background: rgba(224, 168, 0, 0.1); color: var(--warning); }
    .icon-success { background: rgba(46, 133, 64, 0.1); color: var(--success); }

    .kpi-trend {
      font-size: 13px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 99px;
    }
    .kpi-trend.up { background: rgba(46, 133, 64, 0.1); color: var(--success); }
    .kpi-trend.down { background: rgba(193, 58, 58, 0.1); color: var(--danger); }
    .kpi-value {
      font-size: 32px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 6px;
      letter-spacing: -0.02em;
    }
    .kpi-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    /* Chart */
    .revenue-card { padding: 32px; border-radius: var(--radius-lg); }
    .chart-placeholder {
      height: 220px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .chart-bars {
      flex: 1;
      display: flex;
      align-items: flex-end;
      gap: 16px;
    }
    .bar {
      flex: 1;
      background: linear-gradient(to top, var(--accent), var(--accent-light));
      border-radius: 6px 6px 0 0;
      min-height: 10%;
      transition: height 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      opacity: 0.9;
    }
    .bar:hover {
        opacity: 1;
    }
    .chart-labels {
      display: flex;
      justify-content: space-around;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-muted);
    }
    .ai-button {
      display: flex; align-items: center; gap: 10px; background: linear-gradient(135deg, var(--accent), var(--accent-light));
      color: white; padding: 12px 24px; border-radius: 99px; text-decoration: none; font-weight: 700; font-size: 14px;
      box-shadow: 0 10px 20px rgba(241, 100, 30, 0.3); transition: 0.3s;
    }
    .ai-button:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(241, 100, 30, 0.4); }
  `]
})
export class AdminDashboardComponent implements OnInit {
  summary: AdminSummary | null = null;
  kpis: any[] = [];
  chartBars = [45, 62, 38, 78, 55, 90, 72];
  chartDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.dashboardService.getAdminSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.kpis = [
          {
            icon: '💰', label: 'Total Revenue',
            value: '$' + data.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            trend: '12.5%', trendUp: true,
            iconClass: 'icon-accent'
          },
          {
            icon: '🛒', label: 'Total Orders',
            value: data.totalOrders.toLocaleString(),
            trend: '8.2%', trendUp: true,
            iconClass: 'icon-info'
          },
          {
            icon: '👥', label: 'Customers',
            value: data.totalUsers.toLocaleString(),
            trend: '5.1%', trendUp: true,
            iconClass: 'icon-warning'
          },
          {
            icon: '🏪', label: 'Active Stores',
            value: data.totalStores.toLocaleString(),
            trend: '2.3%', trendUp: false,
            iconClass: 'icon-success'
          }
        ];
      },
      error: (err) => console.error('Admin summary fetch error', err)
    });
  }
}
