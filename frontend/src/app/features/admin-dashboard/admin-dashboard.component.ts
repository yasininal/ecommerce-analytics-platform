import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, AdminSummary } from '../dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-content">
      <!-- Welcome Header -->
      <div class="welcome-header">
        <div>
          <h1 class="welcome-title">Welcome back, Admin! 👋</h1>
          <p class="welcome-sub">Here's what's happening with your store today.</p>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid" *ngIf="summary">
        <div class="kpi-card" *ngFor="let kpi of kpis">
          <div class="kpi-top">
            <span class="kpi-icon" [style.background]="kpi.iconBg">{{ kpi.icon }}</span>
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
      <div class="card revenue-card" *ngIf="summary" style="margin-top: 24px;">
        <div class="section-header" style="margin-bottom: 16px;">
          <div>
            <h2 style="font-size:16px;font-weight:600;color:var(--text-primary)">Revenue Overview</h2>
            <p style="font-size:12px;color:var(--text-secondary);margin-top:3px">Last 7 days performance</p>
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
    .page-content { padding: 28px 32px; }

    .welcome-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 28px;
    }
    .welcome-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .welcome-sub {
      font-size: 14px;
      color: var(--text-secondary);
      margin-top: 4px;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
      margin-bottom: 8px;
    }
    .kpi-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px;
      transition: all var(--transition);
    }
    .kpi-card:hover {
      border-color: var(--border-strong);
      transform: translateY(-2px);
    }
    .kpi-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .kpi-icon {
      width: 40px; height: 40px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    .kpi-trend {
      font-size: 12px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 99px;
    }
    .kpi-trend.up { background: rgba(0,200,150,0.15); color: var(--success); }
    .kpi-trend.down { background: rgba(255,92,122,0.15); color: var(--danger); }
    .kpi-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
    }
    .kpi-label {
      font-size: 13px;
      color: var(--text-secondary);
    }

    /* Chart */
    .revenue-card { padding: 24px; }
    .chart-placeholder {
      height: 180px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .chart-bars {
      flex: 1;
      display: flex;
      align-items: flex-end;
      gap: 10px;
    }
    .bar {
      flex: 1;
      background: linear-gradient(to top, var(--accent), rgba(124,92,252,0.3));
      border-radius: 4px 4px 0 0;
      min-height: 10%;
      transition: height 0.5s ease;
    }
    .chart-labels {
      display: flex;
      justify-content: space-around;
      font-size: 11px;
      color: var(--text-muted);
    }
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
            iconBg: 'rgba(124,92,252,0.2)'
          },
          {
            icon: '🛒', label: 'Total Orders',
            value: data.totalOrders.toLocaleString(),
            trend: '8.2%', trendUp: true,
            iconBg: 'rgba(56,189,248,0.2)'
          },
          {
            icon: '👥', label: 'Customers',
            value: data.totalUsers.toLocaleString(),
            trend: '5.1%', trendUp: true,
            iconBg: 'rgba(255,181,71,0.2)'
          },
          {
            icon: '🏪', label: 'Active Stores',
            value: data.totalStores.toLocaleString(),
            trend: '2.3%', trendUp: false,
            iconBg: 'rgba(0,200,150,0.2)'
          }
        ];
      },
      error: (err) => console.error('Admin summary fetch error', err)
    });
  }
}
